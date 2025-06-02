const express = require('express');
const router = express.Router();
const auth = require('../middleware/middlewareAuth');
const User = require('../models/User');

/**
 * @route   GET api/player/stats
 * @desc    Obtener estadísticas de batalla del jugador
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('playerStats pokedollars');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Si no existe playerStats, inicializarlo
    if (!user.playerStats) {
      user.playerStats = {
        battlesWon: 0,
        battlesLost: 0,
        pokemonCaught: 0,
        consecutiveVictories: 0,
        playerLevel: 1,
        levelProgress: 0
      };
      await user.save();
    }
    
    // Calcular nivel y progreso
    const level = user.playerStats.playerLevel || 1;
    const progress = user.playerStats.levelProgress || 0;
    const victoriesNeeded = 5 - progress;
    
    return res.json({
      playerStats: user.playerStats,
      pokedollars: user.pokedollars,
      playerLevel: level,
      levelProgress: progress,
      victoriesNeeded: victoriesNeeded
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

/**
 * @route   POST api/player/battle-result
 * @desc    Actualizar estadísticas tras una batalla
 * @access  Private
 */
router.post('/battle-result', auth, async (req, res) => {
  try {
    const { victory, pokeDollars = 0 } = req.body;
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Inicializar playerStats si no existe
    if (!user.playerStats) {
      user.playerStats = {
        battlesWon: 0,
        battlesLost: 0,
        pokemonCaught: 0,
        consecutiveVictories: 0,
        playerLevel: 1,
        levelProgress: 0
      };
    }
    
    let levelUp = false;
    const oldLevel = user.playerStats.playerLevel || 1;
    
    // Actualizar estadísticas según resultado
    if (victory) {
      // Victoria: incrementar contadores
      user.playerStats.battlesWon = (user.playerStats.battlesWon || 0) + 1;
      user.playerStats.consecutiveVictories = (user.playerStats.consecutiveVictories || 0) + 1;
      user.pokedollars = (user.pokedollars || 0) + pokeDollars;
      
      // Actualizar progreso y nivel
      user.playerStats.levelProgress = user.playerStats.consecutiveVictories % 5;
      const newLevel = Math.floor(user.playerStats.consecutiveVictories / 5) + 1;
      
      // Si subió de nivel
      if (newLevel > oldLevel) {
        user.playerStats.playerLevel = newLevel;
        levelUp = true;
        // Bonificación por subir nivel
        const bonusCoins = 100 * newLevel;
        user.pokedollars += bonusCoins;
      }
    } else {
      // Derrota: incrementar contador de derrotas y resetear consecutivas
      user.playerStats.battlesLost = (user.playerStats.battlesLost || 0) + 1;
      user.playerStats.consecutiveVictories = 0;
      user.playerStats.levelProgress = 0;
      user.playerStats.playerLevel = 1; // Reset a nivel 1 al perder
    }
    
    // Guardar cambios
    await user.save();
    
    // Respuesta con datos actualizados
    return res.json({
      playerStats: user.playerStats,
      pokedollars: user.pokedollars,
      playerLevel: user.playerStats.playerLevel,
      levelProgress: user.playerStats.levelProgress,
      victoriesNeeded: 5 - user.playerStats.levelProgress,
      levelUp: levelUp
    });
  } catch (error) {
    console.error('Error al actualizar estadísticas de batalla:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;