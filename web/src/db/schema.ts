import { mysqlTable, serial, varchar, text, decimal, int, boolean, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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
    tags: varchar('tags', { length: 512 }),
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

// Product variants system
export const variantTypes = mysqlTable('variant_types', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const variantOptions = mysqlTable('variant_options', {
    id: int('id').autoincrement().primaryKey(),
    typeId: int('type_id').references(() => variantTypes.id).notNull(),
    value: varchar('value', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const productVariants = mysqlTable('product_variants', {
    id: int('id').autoincrement().primaryKey(),
    productId: int('product_id').references(() => products.id).notNull(),
    name: varchar('name', { length: 255 }), // e.g. "Color: Red, Size: XL"
    sku: varchar('sku', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }),
    comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
    stock: int('stock').default(0),
    imageUrl: varchar('image_url', { length: 255 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const productVariantOptions = mysqlTable('product_variant_options', {
    id: int('id').autoincrement().primaryKey(),
    variantId: int('variant_id').references(() => productVariants.id).notNull(),
    optionId: int('option_id').references(() => variantOptions.id).notNull(),
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
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
    totalRefunded: decimal('total_refunded', { precision: 10, scale: 2 }).default('0'),
    refundStatus: varchar('refund_status', { length: 50 }).default('none'), // none, partial, full
    trackingNumber: varchar('tracking_number', { length: 100 }),
    shippingProvider: varchar('shipping_provider', { length: 50 }),
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
    refundedQuantity: int('refunded_quantity').default(0),
});

export const orderRefunds = mysqlTable('order_refunds', {
    id: int('id').autoincrement().primaryKey(),
    orderId: int('order_id').references(() => orders.id).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    reason: text('reason'),
    refundedItems: text('refunded_items'), // JSON storing { productId, quantity }
    isShippingRefunded: boolean('is_shipping_refunded').default(false),
    stripeRefundId: varchar('stripe_refund_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
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

export const globalTags = mysqlTable('global_tags', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
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

export const brands = mysqlTable('brands', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    logo: varchar('logo', { length: 512 }), // Increased length for longer URLs
    isPopular: boolean('is_popular').default(false),
    isActive: boolean('is_active').default(true),
    sortOrder: int('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Shipping providers with API credentials
export const shippingProviders = mysqlTable('shipping_providers', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(), // e.g., 'aus_post', 'sendle'
    apiKey: varchar('api_key', { length: 512 }),
    apiSecret: varchar('api_secret', { length: 512 }),
    accountNumber: varchar('account_number', { length: 100 }),
    testMode: boolean('test_mode').default(true),
    isActive: boolean('is_active').default(false),
    settings: text('settings'), // JSON for provider-specific settings
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Shipping zones and rates (for manual/flat rate shipping)
export const shippingZones = mysqlTable('shipping_zones', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    postcodes: text('postcodes'), // Comma-separated or JSON array
    flatRate: decimal('flat_rate', { precision: 10, scale: 2 }),
    freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }),
    weightRate: decimal('weight_rate', { precision: 10, scale: 2 }), // Per kg
    isActive: boolean('is_active').default(true),
    sortOrder: int('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Customers table for tracking customer journey
export const customers = mysqlTable('customers', {
    id: int('id').autoincrement().primaryKey(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    postcode: varchar('postcode', { length: 20 }),
    state: varchar('state', { length: 50 }),
    country: varchar('country', { length: 50 }).default('Australia'),
    totalOrders: int('total_orders').default(0),
    totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
    lastOrderDate: timestamp('last_order_date'),
    notes: text('notes'),
    tags: varchar('tags', { length: 255 }), // Comma-separated tags like "VIP", "Wholesale"
    source: varchar('source', { length: 50 }), // How they found us: website, referral, etc.
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relational Definitions
export const productsRelations = relations(products, ({ many, one }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    images: many(productImages),
    specs: many(productSpecs),
    variants: many(productVariants),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: "category_parent",
    }),
    children: many(categories, {
        relationName: "category_parent",
    }),
    products: many(products),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
    product: one(products, {
        fields: [productSpecs.productId],
        references: [products.id],
    }),
}));

export const variantTypesRelations = relations(variantTypes, ({ many }) => ({
    options: many(variantOptions),
}));

export const variantOptionsRelations = relations(variantOptions, ({ one, many }) => ({
    type: one(variantTypes, {
        fields: [variantOptions.typeId],
        references: [variantTypes.id],
    }),
    productVariants: many(productVariantOptions),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
    }),
    options: many(productVariantOptions),
}));

export const productVariantOptionsRelations = relations(productVariantOptions, ({ one }) => ({
    variant: one(productVariants, {
        fields: [productVariantOptions.variantId],
        references: [productVariants.id],
    }),
    option: one(variantOptions, {
        fields: [productVariantOptions.optionId],
        references: [variantOptions.id],
    }),
}));

// Blog System
export const blogCategories = mysqlTable('blog_categories', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const blogPosts = mysqlTable('blog_posts', {
    id: int('id').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content'), // JSON or HTML
    featuredImageUrl: varchar('featured_image_url', { length: 512 }),
    authorId: int('author_id').references(() => admins.id),
    categoryId: int('category_id').references(() => blogCategories.id),
    status: varchar('status', { length: 50 }).default('draft'), // draft, published
    viewCount: int('view_count').default(0),

    // SEO Fields
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    canonicalUrl: varchar('canonical_url', { length: 512 }),
    focusKeyword: varchar('focus_keyword', { length: 100 }),
    secondaryKeywords: text('secondary_keywords'), // JSON array string
    ogTitle: varchar('og_title', { length: 255 }),
    ogDescription: text('og_description'),
    ogImageUrl: varchar('og_image_url', { length: 512 }),

    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    deletedAt: timestamp('deleted_at'), // Soft delete
});

export const blogTags = mysqlTable('blog_tags', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const blogPostTags = mysqlTable('blog_post_tags', {
    id: int('id').autoincrement().primaryKey(),
    postId: int('post_id').references(() => blogPosts.id).notNull(),
    tagId: int('tag_id').references(() => blogTags.id).notNull(),
});

// Blog Relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
    author: one(admins, {
        fields: [blogPosts.authorId],
        references: [admins.id],
    }),
    category: one(blogCategories, {
        fields: [blogPosts.categoryId],
        references: [blogCategories.id],
    }),
    tags: many(blogPostTags),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
    posts: many(blogPosts),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
    posts: many(blogPostTags),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
    post: one(blogPosts, {
        fields: [blogPostTags.postId],
        references: [blogPosts.id],
    }),
    tag: one(blogTags, {
        fields: [blogPostTags.tagId],
        references: [blogTags.id],
    }),
}));
