import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptCount: number;
}

interface SidebarProps {
  categories: Category[];
  searchQuery: string;
  selectedCategories: string[];
  onSearchChange: (query: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  searchQuery,
  selectedCategories,
  onSearchChange,
  onCategoryToggle,
  onClearFilters,
  resultCount,
}) => {
  const hasActiveFilters = searchQuery || selectedCategories.length > 0;

  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* Search Bar */}
      <div className="space-y-2">
        <label htmlFor="search" className="text-sm font-medium">
          Search Prompts
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by title, tag, or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Categories</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <label
                key={category.id}
                className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onCategoryToggle(category.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.promptCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Active Filters & Results */}
      {hasActiveFilters && (
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Filters</span>
            <span className="text-xs text-muted-foreground">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}

            {selectedCategories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              if (!category) return null;

              return (
                <Badge key={categoryId} variant="secondary" className="gap-1">
                  {category.name}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-foreground"
                    onClick={() => onCategoryToggle(categoryId)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
