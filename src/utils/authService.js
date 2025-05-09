// Modifica la URL para que sea dinámica:
// Modifica la URL para que sea dinámica con el nombre correcto:
// filepath: /Users/alejandro/Proyecto/Pokemon Eternal/pokemon-eternal/src/utils/authService.js
const API_URL = process.env.REACT_APP_API_URL || 
  'https://proyecto-pokemon.onrender.com/api/auth';
  export const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al registrar");
  }

  return response.json();
};

export const login = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error al iniciar sesión");
  }

  // AÑADIR ESTA LÍNEA
  return response.json();
};