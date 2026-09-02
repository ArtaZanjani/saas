"use client";

import Link from "next/link";
import { motion } from "motion/react";

const FilterTabs = ({
  activeStatus,
  search,
  filters,
  isAdmin,
}: {
  activeStatus: string;
  search: string;
  filters: { label: string; value: string }[];
  isAdmin?: boolean;
}) => {
  const basePath = isAdmin ? "/dashboard/admin" : "/dashboard";

  return (
    <div className="flex flex-wrap p-1 h-10 bg-card rounded-full relative max-md:w-full">
      {filters.map((filter) => {
        const isActive = filter.value === activeStatus;

        const href =
          filter.value === "ALL"
            ? `${basePath}${search ? `?q=${encodeURIComponent(search)}` : ""}`
            : `${basePath}?status=${filter.value}${search ? `&q=${encodeURIComponent(search)}` : ""}`;

        return (
          <Link
            key={filter.value}
            href={href}
            scroll={false}
            aria-label={`فیلتر سفارش‌ها: ${filter.label}`}
            className={`flex items-center justify-center relative px-3 md:px-4 py-1.5 text-xs min-[468px]:text-sm font-medium transition-colors text-center duration-200 rounded-full max-md:flex-1 max-md:min-[512px]:text-center ${isActive ? "text-primary-foreground" : ""}`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 size-full bg-primary rounded-full"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 35,
                  mass: 0.7,
                }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">
              {filter.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default FilterTabs;
