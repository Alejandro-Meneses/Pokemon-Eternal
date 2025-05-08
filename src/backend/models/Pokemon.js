class Pokemon {
  constructor(data) {
    this.id = data.id; // ID del Pokémon
    this.name = data.name; // Nombre del Pokémon
    this.types = data.types.map((type) => type.type.name); // Tipos del Pokémon
    this.stats = data.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {}); // Estadísticas base como un objeto (ej: { attack: 80, defense: 70 })
    this.sprites = {
      front: data.sprites.front_default,
      back: data.sprites.back_default,
      shiny: data.sprites.front_shiny,
      officialArtwork: data.sprites.other["official-artwork"].front_default,
    }; // Sprites

    // Añadimos los movimientos (máximo 4)
    // En el constructor
    this.moves = data.moves.slice(0, 4).map(move => ({
      name: move.move.name.replace('-', ' '),
      url: move.move.url
    }));
  }

  // Método estático para obtener un Pokémon desde la API
  static async fetchPokemon(id) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener el Pokémon con ID ${id}`);
      }
      const data = await response.json();
      return new Pokemon(data); // Devuelve una instancia del modelo
    } catch (error) {
      console.error("Error en fetchPokemon:", error);// Manejo de errores
      throw error; // Lanza el error para que pueda manejarse en el componente
    }
  }
}

export default Pokemon; // Exporta la clase como default
