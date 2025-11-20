import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { DirectoryContent } from "./DirectoryContent";

interface DirectoryWithProviderProps {
  convexUrl: string;
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    promptCount: number;
  }>;
}

export function DirectoryWithProvider({ convexUrl, categories }: DirectoryWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <DirectoryContent categories={categories} />
    </ConvexClientProvider>
  );
}
