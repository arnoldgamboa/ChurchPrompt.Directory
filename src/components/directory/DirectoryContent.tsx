import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
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
  categories: Category[];
}

export const DirectoryContent: React.FC<DirectoryContentProps> = ({
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch prompts from Convex
  const prompts = useQuery(api.prompts.getApprovedPrompts, {
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    search: searchQuery || undefined,
  });

  // Loading and error states
  const isLoading = prompts === undefined;
  const promptList = prompts || [];

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

  // Client-side filtering for multiple categories (Convex query only supports one category)
  const filteredPrompts = useMemo(() => {
    if (selectedCategories.length <= 1) {
      return promptList;
    }

    // Filter by multiple categories on client side
    return promptList.filter((prompt: any) =>
      selectedCategories.includes(prompt.category)
    );
  }, [promptList, selectedCategories]);

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
            {isLoading 
              ? 'Loading prompts...' 
              : `Explore our collection of ${promptList.length} church ministry prompts`
            }
          </p>
        </div>

        <PromptGrid prompts={filteredPrompts} isLoading={isLoading} />
      </div>
    </div>
  );
};
