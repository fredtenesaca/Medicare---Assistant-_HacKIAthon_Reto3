"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MAX_TEXTAREA_PX = 120;

export function ChatbotInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  symptomSuggestions,
  onToggleSuggestion,
  phaseIsSymptoms,
  focusNonce = 0,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  symptomSuggestions: string[];
  onToggleSuggestion: (suggestion: string) => void;
  phaseIsSymptoms: boolean;
  /** Incrementar para enfocar el campo (p. ej. al abrir desde la landing). */
  focusNonce?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || disabled) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
  }, [value, disabled]);

  useEffect(() => {
    if (!focusNonce) return;
    const el = textareaRef.current;
    if (!el || disabled) return;
    el.focus();
    const len = el.value.length;
    try {
      el.setSelectionRange(len, len);
    } catch {
      /* ignore */
    }
  }, [focusNonce, disabled]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="shrink-0 overflow-x-hidden border-t border-white/15 bg-background/55 px-2 pb-2 pt-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-background/40 sm:px-2.5">
      {phaseIsSymptoms ? (
        <div className="mb-1.5 flex max-h-16 flex-wrap gap-1 overflow-y-auto">
          {symptomSuggestions.map((suggestion) => {
            const active = value
              .split(",")
              .map((item) => item.trim())
              .includes(suggestion);
            return (
              <button
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  "hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary/45 bg-primary/12 text-primary"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground",
                )}
                key={suggestion}
                onClick={() => onToggleSuggestion(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      ) : null}
      <form
        className="flex items-end gap-1.5 rounded-2xl border border-white/18 bg-background/70 py-1 pl-2 pr-1 shadow-md backdrop-blur-md dark:border-white/10 dark:bg-background/55"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="floating-assistant-message">
          Mensaje para Medicare Assistant
        </label>
        <Textarea
          autoComplete="off"
          className="max-h-[120px] min-h-[36px] flex-1 resize-none border-0 bg-transparent py-2 text-[13px] leading-snug shadow-none focus-visible:ring-0"
          disabled={disabled}
          id="floating-assistant-message"
          name="floating-assistant-message"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          ref={textareaRef}
          rows={1}
          value={value}
        />
        <Button
          aria-label="Enviar mensaje"
          className="mb-0.5 size-9 shrink-0 rounded-xl p-0"
          disabled={disabled || !value.trim()}
          size="icon"
          type="submit"
        >
          <Send aria-hidden="true" className="size-4" />
        </Button>
      </form>
    </div>
  );
}
