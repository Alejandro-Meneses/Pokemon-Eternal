import React, { useState, useEffect, useRef } from "react";
import "../../Styles/Battle.css";
import Pokemon from "../../backend/models/Pokemon";
import Move from "../../backend/models/Move";
import BattleEngine from "../../backend/battle/Battleengine";
import { ReactComponent as PokeballIcon } from "../../images/Pokeball.svg";

const Battle = () => {
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

                // CORRECCIÓN: Buscar movimientos en la propiedad correcta
                // Intentar encontrar movimientos en diferentes propiedades posibles
                const playerMoves = playerInstance.moves || playerInstance.moveList || [];
                console.log("Movimientos del jugador encontrados:", playerMoves);
                
                if (playerMoves.length > 0) {
                    try {
                        // Tomar los primeros 4 movimientos (o todos si hay menos de 4)
                        const moveCount = Math.min(4, playerMoves.length);
                        const movePromises = [];
                        
                        for (let i = 0; i < moveCount; i++) {
                            const moveData = playerMoves[i];
                            // Verificar la estructura del objeto de movimiento
                            const moveUrl = moveData.move ? moveData.move.url : moveData.url;
                            
                            if (!moveUrl) {
                                console.error("Estructura de movimiento no reconocida:", moveData);
                                continue;
                            }
                            
                            console.log(`Cargando movimiento del jugador desde: ${moveUrl}`);
                            
                            movePromises.push(
                                fetch(moveUrl)
                                    .then(response => response.json())
                                    .then(data => new Move(data))
                            );
                        }
                        
                        const movesData = await Promise.all(movePromises);
                        setMoves(movesData);
                        playerInstance.moves = movesData;
                        
                        console.log("Movimientos del jugador cargados:", movesData);
                    } catch (error) {
                        console.error("Error al cargar movimientos del jugador:", error);
                        // Usar Tackle como fallback si falla la carga
                        const tackleMove = new Move({
                            id: 33,
                            name: "Tackle",
                            type: { name: "normal" },
                            power: 40,
                            accuracy: 100,
                            pp: 35,
                            damage_class: { name: "physical" }
                        });
                        setMoves([tackleMove]);
                        playerInstance.moves = [tackleMove];
                    }
                } else {
                    console.warn("El jugador no tiene movimientos en la API");
                    // Usar Tackle como movimiento predeterminado
                    const tackleMove = new Move({
                        id: 33,
                        name: "Tackle",
                        type: { name: "normal" },
                        power: 40,
                        accuracy: 100,
                        pp: 35,
                        damage_class: { name: "physical" }
                    });
                    setMoves([tackleMove]);
                    playerInstance.moves = [tackleMove];
                }
                
                // CORRECCIÓN: similar para el rival
                const rivalMoves = rivalInstance.moves || rivalInstance.moveList || [];
                console.log("Movimientos del rival encontrados:", rivalMoves);
                
                if (rivalMoves.length > 0) {
                    try {
                        // Tomar los primeros 4 movimientos (o todos si hay menos de 4)
                        const moveCount = Math.min(4, rivalMoves.length);
                        const movePromises = [];
                        
                        for (let i = 0; i < moveCount; i++) {
                            const moveData = rivalMoves[i];
                            // Verificar la estructura del objeto de movimiento
                            const moveUrl = moveData.move ? moveData.move.url : moveData.url;
                            
                            if (!moveUrl) {
                                console.error("Estructura de movimiento rival no reconocida:", moveData);
                                continue;
                            }
                            
                            console.log(`Cargando movimiento del rival desde: ${moveUrl}`);
                            
                            movePromises.push(
                                fetch(moveUrl)
                                    .then(response => response.json())
                                    .then(data => new Move(data))
                            );
                        }
                        
                        const movesData = await Promise.all(movePromises);
                        rivalInstance.moves = movesData;
                        
                        console.log("Movimientos del rival cargados:", movesData);
                    } catch (error) {
                        console.error("Error al cargar movimientos del rival:", error);
                        // Usar Tackle como fallback si falla la carga
                        const tackleMove = new Move({
                            id: 33,
                            name: "Tackle",
                            type: { name: "normal" },
                            power: 40,
                            accuracy: 100,
                            pp: 35,
                            damage_class: { name: "physical" }
                        });
                        rivalInstance.moves = [tackleMove];
                    }
                } else {
                    console.warn("El rival no tiene movimientos en la API");
                    // Usar Tackle como movimiento predeterminado
                    const tackleMove = new Move({
                        id: 33,
                        name: "Tackle",
                        type: { name: "normal" },
                        power: 40,
                        accuracy: 100,
                        pp: 35,
                        damage_class: { name: "physical" }
                    });
                    rivalInstance.moves = [tackleMove];
                }

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
            if (result.isFinished) {
                setBattleOver(true);
                setBattleMessage(`¡${rivalPokemon.name} ha ganado el combate!`);
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
        
        setIsAnimating(true);
        setShowMoves(false);
        setBattleMessage(`${playerPokemon.name} usa ${move.name}...`);
        
        // Pequeña pausa para la animación
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const result = battleEngine.executeTurn(move);
        
        if (result.success) {
            // Orden de los ataques basado en velocidad
            if (result.firstAttacker === "player") {
                // Jugador ataca primero
                if (result.playerAttackResult) {
                    setBattleLog(prev => [...prev, result.playerAttackResult.message]);
                    setRivalHP({
                        current: result.battleState.rivalHP.current,
                        max: result.battleState.rivalHP.max,
                        percentage: result.battleState.rivalHP.percentage
                    });
                    
                    // Pequeña pausa antes del ataque del rival
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Si la batalla no ha terminado, el rival ataca
                    if (!result.battleState.isFinished && result.rivalAttackResult) {
                        setBattleMessage(`${rivalPokemon.name} usa ${result.rivalAttackResult.move}...`);
                        await new Promise(resolve => setTimeout(resolve, 800));
                        
                        setBattleLog(prev => [...prev, result.rivalAttackResult.message]);
                        setPlayerHP({
                            current: result.battleState.playerHP.current,
                            max: result.battleState.playerHP.max,
                            percentage: result.battleState.playerHP.percentage
                        });
                    }
                }
            } else {
                // Rival ataca primero
                if (result.rivalAttackResult) {
                    setBattleMessage(`${rivalPokemon.name} usa ${result.rivalAttackResult.move}...`);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    setBattleLog(prev => [...prev, result.rivalAttackResult.message]);
                    setPlayerHP({
                        current: result.battleState.playerHP.current,
                        max: result.battleState.playerHP.max,
                        percentage: result.battleState.playerHP.percentage
                    });
                    
                    // Si la batalla no ha terminado, el jugador ataca
                    if (!result.battleState.isFinished && result.playerAttackResult) {
                        // Pequeña pausa antes del ataque del jugador
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        setBattleMessage(`${playerPokemon.name} usa ${move.name}...`);
                        await new Promise(resolve => setTimeout(resolve, 800));
                        
                        setBattleLog(prev => [...prev, result.playerAttackResult.message]);
                        setRivalHP({
                            current: result.battleState.rivalHP.current,
                            max: result.battleState.rivalHP.max,
                            percentage: result.battleState.rivalHP.percentage
                        });
                    }
                }
            }
            
            // Verificar si la batalla ha terminado
            if (result.battleState.isFinished) {
                setBattleOver(true);
                if (result.battleState.winner === "player") {
                    setBattleMessage(`¡${playerPokemon.name} ha ganado el combate!`);
                } else {
                    setBattleMessage(`¡${rivalPokemon.name} ha ganado el combate!`);
                }
            } else {
                setBattleMessage("¿Qué debería hacer " + playerPokemon.name + "?");
            }
        } else {
            setBattleLog(prev => [...prev, "Error al ejecutar el movimiento: " + result.message]);
        }
        
        setIsAnimating(false);
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

            {/* Pokémon rival */}
            <div className="rival-section">
                <div className="rival-info">
                    <p className="pokemon-name">Lv. {rivalPokemon.level || 50} {rivalPokemon.name}</p>
                    <div className="rival-hp-bar-container">
                        <div 
                            className="hp-bar" 
                            style={{ 
                                width: `${rivalHP.percentage}%`,
                                backgroundColor: rivalHP.percentage > 50 
                                    ? '#78C850' 
                                    : rivalHP.percentage > 20 
                                        ? '#F8D030' 
                                        : '#F08030'
                            }}
                        ></div>
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
                        <div 
                            className="hp-bar" 
                            style={{ 
                                width: `${playerHP.percentage}%`,
                                backgroundColor: playerHP.percentage > 50 
                                    ? '#78C850' 
                                    : playerHP.percentage > 20 
                                        ? '#F8D030' 
                                        : '#F08030'
                            }}
                        ></div>
                    </div>
                    <p className="hp-text">{Math.ceil(playerHP.current)}/{playerHP.max}</p>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="action-buttons">
                {!showMoves ? (
                    // Menú principal
                    <div className="row g-2">
                        <div className="col-6">
                            <button 
                                className="btn btn-danger w-100" 
                                onClick={handleAttack}
                                disabled={isAnimating || battleOver}
                            >
                                Atacar
                            </button>
                        </div>
                        <div className="col-6">
                            <button 
                                className="btn btn-warning w-100" 
                                onClick={handleBag}
                                disabled={isAnimating || battleOver}
                            >
                                Mochila
                            </button>
                        </div>
                        <div className="col-6">
                            <button 
                                className="btn btn-success w-100" 
                                onClick={handlePokemon}
                                disabled={isAnimating || battleOver}
                            >
                                Pokémon
                            </button>
                        </div>
                        <div className="col-6">
                            <button 
                                className="btn btn-primary w-100" 
                                onClick={handleRun}
                                disabled={isAnimating || battleOver}
                            >
                                Huir
                            </button>
                        </div>
                    </div>
                ) : (
                    // Menú de movimientos
                    <div className="row g-2">
                        {moves.map((move, index) => (
                            <div className="col-6" key={index}>
                                <button
                                    className={`btn btn-move btn-${move.type} w-100`}
                                    onClick={() => handleUseMove(move)}
                                    onMouseEnter={(e) => showTooltip(move.getTooltipDescription(), e)}
                                    onMouseLeave={hideTooltip}
                                    disabled={isAnimating || battleOver}
                                >
                                    {move.name.toUpperCase()}
                                </button>
                            </div>
                        ))}
                        <div className="col-12">
                            <button 
                                className="btn btn-secondary w-100" 
                                onClick={handleBackToMainMenu}
                                disabled={isAnimating || battleOver}
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Botón para reiniciar cuando la batalla termina */}
                {battleOver && (
                    <div className="row mt-3">
                        <div className="col-12">
                            <button 
                                className="btn btn-primary w-100" 
                                onClick={() => window.location.reload()}
                            >
                                Nueva batalla
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Battle;