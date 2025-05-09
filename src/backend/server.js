require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware de diagnóstico mejorado
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] → ${req.method} ${req.path}`);
  console.log(`Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  next();
});

// Configuración CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://pokemon-eternal.onrender.com',
      'http://localhost:3000',
      'https://proyecto-pokemon.onrender.com',
      undefined // Para permitir solicitudes sin origen
    ];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS rechazado para origen: ${origin}`);
      callback(new Error(`No permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Aplicar CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Manejo de preflight

// Middleware JSON
app.use(express.json());

// Rutas API
app.use("/api/auth", authRoutes);

// Rutas de prueba API
app.get("/api/test", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Ruta de estado API
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "API funcionando correctamente",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Producción: servir el frontend o redirigir
if (process.env.NODE_ENV === "production") {
  // Intenta servir los archivos estáticos, pero con manejo de errores
  app.use(express.static(path.join(__dirname, "../../build")));

  app.get("*", (req, res, next) => {
    // Si es una ruta API, continúa al siguiente middleware
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    try {
      const indexPath = path.join(__dirname, "../../build", "index.html");
      // Verifica si el archivo existe antes de intentar servirlo
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      } else {
        console.log("Index.html no encontrado, redirigiendo al frontend");
        // Si no existe el archivo, redirige al frontend
        return res.redirect("https://pokemon-eternal.onrender.com");
      }
    } catch (err) {
      console.error("Error sirviendo archivos estáticos:", err);
      // Redirige al frontend en caso de error
      return res.redirect("https://pokemon-eternal.onrender.com");
    }
  });
}

// 404 para rutas de API
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "Ruta API no encontrada",
    path: req.originalUrl
  });
});

// Middleware de errores mejorado
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 
      "Error interno del servidor" : err.message 
  });
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
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    if (err.reason) console.error("Razón:", err.reason);
  });

// Iniciar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));