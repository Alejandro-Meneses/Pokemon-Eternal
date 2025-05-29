import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Game.css";
import "../../Styles/StarterSelection.css"; 
import Pokemon from "../../backend/models/Pokemon";
import { getTeam, catchPokemon } from "../../Services/PokemonService"; 

export default function Game() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userHasPokemon, setUserHasPokemon] = useState(false); // Cambiado a false por defecto
  const [selectedStarter, setSelectedStarter] = useState(null);
  const [selectionCompleted, setSelectionCompleted] = useState(false);

  const navigate = useNavigate();
  
  // Generar estrellas para el fondo de selección
  useEffect(() => {
    if (!userHasPokemon && !loading) {
      generateStars();
    }
  }, [userHasPokemon, loading]);
  
  // Redireccionar al tablero cuando el usuario ya tiene Pokémon
  useEffect(() => {
    if (userHasPokemon && !loading) {
      navigate('/board');
    }
  }, [userHasPokemon, loading, navigate]);

  // Verificar si el usuario ya tiene Pokémon
  useEffect(() => {
    const checkUserPokemon = async () => { 
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No hay token de usuario, redirigiendo al login");
          navigate('/login');
          return;
        }
  
        console.log("Token encontrado, solicitando equipo del usuario...");
        const teamData = await getTeam(token);
        console.log("Datos recibidos del equipo:", teamData);
        
        if (teamData.error) {
          console.error("Error al obtener el equipo:", teamData.error);
          setError("No se pudo verificar tu equipo Pokémon");
          setLoading(false);
          return;
        }
  
        // Mostrar estructura completa del equipo para depuración
        console.log("Estructura del equipo:", JSON.stringify(teamData, null, 2));
        
        // CORREGIDO: Comprobar si teamData es un array (el equipo está directamente en teamData)
        const isArray = Array.isArray(teamData);
        console.log("¿teamData es un array?", isArray);
        
        if (isArray) {
          // Si teamData es directamente un array, verificar su longitud
          console.log("¿El array tiene elementos?", teamData.length > 0);
          
          if (teamData.length > 0) {
            console.log("El usuario tiene Pokémon en su equipo, estableciendo userHasPokemon=true");
            setUserHasPokemon(true);
            setLoading(false);
          } else {
            console.log("El usuario no tiene Pokémon, estableciendo userHasPokemon=false");
            setUserHasPokemon(false);
            setLoading(false);
          }
        } else {
          // Código original (por si acaso la estructura cambia en el futuro)
          const hasTeam = !!(teamData.team && teamData.team.length > 0);
          const hasPokedex = !!(teamData.pokedex && Object.keys(teamData.pokedex).length > 0);
          
          console.log("¿Tiene equipo?", hasTeam);
          console.log("¿Tiene Pokédex?", hasPokedex);
          
          if (hasTeam || hasPokedex) {
            console.log("El usuario tiene Pokémon, estableciendo userHasPokemon=true");
            setUserHasPokemon(true);
          } else {
            console.log("El usuario no tiene Pokémon, estableciendo userHasPokemon=false");
            setUserHasPokemon(false);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al verificar el equipo del usuario:", err);
        setError(err.message || "Ocurrió un error al cargar tus datos");
        setLoading(false);
      }
    };
  
    checkUserPokemon();
  }, [navigate]);

  // Función para generar estrellas en el fondo
  const generateStars = () => {
    setTimeout(() => {
      const container = document.querySelector('.starter-selection-container');
      if (!container) return;
      
      // Limpiar estrellas existentes
      const existingStars = container.querySelectorAll('.star');
      existingStars.forEach(star => star.remove());
      
      // Crear 100 estrellas
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Tamaño aleatorio entre 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Posición aleatoria
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        
        // Animación con retraso aleatorio
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        // Añadir al contenedor
        container.appendChild(star);
      }
    }, 100); // Pequeño retraso para asegurar que el contenedor existe
  };

  // Función auxiliar para obtener el nombre del Pokémon por ID
  const getPokemonNameById = (id) => {
    const pokemonNames = {
      // Gen 1
      1: "Bulbasaur", 4: "Charmander", 7: "Squirtle",
      // Gen 2
      152: "Chikorita", 155: "Cyndaquil", 158: "Totodile",
      // Gen 3
      252: "Treecko", 255: "Torchic", 258: "Mudkip",
      // Gen 4
      387: "Turtwig", 390: "Chimchar", 393: "Piplup",
      // Gen 5
      495: "Snivy", 498: "Tepig", 501: "Oshawott",
      // Gen 6
      650: "Chespin", 653: "Fennekin", 656: "Froakie",
      // Gen 7
      722: "Rowlet", 725: "Litten", 728: "Popplio",
      // Gen 8
      810: "Grookey", 813: "Scorbunny", 816: "Sobble",
      // Gen 9
      906: "Sprigatito", 909: "Fuecoco", 912: "Quaxly"
    };
    return pokemonNames[id] || `Pokemon #${id}`;
  };

  // Función para obtener una descripción básica del Pokémon
  const getPokemonDescription = (id) => {
    const descriptions = {
      // Gen 1
      1: "Un Pokémon tipo planta con una semilla en su espalda desde su nacimiento. La semilla crece gradualmente.",
      4: "La llama que tiene en la punta de su cola arde según sus sentimientos. Llamea levemente cuando está alegre.",
      7: "Cuando retrae su largo cuello en el caparazón, dispara agua a una presión increíble.",
      
      // Gen 2
      152: "Su dulce aroma calma los ánimos de batalla. Durante la fotosíntesis, emite un delicioso perfume.",
      155: "Es tímido y siempre se enrosca como una pelota. Si es atacado, enciende el fuego en su lomo para protegerse.",
      158: "Tiene la mandíbula fuerte. A veces la usa para morder y asustar a su Entrenador.",
      
      // Gen 3
      252: "Pequeño reptil ágil y veloz. Sus pies tienen ventosas que le permiten trepar superficies verticales.",
      255: "Pequeño pollito de fuego que tiene una temperatura interna muy alta. Puede lanzar fuego cuando se emociona.",
      258: "Su cuerpo está cubierto de una membrana húmeda. Puede deslizarse en el agua a gran velocidad.",
      
      // Gen 4
      387: "La concha en su espalda está hecha de tierra. En ella crecen arbustos cuando bebe agua.",
      390: "El fuego de su cola nunca se apaga. Sus travesuras ocasionan muchos problemas en la naturaleza.",
      393: "No le gusta que lo toquen, despliega su cresta cuando se enfada. Puede nadar más rápido que cualquier nadador olímpico.",
      
      // Gen 5
      495: "Absorbe luz solar para hacer la fotosíntesis. Cuando se siente enfermo, su cola cae.",
      498: "Puede respirar fuego por su nariz y correr a gran velocidad. Le encanta asar bayas para comer.",
      501: "La concha de su pecho está hecha de una materia muy resistente y la usa para atacar.",
      
      // Gen 6
      650: "Su cabeza y cuerpo están cubiertos de espinas. Cuando se enrosca, estas se vuelven muy filosas.",
      653: "Mordisquea ramitas para limarse los colmillos. Puede lanzar aire ardiente por sus orejas.",
      656: "Protege su piel con burbujas que produce en sus patas. Puede saltar edificios altos.",
      
      // Gen 7
      722: "Silencioso y elegante, puede atacar sin hacer ruido. Puede girar su cabeza casi 180 grados.",
      725: "Acumula pelo en su estómago y lo enciende para crear bolas de fuego. Muy independiente.",
      728: "Puede crear burbujas con su nariz. Cuando forma globos de agua, estos sirven como armas.",
      
      // Gen 8
      810: "Un pequeño mono con un palo que usa para marcar su ritmo. Golpea objetos para generar sonidos.",
      813: "Sus pies pueden generar mucho calor. Corre constantemente para mantener su temperatura.",
      816: "Es muy tímido y se esconde tras una máscara de agua. Cuando se asusta, dispara agua a presión.",
      
      // Gen 9
      906: "Un gato herbívoro que absorbe energía solar. Es juguetón pero puede ser tímido con extraños.",
      909: "Un cocodrilo de fuego que siempre está hambriento. Almacena calor en una bolsa en su cabeza.",
      912: "Un pato acuático con un sombrero natural. Es muy responsable y le gusta mantener todo en orden."
    };
    
    return descriptions[id] || "Un misterioso Pokémon del que se conoce muy poco.";
  };

  // Función auxiliar para obtener la imagen - CORREGIDA para usar front_default
  const getPokemonImage = (pokemon) => {
    if (!pokemon || !pokemon.sprites) {
      return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    }
    
    // Usar directamente el sprite front_default
    if (pokemon.sprites.front_default) {
      return pokemon.sprites.front_default;
    }
    
    // Segunda opción: sprites.front (para compatibilidad con el modelo actual)
    if (pokemon.sprites.front) {
      return pokemon.sprites.front;
    }
    
    // Tercera opción: usar ID directamente
    if (pokemon.id) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    }
    
    // Imagen de respaldo si todo lo demás falla
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
  };

  // Cargar y seleccionar un Pokémon inicial directamente por ID
  const loadAndSelectStarter = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      const pokemon = new Pokemon(data);
      setSelectedStarter(pokemon);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar el Pokémon:", err);
      setError("No se pudo cargar el Pokémon seleccionado");
      setLoading(false);
    }
  };

  // Confirmar la elección del Pokémon inicial
  const handleConfirmSelection = async () => {
    try {
      if (!selectedStarter) return;
      
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Capturar el Pokémon seleccionado
      const result = await catchPokemon(selectedStarter.id, false, token);
      
      if (result.error) {
        console.error("Error al capturar el Pokémon inicial:", result.error);
        setError("No se pudo añadir el Pokémon inicial a tu equipo");
        setLoading(false);
        return;
      }
      
      // Actualizar el estado para mostrar una animación o mensaje de éxito
      setSelectionCompleted(true);
      
      // MODIFICADO: Redireccionar al tablero después de un breve retraso
      setTimeout(() => {
        navigate('/board'); // Ir directamente al tablero
      }, 2000);
      
    } catch (err) {
      console.error("Error al confirmar la selección:", err);
      setError("Ocurrió un error al seleccionar tu Pokémon inicial");
      setLoading(false);
    }
  };

  // Si se está cargando
  if (loading) return (
    <div className="loading-container">
      <p>Cargando...</p>
    </div>
  );
  
  // Si hay un error
  if (error) return (
    <div className="error-container">
      <h2>Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Intentar de nuevo
      </button>
    </div>
  );

  // Si el usuario no tiene Pokémon, mostrar pantalla de selección de iniciales en estilo pixel art
  if (!userHasPokemon) {
    return (
      <div className="starter-selection-container">
        <div className="pokemon-selection-header">
          <h1>¡Bienvenido al mundo de Pokémon!</h1>
          <p>Elige tu primer Pokémon para comenzar tu aventura</p>
        </div>
        
        <>
          {/* Grid con todos los iniciales */}
          <div className="all-starters-grid">
            {/* Mostramos los iniciales agrupados por tipo (planta, fuego, agua) */}
            <div className="starter-type-row">
              {/* Primera fila - Tipo Planta */}
              {[1, 152, 252, 387, 495, 650, 722, 810, 906].map((id) => (
                <div 
                  key={id}
                  className={`starter-pixel-option ${selectedStarter && selectedStarter.id === id ? 'selected' : ''}`}
                  onClick={() => loadAndSelectStarter(id)}
                >
                  <img 
                    src={id >= 906 && id <= 1010 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` 
                      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`}
                    alt={`Pokemon #${id}`}
                    className="pokemon-pixel-icon"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                    }}
                  />
                  <div className="starter-option-label">
                    {getPokemonNameById(id)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="starter-type-row">
              {/* Segunda fila - Tipo Fuego */}
              {[4, 155, 255, 390, 498, 653, 725, 813, 909].map((id) => (
                <div 
                  key={id}
                  className={`starter-pixel-option ${selectedStarter && selectedStarter.id === id ? 'selected' : ''}`}
                  onClick={() => loadAndSelectStarter(id)}
                >
                  <img 
                    src={id >= 906 && id <= 1010 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` 
                      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`}
                    alt={`Pokemon #${id}`}
                    className="pokemon-pixel-icon"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                    }}
                  />
                  <div className="starter-option-label">
                    {getPokemonNameById(id)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="starter-type-row">
              {/* Tercera fila - Tipo Agua */}
              {[7, 158, 258, 393, 501, 656, 728, 816, 912].map((id) => (
                <div 
                  key={id}
                  className={`starter-pixel-option ${selectedStarter && selectedStarter.id === id ? 'selected' : ''}`}
                  onClick={() => loadAndSelectStarter(id)}
                >
                  <img 
                    src={id >= 906 && id <= 1010 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` 
                      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${id}.png`}
                    alt={`Pokemon #${id}`}
                    className="pokemon-pixel-icon"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                    }}
                  />
                  <div className="starter-option-label">
                    {getPokemonNameById(id)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nombre del Pokémon seleccionado */}
          {selectedStarter && (
            <div className="selected-starter-name">
              {selectedStarter.name.toUpperCase()}
            </div>
          )}

          {/* Botón para iniciar la aventura */}
          {selectedStarter && (
            <div className="starter-confirm-button-container">
              <button 
                className="starter-confirm-button"
                onClick={handleConfirmSelection}
                disabled={selectionCompleted}
                style={{ 
                  zIndex: 50, 
                  position: 'relative',
                  pointerEvents: 'auto' 
                }}
              >
                ¡Comenzar mi aventura!
              </button>
            </div>
          )}

          {/* Panel lateral con información del Pokémon seleccionado */}
          {selectedStarter && (
            <div className="selected-starter-info-panel">
              <div className="starter-artwork-container">
                <img 
                  src={getPokemonImage(selectedStarter)}
                  alt={selectedStarter.name} 
                  className="starter-artwork" 
                />
              </div>

              <div className="starter-details">
                <div className="starter-header">
                  <h3 className="starter-name">{selectedStarter.name.toUpperCase()}</h3>
                  <div className="starter-types">
                    {selectedStarter.types && selectedStarter.types.map((type, index) => (
                      <span key={index} className={`starter-type-badge ${type}`}>
                        {type.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="starter-stats-compact">
                  {selectedStarter.stats && Object.entries(selectedStarter.stats).slice(0, 6).map(([statName, value]) => {
                    // Función para obtener la abreviación más descriptiva
                    const getStatAbbr = (name) => {
                      const statMap = {
                        'hp': 'PS',           // Puntos de Salud
                        'attack': 'ATQ',      // Ataque
                        'defense': 'DEF',     // Defensa
                        'special-attack': 'ASP',   // Ataque Especial
                        'special-defense': 'DSP',  // Defensa Especial
                        'speed': 'VEL'        // Velocidad
                      };
                      return statMap[name] || name.substring(0, 3).toUpperCase();
                    };
                
                    return (
                      <div key={statName} className="starter-stat-bar">
                        <span className="starter-stat-name">{getStatAbbr(statName)}</span>
                        <div className="starter-stat-bar-container">
                          <div 
                            className={`starter-stat-bar-fill ${selectedStarter.types && selectedStarter.types.length > 0 ? selectedStarter.types[0] : 'normal'}`}
                            style={{width: `${Math.min(100, (value / 255) * 100)}%`}}
                          ></div>
                        </div>
                        <span className="starter-stat-value">{value}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="starter-info-section">
                  <h4 className="starter-info-title">DESCRIPCIÓN</h4>
                  <p className="starter-info-text">
                    {getPokemonDescription(selectedStarter.id)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diálogo de selección completada */}
          {selectionCompleted && (
            <div className="selection-completed-overlay">
              <div className="selection-result">
                <h2>¡Felicidades!</h2>
                <p>Has elegido a {selectedStarter.name.toUpperCase()} como tu primer Pokémon.</p>
                <div className="pokeball-animation">
                  <div className="pokeball-capture"></div>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    );
  }
  
  // Renderizar un componente de carga mientras se redirecciona
  return (
    <div className="loading-container">
      <p>Cargando...</p>
    </div>
  );
}