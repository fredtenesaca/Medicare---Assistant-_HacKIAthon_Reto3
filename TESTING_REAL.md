# 🧪 Testing Real - Integración Webhook

## 1️⃣ Preparación Rápida

```bash
# 1. Crear .env.local
echo "NEXT_PUBLIC_N8N_WEBHOOK=https://tu-n8n.com/webhook/workflow-id" > .env.local

# 2. Iniciar dev server
npm run dev

# 3. Abrir navegador
# http://localhost:3000

# 4. Abrir DevTools (F12) → Console
```

---

## 2️⃣ Test Case #1: Síntomas Críticos (Cardiología)

### Datos de entrada:

```
Cédula: 2400180077
Síntomas: me duele mucho el pecho y se me duerme el brazo izquierdo
Ubicación: Permitir GPS (o Quito)
```

### Payload enviado al webhook:

```json
{
  "paciente_cedula": "2400180077",
  "paciente_sintoma": "me duele mucho el pecho y se me duerme el brazo izquierdo",
  "usuario_lat": -2.14,
  "usuario_long": -79.93
}
```

### Respuesta esperada del webhook:

```json
{
  "analysis": "Posible infarto agudo de miocardio o síndrome coronario agudo. Los síntomas de dolor torácico irradiado al brazo izquierdo son indicativos de urgencia cardiológica. Requiere evaluación inmediata.",
  "urgency": "ALTA",
  "specialty": "Cardiología",
  "hospitals": [
    {
      "name": "Hospital Metropolitano",
      "address": "Av. Napo 3110, Quito",
      "distanceKm": 5.2,
      "copago": "$0 (Emergencia)",
      "coverage": "100%",
      "specialty": "Cardiología"
    }
  ],
  "costBase": "$500-2000",
  "coverage": "Plan Premium - 100%",
  "copago": "$0",
  "recommendation": "Llamar emergencia inmediatamente. No conducir. Requiere angiografía coronaria."
}
```

### Logs esperados en console:

```
🔑 ENVIRONMENT CHECK
   URL: https://tu-n8n.com/webhook/...

📡 PREPARING REQUEST
   Payload: {paciente_cedula: "2400180077", ...}

🔵 SENDING HTTP REQUEST...

🟢 HTTP RESPONSE RECEIVED
   Status: 200 OK
   Duration: 234.56 ms
   Content-Type: application/json

📄 READING RESPONSE BODY...
   Raw text length: 2156 chars

🔍 PARSING JSON...
   ✅ Valid JSON structure detected
   Keys: analysis, urgency, specialty, hospitals

✅ PARSE SUCCESSFUL
   Analysis length: 185 chars
   Urgency: ALTA
   Specialty: Cardiología
   Hospitals count: 1
   First hospital: Hospital Metropolitano

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STARTING AGENT FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(... logs del webhook anterior ...)

✅ AGENT RESPONSE RECEIVED
⏱️  Flow time: 456.78 ms
📊 Response Details:
   Analysis length: 185 chars
   Urgency: ALTA
   Specialty: Cardiología
   Hospitals count: 1
   First hospital: Hospital Metropolitano

🏥 Hospital Mapping:
   Original count: 1
   Mapped count: 1

💾 Store Updated:
   Specialty saved: Cardiología
   Hospitals saved: 1

✅ SUCCESS - Agent-results message appended to chat
```

### Resultado esperado en UI:

```
✅ Tarjeta de análisis médico con:
   - Análisis: "Posible infarto agudo..."
   - Badge rojo: "ALTA"
   - Especialidad: "Cardiología"
   - Cobertura y copago

✅ Tarjeta de hospital:
   - Hospital Metropolitano
   - Av. Napo 3110, Quito
   - Botones: Comparar, Descargar PDF, Compartir

❌ NO debe aparecer: "No pudimos consultar el agente médico"
```

---

## 3️⃣ Test Case #2: Síntomas Moderados (Gastroenterología)

### Datos de entrada:

```
Cédula: 1234567890
Síntomas: dolor en el estómago, náuseas, vómitos
Ubicación: Guayaquil
```

### Respuesta esperada:

```json
{
  "analysis": "Gastroenteritis viral o intoxicación alimentaria. Síntomas compatibles con inflamación del tracto digestivo superior.",
  "urgency": "MEDIA",
  "specialty": "Gastroenterología",
  "hospitals": [
    {
      "name": "Clínica de Salud Integral",
      "address": "Calle Principal 456, Guayaquil",
      "distanceKm": 3.5,
      "copago": "$25-50",
      "coverage": "80%"
    }
  ]
}
```

### Resultado esperado en UI:

```
✅ Badge amarillo: "MEDIA"
✅ Especialidad: "Gastroenterología"
✅ 1 hospital mostrado
```

---

## 4️⃣ Test Case #3: Síntomas Leves (Dermatología)

### Datos de entrada:

```
Cédula: 9876543210
Síntomas: erupción en la piel, picazón
Ubicación: Cuenca
```

### Respuesta esperada:

```json
{
  "analysis": "Probable dermatitis o reacción alérgica. Síntomas localizados sin signos de urgencia.",
  "urgency": "BAJA",
  "specialty": "Dermatología",
  "hospitals": [
    {
      "name": "Centro Dermatológico Regional",
      "address": "Av. Ordoñez Lasso, Cuenca",
      "distanceKm": 2.1,
      "copago": "$15-30",
      "coverage": "90%"
    }
  ]
}
```

### Resultado esperado en UI:

```
✅ Badge verde: "BAJA"
✅ Especialidad: "Dermatología"
```

---

## 5️⃣ Formato de Respuesta: Validar JSON

Si quieres probar manualmente, usa este comando en terminal:

```bash
curl -X POST "https://tu-n8n.com/webhook/workflow-id" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_cedula": "2400180077",
    "paciente_sintoma": "me duele mucho el pecho y se me duerme el brazo izquierdo",
    "usuario_lat": -2.14,
    "usuario_long": -79.93
  }'
```

Debería ver un JSON válido como respuesta.

---

## 6️⃣ Casos de Error (Testing)

### Error: Webhook devuelve 404

```json
❌ Expected:
   Status: 200 OK

⚠️ If you see:
   Status: 404 Not Found

✅ Fix:
   - Verifica que el workflow existe en n8n
   - Copia la URL exacta del webhook
   - Reinicia npm run dev
```

### Error: Webhook devuelve 500

```
❌ Means:
   El workflow de n8n tiene un error

✅ Fix:
   - Abre n8n y revisa los logs
   - Verifica que el nodo AI Agent funciona
   - Verifica que Respond to Webhook está configurado
```

### Error: JSON inválido

```
Log: "⚠️ JSON parse failed, treating as plain text"

❌ Means:
   El webhook está devolviendo HTML en vez de JSON

✅ Fix:
   - Probablemente el webhook tiene un error
   - Prueba con curl (ver arriba)
   - Revisa respuesta en navegador
```

### Error: Respuesta vacía

```
Log: "❌ EMPTY RESPONSE - Webhook returned no content"

❌ Means:
   El nodo Respond to Webhook no devuelve datos

✅ Fix:
   - En n8n, verifica que en el nodo Response Body
     esté pasando los datos correctamente
   - No debe estar vacío
```

---

## 7️⃣ Validar Respuesta del Webhook

Para asegurar que el webhook devuelve el formato correcto, verifica:

```javascript
// En DevTools Console, después de que falle

// El objeto debe tener MÍNIMO estos campos:
const response = {
  analysis: "string", // ✅ Requerido
  urgency: "ALTA|MEDIA|BAJA", // ✅ Requerido
  specialty: "string", // ✅ Requerido
  hospitals: [
    // ✅ Requerido (puede estar vacío)
    {
      name: "string",
      address: "string",
      distanceKm: number,
      copago: "string",
      coverage: "string",
    },
  ],
};
```

Campos opcionales pero recomendados:

```javascript
{
  costBase: "string",
  coverage: "string",
  copago: "string",
  recommendation: "string"
}
```

---

## 8️⃣ Debugging Paso a Paso

### Si ves: `❌ AI AGENT FAILED`

Busca estos logs ANTES:

1. ¿Existe `🔑 ENVIRONMENT CHECK`?
   - Si NO → `.env.local` no configurado
   - Si YES → continúa

2. ¿Existe `🔵 SENDING HTTP REQUEST...`?
   - Si NO → fetch no se ejecutó
   - Si YES → continúa

3. ¿Existe `🟢 HTTP RESPONSE RECEIVED`?
   - Si NO → timeout o error de conexión
   - Si YES con Status 200 → continúa
   - Si YES con Status != 200 → error del servidor

4. ¿Existe `📄 READING RESPONSE BODY...`?
   - Si NO → no hay body
   - Si YES → continúa

5. ¿Existe `🔍 PARSING JSON...`?
   - Si NO → no llegó a parsear
   - Si YES → revisa si tiene ✅ o ⚠️

6. ¿Existe `✅ PARSE SUCCESSFUL`?
   - Si NO → error en el parser
   - Si YES → problema está en store

---

## 9️⃣ Monitoreo en Tiempo Real

### En DevTools Console, busca estas secciones:

```
━━━━━━━━━━━━━━━━━━━
🟢 HTTP RESPONSE RECEIVED
━━━━━━━━━━━━━━━━━━━
```

Si ves esto, el webhook respondió.

```
🟢 PARSE SUCCESSFUL
━━━━━━━━━━━━━━━━━━━
```

Si ves esto, el parsing funcionó.

```
━━━━━━━━━━━━━━━━━━━
✅ AGENT RESPONSE RECEIVED
━━━━━━━━━━━━━━━━━━━
```

Si ves esto, la integración está completa y lista para UI.

---

## 🔟 Resumen de Status

| Log                       | Status  | Acción                 |
| ------------------------- | ------- | ---------------------- |
| `🔑 ✓ Defined`            | ✅ OK   | Continúa               |
| `🔑 ❌ NOT DEFINED`       | ❌ FAIL | Configura `.env.local` |
| `Status: 200`             | ✅ OK   | Continúa               |
| `Status: 404`             | ❌ FAIL | URL incorrecta         |
| `Status: 500`             | ❌ FAIL | Error en n8n           |
| `✅ PARSE SUCCESSFUL`     | ✅ OK   | Integración funciona   |
| `❌ EMPTY RESPONSE`       | ❌ FAIL | Webhook devuelve vacío |
| `✅ SUCCESS - Results...` | ✅ OK   | UI mostrará respuesta  |

---

## 1️⃣1️⃣ Quick Copy-Paste para .env.local

```bash
NEXT_PUBLIC_N8N_WEBHOOK=https://your-n8n-domain.com/webhook/your-workflow-uuid
```

---

**¿Qué hacer si TODO falla?**

1. Abre `AUDIT_PROFESSIONAL.md` - guía completa
2. Revisa sección "Diagnóstico de Problemas"
3. Busca tu caso de error específico
4. Sigue los pasos de solución

**¿Qué hacer si TODO funciona?**

1. ✅ Célébra - ¡La integración está lista!
2. 🧹 Opcional: Elimina los `console.log()` para limpiar
3. 📝 Documenta el webhook en tu README
4. 🚀 Deploy a producción

---

**Test completado:** 11 de Mayo, 2026  
**Status:** ✅ Listo para validación en tiempo real
