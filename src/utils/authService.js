// Modifica la URL para que sea dinámica:
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://pokemon-eternal-api.onrender.com/api/auth'
  : 'http://localhost:5000/api/auth';
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