class AIService {
    analyzeResults(results) {
        if (!results || !results.vulnerabilities || results.vulnerabilities.length === 0) {
            return "No he detectado vulnerabilidades críticas en este escaneo. Sin embargo, recuerda siempre mantener tus headers de seguridad actualizados y validar todas las entradas de usuario.";
        }

        const vulns = results.vulnerabilities;
        let summary = `He encontrado ${vulns.length} posibles vulnerabilidades. `;
        
        const high = vulns.filter(v => v.severity === 'High');
        if (high.length > 0) {
            summary += `⚠️ ATENCIÓN: Detecté ${high.length} problemas de severidad ALTA, incluyendo ${high[0].name}. Esto debe ser remediado inmediatamente. `;
        }

        summary += "Te sugiero revisar el reporte detallado. ¿Quieres que te explique cómo mitigar alguna vulnerabilidad específica?";
        return summary;
    }

    async getChatResponse(message, context) {
        // Simulación de IA básica
        const msg = message.toLowerCase();
        
        if (msg.includes('hola') || msg.includes('buenos dias')) {
            return "¡Hola! Soy SASK-AI. ¿En qué puedo ayudarte con la seguridad de tu aplicación?";
        }
        
        if (msg.includes('xss')) {
            return "El Cross-Site Scripting (XSS) permite a atacantes inyectar scripts en páginas vistas por otros usuarios. Para prevenirlo, asegúrate de escapar correctamente todas las entradas de usuario y usar Content Security Policy (CSP).";
        }
        
        if (msg.includes('sql') || msg.includes('inyeccion')) {
            return "La inyección SQL ocurre cuando datos no confiables se envían al intérprete SQL. Usa siempre consultas parametrizadas o un ORM para evitar este riesgo.";
        }
        
        if (msg.includes('reporte') || msg.includes('informe')) {
            return "Puedes descargar el informe completo en formato CSV desde la pestaña de 'Informes' o al finalizar el escaneo.";
        }
        
        if (context && context.vulnerabilities && (msg.includes('analisis') || msg.includes('resumen') || msg.includes('que encontraste'))) {
             return this.analyzeResults(context);
        }

        return "Entiendo tu consulta. Como modelo de seguridad, te recomiendo revisar las guías de OWASP o consultar el manual de mejores prácticas disponible en la sección de documentación. ¿Hay algo específico sobre el escaneo que quieras saber?";
    }
}

module.exports = new AIService();
