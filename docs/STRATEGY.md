# 🎯 Estrategia de Implementación SASK

La implementación de seguridad en una Super App Fintech no puede ser un evento único; debe ser un proceso continuo. Este documento define la estrategia recomendada para desplegar el **Super App Security Kit**.

## 1. El Enfoque "Shift-Left"
Nuestra estrategia se basa en mover la seguridad al inicio del ciclo de vida del desarrollo de software (SDLC).

*   **Educación Temprana:** El personal no técnico utiliza los manuales de SASK durante la fase de requerimientos.
*   **Validación Continua:** Los desarrolladores usan el motor de SASK antes de cada "Push" a producción.

## 2. Estrategia de Rollout (Fases de Madurez)

### Fase 1: Hardening Documental (Semana 1-2)
*   **Objetivo:** Establecer la base legal y normativa.
*   **Acciones:** Adoptar las plantillas de políticas de contraseñas y gestión de credenciales incluidas en el Kit.
*   **KPI:** 100% de los empleados han leído la Guía de Concientización.

### Fase 2: Blindaje de Acceso (Semana 3-4)
*   **Objetivo:** Asegurar el perímetro.
*   **Acciones:** Implementar MFA (Multi-Factor Authentication) en todos los servicios críticos según el Manual de Mejores Prácticas.
*   **Herramienta SASK:** Uso del Checklist de Autenticación Segura.

### Fase 3: Escaneo y Remediación (Continuo)
*   **Objetivo:** Detección proactiva de fallas.
*   **Acciones:** Ejecución semanal del "SASK Security Engine" contra APIs y repositorios.
*   **Herramienta SASK:** Integración con OWASP ZAP y TruffleHog.

## 3. Matriz de Responsabilidades (RACI)

| Tarea | Product Owner | Developer | Security Lead (SASK) |
| :--- | :---: | :---: | :---: |
| Definición de Políticas | **R** | C | I |
| Implementación de Cifrado | I | **R** | C |
| Escaneo de Vulnerabilidades | C | **R** | **A** |
| Gestión de Incidentes | **A** | C | **R** |

*(R: Responsible, A: Accountable, C: Consulted, I: Informed)*

---

## 5. Plan de Contingencia y Simplificación (Lean MVP)
Para garantizar la entrega del proyecto en plazos competitivos, se define una ruta de simplificación modular:

### Nivel 1: SASK Visionary (Arquitectura Dual-Core + IA)
*   **Estado:** Objetivo ideal.
*   **Componentes:** Python, Node.js y Agentes de IA operativos.

### Nivel 2: SASK Solid (Monolito Python + IA)
*   **Simplificación:** Se consolida toda la lógica en FastAPI (Python). 
*   **Cambio:** Se prescinde de Node.js, integrando la IA mediante librerías de Python.

### Nivel 3: SASK Core (Back-to-Basics / Sin IA)
*   **Simplificación:** **Eliminación total de la integración de IA.**
*   **Enfoque:** El kit se centra exclusivamente en el **Manual de Mejores Prácticas**, los **Checklists de Configuración** y los **Scripts de Auditoría Técnica** (Python).
*   **Razón:** Asegurar que el valor fundamental del kit (la seguridad técnica y normativa) se entregue sin depender de la complejidad de los modelos de lenguaje.

---

## 6. Definición del MVP Crítico (Must-Have)
En caso de aplicar el plan de contingencia máximo, el proyecto se considerará completo si entrega:
1.  **Portal Documental:** Acceso web a los manuales alineados con BCRA/ISO.
2.  **Motor Técnico:** Al menos 2 scripts funcionales de auditoría (ej. Verificación de TLS y Escaneo de Cabeceras).
3.  **Checklist Interactivo:** Herramienta web para autoevaluación manual (sin asistencia de IA).

---
*SASK: La seguridad como ventaja competitiva, no como obstáculo.*
