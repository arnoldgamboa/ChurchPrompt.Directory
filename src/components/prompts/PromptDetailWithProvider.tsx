import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import PromptDetail from "./PromptDetail";
import AnonymousViewGuard from "./AnonymousViewGuard";

interface PromptDetailWithProviderProps {
  convexUrl: string;
  promptId: string;
  isSubscribed: boolean;
  isFavorite: boolean;
  initialPrompt?: any;
}

export function PromptDetailWithProvider({ 
  convexUrl, 
  promptId, 
  isSubscribed, 
  isFavorite,
  initialPrompt,
}: PromptDetailWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <AnonymousViewGuard autoIncrementOnMount={true}>
        <PromptDetail 
          promptId={promptId} 
          isSubscribed={isSubscribed} 
          isFavorite={isFavorite} 
          initialPrompt={initialPrompt}
        />
      </AnonymousViewGuard>
    </ConvexClientProvider>
  );
}
