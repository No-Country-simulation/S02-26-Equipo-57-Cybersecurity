const express = require('express');
const router = express.Router();
const securityEngine = require('../services/securityEngineService');
const aiService = require('../services/aiService');
const axios = require('axios');
require('dotenv').config();

const SECURITY_ENGINE_URL = process.env.SECURITY_ENGINE_URL || 'http://localhost:8000';

const fs = require('fs').promises;
const path = require('path');

// --- Endpoints de Documentación ODIN ---

// GET /api/docs - Lista todos los archivos en root/docs y root/teamNotes
router.get('/docs', async (req, res) => {
    try {
        const docsPath = path.join(__dirname, '../../../docs');
        const notesPath = path.join(__dirname, '../../../teamNotes');
        
        const getFiles = async (dir, category) => {
            try {
                const files = await fs.readdir(dir);
                return files
                    .filter(f => !f.startsWith('.') && f !== 'rebranding.txt')
                    .map(f => ({
                        name: f,
                        path: f,
                        category: category,
                        type: path.extname(f).toLowerCase()
                    }));
            } catch (e) { 
                console.error(`Error leyendo directorio ${dir}:`, e.message);
                return []; 
            }
        };

        const [docsFiles, notesFiles] = await Promise.all([
            getFiles(docsPath, 'Arquitectura'),
            getFiles(notesPath, 'Mejores Practicas')
        ]);

        res.json([...docsFiles, ...notesFiles]);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar documentos' });
    }
});

// GET /api/docs/content?file=name&category=cat - Lee el contenido de un archivo .md
router.get('/docs/content', async (req, res) => {
    const { file, category } = req.query;
    if (!file) return res.status(400).json({ error: 'Archivo no especificado' });

    try {
        let basePath = category === 'Arquitectura' 
            ? path.join(__dirname, '../../../docs') 
            : path.join(__dirname, '../../../teamNotes');
        
        const filePath = path.join(basePath, file);
        const content = await fs.readFile(filePath, 'utf8');
        res.json({ content });
    } catch (error) {
        res.status(404).json({ error: 'Documento no encontrado' });
    }
});

// POST /api/scan
router.post('/scan', async (req, res) => {
    const { target_url, scan_type } = req.body;

    if (!target_url) {
        return res.status(400).json({ error: 'La URL objetivo es requerida.' });
    }

    try {
        console.log(`Iniciando escaneo para: ${target_url}`);
        // 1. Ejecutar escaneo técnico (Python)
        // Nota: securityEngineService espera targetUrl, pero el script python usa target_url. 
        // Vamos a asegurarnos de enviar lo correcto.
        const technicalResults = await securityEngine.runScan(target_url, scan_type);
        
        // 2. Analizar con IA (Node.js) - Pasamos resultados.results porque technicalResults tiene { status, results: {...} }
        const aiAnalysis = aiService.analyzeResults(technicalResults.results);

        // 3. Combinar y responder
        res.json({
            technical: technicalResults,
            analysis: aiAnalysis
        });
    } catch (error) {
        console.error("Error en /api/scan:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
    const { message, context } = req.body;
    try {
        const reply = await aiService.getChatResponse(message, context);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar mensaje de chat.' });
    }
});

// GET /api/report/:filename
router.get('/report/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const response = await axios({
            url: `${SECURITY_ENGINE_URL}/reports/${filename}`,
            method: 'GET',
            responseType: 'stream'
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        response.data.pipe(res);
    } catch (error) {
        console.error("Error descargando reporte:", error.message);
        res.status(404).send('Reporte no encontrado');
    }
});

// GET /api/status
router.get('/status', async (req, res) => {
    const status = await securityEngine.getStatus();
    res.json(status);
});

module.exports = router;
