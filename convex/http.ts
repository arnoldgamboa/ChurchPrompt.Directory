import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { handleClerkWebhook } from "./webhooks";
import { handleSeedMigration } from "./migrate_http";

const http = httpRouter();

// Test endpoint
http.route({
  path: "/test",
  method: "GET",
  handler: httpAction(async () => {
    return new Response("Hello from Convex HTTP!");
  }),
});

// Clerk webhook endpoint
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

// Migration seeding endpoint (guarded by MIGRATION_SECRET)
http.route({
  path: "/migrate/seed",
  method: "POST",
  handler: handleSeedMigration,
});

export default http;
