require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
// Mantén cors importado para referencia
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");

const app = express();

// 1. Middleware de logs - siempre primero
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] → ${req.method} ${req.originalUrl}`);
  console.log(`Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  next();
});

// 2. Middleware CORS manual - ANTES de express.json()
app.use((req, res, next) => {
  // Log detallado para depuración
  console.log(`[CORS-MANUAL] ${req.method} ${req.originalUrl}`);
  
  // Permitir solicitudes desde estos orígenes
  const allowedOrigins = [
    'https://pokemon-eternal.onrender.com',
    'http://localhost:3000',
    'https://proyecto-pokemon.onrender.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Para solicitudes sin origen o desde otros orígenes, usar el frontend principal
    res.header('Access-Control-Allow-Origin', 'https://pokemon-eternal.onrender.com');
  }
  
  // Configurar encabezados CORS para TODAS las respuestas
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas - reduce las solicitudes preflight
  
  // Manejar directamente las solicitudes OPTIONS
  if (req.method === 'OPTIONS') {
    console.log(`[CORS-MANUAL] Respondiendo OPTIONS para: ${req.originalUrl}`);
    return res.status(204).end();
  }
  
  // Continuar con la solicitud normal
  next();
});

// 3. Parser JSON después del middleware CORS manual
app.use(express.json());

// 4. Middleware para diagnóstico de rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  console.log(`[AUTH-ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

// 5. Rutas API - define estas después de configurar CORS
app.use("/api/auth", authRoutes);

// 6. Rutas de prueba API
app.get("/api/test", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// 7. Ruta de estado API
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    message: "API funcionando correctamente",
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 8. Ruta de diagnóstico CORS
app.get("/api/debug-cors", (req, res) => {
  res.json({
    headers: req.headers,
    origin: req.headers.origin,
    method: req.method,
    corsHeaders: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers')
    }
  });
});

// 9. Producción: servir el frontend o redirigir
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

// 10. 404 para rutas de API
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "Ruta API no encontrada",
    path: req.originalUrl
  });
});

// 11. Middleware de errores mejorado
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 
      "Error interno del servidor" : err.message 
  });
});

// 12. Conexión a MongoDB - actualiza sin usar opciones deprecadas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    if (err.reason) console.error("Razón:", err.reason);
  });

// 13. Iniciar servidor - IMPORTANTE: Usa el puerto que proporciona Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});