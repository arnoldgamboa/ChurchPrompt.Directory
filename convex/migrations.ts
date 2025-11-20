import { internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const bulkInsertCategories = internalMutation({
  args: {
    categories: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        icon: v.string(),
        promptCount: v.number(),
      })
    ),
  },
  handler: async ({ db }, { categories }) => {
    const now = Date.now();
    for (const c of categories) {
      const existing = await db
        .query("categories")
        .withIndex("by_category_id", (q) => q.eq("categoryId", c.id))
        .first();
      if (existing) {
        await db.patch(existing._id, {
          name: c.name,
          description: c.description,
          icon: c.icon,
          promptCount: c.promptCount,
          updatedAt: now,
        });
      } else {
        await db.insert("categories", {
          categoryId: c.id,
          name: c.name,
          description: c.description,
          icon: c.icon,
          promptCount: c.promptCount,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

export const bulkInsertUsers = internalMutation({
  args: {
    users: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.string(),
        isSubscribed: v.boolean(),
        joinedAt: v.string(),
        promptViewCount: v.number(),
      })
    ),
  },
  handler: async ({ db }, { users }) => {
    for (const u of users) {
      const created = Date.parse(u.joinedAt) || Date.now();
      const existing = await db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", u.id))
        .first();
      if (existing) {
        await db.patch(existing._id, {
          name: u.name,
          email: u.email,
          role: u.role,
          isSubscribed: u.isSubscribed,
          promptViewCount: u.promptViewCount ?? 0,
          updatedAt: Date.now(),
        });
      } else {
        await db.insert("users", {
          clerkId: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isSubscribed: u.isSubscribed,
          promptViewCount: u.promptViewCount ?? 0,
          createdAt: created,
          updatedAt: created,
        });
      }
    }
  },
});

export const bulkInsertPrompts = internalMutation({
  args: {
    prompts: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
        excerpt: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        authorId: v.string(),
        authorName: v.string(),
        status: v.string(),
        usageCount: v.number(),
        executionCount: v.number(),
        createdAt: v.string(),
        updatedAt: v.string(),
        featured: v.optional(v.boolean()),
      })
    ),
  },
  handler: async ({ db }, { prompts }) => {
    for (const p of prompts) {
      const created = Date.parse(p.createdAt) || Date.now();
      const updated = Date.parse(p.updatedAt) || created;
      // Guard against duplicates by same authorId + title
      const existingByAuthor = await db
        .query("prompts")
        .withIndex("by_author", (q) => q.eq("authorId", p.authorId))
        .collect();
      const dup = existingByAuthor.find((x) => x.title === p.title);
      if (dup) {
        await db.patch(dup._id, {
          content: p.content,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags,
          status: p.status,
          usageCount: p.usageCount,
          executionCount: p.executionCount,
          featured: p.featured ?? false,
          updatedAt: updated,
        });
      } else {
        await db.insert("prompts", {
          title: p.title,
          content: p.content,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags,
          authorId: p.authorId,
          authorName: p.authorName,
          status: p.status,
          usageCount: p.usageCount,
          executionCount: p.executionCount,
          featured: p.featured ?? false,
          createdAt: created,
          updatedAt: updated,
        });
      }
    }
  },
});

// Internal action to run migration from command line
export const seedAll = internalAction({
  args: {
    categories: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        icon: v.string(),
        promptCount: v.number(),
      })
    ),
    users: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.string(),
        isSubscribed: v.boolean(),
        joinedAt: v.string(),
        promptViewCount: v.number(),
      })
    ),
    prompts: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
        excerpt: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        authorId: v.string(),
        authorName: v.string(),
        status: v.string(),
        usageCount: v.number(),
        executionCount: v.number(),
        createdAt: v.string(),
        updatedAt: v.string(),
        featured: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { categories, users, prompts }) => {
    await ctx.runMutation(internal.migrations.bulkInsertCategories, { categories });
    await ctx.runMutation(internal.migrations.bulkInsertUsers, { users });
    await ctx.runMutation(internal.migrations.bulkInsertPrompts, { prompts });
    return { ok: true, counts: { categories: categories.length, users: users.length, prompts: prompts.length } };
  },
});
