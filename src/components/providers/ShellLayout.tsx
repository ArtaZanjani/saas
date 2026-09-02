"use client";
import { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext<{
  open: boolean;
  toggle: () => void;
  close: () => void;
}>({ open: false, toggle: () => {}, close: () => {} });

export const useSidebar = () => {
  return useContext(SidebarContext);
};

const ShellLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return <SidebarContext.Provider value={{ open, toggle, close }}>{children}</SidebarContext.Provider>;
};

export default ShellLayout;
