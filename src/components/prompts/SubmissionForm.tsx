import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface SubmissionFormProps {
  categories: Category[];
}

interface FormErrors {
  title?: string;
  content?: string;
  category?: string;
  tags?: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ categories }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (!content.trim()) {
      newErrors.content = 'Prompt content is required';
    } else if (content.length < 50) {
      newErrors.content = 'Prompt content must be at least 50 characters';
    } else if (content.length > 2000) {
      newErrors.content = 'Prompt content must not exceed 2000 characters';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      const newTag = tagsInput.trim().toLowerCase();
      
      if (!tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
        setTagsInput('');
        setErrors({ ...errors, tags: undefined });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setTitle('');
      setContent('');
      setCategory('');
      setTags([]);
      setTagsInput('');
      setErrors({});
      setIsSuccess(false);
    }, 3000);
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Prompt Submitted Successfully!</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Thank you for contributing to the community. Your prompt has been submitted for review and will be published once approved by our team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a New Prompt</CardTitle>
        <CardDescription>
          Share your expertise with the community by submitting a prompt. All submissions are reviewed before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Prompt Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Expository Sermon Outline Creator"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={errors.title ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              A clear, descriptive title that summarizes what your prompt does (10-100 characters)
            </p>
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors({ ...errors, category: undefined });
              }}
              className={`flex h-10 w-full rounded-md border ${
                errors.category ? 'border-red-500' : 'border-input'
              } bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose the category that best fits your prompt
            </p>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              placeholder="Write your prompt here. Be specific and include any placeholders in [BRACKETS] for users to replace with their own content..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({ ...errors, content: undefined });
              }}
              rows={8}
              className={`flex w-full rounded-md border ${
                errors.content ? 'border-red-500' : 'border-input'
              } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Provide detailed instructions and context. Use [PLACEHOLDERS] for customizable parts (50-2000 characters)
              </p>
              <span className="text-xs text-muted-foreground">
                {content.length}/2000
              </span>
            </div>
            {errors.content && (
              <p className="text-xs text-red-500">{errors.content}</p>
            )}
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags <span className="text-red-500">*</span>
            </label>
            <Input
              id="tags"
              type="text"
              placeholder="Type a tag and press Enter..."
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onKeyDown={handleAddTag}
              className={errors.tags ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Add relevant keywords to help users find your prompt (1-5 tags)
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-xs text-red-500">{errors.tags}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Prompt'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle('');
                setContent('');
                setCategory('');
                setTags([]);
                setTagsInput('');
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
