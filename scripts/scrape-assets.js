const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sourceDir = path.join(__dirname, '../..'); // Root LKM dir
const webPublicDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(webPublicDir)) {
    fs.mkdirSync(webPublicDir, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const protocol = url.startsWith('https') ? https : http;

        // Simple handling for relative URLs? Assume absolute for now based on snippet
        if (!url.startsWith('http')) {
            // Skip relative or data URIs
            resolve('Skipped ' + url);
            return;
        }

        protocol.get(url, response => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => resolve(dest));
                });
            } else {
                file.close();
                fs.unlink(dest, () => { }); // Delete partial file
                resolve(`Failed to download ${url}: ${response.statusCode}`);
            }
        }).on('error', err => {
            fs.unlink(dest, () => { });
            resolve(`Error downloading ${url}: ${err.message}`);
        });
    });
}

function processHtmlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const downloadPromises = [];

    while ((match = imgRegex.exec(content)) !== null) {
        const src = match[1];
        if (src && src.startsWith('http')) {
            // Generate filename from URL
            const filename = path.basename(src.split('?')[0]); // Remove query string
            const dest = path.join(webPublicDir, filename);
            if (!fs.existsSync(dest)) {
                console.log(`Downloading ${src}...`);
                downloadPromises.push(downloadImage(src, dest));
            }
        }
    }
    return Promise.all(downloadPromises);
}

async function main() {
    // List all HTML files in root and subdirs
    const files = [
        'index.html',
        'Online-store.html',
        'Repair.html',
        'services.html',
        // Add all subfiles if needed, or walk dir
    ];

    // Basic walk function
    function walk(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory() && file !== 'web' && file !== '.git') {
                walk(filePath, fileList);
            } else {
                if (file.endsWith('.html')) {
                    fileList.push(filePath);
                }
            }
        });
        return fileList;
    }

    const allHtmlFiles = walk(sourceDir);
    console.log(`Found ${allHtmlFiles.length} HTML files.`);

    for (const file of allHtmlFiles) {
        console.log(`Processing ${file}...`);
        await processHtmlFile(file);
    }
    console.log('Done!');
}

main();
