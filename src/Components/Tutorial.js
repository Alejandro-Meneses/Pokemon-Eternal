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
    if (activeSection < 6) { // CAMBIADO DE 5 A 6
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
            {[1, 2, 3, 4, 5, 6].map((num) => ( // AGREGADO EL 6
              <div
                key={num}
                className={`nav-dot ${activeSection === num ? 'active' : ''}`}
                onClick={() => setActiveSection(num)}
              />
            ))}
          </div>
        </div>

        <div className="tutorial-sections">
          {/* Sección 1: Introducción */}
          {activeSection === 1 && (
            <div className="tutorial-section">
              <h2>Bienvenido a Pokémon Eternal</h2>
              <div className="tutorial-grid">
                <div className="tutorial-text">
                  <p>Pokémon Eternal es un juego inspirado en la clásica saga Pokémon:</p>
                  <ul>
                    <li>Explora y encuentra Pokémon salvajes</li>
                    <li>Colecciona Pokémon a través de los puntos en el Gacha</li>
                    <li>Combate contra Pokémon salvajes desafiantes</li>
                    <li>Conviértete en Maestro Pokémon</li>
                  </ul>
                </div>
                <div className="tutorial-image">
                  <img
                    src="/images/Welcome.jpg"
                    alt="Introducción"
                    className="tutorial-img"
                  />
                  <p className="image-caption">El mundo de Pokémon te espera</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Controles */}
          {activeSection === 2 && (
            <div className="tutorial-section">
              <h2 className="centered-title">Controles y Movimiento</h2>
              <div className="tutorial-grid">
                <div className="tutorial-text">
                  <h3>Teclado:</h3>
                  <ul>
                    <li><strong>↑↓←→</strong> o <strong>WASD:</strong></li>
                    <span>Mover personaje</span>
                  </ul>
                </div>
                <div className="tutorial-text">
                  <h3>Dispositivos táctiles:</h3>
                  <ul>
                    <li>Botones direccionales en pantalla</li>
                    <li>Toca para interactuar</li>
                  </ul>
                </div>
              </div>
              <br />
              <p className="centered-paragraph">
                Puedes jugar cómodamente tanto en PC como en dispositivos móviles. ¡Elige el método que prefieras y explora el mundo Pokémon a tu ritmo!
              </p>
            </div>
          )}

          {/* Sección 3: Encuentros Pokémon */}
          {activeSection === 3 && (
            <div className="tutorial-section">
              <h2>Encuentros Pokémon</h2>
              <div className="tutorial-grid">
                <div className="tutorial-text">
                  <p>Encuentra Pokémon salvajes en hierba alta:</p>
                  <ul>
                    <li>Encuentros aleatorios en zonas de hierba</li>
                    <li>Todos los Pokémon que te imaginas en las hierbas</li>
                    <li>Al encontrar un Pokémon, entra en batalla</li>
                  </ul>
                  <p>Gana a todos los Pokémon posibles para conseguir puntos y tirar en el gacha</p>
                </div>
                <div className="tutorial-image">
                  <img
                    src="/images/Encounter.png"
                    alt="Encuentro"
                    className="tutorial-img"
                  />
                  <p className="image-caption">Encuentro en hierba alta</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 4: Sistema de Combate */}
          {activeSection === 4 && (
            <div className="tutorial-section">
              <h2>Sistema de Combate</h2>
              <div className="tutorial-grid">
                <div className="tutorial-image">
                  <img
                    src="/images/Batalla.png"
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
                    <li><strong>Huir</strong>: Escape de batalla (50%)</li>
                  </ul>
                  <p>Batallas por turnos con tipos y ventajas.</p>
                  <p>
                    TIP: Cada Pokémon tiene movimientos únicos. Aprende las ventajas de tipo para maximizar tu estrategia.
                  </p>
                  <p>
                    Si dudas, una gran opción es usar <strong>movimientos del tipo del Pokémon</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

       {/* NUEVA SECCIÓN 5: Sistema Gacha */}
{/* NUEVA SECCIÓN 5: Sistema Gacha */}
{activeSection === 5 && (
  <div className="tutorial-section">
    <h2>Sistema Gacha</h2>
    <div className="tutorial-grid">
      <div className="tutorial-text">
        <h3>¿Cómo conseguir Pokémon?</h3>
        <ul>
          <li><strong>Gana puntos</strong> derrotando Pokémon salvajes</li>
          <li><strong>Usa los puntos</strong> en el sistema Gacha</li>
          <li><strong>Obtén Pokémon aleatorios</strong> para tu colección</li>
        </ul>
        
        {/* MOVER LA TARJETA AQUÍ DENTRO */}
        <div className="gacha-features">
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h4>Pokémon Raros</h4>
            <p>Posibilidad de obtener legendarios</p>
          </div>
        </div>
      </div>
      
      <div className="tutorial-image">
        <img
          src="/images/Gacha.png"
          alt="Sistema Gacha"
          className="tutorial-img"
        />
        <p className="image-caption">Sistema de invocación Gacha</p>
      </div>
    </div>
  </div>
)}
          {/* Sección 6: Tips (antes era la 5) */}
          {activeSection === 6 && (
            <div className="tutorial-section">
              <h2>Tips para Maestros Pokémon</h2>
              <div className="tutorial-tips">
                <div className="tips-card">
                  <div className="tip-icon">💡</div>
                  <p><strong>Equilibra</strong> tu equipo con varios tipos.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">📊</div>
                  <p>
                    <strong>
                      <a
                        href="https://pokemonalpha.es/wp-content/uploads/2020/05/tabla-tipos-988x1024.png"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        Aprende
                      </a>
                    </strong>
                    {" "}las ventajas de tipo.
                  </p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">☁️</div>
                  <p><strong>Tu partida</strong> está segura, ¡se guarda automáticamente!</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">🔥</div>
                  <p><strong>Derrota</strong> Pokémon para avanzar en dificultad.</p>
                </div>
                <div className="tips-card">
                  <div className="tip-icon">🎁</div>
                  <p><strong>Consigue</strong> mejores recompensas al superar los Pokémon más difíciles.</p>
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

          {activeSection < 6 ? ( // CAMBIADO DE 5 A 6
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