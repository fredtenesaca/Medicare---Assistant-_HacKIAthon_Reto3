"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";

type ButtonProps = ComponentProps<typeof Button>;

export function OpenChatButton({
  children,
  onClick,
  ...props
}: ButtonProps & { children: ReactNode }) {
  const openChatAndFocusInput = useAssistantChatStore((s) => s.openChatAndFocusInput);

  return (
    <Button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        openChatAndFocusInput();
      }}
    >
      {children}
    </Button>
  );
}
