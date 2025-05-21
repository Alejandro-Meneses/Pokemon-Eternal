import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Cambiado useNavigate por Link
import "../Styles/Welcome.css";

export default function Welcome() {
  const [loaded, setLoaded] = useState(false);
  
  // Efecto para animación de entrada
  useEffect(() => {
    // Aseguramos que la clase 'loaded' se aplique después de que el componente se monte
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`welcome-container ${loaded ? 'loaded' : ''}`}>
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">Pokémon Eternal</h1>
          <div className="welcome-subtitle">Tu aventura Pokémon comienza aquí</div>
        </div>
        
        <div className="welcome-body">
          <p className="welcome-text">
            Explora un vasto mundo lleno de criaturas fascinantes, colecciona y entrena 
            a tus Pokémon favoritos, enfrenta desafiantes batallas y conviértete en un 
            legendario Maestro Pokémon.
          </p>
          
          <div className="welcome-features">
            <div className="feature">
              <div className="feature-icon">🌍</div>
              <div className="feature-text">Mundo Infinito</div>
            </div>
            <div className="feature">
              <div className="feature-icon">⚔️</div>
              <div className="feature-text">Batallas épicas</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <div className="feature-text">Colecciona a todos</div>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <Link 
            to="/game" 
            className="welcome-button primary"
          >
            <span className="button-text">Comenzar Aventura</span>
            <span className="button-icon">→</span>
          </Link>
          <Link 
            to="/tutorial" 
            className="welcome-button secondary"
          >
            <span className="button-text">Ver Tutorial</span>
            <span className="button-icon">ℹ️</span>
          </Link>
        </div>
        
        <div className="welcome-footer">
          <div className="version">Versión 1.0</div>
          <div className="copyright">© 2025 Pokémon Eternal</div>
        </div>
      </div>
      
      <div className="pokeball-decoration top-left"></div>
      <div className="pokeball-decoration bottom-right"></div>
    </div>
  );
}