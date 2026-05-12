# Estimador Agéntico de Copago y Cobertura

Proyecto desarrollado para el **Reto 3** de la **hackIAthon Viamatica**

## Descripción de la Solución
INDUBOT es un asistente inteligente que transforma la experiencia del paciente antes de acudir al hospital. El agente realiza un triaje clínico, sugiere la especialidad médica adecuada y calcula el beneficio económico real (copago) cruzando datos de geolocalización, red de hospitales y planes de seguro en tiempo real.

## Stack Tecnológico

### Frontend 
Para garantizar una interfaz rápida, segura y reactiva, el equipo implementó:
**React & Vue:** Frameworks líderes para una navegación fluida y componentes dinámicos.
**TypeScript:** Tipado estático para asegurar un código robusto y facilitar el mantenimiento a largo plazo.
**Taiwild:** Maquetación moderna y responsiva centrada en la accesibilidad del paciente.

### Backend & AI Engine
La lógica de negocio y el razonamiento de IA se orquestan mediante:
**Orquestador de Microservicios:** Gestiona el flujo de datos asíncrono entre el frontend, los modelos de lenguaje y las bases de datos externas. No se limita a una ejecución lineal; implementa lógica de control de flujo para validar la integridad de la información antes de cada decisión agéntica
**Google Gemini 1.5 Flash:** Motor de lenguaje de gran escala (LLM) configurado para razonamiento clínico y toma de decisiones basadas en herramientas (Function Calling).
**PostgreSQL:** Persistencia de memoria conversacional para mantener el contexto mediante la cédula del paciente.
**Notion API:** Base de datos maestra (CRM) para la gestión dinámica de planes médicos y red de prestadores.
**JavaScript:** Ejecución de lógica matemática determinista para cálculos de copago libres de alucinaciones.



##  Arquitectura del Agente
El agente opera bajo una metodología de **Chain of Thought (Cadena de Pensamiento)**:
1. **Ingesta:** Captura de síntomas, cédula y coordenadas GPS vía Webhook.
2. **Triaje:** Clasificación de urgencia (Baja, Media, Alta) y derivación a especialidad.
3. **Retrieval:** Consulta a Notion para identificar el % de cobertura del plan del paciente.
4. **Optimización:** Cálculo de distancia (Haversine) para sugerir el hospital más cercano con el menor costo.
5. **Cierre:** Respuesta empática y estructurada con el cálculo final de copago.

## Equipo - ELEVEN´S PROMPT
* **Freddy Tenesaca** - Team Leader & Backend/AI Developer
* **Héctor Rugel** - Data Architect (Notion & DB)
* **Iván Suarez** - Frontend Developer (React/TS/Typebot)


**Entregables:**
- Enlace al Agente Funcional:
- Enlace al Repositorio: