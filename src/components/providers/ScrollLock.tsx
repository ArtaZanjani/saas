"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useScrollLock from "@/hooks/useScrollLock";
import { useSidebar } from "./ShellLayout";

const POPUP_KEYS = ["order", "history", "new", "login"];

const ScrollLockInner = () => {
  const searchParams = useSearchParams();
  const { open } = useSidebar();
  const { setLocked } = useScrollLock();

  useEffect(() => {
    setLocked(open || POPUP_KEYS.some((k) => searchParams.has(k)));
  }, [open, searchParams, setLocked]);

  return null;
};

const ScrollLock = () => {
  return (
    <Suspense>
      <ScrollLockInner />
    </Suspense>
  );
};

export default ScrollLock;
