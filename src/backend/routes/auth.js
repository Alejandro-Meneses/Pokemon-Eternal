const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cors = require("cors");

const router = express.Router();

// Obtén las opciones CORS del archivo principal
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

// Maneja OPTIONS para la ruta de registro
router.options("/register", cors(corsOptions));

// Register
router.post("/register", cors(corsOptions), async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Verifica que todos los campos estén presentes
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encripta la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea y guarda el usuario
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: error.message });
  }
});

// Maneja OPTIONS para la ruta de login
router.options("/login", cors(corsOptions));

// Login
router.post("/login", cors(corsOptions), async (req, res) => {
  const { email, password } = req.body;
  try {
    // Verifica que los campos estén presentes
    if (!email || !password) {
      return res.status(400).json({ error: "Por favor, proporciona email y contraseña" });
    }

    // Busca al usuario por correo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Genera el token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Devuelve el token y los datos del usuario
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;