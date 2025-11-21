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

export const DirectoryContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<string>(''); // '' = default heuristic

  // Fetch data from Convex
  const categoriesData = useQuery(api.categories.getCategories);
  const prompts = useQuery(api.prompts.getApprovedPrompts, {
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    search: searchQuery || undefined,
    sort: sort === 'popular' ? 'usage' : sort || undefined,
  });

  // Loading and error states
  const isLoading = prompts === undefined || categoriesData === undefined;
  const promptList = prompts || [];
  const categories: Category[] = categoriesData?.map(cat => ({
    id: cat.categoryId,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    promptCount: cat.promptCount
  })) || [];

  // Initialize from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('q');
    const sortParam = params.get('sort');

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    if (searchParam) setSearchQuery(searchParam);
    if (sortParam) setSort(sortParam);
  }, []);

  // Update URL when state changes
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','));
    }
    if (searchQuery) params.set('q', searchQuery);
    if (sort) params.set('sort', sort);

    const newUrl = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ''
    }`;
    
    window.history.replaceState({}, '', newUrl);
  }, [selectedCategories, searchQuery, sort]);

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
    setSort('');
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
        <div className="mb-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Prompts</h1>
            <p className="text-muted-foreground">
              {isLoading
                ? 'Loading prompts...'
                : `Explore our collection of ${promptList.length} church ministry prompts`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" htmlFor="sortSelect">
              Sort
            </label>
            <select
              id="sortSelect"
              className="border rounded px-2 py-1 text-sm bg-background"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Default</option>
              <option value="popular">Popularity</option>
              <option value="recent">Recent</option>
              <option value="featured">Featured</option>
            </select>
            {sort && (
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {sort === 'popular'
                  ? 'Sorting by popularity'
                  : sort === 'recent'
                  ? 'Sorting by most recent'
                  : sort === 'featured'
                  ? 'Sorting by featured'
                  : null}
              </span>
            )}
          </div>
        </div>

        <PromptGrid prompts={filteredPrompts} isLoading={isLoading} />
      </div>
    </div>
  );
};
