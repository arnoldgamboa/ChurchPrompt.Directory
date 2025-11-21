#!/usr/bin/env node
/**
 * Deploy prompts-prod.json to Convex production using internal mutation
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const promptsData = JSON.parse(readFileSync('src/data/prompts-prod.json', 'utf-8'));

console.log(`📦 Deploying ${promptsData.length} prompts to Convex production...`);

// Prepare the args object for the mutation
const args = { prompts: promptsData };

// Write to temp file for convex run command
const tempFile = '/tmp/convex-prompts-payload.json';
writeFileSync(tempFile, JSON.stringify(args));

try {
  // Run the internal mutation via Convex CLI with --prod flag
  const result = execSync(
    `npx convex run migrations:bulkInsertPrompts '${JSON.stringify(args).replace(/'/g, "'\\''")}' --prod`,
    { encoding: 'utf-8', stdio: 'inherit' }
  );
  
  console.log('✅ Successfully deployed prompts to production!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
