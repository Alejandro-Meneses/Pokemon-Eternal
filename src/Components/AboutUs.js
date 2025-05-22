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
                  <p>Pokémon Eternal nació de nuestra pasión por los juegos clásicos de Pokémon y nuestro deseo de crear una experiencia moderna que capture la magia del original.</p>
                  <p>Desarrollado como proyecto educativo, esta aplicación combina:</p>
                  <ul>
                    <li>Gráficos inspirados en los juegos clásicos</li>
                    <li>Mecánicas modernizadas de juego</li>
                    <li>Experiencia web accesible en cualquier dispositivo</li>
                    <li>Características sociales y multijugador</li>
                  </ul>
                </div>
                <div className="about-image">
                  <img 
                    src="/images/about/project.png" 
                    alt="Proyecto" 
                    className="about-img"
                  />
                  <p className="image-caption">Del concepto a la realidad</p>
                </div>
              </div>
            </div>
          )}

          {/* Sección 2: Nuestro Equipo */}
          {activeSection === 2 && (
            <div className="about-section">
              <h2>Nuestro Equipo</h2>
              <div className="team-grid">
                <div className="team-member">
                  <div className="member-avatar">
                    <img src="/images/about/member1.png" alt="Miembro del equipo" />
                  </div>
                  <h3>Nombre Apellido</h3>
                  <p className="member-role">Desarrollo Frontend</p>
                  <p className="member-description">
                    Especialista en React y desarrollo de interfaces de usuario. 
                    Responsable de la experiencia de usuario y animaciones.
                  </p>
                </div>
                
                <div className="team-member">
                  <div className="member-avatar">
                    <img src="/images/about/member2.png" alt="Miembro del equipo" />
                  </div>
                  <h3>Nombre Apellido</h3>
                  <p className="member-role">Desarrollo Backend</p>
                  <p className="member-description">
                    Experto en Node.js y bases de datos MongoDB.
                    Implementó la API RESTful y el sistema de autenticación.
                  </p>
                </div>
                
                <div className="team-member">
                  <div className="member-avatar">
                    <img src="/images/about/member3.png" alt="Miembro del equipo" />
                  </div>
                  <h3>Nombre Apellido</h3>
                  <p className="member-role">Diseño y Arte</p>
                  <p className="member-description">
                    Artista digital con experiencia en pixel art.
                    Creó los sprites, backgrounds y elementos visuales.
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
                      <div className="tech-icon">🔍</div>
                      <div className="tech-name">Jest</div>
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
                      <div className="contact-detail">info@pokemon-eternal.com</div>
                    </div>
                    <div className="contact-method">
                      <div className="contact-icon">🐦</div>
                      <div className="contact-detail">@PokemonEternal</div>
                    </div>
                    <div className="contact-method">
                      <div className="contact-icon">🐱</div>
                      <div className="contact-detail">github.com/pokemon-eternal</div>
                    </div>
                  </div>
                </div>
                
                <div className="acknowledgements">
                  <h3>Agradecimientos</h3>
                  <p>
                    Queremos agradecer a la comunidad de desarrolladores de juegos independientes
                    y a todos los fans de Pokémon cuya pasión nos ha inspirado. Este proyecto no habría
                    sido posible sin el apoyo de nuestra universidad y profesores.
                  </p>
                  <p>
                    Pokémon y todos los personajes relacionados son propiedad de Nintendo, 
                    Game Freak y The Pokémon Company. Este es un proyecto educativo sin fines comerciales.
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