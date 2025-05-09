// Usar una URL relativa para que funcione tanto en desarrollo local como en Vercel
const API_URL = process.env.REACT_APP_API_URL || '/api/auth';

export const register = async (userData) => {
  try {
    console.log("Intentando registro con:", userData.email);
    
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include", // Para enviar cookies si es necesario
      body: JSON.stringify(userData),
    });
    
    console.log("Respuesta de registro - Status:", response.status);
    
    // Intenta procesar la respuesta JSON incluso si no es OK
    const data = await response.json().catch(e => {
      console.error("Error al parsear respuesta:", e);
      return { error: "Error de formato en la respuesta del servidor" };
    });
    
    if (!response.ok) {
      throw new Error(data.error || `Error de servidor: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error completo en registro:", error);
    return { error: error.message };
  }
};

export const login = async (userData) => {
  try {
    console.log("Intentando login con:", userData.email);
    
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include", // Para enviar cookies si es necesario
      body: JSON.stringify(userData),
    });
    
    console.log("Respuesta de login - Status:", response.status);
    
    // Intenta procesar la respuesta JSON incluso si no es OK
    const data = await response.json().catch(e => {
      console.error("Error al parsear respuesta:", e);
      return { error: "Error de formato en la respuesta del servidor" };
    });
    
    if (!response.ok) {
      throw new Error(data.error || `Error de servidor: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error completo en login:", error);
    return { error: error.message };
  }
};