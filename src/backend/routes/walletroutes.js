const express = require('express');
const router = express.Router();
const auth = require('./auth');
const Wallet = require('../wallet/Wallet');

// @route   GET api/wallet
// @desc    Get user wallet information
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Verificar si el usuario tiene una wallet
    let wallet = await Wallet.findOne({ user: req.user.id });

    // Si no existe una wallet para este usuario, crearla
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id,
        pokedollars: 1000,
        transactions: [
          {
            amount: 1000,
            type: 'credit',
            reason: 'initial_balance'
          }
        ]
      });

      await wallet.save();
    }

    res.json({
      pokedollars: wallet.pokedollars,
      transactions: wallet.transactions.slice(0, 10)
    });
  } catch (err) {
    console.error('Error en GET api/wallet:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/wallet/spend
// @desc    Spend pokedollars
// @access  Private
router.put('/spend', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser mayor que cero' });
    }

    // Obtener la wallet del usuario
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    // Si no existe wallet, crearla primero
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id,
        pokedollars: 1000,
        transactions: [
          {
            amount: 1000,
            type: 'credit',
            reason: 'initial_balance'
          }
        ]
      });
    }

    // Verificar si tiene suficientes fondos
    if (wallet.pokedollars < amount) {
      return res.status(400).json({ msg: 'No tienes suficientes Pokedólares' });
    }

    // Actualizar el saldo
    wallet.pokedollars -= amount;
    wallet.lastUpdated = Date.now();
    
    // Registrar la transacción
    wallet.transactions.unshift({
      amount,
      type: 'debit',
      reason: reason || 'purchase',
      date: Date.now()
    });

    // Guardar los cambios
    await wallet.save();

    res.json({
      pokedollars: wallet.pokedollars,
      transaction: wallet.transactions[0]
    });
  } catch (err) {
    console.error('Error en PUT api/wallet/spend:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/wallet/add
// @desc    Add pokedollars to wallet
// @access  Private
router.put('/add', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'La cantidad debe ser mayor que cero' });
    }

    // Obtener la wallet del usuario
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    // Si no existe wallet, crearla primero
    if (!wallet) {
      wallet = new Wallet({
        user: req.user.id,
        pokedollars: 0,
        transactions: []
      });
    }

    // Actualizar el saldo
    wallet.pokedollars += amount;
    wallet.lastUpdated = Date.now();
    
    // Registrar la transacción
    wallet.transactions.unshift({
      amount,
      type: 'credit',
      reason: reason || 'deposit',
      date: Date.now()
    });

    // Guardar los cambios
    await wallet.save();

    res.json({
      pokedollars: wallet.pokedollars,
      transaction: wallet.transactions[0]
    });
  } catch (err) {
    console.error('Error en PUT api/wallet/add:', err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;