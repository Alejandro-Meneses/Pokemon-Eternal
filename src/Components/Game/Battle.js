import React, { useState, useEffect, useRef } from "react";
import "../../Styles/Battle.css";
import Pokemon from "../../backend/models/Pokemon";
import BattleEngine from "../../backend/battle/Battleengine";
import { ReactComponent as PokeballIcon } from "../../images/Pokeball.svg";
import { useNavigate } from "react-router-dom";

const Battle = () => {
    const navigate = useNavigate();
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

    useEffect(() => {
        const fetchBattlePokemons = async () => {
            try {
                const playerId = Math.floor(Math.random() * 1025) + 1;
                const rivalId = Math.floor(Math.random() * 1025) + 1;

                let playerInstance = await Pokemon.fetchPokemon(playerId);
                let rivalInstance = await Pokemon.fetchPokemon(rivalId);

                // Imprimir datos de depuración
                console.log("Estructura del jugador:", playerInstance);
                console.log("Estructura del rival:", rivalInstance);

                // Establecer nivel 50 para ambos Pokémon
                playerInstance.level = 50;
                rivalInstance.level = 50;

                // Asegurarse de que tienen stats
                if (!playerInstance.stats) {
                    playerInstance.stats = {
                        hp: 150,
                        attack: 100,
                        defense: 100,
                        'special-attack': 100,
                        'special-defense': 100,
                        speed: 100
                    };
                }

                if (!rivalInstance.stats) {
                    rivalInstance.stats = {
                        hp: 150,
                        attack: 100,
                        defense: 100,
                        'special-attack': 100,
                        'special-defense': 100,
                        speed: 100
                    };
                }

                // Verificar que los tipos estén definidos
                if (!playerInstance.types || playerInstance.types.length === 0) {
                    playerInstance.types = ['normal'];
                }

                if (!rivalInstance.types || rivalInstance.types.length === 0) {
                    rivalInstance.types = ['normal'];
                }

                // Inicializar HP actual
                playerInstance.currentHP = playerInstance.stats.hp;
                rivalInstance.currentHP = rivalInstance.stats.hp;

                // Inicializar valores de HP para la UI
                setPlayerHP({
                    current: playerInstance.stats.hp,
                    max: playerInstance.stats.hp,
                    percentage: 100
                });

                setRivalHP({
                    current: rivalInstance.stats.hp,
                    max: rivalInstance.stats.hp,
                    percentage: 100
                });
                // Simplemente usar los movimientos ya cargados
                setMoves(playerInstance.moves);
                console.log("Movimientos del jugador ya cargados:", playerInstance.moves);

                // No necesitas cargar los movimientos del rival, ya vienen en rivalInstance.moves
                console.log("Movimientos del rival ya cargados:", rivalInstance.moves);

                setPlayerPokemon(playerInstance);
                setRivalPokemon(rivalInstance);

                // Inicializar el motor de batalla
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
    }, []);

    // Auto-scroll para el log de batalla
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [battleLog]);

    useEffect(() => {
        // Cuando battleOver cambia a true, configurar un temporizador para volver al mapa
        if (battleOver) {
            const timer = setTimeout(() => {
                navigate('/Board');
            }, 2500); // 2.5 segundos de espera

            // Limpieza del temporizador si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [battleOver, navigate]);

    // Funciones para manejar los clics en los botones
    const handleAttack = () => {
        setShowMoves(true);
    };

    const handleBag = () => alert("¡Mochila seleccionada! Esta función estará disponible próximamente.");
    const handlePokemon = () => alert("¡Pokémon seleccionado! Esta función estará disponible próximamente.");

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

    const executeRivalAttack = async () => {
        if (!battleEngine || battleOver) return;

        setIsAnimating(true);
        setBattleMessage(`${rivalPokemon.name} está eligiendo un movimiento...`);

        // Pausa para simular que el rival está pensando
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = battleEngine.executeRivalMove();

        if (result.success) {
            setBattleMessage(`${rivalPokemon.name} usa ${result.move}...`);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Actualizar el log de batalla
            setBattleLog(prev => [...prev, result.message]);

            // Actualizar HP del jugador
            setPlayerHP({
                current: result.playerHP.current,
                max: result.playerHP.max,
                percentage: result.playerHP.percentage
            });

            // Verificar si la batalla ha terminado
            if (result.battleState.isFinished) {
                setBattleOver(true);
                if (result.battleState.winner === "player") {
                    setBattleMessage(`Has ganado el combate! Volviendo al mapa...`);
                } else {
                    setBattleMessage(`¡Te han ganado que pena el combate! Volviendo al mapa...`);
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
                    setBattleMessage(`¡Has ganado el combate! Volviendo al mapa...`);
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
                
                // Actualizar HP del jugador con animación
                const newPlayerHP = {
                    current: result.battleState.playerHP.current,
                    max: result.battleState.playerHP.max,
                    percentage: result.battleState.playerHP.percentage
                };
                setPlayerHP(newPlayerHP);
                
                // Esperar para que se vea la animación de daño
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Verificar si el jugador fue derrotado
                if (result.battleState.isFinished && result.battleState.winner === "rival") {
                    setBattleOver(true);
                    setBattleMessage(`¡Te han ganado que pena el combate! Volviendo al mapa...`);
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
                setBattleMessage(`¡Has ganado el combate! Volviendo al mapa...`);
            } else {
                setBattleMessage(`¡Te han ganado que pena el combate! Volviendo al mapa...`);
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
                    <p className="pokemon-name">Lv. {rivalPokemon.level || 50} {rivalPokemon.name}</p>
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
                    src={rivalPokemon.sprites.front}
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
                    src={playerPokemon.sprites.back || playerPokemon.sprites.front}
                    alt={playerPokemon.name}
                    className="pokemon-sprite player-sprite"
                    style={{
                        transform: !playerPokemon.sprites.back ? 'scaleX(-1)' : 'none',
                        opacity: playerHP.current <= 0 ? 0.5 : 1,
                        filter: playerHP.current <= 0 ? 'grayscale(100%)' : 'none'
                    }}
                />
                <div className="player-info">
                    <p className="pokemon-name">{playerPokemon.name} Lv. {playerPokemon.level || 50}</p>
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
                                Atacar
                            </button>
                        </div>
                        <div className="col-6">
                            <button
                                className="btn btn-warning w-100 battle-btn btn-bag"
                                onClick={handleBag}
                                disabled={isAnimating || battleOver}
                                aria-label="Abrir mochila"
                            >
                                Mochila
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
                        <div className="col-6">
                            <button
                                className="btn btn-primary w-100 battle-btn btn-run"
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
                                    }} onMouseLeave={hideTooltip}
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
        </div>
    );
};

export default Battle;