import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useAuth as useClerkAuth } from "@clerk/astro/react";
import { AdminBlogs } from './AdminBlogs';

interface AdminBlogsWithProviderProps {
  convexUrl: string;
}

export const AdminBlogsWithProvider: React.FC<AdminBlogsWithProviderProps> = ({ convexUrl }) => {
  const convex = React.useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  // Custom hook to bridge Clerk auth with Convex
  function useAuth() {
    const clerkAuth = useClerkAuth();
    return React.useMemo(
      () => ({
        isLoading: !clerkAuth.isLoaded,
        isAuthenticated: clerkAuth.isLoaded && !!clerkAuth.userId,
      }),
      [clerkAuth.isLoaded, clerkAuth.userId]
    );
  }

  return (
    <ConvexProvider client={convex}>
      <AdminBlogs />
    </ConvexProvider>
  );
};
