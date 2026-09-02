"use client";

import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";

const CopyLinkButton = ({ orderId, token }: { orderId: string; token: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/track/${orderId}?token=${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className={buttonVariants({ className: "flex-1 border-border!", size: "lg", variant: "outline" })} onClick={handleCopy}>
      کپی لینک
      {copied && <Check />}
    </button>
  );
};

export default CopyLinkButton;
