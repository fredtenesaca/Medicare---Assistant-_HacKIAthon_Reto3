# Quick Test

## 1. Prueba desde el chatbot

1. Crea `.env.local` con `NEXT_PUBLIC_N8N_WEBHOOK`.
2. Reinicia `npm run dev`.
3. Abre la app.
4. Ingresa cédula: `2400180077`.
5. Ingresa síntoma: `me duele mucho el pecho y se me duerme el brazo izquierdo`.
6. Permite ubicación o escribe una ciudad.
7. Abre la consola del navegador.

Resultado esperado:

- Debes ver `📡 Status HTTP: 200`.
- Debes ver `🔍 Raw response text` con la respuesta de n8n.
- Debes ver `✅ Datos mapeados`.
- No debe aparecer `❌ AGENT FLOW FAILED - FALLBACK WILL BE USED`.

## 2. Prueba directa desde PowerShell

Ejecuta esto después de definir la variable:

```powershell
$env:NEXT_PUBLIC_N8N_WEBHOOK="https://TU-N8N/webhook/TU-WORKFLOW"
$body = @{
  paciente_cedula = "2400180077"
  paciente_sintoma = "me duele mucho el pecho y se me duerme el brazo izquierdo"
  usuario_lat = -2.14
  usuario_long = -79.93
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri $env:NEXT_PUBLIC_N8N_WEBHOOK `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## 3. Interpretación rápida

Status `200` con body JSON:

La conexión con n8n funciona. Si el chatbot falla, revisa el parser/logs del navegador.

Status `404`:

URL incorrecta o workflow no activo.

Status `500`:

Error dentro del workflow de n8n.

Body vacío:

El nodo `Respond to Webhook` no está devolviendo datos.

HTML:

La URL no apunta al webhook final o está devolviendo una página intermedia.

Error de CORS:

El navegador bloqueó la respuesta. Prueba desde PowerShell para confirmar si n8n sí responde fuera del navegador.

