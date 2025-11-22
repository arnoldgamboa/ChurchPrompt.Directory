import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all published blogs
export const getPublishedBlogs = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async ({ db }, args) => {
    const { limit, search } = args;

    // Get all published blogs
    let results = await db
      .query("blogs")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Search filtering (case-insensitive across title, content, excerpt, tags)
    if (search) {
      const lowered = search.toLowerCase();
      results = results.filter((b) => {
        return (
          b.title.toLowerCase().includes(lowered) ||
          b.content.toLowerCase().includes(lowered) ||
          b.excerpt.toLowerCase().includes(lowered) ||
          b.tags.some((t) => t.toLowerCase().includes(lowered))
        );
      });
    }

    // Sort by publishedAt desc (most recent first)
    results.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

    // Apply limit if specified
    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  },
});

// Query: Get blog by slug
// Query: Get blog by slug (public - only published)
export const getBlogBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async ({ db }, args) => {
    const blog = await db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    // Only return published blogs to public users
    if (blog && blog.status === "published") {
      return blog;
    }

    return null;
  },
});

// Query: Get all blogs (admin only - includes drafts)
export const getAllBlogs = query({
  args: {},
  handler: async ({ db }) => {
    const blogs = await db.query("blogs").collect();
    
    // Sort by createdAt desc (most recent first)
    blogs.sort((a, b) => b.createdAt - a.createdAt);
    
    return blogs;
  },
});

// Query: Get blog by ID (for editing)
export const getBlogById = query({
  args: {
    blogId: v.id("blogs"),
  },
  handler: async ({ db }, args) => {
    const blog = await db.get(args.blogId);
    return blog;
  },
});

// Mutation: Create blog
export const createBlog = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    metaDescription: v.string(),
    metaKeywords: v.array(v.string()),
    authorId: v.string(),
    authorName: v.string(),
    tags: v.array(v.string()),
    status: v.string(),
    featured: v.optional(v.boolean()),
  },
  handler: async ({ db }, args) => {
    // Check if slug already exists
    const existing = await db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("A blog with this slug already exists");
    }

    const now = Date.now();
    const blogId = await db.insert("blogs", {
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      metaDescription: args.metaDescription,
      metaKeywords: args.metaKeywords,
      authorId: args.authorId,
      authorName: args.authorName,
      tags: args.tags,
      status: args.status,
      featured: args.featured || false,
      publishedAt: args.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return blogId;
  },
});

// Mutation: Update blog
export const updateBlog = mutation({
  args: {
    blogId: v.id("blogs"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async ({ db }, args) => {
    const { blogId, ...updates } = args;
    
    // Get existing blog
    const existingBlog = await db.get(blogId);
    if (!existingBlog) {
      throw new Error("Blog not found");
    }

    // If slug is being changed, check for conflicts
    if (updates.slug && updates.slug !== existingBlog.slug) {
      const conflicting = await db
        .query("blogs")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();

      if (conflicting) {
        throw new Error("A blog with this slug already exists");
      }
    }

    const now = Date.now();
    const updateData: any = {
      ...updates,
      updatedAt: now,
    };

    // If status is changing to published and it wasn't published before, set publishedAt
    if (
      updates.status === "published" &&
      existingBlog.status !== "published" &&
      !existingBlog.publishedAt
    ) {
      updateData.publishedAt = now;
    }

    await db.patch(blogId, updateData);
  },
});

// Mutation: Delete blog
export const deleteBlog = mutation({
  args: {
    blogId: v.id("blogs"),
  },
  handler: async ({ db }, args) => {
    await db.delete(args.blogId);
  },
});
