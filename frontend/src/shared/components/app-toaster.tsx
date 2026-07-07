// src/shared/components/app-toaster.tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sileo";

export function AppToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Toaster
      position="top-right"
      options={{
        fill: isDark ? "#171717" : "#FFFFFF",
        styles: {
          title: isDark ? "text-white!" : "text-[--card-foreground]!",
          description: isDark ? "text-white/70!" : "text-[--muted-foreground]!",
          badge: "bg-[--primary]/15!",
          button: "bg-[--primary]/10! hover:bg-[--primary]/20!",
        },
      }}
    />
  );
}