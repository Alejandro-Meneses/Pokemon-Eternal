const API_URL = process.env.REACT_APP_API_URL || 
  'https://proyecto-pokemon.onrender.com/api/auth';

export const register = async (userData) => {
  try {
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
  } catch (error) {
    console.error("Error en registro:", error);
    return { error: error.message };
  }
};

export const login = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al iniciar sesión");
    }

    return response.json();
  } catch (error) {
    console.error("Error en login:", error);
    return { error: error.message };
  }
};