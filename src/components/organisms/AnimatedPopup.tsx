"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ReactNode, useCallback, useRef, useEffect } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transition } from "@/utils/motion";
import { useIsMounted } from "usehooks-ts";
import usePwa from "use-pwa";

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

const AnimatedPopup = ({ triggerKey, title, children, onClose }: { triggerKey: string; title: string; children: ReactNode; onClose?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has(triggerKey);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { isInstalled } = usePwa();

  const isLogin = triggerKey === "login";

  const close = useCallback(() => {
    if (isInstalled && isLogin) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete(triggerKey);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    triggerRef.current?.focus();
  }, [router, pathname, searchParams, triggerKey, isInstalled, isLogin]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    const focusable = contentRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusable.length > 0) focusable[0].focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !contentRef.current) return;
      const focusable = contentRef.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isDesktop = useMediaQuery(640);
  const isMounted = useIsMounted();

  if (!isMounted()) return null;

  return (
    <AnimatePresence mode="wait" onExitComplete={onClose}>
      {isOpen && (
        <motion.div key={triggerKey} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} onClick={close} className={`absolute inset-0 bg-black/30 ${isInstalled && isLogin ? "supports-backdrop-filter:backdrop-blur-3xl" : "supports-backdrop-filter:backdrop-blur-sm"}`} />
          {isDesktop ? (
            <motion.div ref={contentRef} initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={spring} className="relative flex flex-col bg-card overflow-hidden border-border/10 w-[95%] max-w-md rounded-4xl max-h-[90vh] border">
              <HeaderRow title={title} {...(isInstalled && isLogin ? undefined : { onClose: close })} />
              <Body disablePx={isLogin}>{children}</Body>
            </motion.div>
          ) : (
            <motion.div ref={contentRef} initial={{ y: "100vh" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={transition} className="relative flex flex-col bg-card overflow-hidden border-border/10 w-full max-h-[92%] border-t">
              <HeaderRow title={title} {...(isInstalled && isLogin ? undefined : { onClose: close })} />
              <Body disablePx={isLogin}>{children}</Body>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HeaderRow = ({ title, onClose }: { title: string; onClose?: () => void }) => {
  return (
    <div className="flex items-center justify-between border-b px-5 py-3.5 shrink-0 text-foreground">
      <h2 className="text-sm font-bold truncate min-w-0 max-w-[80%] break-all">{title}</h2>

      {onClose !== undefined && (
        <Button className="bg-muted hover:bg-muted" variant="secondary" size="icon-sm" aria-label="بستن" onClick={onClose}>
          <X />
        </Button>
      )}
    </div>
  );
};

const Body = ({ children, disablePx }: { children: ReactNode; disablePx: boolean }) => {
  return <div className={`overflow-y-auto overflow-x-hidden ${disablePx ? "py-5" : "p-5"}`}>{children}</div>;
};

export default AnimatedPopup;
