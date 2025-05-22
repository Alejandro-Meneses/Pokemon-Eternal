import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Gacha.css';

// Datos de muestra para los Pokemon
const samplePokemon = [
  { id: 1, name: "Bulbasaur", image: "../images/pokemon/bulbasaur.png", types: ["Planta", "Veneno"], rarity: "Común" },
  { id: 25, name: "Pikachu", image: "../images/pokemon/pikachu.png", types: ["Eléctrico"], rarity: "Poco común" },
  { id: 133, name: "Eevee", image: "../images/pokemon/eevee.png", types: ["Normal"], rarity: "Poco común" },
  { id: 150, name: "Mewtwo", image: "../images/pokemon/mewtwo.png", types: ["Psíquico"], rarity: "Legendario" },
  { id: 384, name: "Rayquaza", image: "../images/pokemon/rayquaza.png", types: ["Dragón", "Volador"], rarity: "Legendario" },
  { id: 6, name: "Charizard", image: "../images/pokemon/charizard.png", types: ["Fuego", "Volador"], rarity: "Raro" },
  { id: 94, name: "Gengar", image: "../images/pokemon/gengar.png", types: ["Fantasma", "Veneno"], rarity: "Raro" },
  { id: 131, name: "Lapras", image: "../images/pokemon/lapras.png", types: ["Agua", "Hielo"], rarity: "Poco común" },
  { id: 143, name: "Snorlax", image: "../images/pokemon/snorlax.png", types: ["Normal"], rarity: "Raro" }
];

const Gacha = () => {
  const [loaded, setLoaded] = useState(false);
  const [activeStarIndex, setActiveStarIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const containerRef = useRef(null);
  
  // Posiciones predefinidas para las estrellas
  const starPositions = [
    { top: '20%', left: '15%' },
    { top: '35%', left: '25%' },
    { top: '15%', left: '40%' },
    { top: '30%', left: '55%' },
    { top: '20%', left: '75%' },
    { top: '50%', left: '20%' },
    { top: '65%', left: '35%' },
    { top: '50%', left: '60%' },
    { top: '60%', left: '80%' }
  ];

  // Definición de qué estrellas se conectan entre sí
  const starConnections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Primera fila
    [5, 6], [6, 7], [7, 8], // Segunda fila
    [0, 5], [1, 6], [3, 7], [4, 8] // Conexiones verticales optimizadas
  ];

  // Memoizar la función createConstellationLines para evitar el warning de dependencias
  const createConstellationLines = useCallback(() => {
    if (!containerRef.current) return;
    
    // Primero, eliminar líneas existentes
    const existingLines = containerRef.current.querySelectorAll('.fixed-constellation-line');
    existingLines.forEach(line => line.remove());
    
    // Obtenemos las referencias a todas las estrellas
    const stars = containerRef.current.querySelectorAll('.dream-ball');
    if (stars.length < 9) return; // Asegurar que existen
    
    // Crear contenedor para las líneas si no existe
    let linesContainer = containerRef.current.querySelector('.constellation-lines');
    if (!linesContainer) {
      linesContainer = document.createElement('div');
      linesContainer.className = 'constellation-lines';
      containerRef.current.appendChild(linesContainer);
    }
    
    // Crear líneas basadas en las conexiones definidas
    starConnections.forEach(([fromIndex, toIndex]) => {
      const fromStar = stars[fromIndex];
      const toStar = stars[toIndex];
      
      if (!fromStar || !toStar) return;
      
      const fromRect = fromStar.getBoundingClientRect();
      const toRect = toStar.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calcular puntos centrales relativos al contenedor
      const fromX = fromRect.left + fromRect.width/2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height/2 - containerRect.top;
      const toX = toRect.left + toRect.width/2 - containerRect.left;
      const toY = toRect.top + toRect.height/2 - containerRect.top;
      
      // Calcular longitud y ángulo
      const length = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
      const angle = Math.atan2(toY - fromY, toX - fromX) * 180 / Math.PI;
      
      // Crear línea
      const line = document.createElement('div');
      line.className = 'fixed-constellation-line';
      line.style.width = `${length}px`;
      line.style.left = `${fromX}px`;
      line.style.top = `${fromY}px`;
      line.style.transform = `rotate(${angle}deg)`;
      
      linesContainer.appendChild(line);
    });
  }, [starConnections]); // Dependencia agregada correctamente

  // Generar estrellas de fondo
  const generateStars = useCallback(() => {
    if (!containerRef.current) return;
    
    const starsContainer = containerRef.current.querySelector('.stars');
    if (!starsContainer) return;
    
    // Limpiar estrellas existentes
    starsContainer.innerHTML = '';
    
    // Generar nuevas estrellas
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Tamaño aleatorio entre 1-3px
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Posición aleatoria
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      
      // Duración de animación aleatoria
      const duration = Math.random() * 3 + 2;
      star.style.animationDuration = `${duration}s`;
      
      // Retraso de animación aleatorio
      star.style.animationDelay = `${Math.random() * 5}s`;
      
      starsContainer.appendChild(star);
    }
  }, []);

  // Efecto para animación de entrada - ahora con dependencias correctas
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      generateStars();
      
      // Crear las líneas de la constelación después de un breve retraso
      setTimeout(() => createConstellationLines(), 500);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [createConstellationLines, generateStars]); // Dependencias agregadas correctamente

  // Manejar click en una estrella
  const handleStarClick = (index) => {
    // Ya está seleccionada, no hacemos nada
    if (activeStarIndex === index) return;
    
    // Seleccionamos esta estrella
    setActiveStarIndex(index);
    
    // Destacar la estrella seleccionada y atenuar las líneas
    if (containerRef.current) {
      const fixedLines = containerRef.current.querySelectorAll('.fixed-constellation-line');
      fixedLines.forEach(line => {
        line.style.opacity = '0.3'; // Atenuar en lugar de ocultar
      });
    }
    
    // Seleccionar un Pokémon aleatorio
    const randomPokemon = samplePokemon[Math.floor(Math.random() * samplePokemon.length)];
    
    // Primero guardamos el Pokémon 
    setSelectedPokemon(randomPokemon);
    
    // Mostrar popup después de una breve pausa
    setTimeout(() => {
      // Verificar de nuevo que tenemos un Pokémon seleccionado
      if (randomPokemon) {
        setShowPopup(true);
        // Solo creamos partículas si hay un Pokémon
        setTimeout(() => {
          createParticleEffect();
        }, 100);
      }
    }, 1000);
  };

  // Crear efecto de partículas
  const createParticleEffect = () => {
    // Verificar que selectedPokemon existe
    if (!selectedPokemon) return;
    
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Limpiar partículas anteriores
    particlesContainer.innerHTML = '';
    
    // Crear nuevas partículas
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Tamaño aleatorio
      const size = Math.random() * 8 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Posición inicial en el centro
      particle.style.top = '50%';
      particle.style.left = '50%';
      
      // Color basado en el tipo de Pokémon
      let particleColor = '#3498db'; // Color predeterminado
      
      try {
        const pokemonType = selectedPokemon.types[0].toLowerCase();
        
        switch(pokemonType) {
          case 'fuego': particleColor = '#F08030'; break;
          case 'agua': particleColor = '#6890F0'; break;
          case 'planta': particleColor = '#78C850'; break;
          case 'eléctrico': particleColor = '#F8D030'; break;
          case 'psíquico': particleColor = '#F85888'; break;
          case 'fantasma': particleColor = '#705898'; break;
          case 'dragón': particleColor = '#7038F8'; break;
          case 'normal': particleColor = '#A8A878'; break;
          case 'veneno': particleColor = '#A040A0'; break;
          case 'volador': particleColor = '#A890F0'; break;
          case 'hielo': particleColor = '#98D8D8'; break;
          default: particleColor = '#3498db'; break; // Caso default añadido
        }
      } catch (error) {
        console.error("Error al acceder al tipo de Pokémon:", error);
      }
      
      particle.style.background = particleColor;
      
      // Animación
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particle.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${tx * 1.2}px), calc(-50% + ${ty * 1.2}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 1500,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fill: 'forwards'
      });
      
      particlesContainer.appendChild(particle);
    }
  };

  // Cerrar popup
  const closePopup = () => {
    setShowPopup(false);
    
    // Restaurar las líneas originales
    if (containerRef.current) {
      const fixedLines = containerRef.current.querySelectorAll('.fixed-constellation-line');
      fixedLines.forEach(line => {
        line.style.opacity = '0.7';  // Restaurar opacidad original
      });
    }
    
    setTimeout(() => {
      setActiveStarIndex(null);
      // Ya no necesitamos esto porque eliminamos este estado
      // setActiveConstellation(null);
    }, 300); // Pequeño retraso para que la animación sea suave
  };

  return (
    <div 
      className={`constellation-container ${loaded ? 'loaded' : ''}`}
      ref={containerRef}
    >
      {/* Estrellas de fondo */}
      <div className="stars"></div>
      
      {/* Estrellas interactivas */}
      {starPositions.map((position, index) => (
        <div
          key={index}
          className={`dream-ball ${activeStarIndex === index ? 'active' : ''}`}
          style={{ top: position.top, left: position.left }}
          onClick={() => handleStarClick(index)}
        ></div>
      ))}
      
      {/* Popup de Pokemon - Solo lo mostramos si selectedPokemon existe */}
      {selectedPokemon && (
        <div className={`pokemon-popup ${showPopup ? 'active' : ''}`}>
          <div className="popup-header">
            <h2 className="popup-title">¡Has encontrado un Pokémon!</h2>
          </div>
          
          <div className="pokemon-image-container">
            <img 
              src={selectedPokemon.image} 
              alt={selectedPokemon.name}
              className="pokemon-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "../images/pokeball.svg"; // Imagen de respaldo
              }}
            />
            <div className="particles"></div>
          </div>
          
          <div className="pokemon-info">
            <div className="pokemon-name">{selectedPokemon.name}</div>
            <div>
              {selectedPokemon.types.map((type, index) => (
                <span key={index} className="pokemon-type">{type}</span>
              ))}
            </div>
            <div className="pokemon-rarity">★ {selectedPokemon.rarity} ★</div>
          </div>
          
          <div className="popup-buttons">
            <button 
              className="constellation-button secondary" 
              onClick={closePopup}
            >
              <span className="button-text">Cerrar</span>
            </button>
            
            <button 
              className="constellation-button primary"
              onClick={closePopup}
            >
              <span className="button-text">¡Genial!</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Overlay oscuro para el popup */}
      <div 
        className={`dark-overlay ${showPopup ? 'active' : ''}`}
        onClick={closePopup}
      ></div>
      
      {/* Interfaz de usuario */}
      <div className="constellation-ui">
        <h2 className="constellation-title">Constelación Pokémon</h2>
        <p className="constellation-description">
          Selecciona una estrella brillante para descubrir un Pokémon misterioso...
        </p>
        
        <div className="constellation-controls">
          <Link to="/" className="constellation-button primary">
            <span className="button-text">Inicio</span>
            <span className="button-icon">🏠</span>
          </Link>
        </div>
      </div>
      
      {/* Decoración */}
      <div className="constellation-decoration top-left"></div>
      <div className="constellation-decoration bottom-right"></div>
    </div>
  );
};

export default Gacha;