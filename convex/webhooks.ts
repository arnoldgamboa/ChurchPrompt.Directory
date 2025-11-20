import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

function extractPrimaryEmail(data: any): string | null {
  try {
    const primaryId: string | undefined = data?.primary_email_address_id;
    const emails: any[] = data?.email_addresses ?? [];
    if (!primaryId && emails.length > 0) return emails[0]?.email_address ?? null;
    const found = emails.find((e) => e.id === primaryId);
    return found?.email_address ?? null;
  } catch {
    return null;
  }
}

function buildName(data: any): string {
  const first = data?.first_name ?? "";
  const last = data?.last_name ?? "";
  const combined = `${first} ${last}`.trim();
  return combined || data?.username || data?.email_addresses?.[0]?.email_address || "User";
}

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const payload = await request.text();
  const headers = request.headers;
  const msgId = headers.get("svix-id");
  const msgTimestamp = headers.get("svix-timestamp");
  const msgSignature = headers.get("svix-signature");

  if (!msgId || !msgTimestamp || !msgSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  let evt: any;
  try {
    const wh = new Webhook(secret);
    wh.verify(payload, {
      "svix-id": msgId,
      "svix-timestamp": msgTimestamp,
      "svix-signature": msgSignature,
    });
    evt = JSON.parse(payload);
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const type: string = evt?.type ?? "";
    const data: any = evt?.data ?? {};
    const clerkId: string | undefined = data?.id;

    if (!clerkId) {
      return new Response("Missing user id", { status: 400 });
    }

    if (type === "user.created") {
      const email = extractPrimaryEmail(data) ?? "";
      const name = buildName(data);
      await ctx.runMutation(internal.users.createUser, {
        clerkId,
        name,
        email,
      });
    } else if (type === "user.updated") {
      const email = extractPrimaryEmail(data) ?? undefined;
      const name = buildName(data);
      await ctx.runMutation(internal.users.updateUser, {
        clerkId,
        name,
        email,
      });
    } else if (type === "user.deleted") {
      await ctx.runMutation(internal.users.deleteUser, { clerkId });
    } else {
      // Ignore unrelated events
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    return new Response("Webhook processing error", { status: 500 });
  }
});
