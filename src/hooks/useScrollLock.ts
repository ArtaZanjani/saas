"use client";
import { useEffect, useRef, useState } from "react";

const useScrollLock = () => {
  const [locked, setLocked] = useState(false);
  const scrollY = useRef(0);

  useEffect(() => {
    const { body } = document;

    if (locked) {
      scrollY.current = window.scrollY;
      body.style.cssText = `
        position: fixed;
        top: -${scrollY.current}px;
        inset-inline: 0;
        width: 100%;
        overflow: hidden;
        overscroll-behavior: none;
      `;
      return;
    }

    body.style.cssText = "";
    window.scrollTo(0, scrollY.current);
  }, [locked]);

  return { locked, setLocked };
};

export default useScrollLock;
