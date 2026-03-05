const Groq = require("groq-sdk");
require('dotenv').config();

// Inicialización de Groq con la API Key del .env
const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
});

class AIService {
    constructor() {
        this.systemPrompt = `
Eres O.D.I.N. AI, un tutor experto en ciberseguridad para personal no técnico en una Super App Fintech.
Tu misión es:
1. Educar de forma clara y sin tecnicismos excesivos, pero ofreciendo soluciones técnicas cuando se soliciten.
2. Ser el guía del "Super App Security Kit (SASK)".
3. Ayudar a realizar un "tour" por la aplicación. Si el usuario te pide un tour o ver una sección, indícale qué hacer y usa el comando especial [[GOTO:nombre_seccion]] al final de tu respuesta.
   Secciones disponibles: dashboard, audit, docs, reports.
4. Analizar vulnerabilidades detectadas y explicar su impacto en el negocio (ej: pérdida de confianza, multas regulatorias BCRA).
5. Mantener una personalidad profesional, vigilante pero amable.

Contexto de la App:
- Dashboard: Estado general y checklist de cumplimiento.
- Security Audit: Consola para escanear URLs y ver vulnerabilidades técnicas.
- Docs & Knowledge: Biblioteca de manuales y mejores prácticas.
- Audit Logs: Historial de escaneos realizados.

Regla de Oro: Si mencionas una sección específica para que el usuario la visite, incluye el comando [[GOTO:seccion]] para que la interfaz cambie automáticamente.
`;
    }

    async analyzeResults(results) {
        if (!results || !results.vulnerabilities || results.vulnerabilities.length === 0) {
            return "He analizado los resultados y no detecté vulnerabilidades críticas. ¡Buen trabajo! Mantén tus cabeceras de seguridad actualizadas.";
        }

        const prompt = `Analiza estos hallazgos de seguridad para un perfil no técnico: ${JSON.stringify(results.vulnerabilities)}. Explica el riesgo de negocio y da una recomendación simple.`;
        
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
            });

            return chatCompletion.choices[0].message.content;
        } catch (error) {
            console.error("Error en Groq analyzeResults:", error);
            return "No pude procesar el análisis detallado en este momento, pero te sugiero revisar las vulnerabilidades marcadas en rojo en el reporte técnico.";
        }
    }

    async getChatResponse(message, context) {
        const userContext = context ? `Contexto actual: ${JSON.stringify(context)}` : "Sin contexto adicional.";
        
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: `${userContext}\n\nMensaje del usuario: ${message}` }
                ],
                model: "llama-3.3-70b-versatile",
            });

            return chatCompletion.choices[0].message.content;
        } catch (error) {
            console.error("Error en Groq getChatResponse:", error.message);
            return `Lo siento, mi conexión con el núcleo de inteligencia está experimentando latencia. Error: ${error.message}`;
        }
    }
}

module.exports = new AIService();
