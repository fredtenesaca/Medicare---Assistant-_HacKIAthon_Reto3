"use client";

import { useEffect, useRef } from "react";

import { AssistantMessageBody } from "@/components/chat/assistant-message-body";
import { ChatbotMessage } from "@/components/chat/chatbot-message";
import { ChatTypingIndicator } from "@/components/chat/typing-indicator";
import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";

export function ChatbotMessages() {
  const messages = useAssistantChatStore((s) => s.messages);
  const isTyping = useAssistantChatStore((s) => s.isTyping);
  const phase = useAssistantChatStore((s) => s.phase);
  const location = useAssistantChatStore((s) => s.location);
  const selectedSymptoms = useAssistantChatStore((s) => s.selectedSymptoms);
  const requestLocation = useAssistantChatStore((s) => s.requestLocation);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <div
      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-2 sm:px-3 sm:py-2"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="space-y-3 pb-2">
        {messages.map((message) => (
          <ChatbotMessage key={message.id} role={message.role} wide={message.kind !== "text"}>
            <AssistantMessageBody
              location={location}
              message={message}
              onRequestLocation={requestLocation}
              phase={phase}
              selectedSymptoms={selectedSymptoms}
            />
          </ChatbotMessage>
        ))}
        {isTyping ? <ChatTypingIndicator /> : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}
