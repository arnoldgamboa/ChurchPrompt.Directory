import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Star, 
  StarOff, 
  Calendar,
  User,
  Tag,
  FileText,
  Eye
} from 'lucide-react';
import { useAuth } from "@clerk/astro/react";

export const AdminBlogs: React.FC = () => {
  const allBlogs = useQuery(api.blogs.getAllBlogs);
  const auth = useAuth();
  const [selectedBlogId, setSelectedBlogId] = useState<Id<"blogs"> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    tags: [] as string[],
    status: 'draft',
    featured: false,
  });
  
  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const createBlog = useMutation(api.blogs.createBlog);
  const updateBlog = useMutation(api.blogs.updateBlog);
  const deleteBlogMutation = useMutation(api.blogs.deleteBlog);

  const selectedBlog = allBlogs?.find(b => b._id === selectedBlogId);
  
  const userName = (auth.sessionClaims as any)?.firstName || (auth.sessionClaims as any)?.username || 'Admin';
  const userId = auth.userId || '';

  const handleSelectBlog = (blogId: Id<"blogs">) => {
    const blog = allBlogs?.find(b => b._id === blogId);
    if (blog) {
      setSelectedBlogId(blogId);
      setIsEditing(false);
      setIsCreating(false);
      setFormData({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        metaDescription: blog.metaDescription,
        metaKeywords: blog.metaKeywords,
        tags: blog.tags,
        status: blog.status,
        featured: blog.featured || false,
      });
      setKeywordInput('');
      setTagInput('');
    }
  };

  const handleNewBlog = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedBlogId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      metaDescription: '',
      metaKeywords: [],
      tags: [],
      status: 'draft',
      featured: false,
    });
    setKeywordInput('');
    setTagInput('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      setIsCreating(false);
      setSelectedBlogId(null);
    } else if (selectedBlog) {
      setFormData({
        title: selectedBlog.title,
        slug: selectedBlog.slug,
        content: selectedBlog.content,
        excerpt: selectedBlog.excerpt,
        metaDescription: selectedBlog.metaDescription,
        metaKeywords: selectedBlog.metaKeywords,
        tags: selectedBlog.tags,
        status: selectedBlog.status,
        featured: selectedBlog.featured || false,
      });
      setKeywordInput('');
      setTagInput('');
    }
    setIsEditing(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug if creating new blog or slug hasn't been manually edited
      slug: isCreating || !prev.slug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.slug || !formData.content) {
        setActionMessage({ type: 'error', text: 'Title, slug, and content are required' });
        setTimeout(() => setActionMessage(null), 3000);
        return;
      }

      if (isCreating) {
        const blogId = await createBlog({
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          authorId: userId,
          authorName: userName,
          tags: formData.tags,
          status: formData.status,
          featured: formData.featured,
        });
        
        setActionMessage({ type: 'success', text: 'Blog created successfully!' });
        setIsCreating(false);
        setIsEditing(false);
        // Select the newly created blog
        setSelectedBlogId(blogId);
        setTimeout(() => setActionMessage(null), 2000);
      } else if (selectedBlogId) {
        await updateBlog({
          blogId: selectedBlogId,
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          metaDescription: formData.metaDescription,
          metaKeywords: formData.metaKeywords,
          tags: formData.tags,
          status: formData.status,
          featured: formData.featured,
        });

        setActionMessage({ type: 'success', text: 'Blog updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setActionMessage(null), 2000);
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
      setActionMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save blog' 
      });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleDelete = async (blogId: Id<"blogs">) => {
    const blog = allBlogs?.find(b => b._id === blogId);
    if (!blog) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${blog.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteBlogMutation({ blogId });
        setActionMessage({ type: 'success', text: 'Blog deleted successfully.' });
        setTimeout(() => {
          setActionMessage(null);
          setSelectedBlogId(null);
        }, 2000);
      } catch (error) {
        console.error('Failed to delete blog:', error);
        setActionMessage({ type: 'error', text: 'Failed to delete blog' });
        setTimeout(() => setActionMessage(null), 3000);
      }
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      if (!formData.metaKeywords.includes(newKeyword)) {
        setFormData(prev => ({
          ...prev,
          metaKeywords: [...prev.metaKeywords, newKeyword],
        }));
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(k => k !== keywordToRemove),
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!allBlogs) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading blogs...</p>
      </div>
    );
  }

  const draftCount = allBlogs.filter(b => b.status === 'draft').length;
  const publishedCount = allBlogs.filter(b => b.status === 'published').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Overview */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published Blogs</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-500" />
              {publishedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Edit2 className="h-6 w-6 text-yellow-500" />
              {draftCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Blog List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">All Blogs</h2>
          <Button onClick={handleNewBlog} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Blog
          </Button>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {allBlogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No blogs yet. Create your first blog post!</p>
              </CardContent>
            </Card>
          ) : (
            allBlogs.map((blog) => (
              <Card
                key={blog._id}
                className={`cursor-pointer hover:border-primary transition-colors ${
                  selectedBlogId === blog._id ? 'border-primary bg-accent' : ''
                }`}
                onClick={() => handleSelectBlog(blog._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <Badge 
                      variant={blog.status === 'published' ? 'default' : 'secondary'}
                      className="shrink-0 text-xs"
                    >
                      {blog.status}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-1 text-xs">
                      <User className="h-3 w-3" />
                      {blog.authorName}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(blog.createdAt)}
                    </div>
                    {blog.featured && (
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          {(selectedBlog || isCreating) ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {isCreating ? 'Create New Blog' : (isEditing ? 'Edit Blog' : 'Blog Details')}
                    </CardTitle>
                  </div>
                  {!isEditing && !isCreating && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {selectedBlog?.status === 'published' && (
                        <a href={`/blogs/${selectedBlog.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Action Message */}
                {actionMessage && (
                  <div
                    className={`p-4 rounded-lg border ${
                      actionMessage.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-700'
                        : 'bg-red-500/10 border-red-500/20 text-red-700'
                    }`}
                  >
                    <p className="text-sm font-medium">{actionMessage.text}</p>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Title *</label>
                  {isEditing || isCreating ? (
                    <Input
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Blog post title"
                      className="text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium">{formData.title}</p>
                  )}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Slug (URL) *</label>
                  {isEditing || isCreating ? (
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="url-friendly-slug"
                      className="font-mono text-sm"
                    />
                  ) : (
                    <p className="font-mono text-sm text-muted-foreground">/blogs/{formData.slug}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Content (Markdown) *</label>
                  {isEditing || isCreating ? (
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your blog content in Markdown format..."
                      className="min-h-[300px] font-mono text-sm"
                    />
                  ) : (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <pre className="text-sm whitespace-pre-wrap font-mono">{formData.content}</pre>
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Excerpt</label>
                  {isEditing || isCreating ? (
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief summary for blog listings..."
                      className="min-h-[80px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{formData.excerpt || 'No excerpt'}</p>
                  )}
                </div>

                {/* SEO: Meta Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">SEO Meta Description</label>
                  {isEditing || isCreating ? (
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="SEO description (150-160 characters recommended)"
                      className="min-h-[80px]"
                      maxLength={160}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">{formData.metaDescription || 'No meta description'}</p>
                  )}
                  {(isEditing || isCreating) && (
                    <p className="text-xs text-muted-foreground">
                      {formData.metaDescription.length}/160 characters
                    </p>
                  )}
                </div>

                {/* SEO: Keywords */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">SEO Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.metaKeywords.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="outline" 
                        className={isEditing || isCreating ? "cursor-pointer" : ""}
                        onClick={() => (isEditing || isCreating) && handleRemoveKeyword(keyword)}
                      >
                        {keyword}
                        {(isEditing || isCreating) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                    {(isEditing || isCreating) && (
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleAddKeyword}
                        placeholder="Add keyword (press Enter)"
                        className="max-w-[200px] h-6 text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className={isEditing || isCreating ? "cursor-pointer" : ""}
                        onClick={() => (isEditing || isCreating) && handleRemoveTag(tag)}
                      >
                        {tag}
                        {(isEditing || isCreating) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                    {(isEditing || isCreating) && (
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add tag (press Enter)"
                        className="max-w-[200px] h-6 text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Status</label>
                    {isEditing || isCreating ? (
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border bg-background"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    ) : (
                      <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                        {formData.status}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Featured</label>
                    {isEditing || isCreating ? (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Mark as featured</span>
                      </div>
                    ) : (
                      <div className="pt-2">
                        {formData.featured ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Featured</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata (if not creating) */}
                {!isCreating && selectedBlog && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Metadata</h3>
                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatDate(selectedBlog.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{formatDate(selectedBlog.updatedAt)}</span>
                      </div>
                      {selectedBlog.publishedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Published:</span>
                          <span>{formatDate(selectedBlog.publishedAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Author:</span>
                        <span>{selectedBlog.authorName}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing || isCreating ? (
                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-4">
                    <Button
                      className="flex-1"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? 'Create Blog' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => selectedBlogId && handleDelete(selectedBlogId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      Delete Permanently
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a blog from the list or create a new one</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};
