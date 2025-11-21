import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@clerk/astro/react';
import {
  canViewPrompt,
  incrementAnonymousViewCount,
  resetAnonymousViewCount,
  getRemainingViews,
  hasReachedViewLimit,
} from '@/lib/anonymousTracking';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AnonymousViewGuardProps {
  children: ReactNode;
  onViewPrompt?: () => void;
  // If true (default) the guard will auto-increment view count on mount
  // useful for prompt detail pages where viewing should count as a view.
  autoIncrementOnMount?: boolean;
}

/**
 * AnonymousViewGuard Component
 * 
 * Wraps prompt viewing functionality to enforce view limits for anonymous users.
 * - Tracks view count in localStorage
 * - Shows sign-up modal when limit (10 views) is reached
 * - Resets count when user authenticates
 * - Allows unlimited views for authenticated users
 */
export default function AnonymousViewGuard({
  children,
  onViewPrompt,
  autoIncrementOnMount = true,
}: AnonymousViewGuardProps) {
  const { userId, isLoaded } = useAuth();
  const isSignedIn = !!userId;
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [remainingViews, setRemainingViews] = useState(10);

  // Reset count when user authenticates
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      resetAnonymousViewCount();
    }
  }, [isLoaded, isSignedIn]);

  // Check view limit on mount and when viewing prompts
  useEffect(() => {
    if (!isLoaded) return;

    const updateViewStatus = () => {
      const remaining = getRemainingViews();
      setRemainingViews(remaining);
      
      // Show modal if limit reached and user is not authenticated
      if (!isSignedIn && hasReachedViewLimit()) {
        setShowSignUpModal(true);
      }
    };

    updateViewStatus();
  }, [isLoaded, isSignedIn]);

  // Handle prompt view
  const handlePromptView = () => {
    if (!isLoaded) return;

    // Authenticated users have unlimited access
    if (isSignedIn) {
      onViewPrompt?.();
      return;
    }

    // Check if anonymous user can view
    if (!canViewPrompt(false)) {
      setShowSignUpModal(true);
      return;
    }

    // Increment view count for anonymous users
    const oldCount = getRemainingViews();
    incrementAnonymousViewCount();
    const remaining = getRemainingViews();
    setRemainingViews(remaining);

    console.debug('[AnonymousViewGuard] handlePromptView:', { isSignedIn, remaining, oldCount });

    // Call the view callback
    onViewPrompt?.();

    // Show modal if this was the last view
    if (remaining === 0) {
      setShowSignUpModal(true);
    }
  };

  // Auto-increment on mount for viewing a prompt detail page
  useEffect(() => {
    if (isLoaded && !isSignedIn && (onViewPrompt || autoIncrementOnMount)) {
      console.debug('[AnonymousViewGuard] auto-incrementing on mount', { autoIncrementOnMount, hasCallback: !!onViewPrompt });
      handlePromptView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, autoIncrementOnMount]);

  return (
    <>
      {children}

      {/* Sign-up modal */}
      <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>You've reached your view limit</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                You've viewed <strong>10 prompts</strong> as a guest. Create a free
                account to get unlimited access to all prompts.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">With a free account, you can:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>View unlimited prompts</li>
                  <li>Submit your own prompts</li>
                  <li>Track your usage and favorites</li>
                  <li>Access prompt execution history</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <a href="/sign-up">
              <Button className="w-full" size="lg">
                Create Free Account
              </Button>
            </a>
            <a href="/sign-in">
              <Button variant="outline" className="w-full" size="lg">
                Sign In
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* View limit indicator for anonymous users */}
      {!isSignedIn && isLoaded && remainingViews > 0 && remainingViews <= 5 && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 max-w-sm">
          <p className="text-sm font-medium mb-2">
            {remainingViews} {remainingViews === 1 ? 'view' : 'views'} remaining
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Create a free account for unlimited access
          </p>
          <a href="/sign-up">
            <Button size="sm" className="w-full">
              Sign Up Free
            </Button>
          </a>
        </div>
      )}
    </>
  );
}
