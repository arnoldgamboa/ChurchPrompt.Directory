import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import PromptDetail from "./PromptDetail";
import AnonymousViewGuard from "./AnonymousViewGuard";

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
      <AnonymousViewGuard autoIncrementOnMount={true}>
        <PromptDetail 
          promptId={promptId} 
          isSubscribed={isSubscribed} 
          isFavorite={isFavorite} 
        />
      </AnonymousViewGuard>
    </ConvexClientProvider>
  );
}
