import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table (synced from Clerk via webhooks)
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey(), // Clerk user ID
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    imageUrl: text("image_url"),
    role: varchar("role", { length: 20 }).default("user").notNull(), // 'user' | 'admin'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

// User preferences
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    theme: varchar("theme", { length: 10 }).default("system"), // 'light' | 'dark' | 'system'
    emailNotifications: boolean("email_notifications").default(true),
    priceAlerts: boolean("price_alerts").default(false),
    preferredStores: jsonb("preferred_stores").$type<string[]>().default([]),
    preferredCategories: jsonb("preferred_categories")
      .$type<string[]>()
      .default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("user_preferences_user_id_idx").on(table.userId),
  })
);

// Stores
export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    affiliateProgram: varchar("affiliate_program", { length: 100 }), // 'amazon', 'walmart', etc.
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("stores_slug_idx").on(table.slug),
  })
);

// Categories
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const categories: any = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentId: integer("parent_id").references((): any => categories.id, {
      onDelete: "set null",
    }), // For subcategories
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
  })
);

// Deals
export const deals = pgTable(
  "deals",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    storeId: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    // Pricing
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
    savingsAmount: decimal("savings_amount", { precision: 10, scale: 2 }),
    savingsPercent: decimal("savings_percent", { precision: 5, scale: 2 }),

    // Links
    productUrl: text("product_url").notNull(),
    affiliateUrl: text("affiliate_url").notNull(), // Generated affiliate link

    // Metadata
    externalId: varchar("external_id", { length: 255 }), // ID from affiliate API
    sku: varchar("sku", { length: 255 }),
    brand: varchar("brand", { length: 255 }),

    // Status
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    expiresAt: timestamp("expires_at"),

    // Source tracking
    source: varchar("source", { length: 50 }).default("manual").notNull(), // 'api' | 'manual' | 'scraper'
    createdBy: varchar("created_by", { length: 255 }).references(
      () => users.id,
      { onDelete: "set null" }
    ), // For manual entries

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    storeIdIdx: index("deals_store_id_idx").on(table.storeId),
    categoryIdIdx: index("deals_category_id_idx").on(table.categoryId),
    createdAtIdx: index("deals_created_at_idx").on(table.createdAt),
    isActiveIdx: index("deals_is_active_idx").on(table.isActive),
    externalIdIdx: index("deals_external_id_idx").on(table.externalId),
  })
);

// Saved deals (user's favorites)
export const savedDeals = pgTable(
  "saved_deals",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dealId: integer("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdDealIdIdx: uniqueIndex("saved_deals_user_deal_idx").on(
      table.userId,
      table.dealId
    ),
    userIdIdx: index("saved_deals_user_id_idx").on(table.userId),
    dealIdIdx: index("saved_deals_deal_id_idx").on(table.dealId),
  })
);

// YouTube videos cache
export const youtubeVideos = pgTable(
  "youtube_videos",
  {
    id: serial("id").primaryKey(),
    dealId: integer("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    videoId: varchar("video_id", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    channelTitle: varchar("channel_title", { length: 255 }),
    publishedAt: timestamp("published_at"),
    viewCount: integer("view_count"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    dealIdIdx: index("youtube_videos_deal_id_idx").on(table.dealId),
    dealIdVideoIdIdx: uniqueIndex("youtube_videos_deal_video_idx").on(
      table.dealId,
      table.videoId
    ),
  })
);

// Scraper logs (for monitoring)
export const scraperLogs = pgTable(
  "scraper_logs",
  {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 50 }).notNull(), // 'amazon', 'walmart', etc.
    status: varchar("status", { length: 20 }).notNull(), // 'success', 'failed', 'partial'
    dealsFound: integer("deals_found").default(0),
    dealsAdded: integer("deals_added").default(0),
    dealsUpdated: integer("deals_updated").default(0),
    errorMessage: text("error_message"),
    duration: integer("duration"), // milliseconds
    startedAt: timestamp("started_at").notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    sourceIdx: index("scraper_logs_source_idx").on(table.source),
    startedAtIdx: index("scraper_logs_started_at_idx").on(table.startedAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  savedDeals: many(savedDeals),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  createdDeals: many(deals),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  deals: many(deals),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  deals: many(deals),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  subcategories: many(categories),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  store: one(stores, {
    fields: [deals.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [deals.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [deals.createdBy],
    references: [users.id],
  }),
  savedByUsers: many(savedDeals),
  youtubeVideos: many(youtubeVideos),
}));

export const savedDealsRelations = relations(savedDeals, ({ one }) => ({
  user: one(users, {
    fields: [savedDeals.userId],
    references: [users.id],
  }),
  deal: one(deals, {
    fields: [savedDeals.dealId],
    references: [deals.id],
  }),
}));

export const youtubeVideosRelations = relations(youtubeVideos, ({ one }) => ({
  deal: one(deals, {
    fields: [youtubeVideos.dealId],
    references: [deals.id],
  }),
}));
