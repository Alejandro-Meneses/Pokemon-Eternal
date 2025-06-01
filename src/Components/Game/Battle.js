import React, { useState, useEffect, useRef } from "react";
import "../../Styles/Battle.css";
import Pokemon from "../../backend/models/Pokemon";
import BattleEngine from "../../backend/battle/Battleengine";
import { ReactComponent as PokeballIcon } from "../../images/Pokeball.svg";
import { useNavigate, useLocation } from "react-router-dom"; // Añadido useLocation
import { getTeam } from "../../Services/PokemonService"; // Importar getTeam

const Battle = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Para obtener el playerLevel
    
    // Obtener el nivel del jugador (por defecto 1)
    const playerLevel = location.state?.playerLevel || 1;
    
    const [playerPokemon, setPlayerPokemon] = useState(null);
    const [rivalPokemon, setRivalPokemon] = useState(null);
    const [showMoves, setShowMoves] = useState(false);
    const [moves, setMoves] = useState([]);
    const [battleEngine, setBattleEngine] = useState(null);
    const [battleLog, setBattleLog] = useState([]);
    const [battleMessage, setBattleMessage] = useState(null);
    const [playerHP, setPlayerHP] = useState({ current: 0, max: 0, percentage: 100 });
    const [rivalHP, setRivalHP] = useState({ current: 0, max: 0, percentage: 100 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [battleOver, setBattleOver] = useState(false);
    const [battleResult, setBattleResult] = useState(null); // Añadido para resultado

    // Estado para el selector de Pokémon
    const [showPokemonSelector, setShowPokemonSelector] = useState(false);
    const [teamPokemon, setTeamPokemon] = useState([]);

    // Estado para mantener el HP actual de todos los Pokémon del equipo
    const [teamHP, setTeamHP] = useState({});

    // Tooltip personalizado
    const [tooltipContent, setTooltipContent] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Referencia para auto-scroll del log de batalla
    const logContainerRef = useRef(null);

    // Funciones para el tooltip personalizado
    const showTooltip = (content, event) => {
        setTooltipContent(content);
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    const hideTooltip = () => {
        setTooltipContent(null);
    };

    // Función para actualizar el HP de un Pokémon en el equipo
    const updateTeamPokemonHP = (pokemonId, currentHP) => {
        // Actualizar el estado de HP para todo el equipo
        setTeamHP(prev => ({
            ...prev,
            [pokemonId]: currentHP
        }));

        // También actualizar el HP en el array del equipo para reflejar en UI
        setTeamPokemon(prevTeam => prevTeam.map(pokemon =>
            pokemon.id === pokemonId
                ? { ...pokemon, currentHP }
                : pokemon
        ));

        // Guardar en localStorage para persistencia básica
        const savedTeamHP = JSON.parse(localStorage.getItem('pokemon_team_hp') || '{}');
        savedTeamHP[pokemonId] = currentHP;
        localStorage.setItem('pokemon_team_hp', JSON.stringify(savedTeamHP));
    };

    // Función para calcular el factor de boost del rival según el nivel del jugador
    const calculateRivalLevelBoost = (level) => {
        // Nivel 1: sin boost, Nivel 10: 2x boost
        return 1 + ((level - 1) * 0.11);
    };

    // Función para aplicar boost a los stats del rival
    const applyRivalBoost = (pokemon, boostFactor) => {
        // Crear copia profunda del Pokémon
        const boostedPokemon = JSON.parse(JSON.stringify(pokemon));
        
        // Aplicar boost a las estadísticas
        Object.keys(boostedPokemon.stats).forEach(stat => {
            boostedPokemon.stats[stat] = Math.ceil(boostedPokemon.stats[stat] * boostFactor);
        });
        
        return boostedPokemon;
    };

    useEffect(() => {
        const fetchBattlePokemons = async () => {
            try {
                // 1. Cargar HP guardado de localStorage si existe
                const savedTeamHP = JSON.parse(localStorage.getItem('pokemon_team_hp') || '{}');
                setTeamHP(savedTeamHP);

                // 2. Obtener el equipo del jugador
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No se encontró token de autenticación");
                    setBattleMessage("Error: No estás autenticado. Volviendo al mapa...");
                    setTimeout(() => navigate('/board'), 2000);
                    return;
                }

                const teamData = await getTeam(token);

                if (!teamData || teamData.error || !Array.isArray(teamData) || teamData.length === 0) {
                    console.error("Error al obtener el equipo o equipo vacío:", teamData);
                    setBattleMessage("Error: No tienes Pokémon en tu equipo. Volviendo al mapa...");
                    setTimeout(() => navigate('/board'), 2000);
                    return;
                }

                console.log("Equipo del jugador:", teamData);

                // 3. Cargar los datos completos de cada Pokémon del equipo
                const completeTeam = await Promise.all(
                    teamData.map(async (pokemon) => {
                        const fullPokemon = await Pokemon.fetchPokemon(pokemon.pokemonId);
                        // Copiar datos como isShiny del equipo original
                        fullPokemon.isShiny = pokemon.isShiny || false;
                        fullPokemon._id = pokemon._id;
                        fullPokemon.position = pokemon.position;

                        // Usar HP guardado o el máximo
                        if (savedTeamHP[fullPokemon.id]) {
                            fullPokemon.currentHP = savedTeamHP[fullPokemon.id];
                        } else {
                            fullPokemon.currentHP = fullPokemon.stats.hp;
                            // Inicializar en el estado de HP del equipo
                            setTeamHP(prev => ({
                                ...prev,
                                [fullPokemon.id]: fullPokemon.currentHP
                            }));
                        }

                        return fullPokemon;
                    })
                );

                // 4. Guardar todo el equipo completo para el selector
                setTeamPokemon(completeTeam);
                console.log("Equipo completo cargado:", completeTeam);

                // 5. Usar el primer Pokémon con HP > 0 como activo
                let playerInstance = completeTeam.find(pokemon => pokemon.currentHP > 0) || completeTeam[0];
                
                // Generar rival
                const rivalId = Math.floor(Math.random() * 1025) + 1;
                let rivalInstance = await Pokemon.fetchPokemon(rivalId);
                
                // Ajustar el nivel del rival según el nivel del jugador
                const rivalLevelBoost = calculateRivalLevelBoost(playerLevel);
                
                // Aplicar boost de stats al rival basado en el nivel del jugador
                rivalInstance = applyRivalBoost(rivalInstance, rivalLevelBoost);

                console.log(`Pokémon rival ajustado al nivel del jugador ${playerLevel} (boost: ${rivalLevelBoost}x)`);
                console.log("Pokémon del jugador completo:", playerInstance);
                console.log("Pokémon rival:", rivalInstance);

                // 6. Inicializar HP y UI
                setPlayerHP({
                    current: playerInstance.currentHP,
                    max: playerInstance.stats.hp,
                    percentage: (playerInstance.currentHP / playerInstance.stats.hp) * 100
                });

                setRivalHP({
                    current: rivalInstance.stats.hp,
                    max: rivalInstance.stats.hp,
                    percentage: 100
                });

                // 7. Configurar movimientos
                setMoves(playerInstance.moves || []);
                console.log("Movimientos del jugador:", playerInstance.moves);

                // 8. Establecer los Pokémon y el motor de batalla
                setPlayerPokemon(playerInstance);
                setRivalPokemon(rivalInstance);

                // 9. Inicializar el motor de batalla
                const engine = new BattleEngine(playerInstance, rivalInstance);
                setBattleEngine(engine);
                setBattleLog(["¡Comienza el combate!"]);
                setBattleMessage("¿Qué debería hacer " + playerInstance.name + "?");

            } catch (error) {
                console.error("Error al cargar los Pokémon:", error);
                setBattleMessage("Error al iniciar el combate. Inténtalo de nuevo.");
            }
        };

        fetchBattlePokemons();
    }, [navigate, playerLevel]);

    // Auto-scroll para el log de batalla
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [battleLog]);

    useEffect(() => {
        // Cuando battleOver cambia a true, configurar un temporizador para volver al mapa
        if (battleOver) {
            // Si el jugador ganó, enviar evento de victoria
            if (battleResult === 'victory') {
                // Enviar evento personalizado para informar al Board
                const battleEvent = new CustomEvent('battleResult', { 
                    detail: { 
                        victory: true,
                        pokeDollars: 25
                    } 
                });
                window.dispatchEvent(battleEvent);
            }
            
            const timer = setTimeout(() => {
                navigate('/Board');
            }, 2500); // 2.5 segundos de espera

            // Limpieza del temporizador si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [battleOver, battleResult, navigate]);

    // Funciones para manejar los clics en los botones
    const handleAttack = () => {
        setShowMoves(true);
    };

    // Función modificada para mostrar el selector de Pokémon
    const handlePokemon = () => {
        setShowPokemonSelector(true);
    };

    // Función mejorada para el cambio de Pokémon
    const handlePokemonChange = async (selectedPokemon) => {
        if (selectedPokemon.id === playerPokemon.id) {
            setBattleLog(prev => [...prev, `${selectedPokemon.name} ya está en combate.`]);
            setShowPokemonSelector(false);
            return;
        }

        if (selectedPokemon.currentHP <= 0) {
            setBattleLog(prev => [...prev, `¡${selectedPokemon.name} está debilitado y no puede combatir!`]);
            setShowPokemonSelector(false);
            return;
        }

        setIsAnimating(true);
        setShowPokemonSelector(false);

        try {
            // 1. Guardar HP del Pokémon actual antes de cambiarlo
            updateTeamPokemonHP(playerPokemon.id, playerHP.current);

            // 2. Registrar el cambio en el log de batalla
            setBattleMessage(`¡Vuelve, ${playerPokemon.name}!`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Actualizar el motor de batalla con el nuevo Pokémon
            const switchResult = battleEngine.switchPlayerPokemon(selectedPokemon);

            // 4. Actualizar el Pokémon actual en la batalla
            const previousPokemon = playerPokemon;
            setPlayerPokemon(selectedPokemon);

            // 5. Actualizar el HP en la interfaz
            setPlayerHP({
                current: selectedPokemon.currentHP,
                max: selectedPokemon.stats.hp,
                percentage: (selectedPokemon.currentHP / selectedPokemon.stats.hp) * 100
            });

            // 6. Actualizar los movimientos disponibles
            setMoves(selectedPokemon.moves || []);

            // 7. Mostrar mensaje de entrada del nuevo Pokémon
            setBattleLog(prev => [...prev, `¡Vuelve, ${previousPokemon.name}! ¡Adelante, ${selectedPokemon.name}!`]);
            setBattleMessage(`¡Adelante, ${selectedPokemon.name}!`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 8. El rival ataca al nuevo Pokémon (pierde el turno por cambiar)
            setBattleMessage(`Tu rival aprovecha el cambio...`);
            await new Promise(resolve => setTimeout(resolve, 800));

            // 9. Ejecutar el ataque del rival directamente
            await executeRivalAttack();
        } catch (error) {
            console.error("Error al cambiar Pokémon:", error);
            setBattleLog(prev => [...prev, "¡Ha ocurrido un error al cambiar de Pokémon!"]);
        } finally {
            setIsAnimating(false);
        }
    };

    const handleClosePokemonSelector = () => {
        setShowPokemonSelector(false);
    };

    const handleRun = async () => {
        if (!battleEngine || isAnimating || battleOver) return;

        setIsAnimating(true);
        setBattleLog(prev => [...prev, "Has intentado huir..."]);

        // 50% de probabilidad de escapar
        if (Math.random() > 0.5) {
            setBattleLog(prev => [...prev, "¡Has escapado con éxito!"]);
            setBattleOver(true);
            setBattleMessage("Has escapado del combate. ¡Hasta la próxima!");
        } else {
            setBattleLog(prev => [...prev, "¡No has podido escapar!"]);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // El rival ataca después de un intento fallido de huida
            await executeRivalAttack();
        }

        setIsAnimating(false);
    };

    const handleBackToMainMenu = () => {
        setShowMoves(false);
    };

    // Función executeRivalAttack mejorada
    const executeRivalAttack = async () => {
        if (!battleEngine || battleOver) return;

        setIsAnimating(true);
        setBattleMessage(`${rivalPokemon.name} está eligiendo un movimiento...`);

        // Pausa para simular que el rival está pensando
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = battleEngine.executeRivalMove();
        console.log("Resultado del ataque del rival:", result); // Para depuración

        if (result.success) {
            setBattleMessage(`${rivalPokemon.name} usa ${result.move}...`);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Actualizar el log de batalla
            setBattleLog(prev => [...prev, result.message]);

            // Actualizar HP del jugador - CORREGIDO
            // Verificar si result.playerHP existe antes de usarlo
            if (result.playerHP) {
                const newHP = result.playerHP.current;
                setPlayerHP({
                    current: newHP,
                    max: result.playerHP.max,
                    percentage: result.playerHP.percentage
                });

                // Actualizar HP en estado del equipo
                updateTeamPokemonHP(playerPokemon.id, newHP);
            }

            // Verificar si la batalla ha terminado - CORREGIDO
            // Comprobamos directamente las propiedades de result en lugar de battleState
            if (result.isFinished) {
                setBattleOver(true);
                if (result.winner === "player") {
                    setBattleResult('victory'); // Registrar victoria
                    setBattleMessage(`¡Has ganado el combate! Ganaste 25 PokeDólares. Volviendo al mapa...`);
                } else {
                    setBattleResult('defeat'); // Registrar derrota
                    setBattleMessage(`¡Te han ganado en el combate! Volviendo al mapa...`);
                }
            } else {
                setBattleMessage("¿Qué debería hacer " + playerPokemon.name + "?");
            }
        } else {
            setBattleLog(prev => [...prev, "El rival no pudo atacar: " + result.message]);
        }

        setIsAnimating(false);
    };

    const handleUseMove = async (move) => {
        if (!battleEngine || isAnimating || battleOver) return;

        try {
            setIsAnimating(true);
            setShowMoves(false);

            // Paso 1: Mostrar mensaje de ataque inicial
            setBattleMessage(`${playerPokemon.name} usa ${move.name}...`);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Paso 2: Ejecutar el turno en el motor de batalla
            const result = battleEngine.executeTurn(move);
            if (!result.success) {
                setBattleLog(prev => [...prev, "Error al ejecutar el movimiento: " + result.message]);
                setIsAnimating(false);
                return;
            }

            // Paso 3: Manejar el orden de ataques con esperas adecuadas
            if (result.firstAttacker === "player") {
                // JUGADOR ATACA PRIMERO

                // 3.1 Mostrar resultado del ataque del jugador
                if (result.playerAttackResult) {
                    setBattleLog(prev => [...prev, result.playerAttackResult.message]);

                    // Actualizar HP del rival con animación
                    const newRivalHP = {
                        current: result.battleState.rivalHP.current,
                        max: result.battleState.rivalHP.max,
                        percentage: result.battleState.rivalHP.percentage
                    };
                    setRivalHP(newRivalHP);

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Verificar si el rival fue derrotado
                    if (result.battleState.isFinished && result.battleState.winner === "player") {
                        setBattleOver(true);
                        setBattleResult('victory'); // Registrar victoria
                        setBattleMessage(`¡Has ganado el combate! Ganaste 25 PokeDólares. Volviendo al mapa...`);
                        setIsAnimating(false);
                        return;
                    }
                }

                // 3.2 Rival ataca (si no ha sido derrotado)
                if (!result.battleState.isFinished && result.rivalAttackResult) {
                    // Mostrar mensaje de ataque del rival
                    setBattleMessage(`${rivalPokemon.name} usa ${result.rivalAttackResult.move}...`);
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // Mostrar resultado del ataque
                    setBattleLog(prev => [...prev, result.rivalAttackResult.message]);

                    // Actualizar HP del jugador con animación
                    const newPlayerHP = {
                        current: result.battleState.playerHP.current,
                        max: result.battleState.playerHP.max,
                        percentage: result.battleState.playerHP.percentage
                    };
                    setPlayerHP(newPlayerHP);

                    // Actualizar HP en estado del equipo
                    updateTeamPokemonHP(playerPokemon.id, newPlayerHP.current);

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } else {
                // RIVAL ATACA PRIMERO

                // 3.3 Mostrar ataque del rival
                if (result.rivalAttackResult) {
                    setBattleMessage(`${rivalPokemon.name} usa ${result.rivalAttackResult.move}...`);
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // Mostrar resultado del ataque
                    setBattleLog(prev => [...prev, result.rivalAttackResult.message]);

                    // Actualizar HP del jugador with animación
                    const newPlayerHP = {
                        current: result.battleState.playerHP.current,
                        max: result.battleState.playerHP.max,
                        percentage: result.battleState.playerHP.percentage
                    };
                    setPlayerHP(newPlayerHP);

                    // Actualizar HP en estado del equipo
                    updateTeamPokemonHP(playerPokemon.id, newPlayerHP.current);

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Verificar si el jugador fue derrotado
                    if (result.battleState.isFinished && result.battleState.winner === "rival") {
                        setBattleOver(true);
                        setBattleResult('defeat'); // Registrar derrota
                        setBattleMessage(`¡Te han ganado en el combate! Volviendo al mapa...`);
                        setIsAnimating(false);
                        return;
                    }
                }

                // 3.4 Jugador ataca (si no ha sido derrotado)
                if (!result.battleState.isFinished && result.playerAttackResult) {
                    // Mostrar ataque del jugador
                    setBattleMessage(`${playerPokemon.name} usa ${move.name}...`);
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // Mostrar resultado
                    setBattleLog(prev => [...prev, result.playerAttackResult.message]);

                    // Actualizar HP del rival con animación
                    const newRivalHP = {
                        current: result.battleState.rivalHP.current,
                        max: result.battleState.rivalHP.max,
                        percentage: result.battleState.rivalHP.percentage
                    };
                    setRivalHP(newRivalHP);

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Paso 4: Verificar estado final de la batalla
            if (result.battleState.isFinished) {
                setBattleOver(true);
                if (result.battleState.winner === "player") {
                    setBattleResult('victory'); // Registrar victoria
                    setBattleMessage(`¡Has ganado el combate! Ganaste 25 PokeDólares. Volviendo al mapa...`);
                } else {
                    setBattleResult('defeat'); // Registrar derrota
                    setBattleMessage(`¡Te han ganado en el combate! Volviendo al mapa...`);
                }
            } else {
                // Continuar la batalla
                setBattleMessage(`¿Qué debería hacer ${playerPokemon.name}?`);
            }

        } catch (error) {
            console.error("Error en handleUseMove:", error);
            setBattleLog(prev => [...prev, "¡Ha ocurrido un error durante el combate!"]);
        } finally {
            setIsAnimating(false);
        }
    };

    if (!playerPokemon || !rivalPokemon || !battleEngine) {
        return <div className="battle-container text-center">Cargando combate...</div>;
    }

    return (
        <div className="battle-container">
            {/* Indicador de nivel de dificultad */}
            <div className="battle-level-indicator">
                Nivel de dificultad: {playerLevel}
            </div>

            {/* Tooltip personalizado */}
            {tooltipContent && (
                <div
                    className="custom-tooltip"
                    style={{
                        position: 'fixed',
                        top: tooltipPosition.y,
                        left: tooltipPosition.x,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                        maxWidth: '200px',
                        zIndex: 1000,
                        whiteSpace: 'pre-wrap',
                        textAlign: 'left',
                        fontSize: '12px'
                    }}
                >
                    {tooltipContent}
                </div>
            )}

            <div className="battle-info-group">
                {/* Mensaje de batalla */}
                <div className="battle-message">
                    {battleMessage}
                </div>

                {/* Log de batalla - En esquina inferior izquierda */}
                <div className="battle-log" ref={logContainerRef}>
                    {battleLog.map((log, index) => (
                        <div key={index} className="log-entry">{log}</div>
                    ))}
                </div>
            </div>

            {/* Pokémon rival */}
            <div className="rival-section">
                <div className="rival-info">
                    <p className="pokemon-name">{rivalPokemon.name && rivalPokemon.name.toUpperCase()}</p>
                    <div className="rival-hp-bar-container">
                        <div className="hp-bar-background">
                            <div
                                className="hp-bar"
                                style={{
                                    width: `${rivalHP.percentage}%`,
                                    backgroundColor: rivalHP.percentage > 50
                                        ? '#78C850'  // Verde (más del 50%)
                                        : rivalHP.percentage > 20
                                            ? '#F8D030'  // Amarillo (entre 20% y 50%)
                                            : '#F03030'  // Rojo (menos del 20%)
                                }}
                            ></div>
                        </div>
                        <PokeballIcon className="hp-icon" />
                    </div>
                    <p className="hp-text">{Math.ceil(rivalHP.current)}/{rivalHP.max}</p>
                </div>

                <img
                    src={
                        (rivalPokemon.sprites && rivalPokemon.sprites.front) ||
                        (rivalPokemon.id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rivalPokemon.id}.png` :
                            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')
                    }
                    alt={rivalPokemon.name}
                    className="pokemon-sprite rival-sprite"
                    style={{
                        opacity: rivalHP.current <= 0 ? 0.5 : 1,
                        filter: rivalHP.current <= 0 ? 'grayscale(100%)' : 'none'
                    }}
                />
            </div>

            {/* Pokémon del jugador */}
            <div className="player-section">
                <img
                    src={
                        (playerPokemon.isShiny && playerPokemon.sprites?.back_shiny) ||
                        playerPokemon.sprites?.back ||
                        (playerPokemon.isShiny ?
                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${playerPokemon.id}.png` :
                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${playerPokemon.id}.png`) ||
                        playerPokemon.sprites?.front ||
                        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                    }
                    alt={playerPokemon.name}
                    className={`pokemon-sprite player-sprite ${playerPokemon.isShiny ? 'shiny-sprite' : ''}`}
                    style={{
                        transform: !playerPokemon.sprites?.back && playerPokemon.sprites?.front ? 'scaleX(-1)' : 'none',
                        opacity: playerHP.current <= 0 ? 0.5 : 1,
                        filter: playerHP.current <= 0 ? 'grayscale(100%)' : 'none'
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = (playerPokemon.isShiny && playerPokemon.sprites?.front_shiny) ||
                            playerPokemon.sprites?.front ||
                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${playerPokemon.id}.png`;
                    }}
                />
                <div className="player-info">
                    <p className="pokemon-name">{playerPokemon.name && playerPokemon.name.toUpperCase()}</p>
                    <div className="player-hp-bar-container">
                        <PokeballIcon className="hp-icon" />
                        <div className="hp-bar-background">
                            <div
                                className="hp-bar"
                                style={{
                                    width: `${playerHP.percentage}%`,
                                    backgroundColor: playerHP.percentage > 50
                                        ? '#78C850'  // Verde (más del 50%)
                                        : playerHP.percentage > 20
                                            ? '#F8D030'  // Amarillo (entre 20% y 50%)
                                            : '#F03030'  // Rojo (menos del 20%)
                                }}
                            ></div>
                        </div>
                    </div>
                    <p className="hp-text">{Math.ceil(playerHP.current)}/{playerHP.max}</p>
                </div>
            </div>

            {/* Botones de acción con enfoque híbrido */}
            <div className="action-buttons">
                {!showMoves ? (
                    // Menú principal con clases de Bootstrap + clases personalizadas
                    <div className="row g-2">
                        <div className="col-6">
                            <button
                                className="btn btn-danger w-100 battle-btn btn-attack"
                                onClick={handleAttack}
                                disabled={isAnimating || battleOver}
                                aria-label="Atacar"
                            >
                                Luchar
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-success w-100 battle-btn btn-pokemon"
                                onClick={handlePokemon}
                                disabled={isAnimating || battleOver}
                                aria-label="Ver Pokémon"
                            >
                                Pokémon
                            </button>
                        </div>
                        <div className="col-12 mt-2">
                            <button
                                className="btn btn-primary w-50 mx-auto d-block battle-btn btn-run"
                                onClick={handleRun}
                                disabled={isAnimating || battleOver}
                                aria-label="Huir del combate"
                            >
                                Huir
                            </button>
                        </div>
                    </div>
                ) : (
                    // Menú de movimientos con clases híbridas
                    <div className="row g-2">
                        {moves.map((move, index) => (
                            <div className="col-6" key={index}>
                                <button
                                    className={`btn btn-move btn-${move.type} w-100 battle-btn`}
                                    onClick={() => handleUseMove(move)}
                                    onMouseEnter={(e) => {
                                        const tooltip = move.getTooltipDescription ?
                                            move.getTooltipDescription() :
                                            `${move.name}\nPoder: ${move.power || '?'}\nTipo: ${move.type || '?'}\nClase: ${move.damageClass || '?'}`;
                                        showTooltip(tooltip, e);
                                    }}
                                    onMouseLeave={hideTooltip}
                                    disabled={isAnimating || battleOver}
                                    aria-label={`Usar ${move.name}`}
                                >
                                    {move.name.toUpperCase()}
                                </button>
                            </div>
                        ))}
                        <div className="col-12">
                            <button
                                className="btn btn-secondary w-100 battle-btn btn-back"
                                onClick={handleBackToMainMenu}
                                disabled={isAnimating || battleOver}
                                aria-label="Volver al menú principal"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de selección de Pokémon */}
            {showPokemonSelector && (
                <div className="pokemon-selector-overlay" style={{ pointerEvents: 'auto' }}>
                    <div className="pokemon-selector-modal" style={{ pointerEvents: 'auto' }}>
                        <h3>Selecciona un Pokémon</h3>
                        <div className="pokemon-team-grid">
                            {teamPokemon.map((pokemon, index) => (
                                <div
                                    key={index}
                                    className={`pokemon-team-item ${pokemon.currentHP <= 0 ? 'pokemon-fainted' : ''} ${pokemon.id === playerPokemon.id ? 'pokemon-active' : ''} ${pokemon.isShiny ? 'shiny-pokemon' : ''}`}
                                    onClick={() => handlePokemonChange(pokemon)}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    {pokemon.isShiny && <div className="pokemon-shiny-indicator">★</div>}
                                    <img
                                        src={
                                            (pokemon.isShiny && pokemon.sprites?.front_shiny) ||
                                            pokemon.sprites?.front ||
                                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                                        }
                                        alt={pokemon.name}
                                        className="pokemon-team-sprite"
                                        style={{
                                            opacity: pokemon.currentHP <= 0 ? 0.5 : 1,
                                            filter: pokemon.currentHP <= 0 ? 'grayscale(100%)' : 'none'
                                        }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
                                        }}
                                    />
                                    <p className="pokemon-team-name" style={{ color: 'white', fontWeight: 'bold' }}>
                                        {(pokemon.name || `Pokémon #${pokemon.id}`).toUpperCase()}
                                    </p>
                                    <p className="pokemon-team-hp-text" style={{ color: pokemon.currentHP <= 0 ? '#F03030' : 'white' }}>
                                        {Math.ceil(pokemon.currentHP)}/{pokemon.stats?.hp || 0}
                                    </p>
                                    <div className="pokemon-team-hp-bar">
                                        <div
                                            className="pokemon-team-hp-fill"
                                            style={{
                                                width: `${pokemon.stats && pokemon.stats.hp ? (pokemon.currentHP / pokemon.stats.hp) * 100 : 0}%`,
                                                backgroundColor: pokemon.currentHP / pokemon.stats?.hp > 0.5
                                                    ? '#78C850'  // Verde
                                                    : pokemon.currentHP / pokemon.stats?.hp > 0.2
                                                        ? '#F8D030'  // Amarillo
                                                        : '#F03030'  // Rojo
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn btn-secondary pokemon-selector-close"
                            onClick={handleClosePokemonSelector}
                            style={{ pointerEvents: 'auto' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Battle;