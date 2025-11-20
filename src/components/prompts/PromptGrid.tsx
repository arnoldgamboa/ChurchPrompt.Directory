import PromptCard from "./PromptCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileQuestion } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  usageCount: number;
  executionCount: number;
  tags: string[];
}

interface PromptGridProps {
  prompts: Prompt[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onCopy?: (id: string) => void;
  onSave?: (id: string) => void;
  onView?: (id: string) => void;
  favoriteIds?: string[];
}

function PromptCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  message,
  description,
}: {
  message: string;
  description?: string;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md">{description}</p>
      )}
    </div>
  );
}

export default function PromptGrid({
  prompts,
  isLoading = false,
  emptyMessage = "No prompts found",
  emptyDescription = "Try adjusting your filters or search terms to find what you're looking for.",
  onCopy,
  onSave,
  onView,
  favoriteIds = [],
}: PromptGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (prompts.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState message={emptyMessage} description={emptyDescription} />
      </div>
    );
  }

  // Grid with prompts
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onCopy={onCopy}
          onSave={onSave}
          onView={onView}
          isFavorite={favoriteIds.includes(prompt.id)}
        />
      ))}
    </div>
  );
}
