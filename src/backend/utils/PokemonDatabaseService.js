const User = require('../models/User');
const Pokemon = require('../models/Pokemon'); 

/**
 * Servicio para manejar operaciones de Pokémon con la base de datos
 */
const PokemonDatabaseService = {
    /**
     * Obtiene la Pokedex con datos completos
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Pokedex con detalles completos
     */
    getPokedexWithDetails: async (userId) => {
        try {
            const user = await User.findById(userId).select('pokedex');
            if (!user) throw new Error('Usuario no encontrado');
            
            const pokedexWithDetails = await Promise.all(
                user.pokedex.map(async (entry) => {
                    try {
                        const pokemon = await Pokemon.fetchPokemon(entry.pokemonId);
                        return {
                            ...entry.toObject(),
                            details: {
                                name: pokemon.name,
                                types: pokemon.types,
                                sprites: {
                                    front: pokemon.sprites.front || pokemon.sprites.front_default
                                }
                            }
                        };
                    } catch (error) {
                        console.error(`Error al obtener detalles para Pokémon ID ${entry.pokemonId}:`, error);
                        return entry.toObject();
                    }
                })
            );
            
            return pokedexWithDetails;
        } catch (error) {
            console.error('Error en getPokedexWithDetails:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene el equipo con datos completos
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Equipo Pokémon con detalles
     */
    getTeamWithDetails: async (userId) => {
        try {
            const user = await User.findById(userId).select('team');
            if (!user) throw new Error('Usuario no encontrado');
            
            const teamWithDetails = await Promise.all(
                user.team.sort((a, b) => a.position - b.position).map(async (teamMember) => {
                    try {
                        const pokemon = await Pokemon.fetchPokemon(teamMember.pokemonId);
                        return {
                            ...teamMember.toObject(),
                            details: {
                                name: pokemon.name,
                                types: pokemon.types,
                                stats: pokemon.stats,
                                moves: pokemon.moves,
                                sprites: teamMember.isShiny ?
                                    {
                                        front: pokemon.sprites.shiny || pokemon.sprites.front_default,
                                        back: pokemon.sprites.shinyBack || pokemon.sprites.back_default
                                    } :
                                    {
                                        front: pokemon.sprites.front || pokemon.sprites.front_default,
                                        back: pokemon.sprites.back || pokemon.sprites.back_default
                                    }
                            }
                        };
                    } catch (error) {
                        console.error(`Error al obtener detalles para Pokémon ID ${teamMember.pokemonId}:`, error);
                        return teamMember.toObject();
                    }
                })
            );
            
            return teamWithDetails;
        } catch (error) {
            console.error('Error en getTeamWithDetails:', error);
            throw error;
        }
    },
    
    /**
     * Añade un Pokémon al equipo
     * @param {string} userId - ID del usuario
     * @param {number} pokemonId - ID del Pokémon
     * @param {number} position - Posición en el equipo (1-6)
     * @param {boolean} isShiny - Si el Pokémon es shiny
     * @returns {Promise<Object>} Usuario actualizado
     */
    addToTeam: async (userId, pokemonId, position, isShiny = false) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('Usuario no encontrado');
            
            // Verificar posición válida
            if (!position || position < 1 || position > 6) {
                throw new Error('Posición no válida. Debe estar entre 1 y 6.');
            }
            
            // Verificar si hay que reemplazar un Pokémon en esa posición
            const existingPokemon = user.team.find(p => p.position === position);
            if (existingPokemon) {
                // Mover el Pokémon existente al almacenamiento
                user.storage.push({
                    pokemonId: existingPokemon.pokemonId,
                    isShiny: existingPokemon.isShiny,
                    dateAdded: new Date()
                });
                
                // Eliminar el Pokémon del equipo
                user.team = user.team.filter(p => p.position !== position);
            }
            
            // Añadir el nuevo Pokémon al equipo
            user.team.push({
                pokemonId,
                position,
                isShiny
            });
            
            // Añadirlo a la Pokedex si no estaba
            user.addToPokedex(pokemonId);
            
            await user.save();
            return user;
        } catch (error) {
            console.error('Error en addToTeam:', error);
            throw error;
        }
    },
    
    /**
     * Captura un nuevo Pokémon
     * @param {string} userId - ID del usuario
     * @param {number} pokemonId - ID del Pokémon
     * @param {boolean} isShiny - Si el Pokémon es shiny
     * @returns {Promise<Object>} Usuario actualizado
     */
    catchPokemon: async (userId, pokemonId, isShiny = false) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('Usuario no encontrado');
            
            // Añadir a la Pokedex
            user.addToPokedex(pokemonId);
            
            // Si hay espacio en el equipo (menos de 6), añadir directamente
            if (user.team.length < 6) {
                user.team.push({
                    pokemonId,
                    position: user.team.length + 1,
                    isShiny
                });
            } else {
                // De lo contrario, guardar en el PC
                user.storage.push({
                    pokemonId,
                    isShiny,
                    dateAdded: new Date()
                });
            }
            
            await user.save();
            return user;
        } catch (error) {
            console.error('Error en catchPokemon:', error);
            throw error;
        }
    },
    
    /**
     * Mueve un Pokémon del equipo al PC
     * @param {string} userId - ID del usuario
     * @param {number} position - Posición en el equipo (1-6)
     * @returns {Promise<Object>} Usuario actualizado
     */
    moveToPCStorage: async (userId, position) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('Usuario no encontrado');
            
            const pokemon = user.team.find(p => p.position === position);
            if (!pokemon) {
                throw new Error('No hay un Pokémon en esa posición');
            }
            
            // Añadir al almacenamiento
            user.storage.push({
                pokemonId: pokemon.pokemonId,
                isShiny: pokemon.isShiny,
                dateAdded: new Date()
            });
            
            // Quitar del equipo
            user.team = user.team.filter(p => p.position !== position);
            
            // Reordenar posiciones
            user.team.forEach(p => {
                if (p.position > position) {
                    p.position -= 1;
                }
            });
            
            await user.save();
            return user;
        } catch (error) {
            console.error('Error en moveToPCStorage:', error);
            throw error;
        }
    },
    
    /**
     * Mueve un Pokémon del PC al equipo
     * @param {string} userId - ID del usuario
     * @param {number} storageIndex - Índice en el almacenamiento
     * @param {number} teamPosition - Posición en el equipo (1-6)
     * @returns {Promise<Object>} Usuario actualizado
     */
    moveToTeam: async (userId, storageIndex, teamPosition) => {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('Usuario no encontrado');
            
            // Verificar si el índice del almacenamiento es válido
            if (storageIndex < 0 || storageIndex >= user.storage.length) {
                throw new Error('Índice de almacenamiento no válido');
            }
            
            // Verificar posición válida
            if (!teamPosition || teamPosition < 1 || teamPosition > 6) {
                throw new Error('Posición no válida. Debe estar entre 1 y 6.');
            }
            
            // Obtener el Pokémon del PC
            const storedPokemon = user.storage[storageIndex];
            
            // Verificar si hay que reemplazar un Pokémon en esa posición del equipo
            const existingTeamPokemon = user.team.find(p => p.position === teamPosition);
            if (existingTeamPokemon) {
                // Mover el Pokémon existente al almacenamiento
                user.storage.push({
                    pokemonId: existingTeamPokemon.pokemonId,
                    isShiny: existingTeamPokemon.isShiny,
                    dateAdded: new Date()
                });
                
                // Eliminar el Pokémon del equipo
                user.team = user.team.filter(p => p.position !== teamPosition);
            }
            
            // Añadir el Pokémon del PC al equipo
            user.team.push({
                pokemonId: storedPokemon.pokemonId,
                position: teamPosition,
                isShiny: storedPokemon.isShiny
            });
            
            // Eliminar el Pokémon del PC
            user.storage.splice(storageIndex, 1);
            
            await user.save();
            return user;
        } catch (error) {
            console.error('Error en moveToTeam:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene almacenamiento con detalles
     * @param {string} userId - ID del usuario
     * @returns {Promise<Array>} Almacenamiento con detalles
     */
    getStorageWithDetails: async (userId) => {
        try {
            const user = await User.findById(userId).select('storage');
            if (!user) throw new Error('Usuario no encontrado');
            
            const storageWithDetails = await Promise.all(
                user.storage.map(async (storedPokemon, index) => {
                    try {
                        const pokemon = await Pokemon.fetchPokemon(storedPokemon.pokemonId);
                        return {
                            ...storedPokemon.toObject(),
                            index, // Añadir índice para facilitar referencias
                            details: {
                                name: pokemon.name,
                                types: pokemon.types,
                                sprites: storedPokemon.isShiny ?
                                    { front: pokemon.sprites.shiny || pokemon.sprites.front_default } :
                                    { front: pokemon.sprites.front || pokemon.sprites.front_default }
                            }
                        };
                    } catch (error) {
                        console.error(`Error al obtener detalles para Pokémon ID ${storedPokemon.pokemonId}:`, error);
                        return { ...storedPokemon.toObject(), index };
                    }
                })
            );
            
            return storageWithDetails;
        } catch (error) {
            console.error('Error en getStorageWithDetails:', error);
            throw error;
        }
    },
};

module.exports = PokemonDatabaseService;