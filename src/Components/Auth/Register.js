import React, { useState } from "react";
import "../../Styles/Login.css"; // Reutiliza el mismo CSS que el login
import { register } from "../../Services/AuthService";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // Asegúrate de tener sweetalert2 instalado

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: ""
  });
  
  const navigate = useNavigate();

  // Nueva función para validar contraseña
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Al menos una letra mayúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Al menos un número");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Al menos un carácter especial (!@#$%^&*etc.)");
    }
    
    return errors;
  };

  // Nueva función para calcular la fortaleza de la contraseña
  const updatePasswordStrength = (newPassword) => {
    if (!newPassword) {
      setPasswordStrength({ score: 0, feedback: "", color: "" });
      return;
    }
    
    const hasLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
    
    // Calcular puntuación (0-4)
    const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    // Determinar mensaje basado en puntuación
    let feedback = "";
    let color = "";
    
    switch(score) {
      case 0:
        feedback = "Muy débil";
        color = "#FF5350"; // Rojo
        break;
      case 1:
        feedback = "Débil";
        color = "#FF8C00"; // Naranja
        break;
      case 2:
        feedback = "Aceptable";
        color = "#FFCE4B"; // Amarillo
        break;
      case 3:
        feedback = "Buena";
        color = "#78C850"; // Verde claro
        break;
      case 4:
        feedback = "Excelente";
        color = "#3D7DCA"; // Azul Pokemon
        break;
      default:
        feedback = "";
    }
    
    setPasswordStrength({ score, feedback, color });
  };

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

    // Validación avanzada de contraseña
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Swal.fire({
        title: 'Contraseña insegura',
        html: `<p>Tu contraseña debe incluir:</p>
        <ul style="text-align: left; display: inline-block;">
          ${passwordErrors.map(err => `<li>✖️ ${err}</li>`).join('')}
        </ul>
        <p>Una contraseña fuerte ayuda a proteger tu cuenta.</p>`,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3D7DCA',
        background: '#1f1d2b',
        color: '#f8f9fa',
        customClass: {
          popup: 'pokemon-alert-popup',
          title: 'pokemon-alert-title',
          confirmButton: 'pokemon-alert-button',
          htmlContainer: 'swal2-html-container'
        }
      });
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
        // Mostrar mensaje de éxito con SweetAlert2
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada. Por favor inicia sesión para continuar.',
          icon: 'success',
          confirmButtonText: 'Iniciar Sesión',
          confirmButtonColor: '#3D7DCA', // Azul Pokémon (--primary-color)
          background: '#1f1d2b', // Fondo oscuro (--theme-bg)
          color: '#f8f9fa', // Color texto claro (--light-color)
          iconColor: '#78C850', // Verde Pokémon (--type-grass-bg)
          customClass: {
            popup: 'pokemon-alert-popup',
            title: 'pokemon-alert-title',
            confirmButton: 'pokemon-alert-button',
            htmlContainer: 'swal2-html-container'
          }
        }).then(() => {
          navigate("/login"); // Redirige después de cerrar el alert
        });
      } else if (response.error) {
        // Mostrar error de respuesta API
        Swal.fire({
          title: 'Error en el registro',
          text: response.error,
          icon: 'error',
          confirmButtonText: 'Intentar de nuevo',
          confirmButtonColor: '#FF5350', // Rojo para error
          background: '#1f1d2b',
          color: '#f8f9fa',
          customClass: {
            popup: 'pokemon-alert-popup',
            title: 'pokemon-alert-title',
            confirmButton: 'pokemon-alert-button',
            htmlContainer: 'swal2-html-container'
          }
        });
        setError(response.error);
      } else {
        setError("Error desconocido al registrarse");
      }
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error al conectar con el servidor");
      
      // Mostrar error de excepción
      Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Por favor, inténtalo de nuevo más tarde.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FF5350',
        background: '#1f1d2b',
        color: '#f8f9fa',
        customClass: {
          popup: 'pokemon-alert-popup',
          title: 'pokemon-alert-title',
          confirmButton: 'pokemon-alert-button',
          htmlContainer: 'swal2-html-container'
        }
      });
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
            onChange={(e) => {
              const newPassword = e.target.value;
              setPassword(newPassword);
              updatePasswordStrength(newPassword);
            }}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        
        {/* Indicador de fortaleza de contraseña */}
        {password && (
          <div className="password-strength-container">
            <div className="password-strength-label">
              Fortaleza: <span style={{ color: passwordStrength.color }}>{passwordStrength.feedback}</span>
            </div>
            <div className="password-strength-meter">
              {Array(4).fill(0).map((_, index) => (
                <div 
                  key={index} 
                  className={`strength-segment ${index < passwordStrength.score ? "active" : ""}`}
                  style={{ backgroundColor: index < passwordStrength.score ? passwordStrength.color : "" }}
                ></div>
              ))}
            </div>
          </div>
        )}
        
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
        
        {/* Mensaje que aparece cuando las contraseñas no coinciden */}
        {password && confirmPassword && password !== confirmPassword && (
          <div className="password-match-error">
            Las contraseñas no coinciden
          </div>
        )}
        
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