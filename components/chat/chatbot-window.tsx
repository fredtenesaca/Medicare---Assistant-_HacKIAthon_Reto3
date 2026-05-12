"use client";

import { useEffect, useMemo } from "react";

import { ChatbotHeader } from "@/components/chat/chatbot-header";
import { ChatbotInput } from "@/components/chat/chatbot-input";
import { ChatbotMessages } from "@/components/chat/chatbot-messages";
import { HospitalComparisonDialog } from "@/components/chat/hospital-comparison-dialog";
import { symptomSuggestions } from "@/lib/patient-assistant-data";
import { useAssistantChatStore } from "@/lib/stores/assistant-chat-store";

export function ChatbotWindow() {
  const phase = useAssistantChatStore((s) => s.phase);
  const input = useAssistantChatStore((s) => s.input);
  const inputFocusNonce = useAssistantChatStore((s) => s.inputFocusNonce);
  const setInput = useAssistantChatStore((s) => s.setInput);
  const submitMessage = useAssistantChatStore((s) => s.submitMessage);
  const toggleSuggestion = useAssistantChatStore((s) => s.toggleSuggestion);
  const minimize = useAssistantChatStore((s) => s.toggleMinimized);
  const close = useAssistantChatStore((s) => s.close);
  const comparisonModalOpen = useAssistantChatStore((s) => s.comparisonModalOpen);
  const closeComparison = useAssistantChatStore((s) => s.closeComparison);
  const nearbyHospitalOptions = useAssistantChatStore((s) => s.nearbyHospitalOptions);
  const promptNewConsultation = useAssistantChatStore((s) => s.promptNewConsultation);

  const placeholder = useMemo(() => {
    if (phase === "id") return "Cédula de 10 dígitos...";
    if (phase === "symptoms") return "Describe síntomas brevemente...";
    if (phase === "location-fallback") return "Ingresa tu ciudad o barrio...";
    if (phase === "results") return "Nueva cédula o usa Nueva consulta...";
    return "Procesando...";
  }, [phase]);

  useEffect(() => {
    if (phase !== "results") return;
    const timeout = window.setTimeout(() => {
      promptNewConsultation();
    }, 5 * 60 * 1000);
    return () => window.clearTimeout(timeout);
  }, [input, phase, promptNewConsultation]);

  const inputDisabled = phase === "validating" || phase === "location" || phase === "locating";

  return (
    <>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChatbotHeader onClose={close} onMinimize={minimize} phase={phase} />
        <ChatbotMessages />
        <ChatbotInput
          disabled={inputDisabled}
          focusNonce={inputFocusNonce}
          onChange={setInput}
          onSubmit={submitMessage}
          onToggleSuggestion={toggleSuggestion}
          phaseIsSymptoms={phase === "symptoms"}
          placeholder={placeholder}
          symptomSuggestions={symptomSuggestions}
          value={input}
        />
      </div>
      <HospitalComparisonDialog
        hospitals={nearbyHospitalOptions}
        onOpenChange={(open) => !open && closeComparison()}
        open={comparisonModalOpen}
      />
    </>
  );
}
