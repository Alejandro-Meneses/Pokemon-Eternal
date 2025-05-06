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
    }
  }
  export default Pokemon; // Exporta la clase como default