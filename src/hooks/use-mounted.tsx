/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

/**
 * USAGE:
 * const mounted = useMounted();
 * if(!mounted) return <Loader />
 *
 * Loader is a custom loading icon or component ou provide
 */

export default function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
