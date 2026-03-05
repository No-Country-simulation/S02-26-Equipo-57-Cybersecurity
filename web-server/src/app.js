const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/docs-static', express.static(path.join(__dirname, '../public/docs-content')));
app.use('/notes-static', express.static(path.join(__dirname, '../public/notes-content')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'ODIN - Operational Defense Intelligent Network',
        message: 'ODIN Core Security Command' 
    });
});

// Rutas de API
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`ODIN Security Hub running at http://localhost:${port}`);
});
