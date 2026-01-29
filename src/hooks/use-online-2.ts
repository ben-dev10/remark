import { useEffect, useState } from "react";

/**
 * Enhanced hook to detect online/offline status
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useState(() => {
    // Initial state from navigator
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    // Handler for online event
    const handleOnline = () => {
      console.log("🟢 Network: Online");
      setIsOnline(true);
    };

    // Handler for offline event
    const handleOffline = () => {
      console.log("🔴 Network: Offline");
      setIsOnline(false);
    };

    // Listen to browser events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic ping check (every 10 seconds)
    // This catches edge cases where browser doesn't fire events
    const pingInterval = setInterval(async () => {
      try {
        // Try to fetch a tiny resource from your domain
        // Using HEAD request for minimal data transfer
        const response = await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-cache",
        });

        if (response.ok && !isOnline) {
          console.log("🟢 Network: Online (detected via ping)");
          setIsOnline(true);
        }
      } catch (error) {
        // Fetch failed - likely offline
        console.log(error);

        if (isOnline) {
          console.log("🔴 Network: Offline (detected via ping)");
          setIsOnline(false);
        }
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pingInterval);
    };
  }, [isOnline]);

  return isOnline;
}
