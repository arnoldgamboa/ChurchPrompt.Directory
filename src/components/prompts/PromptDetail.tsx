import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Heart, Play, TrendingUp, Eye, Calendar } from "lucide-react";
import { useState } from "react";
import { ExecutionModal } from "./ExecutionModal";

interface PromptDetailProps {
  prompt: {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    authorName: string;
    authorId: string;
    usageCount: number;
    executionCount: number;
    createdAt: string;
  };
  onCopy?: () => void;
  onSave?: () => void;
  onRun?: () => void;
  isSubscribed?: boolean;
  isFavorite?: boolean;
}

export default function PromptDetail({
  prompt,
  onCopy,
  onSave,
  onRun,
  isSubscribed = false,
  isFavorite = false,
}: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(isFavorite);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    onCopy?.();
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

  // Format category for display
  const categoryDisplay = prompt.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Format date
  const createdDate = new Date(prompt.createdAt).toLocaleDateString("en-US", {
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
                <Button variant="secondary" disabled>
                  <Play className="mr-2 h-4 w-4" />
                  Subscribe to Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Premium feature - Subscribe to run prompts</p>
              </TooltipContent>
            </Tooltip>
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
