const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../index.html'); // Assuming script is in web/scripts
// Actually the index.html is in the root LKM folder, so it's ../../index.html relative to web/scripts
// Let's verify the CWD. The tool sets CWD for run_command, but write_to_file writes where I tell it.
// I'll write this script to C:\Users\ADMIN\OneDrive\Documents\PERSONAL\DEVELOPMENTS\LKM\web\scripts\extract-repairs.js
// So the html path is ../../index.html

const inputPath = path.resolve(__dirname, '../../index.html');
const outputPath = path.resolve(__dirname, '../src/data/repairs.json');

console.log(`Reading from: ${inputPath}`);

try {
    const htmlContent = fs.readFileSync(inputPath, 'utf8');

    // Regex to find variable repairs = [...]
    // It seems to be formatted as var repairs = [ ... ]; or similar.
    // Let's look for the specific pattern
    const regex = /var repairs = (\[[\s\S]*?\])/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
        let jsonStr = match[1];
        // The JSON might be loosely formatted (keys without quotes? No, the sample showed "brand": "Apple...").
        // Let's try to parse it to ensure validity
        try {
            const data = JSON.parse(jsonStr);
            console.log(`Successfully parsed ${data.length} repair items.`);

            // Ensure directory exists
            if (!fs.existsSync(path.dirname(outputPath))) {
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            }

            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
            console.log(`Written to ${outputPath}`);
        } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
            // Fallback: write the raw string if unique
            // console.log(jsonStr.substring(0, 100) + "...");
        }
    } else {
        console.error("Could not find 'var repairs = [...]' in HTML");
    }

} catch (err) {
    console.error("Error reading file:", err);
}
