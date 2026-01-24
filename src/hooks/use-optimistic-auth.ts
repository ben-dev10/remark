import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { storageManager } from "@/utils/lib/storage";

/**
 * Hook that provides optimistic auth state to prevent UI flash
 * Shows cached auth state immediately, then syncs with Clerk
 */
export function useOptimisticAuth() {
  const { isSignedIn, isLoaded, user } = useUser();

  // Start with cached auth state for instant UI
  const [optimisticSignedIn, setOptimisticSignedIn] = useState<boolean>(() => {
    // On first render, use cached state if available
    const cached = storageManager.getCachedAuthState();
    return cached ?? false;
  });

  // Sync with Clerk's actual auth state once loaded
  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOptimisticSignedIn(isSignedIn);

      // Cache the real state for next time
      storageManager.cacheAuthState(isSignedIn);
    }
  }, [isLoaded, isSignedIn]);

  return {
    /**
     * Optimistic signed-in state (instant on load, then syncs with Clerk)
     */
    isSignedIn: optimisticSignedIn,

    /**
     * Whether Clerk has finished loading
     */
    isLoaded,

    /**
     * User object from Clerk
     */
    user,

    /**
     * Whether we're showing cached (optimistic) state
     */
    isOptimistic: !isLoaded,
  };
}
