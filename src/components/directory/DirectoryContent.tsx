import React, { useState, useMemo } from 'react';
import { Sidebar, type Category } from './Sidebar';
import PromptGrid from '@/components/prompts/PromptGrid';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: string;
  usageCount: number;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DirectoryContentProps {
  initialPrompts: Prompt[];
  categories: Category[];
}

export const DirectoryContent: React.FC<DirectoryContentProps> = ({
  initialPrompts,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('q');

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Update URL when state changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (searchQuery) {
      params.set('q', searchQuery);
    }

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    
    window.history.replaceState({}, '', newUrl);
  }, [selectedCategories, searchQuery]);

  // Filter prompts based on search and category filters
  const filteredPrompts = useMemo(() => {
    let results = initialPrompts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((prompt) => {
        const titleMatch = prompt.title.toLowerCase().includes(query);
        const excerptMatch = prompt.excerpt.toLowerCase().includes(query);
        const contentMatch = prompt.content.toLowerCase().includes(query);
        const tagsMatch = prompt.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

        return titleMatch || excerptMatch || contentMatch || tagsMatch;
      });
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      results = results.filter((prompt) =>
        selectedCategories.includes(prompt.category)
      );
    }

    return results;
  }, [initialPrompts, searchQuery, selectedCategories]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Sidebar
        categories={categories}
        searchQuery={searchQuery}
        selectedCategories={selectedCategories}
        onSearchChange={setSearchQuery}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
        resultCount={filteredPrompts.length}
      />

      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Prompts</h1>
          <p className="text-muted-foreground">
            Explore our collection of {initialPrompts.length} church ministry prompts
          </p>
        </div>

        <PromptGrid prompts={filteredPrompts} isLoading={false} />
      </div>
    </div>
  );
};
