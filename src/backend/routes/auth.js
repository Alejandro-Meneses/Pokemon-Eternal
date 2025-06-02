const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Cambia según el servicio que uses
  auth: {
    user: process.env.EMAIL_USER || "tu-correo@gmail.com", // Usa variables de entorno en producción
    pass: process.env.EMAIL_PASS || "tu-contraseña-o-app-password",
  },
});

// Registro
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Log para depuración en Vercel
    console.log(`[REGISTER] Intentando registrar: ${email}`);

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
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
      return res
        .status(400)
        .json({ error: "Por favor, proporciona email y contraseña" });
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
    const token = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log(`[LOGIN] Login exitoso: ${email}`);
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Añadir esta ruta a tus rutas de autenticación

/**
 * Ruta para solicitar recuperación de contraseña
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Por favor proporciona un correo electrónico" });
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ email });

    // No revelar si el correo existe por seguridad
    if (!user) {
      console.log(`Intento de recuperación en correo no registrado: ${email}`);
      return res.status(200).json({
        message: "Si el correo está registrado, recibirás una nueva contraseña.",
      });
    }

    // Generar una nueva contraseña aleatoria
    const newPassword = crypto.randomBytes(6).toString("hex"); // Contraseña de 12 caracteres

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    await user.save();

    // Enviar correo con la nueva contraseña
    const mailOptions = {
      from: '"Pokémon Eternal" <no-reply@pokemon-eternal.com>',
      to: user.email,
      subject: "Tu nueva contraseña - Pokémon Eternal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #3D7DCA;">Pokémon Eternal</h2>
          </div>
          <p>Hola <strong>${user.username}</strong>,</p>
          <p>Has solicitado recuperar tu contraseña para acceder a Pokémon Eternal.</p>
          <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Tu nueva contraseña es:</p>
            <h3 style="margin: 10px 0; color: #FF5350; letter-spacing: 2px; font-family: monospace;">${newPassword}</h3>
          </div>
          <p>Te recomendamos <strong>cambiar esta contraseña</strong> por una personal una vez inicies sesión.</p>
          <p style="color: #888; font-size: 13px; margin-top: 40px;">Si no solicitaste este cambio, por favor contacta con nuestro soporte inmediatamente.</p>
        </div>
      `,
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar correo:", error);
        // Aún devolvemos éxito al cliente para no revelar problemas específicos
      } else {
        console.log("Correo enviado:", info.response);
      }
    });

    console.log(`[RECUPERACIÓN] Nueva contraseña generada para ${email}: ${newPassword}`);

    res.status(200).json({
      message: "Se ha enviado una nueva contraseña a tu correo electrónico.",
    });
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    res.status(500).json({ error: "Error al procesar tu solicitud" });
  }
});

module.exports = router;