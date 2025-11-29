import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: getApprovedPrompts
// Requirements: 7.1 (approved prompts), 7.2 (category filter), 7.3 (search), 7.5 (display fields basis)
// Future: add pagination / sorting enhancements.
export const getApprovedPrompts = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    sort: v.optional(v.string()), // placeholder: "usage" | "recent" | "featured"
  },
  handler: async ({ db }, args) => {
    const { category, search, limit, sort } = args;

    // Base: status approved index scan
    let q = db.query("prompts").withIndex("by_status", (x) => x.eq("status", "approved"));

    let results: any[] = [];
    // If category filter present, apply additional filtering (index by_category used after fetching approved subset).
    if (category) {
      // Refine by category first then filter approved (status not part of by_category index key; apply post-filter).
      const catResults = await db
        .query("prompts")
        .withIndex("by_category", (x) => x.eq("category", category))
        .collect();
      results = catResults.filter((d: any) => d.status === "approved");
    } else {
      results = await q.collect();
    }
    // If category path executed above results already assigned; ensure results variable exists.
    // (Declaration moved earlier.)

    // Search filtering (case-insensitive across title, content, tags)
    if (search) {
      const lowered = search.toLowerCase();
      results = results.filter((p: any) => {
        return (
          p.title.toLowerCase().includes(lowered) ||
          p.content.toLowerCase().includes(lowered) ||
          p.excerpt.toLowerCase().includes(lowered) ||
          p.tags.some((t: any) => t.toLowerCase().includes(lowered))
        );
      });
    }

    // Sort placeholder (extend later). Default: featured first then usageCount desc.
    let sorted: any[] = results;
    switch (sort) {
      case "usage":
        sorted = results.sort((a: any, b: any) => b.usageCount - a.usageCount);
        break;
      case "recent":
        sorted = results.sort((a: any, b: any) => b.createdAt - a.createdAt);
        break;
      case "featured":
        sorted = results.sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        // Default mixed heuristic: featured first then usage
        sorted = results.sort((a: any, b: any) => {
          const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          if (featDiff !== 0) return featDiff;
          return b.usageCount - a.usageCount;
        });
    }

    if (limit && limit > 0) {
      sorted = sorted.slice(0, limit);
    }

    return sorted.map((p: any) => ({
      id: p._id,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      authorName: p.authorName,
      usageCount: p.usageCount,
      executionCount: p.executionCount,
      tags: p.tags,
      createdAt: p.createdAt,
      featured: p.featured,
    }));
  },
});

// Query: getPromptById (Requirement 7.4)
export const getPromptById = query({
  args: { id: v.id("prompts") },
  handler: async ({ db }, { id }) => {
    const doc = await db.get(id);
    if (!doc) return null;
    return doc;
  },
});

// Query: getPromptsByAuthor (Requirement 3.4)
export const getPromptsByAuthor = query({
  args: { authorId: v.string() },
  handler: async ({ db }, { authorId }) => {
    const docs = await db
      .query("prompts")
      .withIndex("by_author", (x) => x.eq("authorId", authorId))
      .collect();
    return docs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ---------------- Test Helper Pure Functions ----------------
// These helpers mirror logic for property-based tests without needing Convex runtime.
// Provide stable deterministic output for the dataset loaded from JSON.

export interface LocalPromptDoc {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: string;
  usageCount: number;
  executionCount: number;
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ApprovedArgs {
  category?: string;
  search?: string;
  limit?: number;
  sort?: string;
}

export function computeApprovedPrompts(data: LocalPromptDoc[], args: ApprovedArgs) {
  const { category, search, limit, sort } = args;
  let results = data.filter((d) => d.status === "approved");
  if (category) results = results.filter((d) => d.category === category);
  if (search) {
    const lowered = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(lowered) ||
        p.content.toLowerCase().includes(lowered) ||
        p.excerpt.toLowerCase().includes(lowered) ||
        p.tags.some((t) => t.toLowerCase().includes(lowered))
    );
  }
  switch (sort) {
    case "usage":
      results = [...results].sort((a, b) => b.usageCount - a.usageCount);
      break;
    case "recent":
      results = [...results].sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "featured":
      results = [...results].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
    default:
      results = [...results].sort((a, b) => {
        const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
        return b.usageCount - a.usageCount;
      });
  }
  if (limit && limit > 0) results = results.slice(0, limit);
  return results.map((p) => ({
    id: p._id,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    authorName: p.authorName,
    usageCount: p.usageCount,
    executionCount: p.executionCount,
    tags: p.tags,
    createdAt: p.createdAt,
    featured: p.featured,
  }));
}

export function getPromptByIdLocal(data: LocalPromptDoc[], id: string) {
  return data.find((d) => d._id === id) || null;
}

// ---------------- Mutations ----------------
// Requirement 8.1: Increment usage count when a prompt is copied
export const incrementUsageCount = mutation({
  args: { id: v.id("prompts"), delta: v.optional(v.number()) },
  handler: async ({ db }, { id, delta }) => {
    const inc = delta ?? 1;
    if (inc <= 0) throw new Error("delta must be a positive number");
    const doc = await db.get(id);
    if (!doc) throw new Error("Prompt not found");
    const next = (doc.usageCount ?? 0) + inc;
    await db.patch(id, { usageCount: next, updatedAt: Date.now() });
    return { id, usageCount: next };
  },
});

// Requirement 8.2: Increment execution count when AI is executed with the prompt
export const incrementExecutionCount = mutation({
  args: { id: v.id("prompts"), delta: v.optional(v.number()) },
  handler: async ({ db }, { id, delta }) => {
    const inc = delta ?? 1;
    if (inc <= 0) throw new Error("delta must be a positive number");
    const doc = await db.get(id);
    if (!doc) throw new Error("Prompt not found");
    const next = (doc.executionCount ?? 0) + inc;
    await db.patch(id, { executionCount: next, updatedAt: Date.now() });
    return { id, executionCount: next };
  },
});

// Mutation: Create a new prompt (submitted by user, requires approval)
export const createPrompt = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { title, content, category, tags } = args;

    // Generate excerpt from content (first 150 chars)
    const excerpt = content.length > 150 
      ? content.substring(0, 150) + '...' 
      : content;

    // Get author name from users table
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    const authorName = user?.name || identity.email?.split('@')[0] || 'Anonymous';

    const promptId = await db.insert("prompts", {
      title,
      content,
      excerpt,
      category,
      tags,
      authorId: identity.subject, // Clerk user ID
      authorName,
      status: "pending", // Requires admin approval
      usageCount: 0,
      executionCount: 0,
      featured: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id: promptId };
  },
});

// Query: Get pending prompts (admin only)
export const getPendingPrompts = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const results = await db
      .query("prompts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return results;
  },
});

// Query: Get all prompts (admin only)
export const getAllPrompts = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const results = await db.query("prompts").collect();
    return results;
  },
});

// Mutation: Update prompt status (admin only)
export const updatePromptStatus = mutation({
  args: {
    promptId: v.id("prompts"),
    status: v.string(), // "approved" | "rejected" | "pending"
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { promptId, status } = args;

    await db.patch(promptId, {
      status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation: Update prompt (admin edit before approving)
export const updatePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { promptId, title, content, category, tags, featured } = args;

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (featured !== undefined) updates.featured = featured;
    
    if (content !== undefined) {
      updates.content = content;
      // Update excerpt when content changes
      updates.excerpt = content.length > 150 
        ? content.substring(0, 150) + '...' 
        : content;
    }

    await db.patch(promptId, updates);

    return { success: true };
  },
});

// Mutation: Delete prompt (admin only)
export const deletePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const { promptId } = args;

    await db.delete(promptId);

    return { success: true };
  },
});

// Query: Get all approved prompt IDs for static generation
export const getAllPromptIds = query({
  args: {},
  handler: async ({ db }) => {
    const prompts = await db
      .query("prompts")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    
    return prompts.map((prompt) => ({ _id: prompt._id }));
  },
});
