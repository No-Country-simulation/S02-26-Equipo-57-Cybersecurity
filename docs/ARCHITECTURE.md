# 🏗️ Arquitectura y Flujo de la Aplicación (SASK)

Este documento detalla la estructura técnica de la solución **Super App Security Kit**, su flujo de datos y la integración estratégica de herramientas.

## 1. Visión General de la Arquitectura
SASK implementa una **Arquitectura Híbrida Distribuida** para separar la lógica de infraestructura de la inteligencia aplicada.

### Capas del Ecosistema
1. **Presentation Layer (Frontend):**
   - **Frameworks:** Vanilla JS, Vue.js o React.
   - **Bridges:** Capa de abstracción en JavaScript que gestiona las llamadas asíncronas hacia los dos backends (Python y Node.js).
2. **Orchestration Layer (Python / FastAPI):**
   - Encargado de la seguridad a nivel de sistema operativo y red.
   - Ejecuta scripts de auditoría tradicionales (Python scripts) y herramientas CLI de seguridad.
   - Sirve como el "Host" principal de la aplicación.
3. **Intelligence Layer (Node.js):**
   - Motor de agentes de IA y procesamiento de lenguaje natural.
   - Ejecuta auditorías específicas de ecosistemas JS/Node (ej. chequeo de `package-lock.json`).

---

## 2. Los "JavaScript Bridges"
Los Bridges son el pegamento de la aplicación. Su función es:
- **Unificación de API:** El frontend solo ve un punto de acceso, mientras el bridge redirige la carga según la especialidad (Auditoría Técnica -> Python; Asistencia IA -> Node.js).
- **Sincronización:** Asegura que los resultados del escaneo de Python sean procesados por la IA en Node.js para generar el resumen ejecutivo final.

---

## 3. Flujo Técnico Integrado

### A. Ejecución de Auditoría Inteligente
1. **Frontend:** El usuario activa el botón "Iniciar Auditoría 360".
2. **Bridge JS:** Dispara una petición a **FastAPI** para iniciar el escaneo de infraestructura.
3. **Python (FastAPI):** Ejecuta OWASP ZAP y TruffleHog. Envía resultados parciales al Bridge.
4. **Bridge JS:** Envía los resultados de Python a **Node.js** para su análisis inteligente.
5. **Node.js (AI Agent):** Procesa la vulnerabilidad detectada y genera una guía de remediación.
6. **Frontend:** Muestra la vulnerabilidad (vía Python) + la solución sugerida (vía Node.js).

---

## 3. Estrategia de Herramientas & Integración JS
| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **API Backend** | **FastAPI** | Gestión de endpoints, seguridad de la API y orquestación de escaneos. |
| **Frontend Dynamic** | **JavaScript (ES6+)** | Interactividad, validación de formularios y visualización de datos. |
| **Client Auditor** | **JS Audit Scripts** | Verificación de seguridad de cabeceras, CSRF tokens y políticas de SameSite en el navegador. |
| **Escaneo de APIs** | `OWASP ZAP` | Invocado asíncronamente por FastAPI para auditorías de caja negra. |

---

## 4. Estrategia de Implementación (Fases)
1. **Fase de Núcleo (Nuclear):** Establecer el servidor **FastAPI** y la estructura base de directorios.
2. **Fase de Interactividad:** Implementar los formularios de autoevaluación (Checklists) en el Frontend.
3. **Fase de Automatización:** Integrar la ejecución de los scripts de Python con las herramientas CLI.
4. **Fase de Inteligencia (Node.js):** Desplegar los agentes de IA una vez que el núcleo operativo sea estable.

---
*Este diseño asegura que SASK sea tanto un recurso educativo como una herramienta operativa.*
