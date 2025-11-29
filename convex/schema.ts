import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex schema for Church Prompt Directory.
// Keep this in sync with design & requirements docs.
// NOTE: Search indexes & advanced features can be added later.
export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(), // "user" | "admin"
    isSubscribed: v.optional(v.boolean()),
    promptViewCount: v.optional(v.number()), // For anonymous->registered transition tracking
    createdAt: v.number(), // Unix epoch ms
    updatedAt: v.number(), // Unix epoch ms
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  prompts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(), // maps to categories.categoryId
    tags: v.array(v.string()),
    authorId: v.string(), // Clerk user ID
    authorName: v.string(),
    status: v.string(), // e.g. "approved", "pending"
    usageCount: v.number(),
    executionCount: v.number(),
    featured: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"]) // for user profile prompt listings
    .index("by_featured", ["featured"]) // optional featured filtering
    .index("by_usage", ["usageCount"]) // popularity sorting
    .index("by_execution", ["executionCount"]),

  categories: defineTable({
    categoryId: v.string(), // stable id used in prompts.category
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    promptCount: v.number(), // maintain via aggregation logic / migration
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category_id", ["categoryId"]),

  favorites: defineTable({
    userId: v.string(), // Clerk user ID
    promptId: v.id("prompts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // list favorites per user
    .index("by_user_and_prompt", ["userId", "promptId"]) // uniqueness check
    .index("by_prompt", ["promptId"]),

  promptExecutions: defineTable({
    promptId: v.id("prompts"),
    userId: v.optional(v.string()), // may be anonymous or registered
    createdAt: v.number(),
  })
    .index("by_prompt", ["promptId"]) // execution stats
    .index("by_user", ["userId"]),

  blogs: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    content: v.string(), // Markdown content
    excerpt: v.string(), // Brief description for listings and SEO
    metaDescription: v.string(), // SEO meta description
    metaKeywords: v.array(v.string()), // SEO keywords
    authorId: v.string(), // Clerk user ID
    authorName: v.string(),
    tags: v.array(v.string()),
    status: v.string(), // "draft" | "published"
    featured: v.optional(v.boolean()),
    publishedAt: v.optional(v.number()), // Unix epoch ms, set when status changes to published
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // for URL lookups
    .index("by_status", ["status"]) // for filtering published blogs
    .index("by_author", ["authorId"]) // for author's blog listings
    .index("by_published_at", ["publishedAt"]), // for sorting by publish date
});
