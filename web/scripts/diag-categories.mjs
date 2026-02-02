const url = 'https://www.crazyparts.com.au/accessory/tech-accessories.html';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function diag() {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        const body = await res.text();
        console.log('Body length:', body.length);

        // Find subcategories in a common Magento sidebar/category menu
        const subCatRegex = /<a href="([^"]+)"><span>([^<]+)<\/span><\/a>/g;
        let match;
        console.log('Potential Subcategories:');
        while ((match = subCatRegex.exec(body)) !== null) {
            if (match[1].includes('tech-accessories/')) {
                console.log(`- ${match[2]}: ${match[1]}`);
            }
        }

        // Check total product count on this page
        const productLinkRegex = /<h2 class="product-name">\s*<a[^>]*href="([^"]+)"/gi;
        let count = 0;
        while (productLinkRegex.exec(body)) count++;
        console.log('Products on this page:', count);

    } catch (err) {
        console.error('DIAG FAILED:', err);
    }
}

diag();
