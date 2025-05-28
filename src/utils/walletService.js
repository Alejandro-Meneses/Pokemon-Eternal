// Usar una URL relativa para que funcione tanto en desarrollo local como en Vercel
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/wallet';

export const getBalance = async (token) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-auth-token": token
      },
      credentials: "include"
    });
    
    // Verificar primero si la respuesta es OK
    if (!response.ok) {
      // Intentar obtener el mensaje como texto para depuración
      const errorText = await response.text();
      console.error('Respuesta de error del servidor:', errorText);
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    // Solo parsear como JSON si la respuesta es OK
    const text = await response.text();
    console.log('Respuesta del servidor (texto):', text);
    
    // Intentar parsear el texto a JSON
    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      throw new Error('Formato de respuesta inválido');
    }
  } catch (error) {
    console.error("Error al obtener balance:", error);
    return { error: error.message };
  }
};

export const spendPokedollars = async (amount, reason, token) => {
  try {
    const response = await fetch(`${API_URL}/spend`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-auth-token": token
      },
      credentials: "include",
      body: JSON.stringify({ amount, reason })
    });
    
    const data = await response.json().catch(e => {
      console.error("Error al parsear respuesta:", e);
      return { error: "Error de formato en la respuesta del servidor" };
    });
    
    if (!response.ok) {
      throw new Error(data.error || `Error de servidor: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error al gastar pokedollars:", error);
    return { error: error.message };
  }
};

export const addPokedollars = async (amount, reason, token) => {
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-auth-token": token
      },
      credentials: "include",
      body: JSON.stringify({ amount, reason })
    });
    
    const data = await response.json().catch(e => {
      console.error("Error al parsear respuesta:", e);
      return { error: "Error de formato en la respuesta del servidor" };
    });
    
    if (!response.ok) {
      throw new Error(data.error || `Error de servidor: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error("Error al añadir pokedollars:", error);
    return { error: error.message };
  }
};