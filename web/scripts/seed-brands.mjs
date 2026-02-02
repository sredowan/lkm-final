import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const brandData = [
    { name: "Samsung", slug: "samsung", isPopular: true, sortOrder: 1, logo: "https://www.vectorlogo.zone/logos/samsung/samsung-ar21.svg" },
    { name: "Apple", slug: "apple", isPopular: true, sortOrder: 2, logo: "https://www.vectorlogo.zone/logos/apple/apple-ar21.svg" },
    { name: "Google", slug: "google", isPopular: true, sortOrder: 3, logo: "https://www.vectorlogo.zone/logos/google/google-ar21.svg" },
    { name: "Oppo", slug: "oppo", isPopular: true, sortOrder: 4, logo: "/uploads/brands/1768909856001-jdjunb27bir.png" },
    { name: "OnePlus", slug: "oneplus", isPopular: true, sortOrder: 5, logo: "/uploads/brands/1768910357880-ufweb68m6o.png" },
    { name: "Sony", slug: "sony", isPopular: true, sortOrder: 6, logo: "https://static.cdnlogo.com/logos/s/96/sony.svg" },
    { name: "Bose", slug: "bose", isPopular: true, sortOrder: 7, logo: "https://static.cdnlogo.com/logos/b/13/bose.svg" },
    { name: "JBL", slug: "jbl", isPopular: true, sortOrder: 8, logo: "/uploads/brands/1768910624014-r4fqaootdq.png" },
    { name: "Vivo", slug: "vivo", isPopular: false, sortOrder: 9, logo: "/uploads/brands/1768910490264-s9bmbfctaob.png" },
    { name: "Xiaomi", slug: "xiaomi", isPopular: false, sortOrder: 10, logo: "/uploads/brands/1768910760794-y2qgpbv9rt.png" },
    { name: "Motorola", slug: "motorola", isPopular: false, sortOrder: 11, logo: "https://static.cdnlogo.com/logos/m/8/motorola.svg" },
    { name: "Anker", slug: "anker", isPopular: false, sortOrder: 12, logo: "/uploads/brands/1768910699076-y4d3oiabf6.png" },
    { name: "Belkin", slug: "belkin", isPopular: false, sortOrder: 13, logo: "https://static.cdnlogo.com/logos/b/79/belkin.svg" },
    { name: "ZAGG", slug: "zagg", isPopular: false, sortOrder: 14, logo: "/uploads/brands/1768910961410-sylpyo6m0ho.png" },
    { name: "OtterBox", slug: "otterbox", isPopular: false, sortOrder: 15, logo: "https://static.cdnlogo.com/logos/o/44/otterbox.svg" },
    { name: "UAG", slug: "uag", isPopular: false, sortOrder: 16, logo: "/uploads/brands/1768911064328-ju2iprwz9dr.png" },
    { name: "Spigen", slug: "spigen", isPopular: false, sortOrder: 17, logo: "https://static.cdnlogo.com/logos/s/60/spigen.svg" },
    { name: "Mophie", slug: "mophie", isPopular: false, sortOrder: 18, logo: "https://static.cdnlogo.com/logos/m/26/mophie.svg" },
    { name: "Alogic", slug: "alogic", isPopular: false, sortOrder: 19, logo: "https://cdn.shopify.com/s/files/1/0246/5818/2224/files/Alogic_Logo_Main.png" },
    { name: "Baseus", slug: "baseus", isPopular: false, sortOrder: 20, logo: "https://static.cdnlogo.com/logos/b/77/baseus.svg" },
    { name: "Cygnett", slug: "cygnett", isPopular: false, sortOrder: 21, logo: "https://www.cygnett.com/cdn/shop/files/Cygnett_Logo_Black.svg" },
    { name: "EFM", slug: "efm", isPopular: false, sortOrder: 22, logo: "https://placehold.co/400x200?text=EFM" },
    { name: "Tech21", slug: "tech21", isPopular: false, sortOrder: 23, logo: "https://www.tech21.com/cdn/shop/files/tech21_Logo_Black.svg" },
    { name: "Lifeproof", slug: "lifeproof", isPopular: false, sortOrder: 24, logo: "https://static.cdnlogo.com/logos/l/54/lifeproof.svg" },
    { name: "Incipio", slug: "incipio", isPopular: false, sortOrder: 25, logo: "https://incipio.com/cdn/shop/files/incipio_logo_black.svg" },
    { name: "Speck", slug: "speck", isPopular: false, sortOrder: 26, logo: "https://static.cdnlogo.com/logos/s/43/speck.svg" },
    { name: "Catalyst", slug: "catalyst", isPopular: false, sortOrder: 27, logo: "https://cdn.shopify.com/s/files/1/0212/5752/files/catalyst-logo-black.svg" },
    { name: "Skullcandy", slug: "skullcandy", isPopular: false, sortOrder: 28, logo: "https://static.cdnlogo.com/logos/s/17/skullcandy.svg" },
    { name: "Case-Mate", slug: "case-mate", isPopular: false, sortOrder: 29, logo: "https://case-mate.com/cdn/shop/files/Case-Mate_Logo_Black.svg" }
];

async function seedBrands() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'lakemba_mobile_king',
    });

    try {
        console.log('Connected to database.');

        for (const brand of brandData) {
            const [rows] = await connection.execute(
                'INSERT INTO brands (name, slug, logo, is_popular, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE logo = VALUES(logo), is_popular = VALUES(is_popular), is_active = VALUES(is_active), sort_order = VALUES(sort_order)',
                [brand.name, brand.slug, brand.logo, brand.isPopular, true, brand.sortOrder]
            );
            console.log(`Seeded brand: ${brand.name}`);
        }

        console.log('All brands seeded successfully.');
    } catch (error) {
        console.error('Error seeding brands:', error);
    } finally {
        await connection.end();
    }
}

seedBrands();
