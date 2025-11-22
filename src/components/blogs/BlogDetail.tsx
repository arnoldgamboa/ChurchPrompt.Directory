import React, { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogDetailProps {
  slug: string;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ slug }) => {
  const blog = useQuery(api.blogs.getBlogBySlug, { slug });

  // Update document title and meta tags when blog loads
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | Church Prompt Directory`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blog.metaDescription || blog.excerpt);
      }
      
      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', blog.metaKeywords.join(', '));
    }
  }, [blog]);

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (blog === undefined) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (blog === null) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Blog Post Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <a href="/blogs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <a href="/blogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </a>
        </div>

        <article>
          {/* Header */}
          <header className="mb-8">
            {blog.featured && (
              <Badge variant="default" className="mb-4">
                Featured
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(blog.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blog.authorName}
              </span>
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4 py-2">
                {blog.excerpt}
              </p>
            )}
          </header>

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="prose prose-slate dark:prose-invert max-w-none pt-6">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="ml-4" {...props} />,
                  a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4 text-muted-foreground" {...props} />
                  ),
                  code: ({inline, className, children, ...props}: { inline?: boolean; className?: string; children?: React.ReactNode }) => 
                    inline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                    ) : (
                      <code className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4" {...props}>{children}</code>
                    ),
                  pre: ({node, ...props}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4" />
                Tags:
              </span>
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer navigation */}
          <div className="mt-12 pt-8 border-t">
            <a href="/blogs">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Button>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
};
