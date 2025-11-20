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

  // For admin routes, check if user has admin role
  if (isAdminRoute(context.request)) {
    if (!userId) {
      return redirectToSignIn();
    }

    // Get user's role from public metadata
    const { sessionClaims } = auth();
    const role = sessionClaims?.metadata?.role as string | undefined;

    // If user is not an admin, redirect to home with error
    if (role !== 'admin') {
      return context.redirect('/?error=unauthorized');
    }
  }

  // Continue to the requested page
  return next();
});
