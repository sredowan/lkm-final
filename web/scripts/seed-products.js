/**
 * Seed script to add 20 demo products
 * Run with: node scripts/seed-products.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const demoProducts = [
    // iPhones (6 products)
    {
        name: 'iPhone 15 Pro Max',
        slug: 'iphone-15-pro-max',
        sku: 'IPH15PM-001',
        description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
        shortDescription: 'A17 Pro chip, 256GB, Titanium Design',
        price: '1199.00',
        comparePrice: '1299.00',
        brand: 'Apple',
        condition: 'new',
        stock: 25,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'
    },
    {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        sku: 'IPH15P-001',
        description: 'Pro-level performance with A17 Pro chip and titanium design.',
        shortDescription: 'A17 Pro chip, 128GB, Natural Titanium',
        price: '999.00',
        comparePrice: '1099.00',
        brand: 'Apple',
        condition: 'new',
        stock: 30,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600'
    },
    {
        name: 'iPhone 14',
        slug: 'iphone-14',
        sku: 'IPH14-001',
        description: 'Powerful A15 Bionic chip with great camera and all-day battery life.',
        shortDescription: 'A15 Bionic, 128GB, Blue',
        price: '699.00',
        comparePrice: '799.00',
        brand: 'Apple',
        condition: 'new',
        stock: 40,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600'
    },
    {
        name: 'iPhone 13 Pro (Refurbished)',
        slug: 'iphone-13-pro-refurbished',
        sku: 'IPH13P-REF-001',
        description: 'Certified refurbished with 90-day warranty. Like-new condition.',
        shortDescription: 'A15 Bionic, 256GB, Graphite',
        price: '649.00',
        comparePrice: '899.00',
        brand: 'Apple',
        condition: 'refurbished',
        stock: 15,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1632661674596-df8be59a8537?w=600'
    },
    {
        name: 'iPhone 12 (Pre-Owned)',
        slug: 'iphone-12-preowned',
        sku: 'IPH12-USED-001',
        description: 'Pre-owned in excellent condition with 30-day warranty.',
        shortDescription: 'A14 Bionic, 64GB, Black',
        price: '399.00',
        comparePrice: '599.00',
        brand: 'Apple',
        condition: 'used',
        stock: 10,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600'
    },
    {
        name: 'iPhone SE (3rd Gen)',
        slug: 'iphone-se-3rd-gen',
        sku: 'IPHSE3-001',
        description: 'Compact powerhouse with A15 Bionic chip at an affordable price.',
        shortDescription: 'A15 Bionic, 64GB, Starlight',
        price: '429.00',
        comparePrice: '479.00',
        brand: 'Apple',
        condition: 'new',
        stock: 35,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'
    },

    // Samsung Phones (6 products)
    {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-galaxy-s24-ultra',
        sku: 'SGS24U-001',
        description: 'Ultimate flagship with S Pen, 200MP camera, and Galaxy AI.',
        shortDescription: 'Snapdragon 8 Gen 3, 256GB, Titanium Gray',
        price: '1299.00',
        comparePrice: '1399.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 20,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'
    },
    {
        name: 'Samsung Galaxy S24+',
        slug: 'samsung-galaxy-s24-plus',
        sku: 'SGS24P-001',
        description: 'Premium Galaxy experience with large display and powerful performance.',
        shortDescription: 'Snapdragon 8 Gen 3, 256GB, Onyx Black',
        price: '999.00',
        comparePrice: '1099.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 25,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600'
    },
    {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        sku: 'SGS24-001',
        description: 'Compact flagship with Galaxy AI and premium features.',
        shortDescription: 'Snapdragon 8 Gen 3, 128GB, Violet',
        price: '799.00',
        comparePrice: '899.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 30,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600'
    },
    {
        name: 'Samsung Galaxy Z Fold5',
        slug: 'samsung-galaxy-z-fold5',
        sku: 'SGZF5-001',
        description: 'Revolutionary foldable phone with tablet-sized display.',
        shortDescription: 'Snapdragon 8 Gen 2, 256GB, Phantom Black',
        price: '1799.00',
        comparePrice: '1999.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 12,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=600'
    },
    {
        name: 'Samsung Galaxy A54 5G',
        slug: 'samsung-galaxy-a54-5g',
        sku: 'SGA54-001',
        description: 'Mid-range champion with flagship features at affordable price.',
        shortDescription: 'Exynos 1380, 128GB, Awesome Violet',
        price: '449.00',
        comparePrice: '499.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 50,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'
    },
    {
        name: 'Samsung Galaxy S23 (Refurbished)',
        slug: 'samsung-galaxy-s23-refurbished',
        sku: 'SGS23-REF-001',
        description: 'Certified refurbished flagship with 90-day warranty.',
        shortDescription: 'Snapdragon 8 Gen 2, 128GB, Green',
        price: '549.00',
        comparePrice: '799.00',
        brand: 'Samsung',
        condition: 'refurbished',
        stock: 18,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600'
    },

    // Headphones (4 products)
    {
        name: 'Apple AirPods Pro (2nd Gen)',
        slug: 'apple-airpods-pro-2nd-gen',
        sku: 'APP2-001',
        description: 'Active noise cancellation, adaptive transparency, and personalized spatial audio.',
        shortDescription: 'ANC, USB-C, MagSafe Case',
        price: '249.00',
        comparePrice: '279.00',
        brand: 'Apple',
        condition: 'new',
        stock: 60,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600'
    },
    {
        name: 'Samsung Galaxy Buds2 Pro',
        slug: 'samsung-galaxy-buds2-pro',
        sku: 'SGB2P-001',
        description: 'Premium earbuds with intelligent ANC and 360 Audio.',
        shortDescription: 'ANC, 360 Audio, IPX7',
        price: '199.00',
        comparePrice: '229.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 45,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'
    },
    {
        name: 'Sony WH-1000XM5',
        slug: 'sony-wh-1000xm5',
        sku: 'SONYWH5-001',
        description: 'Industry-leading noise cancellation with exceptional sound quality.',
        shortDescription: 'Best-in-class ANC, 30hr Battery',
        price: '349.00',
        comparePrice: '399.00',
        brand: 'Sony',
        condition: 'new',
        stock: 25,
        isActive: true,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600'
    },
    {
        name: 'Apple AirPods Max',
        slug: 'apple-airpods-max',
        sku: 'APMAX-001',
        description: 'High-fidelity audio with computational audio and ANC.',
        shortDescription: 'Over-ear, ANC, Spatial Audio',
        price: '499.00',
        comparePrice: '549.00',
        brand: 'Apple',
        condition: 'new',
        stock: 15,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=600'
    },

    // Accessories (4 products)
    {
        name: 'Apple MagSafe Charger',
        slug: 'apple-magsafe-charger',
        sku: 'APMAG-001',
        description: 'Fast wireless charging for iPhone 12 and later with perfect alignment.',
        shortDescription: '15W Fast Charging, Magnetic',
        price: '39.00',
        comparePrice: '49.00',
        brand: 'Apple',
        condition: 'new',
        stock: 100,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1622552245277-16c0e98a449b?w=600'
    },
    {
        name: 'Samsung 45W Super Fast Charger',
        slug: 'samsung-45w-super-fast-charger',
        sku: 'SG45W-001',
        description: 'Ultra-fast charging for compatible Samsung devices.',
        shortDescription: '45W PD, USB-C, Compact Design',
        price: '49.00',
        comparePrice: '59.00',
        brand: 'Samsung',
        condition: 'new',
        stock: 80,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'
    },
    {
        name: 'Spigen Ultra Hybrid Case (iPhone 15)',
        slug: 'spigen-ultra-hybrid-case-iphone-15',
        sku: 'SPGUH15-001',
        description: 'Crystal clear protection with military-grade drop protection.',
        shortDescription: 'Clear, Anti-Yellowing, MIL-STD',
        price: '19.99',
        comparePrice: '29.99',
        brand: 'Spigen',
        condition: 'new',
        stock: 150,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600'
    },
    {
        name: 'Anker PowerCore 20000mAh',
        slug: 'anker-powercore-20000mah',
        sku: 'ANKPC20-001',
        description: 'High-capacity portable charger with fast charging support.',
        shortDescription: '20000mAh, 22.5W, USB-C + USB-A',
        price: '49.99',
        comparePrice: '69.99',
        brand: 'Anker',
        condition: 'new',
        stock: 70,
        isActive: true,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600'
    }
];

async function seedProducts() {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    });

    console.log('Connected to database');
    console.log('Seeding 20 demo products...\n');

    try {
        for (const product of demoProducts) {
            // Check if product already exists
            const [existing] = await connection.execute(
                'SELECT id FROM products WHERE slug = ?',
                [product.slug]
            );

            if (existing.length > 0) {
                console.log(`⏭️  Skipping "${product.name}" (already exists)`);
                continue;
            }

            // Insert product
            const [result] = await connection.execute(
                `INSERT INTO products 
                (name, slug, sku, description, short_description, price, compare_price, brand, \`condition\`, stock, is_active, is_featured) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    product.name,
                    product.slug,
                    product.sku,
                    product.description,
                    product.shortDescription,
                    product.price,
                    product.comparePrice,
                    product.brand,
                    product.condition,
                    product.stock,
                    product.isActive ? 1 : 0,
                    product.isFeatured ? 1 : 0
                ]
            );

            const productId = result.insertId;

            // Insert primary image
            await connection.execute(
                `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) 
                VALUES (?, ?, ?, 1, 0)`,
                [productId, product.image, product.name]
            );

            console.log(`✅ Added "${product.name}"`);
        }

        console.log('\n🎉 Demo products seeded successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
    } finally {
        await connection.end();
    }
}

seedProducts();
