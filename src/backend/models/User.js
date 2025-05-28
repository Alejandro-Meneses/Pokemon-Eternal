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
    battlesWon: { type: Number, default: 0 },
    battlesLost: { type: Number, default: 0 },
    pokemonCaught: { type: Number, default: 0 }
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

module.exports = mongoose.model('User', userSchema);
