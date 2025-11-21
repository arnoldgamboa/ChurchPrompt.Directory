import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Heart, Play, TrendingUp, Eye, Calendar, Edit, Trash2, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ExecutionModal } from "./ExecutionModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/astro/react";
import { isAdmin } from "@/lib/roleUtils";

interface PromptDetailProps {
  promptId: string;
  onSave?: () => void;
  onRun?: () => void;
  isSubscribed?: boolean;
  isFavorite?: boolean;
}

export default function PromptDetail({
  promptId,
  onSave,
  onRun,
  isSubscribed = false,
  isFavorite = false,
}: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(isFavorite);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current user auth state
  const { userId } = useAuth();
  
  // Fetch current user from Convex to check role
  const currentUser = useQuery(api.users.getCurrentUser);
  const userIsAdmin = isAdmin(currentUser?.role);

  // Fetch prompt data from Convex
  const prompt = useQuery(api.prompts.getPromptById, { id: promptId as any });
  
  // Mutation for incrementing usage count
  const incrementUsage = useMutation(api.prompts.incrementUsageCount);
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  const handleCopy = async () => {
    if (!prompt) return;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(prompt.content);
    
    // Track usage in Convex
    try {
      await incrementUsage({ id: promptId as any });
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  const handleRun = () => {
    setIsModalOpen(true);
    onRun?.();
  };

  const handleEdit = () => {
    // Redirect to admin page with this prompt selected
    window.location.href = `/admin?promptId=${promptId}`;
  };

  const handleDelete = async () => {
    if (!prompt) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${prompt.title}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await deletePrompt({ promptId: promptId as any });
        window.location.href = '/admin';
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };

  // Loading state
  if (prompt === undefined) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state - prompt not found
  if (prompt === null) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Prompt Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The prompt you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <a href="/directory">Browse All Prompts</a>
        </Button>
      </Card>
    );
  }

  // Format category for display
  const categoryDisplay = prompt.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Format date
  const createdDate = new Date(prompt._creationTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{categoryDisplay}</Badge>
          {prompt.featured && (
            <Badge variant="default" className="ml-2">
              Featured
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            by {prompt.authorName}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {prompt.title}
        </h1>
      </div>

      {/* Action Buttons */}
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleCopy} variant="default">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy Prompt"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy prompt to clipboard</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} variant="outline">
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    saved ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {saved ? "Saved" : "Save"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saved ? "Remove from favorites" : "Save to favorites"}</p>
            </TooltipContent>
          </Tooltip>
          
          {isSubscribed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleRun} variant="secondary">
                  <Play className="mr-2 h-4 w-4" />
                  Run Prompt
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute prompt with AI</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="secondary">
                  <a href="/subscribe">
                    <Play className="mr-2 h-4 w-4" />
                    Upgrade to Run
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Subscribe to execute prompts with AI</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Admin Actions */}
          {userIsAdmin && (
            <>
              <div className="h-6 w-px bg-border" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit this prompt (Admin)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete this prompt (Admin)</p>
                </TooltipContent>
              </Tooltip>
              
              <Badge variant="default" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Admin View
              </Badge>
            </>
          )}
        </div>
      </TooltipProvider>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>{prompt.usageCount} copies</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{prompt.executionCount} executions</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Added {createdDate}</span>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-semibold mb-3">Prompt Content</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">
              {prompt.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-2">How to use this prompt</h3>
          <p className="text-sm text-muted-foreground">
            Copy this prompt and paste it into your preferred AI tool, replacing
            any bracketed placeholders with your specific information. For
            subscribed users, you can run this prompt directly in-app with our
            AI integration.
          </p>
        </CardContent>
      </Card>

      {/* Execution Modal */}
      <ExecutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        promptTitle={prompt.title}
        promptContent={prompt.content}
      />
    </div>
  );
}
