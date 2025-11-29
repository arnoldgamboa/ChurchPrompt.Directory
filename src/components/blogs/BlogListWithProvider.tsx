import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { BlogList } from './BlogList';

interface BlogListWithProviderProps {
  convexUrl: string;
}

export const BlogListWithProvider: React.FC<BlogListWithProviderProps> = ({ convexUrl }) => {
  const convex = React.useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexProvider client={convex}>
      <BlogList />
    </ConvexProvider>
  );
};
