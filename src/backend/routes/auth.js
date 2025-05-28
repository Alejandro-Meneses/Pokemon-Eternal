const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Log para depuración en Vercel
    console.log(`[REGISTER] Intentando registrar: ${email}`);
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    console.log(`[REGISTER] Usuario registrado con éxito: ${email}`);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log para depuración en Vercel
    console.log(`[LOGIN] Intentando login: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: "Por favor, proporciona email y contraseña" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN] Usuario no encontrado: ${email}`);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Contraseña incorrecta para: ${email}`);
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Aumentar duración del token para mejor experiencia de usuario
const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(`[LOGIN] Login exitoso: ${email}`);
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

module.exports = router;