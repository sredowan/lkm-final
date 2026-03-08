const fs = require('fs');
const path = require('path');

console.log('Preparing deployment...');

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticDir = path.join(rootDir, '.next', 'static');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(standaloneDir)) {
    console.error('\n❌ Error: .next/standalone directory not found. Did the build fail?');
    process.exit(1);
}

// 1. Copy .next/static to .next/standalone/.next/static
const standaloneNextDir = path.join(standaloneDir, '.next');
const standaloneStaticDir = path.join(standaloneNextDir, 'static');

if (!fs.existsSync(standaloneNextDir)) {
    fs.mkdirSync(standaloneNextDir, { recursive: true });
}

console.log('Copying static assets...');
fs.cpSync(staticDir, standaloneStaticDir, { recursive: true });

// 2. Copy public to .next/standalone/public (excluding uploads)
const standalonePublicDir = path.join(standaloneDir, 'public');
if (!fs.existsSync(standalonePublicDir)) {
    fs.mkdirSync(standalonePublicDir, { recursive: true });
}

console.log('Copying public assets (excluding uploads)...');
fs.cpSync(publicDir, standalonePublicDir, {
    recursive: true,
    filter: (src) => {
        // Exclude the 'uploads' directory
        const isUploads = src === path.join(publicDir, 'uploads') || src.startsWith(path.join(publicDir, 'uploads') + path.sep);
        if (isUploads) {
            return false;
        }
        return true;
    }
});

// Create a .gitkeep in standalone/public/uploads to ensure the folder exists but is empty
const standaloneUploadsDir = path.join(standalonePublicDir, 'uploads');
if (!fs.existsSync(standaloneUploadsDir)) {
    fs.mkdirSync(standaloneUploadsDir, { recursive: true });
}
fs.writeFileSync(path.join(standaloneUploadsDir, '.gitkeep'), '');

// 3. Create zip of .next/standalone using archiver
console.log('Zipping ready for Hostinger...');

try {
    const archiver = require('archiver');
    const output = fs.createWriteStream(path.join(rootDir, 'lkm-production.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', function () {
        console.log(`\n✅ Production zip created successfully: lkm-production.zip (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
        console.log('\n--- HOSTINGER DEPLOYMENT INSTRUCTIONS ---');
        console.log('1. Upload lkm-production.zip to your Hostinger file manager.');
        console.log("2. Extract the zip file in your website's root directory.");
        console.log("3. Ensure your Node.js application is configured to run server.js");
        console.log('4. Your previously uploaded photos in public/uploads will NOT be overwritten (since we excluded them).');
        console.log('-----------------------------------------\n');
    });

    archive.on('error', function (err) {
        throw err;
    });

    archive.pipe(output);
    archive.directory(standaloneDir, false);
    archive.finalize();

} catch (e) {
    console.error('\n❌ Error: archiver module not found. Please install it first: npm i -D archiver');
    process.exit(1);
}
