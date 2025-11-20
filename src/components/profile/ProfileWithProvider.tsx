import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import { ProfileContent } from "./ProfileContent";

interface ProfileWithProviderProps {
  convexUrl: string;
}

export function ProfileWithProvider({ convexUrl }: ProfileWithProviderProps) {
  return (
    <ConvexClientProvider convexUrl={convexUrl}>
      <ProfileContent />
    </ConvexClientProvider>
  );
}
