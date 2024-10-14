const express = require('express');

const ReporteController = require('./controllers');

const ReporteRoutes = express.Router();

ReporteRoutes.post('/upload', ReporteController.uploadReporte);
ReporteRoutes.get('', ReporteController.getReportes);
module.exports = ReporteRoutes;