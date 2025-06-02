// Implementación simple de caché en memoria
const pokemonCache = {
  data: {},
  moveData: {},
  
  // Método para obtener un elemento del caché
  get: function(key) {
    const item = this.data[key];
    if (!item) return null;
    
    // Verificar si el ítem ha expirado
    if (item.expiry < Date.now()) {
      delete this.data[key];
      return null;
    }
    
    return item.value;
  },
  
  // Método para guardar un elemento en caché
  set: function(key, value, ttlSeconds = 3600) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.data[key] = { value, expiry };
  },
  
  // Método para obtener un movimiento del caché
  getMove: function(key) {
    const item = this.moveData[key];
    if (!item) return null;
    
    if (item.expiry < Date.now()) {
      delete this.moveData[key];
      return null;
    }
    
    return item.value;
  },
  
  // Método para guardar un movimiento en caché
  setMove: function(key, value, ttlSeconds = 3600) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.moveData[key] = { value, expiry };
  },
  
  // Método para limpiar el caché
  clear: function() {
    this.data = {};
    this.moveData = {};
    return "Caché limpiado";
  },
  
  // Método para obtener estadísticas del caché
  getStats: function() {
    let pokemonCount = Object.keys(this.data).length;
    let moveCount = Object.keys(this.moveData).length;
    
    return {
      pokemonCount,
      moveCount,
      totalEntries: pokemonCount + moveCount
    };
  }
};

class Pokemon {
  constructor(data) {
    this.id = data.id; // ID del Pokémon
    this.name = data.name; // Nombre del Pokémon
    this.types = data.types.map((type) => type.type.name); // Tipos del Pokémon
    
    // Estadísticas base como un objeto (ej: { attack: 80, defense: 70 })
    this.stats = data.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {});
    
    // Corregir los nombres de los sprites para que coincidan con la API
    this.sprites = {
      front: data.sprites.front_default,
      back: data.sprites.back_default,
      front_shiny: data.sprites.front_shiny,
      back_shiny: data.sprites.back_shiny,
      officialArtwork: data.sprites.other["official-artwork"]?.front_default || data.sprites.front_default,
    };

    // Guarda la lista completa de movimientos para procesarlos después
    this.allMoves = data.moves;
    
    // Los movimientos se configurarán asíncronamente
    this.moves = [];
  }

  // Método para determinar qué tipo de ataque es mejor para este Pokémon
  getBestAttackType() {
    const physicalAttack = this.stats.attack || 0;
    const specialAttack = this.stats['special-attack'] || 0;
    
    return physicalAttack >= specialAttack ? 'physical' : 'special';
  }

  // Método para seleccionar los 4 mejores movimientos (con caché)
  async selectBestMoves(allMoves) {
    if (!allMoves || allMoves.length === 0) {
      console.warn(`Pokémon ${this.name} no tiene movimientos disponibles`);
      return [];
    }

    try {
      // Determinar el tipo de ataque preferido (físico o especial)
      const preferredAttackType = this.getBestAttackType();
      
      console.log(`Seleccionando mejores movimientos para ${this.name} con preferencia ${preferredAttackType}`);
      
      // Crear una copia para no modificar el original
      const movesToProcess = [...allMoves];
      
      // Función para obtener información detallada de un movimiento (con caché)
      const fetchMoveDetails = async (moveUrl) => {
        // Extraer ID del movimiento de la URL para usar como clave de caché
        const moveId = moveUrl.split("/").filter(Boolean).pop();
        const cacheKey = `move-${moveId}`;
        
        // Verificar si el movimiento está en caché
        const cachedMove = pokemonCache.getMove(cacheKey);
        if (cachedMove) {
          console.log(`[CACHE HIT] Movimiento ${moveId}`);
          return cachedMove;
        }
        
        console.log(`[CACHE MISS] Obteniendo movimiento ${moveId}`);
        
        try {
          // Implementación mejorada con reintentos
          let retries = 0;
          const maxRetries = 3;
          let response = null;
          
          while (retries < maxRetries) {
            try {
              response = await fetch(moveUrl);
              if (response.ok) break;
              retries++;
              await new Promise(r => setTimeout(r, 1000 * retries)); // Esperar más tiempo en cada reintento
            } catch (err) {
              retries++;
              if (retries >= maxRetries) throw err;
              await new Promise(r => setTimeout(r, 1000 * retries));
            }
          }
          
          if (!response || !response.ok) return null;
          
          const moveData = await response.json();
          
          // Guardar en caché
          pokemonCache.setMove(cacheKey, moveData);
          
          return moveData;
        } catch (error) {
          console.error(`Error obteniendo detalles del movimiento: ${error}`);
          return null;
        }
      };
      
      // Obtener detalles de todos los movimientos (limitados a los primeros 20 para eficiencia)
      const moveDetailsPromises = movesToProcess.slice(0, 20).map(move => 
        fetchMoveDetails(move.move.url)
      );
      
      const movesWithDetails = await Promise.all(moveDetailsPromises);
      const validMoves = movesWithDetails.filter(move => move !== null);
      
      // Filtrar movimientos con poder > 0
      const powerMoves = validMoves.filter(move => 
        move.power !== null && move.power > 0
      );
      
      if (powerMoves.length === 0) {
        console.warn(`No se encontraron movimientos con poder para ${this.name}`);
        return this.getFallbackMoves(allMoves);
      }
      
      // Separar movimientos según su categoría
      const preferredMoves = powerMoves.filter(move => 
        move.damage_class.name === preferredAttackType
      );
      
      const otherMoves = powerMoves.filter(move => 
        move.damage_class.name !== preferredAttackType
      );
      
      // Ordenar ambos grupos por poder (de mayor a menor)
      preferredMoves.sort((a, b) => b.power - a.power);
      otherMoves.sort((a, b) => b.power - a.power);
      
      // Seleccionar al menos 3 movimientos preferidos si hay suficientes
      const selectedPreferredCount = Math.min(3, preferredMoves.length);
      const selectedPreferred = preferredMoves.slice(0, selectedPreferredCount);
      
      // Completar hasta 4 movimientos con los otros más poderosos
      const remainingSlots = 4 - selectedPreferredCount;
      const selectedOthers = otherMoves.slice(0, remainingSlots);
      
      // Combinar ambos grupos
      const selectedMoves = [...selectedPreferred, ...selectedOthers];
      
      // Si no hay 4 movimientos, completar con los mejores restantes
      if (selectedMoves.length < 4 && preferredMoves.length > selectedPreferredCount) {
        const additionalPreferred = preferredMoves.slice(
          selectedPreferredCount, 
          selectedPreferredCount + (4 - selectedMoves.length)
        );
        selectedMoves.push(...additionalPreferred);
      }
      
      // Convertir a formato de movimientos para la batalla
      return selectedMoves.map(move => ({
        name: move.name.replace('-', ' '),
        url: `https://pokeapi.co/api/v2/move/${move.id}/`,
        power: move.power,
        type: move.type.name,
        damageClass: move.damage_class.name,
        accuracy: move.accuracy
      }));
    } catch (error) {
      console.error(`Error seleccionando movimientos para ${this.name}: ${error}`);
      return this.getFallbackMoves(allMoves);
    }
  }
  
  // Movimientos de respaldo si algo falla
  getFallbackMoves(allMoves) {
    return allMoves.slice(0, 4).map(move => ({
      name: move.move.name.replace('-', ' '),
      url: move.move.url
    }));
  }

  // Método estático para obtener un Pokémon desde la API con sus mejores movimientos (con caché)
  static async fetchPokemon(id) {
    try {
      // Normalizar el ID para usarlo como clave de caché
      const normalizedId = String(id).toLowerCase();
      const cacheKey = `pokemon-${normalizedId}`;
      
      // Verificar si el Pokémon está en caché
      const cachedPokemon = pokemonCache.get(cacheKey);
      if (cachedPokemon) {
        console.log(`[CACHE HIT] Pokémon ${normalizedId}`);
        return cachedPokemon;
      }
      
      console.log(`[CACHE MISS] Obteniendo Pokémon ${normalizedId}`);
      
      // Implementación mejorada con reintentos
      let retries = 0;
      const maxRetries = 3;
      let response = null;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (response.ok) break;
          retries++;
          await new Promise(r => setTimeout(r, 1000 * retries));
        } catch (err) {
          retries++;
          if (retries >= maxRetries) throw err;
          await new Promise(r => setTimeout(r, 1000 * retries));
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Error al obtener el Pokémon con ID ${id}`);
      }
      
      const data = await response.json();
      const pokemon = new Pokemon(data);
      
      // Procesar los movimientos de forma asíncrona
      pokemon.moves = await pokemon.selectBestMoves(data.moves);
      
      // Guardar en caché
      pokemonCache.set(cacheKey, pokemon);
      
      return pokemon;
    } catch (error) {
      console.error("Error en fetchPokemon:", error);
      throw error;
    }
  }
  
  // Métodos estáticos para administrar el caché
  static clearCache() {
    return pokemonCache.clear();
  }
  
  static getCacheStats() {
    return pokemonCache.getStats();
  }
}

export default Pokemon;
