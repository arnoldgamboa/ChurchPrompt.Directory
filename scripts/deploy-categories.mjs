#!/usr/bin/env node
/**
 * Deploy categories.json to Convex production using internal mutation
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const categoriesData = JSON.parse(readFileSync('src/data/categories.json', 'utf-8'));

console.log(`📦 Deploying ${categoriesData.length} categories to Convex production...`);

// Prepare the args object for the mutation
const args = { categories: categoriesData };

// Write to temp file for convex run command
const tempFile = '/tmp/convex-categories-payload.json';
writeFileSync(tempFile, JSON.stringify(args));

try {
  // Run the internal mutation via Convex CLI with --prod flag
  const result = execSync(
    `npx convex run migrations:bulkInsertCategories '${JSON.stringify(args).replace(/'/g, "'\\''")}' --prod`,
    { encoding: 'utf-8', stdio: 'inherit' }
  );
  
  console.log('✅ Successfully deployed categories to production!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
