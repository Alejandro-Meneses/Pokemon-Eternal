require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const walletRoutes = require('./routes/walletroutes');
const app = express();

// 1. Middleware de logs - siempre primero
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] → ${req.method} ${req.originalUrl}`);
  console.log(`Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  next();
});

// 2. Configuración CORS simplificada para Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo, permitir localhost; en producción, permitir tu dominio de Vercel
    const allowedOrigins = [
      'http://localhost:3000',
      'https://pokemon-eternal.vercel.app',
      undefined // Para solicitudes sin origen (como Postman)
    ];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.log(`CORS rechazado para origen: ${origin}`);
      callback(null, true); // En Vercel, permitimos todos los orígenes por ahora
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-auth-token'],
};

// Aplicar CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejo explícito para OPTIONS

// 3. Parser JSON
app.use(express.json());

// 4. Middleware para diagnóstico de rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  console.log(`[AUTH-ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

// 5. Rutas API
app.use("/api/auth", authRoutes);

// Rutas de la billetera
app.use('/api/wallet', walletRoutes);

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
        console.log("Index.html no encontrado, usando fallback");
        // En Vercel, simplemente devuelve un HTML básico
        return res.send(`
          <html>
            <head>
              <meta http-equiv="refresh" content="0;url=/" />
            </head>
            <body>
              <p>Redirigiendo...</p>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error("Error sirviendo archivos estáticos:", err);
      return res.status(500).send("Error interno del servidor");
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

// 12. Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
    if (err.reason) console.error("Razón:", err.reason);
  });

// 13. Configuración para desarrollo vs Vercel
if (process.env.VERCEL) {
  // En Vercel, exporta la app para serverless
  console.log("Ejecutando en Vercel - modo serverless");
  module.exports = app;
} else {
  // Solo inicia el servidor si no estamos en Vercel
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}