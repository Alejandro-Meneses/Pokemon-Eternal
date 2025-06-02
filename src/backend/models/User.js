// backend/models/User.js
const mongoose = require('mongoose');

// 1. Esquemas para las colecciones relacionadas con Pokémon
const pokedexEntrySchema = new mongoose.Schema({
  pokemonId: {
    type: Number,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

const teamPokemonSchema = new mongoose.Schema({
  pokemonId: {
    type: Number,
    required: true
  },
  position: {
    type: Number,
    min: 1,
    max: 6,
    required: true
  },
  isShiny: {
    type: Boolean,
    default: false
  },
  // Nuevos campos para gestionar el HP
  currentHP: {
    type: Number,
    default: null  // Se inicializará al cargar el Pokémon por primera vez
  },
  maxHP: {
    type: Number,
    default: null  // Se guardará para referencia y calcular porcentajes
  }
});

const storagePokemonSchema = new mongoose.Schema({
  pokemonId: {
    type: Number,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  isShiny: {
    type: Boolean,
    default: false
  },
  // Nuevos campos para gestionar el HP
  currentHP: {
    type: Number,
    default: null
  },
  maxHP: {
    type: Number,
    default: null
  }
});

// 2. Esquema principal de usuario con los nuevos campos
const userSchema = new mongoose.Schema({
  // Campos existentes que mantenemos
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  pokedollars: {
    type: Number,
    default: 1000  // Valor inicial al registrarse
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'moderator']
  },
  
  // 3. Nuevos campos para Pokémon
  pokedex: [pokedexEntrySchema],      // Lista de Pokémon registrados en la Pokedex
  team: [teamPokemonSchema],          // Equipo activo (máximo 6)
  storage: [storagePokemonSchema],    // Pokémon almacenados (PC)
  
  // 4. Estadísticas del jugador
  playerStats: {
     // Estadísticas existentes
  battlesWon: { type: Number, default: 0 },
  battlesLost: { type: Number, default: 0 },
  pokemonCaught: { type: Number, default: 0 },
  
  // Nuevos campos para el sistema de niveles
  consecutiveVictories: { type: Number, default: 0 }, // Para calcular el nivel
  playerLevel: { type: Number, default: 1 },          // Nivel actual
  levelProgress: { type: Number, default: 0 },        // Progreso actual en el nivel (0-4)
  nextLevelThreshold: { type: Number, default: 5 }    // Victorias necesarias para el siguiente nivel
  }
});

// 5. Métodos básicos para manipulación de Pokémon
userSchema.methods.addToPokedex = function(pokemonId) {
  // Verifica si ya existe en la Pokedex
  const existingEntry = this.pokedex.find(entry => entry.pokemonId === pokemonId);
  
  // Si ya existe, no hacemos nada
  if (existingEntry) {
    return;
  }
  
  // Si no existe, añadir a la Pokedex
  this.pokedex.push({
    pokemonId,
    dateAdded: new Date()
  });
  
  // Actualizar estadística
  this.playerStats.pokemonCaught += 1;
};

// Añadir después de los métodos existentes

// Actualizar estadísticas de batalla
userSchema.methods.updateBattleStats = function(victory, pokeDollarsEarned = 0) {
  // Actualizar contadores de batallas
  if (victory) {
    this.playerStats.battlesWon += 1;
    this.playerStats.consecutiveVictories += 1;
    
    // Añadir PokeDollars ganados
    this.pokedollars += pokeDollarsEarned;
    
    // Actualizar progreso de nivel
    this.playerStats.levelProgress = this.playerStats.consecutiveVictories % 5;
    
    // Calcular nivel: cada 5 victorias consecutivas = 1 nivel
    const newLevel = Math.floor(this.playerStats.consecutiveVictories / 5) + 1;
    
    // Si subió de nivel
    if (newLevel > this.playerStats.playerLevel) {
      this.playerStats.playerLevel = newLevel;
      // También podríamos dar una bonificación por subir de nivel
      this.pokedollars += 100 * newLevel; // Bonificación por subir de nivel
    }
  } else {
    this.playerStats.battlesLost += 1;
    // Reiniciar victorias consecutivas al perder
    this.playerStats.consecutiveVictories = 0;
    this.playerStats.levelProgress = 0;
    
    // El nivel se mantiene en 1 como mínimo
    this.playerStats.playerLevel = 1;
  }
  
  return {
    battlesWon: this.playerStats.battlesWon,
    battlesLost: this.playerStats.battlesLost,
    consecutiveVictories: this.playerStats.consecutiveVictories,
    playerLevel: this.playerStats.playerLevel,
    levelProgress: this.playerStats.levelProgress,
    pokedollars: this.pokedollars
  };
};

// Obtener estadísticas para mostrar en la UI
userSchema.methods.getBattleStats = function() {
  return {
    battlesWon: this.playerStats.battlesWon,
    battlesLost: this.playerStats.battlesLost,
    consecutiveVictories: this.playerStats.consecutiveVictories,
    playerLevel: this.playerStats.playerLevel,
    levelProgress: this.playerStats.levelProgress,
    pokedollars: this.pokedollars,
    victoriesNeeded: 5 - (this.playerStats.consecutiveVictories % 5)
  };
};
// Inicializar HP para un nuevo Pokémon
userSchema.methods.initializePokemonHP = async function(pokemonId, isTeam = false, position = null) {
  try {
    // Obtener HP base de la PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    if (!response.ok) {
      throw new Error(`Error al obtener datos de Pokémon ${pokemonId}`);
    }
    
    const data = await response.json();
    
    // Extraer el HP base
    const hpStat = data.stats.find(stat => stat.stat.name === 'hp');
    const maxHP = hpStat ? hpStat.base_stat : 100; // Valor por defecto si no se encuentra
    
    // Si es para el equipo, añadir con posición
    if (isTeam && position) {
      // Verificar si ya existe un Pokémon en esa posición
      const existingIndex = this.team.findIndex(p => p.position === position);
      if (existingIndex !== -1) {
        // Actualizar el Pokémon existente con los datos de HP
        this.team[existingIndex].currentHP = maxHP;
        this.team[existingIndex].maxHP = maxHP;
      } else {
        // Añadir nuevo Pokémon al equipo
        this.team.push({
          pokemonId,
          position,
          currentHP: maxHP,
          maxHP,
          isShiny: false // Por defecto no es shiny
        });
      }
    } 
    // Si es para almacenamiento
    else {
      this.storage.push({
        pokemonId,
        currentHP: maxHP,
        maxHP,
        isShiny: false, // Por defecto no es shiny
        dateAdded: new Date()
      });
    }
    
    await this.save();
    return { success: true, maxHP };
  } catch (error) {
    console.error('Error inicializando HP:', error);
    return { success: false, error: error.message };
  }
};

// Método para intercambiar Pokémon entre equipo y almacenamiento
userSchema.methods.swapTeamWithStorage = async function(teamPosition, storageId) {
  try {
    // Encontrar el Pokémon en el equipo
    const teamPokemon = this.team.find(p => p.position === teamPosition);
    if (!teamPokemon) {
      return { success: false, message: 'Posición de equipo no válida' };
    }
    
    // Encontrar el Pokémon en almacenamiento
    const storageIndex = this.storage.findIndex(p => p._id.toString() === storageId);
    if (storageIndex === -1) {
      return { success: false, message: 'Pokémon de almacenamiento no encontrado' };
    }
    
    // Obtener datos del Pokémon de almacenamiento
    const storagePokemon = this.storage[storageIndex];
    
    // Crear copia temporal del equipo para almacenamiento
    const tempTeam = {
      pokemonId: teamPokemon.pokemonId,
      isShiny: teamPokemon.isShiny || false,
      currentHP: teamPokemon.currentHP,
      maxHP: teamPokemon.maxHP,
      dateAdded: new Date()
    };
    
    // Actualizar el equipo con el Pokémon de almacenamiento
    teamPokemon.pokemonId = storagePokemon.pokemonId;
    teamPokemon.isShiny = storagePokemon.isShiny || false;
    
    // IMPORTANTE: Preservar el HP cuando se intercambian Pokémon
    teamPokemon.currentHP = storagePokemon.currentHP || (storagePokemon.maxHP || teamPokemon.maxHP);
    teamPokemon.maxHP = storagePokemon.maxHP || teamPokemon.maxHP;
    
    // Eliminar de almacenamiento y añadir el del equipo
    this.storage.splice(storageIndex, 1);
    this.storage.push(tempTeam);
    
    await this.save();
    return { success: true, message: 'Intercambio completado' };
  } catch (error) {
    console.error('Error en intercambio:', error);
    return { success: false, error: error.message };
  }
};

// Obtener estadísticas del HP del equipo
userSchema.methods.getTeamHPStats = function() {
  return this.team.map(pokemon => ({
    _id: pokemon._id,
    pokemonId: pokemon.pokemonId,
    position: pokemon.position,
    currentHP: pokemon.currentHP,
    maxHP: pokemon.maxHP,
    percentage: pokemon.currentHP && pokemon.maxHP 
      ? Math.floor((pokemon.currentHP / pokemon.maxHP) * 100)
      : null,
    isShiny: pokemon.isShiny
  }));
};

module.exports = mongoose.model('User', userSchema);
