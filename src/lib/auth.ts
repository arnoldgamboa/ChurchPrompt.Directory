import type { AstroGlobal } from 'astro';

// Helper to extract auth context in Astro server-side code.
// Returns null if not authenticated, otherwise returns auth data
export async function requireAuth(Astro: AstroGlobal) {
  try {
    // Clerk middleware sets auth() function in locals
    const authFn = (Astro.locals as any).auth;
    
    if (!authFn || typeof authFn !== 'function') {
      return null;
    }
    
    const authData = await authFn();
    
    if (!authData?.userId) {
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
