import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/Login.css";
import { login } from "../../Services/AuthService"; // Corregido: importar login, no register
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    if (!password) {
      setError("Por favor ingresa tu contraseña");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await login({ email, password });
      
      if (response.token) {
        // Inicio de sesión exitoso
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Notificar al usuario de forma más sutil (opcional: puedes mantener el alert)
        console.log("Inicio de sesión exitoso");
        
        // Actualizar estado de autenticación
        onLogin();
        
        // Redirigir a la página principal
        navigate("/");
      } else if (response.error) {
        setError(response.error);
      } else {
        setError("Error desconocido al iniciar sesión");
      }
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
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
          autoFocus
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-toggle">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="register-link">
          Regístrate
        </Link>
      </p>
    </div>
  );
}