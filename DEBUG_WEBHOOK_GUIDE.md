# Debug Webhook Guide

Guía rápida para depurar la integración Frontend Next.js -> n8n -> Frontend.

## 1. Variable de entorno

Crea `.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK=https://TU-N8N/webhook/TU-WORKFLOW
```

Validaciones aplicadas por el frontend:

- Debe existir.
- Debe ser una URL `http` o `https`.
- No debe contener `webhook-test`.
- Debe apuntar al webhook de producción de n8n (`/webhook/...`).

Después de cambiar `.env.local`, reinicia `npm run dev`.

## 2. Payload enviado

El frontend envía exactamente:

```json
{
  "paciente_cedula": "2400180077",
  "paciente_sintoma": "me duele mucho el pecho y se me duerme el brazo izquierdo",
  "usuario_lat": -2.14,
  "usuario_long": -79.93
}
```

## 3. Logs que debes revisar

En la consola del navegador busca:

- `🔍 NEXT_PUBLIC_N8N_WEBHOOK`
- `📡 Webhook URL usada`
- `🏥 Payload enviado al agente médico`
- `📡 Status HTTP`
- `✅ Tiempo de respuesta`
- `🔍 Response headers`
- `🔍 Raw response text`
- `🔍 JSON parseado / estructura recibida`
- `✅ Datos mapeados`
- `🚨 Razón exacta del fallback interno del parser`
- `❌ AGENT FLOW FAILED - FALLBACK WILL BE USED`

## 4. Formatos válidos de n8n

El parser acepta estos formatos:

```json
{ "output": "texto" }
```

```json
{ "response": "texto" }
```

```json
{ "text": "texto" }
```

```json
{ "output": { "text": "texto" } }
```

```json
{ "data": { "output": "texto" } }
```

```json
[{ "output": "texto" }]
```

```json
{ "message": "texto" }
```

También acepta texto plano y JSON con campos estructurados como `analysis`, `urgency`, `specialty` y `hospitals`.

## 5. Errores frecuentes

`NEXT_PUBLIC_N8N_WEBHOOK no está definida`

Solución: crea `.env.local` y reinicia Next.js.

`NEXT_PUBLIC_N8N_WEBHOOK apunta a webhook-test`

Solución: cambia `/webhook-test/...` por `/webhook/...`.

`Webhook respondió HTML en vez de JSON/texto`

Solución: revisa que la URL no sea una página de login, una URL equivocada o un proxy que devuelve HTML.

`Error de red o CORS consultando n8n`

Solución: habilita CORS en n8n para el dominio del frontend o usa un endpoint API server-side en Next.js como proxy.

`Webhook respondió body vacío`

Solución: revisa el nodo `Respond to Webhook`; debe devolver el output del AI Agent.

## 6. Nodo Respond to Webhook

Config recomendado:

- Response Body: JSON.
- Campo de salida: por ejemplo `{ "output": "{{ $json.output }}" }`.
- Asegúrate de que el AI Agent realmente produzca `output`.
- Si el AI Agent devuelve otro campo, mapea ese campo explícitamente.

