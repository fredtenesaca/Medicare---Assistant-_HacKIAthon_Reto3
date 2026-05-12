# Medicare Assistant

Aplicación web en Next.js 15 para orientación médica asistida por IA, comparación de hospitales, generación de PDF y flujo de chatbot conectado a un webhook de n8n.

## Stack

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- n8n webhook
- jsPDF
- Preparado para futuras integraciones con Gemini AI y Notion API mediante variables de entorno server-side

## Requisitos

- Node.js 20 o superior recomendado
- npm
- Un webhook de n8n activo para el flujo del chatbot

## Instalación

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

En Windows PowerShell, si `npm` se bloquea por execution policy, usa:

```bash
npm.cmd run dev
```

La app queda disponible normalmente en `http://localhost:3000`.

## Variables de entorno

Copia `.env.local.example` a `.env.local` y configura:

```env
NEXT_PUBLIC_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/your-workflow
GEMINI_API_KEY=replace-with-your-gemini-api-key
NOTION_API_KEY=replace-with-your-notion-api-key
NOTION_DATABASE_ID=replace-with-your-notion-database-id
```

`NEXT_PUBLIC_N8N_WEBHOOK` es visible en el navegador porque el chatbot llama al webhook desde cliente. No coloques tokens privados en variables `NEXT_PUBLIC_*`.

## Configuración de n8n

El webhook debe aceptar `POST` con JSON:

```json
{
  "paciente_cedula": "string",
  "paciente_sintoma": "string",
  "usuario_lat": 0,
  "usuario_long": 0
}
```

Respuesta recomendada:

```json
{
  "analysis": "string",
  "urgency": "ALTA|MEDIA|BAJA",
  "specialty": "string",
  "hospitals": [
    {
      "name": "string",
      "address": "string",
      "distanceKm": 1.5,
      "copago": "string",
      "coverage": "string",
      "specialty": "string"
    }
  ],
  "costBase": "string",
  "coverage": "string",
  "copago": "string",
  "recommendation": "string"
}
```

Usa una URL `/webhook/...` para uso normal. Las URLs `/webhook-test/...` solo funcionan mientras n8n está escuchando en modo test.

## Scripts

```bash
npm run dev      # servidor local
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
npx.cmd tsc --noEmit  # verificación TypeScript en Windows
```

## Qué no se sube a GitHub

El `.gitignore` excluye dependencias, builds, `.next`, logs, caches, coverage, archivos temporales y variables de entorno reales. Mantén fuera del repositorio cualquier `.env.local`, token, credencial o exportación privada.
