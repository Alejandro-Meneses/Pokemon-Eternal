// API URLs para servicios Pokemon
const API_URL_POKEMON = process.env.REACT_APP_API_URL_POKEMON || 'http://localhost:5000/api/pokemon';

/**
 * Captura un nuevo Pokémon
 * @param {number} pokemonId - ID del Pokémon a capturar
 * @param {boolean} isShiny - Si el Pokémon es shiny
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const catchPokemon = async (pokemonId, isShiny = false, token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/catch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({ pokemonId, isShiny })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al capturar Pokémon:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al capturar Pokémon:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Obtiene el equipo Pokémon del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Equipo Pokémon
 */
export const getTeam = async (token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/team/complete`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener equipo:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener equipo Pokémon:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Obtiene la Pokedex del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pokedex del usuario
 */
export const getPokedex = async (token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/pokedex/complete`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener Pokedex:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener Pokedex:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Mueve un Pokémon del almacenamiento al equipo
 * @param {number} storageIndex - Índice del Pokémon en almacenamiento
 * @param {number} teamPosition - Posición en el equipo (1-6)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado del movimiento
 */
export const moveToTeam = async (storageIndex, teamPosition, token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/storage-to-team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({ storageIndex, teamPosition })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al mover Pokémon:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al mover Pokémon al equipo:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Obtiene el almacenamiento PC del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pokémon almacenados
 */
export const getStorage = async (token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/storage/complete`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener almacenamiento:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener almacenamiento Pokémon:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Mueve un Pokémon del equipo al PC
 * @param {number} position - Posición en el equipo (1-6)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado del movimiento
 */
export const moveToPC = async (position, token) => {
  try {
    const response = await fetch(`${API_URL_POKEMON}/team-to-storage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({ position })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al mover Pokémon al PC:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al mover Pokémon al PC:", error);
    return { error: error.message || "Error desconocido" };
  }
};