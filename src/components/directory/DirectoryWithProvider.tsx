import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { DirectoryContent } from "./DirectoryContent";

interface DirectoryWithProviderProps {
  convexUrl: string;
}

export function DirectoryWithProvider({ convexUrl }: DirectoryWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <DirectoryContent />
    </ConvexClientProvider>
  );
}
