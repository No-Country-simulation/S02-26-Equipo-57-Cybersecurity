const express = require('express');
const router = express.Router();
const securityEngine = require('../services/securityEngineService');
const aiService = require('../services/aiService');

// POST /api/scan
router.post('/scan', async (req, res) => {
    const { targetUrl, scanType } = req.body;

    if (!targetUrl) {
        return res.status(400).json({ error: 'La URL objetivo es requerida.' });
    }

    try {
        // 1. Ejecutar escaneo técnico (Python)
        const technicalResults = await securityEngine.runScan(targetUrl, scanType);
        
        // 2. Analizar con IA (Node.js)
        const aiAnalysis = aiService.analyzeResults(technicalResults);

        // 3. Combinar y responder
        res.json({
            technical: technicalResults,
            analysis: aiAnalysis
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/status
router.get('/status', async (req, res) => {
    const status = await securityEngine.getStatus();
    res.json(status);
});

module.exports = router;
