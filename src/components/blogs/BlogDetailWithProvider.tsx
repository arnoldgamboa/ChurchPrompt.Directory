import React from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { BlogDetail } from './BlogDetail';

interface BlogDetailWithProviderProps {
  convexUrl: string;
  slug?: string;
}

export const BlogDetailWithProvider: React.FC<BlogDetailWithProviderProps> = ({ convexUrl, slug }) => {
  const convex = React.useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);

  return (
    <ConvexProvider client={convex}>
      <BlogDetail slug={slug || ''} />
    </ConvexProvider>
  );
};
