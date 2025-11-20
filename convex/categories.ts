import { query } from "./_generated/server";

// Query: getCategories (Requirements: 7.5 supporting category display; 3.1 profile stats basis)
export const getCategories = query({
  args: {},
  handler: async ({ db }) => {
    const docs = await db.query("categories").collect();
    return docs.sort((a: any, b: any) => a.name.localeCompare(b.name));
  },
});
