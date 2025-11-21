import { query, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: getUserByClerkId (Requirements: 3.1 lookup, 3.4 submission support)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async ({ db }, { clerkId }) => {
    return await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

// Query: getCurrentUser (Requirements: 3.1 profile display)
// Uses auth identity subject (Clerk user id expected) to fetch user record.
export const getCurrentUser = query({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    console.log('[getCurrentUser] identity:', JSON.stringify(identity));
    if (!identity) {
      console.log('[getCurrentUser] No identity found');
      return null;
    }
    const clerkId = identity.subject;
    console.log('[getCurrentUser] Looking up user with clerkId:', clerkId);
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    console.log('[getCurrentUser] Found user:', user ? 'YES' : 'NO');
    return user;
  },
});

// ---------------- Internal Mutations (Webhook processing) ----------------
// Requirement 2.2, 3.2, 3.3

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()), // defaults to "user"
    isSubscribed: v.optional(v.boolean()),
  },
  handler: async ({ db }, args) => {
    const now = Date.now();
    const existing = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existing) return existing._id; // idempotent create
    const id = await db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      role: args.role ?? "user",
      isSubscribed: args.isSubscribed,
      promptViewCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    isSubscribed: v.optional(v.boolean()),
    promptViewCount: v.optional(v.number()),
  },
  handler: async ({ db }, args) => {
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    const patch: any = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.email !== undefined) patch.email = args.email;
    if (args.role !== undefined) patch.role = args.role;
    if (args.isSubscribed !== undefined) patch.isSubscribed = args.isSubscribed;
    if (args.promptViewCount !== undefined) patch.promptViewCount = args.promptViewCount;
    await db.patch(user._id, patch);
    return user._id;
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async ({ db }, { clerkId }) => {
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;
    await db.delete(user._id);
    return user._id;
  },
});

// Public mutation: ensure the currently authenticated Clerk user exists in Convex.
// Useful fallback when the webhook hasn't synced yet but the user needs access immediately.
export const ensureCurrentUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    console.log('[ensureCurrentUser] identity:', JSON.stringify(identity));
    if (!identity) {
      console.error('[ensureCurrentUser] No identity - user not authenticated');
      throw new Error("Not authenticated");
    }

    const clerkId = identity.subject;
    const existing = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (existing) return existing;

    const now = Date.now();
    const name = args.name ?? identity.name ?? identity.nickname ?? "User";
    const email = args.email ?? identity.email ?? "";
    const doc = {
      clerkId,
      name,
      email,
      role: "user",
      isSubscribed: false,
      promptViewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const _id = await db.insert("users", doc);
    return { _id, ...doc };
  },
});

// Mutation: Make current user an admin (temporary helper - remove after use)
export const makeCurrentUserAdmin = mutation({
  args: {},
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkId = identity.subject;
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) throw new Error("User not found");

    await db.patch(user._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true, message: `User ${user.name} is now an admin` };
  },
});
