# Design Document

## Overview

This design document outlines the technical architecture for integrating Convex and Clerk into the Church Prompt Directory platform. The integration replaces static JSON data with a live Convex database and implements secure user authentication through Clerk. The design focuses on seamless data flow between Clerk (authentication), Convex (database), and the Astro frontend, with real-time updates and persistent anonymous user tracking.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Astro Frontend │
│   (React Islands)│
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│    Clerk    │  │    Convex    │
│   (Auth)    │  │  (Database)  │
└──────┬──────┘  └──────┬───────┘
       │                │
       │    Webhooks    │
       └───────►────────┘
```

### Component Interaction Flow

1. **User Authentication Flow:**
   - User interacts with Clerk UI components in Astro pages
   - Clerk handles authentication and returns session token
   - Frontend uses session token to make authenticated Convex queries
   - Convex validates token and returns user-specific data

2. **Data Synchronization Flow:**
   - User signs up/updates profile in Clerk
   - Clerk sends webhook to Convex HTTP action
   - Convex processes webhook and updates user table
   - Real-time subscriptions push updates to connected clients

3. **Anonymous User Tracking Flow:**
   - Anonymous user visits site, receives session cookie
   - Each prompt view increments counter in browser storage
   - Counter persists across sessions via localStorage
   - At 10 views, registration modal appears

## Components and Interfaces

### 1. Convex Backend

#### Schema Definition (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    isSubscribed: v.boolean(),
    promptViewCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  prompts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    authorId: v.string(), // Clerk user ID
    authorName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    usageCount: v.number(),
    executionCount: v.number(),
    featured: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status", "category"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["status", "category"],
    }),

  categories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    promptCount: v.number(),
  }).index("by_category_id", ["categoryId"]),

  favorites: defineTable({
    userId: v.string(), // Clerk user ID
    promptId: v.id("prompts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prompt", ["promptId"])
    .index("by_user_and_prompt", ["userId", "promptId"]),

  promptExecutions: defineTable({
    promptId: v.id("prompts"),
    userId: v.string(), // Clerk user ID
    inputContext: v.string(),
    aiResponse: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_prompt", ["promptId"]),
});
```

#### Query Functions

**Get Approved Prompts (`convex/prompts.ts`):**
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getApprovedPrompts = query({
  args: {
    category: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let prompts = ctx.db
      .query("prompts")
      .withIndex("by_status", (q) => q.eq("status", "approved"));

    if (args.category) {
      prompts = prompts.filter((q) => q.eq(q.field("category"), args.category));
    }

    let results = await prompts.collect();

    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.content.toLowerCase().includes(searchLower) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

export const getPromptById = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPromptsByAuthor = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prompts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});
```

**User Queries (`convex/users.ts`):**
```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});
```

#### Mutation Functions

**Increment Usage Count (`convex/prompts.ts`):**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const incrementUsageCount = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await ctx.db.patch(args.promptId, {
      usageCount: prompt.usageCount + 1,
      updatedAt: Date.now(),
    });
  },
});

export const incrementExecutionCount = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");

    await ctx.db.patch(args.promptId, {
      executionCount: prompt.executionCount + 1,
      updatedAt: Date.now(),
    });
  },
});
```

#### Webhook Handler (`convex/clerk.ts`)

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET not configured");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();
    const body = JSON.parse(payload);

    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      await ctx.runMutation(internal.users.createUser, {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() || "User",
      });
    }

    if (eventType === "user.updated") {
      await ctx.runMutation(internal.users.updateUser, {
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim(),
      });
    }

    if (eventType === "user.deleted") {
      await ctx.runMutation(internal.users.deleteUser, {
        clerkId: evt.data.id,
      });
    }

    return new Response("Webhook processed", { status: 200 });
  }),
});

export default http;
```

**Internal User Mutations (`convex/users.ts`):**
```typescript
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      role: "user",
      isSubscribed: false,
      promptViewCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        email: args.email,
        name: args.name,
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
```

### 2. Clerk Integration

#### Astro Middleware (`src/middleware.ts`)

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/submit(.*)",
  "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware(async (auth, context) => {
  const { userId, sessionClaims } = auth();

  if (isProtectedRoute(context.request) && !userId) {
    return context.redirect("/sign-in");
  }

  if (isAdminRoute(context.request)) {
    const role = sessionClaims?.metadata?.role;
    if (role !== "admin") {
      return new Response("Unauthorized", { status: 403 });
    }
  }

  return context.next();
});
```

#### Clerk Provider Setup (`src/layouts/Layout.astro`)

```astro
---
import { ClerkProvider } from "@clerk/astro/components";

const clerkPubKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
---

<ClerkProvider publishableKey={clerkPubKey}>
  <slot />
</ClerkProvider>
```

### 3. Frontend Integration

#### Convex Provider Setup (`src/layouts/Layout.astro`)

```astro
---
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl);
---

<ConvexProvider client={convex}>
  <slot />
</ConvexProvider>
```

#### React Component Example (`src/components/directory/PromptGrid.tsx`)

```typescript
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/astro/react";

export function PromptGrid({ category }: { category?: string }) {
  const { user } = useUser();
  const prompts = useQuery(api.prompts.getApprovedPrompts, {
    category,
    limit: 50,
  });

  if (!prompts) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt._id} prompt={prompt} />
      ))}
    </div>
  );
}
```

### 4. Anonymous User Tracking

#### Session Storage Utility (`src/lib/anonymousTracking.ts`)

```typescript
const STORAGE_KEY = "anonymous_prompt_views";
const MAX_VIEWS = 10;

export function getAnonymousViewCount(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

export function incrementAnonymousViewCount(): number {
  if (typeof window === "undefined") return 0;
  const current = getAnonymousViewCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY, newCount.toString());
  return newCount;
}

export function resetAnonymousViewCount(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasReachedViewLimit(): boolean {
  return getAnonymousViewCount() >= MAX_VIEWS;
}

export function canViewPrompt(isAuthenticated: boolean): boolean {
  if (isAuthenticated) return true;
  return !hasReachedViewLimit();
}
```

#### Anonymous View Guard Component (`src/components/prompts/AnonymousViewGuard.tsx`)

```typescript
import { useEffect, useState } from "react";
import { useUser } from "@clerk/astro/react";
import {
  canViewPrompt,
  incrementAnonymousViewCount,
  resetAnonymousViewCount,
} from "../../lib/anonymousTracking";
import { SignUpModal } from "../auth/SignUpModal";

export function AnonymousViewGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [canView, setCanView] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      resetAnonymousViewCount();
      setCanView(true);
    } else {
      const allowed = canViewPrompt(false);
      if (allowed) {
        incrementAnonymousViewCount();
        setCanView(true);
      } else {
        setCanView(false);
        setShowSignUpModal(true);
      }
    }
  }, [isSignedIn]);

  if (!canView) {
    return <SignUpModal isOpen={showSignUpModal} />;
  }

  return <>{children}</>;
}
```

## Data Models

### User Model
```typescript
{
  _id: Id<"users">,
  clerkId: string,           // Clerk user ID (unique)
  name: string,              // User's display name
  email: string,             // User's email address
  role: "user" | "admin",    // User role for access control
  isSubscribed: boolean,     // Subscription status (future)
  promptViewCount: number,   // Total prompts viewed (analytics)
  createdAt: number,         // Unix timestamp
  updatedAt: number,         // Unix timestamp
}
```

### Prompt Model
```typescript
{
  _id: Id<"prompts">,
  title: string,                              // Prompt title
  content: string,                            // Full prompt text
  excerpt: string,                            // Short description
  category: string,                           // Category ID
  tags: string[],                             // Array of tags
  authorId: string,                           // Clerk user ID
  authorName: string,                         // Author display name
  status: "pending" | "approved" | "rejected", // Moderation status
  usageCount: number,                         // Times copied
  executionCount: number,                     // Times executed with AI
  featured: boolean | undefined,              // Featured flag
  createdAt: number,                          // Unix timestamp
  updatedAt: number,                          // Unix timestamp
}
```

### Category Model
```typescript
{
  _id: Id<"categories">,
  categoryId: string,        // Unique category identifier
  name: string,              // Display name
  description: string,       // Category description
  icon: string,              // Lucide icon name
  promptCount: number,       // Number of prompts in category
}
```

### Favorite Model
```typescript
{
  _id: Id<"favorites">,
  userId: string,            // Clerk user ID
  promptId: Id<"prompts">,   // Reference to prompt
  createdAt: number,         // Unix timestamp
}
```

### PromptExecution Model
```typescript
{
  _id: Id<"promptExecutions">,
  promptId: Id<"prompts">,   // Reference to prompt
  userId: string,            // Clerk user ID
  inputContext: string,      // User's input variables
  aiResponse: string,        // AI-generated output
  createdAt: number,         // Unix timestamp
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Anonymous view count persistence
*For any* anonymous user session, storing a view count and then retrieving it should return the same count value.
**Validates: Requirements 1.1, 1.4**

### Property 2: Anonymous view count increment
*For any* anonymous user viewing any prompt, the view count should increase by exactly 1 after each view.
**Validates: Requirements 1.2**

### Property 3: Anonymous to authenticated transition resets count
*For any* anonymous user with a non-zero view count, creating an account should reset their view count to 0 and grant unlimited access.
**Validates: Requirements 1.5**

### Property 4: Clerk user creation syncs to Convex
*For any* user registration in Clerk, a corresponding user record with matching clerkId should be created in Convex.
**Validates: Requirements 2.2, 9.1**

### Property 5: Profile data completeness
*For any* registered user querying their profile, the result should contain name, email, role, and joinedAt fields.
**Validates: Requirements 3.1**

### Property 6: Clerk profile updates sync to Convex
*For any* user profile update in Clerk, the corresponding Convex user record should be updated with the new values.
**Validates: Requirements 3.2, 9.2**

### Property 7: Clerk user deletion syncs to Convex
*For any* user deletion in Clerk, the corresponding Convex user record should be removed.
**Validates: Requirements 3.3, 9.3**

### Property 8: User submission history retrieval
*For any* user with submitted prompts, querying their profile should return all prompts where authorId matches their clerkId.
**Validates: Requirements 3.4**

### Property 9: Default role assignment
*For any* new user registration, the user record should have role set to "user" by default.
**Validates: Requirements 4.1**

### Property 10: Role synchronization across systems
*For any* user role update, both Clerk metadata and Convex user record should reflect the new role value.
**Validates: Requirements 4.2**

### Property 11: Admin access control
*For any* user with role "admin", they should be granted access to admin dashboard and moderation features.
**Validates: Requirements 4.3**

### Property 12: Non-admin access denial
*For any* user with role "user", attempting to access admin features should result in access denial.
**Validates: Requirements 4.4, 10.3**

### Property 13: Prompt creation field completeness
*For any* prompt created in Convex, the record should contain all required fields: title, content, excerpt, category, tags, authorId, status, usageCount, executionCount, and timestamps.
**Validates: Requirements 5.2**

### Property 14: Category query field completeness
*For any* category queried from Convex, the result should contain categoryId, name, description, icon, and promptCount fields.
**Validates: Requirements 5.3**

### Property 15: User record field completeness
*For any* user created in Convex, the record should contain clerkId, name, email, role, isSubscribed, promptViewCount, and timestamps.
**Validates: Requirements 5.4**

### Property 16: Prompt migration completeness
*For any* prompt in src/data/prompts.json, after migration it should exist in Convex with matching title and content.
**Validates: Requirements 6.2**

### Property 17: Category migration completeness
*For any* category in src/data/categories.json, after migration it should exist in Convex with matching categoryId and name.
**Validates: Requirements 6.3**

### Property 18: User migration completeness
*For any* user in src/data/users.json, after migration it should exist in Convex with matching email and name.
**Validates: Requirements 6.4**

### Property 19: Approved prompts query filtering
*For any* query for approved prompts, all returned results should have status equal to "approved".
**Validates: Requirements 7.1**

### Property 20: Category filtering accuracy
*For any* category filter applied, all returned prompts should have category matching the filter value.
**Validates: Requirements 7.2**

### Property 21: Search term matching
*For any* search term, all returned prompts should contain the search term in either title, content, or tags (case-insensitive).
**Validates: Requirements 7.3**

### Property 22: Prompt ID query accuracy
*For any* valid prompt ID, querying by that ID should return the prompt with matching _id field.
**Validates: Requirements 7.4**

### Property 23: Prompt display field completeness
*For any* prompt displayed to users, it should include title, excerpt, category, authorName, usageCount, and createdAt fields.
**Validates: Requirements 7.5**

### Property 24: Usage count increment on copy
*For any* prompt, copying it to clipboard should increase its usageCount by exactly 1.
**Validates: Requirements 8.1**

### Property 25: Execution count increment on AI run
*For any* prompt, executing it with AI should increase its executionCount by exactly 1.
**Validates: Requirements 8.2**

### Property 26: Usage statistics display accuracy
*For any* prompt displayed, the shown usageCount and executionCount should match the current values in Convex.
**Validates: Requirements 8.4**

### Property 27: Popularity sorting order
*For any* set of prompts sorted by popularity, each prompt's usageCount should be greater than or equal to the next prompt's usageCount.
**Validates: Requirements 8.5**

### Property 28: Webhook signature validation
*For any* webhook received, if the signature is invalid, the webhook should be rejected with a 400 status code.
**Validates: Requirements 9.4**

### Property 29: Protected route authentication requirement
*For any* authenticated user accessing a protected route, they should be granted access without redirection.
**Validates: Requirements 10.2**

## Error Handling

### Convex Query Errors
- All Convex queries should be wrapped in try-catch blocks
- Failed queries should return null or empty arrays rather than throwing
- Error details should be logged to console for debugging
- User-facing error messages should be generic and helpful

### Clerk Authentication Errors
- Failed sign-in attempts should display specific error messages (invalid credentials, account not found, etc.)
- Network errors should prompt users to check connection and retry
- Session expiration should redirect to sign-in with a message explaining why

### Webhook Processing Errors
- Invalid webhook signatures should be rejected immediately
- Failed webhook processing should be logged with full error details
- Webhook handlers should be idempotent to handle retries safely
- Critical webhook failures should trigger alerts for monitoring

### Data Migration Errors
- Migration script should validate JSON file structure before processing
- Individual record failures should be logged but not stop the entire migration
- Migration should provide a summary report of successes and failures
- Failed records should be exported to a separate file for manual review

### Anonymous Tracking Errors
- localStorage failures should gracefully degrade to session-only tracking
- View count retrieval errors should default to 0 rather than blocking access
- Increment failures should be logged but not prevent prompt viewing

## Testing Strategy

### Unit Testing
- Test Convex query functions with mock database data
- Test anonymous tracking utilities with mock localStorage
- Test webhook signature validation with known test signatures
- Test data transformation functions for migration
- Test access control logic with various user roles

### Property-Based Testing
- Use **fast-check** library for JavaScript/TypeScript property-based testing
- Configure each property test to run a minimum of 100 iterations
- Tag each property test with the format: **Feature: convex-clerk-integration, Property {number}: {property_text}**
- Generate random user data, prompt data, and view counts for comprehensive testing
- Test edge cases like empty strings, very long strings, special characters
- Verify invariants hold across all generated test cases

### Integration Testing
- Test Clerk authentication flow end-to-end
- Test webhook delivery from Clerk to Convex
- Test data synchronization between Clerk and Convex
- Test anonymous user flow from first visit to registration
- Test protected route access with various authentication states

### Manual Testing
- Verify Clerk UI components render correctly
- Test sign-up and sign-in flows in browser
- Verify anonymous view limit enforcement
- Test admin access control in production-like environment
- Verify real-time updates work across multiple browser tabs

## Performance Considerations

### Database Indexing
- Index frequently queried fields (clerkId, status, category, authorId)
- Use search indexes for full-text search on title and content
- Compound indexes for common filter combinations (status + category)
- Monitor query performance and add indexes as needed

### Query Optimization
- Limit query results to reasonable page sizes (50-100 items)
- Use pagination for large result sets
- Avoid N+1 queries by batching related data fetches
- Cache frequently accessed data (categories, featured prompts)

### Real-time Updates
- Convex handles real-time subscriptions efficiently by default
- Limit number of active subscriptions per client
- Unsubscribe from queries when components unmount
- Use debouncing for search queries to reduce load

### Anonymous Tracking
- Use localStorage for client-side tracking (no server load)
- Minimal data stored (just a counter)
- No network requests for view tracking
- Efficient check on each prompt view

## Security Considerations

### Authentication
- Clerk handles password hashing and secure storage
- Session tokens are HTTP-only cookies
- CSRF protection via Clerk's built-in mechanisms
- Multi-factor authentication available through Clerk

### Authorization
- Role-based access control enforced at middleware level
- Admin routes protected by role check
- Convex queries validate user permissions before returning data
- Webhook endpoints validate signatures to prevent spoofing

### Data Privacy
- User emails and personal data stored securely in Clerk
- Convex data encrypted at rest and in transit
- No sensitive data in client-side code or logs
- GDPR compliance through data deletion webhooks

### API Security
- Webhook endpoints validate signatures
- Rate limiting on public endpoints
- Input validation on all user-submitted data
- SQL injection not possible (Convex uses NoSQL)

## Deployment Considerations

### Environment Variables
Required environment variables:
- `PUBLIC_CONVEX_URL`: Convex deployment URL
- `PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key (server-side only)
- `CLERK_WEBHOOK_SECRET`: Clerk webhook signing secret

### Convex Deployment
- Deploy Convex functions via `npx convex deploy`
- Run migration script after initial deployment
- Configure webhook endpoint URL in Clerk dashboard
- Monitor Convex dashboard for errors and performance

### Clerk Configuration
- Configure allowed redirect URLs for authentication
- Set up webhook endpoint for user events
- Configure session lifetime and security settings
- Enable desired authentication methods (email, Google, GitHub)

### Migration Process
1. Deploy Convex schema and functions
2. Run migration script to seed data
3. Verify data in Convex dashboard
4. Configure Clerk webhooks
5. Test authentication flow
6. Deploy frontend with Convex and Clerk integration
7. Monitor for errors and performance issues

## Future Enhancements

### Subscription Integration (Polar)
- Add subscription status field to user model
- Integrate Polar webhooks for subscription events
- Implement subscription-based feature gating
- Add subscription management UI

### Advanced Search
- Implement full-text search with ranking
- Add filters for tags, author, date range
- Save search preferences per user
- Search history and suggestions

### Analytics Dashboard
- Track detailed usage metrics per prompt
- User engagement analytics
- Category popularity trends
- Admin analytics dashboard

### Prompt Versioning
- Track prompt edit history
- Allow reverting to previous versions
- Show diff between versions
- Version-based approval workflow
