"use client";
import { useState, useEffect, useEffectEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchNormal1, CloseCircle } from "iconsax-reactjs";
import { toEnglishDigits, toPersianDigits } from "@/utils/function";

const SearchInput = ({ defaultValue }: { defaultValue: string }) => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(!!defaultValue);
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 500);

  const syncSearchQuery = useEffectEvent(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("q", toEnglishDigits(debouncedValue));
    } else {
      params.delete("q");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  });

  useEffect(() => {
    syncSearchQuery();
  }, [debouncedValue]);

  const handleClose = () => {
    setValue("");
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="flex items-center w-full md:hidden">
        <div className="relative w-full">
          <SearchNormal1 className="size-4 absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={value} onChange={(e) => setValue(toPersianDigits(e.target.value))} placeholder="جستجو..." aria-label="جستجو" className="h-10 w-full rounded-full border border-foreground/10 bg-card ps-8 pe-3 text-xs transition-transform placeholder:text-muted-foreground outline-none" />
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end">
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div
              key="input"
              initial={{ width: 36, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{
                width: 36,
                opacity: 0,
                transition: {
                  width: { duration: 0.25, ease: "easeInOut" },
                  opacity: { duration: 0.2, ease: "easeOut" },
                  scale: { duration: 0.2, ease: "easeOut" },
                },
              }}
              transition={{
                width: { type: "spring", stiffness: 500, damping: 28, mass: 0.6 },
                opacity: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
              className="relative overflow-hidden"
            >
              <SearchNormal1 className="size-4 absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={value} onChange={(e) => setValue(toPersianDigits(e.target.value))} placeholder="جستجو..." aria-label="جستجو" className="h-10 w-full rounded-full border border-foreground/10 bg-card ps-8 pe-3 text-xs placeholder:text-muted-foreground outline-none" />
              <button onClick={handleClose} className="absolute inset-e-1.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-muted-foreground hover:bg-foreground/5 transition" aria-label="بستن جستجو">
                <CloseCircle size="14" variant="Bold" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                scale: { type: "spring", stiffness: 500, damping: 28, mass: 0.6 },
                opacity: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
              onClick={() => setOpen(true)}
              className="flex items-center justify-center size-10 rounded-full border border-foreground/10 bg-card hover:bg-secondary active:scale-[0.95]"
              aria-label="جستجو"
            >
              <SearchNormal1 className="size-5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SearchInput;
