"use client";

import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
  width = 440,
  dark = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  dark?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(8,16,12,.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadein .15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          background: dark ? "#0e1a14" : "#fff",
          color: dark ? "#fff" : "#10231a",
          borderRadius: 24,
          boxShadow: "0 40px 100px rgba(8,16,12,.45)",
          overflow: "hidden",
          animation: "popin .18s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
