import { useState } from "react";

const useCopyToClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(textarea);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    }
  };

  return { copied, copy };
};

export default useCopyToClipboard;
