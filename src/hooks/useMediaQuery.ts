import { useMemo, useSyncExternalStore } from "react";

const useMediaQuery = (size: number) => {
  const query = useMemo(() => `(min-width: ${size}px)`, [size]);

  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
};

export default useMediaQuery;
