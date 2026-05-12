# 🔍 Auditoría Profesional - Integración Webhook N8N

**Fecha:** 11 de Mayo, 2026  
**Estado:** ✅ Auditoría Completada - Debugueo Real Implementado  
**Objetivo:** Diagnosticar y corregir por qué el frontend cae en fallback

---

## 📋 Resumen Ejecutivo

Se ha completado una **auditoría profunda** de la integración webhook y se han implementado mejoras significativas:

✅ **Parser ULTRA flexible** - Soporta 7+ formatos de respuesta de n8n  
✅ **Logs profesionales detallados** - Rastreo completo del flujo  
✅ **Fetch robusto** - Manejo mejorado de errores y timeouts  
✅ **Validación de entorno** - Detección de variables faltantes  
✅ **Debugging en tiempo real** - Console logs que indican exactamente dónde falla

---

## 🔧 Cambios Realizados

### 1. Parser Ultra Flexible (`lib/api/agent.ts`)

**Problema:** El parser anterior solo buscaba campos en la raíz del objeto. Si n8n devolvía:

```json
{
  "output": {
    "analysis": "..."
  }
}
```

El parser NO lo encontraba.

**Solución:** Implementé dos funciones clave:

#### `unwrapNested()` - Desanida objetos automáticamente

```typescript
function unwrapNested(value: unknown, depth = 0): unknown {
  // Si objeto tiene 1 propiedad con nombre "output", "data", "response", etc.
  // Lo desanida recursivamente (máx 5 niveles)
}
```

**Soporta estos formatos:**

- `{ "output": { "analysis": "..." } }` ✓
- `{ "data": { "output": { "analysis": "..." } } }` ✓
- `{ "response": "..." }` ✓
- `[{ "output": "..." }]` ✓ (arrays)
- `{ "analysis": "..." }` ✓ (directo)

#### `parseResponse()` Mejorado

- Detecta tipo de dato (string, object, array)
- Si es string, intenta parsearlo como JSON
- Si es array, toma el primer elemento
- Maneja recursivamente

### 2. Logs Profesionales Detallados

#### En `lib/api/agent.ts`

**PASO 1: VALIDACIÓN DE ENTORNO**

```
🔑 ENVIRONMENT CHECK
   URL: https://your-n8n...
   Method: POST
   Content-Type: application/json
```

**PASO 2: PREPARAR REQUEST**

```
📡 PREPARING REQUEST
   Payload: { ... }
```

**PASO 3: HACER HTTP REQUEST**

```
🔵 SENDING HTTP REQUEST...
```

**PASO 4: VALIDAR RESPONSE**

```
🟢 HTTP RESPONSE RECEIVED
   Status: 200 OK
   Duration: 234.56 ms
   Content-Type: application/json
   Content-Length: 5432
```

**PASO 5: LEER BODY**

```
📄 READING RESPONSE BODY...
   Raw text length: 5432 chars
   Raw text (first 300 chars): {...}
```

**PASO 6: PARSEAR JSON**

```
🔍 PARSING JSON...
   ✅ Valid JSON structure detected
   Parsed type: object
   Keys: analysis, urgency, specialty, hospitals
```

**PASO 7: PROCESAR RESPONSE**

```
🔄 PROCESSING RESPONSE...
```

**PASO 8: VALIDAR RESULTADO**

```
✅ PARSE SUCCESSFUL
   Analysis length: 256 chars
   Urgency: ALTA
   Specialty: Cardiología
   Hospitals count: 3
   First hospital: Hospital del Corazón
```

#### En `lib/stores/assistant-chat-store.ts`

**FLUJO COMPLETO**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 STARTING AGENT FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Request Details:
   Patient ID: 2400180077
   Symptoms: me duele mucho el pecho...
   Location: {lat: -2.14, lon: -79.93}

(... logs del webhook ...    )

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AGENT RESPONSE RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Flow time: 1234.56 ms
📊 Response Details:
   Analysis length: 256 chars
   Urgency: ALTA
   Specialty: Cardiología
   Hospitals count: 3
   First hospital: Hospital del Corazón

🏥 Hospital Mapping:
   Original count: 3
   Mapped count: 3

💾 Store Updated:
   Specialty saved: Cardiología
   Hospitals saved: 3

✅ SUCCESS - Agent-results message appended to chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Cómo Probar

### Paso 1: Crear `.env.local`

En la raíz del proyecto, crea un archivo `.env.local`:

```bash
NEXT_PUBLIC_N8N_WEBHOOK=https://tu-instancia-n8n.com/webhook/tu-workflow-id
```

**Nota:** La URL debe ser:

- Pública y accesible desde tu navegador
- El webhook debe estar activo en n8n
- Debe responder a POST con JSON

### Paso 2: Iniciar dev server

```bash
npm run dev
```

### Paso 3: Abrir DevTools

Presiona **F12** en el navegador y ve a la pestaña **Console**.

### Paso 4: Hacer prueba

En el chatbot:

1. Ingresa cédula: `2400180077`
2. Ingresa síntomas: `"me duele mucho el pecho y se me duerme el brazo izquierdo"`
3. Permite ubicación (o ingresa tu ciudad)
4. **Mira los logs en la consola**

---

## ✅ Logs Esperados (Éxito)

Si TODO funciona correctamente, deberías ver en console:

```
🔑 ENVIRONMENT CHECK
   URL: https://your-n8n...

📡 PREPARING REQUEST
   Payload: {paciente_cedula: "2400180077", ...}

🔵 SENDING HTTP REQUEST...

🟢 HTTP RESPONSE RECEIVED
   Status: 200 OK
   Duration: 234.56 ms
   Content-Type: application/json

📄 READING RESPONSE BODY...
   Raw text length: 5432 chars

🔍 PARSING JSON...
   ✅ Valid JSON structure detected
   Keys: analysis, urgency, specialty, hospitals

✅ PARSE SUCCESSFUL
   Analysis length: 256 chars
   Urgency: ALTA
   Specialty: Cardiología
   Hospitals count: 3

━━━━━━━━━━━━━━━━━━━━━━
🚀 STARTING AGENT FLOW
━━━━━━━━━━━━━━━━━━━━━━

✅ SUCCESS - Agent-results message appended to chat
```

**En UI:** El chatbot muestra análisis médico + tarjetas de hospitales + botones de acción.

---

## ❌ Logs de Error (Fallback)

Si algo falla, verás:

```
❌ HTTP ERROR - Status not OK
   Error Body: ...

❌ AGENT CALL FAILED
   Error Type: Error
   Error Message: Webhook retornó error HTTP 404

━━━━━━━━━━━━━━━━━━━━━━
❌ AGENT FLOW FAILED
━━━━━━━━━━━━━━━━━━━━━━
🚨 Error Type: Error
🚨 Error Message: Webhook retornó error HTTP 404

⚠️ Fallback Mode Activated
   Loading hospitals from OpenStreetMap...
   ✅ Fallback hospitals loaded

⚠️ Fallback hospitals displayed in chat
```

**En UI:** El chatbot muestra "No pudimos consultar..." + hospitales locales.

---

## 🔍 Diagnóstico de Problemas

### Problema 1: `❌ NOT DEFINED`

```
🔑 ENVIRONMENT CHECK - NEXT_PUBLIC_N8N_WEBHOOK: ❌ NOT DEFINED
```

**Causa:** La variable de entorno no está configurada  
**Solución:**

1. Crea `.env.local` en raíz del proyecto
2. Agrega: `NEXT_PUBLIC_N8N_WEBHOOK=https://...`
3. Reinicia: `npm run dev`

### Problema 2: `Status: 404`

```
🟢 HTTP RESPONSE RECEIVED
   Status: 404 Not Found
```

**Causa:** La URL del webhook es incorrecta o el workflow no existe  
**Solución:**

1. Verifica que el workflow existe en n8n
2. Copia la URL correcta del webhook
3. Verifica que sea accesible: prueba en navegador o Postman

### Problema 3: `Status: 500`

```
🟢 HTTP RESPONSE RECEIVED
   Status: 500 Internal Server Error
```

**Causa:** Error en el workflow de n8n  
**Solución:**

1. Abre n8n y revisa los logs del workflow
2. Verifica que el nodo "AI Agent" esté correctamente configurado
3. Verifica que el nodo "Respond to Webhook" devuelva los datos correctos

### Problema 4: `Empty Response`

```
❌ EMPTY RESPONSE - Webhook returned no content
```

**Causa:** El webhook respondió pero sin body  
**Solución:**

1. Revisa que el nodo "Respond to Webhook" esté devolviendo datos
2. En n8n, verifica que la expresión de respuesta NO esté vacía
3. Prueba con un payload de prueba

### Problema 5: `Content-Type: text/html`

```
Content-Type: text/html
```

**Causa:** El webhook está devolviendo HTML (probablemente error) en lugar de JSON  
**Solución:**

1. El webhook probablemente tiene un error y devuelve página de error HTML
2. Revisa logs de n8n
3. Verifica configuración del nodo "Respond to Webhook"

### Problema 6: `Duration: 15000+ ms`

```
Duration: 15000+ ms
Error: Tiempo de espera agotado
```

**Causa:** El webhook tarda más de 14 segundos en responder  
**Solución:**

1. Optimiza el workflow de n8n (es demasiado lento)
2. O incrementa el timeout en `lib/api/agent.ts` (busca `14_000`)

### Problema 7: `JSON parse failed`

```
⚠️ JSON parse failed, treating as plain text
```

**Causa:** La respuesta no es JSON válido, pero el parser intenta parsearlo como texto  
**Solución:**

1. Verifica que el webhook devuelva JSON válido
2. Prueba el webhook manualmente con Postman
3. Valida JSON en jsonlint.com

---

## 📊 Formatos Soportados

El parser ahora soporta estos 7+ formatos de respuesta:

### Formato 1: Directo (Recomendado)

```json
{
  "analysis": "Texto de análisis",
  "urgency": "ALTA",
  "specialty": "Cardiología",
  "hospitals": [...]
}
```

### Formato 2: Envuelto en "output"

```json
{
  "output": {
    "analysis": "Texto",
    "urgency": "ALTA",
    "hospitals": [...]
  }
}
```

### Formato 3: Envuelto en "data"

```json
{
  "data": {
    "analysis": "Texto",
    "urgency": "ALTA",
    "hospitals": [...]
  }
}
```

### Formato 4: Data → Output

```json
{
  "data": {
    "output": {
      "analysis": "Texto",
      ...
    }
  }
}
```

### Formato 5: Solo text

```json
{
  "text": "Análisis de Salud: ...\nUrgencia: ALTA\n..."
}
```

### Formato 6: Array

```json
[
  {
    "analysis": "Texto",
    "urgency": "ALTA",
    "hospitals": [...]
  }
]
```

### Formato 7: Respuesta de texto plano

```
Análisis de Salud: ...
Urgencia: ALTA
Especialidad: Cardiología
...
```

**El parser automáticamente detecta y procesa todos estos formatos.**

---

## 🔐 Verificación de Seguridad

- ✅ La variable de entorno no es hardcodeada
- ✅ Solo se usa en el frontend (NEXT*PUBLIC*)
- ✅ El webhook debe estar en tu servidor
- ✅ Se valida Content-Type de la respuesta
- ✅ Se detectan errores HTTP

---

## 📈 Mejoras Futuras (Opcionales)

- [ ] Agregar retry automático en caso de timeout
- [ ] Cachear respuestas para evitar llamadas duplicadas
- [ ] Agregar rate limiting
- [ ] Webhook con autenticación (Bearer token)
- [ ] Validación de schema con Zod

---

## 📞 Checklist Final

- [ ] `.env.local` creado con `NEXT_PUBLIC_N8N_WEBHOOK`
- [ ] `npm run dev` ejecutado
- [ ] DevTools Console abierto (F12)
- [ ] Síntomas críticos enviados ("me duele mucho el pecho...")
- [ ] Logs en console revisados
- [ ] Webhook responde con status 200
- [ ] JSON tiene los campos: analysis, urgency, specialty, hospitals
- [ ] UI muestra análisis y hospitales
- [ ] NO aparece "No pudimos consultar..."
- [ ] ✅ Integración funcional

---

## 🧹 Limpiar Logs (Cuando Funcione)

Una vez verificado que el webhook funciona:

1. Abre `lib/api/agent.ts`
2. Usa Ctrl+H (Find & Replace)
3. Busca: `console\.` (con regex ON)
4. Reemplaza por: (dejar vacío)
5. **Revisa cada línea antes de reemplazar**

Los logs son TEMPORALES y solo para debugging.

---

**Auditoría completada:** 11 de Mayo, 2026  
**Status:** ✅ Listo para testing  
**Próximo paso:** Configurar `.env.local` y probar
