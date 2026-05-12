# Webhook Debug Summary

## Archivos auditados

- `lib/api/agent.ts`
- `lib/stores/assistant-chat-store.ts`
- `lib/assistant-chat-logic.ts`
- `components/chat/assistant-message-body.tsx`
- `types/medical-agent.ts`
- `lib/assistant-chat-types.ts`

## Problemas encontrados

1. `.env.local` ya existe y Next.js puede leer `NEXT_PUBLIC_N8N_WEBHOOK`.
2. La URL real del webhook sí responde, pero n8n devuelve error interno de workflow.
3. El parser anterior podía terminar en respuesta default sin dejar suficientemente claro qué estructura recibió.
4. El catch del store activaba fallback, pero no imprimía el payload completo que causó el fallback.
5. TypeScript detectó que `makeAssistantMessage` aceptaba `unknown`, aunque el tipo real del mensaje solo permite texto o `MedicalAgentResponse`.
6. n8n responde HTTP 500 con `Unused Respond to Webhook node found in the workflow`.

## Correcciones realizadas

- Se reescribió `lib/api/agent.ts` con fetch robusto.
- Se agregó timeout de `20s`.
- Se validó `NEXT_PUBLIC_N8N_WEBHOOK`.
- Se bloqueó `webhook-test` con error explícito.
- Se detecta HTML en vez de JSON/texto.
- Se detecta body vacío.
- Se soporta JSON inválido como texto plano.
- Se soportan arrays y objetos anidados.
- Se soportan `output`, `response`, `text`, `message`, `data.output`, `output.text` y otros wrappers frecuentes.
- Se usa el texto recibido como `analysis` aunque no venga con etiquetas como `Análisis de Salud:`.
- Se agregaron logs profesionales con `✅ ❌ 🔍 📡 🏥 🚨`.
- Se agregó payload completo al log de fallback.
- Se corrigió el tipo de `makeAssistantMessage`.
- Se actualizó `.env.local.example`.
- Se agregó `normalizeAgentError()` para clasificar errores como `configuration error`, `network error`, `parsing error` y `server error`.
- Se detecta automáticamente el error de n8n `Unused Respond to Webhook`.
- Se compactaron logs con `console.groupCollapsed`.

## Logs agregados

- URL del webhook usada.
- Payload enviado.
- Tiempo de respuesta.
- Status HTTP.
- Response headers.
- Raw response text.
- JSON parseado.
- Errores exactos.
- Datos mapeados.
- Razón exacta del fallback interno del parser.
- Payload que activó el fallback del chatbot.

## Estado de la prueba real

Se ejecutó un request real contra:

```txt
https://inducom.app.n8n.cloud/webhook/estimador-agente
```

n8n respondió:

```json
{
  "code": 0,
  "message": "Unused Respond to Webhook node found in the workflow"
}
```

Status:

```txt
HTTP 500 Internal Server Error
```

Payload preparado para la prueba:

```json
{
  "paciente_cedula": "2400180077",
  "paciente_sintoma": "me duele mucho el pecho y se me duerme el brazo izquierdo",
  "usuario_lat": -2.14,
  "usuario_long": -79.93
}
```

## Resultado esperado con webhook correcto

Si n8n responde:

```json
{ "output": "texto del agente" }
```

El chatbot mostrará ese texto como análisis médico y no caerá al fallback.

Si n8n responde:

```json
{
  "analysis": "texto",
  "urgency": "ALTA",
  "specialty": "Cardiología",
  "hospitals": []
}
```

El chatbot mostrará los campos estructurados.

## Pendiente

Corregir el workflow en n8n:

1. Abre el nodo `Webhook`.
2. Revisa `Respond`.
3. Si tienes un nodo `Respond to Webhook`, el Webhook debe estar configurado como `Using Respond to Webhook Node`.
4. Si el Webhook está en `Respond immediately`, elimina o desconecta el nodo `Respond to Webhook`.
5. En el nodo final `Respond to Webhook`, devuelve un JSON como:

```json
{
  "output": "{{$json.output}}"
}
```

6. Guarda y activa el workflow.
7. Prueba de nuevo con el payload de `QUICK_TEST.md`.
