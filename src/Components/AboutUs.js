import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/AboutUs.css';

const AboutUs = () => {
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
    if (activeSection < 4) {
      setActiveSection(activeSection + 1);
    }
  };

  const prevSection = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  return (
    <div className={`about-container ${loaded ? 'loaded' : ''}`}>
      <div className="about-content">
        <div className="about-header">
          <h1 className="about-title">Sobre Nosotros</h1>
          <div className="about-subtitle">El equipo detrás de Pokémon Eternal</div>
        </div>

        <div className="about-navigation">
          <div className="nav-dots">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`nav-dot ${activeSection === num ? 'active' : ''}`}
                onClick={() => setActiveSection(num)}
              />
            ))}
          </div>
        </div>

        <div className="about-sections">
          {/* Sección 1: El Proyecto */}
          {activeSection === 1 && (
            <div className="about-section">
              <h2>El Proyecto Pokémon Eternal</h2>
              <div className="about-grid">
                <div className="about-text">
                  <p>Pokémon Eternal nació de mi pasión por los juegos de Pokémon y mi deseo de crear una experiencia sencilla y básica que capture la magia del original.</p>
                  <p>Desarrollado como proyecto educativo, esta aplicación combina:</p>
                  <ul>
                    <li>Gráficos inspirados en los juegos clásicos</li>
                    <li>Mecánicas básicas del juego</li>
                    <li>Experiencia web accesible en cualquier dispositivo</li>
                    <li>Un sistema de Gacha para coleccionar Pokémon</li>
                    <li>Combates simples contra Pokémon salvajes</li>
                    <li>Tutoriales y la mejor forma de aprender a combatir en Pokémon</li>
                  </ul>
                </div>
                <div className="about-image">
                  <img
                    src="/images/Gameboy.png"
                    alt="Proyecto"
                    className="about-img"
                  />
                  <p className="image-caption">Cada linea de codigo cuenta</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Nuestro Equipo */}
          {activeSection === 2 && (
            <div className="about-section">
              <h2>Creador</h2>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-avatar">
                    <img src="/images/Yo.jpg" alt="Miembro del equipo" />
                  </div>
                  <h3>Alejandro Meneses Sánchez</h3>
                  <p className="member-role">Desarrollo</p>
                  <p className="member-description">
                    Alumno de Desarollo de Aplicaciones Web aplicando todos mis conocimientos
                    en este proyecto. Me apasiona crear experiencias web únicas y accesibles.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Sección 3: Tecnologías */}
          {activeSection === 3 && (
            <div className="about-section">
              <h2>Tecnologías Utilizadas</h2>
              <div className="tech-grid">
                <div className="tech-category">
                  <h3>Frontend</h3>
                  <div className="tech-items">
                    <div className="tech-item">
                      <div className="tech-icon">⚛️</div>
                      <div className="tech-name">React</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">🧭</div>
                      <div className="tech-name">React Router</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">🎨</div>
                      <div className="tech-name">CSS</div>
                    </div>
                  </div>
                </div>

                <div className="tech-category">
                  <h3>Backend</h3>
                  <div className="tech-items">
                    <div className="tech-item">
                      <div className="tech-icon">🟢</div>
                      <div className="tech-name">Node.js</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">⚡</div>
                      <div className="tech-name">Express</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">🍃</div>
                      <div className="tech-name">MongoDB</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">🔒</div>
                      <div className="tech-name">JWT</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">🔑</div>
                      <div className="tech-name">bcrypt</div>
                    </div>
                  </div>
                </div>

                <div className="tech-category">
                  <h3>Herramientas</h3>
                  <div className="tech-items">
                    <div className="tech-item">
                      <div className="tech-icon">🐱</div>
                      <div className="tech-name">GitHub</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">▲</div>
                      <div className="tech-name">Vercel</div>
                    </div>
                    <div className="tech-item">
                      <div className="tech-icon">📝</div>
                      <div className="tech-name">VS Code</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección 4: Contacto */}
          {activeSection === 4 && (
            <div className="about-section">
              <h2>Contacto y Agradecimientos</h2>
              <div className="contact-section">
                <div className="contact-info">
                  <h3>¡Contáctanos!</h3>
                  <div className="contact-methods">
                    <div className="contact-method">
                      <div className="contact-icon">📧</div>
                      <a
                        className="contact-detail"
                        href="mailto:alejandro214003@gmail.com"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        alejandro214003@gmail.com
                      </a>
                    </div>
                    <div className="contact-method">
                      <div className="contact-icon">🐦</div>
                      <a
                        className="contact-detail"
                        href="https://twitter.com/PokemonEternal"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        @PokemonEternal
                      </a>
                    </div>
                    <div className="contact-method">
                      <div className="contact-icon">🐱</div>
                      <a
                        className="contact-detail"
                        href="https://github.com/Alejandro-Meneses/Pokemon-Eternal"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'underline' }}
                      >
                        github.com/Pokemon-Eternal
                      </a>
                    </div>
                  </div>
                </div>

                <div className="acknowledgements">
                  <h3>¡Gracias por llegar hasta aquí!</h3>
                  <p>
                    Si has leído hasta este punto y has probado Pokémon Eternal, ¡muchas gracias por tu interés y tu tiempo! Este proyecto está hecho con mucha pasión y dedicación, y espero que te haya servido para aprender, divertirte o simplemente recordar la magia de Pokémon.
                  </p>
                  <p>
                    Recuerda que nada supera la experiencia de jugar a los juegos originales de Pokémon, donde descubrirás historias, aventuras y desafíos únicos. Te animo a explorar el mundo Pokémon en todas sus formas y a seguir aprendiendo y disfrutando.
                  </p>
                  <p>
                    Si tienes sugerencias, dudas o simplemente quieres compartir tu experiencia, no dudes en ponerte en contacto. ¡Tu feedback es muy valioso!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="about-controls">
          <button
            className="about-button secondary"
            onClick={prevSection}
            disabled={activeSection === 1}
          >
            <span className="button-text">Anterior</span>
            <span className="button-icon">←</span>
          </button>

          <Link to="/" className="about-button primary">
            <span className="button-text">Inicio</span>
            <span className="button-icon">🏠</span>
          </Link>

          {activeSection < 4 ? (
            <button className="about-button secondary" onClick={nextSection}>
              <span className="button-text">Siguiente</span>
              <span className="button-icon">→</span>
            </button>
          ) : (
            <Link to="/game" className="about-button primary">
              <span className="button-text">¡Jugar!</span>
              <span className="button-icon">🎮</span>
            </Link>
          )}
        </div>

        <div className="about-footer">
          <div className="version">Versión 1.0</div>
          <div className="copyright">© 2025 Pokémon Eternal</div>
        </div>
      </div>

      <div className="pokeball-decoration top-left"></div>
      <div className="pokeball-decoration bottom-right"></div>
    </div>
  );
};

export default AboutUs;