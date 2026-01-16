import { mysqlTable, serial, varchar, text, decimal, int, boolean, timestamp } from "drizzle-orm/mysql-core";

export const categories = mysqlTable('categories', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    image: varchar('image', { length: 255 }),
    parentId: int('parent_id'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const products = mysqlTable('products', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    sku: varchar('sku', { length: 100 }).unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    categoryId: int('category_id').references(() => categories.id),
    brand: varchar('brand', { length: 100 }),
    condition: varchar('condition', { length: 50 }), // new, refurbished, used
    stock: int('stock').default(0),
    isActive: boolean('is_active').default(true),
    isFeatured: boolean('is_featured').default(false),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const productImages = mysqlTable('product_images', {
    id: int('id').autoincrement().primaryKey(),
    productId: int('product_id').references(() => products.id).notNull(),
    imageUrl: varchar('image_url', { length: 255 }).notNull(),
    altText: varchar('alt_text', { length: 255 }),
    sortOrder: int('sort_order').default(0),
    isPrimary: boolean('is_primary').default(false),
});

export const productSpecs = mysqlTable('product_specs', {
    id: int('id').autoincrement().primaryKey(),
    productId: int('product_id').references(() => products.id).notNull(),
    specName: varchar('spec_name', { length: 100 }).notNull(),
    specValue: varchar('spec_value', { length: 255 }).notNull(),
    sortOrder: int('sort_order').default(0),
});

// Product variants for mobile shop (Color + Storage combinations)
export const productVariants = mysqlTable('product_variants', {
    id: int('id').autoincrement().primaryKey(),
    productId: int('product_id').references(() => products.id).notNull(),
    color: varchar('color', { length: 50 }),
    storage: varchar('storage', { length: 50 }),
    sku: varchar('sku', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
    stock: int('stock').default(0),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const orders = mysqlTable('orders', {
    id: int('id').autoincrement().primaryKey(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerName: varchar('customer_name', { length: 100 }).notNull(),
    customerEmail: varchar('customer_email', { length: 100 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
    shippingAddress: text('shipping_address'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
    shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0'),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // pending, processing, shipped, delivered, cancelled
    paymentStatus: varchar('payment_status', { length: 50 }).default('unpaid'),
    paymentMethod: varchar('payment_method', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const orderItems = mysqlTable('order_items', {
    id: int('id').autoincrement().primaryKey(),
    orderId: int('order_id').references(() => orders.id).notNull(),
    productId: int('product_id').references(() => products.id).notNull(),
    productName: varchar('product_name', { length: 255 }).notNull(),
    quantity: int('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

export const pages = mysqlTable('pages', {
    id: int('id').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: text('content'),
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const settings = mysqlTable('settings', {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: text('value'),
    type: varchar('type', { length: 50 }), // string, number, boolean, json
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const admins = mysqlTable('admins', {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }),
    role: varchar('role', { length: 50 }).default('admin'), // admin, superadmin
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relationships aren't strictly defined in the schema object for drizzle-kit push but good to have if we use relational query builder.
// For now adhering to the provided schema structure which is standard mysqlTable definitions.

export const bookings = mysqlTable('bookings', {
    id: int('id').autoincrement().primaryKey(),
    brand: varchar('brand', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    issue: varchar('issue', { length: 255 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }),
    bookingDate: varchar('booking_date', { length: 50 }).notNull(),
    bookingTime: varchar('booking_time', { length: 50 }).notNull(),
    customerName: varchar('customer_name', { length: 100 }).notNull(),
    customerEmail: varchar('customer_email', { length: 100 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 20 }).notNull(),
    notes: text('notes'),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
});
