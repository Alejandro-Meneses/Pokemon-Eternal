import React, { useState } from "react";
import { login } from "../../utils/authService";

export default function Login({ toggleAuthPopup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      if (response.token) {
        alert("Inicio de sesión exitoso");
        toggleAuthPopup(); // Cierra el popup
        // Aquí puedes guardar el token en localStorage o en un estado global
        localStorage.setItem("token", response.token);
      } else {
        setError(response.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div>
      <form className="auth-form" onSubmit={handleSubmit}>
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
        <button type="submit">Iniciar Sesión</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-toggle">
        ¿No tienes cuenta?{" "}
        <span onClick={toggleAuthPopup}>Regístrate</span>
      </p>
    </div>
  );
}