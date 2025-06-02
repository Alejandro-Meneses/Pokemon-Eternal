import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/Login.css";
import { login, resetPassword } from "../../Services/AuthService"; // Añadir resetPassword
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // Necesario importar

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Función para manejar la recuperación de contraseña
  const handleForgotPassword = async () => {
    const { value: forgotEmail, isConfirmed } = await Swal.fire({
      title: 'Recuperación de Contraseña',
      html: '<p>Introduce tu correo electrónico y te enviaremos una nueva contraseña.</p>',
      input: 'email',
      inputPlaceholder: 'correo@ejemplo.com',
      inputValue: email, // Pre-llenar con el email que el usuario ya ingresó
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3D7DCA',
      cancelButtonColor: '#6c757d',
      background: '#1f1d2b',
      color: '#f8f9fa'
    });

    if (!isConfirmed || !forgotEmail) return;

    try {
      // Mostrar cargando
      Swal.fire({
        title: 'Enviando...',
        text: 'Procesando tu solicitud',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
        background: '#1f1d2b',
        color: '#f8f9fa'
      });

      // Llamar a la API real de reseteo
      const result = await resetPassword(forgotEmail);
      
      if (result.success) {
        // Éxito 
        Swal.fire({
          title: '¡Enviado!',
          text: 'Si el correo está registrado, recibirás una nueva contraseña por correo electrónico.',
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3D7DCA',
          background: '#1f1d2b',
          color: '#f8f9fa'
        });
      } else {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      // Mostrar error pero mantener mensaje neutral por seguridad
      Swal.fire({
        title: 'Error',
        text: 'No se pudo procesar tu solicitud. Por favor, inténtalo más tarde.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FF5350',
        background: '#1f1d2b',
        color: '#f8f9fa'
      });
    }
  };

  // Mantener el resto del código de Login sin cambios
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
        
        {/* Añadir enlace de olvidé contraseña */}
        <div className="forgot-password">
          <span onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </span>
        </div>
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