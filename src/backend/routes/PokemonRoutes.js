const express = require('express');
const router = express.Router();
const auth = require('../middleware/middlewareAuth');
const User = require('../models/User');
const PokemonService = require('../utils/PokemonDatabaseService');

// @route   GET api/pokemon/pokedex
// @desc    Obtener la Pokedex completa del usuario
// @access  Private
router.get('/pokedex', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo Pokedex para:', req.user.id);
    
    // Verificar que req.user.id existe
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const user = await User.findById(req.user.id).select('pokedex');
      
      if (!user) {
        console.error(`pokemon route - Usuario no encontrado: ${req.user.id}`);
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      res.json(user.pokedex);
    } catch (dbError) {
      console.error('pokemon route - Error de base de datos:', dbError);
      return res.status(500).json({ msg: 'Error al acceder a la base de datos' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/pokemon/pokedex/complete
// @desc    Obtener la Pokedex del usuario con detalles completos
// @access  Private
router.get('/pokedex/complete', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo Pokedex completa para:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const pokedexWithDetails = await PokemonService.getPokedexWithDetails(req.user.id);
      res.json(pokedexWithDetails);
    } catch (serviceError) {
      console.error('pokemon route - Error en servicio Pokemon:', serviceError);
      return res.status(500).json({ msg: serviceError.message || 'Error al procesar la solicitud' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Agregar en la sección donde defines tus rutas
/**
 * @route POST /api/pokemon/swap
 * @desc Intercambiar un Pokémon entre equipo y almacenamiento
 * @access Private
 */
router.post('/swap', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { teamPosition, storageIndex } = req.body;
        
        console.log('Solicitud de intercambio:', {
            userId,
            teamPosition, 
            storageIndex
        });
        
        // Validar los datos recibidos
        if (teamPosition === undefined || storageIndex === undefined) {
            return res.status(400).json({ 
                error: 'Se requiere posición del equipo y índice del almacenamiento' 
            });
        }
        
        // Llamar al servicio para realizar el intercambio
        await PokemonService.moveToTeam(
            userId, 
            parseInt(storageIndex),
            parseInt(teamPosition)
        );
        
        res.json({ 
            success: true, 
            message: 'Pokémon intercambiado exitosamente' 
        });
    } catch (error) {
        console.error('Error al intercambiar Pokémon:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET api/pokemon/team
// @desc    Obtener el equipo Pokémon del usuario
// @access  Private
router.get('/team', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo equipo para:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const user = await User.findById(req.user.id).select('team');
      
      if (!user) {
        console.error(`pokemon route - Usuario no encontrado: ${req.user.id}`);
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      // Ordenar por posición
      const sortedTeam = [...user.team].sort((a, b) => a.position - b.position);
      res.json(sortedTeam);
    } catch (dbError) {
      console.error('pokemon route - Error de base de datos:', dbError);
      return res.status(500).json({ msg: 'Error al acceder a la base de datos' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/pokemon/team/complete
// @desc    Obtener equipo completo con detalles
// @access  Private
router.get('/team/complete', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo equipo completo para:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const teamWithDetails = await PokemonService.getTeamWithDetails(req.user.id);
      res.json(teamWithDetails);
    } catch (serviceError) {
      console.error('pokemon route - Error en servicio Pokemon:', serviceError);
      return res.status(500).json({ msg: serviceError.message || 'Error al procesar la solicitud' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/pokemon/team
// @desc    Añadir un Pokémon al equipo
// @access  Private
router.post('/team', auth, async (req, res) => {
  try {
    console.log('pokemon route - Añadiendo Pokémon al equipo:', req.body);
    const { pokemonId, position, isShiny } = req.body;
    
    if (!pokemonId || !position) {
      return res.status(400).json({ msg: 'Se requieren ID de Pokémon y posición' });
    }
    
    try {
      const updatedUser = await PokemonService.addToTeam(
        req.user.id, 
        parseInt(pokemonId), 
        parseInt(position), 
        isShiny || false
      );
      
      // Devolver el equipo ordenado
      const sortedTeam = [...updatedUser.team].sort((a, b) => a.position - b.position);
      res.json(sortedTeam);
    } catch (serviceError) {
      console.error('pokemon route - Error al añadir Pokémon al equipo:', serviceError);
      return res.status(400).json({ msg: serviceError.message || 'Error al añadir Pokémon' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/pokemon/catch
// @desc    Capturar un nuevo Pokémon
// @access  Private
router.post('/catch', auth, async (req, res) => {
  try {
    console.log('pokemon route - Capturando Pokémon:', req.body);
    const { pokemonId, isShiny } = req.body;
    
    if (!pokemonId) {
      return res.status(400).json({ msg: 'Se requiere ID de Pokémon' });
    }
    
    try {
      const updatedUser = await PokemonService.catchPokemon(
        req.user.id,
        parseInt(pokemonId),
        isShiny || false
      );
      
      res.json({ 
        team: updatedUser.team.sort((a, b) => a.position - b.position),
        pokedex: updatedUser.pokedex,
        storage: updatedUser.storage
      });
    } catch (serviceError) {
      console.error('pokemon route - Error al capturar Pokémon:', serviceError);
      return res.status(400).json({ msg: serviceError.message || 'Error al capturar Pokémon' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE api/pokemon/team/:position
// @desc    Mover un Pokémon del equipo al PC
// @access  Private
router.delete('/team/:position', auth, async (req, res) => {
  try {
    console.log('pokemon route - Moviendo Pokémon al PC, posición:', req.params.position);
    const position = parseInt(req.params.position);
    
    if (isNaN(position) || position < 1 || position > 6) {
      return res.status(400).json({ msg: 'Posición inválida' });
    }
    
    try {
      const updatedUser = await PokemonService.moveToPCStorage(req.user.id, position);
      
      // Devolver el equipo actualizado
      const sortedTeam = [...updatedUser.team].sort((a, b) => a.position - b.position);
      res.json(sortedTeam);
    } catch (serviceError) {
      console.error('pokemon route - Error al mover Pokémon al PC:', serviceError);
      return res.status(400).json({ msg: serviceError.message || 'Error al mover Pokémon' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/pokemon/storage
// @desc    Obtener los Pokémon almacenados en PC
// @access  Private
router.get('/storage', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo almacenamiento para:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const user = await User.findById(req.user.id).select('storage');
      
      if (!user) {
        console.error(`pokemon route - Usuario no encontrado: ${req.user.id}`);
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      res.json(user.storage);
    } catch (dbError) {
      console.error('pokemon route - Error de base de datos:', dbError);
      return res.status(500).json({ msg: 'Error al acceder a la base de datos' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET api/pokemon/storage/complete
// @desc    Obtener almacenamiento con detalles completos
// @access  Private
router.get('/storage/complete', auth, async (req, res) => {
  try {
    console.log('pokemon route - Obteniendo almacenamiento completo para:', req.user.id);
    
    if (!req.user || !req.user.id) {
      console.error('pokemon route - req.user.id no está definido');
      return res.status(400).json({ msg: 'ID de usuario no proporcionado' });
    }
    
    try {
      const storageWithDetails = await PokemonService.getStorageWithDetails(req.user.id);
      res.json(storageWithDetails);
    } catch (serviceError) {
      console.error('pokemon route - Error en servicio Pokemon:', serviceError);
      return res.status(500).json({ msg: serviceError.message || 'Error al procesar la solicitud' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST api/pokemon/storage-to-team
// @desc    Mover un Pokémon del PC al equipo
// @access  Private
router.post('/storage-to-team', auth, async (req, res) => {
  try {
    console.log('pokemon route - Moviendo Pokémon del PC al equipo:', req.body);
    const { storageIndex, teamPosition } = req.body;
    
    if (storageIndex === undefined || teamPosition === undefined) {
      return res.status(400).json({ msg: 'Se requiere índice de almacenamiento y posición de equipo' });
    }
    
    try {
      // Obtener el usuario y sus Pokémon almacenados
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      const storagePokemon = user.storage[parseInt(storageIndex)];
      if (!storagePokemon) {
        return res.status(404).json({ msg: 'Pokémon no encontrado en el almacenamiento' });
      }
      
      // Añadir al equipo
      await PokemonService.addToTeam(
        req.user.id,
        storagePokemon.pokemonId,
        parseInt(teamPosition),
        storagePokemon.isShiny
      );
      
      // Eliminar del almacenamiento
      user.storage.splice(parseInt(storageIndex), 1);
      await user.save();
      
      // Devolver datos actualizados
      res.json({
        team: user.team.sort((a, b) => a.position - b.position),
        storage: user.storage
      });
    } catch (serviceError) {
      console.error('pokemon route - Error al mover Pokémon del PC al equipo:', serviceError);
      return res.status(400).json({ msg: serviceError.message || 'Error al mover Pokémon' });
    }
  } catch (error) {
    console.error('pokemon route - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;