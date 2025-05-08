require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const authRoutes = require("./routes/auth");

const app = express();

// Middleware para procesar JSON antes de CORS
app.use(express.json());

// Middleware de diagnóstico CORS
app.use((req, res, next) => {
  console.log(`CORS Request: ${req.method} ${req.path}`);
  console.log(`Origin: ${req.headers.origin}`);
  next();
});

// Configuración CORS mejorada
const corsOptions = {
  origin: [
    'https://pokemon-eternal.onrender.com', 
    'http://localhost:3000',
    'https://proyecto-pokemon.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 🔁 Preflight universal con nombre para comodín (*splat)
app.options('/*splat', cors(corsOptions));

// Preflight específico para rutas de autenticación
app.options('/api/auth/*splat', cors(corsOptions));

// Middleware de diagnóstico general
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Servir archivos estáticos si estamos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  
  // Para cualquier ruta que no sea API, servir index.html
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

// Middleware para rutas API no encontradas (solo para rutas que empiezan con /api)
app.use('/api/*splat', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err.message);
    if (err.reason) console.error("Razón:", err.reason);
  });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));