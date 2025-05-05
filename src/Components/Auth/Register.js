import React, { useState } from "react";
import { register } from "../../utils/authService";

export default function Register({ toggleAuthPopup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register({ username, email, password });
      if (response.message) {
        alert("Registro exitoso");
        toggleAuthPopup(); // Cierra el popup
      } else {
        setError(response.error || "Error al registrarse");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-toggle">
        ¿Ya tienes cuenta?{" "}
        <span onClick={toggleAuthPopup}>Inicia sesión</span>
      </p>
    </div>
  );
}