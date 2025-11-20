import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const handleSeedMigration = httpAction(async (ctx, request) => {
  const secret = process.env.MIGRATION_SECRET;
  if (!secret) return new Response("Missing MIGRATION_SECRET", { status: 500 });

  const provided = request.headers.get("x-seed-secret");
  if (!provided || provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { categories = [], users = [], prompts = [] } = body || {};

  try {
    if (categories.length) {
      await ctx.runMutation(internal.migrations.bulkInsertCategories, { categories });
    }
    if (users.length) {
      await ctx.runMutation(internal.migrations.bulkInsertUsers, { users });
    }
    if (prompts.length) {
      await ctx.runMutation(internal.migrations.bulkInsertPrompts, { prompts });
    }
    return new Response(
      JSON.stringify({ ok: true, counts: { categories: categories.length, users: users.length, prompts: prompts.length } }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    const message = e?.message || 'Migration error';
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});
