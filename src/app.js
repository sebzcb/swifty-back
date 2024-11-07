const express = require('express');
const { json } = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const bodyParser = require("body-parser");
const paginate = require("express-paginate");
const cookieSession = require("cookie-session");

const route = require('./routes');

const app = express();
const port = 3030; //3020
app.use(json());
app.use(bodyParser.urlencoded({ extended: false }));
let corsOrigin = process.env.ORIGIN === 'true' ? true : process.env.ORIGIN;
app.use(cors({
  origin:corsOrigin,
  credentials: true
}));
app.use(
  cookieSession({
    name: "session",
    signed: false,
    secure: false,
    domain: process.env.HOST_COOKIE,
    sameSite: false,
  })
);
app.use(paginate.middleware(10, 100));
app.all(function (req, res, next) {
  // set default or minimum is 10 (as it was prior to v0.2.0)
  if (req.query.limit <= 10) {
    req.query.limit = 10;
  }
  next();
});

// Prefijo 'api' para todas las rutas
app.use('/api', route);
/*
// Routes
app.post("/send-email", async (req, res) => {
    const { to, subject, text } = req.body;
    console.log("to:", to, "subject:", subject, "text:", text);
    try {
      let info = await emailHelper(to, subject, text);
      res.status(200).send(`Email sent: ${info.response}`);
    } catch (error) {
      res.status(500).send("Error sending email");
    }
});*/

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Ruta para servir index.html (colocada al final para no interferir con las rutas API)
app.get('*', (req, res) => {
  console.log("Ruta no encontrada: ", req.url);
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});