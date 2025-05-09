require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware de diagnóstico
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  console.log(`Origin: ${req.headers.origin}`);
  next();
});

// Configuración CORS
const corsOptions = {
  origin: [
    "https://pokemon-eternal.onrender.com",
    "http://localhost:3000",
    "https://proyecto-pokemon.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Manejo de preflight

// Middleware JSON
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Producción: servir el frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../build", "index.html"));
  });
}

// 404 para rutas de API
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Ruta API no encontrada" });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
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
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err.message));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
