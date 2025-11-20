/**
 * Anonymous User Tracking Utilities
 * 
 * Tracks prompt views for anonymous (non-authenticated) users using localStorage.
 * Limits anonymous users to 10 prompt views before requiring sign-up.
 */

const STORAGE_KEY = 'churchPrompt_anonymousViewCount';
const VIEW_LIMIT = 10;

/**
 * Get the current anonymous view count from localStorage
 * Returns 0 if no count exists
 */
export function getAnonymousViewCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    
    const count = parseInt(stored, 10);
    return isNaN(count) ? 0 : count;
  } catch (error) {
    console.error('Error reading anonymous view count:', error);
    return 0;
  }
}

/**
 * Increment the anonymous view count by 1
 * Returns the new count
 */
export function incrementAnonymousViewCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const currentCount = getAnonymousViewCount();
  
  try {
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing anonymous view count:', error);
    return currentCount;
  }
}

/**
 * Reset the anonymous view count to 0
 * Called when user authenticates to reset their limit
 */
export function resetAnonymousViewCount(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting anonymous view count:', error);
  }
}

/**
 * Check if anonymous user has reached the view limit (10 views)
 * Returns true if limit is reached, false otherwise
 */
export function hasReachedViewLimit(): boolean {
  const count = getAnonymousViewCount();
  return count >= VIEW_LIMIT;
}

/**
 * Check if user can view a prompt
 * Combines authentication status and view limit checks
 * 
 * @param isAuthenticated - Whether the user is authenticated
 * @returns true if user can view prompts, false if limit reached
 */
export function canViewPrompt(isAuthenticated: boolean): boolean {
  // Authenticated users have unlimited access
  if (isAuthenticated) {
    return true;
  }
  
  // Anonymous users are limited
  return !hasReachedViewLimit();
}

/**
 * Get remaining views for anonymous user
 * Returns number of views left before hitting limit
 */
export function getRemainingViews(): number {
  const count = getAnonymousViewCount();
  const remaining = VIEW_LIMIT - count;
  return remaining > 0 ? remaining : 0;
}
