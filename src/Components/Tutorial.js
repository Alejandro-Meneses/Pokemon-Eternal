import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Tutorial.css';

const Tutorial = () => {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  // Efecto para animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const nextSection = () => {
    if (activeSection < 5) {
      setActiveSection(activeSection + 1);
    }
  };

  const prevSection = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  return (
    <div className={`tutorial-container ${loaded ? 'loaded' : ''}`}>
      <div className="tutorial-content">
        <div className="tutorial-header">
          <h1 className="tutorial-title">Tutorial de Pokémon Eternal</h1>
        </div>
        
        <div className="tutorial-navigation">
          <div className="nav-dots">
            {[1, 2, 3, 4, 5].map((num) => (
              <div 
                key={num} 
                className={`nav-dot ${activeSection === num ? 'active' : ''}`}
                onClick={() => setActiveSection(num)}
              />
            ))}
          </div>
        </div>

        <div className="tutorial-sections">
          {/* Sección 1: Introducción - Versión más compacta */}
          {activeSection === 1 && (
            <div className="tutorial-section">
              <h2>Bienvenido a Pokémon Eternal</h2>
              <div className="tutorial-grid">
                <div className="tutorial-text">
                  <p>Pokémon Eternal es un juego inspirado en la clásica saga Pokémon:</p>
                  <ul>
                    <li>Explora y encuentra Pokémon salvajes</li>
                    <li>Captura y entrena tus Pokémon</li>
                    <li>Combate contra otros entrenadores</li>
                    <li>Conviértete en Maestro Pokémon</li>
                  </ul>
                </div>
                <div className="tutorial-image">
                  <img 
                    src="/images/tutorial/intro.png" 
                    alt="Introducción" 
                    className="tutorial-img"
                  />
                  <p className="image-caption">El mundo de Pokémon te espera</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Controles y Movimiento - Versión más compacta */}
          {activeSection === 2 && (
            <div className="tutorial-section">
              <h2>Controles y Movimiento</h2>
              <div className="tutorial-grid">
                <div className="tutorial-image">
                  <img 
                    src="/images/tutorial/controls.png" 
                    alt="Controles" 
                    className="tutorial-img"
                  />
                  <p className="image-caption">Controles del juego</p>
                </div>
                <div className="tutorial-text">
                  <h3>Teclado:</h3>
                  <ul>
                    <li><strong>↑↓←→</strong> o <strong>WASD</strong>: Mover personaje</li>
                    <li><strong>Enter/Space</strong>: Interactuar</li>
                    <li><strong>ESC</strong>: Menú / Cancelar</li>
                  </ul>
                  <h3>Dispositivos táctiles:</h3>
                  <ul>
                    <li>Botones direccionales en pantalla</li>
                    <li>Toca para interactuar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sección 3: Encuentros Pokémon - Versión más compacta */}
          {activeSection === 3 && (
            <div className="tutorial-section">
              <h2>Encuentros Pokémon</h2>
              <div className="tutorial-grid">
                <div className="tutorial-text">
                  <p>Encuentra Pokémon salvajes en hierba alta:</p>
                  <ul>
                    <li>Encuentros aleatorios en zonas de hierba</li>
                    <li>Diferentes Pokémon por área</li>
                    <li>Al encontrar un Pokémon, entra en batalla</li>
                  </ul>
                  <p>¡Lleva Pokémon sanos y Pokéballs!</p>
                </div>
                <div className="tutorial-image">
                  <img 
                    src="/images/tutorial/encounter.png" 
                    alt="Encuentro" 
                    className="tutorial-img"
                  />
                  <p className="image-caption">Encuentro en hierba alta</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 4: Sistema de Combate - Versión más compacta */}
          {activeSection === 4 && (
            <div className="tutorial-section">
              <h2>Sistema de Combate</h2>
              <div className="tutorial-grid">
                <div className="tutorial-image">
                  <img 
                    src="/images/tutorial/battle.png" 
                    alt="Combate" 
                    className="tutorial-img"
                  />
                  <p className="image-caption">Pantalla de batalla</p>
                </div>
                <div className="tutorial-text">
                  <h3>En batallas podrás:</h3>
                  <ul>
                    <li><strong>Luchar</strong>: Usar movimientos</li>
                    <li><strong>Pokémon</strong>: Cambiar Pokémon</li>
                    <li><strong>Mochila</strong>: Usar objetos</li>
                    <li><strong>Huir</strong>: Escape de batallas</li>
                  </ul>
                  <p>Batallas por turnos con tipos y ventajas.</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 5: Tips - Versión más compacta */}
          {activeSection === 5 && (
            <div className="tutorial-section">
              <h2>Tips para Maestros Pokémon</h2>
              <div className="tutorial-tips">
                <div className="tips-card">
                  <div className="tip-icon">💡</div>
                  <p><strong>Equilibra</strong> tu equipo con varios tipos.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">📊</div>
                  <p><strong>Aprende</strong> las ventajas de tipo.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">💾</div>
                  <p><strong>Guarda</strong> tu progreso regularmente.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">🧪</div>
                  <p><strong>Lleva</strong> pociones y antídotos.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">🗺️</div>
                  <p><strong>Explora</strong> para encontrar objetos.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="tutorial-controls">
          <button 
            className="tutorial-button secondary" 
            onClick={prevSection}
            disabled={activeSection === 1}
          >
            <span className="button-text">Anterior</span>
            <span className="button-icon">←</span>
          </button>
          
          <Link to="/" className="tutorial-button primary">
            <span className="button-text">Inicio</span>
            <span className="button-icon">🏠</span>
          </Link>

          {activeSection < 5 ? (
            <button className="tutorial-button secondary" onClick={nextSection}>
              <span className="button-text">Siguiente</span>
              <span className="button-icon">→</span>
            </button>
          ) : (
            <Link to="/game" className="tutorial-button primary">
              <span className="button-text">¡Jugar!</span>
              <span className="button-icon">🎮</span>
            </Link>
          )}
        </div>
      </div>
      
      <div className="pokeball-decoration top-left"></div>
      <div className="pokeball-decoration bottom-right"></div>
    </div>
  );
};

export default Tutorial;