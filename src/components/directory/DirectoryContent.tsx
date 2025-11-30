import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { DirectoryBootData } from '../../../convex/directory';
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

export const DirectoryContent: React.FC<{ initialPrompts?: any[]; initialBootData?: DirectoryBootData | null }> = ({ initialPrompts, initialBootData }) => {
  const BOOT_CACHE_KEY = 'directoryBootData';
  const BOOT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes freshness
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<string>(''); // '' = default heuristic

  // Boot data: categories + recent prompts (single aggregated query)
  const bootData: DirectoryBootData | undefined = useQuery(api.directory.getDirectoryBootData);
  const [cachedBootData, setCachedBootData] = React.useState<DirectoryBootData | null>(null);

  // Load cached boot data on mount if fresh
  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(BOOT_CACHE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && typeof parsed.ts === 'number') {
        const age = Date.now() - parsed.ts;
        if (age < BOOT_CACHE_TTL_MS) {
          setCachedBootData(parsed.data as DirectoryBootData);
        }
      }
    } catch (_) {
      // ignore malformed cache
    }
  }, []);

  // Persist fresh boot data when query resolves
  React.useEffect(() => {
    if (bootData) {
      try {
        window.localStorage.setItem(BOOT_CACHE_KEY, JSON.stringify({ data: bootData, ts: Date.now() }));
        setCachedBootData(bootData);
      } catch (_) {
        // storage may be unavailable
      }
    }
  }, [bootData]);
  const prompts = useQuery(api.prompts.getApprovedPrompts, {
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    search: searchQuery || undefined,
    sort: sort === 'popular' ? 'usage' : sort || undefined,
  });

  // Loading and error states
  const effectiveBoot = bootData || cachedBootData || initialBootData || null;
  const isLoading = prompts === undefined && !initialPrompts || !effectiveBoot;
  const promptList = prompts === undefined && initialPrompts ? initialPrompts : (prompts || []);
  const newestList = effectiveBoot?.recentPrompts || [];
  const categories: Category[] = effectiveBoot?.categories?.map(cat => ({
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
          {/* Newest Submitted Prompts section - only show when no filters/search are active */}
          {selectedCategories.length === 0 && !searchQuery && !sort && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Newest Submitted Prompts</h2>
              <p className="text-sm text-muted-foreground mb-4">Recently added submissions from the community</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {newestList.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No recent submissions.</div>
                ) : (
                  newestList.map((p: any, idx: number) => (
                    <a
                      key={p.id}
                      href={`/directory/${p.id}`}
                      className="block p-3 border rounded-md hover:shadow-sm bg-card"
                      style={{ animation: `slideUpFadeIn 0.6s ease-out ${idx * 0.1}s both` }}
                    >
                      <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.excerpt}</div>
                      <div className="text-xs text-muted-foreground mt-2">By {p.authorName || 'Anonymous'}</div>
                    </a>
                  ))
                )}
              </div>

              <div className="border-b mt-4" />
            </div>
          )}
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
