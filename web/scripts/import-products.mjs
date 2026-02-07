import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
};

const LOGIN_URL = 'https://www.crazyparts.com.au/customer/account/loginPost/';
const LIST_URL = 'https://www.crazyparts.com.au/accessory/tech-accessories.html?limit=36';
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/products');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function login() {
    try {
        console.log('--- login() start ---');
        const loginPageRes = await fetch('https://www.crazyparts.com.au/customer/account/login/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        console.log('Login page fetch status:', loginPageRes.status);
        const loginPageHtml = await loginPageRes.text();
        const formKeyMatch = loginPageHtml.match(/name="form_key"[^>]*value="([^"]+)"/) || loginPageHtml.match(/value="([^"]+)"[^>]*name="form_key"/);
        if (!formKeyMatch) {
            throw new Error('Could not find form_key');
        }
        const formKey = formKeyMatch[1];
        console.log('Found form_key.');

        let cookies = [];
        if (loginPageRes.headers.getSetCookie) {
            cookies = loginPageRes.headers.getSetCookie().map(c => c.split(';')[0]);
        } else {
            const setCookie = loginPageRes.headers.get('set-cookie');
            if (setCookie) cookies = [setCookie.split(';')[0]];
        }
        console.log('Initial cookies collected:', cookies.length);

        const params = new URLSearchParams();
        params.append('login[username]', 'aarsayem002@gmail.com');
        params.append('login[password]', 'JJstmg3xpt9@!');
        params.append('form_key', formKey);

        console.log('Submitting login request to:', LOGIN_URL);
        const res = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies.join('; '),
                'User-Agent': USER_AGENT
            },
            body: params,
            redirect: 'manual'
        });

        console.log('Login post status:', res.status);
        let loginCookies = [];
        if (res.headers.getSetCookie) {
            loginCookies = res.headers.getSetCookie().map(c => c.split(';')[0]);
        } else {
            const setCookie = res.headers.get('set-cookie');
            if (setCookie) loginCookies = [setCookie.split(';')[0]];
        }

        const finalCookies = [...new Set([...cookies, ...loginCookies])];
        if (!finalCookies.some(c => c.includes('frontend'))) {
            console.warn('Warning: frontend session cookie not found in response.');
        } else {
            console.log('Login successful (session found).');
        }
        console.log('--- login() end ---');
        return finalCookies.join('; ');
    } catch (err) {
        console.error('Error in login():', err.message);
        throw err;
    }
}

async function fetchWithCookies(url, cookies) {
    console.log(`Fetching with cookies: ${url}`);
    const res = await fetch(url, {
        headers: {
            'Cookie': cookies,
            'User-Agent': USER_AGENT
        }
    });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    return await res.text();
}

async function downloadImage(url, filename) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return null;
        const buffer = await res.arrayBuffer();
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(buffer));
        return `/uploads/products/${filename}`;
    } catch (error) {
        console.error(`  Image download error (${url}):`, error.message);
        return null;
    }
}

function slugify(text) {
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

async function run() {
    let connection;
    try {
        console.log('Starting run()...');
        connection = await mysql.createConnection(config);
        console.log('Connected to database.');

        const cookies = await login();
        console.log('Login phase completed.');

        console.log('Fetching main list page...');
        const listHtml = await fetchWithCookies(LIST_URL, cookies);

        const linkRegex = /<h2 class="product-name">\s*<a[^>]*href="([^"]+)"/gi;
        let links = [];
        let match;
        while ((match = linkRegex.exec(listHtml)) !== null) links.push(match[1]);
        links = [...new Set(links)];
        console.log(`Found ${links.length} products to process.`);

        const catNames = ['Accessory', 'Tech Accessories', 'Chargers'];
        let parentId = null;
        for (const name of catNames) {
            const slug = slugify(name);
            const [rows] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [slug]);
            if (rows.length > 0) {
                parentId = rows[0].id;
            } else {
                const [result] = await connection.execute('INSERT INTO categories (name, slug, parent_id, is_active) VALUES (?, ?, ?, 1)', [name, slug, parentId]);
                parentId = result.insertId;
                console.log(`Created category: ${name} (ID: ${parentId})`);
            }
        }

        for (const [index, link] of links.entries()) {
            try {
                process.stdout.write(`[${index + 1}/${links.length}] Processing: ${link} ... `);
                const html = await fetchWithCookies(link, cookies);
                const nameMatch = html.match(/<h1>([^<]+)<\/h1>/);
                if (!nameMatch) { console.log('SKIPPED (no H1)'); continue; }
                const name = nameMatch[1].trim();
                const slug = slugify(name);

                const [existing] = await connection.execute('SELECT id FROM products WHERE slug = ?', [slug]);
                if (existing.length > 0) { console.log('SKIPPED (exists)'); continue; }

                const priceMatch = html.match(/<span class="price">\$([0-9.,]+)<\/span>/);
                let rawPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
                let price = Math.max(0, rawPrice - 10);


                const descMatch = html.match(/<div class="std">([\s\S]*?)<\/div>/) || html.match(/<div id="description"[\s\S]*?>([\s\S]*?)<\/div>/);
                let description = descMatch ? descMatch[1].trim() : '';

                // Clean description
                if (description) {
                    // Remove scripts and styles
                    description = description.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
                    description = description.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
                    // Remove CDATA
                    description = description.replace(/\/\/<!\[CDATA\[[\s\S]*?\/\/\]\]>/gim, "");
                    // Remove specific garbage
                    description = description.replace(/To get better price,Learn more about[\s\S]*?VIP/gim, "");
                    description = description.replace(/Availability:\s*In stock/gim, "");
                    description = description.replace(/Register Business Partner account for better prices/gim, "");
                    description = description.replace(/Add to Cart/gim, "");
                    description = description.replace(/Having problem add to cart\?/gim, "");
                    // Collapse whitespace
                    description = description.replace(/\n\s*\n/g, "\n");
                }

                const skuMatch = html.match(/SKU: ([\w-]+)/);
                const sku = skuMatch ? skuMatch[1] : `CP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

                const [pResult] = await connection.execute(
                    `INSERT INTO products (name, slug, sku, description, short_description, price, compare_price, category_id, is_active, meta_title, meta_description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
                    [name, slug, sku, description, '', price.toFixed(2), rawPrice.toFixed(2), parentId, 1, name, description.substring(0, 160)]
                );
                const productId = pResult.insertId;

                const mainImgMatch = html.match(/src="(https:\/\/www\.crazyparts\.com\.au\/media\/catalog\/product\/cache\/1\/image\/400x400\/[^"]+\.jpg)"/);
                if (mainImgMatch) {
                    const localPath = await downloadImage(mainImgMatch[1], `${slug}-main.jpg`);
                    if (localPath) {
                        await connection.execute('INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES (?, ?, ?, 1, 0)', [productId, localPath, name]);
                    }
                }
                console.log('DONE');
            } catch (err) { console.log(`ERROR: ${err.message}`); }
        }
        console.log('\n--- All tasks completed successfully ---');
    } catch (error) {
        console.error('FATAL ERROR DURING RUN:', error.message);
        console.error(error.stack);
    } finally {
        if (connection) await connection.end();
    }
}

run().catch(err => {
    console.error('TOP LEVEL CRASH:', err.message);
    console.error(err.stack);
    process.exit(1);
});
