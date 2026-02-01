/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

/**
 * USAGE:
 * const mounted = useMounted();
 * if(!mounted) return <Loader />
 */

export default function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
