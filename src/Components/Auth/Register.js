import React, { useState } from "react";
import "../../Styles/Login.css"; // Reutiliza el mismo CSS que el login
import { register } from "../../utils/authService";
import { useNavigate, Link } from "react-router-dom"; // Importa useNavigate
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Importa el componente de Font Awesome
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Importa los íconos necesarios

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo estado para repetir contraseña
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Indicador de carga
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar/ocultar repetir contraseña
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setIsLoading(true); // Activa el indicador de carga

    try {
      const response = await register({ username, email, password });
      if (response.message) {
        // Registro exitoso
        alert("Registro exitoso");
        navigate("/login"); // Redirige a la página de login
      } else {
        setError(response.error || "Error al registrarse");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
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