require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// Configuración CORS ampliada


// Configuración CORS primero (antes de cualquier ruta)
app.use(cors({
  origin: '\\*', // Temporal mientras solucionamos el problema
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// AÑADE ESTA LÍNEA - Crucial para manejar preflight OPTIONS
app.options('\\*', (req, res) => {
  // Establecer encabezados manualmente
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Resto de middlewares
app.use(express.json());

// Middleware de diagnóstico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ruta básica para verificar que la API funciona
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Connect to MongoDB
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
    // Mostrar más información sobre el error
    if (err.reason) console.error("Razón:", err.reason);
  });

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));