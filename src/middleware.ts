import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/submit(.*)',
  '/admin(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { userId, redirectToSignIn } = auth();

  // If the route is protected and user is not signed in, redirect to sign-in
  if (isProtectedRoute(context.request) && !userId) {
    return redirectToSignIn();
  }

  // For admin routes, check if user has admin role from Convex database
  if (isAdminRoute(context.request)) {
    if (!userId) {
      return redirectToSignIn();
    }

    // Fetch user role from Convex
    const convexUrl = context.locals.runtime?.env?.PUBLIC_CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL;
    
    if (convexUrl) {
      try {
        const response = await fetch(`${convexUrl}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: 'users:getUserByClerkId',
            args: { clerkId: userId },
            format: 'json',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const user = result.value;
          
          if (!user || user.role !== 'admin') {
            return context.redirect('/?error=unauthorized');
          }
        } else {
          // If query fails, deny access
          return context.redirect('/?error=unauthorized');
        }
      } catch (error) {
        console.error('[Middleware] Error checking admin role:', error);
        return context.redirect('/?error=unauthorized');
      }
    }
  }

  // Continue to the requested page
  return next();
});
