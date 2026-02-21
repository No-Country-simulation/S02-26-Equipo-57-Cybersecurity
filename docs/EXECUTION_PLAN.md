# 📅 Plan de Ejecución por Fases

Este plan detalla los pasos para implementar la arquitectura refinada de SASK, priorizando la estructura base y la funcionalidad del núcleo.

## Fase 1: Scaffolding y Estructura Base (Inmediato)
**Objetivo:** Establecer la estructura de directorios y los archivos de configuración iniciales para ambos entornos.

*   [ ] Crear directorio raíz `/web-server` e inicializar proyecto Node.js (`package.json`).
*   [ ] Crear directorio raíz `/security-engine` e inicializar entorno Python (`requirements.txt`).
*   [ ] Definir estructura interna de carpetas (`/views`, `/public`, `/scripts`).
*   [ ] Configurar `.gitignore` global para ambos entornos.

## Fase 2: Servidor Web Node.js y UI Básica
**Objetivo:** Levantar la interfaz de usuario y la navegación básica sin lógica compleja.

*   [ ] Implementar servidor Express básico.
*   [ ] Crear vistas HTML/Vanilla JS para:
    *   Dashboard Principal.
    *   Panel de Auditoría.
    *   Vista de Resultados.
*   [ ] Integrar estilos básicos (CSS limpio/minimalista).

## Fase 3: Motor de Seguridad Python (API Dummy)
**Objetivo:** Crear el endpoint en Python que recibirá las órdenes, aunque aún no ejecute herramientas reales.

*   [ ] Implementar servidor FastAPI mínimo en `security-engine/main.py`.
*   [ ] Crear endpoint `POST /scan` que devuelva una respuesta simulada (mock).
*   [ ] Validar comunicación HTTP entre Node.js y Python.

## Fase 4: Integración y Lógica Real
**Objetivo:** Conectar las piezas y ejecutar una prueba de concepto real.

*   [ ] Node.js: Implementar servicio que llame a la API de Python.
*   [ ] Python: Reemplazar mock por un script simple (ej: `nmap` o script de prueba de puertos).
*   [ ] Node.js: Mostrar la respuesta de Python en la UI.

## Fase 5: Agente de IA (Inteligencia)
**Objetivo:** Añadir la capa de interpretación de resultados.

*   [ ] Integrar API de IA (OpenAI/Local) en Node.js.
*   [ ] Crear prompt para "traducir" JSON técnico a lenguaje de negocio.
*   [ ] Mostrar recomendaciones en la UI.
