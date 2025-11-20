import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Heart, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    authorName: string;
    usageCount: number;
    executionCount: number;
    tags: string[];
  };
  onCopy?: (id: string) => void;
  onSave?: (id: string) => void;
  onView?: (id: string) => void;
  isFavorite?: boolean;
}

export default function PromptCard({
  prompt,
  onCopy,
  onSave,
  onView,
  isFavorite = false,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(isFavorite);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
    setSaved(savedPrompts.includes(prompt.id));
  }, [prompt.id]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    onCopy?.(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedState = !saved;
    setSaved(newSavedState);
    
    // Update localStorage
    const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
    if (newSavedState) {
      savedPrompts.push(prompt.id);
    } else {
      const index = savedPrompts.indexOf(prompt.id);
      if (index > -1) savedPrompts.splice(index, 1);
    }
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
    
    onSave?.(prompt.id);
  };

  // Format category for display
  const categoryDisplay = prompt.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <a href={`/directory/${prompt.id}`} className="block">
      <Card className="card-hover cursor-pointer group h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {categoryDisplay}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{prompt.usageCount}</span>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
          {prompt.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {prompt.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Author and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              by {prompt.authorName}
            </span>
            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className={`h-4 w-4 ${copied ? "text-primary" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy prompt"}</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSave}
                      className="h-8 w-8 p-0"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          saved ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{saved ? "Remove from favorites" : "Save to favorites"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
    </a>
  );
}
