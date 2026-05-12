"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className:
          "border border-border bg-popover text-popover-foreground shadow-xl dark:bg-popover dark:text-popover-foreground",
        duration: 3200,
      }}
    />
  );
}
