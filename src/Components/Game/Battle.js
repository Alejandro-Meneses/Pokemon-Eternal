import React, { useState, useEffect, useRef } from "react";
import "../../Styles/Battle.css";
import Pokemon from "../../backend/models/Pokemon";
import BattleEngine from "../../backend/battle/Battleengine";
import { ReactComponent as PokeballIcon } from "../../images/Pokeball.svg";
import { useNavigate, useLocation } from "react-router-dom"; 
import { getTeam, updatePokemonHP } from "../../Services/PokemonService";

const Battle = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    // Obtener el nivel del jugador (por defecto 1)
    const playerLevel = location.state?.playerLevel || 1;
    
    // Obtener token para llamadas a la API
    const token = localStorage.getItem('token');
    
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
    const [battleResult, setBattleResult] = useState(null);
    const [syncInProgress, setSyncInProgress] = useState(false);

    // Estado para el selector de Pokémon
    const [showPokemonSelector, setShowPokemonSelector] = useState(false);
    const [teamPokemon, setTeamPokemon] = useState([]);

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

    // NUEVO: Función para sincronizar HP con la base de datos
    const syncPokemonHP = async (pokemonId, currentHP, forceSync = false) => {
        try {
            if (!token || syncInProgress) return;
            
            // Evitar sincronizaciones múltiples simultáneas
            setSyncInProgress(true);
            
            // Primero actualizar localmente (para que la UI sea responsiva)
            updatePokemonInTeam(pokemonId, currentHP);
            
            // Solo sincronizar con la DB en momentos importantes o si forceSync es true
            if (forceSync || currentHP <= 0 || Math.random() < 0.2) { // 20% de probabilidad para sincronizaciones aleatorias
                console.log(`Sincronizando HP de ${pokemonId} a la base de datos: ${currentHP}`);
                const result = await updatePokemonHP(pokemonId, currentHP, token);
                
                if (result.error) {
                    console.error("Error al sincronizar HP con la base de datos:", result.error);
                } else {
                    console.log(`HP sincronizado correctamente para Pokémon ID ${pokemonId}`);
                }
            }
        } catch (error) {
            console.error("Error en syncPokemonHP:", error);
        } finally {
            setSyncInProgress(false);
        }
    };

    // 1. Solo actualiza la UI (barra de HP)
    const updateUIPlayerHP = (currentHP) => {
        setPlayerHP({
            current: currentHP,
            max: playerHP.max,
            percentage: (currentHP / playerHP.max) * 100
        });
    };

    // 2. Solo actualiza el HP en el array de equipo
    const updatePokemonInTeam = (pokemonId, currentHP) => {
        setTeamPokemon(prev => prev.map(pokemon => 
            pokemon.id === pokemonId ? { ...pokemon, currentHP } : pokemon
        ));
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
                // 1. Obtener el equipo del jugador
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

                // 2. Cargar los datos completos de cada Pokémon del equipo
                const completeTeam = await Promise.all(
                    teamData.map(async (pokemon) => {
                        const fullPokemon = await Pokemon.fetchPokemon(pokemon.pokemonId);
                        // Copiar datos como isShiny del equipo original
                        fullPokemon.isShiny = pokemon.isShiny || false;
                        fullPokemon._id = pokemon._id;
                        fullPokemon.position = pokemon.position;

                        // CAMBIO: Iniciar siempre con HP completo
                        fullPokemon.currentHP = fullPokemon.stats.hp;

                        return fullPokemon;
                    })
                );

                // 3. Guardar todo el equipo completo para el selector
                setTeamPokemon(completeTeam);
                console.log("Equipo completo cargado:", completeTeam);

                // 4. Usar el primer Pokémon como activo
                let playerInstance = completeTeam[0];
                
                // 5. Generar rival
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
                    current: playerInstance.stats.hp,
                    max: playerInstance.stats.hp,
                    percentage: 100
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
    }, [navigate, playerLevel, token]);

    // Auto-scroll para el log de batalla
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [battleLog]);

    // MODIFICADO: Cuando la batalla termina, restauramos HP completo a todo el equipo y sincronizamos con DB
    useEffect(() => {
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
            
            // Restaurar HP completo a todo el equipo al finalizar
            const restoredTeam = teamPokemon.map(pokemon => ({
                ...pokemon,
                currentHP: pokemon.stats.hp
            }));
            
            setTeamPokemon(restoredTeam);
            
            // Sincronizar HP restaurado con la base de datos
            const syncTeamHP = async () => {
                if (!token) return;
                
                try {
                    for (const pokemon of restoredTeam) {
                        await syncPokemonHP(pokemon._id, pokemon.stats.hp, true);
                        // Pequeña pausa para no sobrecargar el servidor
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    console.log("HP de todo el equipo restaurado y sincronizado con la base de datos");
                } catch (error) {
                    console.error("Error al sincronizar HP del equipo:", error);
                }
            };
            
            syncTeamHP();
            
            const timer = setTimeout(() => {
                navigate('/Board');
            }, 2500); // 2.5 segundos de espera

            // Limpieza del temporizador si el componente se desmonta
            return () => clearTimeout(timer);
        }
    }, [battleOver, battleResult, navigate, teamPokemon, token]);

    // Funciones para manejar los clics en los botones
    const handleAttack = () => {
        setShowMoves(true);
    };

    // MODIFICADO: Función para mostrar el selector de Pokémon
   // ACTUALIZADO: Función para mostrar el selector de Pokémon con datos frescos
const handlePokemon = () => {
    // 1. Antes de mostrar el selector, crear una copia actualizada del equipo
    if (playerPokemon && battleEngine) {
        // Actualizar todo el equipo con datos frescos del battleEngine
        const updatedTeam = teamPokemon.map(pokemon => {
            // Si es el Pokémon activo, usar los datos de la UI
            if (pokemon.id === playerPokemon.id) {
                return {
                    ...pokemon,
                    currentHP: playerHP.current
                };
            } 
            
            // Para los demás, intentar obtener el HP del battleEngine
            const storedHP = battleEngine.getPokemonHP(pokemon.id);
            if (storedHP !== null) {
                return {
                    ...pokemon,
                    currentHP: storedHP
                };
            }
            
            // Si no hay datos en el battleEngine, no modificar
            return pokemon;
        });
        
        // Actualizar el estado con la copia actualizada
        setTeamPokemon(updatedTeam);
        console.log("Equipo actualizado para el selector:", updatedTeam.map(p => 
            `${p.name}: ${p.currentHP}/${p.stats.hp}`
        ));
    }
    
    // 2. Usar un pequeño retraso para asegurar que el estado se actualice antes de mostrar el selector
    setTimeout(() => setShowPokemonSelector(true), 50);
};

    // MODIFICADO: Función para el cambio de Pokémon con sincronización a DB
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
            // 1. Determinar si es un cambio forzado (Pokémon actual derrotado)
            const isForced = playerHP.current <= 0;
            
            // 2. Guardar el HP del Pokémon actual en la base de datos (si no está debilitado)
            if (!isForced && playerPokemon.id) {
                await syncPokemonHP(playerPokemon._id, playerHP.current, true);
            }

            // 3. Crear una copia independiente del Pokémon seleccionado
            const selectedPokemonCopy = JSON.parse(JSON.stringify(selectedPokemon));
            
            // 4. Mensaje de cambio
            setBattleMessage(isForced ? 
                `¡Adelante, ${selectedPokemonCopy.name}!` : 
                `¡Vuelve, ${playerPokemon.name}!`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 5. Actualizar el motor de batalla con el nuevo Pokémon
            battleEngine.switchPlayerPokemon(selectedPokemonCopy);

            // 6. Actualizar el Pokémon actual en la batalla
            const previousPokemon = playerPokemon;
            setPlayerPokemon(selectedPokemonCopy);

            // 7. Actualizar el HP en la interfaz con los datos del nuevo Pokémon
            setPlayerHP({
                current: selectedPokemonCopy.currentHP,
                max: selectedPokemonCopy.stats.hp,
                percentage: (selectedPokemonCopy.currentHP / selectedPokemonCopy.stats.hp) * 100
            });
            
            // Para debug: Verificar el HP del nuevo Pokémon
            console.log(`Cambiando a ${selectedPokemonCopy.name} con HP: ${selectedPokemonCopy.currentHP}/${selectedPokemonCopy.stats.hp}`);

            // 8. Actualizar los movimientos disponibles
            setMoves(selectedPokemonCopy.moves || []);

            // 9. Mostrar mensaje de entrada del nuevo Pokémon
            if (isForced) {
                setBattleLog(prev => [...prev, `¡Adelante, ${selectedPokemonCopy.name}!`]);
            } else {
                setBattleLog(prev => [...prev, `¡Vuelve, ${previousPokemon.name}! ¡Adelante, ${selectedPokemonCopy.name}!`]);
            }
            
            setBattleMessage(`¡Adelante, ${selectedPokemonCopy.name}!`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 10. El rival solo ataca si el cambio no fue forzado
            if (!isForced) {
                setBattleMessage(`Tu rival aprovecha el cambio...`);
                await new Promise(resolve => setTimeout(resolve, 800));
                await executeRivalAttack();
            } else {
                setBattleMessage(`¿Qué debería hacer ${selectedPokemonCopy.name}?`);
            }
        } catch (error) {
            console.error("Error al cambiar Pokémon:", error);
            setBattleLog(prev => [...prev, "¡Ha ocurrido un error al cambiar de Pokémon!"]);
        } finally {
            setIsAnimating(false);
        }
    };

    const handleClosePokemonSelector = () => {
        // Verificar si el Pokémon actual está debilitado
        if (playerPokemon.currentHP <= 0) {
            // Si está debilitado, mostrar mensaje de error
            setBattleLog(prev => [
                ...prev, 
                "¡No puedes continuar con un Pokémon debilitado! Debes seleccionar otro Pokémon."
            ]);
            return; // No permitir cerrar el selector
        }
        
        // Si el Pokémon activo tiene HP > 0, permitir cerrar el selector
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

    // MODIFICADO: handleUseMove con sincronización a DB en momentos críticos
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
                    
                    // CAMBIO: Usar las nuevas funciones separadas
                    updateUIPlayerHP(newPlayerHP.current);
                    
                    // Sincronizar con la base de datos si el daño es significativo
                    if (Math.abs(playerHP.current - newPlayerHP.current) > playerHP.max * 0.3) {
                        // 30% o más de cambio de HP merece una sincronización
                        await syncPokemonHP(playerPokemon._id, newPlayerHP.current, true);
                    } else {
                        // Sino, actualización local solamente
                        updatePokemonInTeam(playerPokemon.id, newPlayerHP.current);
                    }

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // IMPORTANTE: Verificar si tu Pokémon fue derrotado por el ataque del rival
                    if (newPlayerHP.current <= 0) {
                        setBattleLog(prev => [...prev, `¡${playerPokemon.name} se ha debilitado!`]);
                        
                        // IMPORTANTE: Sincronizar con la base de datos que este Pokémon está debilitado
                        await syncPokemonHP(playerPokemon._id, 0, true);
                        
                        // Verificar si hay más Pokémon disponibles
                        const healthyPokemon = teamPokemon.filter(pokemon => 
                            pokemon.id !== playerPokemon.id && pokemon.currentHP > 0
                        );
                        
                        if (healthyPokemon.length > 0) {
                            // Todavía hay Pokémon disponibles
                            setBattleMessage("Selecciona otro Pokémon para continuar la batalla.");
                            setShowPokemonSelector(true);
                            setIsAnimating(false);
                            return; // Detener la ejecución aquí
                        } else {
                            // Todo el equipo está debilitado, fin de la batalla
                            setBattleOver(true);
                            setBattleResult('defeat');
                            setBattleMessage(`¡Todo tu equipo ha sido derrotado! Volviendo al mapa...`);
                            setIsAnimating(false);
                            return; // Detener la ejecución aquí
                        }
                    }
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
                    
                    // CAMBIO: Usar las funciones para actualizar UI y sincronizar
                    updateUIPlayerHP(newPlayerHP.current);
                    
                    // Sincronizar con la base de datos si el daño es significativo
                    if (Math.abs(playerHP.current - newPlayerHP.current) > playerHP.max * 0.3) {
                        // 30% o más de cambio de HP merece una sincronización
                        await syncPokemonHP(playerPokemon._id, newPlayerHP.current, true);
                    } else {
                        // Sino, actualización local solamente
                        updatePokemonInTeam(playerPokemon.id, newPlayerHP.current);
                    }

                    // Esperar para que se vea la animación de daño
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // IMPORTANTE: Verificar si tu Pokémon fue derrotado por el ataque del rival
                    if (newPlayerHP.current <= 0) {
                        setBattleLog(prev => [...prev, `¡${playerPokemon.name} se ha debilitado!`]);
                        
                        // IMPORTANTE: Sincronizar con la base de datos que este Pokémon está debilitado
                        await syncPokemonHP(playerPokemon._id, 0, true);
                        
                        // Verificar si hay más Pokémon disponibles
                        const healthyPokemon = teamPokemon.filter(pokemon => 
                            pokemon.id !== playerPokemon.id && pokemon.currentHP > 0
                        );
                        
                        if (healthyPokemon.length > 0) {
                            // Todavía hay Pokémon disponibles
                            setBattleMessage("Selecciona otro Pokémon para continuar la batalla.");
                            setShowPokemonSelector(true);
                            setIsAnimating(false);
                            return; // Detener la ejecución aquí - No continuar con el ataque del jugador
                        } else {
                            // Todo el equipo está debilitado, fin de la batalla
                            setBattleOver(true);
                            setBattleResult('defeat');
                            setBattleMessage(`¡Todo tu equipo ha sido derrotado! Volviendo al mapa...`);
                            setIsAnimating(false);
                            return; // Detener la ejecución aquí
                        }
                    }

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
                // Continuar la batalla solo si el Pokémon no está debilitado
                if (playerHP.current > 0) {
                    setBattleMessage(`¿Qué debería hacer ${playerPokemon.name}?`);
                    
                    // NUEVO: Sincronizar periódicamente para evitar pérdidas (con baja probabilidad)
                    if (Math.random() < 0.1) { // 10% de probabilidad por turno
                        syncPokemonHP(playerPokemon._id, playerHP.current);
                    }
                }
            }

        } catch (error) {
            console.error("Error en handleUseMove:", error);
            setBattleLog(prev => [...prev, "¡Ha ocurrido un error durante el combate!"]);
        } finally {
            setIsAnimating(false);
        }
    };

    // MODIFICADO: executeRivalAttack con sincronización a DB
    const executeRivalAttack = async () => {
        if (!battleEngine || battleOver) return;

        setIsAnimating(true);
        setBattleMessage(`${rivalPokemon.name} está eligiendo un movimiento...`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = battleEngine.executeRivalMove();

        if (result.success) {
            setBattleMessage(`${rivalPokemon.name} usa ${result.move}...`);
            await new Promise(resolve => setTimeout(resolve, 800));

            setBattleLog(prev => [...prev, result.message]);

            if (result.playerHP) {
                const newHP = result.playerHP.current;
                
                // CAMBIO: Actualizar UI y preparar para sincronización
                updateUIPlayerHP(newHP);
                
                // Si el cambio de HP es significativo o el Pokémon está debilitado, sincronizar con DB
                const hpChange = playerHP.current - newHP;
                const isSignificant = hpChange > playerHP.max * 0.25 || newHP <= 0;
                
                if (isSignificant) {
                    await syncPokemonHP(playerPokemon._id, newHP, true);
                } else {
                    updatePokemonInTeam(playerPokemon.id, newHP);
                }
                
                // Para debug: Verificar el nuevo HP
                console.log(`${playerPokemon.name} recibió daño, nuevo HP: ${newHP}`);

                // MODIFICADO: Verificar inmediatamente si el Pokémon fue derrotado
                if (newHP <= 0 || result.pokemonFainted) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setBattleLog(prev => [...prev, `¡${playerPokemon.name} se ha debilitado!`]);
                    
                    // IMPORTANTE: Asegurar que el HP es 0 exacto en la DB
                    await syncPokemonHP(playerPokemon._id, 0, true);
                    
                    // Verificar si hay más Pokémon disponibles
                    // Filtramos excluyendo el Pokémon actual
                    const healthyPokemon = teamPokemon.filter(pokemon => 
                        pokemon.id !== playerPokemon.id && pokemon.currentHP > 0
                    );
                    
                    // Para debug: Mostrar Pokémon sanos disponibles
                    console.log("Pokémon sanos disponibles:", healthyPokemon.map(p => p.name));
                    
                    if (healthyPokemon.length > 0) {
                        // Todavía hay Pokémon disponibles
                        setBattleMessage("Selecciona otro Pokémon para continuar la batalla.");
                        setShowPokemonSelector(true);
                    } else {
                        // Todo el equipo está debilitado, fin de la batalla
                        setBattleOver(true);
                        setBattleResult('defeat');
                        setBattleMessage(`¡Todo tu equipo ha sido derrotado! Volviendo al mapa...`);
                    }
                    
                    setIsAnimating(false);
                    return; // IMPORTANTE: Detener la ejecución aquí
                }
            }

            // La batalla continúa normalmente solo si tu Pokémon no fue derrotado
            if (!result.isFinished) {
                setBattleMessage("¿Qué debería hacer " + playerPokemon.name + "?");
            }
        } else {
            setBattleLog(prev => [...prev, "El rival no pudo atacar: " + result.message]);
        }

        setIsAnimating(false);
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