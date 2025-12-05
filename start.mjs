#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envLocalPath = path.join(__dirname, '.env.local');

// Load .env.local into process.env BEFORE importing anything
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex !== -1) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  }
  
  console.log('✓ Loaded environment variables from .env.local');
}

// Verify required Clerk variables
if (!process.env.CLERK_SECRET_KEY) {
  console.error('✗ CLERK_SECRET_KEY not found in environment');
  process.exit(1);
}

if (!process.env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.error('✗ PUBLIC_CLERK_PUBLISHABLE_KEY not found in environment');
  process.exit(1);
}

console.log('✓ Clerk environment variables configured');
console.log('✓ Starting server...');

// Start the Astro Node.js server
await import('./dist/server/entry.mjs');


