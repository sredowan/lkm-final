
import fs from 'fs';
const url = 'https://www.crazyparts.com.au/4-ports-usb-ac-wall-charger-adapter-for-iphone-galaxy-5-4amp-42052.html';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function run() {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const html = await res.text();

    // Dump 2000 chars around "class=\"std\""
    const idx = html.indexOf('class="std"');
    if (idx !== -1) {
        console.log("Found class=\"std\". Context:");
        console.log(html.substring(idx - 100, idx + 4000));
    } else {
        console.log("class=\"std\" NOT FOUND");
        // Try id="description"
        const idx2 = html.indexOf('id="description"');
        console.log(idx2 !== -1 ? "Found id=\"description\"." : "id=\"description\" NOT FOUND");
        if (idx2 !== -1) console.log(html.substring(idx2 - 100, idx2 + 4000));
    }
}
run();
