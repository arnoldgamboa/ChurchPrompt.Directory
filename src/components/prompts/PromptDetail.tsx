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
  initialPrompt?: any; // build-time provided prompt data for SSG hydration
}

export default function PromptDetail({
  promptId,
  onSave,
  onRun,
  isSubscribed = false,
  isFavorite = false,
  initialPrompt,
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
  const effectivePrompt = prompt === undefined && initialPrompt ? initialPrompt : prompt;
  
  // Mutation for incrementing usage count
  const incrementUsage = useMutation(api.prompts.incrementUsageCount);
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  const handleCopy = async () => {
    if (!effectivePrompt) return;
    
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
  if (prompt === undefined && initialPrompt) {
    // Render immediately using initialPrompt while Convex hydrates
    return (
      <HydratedPromptView prompt={initialPrompt} copied={copied} saved={saved} onCopy={handleCopy} onSave={handleSave} onRun={handleRun} isSubscribed={isSubscribed} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userIsAdmin={userIsAdmin} promptId={promptId} handleEdit={handleEdit} handleDelete={handleDelete} />
    );
  }

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
  if (effectivePrompt === null) {
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
  const categoryDisplay = effectivePrompt.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Format date
  const createdDate = new Date(effectivePrompt._creationTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <HydratedPromptView prompt={effectivePrompt} copied={copied} saved={saved} onCopy={handleCopy} onSave={handleSave} onRun={handleRun} isSubscribed={isSubscribed} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} userIsAdmin={userIsAdmin} promptId={promptId} handleEdit={handleEdit} handleDelete={handleDelete} createdDate={createdDate} />;
}

// Extracted view component for reuse with initialPrompt fallback
function HydratedPromptView({
  prompt,
  copied,
  saved,
  onCopy,
  onSave,
  onRun,
  isSubscribed,
  isModalOpen,
  setIsModalOpen,
  userIsAdmin,
  promptId,
  handleEdit,
  handleDelete,
  createdDate,
}: any) {
  const categoryDisplay = prompt.category
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return (
    <div className="space-y-6">
      <div className="space-y-4" style={{ animation: 'slideUpFadeIn 0.6s ease-out' }}>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{categoryDisplay}</Badge>
          {prompt.featured && (
            <Badge variant="default" className="ml-2">
              Featured
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">by {prompt.authorName}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{prompt.title}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div style={{ animation: 'slideUpFadeIn 0.6s ease-out 0.2s both' }}>
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Prompt Content</h3>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">{prompt.content}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
          {prompt.tags.length > 0 && (
            <div className="space-y-3" style={{ animation: 'slideUpFadeIn 0.6s ease-out 0.3s both' }}>
              <h3 className="text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <TooltipProvider>
            <Card className="p-4" style={{ animation: 'slideUpFadeIn 0.6s ease-out 0.1s both' }}>
              <div className="space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onCopy} variant="ghost" size="sm" className="w-full justify-start text-sm">
                      <Copy className="mr-3 h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy prompt to clipboard</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onSave} variant="ghost" size="sm" className="w-full justify-start text-sm">
                      <Heart className={`mr-3 h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                      {saved ? 'Remove from Favorites' : 'Save to Favorites'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{saved ? 'Remove from favorites' : 'Save to favorites'}</TooltipContent>
                </Tooltip>
                {isSubscribed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button disabled variant="ghost" size="sm" className="w-full justify-start text-sm text-primary cursor-not-allowed" aria-disabled="true">
                        <Play className="mr-3 h-4 w-4" />
                        Run with AI
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Temporarily disabled</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start text-sm text-primary">
                        <a href="/subscribe">
                          <Play className="mr-3 h-4 w-4" />
                          Upgrade to Run
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Subscribe to execute prompts with AI</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </Card>
          </TooltipProvider>
          {userIsAdmin && (
            <TooltipProvider>
              <Card className="p-4 border-orange-200 bg-orange-50/50">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-orange-900 px-2">Admin Tools</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleEdit} className="w-full justify-start text-sm">
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Prompt
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit this prompt</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleDelete} className="w-full justify-start text-sm text-destructive hover:text-destructive">
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete Prompt
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this prompt</TooltipContent>
                  </Tooltip>
                </div>
              </Card>
            </TooltipProvider>
          )}
          <Card className="p-4" style={{ animation: 'slideUpFadeIn 0.6s ease-out 0.2s both' }}>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Usage</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{prompt.usageCount}</span>
                  <span className="text-xs text-muted-foreground">copies</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Executions</p>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{prompt.executionCount}</span>
                  <span className="text-xs text-muted-foreground">times</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Added</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{createdDate}</span>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-dashed bg-muted/20" style={{ animation: 'slideUpFadeIn 0.6s ease-out 0.3s both' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Replace bracketed placeholders with your specific details before using.</p>
          </Card>
        </div>
      </div>
      <ExecutionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} promptTitle={prompt.title} promptContent={prompt.content} />
    </div>
  );
}
