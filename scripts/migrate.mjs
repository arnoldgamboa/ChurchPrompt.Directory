#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const SEED_URL = process.env.SEED_URL; // e.g. https://<convex-id>.convex.site
const SEED_SECRET = process.env.SEED_SECRET; // must match MIGRATION_SECRET set in Convex env

if (!SEED_URL || !SEED_SECRET) {
  console.error('Missing SEED_URL or SEED_SECRET env vars.');
  console.error('Usage: SEED_URL=https://<convex-url> SEED_SECRET=... npm run migrate:seed');
  process.exit(1);
}

async function loadJson(path) {
  const buf = await readFile(path, 'utf8');
  return JSON.parse(buf);
}

async function main() {
  const [categories, users, prompts] = await Promise.all([
    loadJson('./src/data/categories.json'),
    loadJson('./src/data/users.json'),
    loadJson('./src/data/prompts.json'),
  ]);

  const target = `${SEED_URL.replace(/\/$/, '')}/migrate/seed`;
  console.log('Seeding to:', target);
  const res = await fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-seed-secret': SEED_SECRET,
    },
    body: JSON.stringify({ categories, users, prompts }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404) {
      console.error('Migration failed: 404 Not Found. Likely the deployment does not have /migrate/seed yet. Run `npm run convex:deploy` then retry.');
    } else if (res.status === 401) {
      console.error('Migration failed: 401 Unauthorized. Check MIGRATION_SECRET set via `npx convex env set MIGRATION_SECRET <secret>` and SEED_SECRET match.');
    } else {
      console.error('Migration failed:', res.status, text);
    }
    process.exit(1);
  }

  const json = await res.json();
  console.log('Migration success:', json);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
