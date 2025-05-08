require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pokemon-eternal.onrender.com', 'https://*.onrender.com'] 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// AÑADE ESTA RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Middleware de registro para depuración
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose
.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Tiempo de espera antes de fallar
  socketTimeoutMS: 45000, // Tiempo de espera para operaciones de socket
  family: 4 // Forzar IPv4
})
.then(() => console.log("MongoDB conectado"))
.catch((err) => {
  console.error("Error conectando a MongoDB:", err.message);
  // Mostrar más información sobre el error
  if (err.reason) {
    console.error("Razón:", err.reason);
  }
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));