const API_URL_PLAYER = process.env.REACT_APP_API_URL_PLAYER || 'http://localhost:5000/api/player';

/**
 * Obtener estadísticas del jugador
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas del jugador
 */
export const getPlayerStats = async (token) => {
  try {
    const response = await fetch(`${API_URL_PLAYER}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener estadísticas:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas del jugador:", error);
    return { error: error.message || "Error desconocido" };
  }
};

/**
 * Actualizar estadísticas tras una batalla
 * @param {boolean} victory - Indica si fue victoria o derrota
 * @param {number} pokeDollars - Cantidad de pokedollars ganados
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas actualizadas
 */
export const updateBattleResult = async (victory, pokeDollars, token) => {
  try {
    const response = await fetch(`${API_URL_PLAYER}/battle-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ victory, pokeDollars })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al actualizar resultado de batalla:', errorText);
      return { error: `Error del servidor: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al actualizar resultado de batalla:", error);
    return { error: error.message || "Error desconocido" };
  }
};