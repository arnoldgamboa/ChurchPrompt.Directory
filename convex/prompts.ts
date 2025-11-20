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
