import { useLayoutEffect, useState } from "react";

/**
 * Hook to detect if the browser is online or offline
 * @returns boolean - true if online, false if offline
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
