import React, { useState } from "react";
import "../../Styles/Login.css"; // Reutiliza el mismo CSS que el login
import { register } from "../../Services/AuthService";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar el formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, introduce un correo electrónico válido");
      return;
    }

    // Validar la longitud de la contraseña
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // Validar el nombre de usuario
    if (username.trim().length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    setError(""); // Limpiar errores anteriores
    setIsLoading(true); // Activa el indicador de carga

    try {
      const response = await register({ username, email, password });
      
      if (response.message) {
        // Registro exitoso
        alert("Registro exitoso. Por favor inicia sesión.");
        navigate("/login"); // Redirige a la página de login
      } else if (response.error) {
        setError(response.error);
      } else {
        setError("Error desconocido al registrarse");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setIsLoading(false); // Desactiva el indicador de carga
    }
  };

  return (
    <div className="login-container">
      <h1>Registrarse</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
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
        <div className="password-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repetir contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="auth-toggle">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="register-link">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}