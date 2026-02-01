import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { storageManager } from "@/utils/lib/storage";

/**
 * Hook that provides optimistic auth state: shows cached auth state immediately,
 * then syncs with Clerk once loaded
 */
export function useOptimisticAuth() {
  const { isSignedIn, isLoaded, user } = useUser();

  const [optimisticSignedIn, setOptimisticSignedIn] = useState<boolean>(() => {
    const cached = storageManager.getCachedAuthState();
    return cached ?? false;
  });

  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOptimisticSignedIn(isSignedIn);
      storageManager.cacheAuthState(isSignedIn);
    }
  }, [isLoaded, isSignedIn]);

  return {
    isSignedIn: optimisticSignedIn,
    isLoaded,
    user,
    isOptimistic: !isLoaded,
  };
}
