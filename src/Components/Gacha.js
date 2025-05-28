import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Gacha.css';
import { getBalance, spendPokedollars } from '../Services/WalletService';
import { catchPokemon } from '../Services/PokemonService';

const Gacha = () => {
  const [loaded, setLoaded] = useState(false);
  const [activeStarIndex, setActiveStarIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef(null);

  // Estado para los Pokedólares
  const [pokedollars, setPokedollars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);

  // Costo de usar el Gacha
  const GACHA_COST = 250;

  //Probabilidad de Shiny
  const SHINY_CHANCE = 1 / 2;


  // Efecto optimizado para cargar los Pokedólares
  useEffect(() => {
    const fetchPokedollars = async () => {
      try {
        const token = localStorage.getItem('token');

        // Usar el servicio wallet en lugar de axios
        const result = await getBalance(token);

        if (result.error) {
          showError("No se pudo cargar tu saldo. Inténtalo de nuevo.");
        } else {
          setPokedollars(result.pokedollars);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener el saldo:", error);
        setIsLoading(false);
        showError("No se pudo cargar tu saldo. Inténtalo de nuevo.");
      }
    };

    fetchPokedollars();
  }, []);

  // Función optimizada para gastar Pokedólares usando el servicio wallet
  const handleSpendPokedollars = async (amount) => {
    try {
      const token = localStorage.getItem('token');

      // Usar el servicio wallet en lugar de axios
      const result = await spendPokedollars(amount, 'gacha_pull', token);

      if (result.error) {
        showError(result.error);
        return false;
      }

      setPokedollars(result.pokedollars);
      return true;
    } catch (error) {
      console.error("Error al gastar Pokedólares:", error);
      showError("No se pudo realizar la operación. Inténtalo de nuevo.");
      return false;
    }
  };

  // Función para mostrar mensajes de error
  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorToast(true);

    setTimeout(() => {
      setShowErrorToast(false);
    }, 3000);
  };

  // Generar posiciones aleatorias para las estrellas
  const generateRandomPositions = useCallback(() => {
    const positions = [];

    // Dividir la pantalla en una cuadrícula 3x3 para mejor distribución
    for (let i = 0; i < 9; i++) {
      const gridX = i % 3;  // 0, 1, 2, 0, 1, 2, 0, 1, 2
      const gridY = Math.floor(i / 3);  // 0, 0, 0, 1, 1, 1, 2, 2, 2

      // Calcular posición dentro de su sección con algo de aleatoriedad
      const top = `${gridY * 25 + 10 + Math.random() * 20}%`;
      const left = `${gridX * 25 + 10 + Math.random() * 20}%`;

      positions.push({ top, left });
    }

    return positions;
  }, []);

  // Usar useMemo para generar posiciones aleatorias solo cuando se monta el componente
  const starPositions = useMemo(() => {
    return generateRandomPositions();
  }, [generateRandomPositions]);

  // Definición de qué estrellas se conectan entre sí
  const starConnections = useMemo(() => [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [5, 6], [6, 7], [7, 8],
    [0, 5], [1, 6], [3, 7], [4, 8]
  ], []);

  // Función para calcular las stats base de un Pokémon
  const calculateStats = (pokemonData) => {
    const stats = {};
    let total = 0;

    pokemonData.stats.forEach(stat => {
      const statName = stat.stat.name.replace('-', '_');
      stats[statName] = stat.base_stat;
      total += stat.base_stat;
    });

    stats.total = total; // Agregamos el total de stats
    return stats;
  };

  // Función para obtener los tipos del Pokémon
  const getTypes = (pokemonData) => {
    return pokemonData.types.map(typeInfo =>
      typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)
    );
  };

  // Función para determinar la rareza basada en stats totales
  const determineRarity = (stats) => {
    // Usar directamente el total calculado previamente
    const totalStats = stats.total;

    if (totalStats >= 600) return "Legendario";
    if (totalStats >= 500) return "Epico";
    if (totalStats >= 400) return "Raro";
    if (totalStats >= 250) return "Común";
    return "Común";
  };

  // Memoizar la función createConstellationLines
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
      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
      const toX = toRect.left + toRect.width / 2 - containerRect.left;
      const toY = toRect.top + toRect.height / 2 - containerRect.top;

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
  }, [starConnections]);

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

  // Efecto para animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      generateStars();

      // Crear las líneas de la constelación después de un breve retraso
      setTimeout(() => createConstellationLines(), 500);
    }, 100);

    return () => clearTimeout(timer);
  }, [createConstellationLines, generateStars]);

  // Función para obtener un Pokémon aleatorio
  const fetchRandomPokemon = async (pokemonIsShiny = false) => {
    try {
      //const pokemonIds =[580,162,511,835,940,447,448];
      const randomId = Math.floor(Math.random() * 1025) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const data = await response.json();

      // Verificar si tenemos acceso a las imágenes
      let mainImage;
      if (pokemonIsShiny && data.sprites.other['official-artwork'].front_shiny) {
        mainImage = data.sprites.other['official-artwork'].front_shiny;
      } else {
        mainImage = data.sprites.other['official-artwork'].front_default;
      }
      
      // Usar alternativas si la imagen oficial no está disponible
      if (!mainImage) {
        if (pokemonIsShiny && data.sprites.other.home.front_shiny) {
          mainImage = data.sprites.other.home.front_shiny;
        } else {
          mainImage = data.sprites.other.home.front_default ||
            data.sprites.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
        }
      }

      // Verificar sprite
      let sprite;
      if (pokemonIsShiny && data.sprites.front_shiny) {
        sprite = data.sprites.front_shiny;
      } else {
        sprite = data.sprites.front_default;
      }
      if (!sprite) {
        sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;
      }

      // Crear un objeto con los datos que necesitamos
      const pokemon = {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        image: mainImage,
        sprite: sprite,
        types: getTypes(data),
        stats: calculateStats(data),
        rarity: '',
        isShiny: pokemonIsShiny // Guardar el estado shiny en el objeto
      };

      // Determinar rareza basada en stats
      pokemon.rarity = determineRarity(pokemon.stats);
      
      // Si es shiny, aumentar un nivel la rareza
      if (pokemonIsShiny) {
        const rarities = ["Común", "Raro", "Epico", "Legendario"];
        const currentIndex = rarities.indexOf(pokemon.rarity);
        if (currentIndex < rarities.length - 1) {
          pokemon.rarity = rarities[currentIndex + 1];
        }
      }

      return pokemon;
    } catch (err) {
      console.error("Error fetching Pokemon:", err);
      return null;
    }
  };

  // Manejar click en una estrella
  const handleStarClick = async (index) => {
    // Ya está seleccionada, no hacemos nada
    if (activeStarIndex === index) return;

    // Verificar si el usuario tiene suficientes Pokedólares
    if (pokedollars < GACHA_COST) {
      showError(`No tienes suficientes Pokedólares. Necesitas ${GACHA_COST} para obtener un Pokémon.`);
      return;
    }

    // Intentar gastar los Pokedólares usando la nueva función
    const success = await handleSpendPokedollars(GACHA_COST);
    if (!success) {
      return; // La función handleSpendPokedollars ya muestra el mensaje de error
    }

    // Seleccionamos esta estrella
    setActiveStarIndex(index);

    // Destacar la estrella seleccionada y atenuar las líneas
    if (containerRef.current) {
      const fixedLines = containerRef.current.querySelectorAll('.fixed-constellation-line');
      fixedLines.forEach(line => {
        line.style.opacity = '0.3'; // Atenuar en lugar de ocultar
      });
    }

    try {
      // Determinar si el Pokémon será shiny (probabilidad muy baja)
      const pokemonIsShiny = Math.random() < SHINY_CHANCE;
      
      // Obtener un Pokémon aleatorio
      const randomPokemon = await fetchRandomPokemon(pokemonIsShiny);

      if (randomPokemon) {
        // Reiniciar el estado de carga de imagen
        setImageLoading(true);

        // Guardamos el Pokémon
        setSelectedPokemon(randomPokemon);
        
        // Intentar capturar el Pokémon (añadirlo a la pokedex y equipo/PC del usuario)
        try {
          const token = localStorage.getItem('token');
          const captureResult = await catchPokemon(randomPokemon.id, pokemonIsShiny, token);
          
          if (captureResult.error) {
            console.error("Error al capturar Pokémon:", captureResult.error);
            // No mostramos el error al usuario para no interrumpir la experiencia
          } else {
            console.log("Pokémon capturado exitosamente:", randomPokemon.name);
          }
        } catch (captureError) {
          console.error("Error en la captura del Pokémon:", captureError);
        }

        // Mostrar popup después de una breve pausa
        setTimeout(() => {
          setShowPopup(true);
          // Solo creamos partículas si hay un Pokémon
          setTimeout(() => {
            createParticleEffect();
          }, 100);
        }, 1000);
      }
    } catch (err) {
      console.error("Error en handleStarClick:", err);
    }
  };

  // Crear efecto de partículas
  const createParticleEffect = () => {
    // Verificar que selectedPokemon existe y que el contenedor está disponible
    if (!selectedPokemon || !containerRef.current) return;

    const particlesContainer = containerRef.current.querySelector('.particles');
    if (!particlesContainer) return;

    // Limpiar partículas anteriores
    particlesContainer.innerHTML = '';

    // Más partículas para Pokémon shiny
    const isShiny = selectedPokemon.isShiny;
    const particleCount = isShiny ? 50 : 30;
    
    // Añadir clase especial si es shiny
    const imageContainer = containerRef.current.querySelector('.pokemon-image-container');
    if (imageContainer) {
      if (isShiny) {
        imageContainer.classList.add('shiny');
      } else {
        imageContainer.classList.remove('shiny');
      }
    }

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      if (isShiny) {
        particle.classList.add('shiny-particle');
      }

      // Tamaño aleatorio - más grande para shiny
      const sizeBase = isShiny ? 4 : 2;
      const size = Math.random() * 8 + sizeBase;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Posición inicial en el centro
      particle.style.top = '50%';
      particle.style.left = '50%';

      // Color basado en el tipo de Pokémon o dorado si es shiny
      let particleColor = isShiny ? '#FFD700' : '#3498db'; // Color predeterminado o dorado para shiny

      try {
        if (selectedPokemon.types && selectedPokemon.types.length > 0) {
          const pokemonType = selectedPokemon.types[0].toLowerCase();
          
          if (!isShiny) {
            // Solo aplicamos colores tipo si no es shiny
            switch (pokemonType) {
              case 'fire': particleColor = '#F08030'; break;
              case 'water': particleColor = '#6890F0'; break;
              case 'grass': particleColor = '#78C850'; break;
              case 'electric': particleColor = '#F8D030'; break;
              case 'psychic': particleColor = '#F85888'; break;
              case 'ghost': particleColor = '#705898'; break;
              case 'dragon': particleColor = '#7038F8'; break;
              case 'normal': particleColor = '#A8A878'; break;
              case 'poison': particleColor = '#A040A0'; break;
              case 'flying': particleColor = '#A890F0'; break;
              case 'ice': particleColor = '#98D8D8'; break;
              default: particleColor = '#3498db'; break;
            }
          }
        }
      } catch (error) {
        console.error("Error al acceder al tipo de Pokémon:", error);
      }

      particle.style.background = particleColor;
      
      // Añadir brillo para partículas shiny
      if (isShiny) {
        particle.style.boxShadow = '0 0 8px gold';
      }

      // Animación más dramática para shiny
      const angle = Math.random() * Math.PI * 2;
      const velocity = isShiny ? Math.random() * 150 + 80 : Math.random() * 100 + 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      const duration = isShiny ? 2000 : 1500;

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${tx * 1.2}px), calc(-50% + ${ty * 1.2}px)) scale(0)`, opacity: 0 }
      ], {
        duration: duration,
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
          className={`dream-ball ${activeStarIndex === index ? 'active' : ''} ${pokedollars < GACHA_COST ? 'disabled' : ''}`}
          style={{ top: position.top, left: position.left }}
          onClick={() => handleStarClick(index)}
          title={pokedollars < GACHA_COST ? `Necesitas ${GACHA_COST} Pokedólares` : `Obtener Pokémon (${GACHA_COST} Pokedólares)`}
        ></div>
      ))}

      {/* Popup de Pokemon - Solo lo mostramos si selectedPokemon existe */}
      {selectedPokemon && (
        <div className={`pokemon-popup ${showPopup ? 'active' : ''}`}>
          <div className="popup-header">
            <h2 className="popup-title">¡Has encontrado un Pokémon!</h2>
          </div>

          <div className="pokemon-image-container">
            {imageLoading && <div className="pokemon-image-loading"></div>}
            <img
              src={selectedPokemon.image}
              alt={selectedPokemon.name}
              className="pokemon-image"
              style={{ display: imageLoading ? 'none' : 'block' }}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                e.target.onerror = null;
                // Intenta con un respaldo alternativo
                if (selectedPokemon.id) {
                  e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`;
                } else {
                  e.target.src = "../images/pokeball.svg"; // Imagen de respaldo final
                }
                setImageLoading(false);
                console.log("Error cargando imagen de Pokémon:", selectedPokemon.name);
              }}
            />
            <div className="particles"></div>
          </div>

          <div className="pokemon-info">
            <div className="pokemon-name">
              {selectedPokemon.name}
              {selectedPokemon.isShiny && (
                <span className="shiny-indicator" title="¡Pokémon Shiny!">✨</span>
              )}</div>

            <div className="pokemon-sprite">
              <img
                src={selectedPokemon.sprite}
                alt={`${selectedPokemon.name} sprite`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "../images/pokeball.svg";
                }}
              />
            </div>

            <div className="pokemon-types">
              {selectedPokemon.types.map((type, index) => (
                <span key={index} className={`pokemon-type type-${type.toLowerCase()}`}>{type}</span>
              ))}
            </div>

            <div className={`pokemon-rarity rarity-${selectedPokemon.rarity.toLowerCase().replace(' ', '-')}`}>
              ★ {selectedPokemon.rarity} ★
            </div>

            <div className="pokemon-stat-total">
              Poder Total: {selectedPokemon.stats.total}
            </div>
          </div>

          <div className="popup-buttons">
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

      {/* Mostrar Pokedólares */}
      <div className="pokedollar-display">
        <div className="pokedollar-icon">💰</div>
        <div className="pokedollar-amount">
          {isLoading ? "Cargando..." : `${pokedollars} P`}
        </div>
        <div className="gacha-cost">Costo: {GACHA_COST} P</div>
      </div>

      {/* Toast de error */}
      {showErrorToast && (
        <div className="error-toast">
          <div className="error-message">{errorMessage}</div>
        </div>
      )}

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