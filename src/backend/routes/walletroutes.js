const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/wallet
// @desc    Obtener el balance de pokedollars del usuario
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('pokedollars');
    res.json({ pokedollars: user.pokedollars });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
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