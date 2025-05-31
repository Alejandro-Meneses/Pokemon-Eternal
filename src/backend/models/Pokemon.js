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
      front_shiny: data.sprites.front_shiny,   // Usar front_shiny en lugar de shiny
      back_shiny: data.sprites.back_shiny,     // Añadir back_shiny
      officialArtwork: data.sprites.other["official-artwork"].front_default,
    }; // Sprites

    // Guarda la lista completa de movimientos para procesarlos después
    this.allMoves = data.moves;
    
    // Configurar los mejores movimientos
    this.moves = this.selectBestMoves(data.moves);
  }

  // Método para determinar qué tipo de ataque es mejor para este Pokémon
  getBestAttackType() {
    // Comparar ataque físico vs especial
    const physicalAttack = this.stats.attack || 0;
    const specialAttack = this.stats['special-attack'] || 0;
    
    return physicalAttack >= specialAttack ? 'physical' : 'special';
  }

  // Método para seleccionar los 4 mejores movimientos
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
      
      // Función para obtener información detallada de un movimiento
      const fetchMoveDetails = async (moveUrl) => {
        try {
          const response = await fetch(moveUrl);
          if (!response.ok) return null;
          return await response.json();
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

  // Método estático para obtener un Pokémon desde la API con sus mejores movimientos
  static async fetchPokemon(id) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener el Pokémon con ID ${id}`);
      }
      
      const data = await response.json();
      const pokemon = new Pokemon(data);
      
      // Procesar los movimientos de forma asíncrona
      pokemon.moves = await pokemon.selectBestMoves(data.moves);
      
      return pokemon;
    } catch (error) {
      console.error("Error en fetchPokemon:", error);
      throw error;
    }
  }
}

export default Pokemon;
