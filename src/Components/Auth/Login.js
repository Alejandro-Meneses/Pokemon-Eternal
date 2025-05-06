import React, { useState } from "react";
import "../../Styles/Login.css";
import { login } from "../../utils/authService";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Importa el componente de Font Awesome
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Importa los íconos necesarios

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ email, password });
      if (response.token) {
        // Inicio de sesión exitoso
        localStorage.setItem("token", response.token); // Guarda el token en localStorage
        alert("Inicio de sesión exitoso");
        onLogin(); // Llama a la función para actualizar el estado de autenticación
        navigate("/");
      } else {
        setError(response.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-toggle">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="register-link">
          Regístrate
        </a>
      </p>
    </div>
  );
}