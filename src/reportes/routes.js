const express = require('express');

const ReporteController = require('./controllers');

const ReporteRoutes = express.Router();

ReporteRoutes.post('/upload', ReporteController.uploadReporte);

module.exports = ReporteRoutes;