import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { DirectoryContent } from "./DirectoryContent";

interface DirectoryWithProviderProps {
  convexUrl: string;
  initialPrompts?: any[];
  initialBootData?: any;
}

export function DirectoryWithProvider({ convexUrl, initialPrompts, initialBootData }: DirectoryWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <DirectoryContent initialPrompts={initialPrompts} initialBootData={initialBootData} />
    </ConvexClientProvider>
  );
}
