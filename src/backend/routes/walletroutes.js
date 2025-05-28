const express = require('express');
const router = express.Router();
const auth = require('../middleware/middlewareAuth'); // Corregir el nombre del archivo
const User = require('../models/User');

// @route   GET api/wallet
// @desc    Obtener el balance de pokedollars del usuario
// @access  Private
// Reemplaza tu implementación actual del GET con esta versión mejorada:

router.get('/', auth, async (req, res) => {
  try {
    console.log('wallet route - ID de usuario:', req.user.id);
    
    // Verificar que req.user.id existe
    if (!req.user || !req.user.id) {
      console.error('wallet route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    // Buscar usuario con manejo de errores
    try {
      const user = await User.findById(req.user.id).select('pokedollars');
      
      if (!user) {
        console.error(`wallet route - Usuario no encontrado: ${req.user.id}`);
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      console.log(`wallet route - Pokedollars del usuario ${req.user.id}:`, user.pokedollars);
      return res.json({ pokedollars: user.pokedollars });
    } catch (dbError) {
      console.error('wallet route - Error de base de datos:', dbError);
      return res.status(500).json({ msg: 'Error al acceder a la base de datos' });
    }
  } catch (error) {
    console.error('wallet route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT api/wallet/spend
// @desc    Gastar pokedollars
// @access  Private
router.put('/spend', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser un número positivo' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Verificar si tiene suficiente saldo
    if (user.pokedollars < amount) {
      return res.status(400).json({ msg: 'Saldo insuficiente' });
    }
    
    // Descontar el monto
    user.pokedollars -= amount;
    await user.save();
    
    res.json({ pokedollars: user.pokedollars });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/wallet/add
// @desc    Añadir pokedollars
// @access  Private
router.put('/add', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser un número positivo' });
    }
    
    const user = await User.findById(req.user.id);
    user.pokedollars += amount;
    await user.save();
    
    res.json({ pokedollars: user.pokedollars });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;