import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import PromptDetail from "./PromptDetail";

interface PromptDetailWithProviderProps {
  convexUrl: string;
  promptId: string;
  isSubscribed: boolean;
  isFavorite: boolean;
}

export function PromptDetailWithProvider({ 
  convexUrl, 
  promptId, 
  isSubscribed, 
  isFavorite 
}: PromptDetailWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <PromptDetail 
        promptId={promptId} 
        isSubscribed={isSubscribed} 
        isFavorite={isFavorite} 
      />
    </ConvexClientProvider>
  );
}
