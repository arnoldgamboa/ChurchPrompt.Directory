import type { ReactNode } from "react";
import { useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/astro/react";

interface ConvexClientProviderProps {
  children: ReactNode;
  convexUrl: string;
}

// Create a singleton client instance to avoid recreating on every render
let convexClient: ConvexReactClient | null = null;

function getConvexClient(url: string): ConvexReactClient {
  if (!convexClient) {
    convexClient = new ConvexReactClient(url);
  }
  return convexClient;
}

function useConvexAuthBridge() {
  const authState = useAuth();
  const bridgedState = typeof authState.isSignedIn === "undefined"
    ? { ...authState, isSignedIn: Boolean(authState.userId) }
    : authState;
  
  console.log('[ConvexClientProvider] Auth state:', {
    userId: authState.userId,
    isSignedIn: authState.isSignedIn,
    isLoaded: authState.isLoaded,
    bridgedIsSignedIn: bridgedState.isSignedIn,
  });

  // Test token retrieval
  if (authState.isLoaded && authState.userId) {
    authState.getToken({ template: "convex" })
      .then(token => {
        console.log('[ConvexClientProvider] getToken result:', token ? `Token received (${token.substring(0, 20)}...)` : 'NULL - JWT template missing or misconfigured');
      })
      .catch(err => {
        console.error('[ConvexClientProvider] getToken error:', err);
      });
  }
  
  return bridgedState;
}

export default function ConvexClientProvider({
  children,
  convexUrl,
}: ConvexClientProviderProps) {
  const client = useMemo(() => getConvexClient(convexUrl), [convexUrl]);

  return (
    <ConvexProviderWithClerk client={client} useAuth={useConvexAuthBridge}>
      {children}
    </ConvexProviderWithClerk>
  );
}
