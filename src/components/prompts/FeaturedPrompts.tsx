import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import PromptGrid from "./PromptGrid";

interface FeaturedPromptsProps {
  convexUrl: string;
}

function FeaturedPromptsContent() {
  // Fetch featured prompts from Convex
  const prompts = useQuery(api.prompts.getApprovedPrompts, { limit: 6 });
  
  // Filter for featured prompts
  const featuredPrompts = prompts?.filter((p: any) => p.featured) || [];

  return <PromptGrid prompts={featuredPrompts} />;
}

export function FeaturedPrompts({ convexUrl }: FeaturedPromptsProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <FeaturedPromptsContent />
    </ConvexClientProvider>
  );
}
