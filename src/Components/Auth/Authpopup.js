import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./AuthPopup.css";

export default function AuthPopup({ onClose }) {
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login y Register

  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup">
        <button className="auth-popup-close" onClick={onClose}>
          &times;
        </button>
        <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
        {isLogin ? (
          <Login toggleAuthPopup={() => setIsLogin(false)} />
        ) : (
          <Register toggleAuthPopup={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}