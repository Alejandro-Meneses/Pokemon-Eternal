import React, { useState, useEffect } from 'react';
import '../../Styles/PokemonPC.css';
import Pokemon from '../../backend/models/Pokemon';
import { getTeam, getStorage, swapPokemon } from '../../Services/PokemonService';

const PokemonPC = ({ onClose }) => {
    const [teamPokemon, setTeamPokemon] = useState([]);
    const [storagePokemon, setStoragePokemon] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeamPokemon, setSelectedTeamPokemon] = useState(null);
    const [selectedTeamIndex, setSelectedTeamIndex] = useState(null);
    const [selectedStoragePokemon, setSelectedStoragePokemon] = useState(null);
    const [selectedStorageIndex, setSelectedStorageIndex] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // Cargar los Pokémon al montar el componente
    useEffect(() => {
        const loadPokemon = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    setError("No estás autenticado");
                    return;
                }

                // Cargar datos del equipo, HP y almacenamiento en paralelo
                const [teamData, storageData, teamHPData] = await Promise.all([
                    getTeam(token),
                    getStorage(token),
                ]);

                if (!teamData || teamData.error) {
                    setError(teamData?.error || "Error al cargar el equipo");
                    return;
                }

                if (!storageData || storageData.error) {
                    setError(storageData?.error || "Error al cargar el almacenamiento");
                    return;
                }

                // Crear un mapa de HP por ID para acceso rápido
                const hpMap = {};
                if (teamHPData && Array.isArray(teamHPData)) {
                    teamHPData.forEach(pokemon => {
                        if (pokemon._id) {
                            hpMap[pokemon._id.toString()] = {
                                currentHP: pokemon.currentHP,
                                maxHP: pokemon.maxHP
                            };
                        }
                    });
                }

                console.log("Datos de HP cargados:", hpMap);

                // Procesar equipo y almacenamiento en paralelo
                const [team, storage] = await Promise.all([
                    Promise.all(
                        teamData.map(async (pokemon) => {
                            const fullPokemon = await Pokemon.fetchPokemon(pokemon.pokemonId);
                            fullPokemon._id = pokemon._id;
                            fullPokemon.position = pokemon.position;
                            fullPokemon.isShiny = pokemon.isShiny || false;
                            
                            // Usar HP de la base de datos si está disponible
                            const pokemonHP = hpMap[pokemon._id.toString()];
                            if (pokemonHP) {
                                fullPokemon.currentHP = pokemonHP.currentHP;
                                fullPokemon.maxHP = pokemonHP.maxHP || fullPokemon.stats.hp;
                            } else {
                                // Como fallback, usar HP de la base local o valor máximo
                                fullPokemon.currentHP = pokemon.currentHP || fullPokemon.stats.hp;
                                fullPokemon.maxHP = pokemon.maxHP || fullPokemon.stats.hp;
                            }
                            
                            return fullPokemon;
                        })
                    ),
                    Promise.all(
                        storageData.map(async (pokemon) => {
                            const fullPokemon = await Pokemon.fetchPokemon(pokemon.pokemonId);
                            fullPokemon._id = pokemon._id;
                            fullPokemon.isShiny = pokemon.isShiny || false;
                            
                            // Para almacenamiento, suponemos que están curados
                            fullPokemon.currentHP = fullPokemon.stats.hp;
                            fullPokemon.maxHP = fullPokemon.stats.hp;
                            
                            return fullPokemon;
                        })
                    )
                ]);

                // Ordenar equipo por posición
                team.sort((a, b) => a.position - b.position);
                
                setTeamPokemon(team);
                setStoragePokemon(storage);
                setError(null);
            } catch (error) {
                console.error("Error cargando Pokémon:", error);
                setError("Error al cargar los Pokémon");
            } finally {
                setLoading(false);
            }
        };

        loadPokemon();
    }, []);

    // Función para seleccionar un Pokémon del equipo
    const handleSelectTeamPokemon = (pokemon, index) => {
        setSelectedTeamPokemon(pokemon);
        setSelectedTeamIndex(index);
    };

    // Función para seleccionar un Pokémon del almacenamiento
    const handleSelectStoragePokemon = (pokemon, index) => {
        setSelectedStoragePokemon(pokemon);
        setSelectedStorageIndex(index);
    };

    // Función para confirmar el intercambio
    const handleConfirmSwap = async () => {
        if (!selectedTeamPokemon || !selectedStoragePokemon) {
            setMessage("Debes seleccionar dos Pokémon para intercambiarlos");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const result = await swapPokemon(
                selectedTeamPokemon.position, // Posición en el equipo (1-6)
                selectedStorageIndex,         // Índice en el array de almacenamiento
                token
            );
            if (result && result.error) {
                setError(result.error);
                return;
            }

            // Actualizar UI con el intercambio
            setTeamPokemon(prev => {
                const newTeam = [...prev];
                newTeam[selectedTeamIndex] = selectedStoragePokemon;
                return newTeam;
            });

            setStoragePokemon(prev => {
                const newStorage = [...prev];
                newStorage[selectedStorageIndex] = selectedTeamPokemon;
                return newStorage;
            });

            setMessage(`¡${selectedTeamPokemon.name} intercambiado por ${selectedStoragePokemon.name}!`);

            // Limpiar selección
            setSelectedTeamPokemon(null);
            setSelectedTeamIndex(null);
            setSelectedStoragePokemon(null);
            setSelectedStorageIndex(null);
        } catch (err) {
            console.error("Error en el intercambio:", err);
            setError("Error al realizar el intercambio");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSwap = () => {
        setSelectedTeamPokemon(null);
        setSelectedTeamIndex(null);
        setSelectedStoragePokemon(null);
        setSelectedStorageIndex(null);
    };

    // Efecto para cursor de espera durante carga
    useEffect(() => {
        document.body.style.cursor = loading ? 'wait' : 'default';
        return () => { document.body.style.cursor = 'default'; };
    }, [loading]);

    if (loading && teamPokemon.length === 0 && storagePokemon.length === 0) {
        return (
            <div className="pokemon-pc-overlay">
                <div className="pokemon-pc-modal">
                    <h3>PC Pokémon</h3>
                    <div className="pc-loading">Cargando tus Pokémon...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pokemon-pc-overlay">
            <div className="pokemon-pc-modal">
                <h2>PC Pokémon</h2>

                {error && <div className="pc-error">{error}</div>}
                {message && <div className="pc-message">{message}</div>}

                <div className="pc-container">
                    <div className="pc-section">
                        <h3>Tu Equipo</h3>
                        <div className="pc-pokemon-grid">
                            {teamPokemon.map((pokemon, index) => (
                                <div
                                    key={`team-${index}`}
                                    className={`pc-pokemon-card ${selectedTeamPokemon?._id === pokemon._id ? 'selected' : ''} ${pokemon.isShiny ? 'shiny-pokemon' : ''}`}
                                    onClick={() => handleSelectTeamPokemon(pokemon, index)}
                                >
                                    <div className="pc-pokemon-position">{pokemon.position}</div>
                                    {pokemon.isShiny && <div className="pc-pokemon-shiny-indicator">★</div>}
                                    <img
                                        src={
                                            (pokemon.isShiny && pokemon.sprites?.front_shiny) ||
                                            pokemon.sprites?.front ||
                                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                                        }
                                        alt={pokemon.name}
                                        className="pc-pokemon-sprite"
                                    />
                                    <div className="pc-pokemon-info">
                                        <p className="pc-pokemon-name">{pokemon.name.toUpperCase()}</p>
                                        <div className="pc-pokemon-hp">
                                            <div className="pc-pokemon-hp-bar">
                                                <div
                                                    className="pc-pokemon-hp-fill"
                                                    style={{
                                                        width: `${(pokemon.currentHP / (pokemon.maxHP || pokemon.stats.hp)) * 100}%`,
                                                        backgroundColor: pokemon.currentHP / (pokemon.maxHP || pokemon.stats.hp) > 0.5
                                                            ? '#78C850' : pokemon.currentHP / (pokemon.maxHP || pokemon.stats.hp) > 0.2
                                                                ? '#F8D030' : '#F03030'
                                                    }}
                                                ></div>
                                            </div>
                                            <p className="pc-pokemon-hp-text">
                                                {Math.ceil(pokemon.currentHP)}/{pokemon.maxHP || pokemon.stats.hp}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pc-section">
                        <h3>Almacenamiento</h3>
                        <div className="pc-pokemon-grid">
                            {storagePokemon.map((pokemon, index) => (
                                <div
                                    key={`storage-${index}`}
                                    className={`pc-pokemon-card ${selectedStoragePokemon?._id === pokemon._id ? 'selected' : ''} ${pokemon.isShiny ? 'shiny-pokemon' : ''}`}
                                    onClick={() => handleSelectStoragePokemon(pokemon, index)}
                                >
                                    {pokemon.isShiny && <div className="pc-pokemon-shiny-indicator">★</div>}
                                    <img
                                        src={
                                            (pokemon.isShiny && pokemon.sprites?.front_shiny) ||
                                            pokemon.sprites?.front ||
                                            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
                                        }
                                        alt={pokemon.name}
                                        className="pc-pokemon-sprite"
                                    />
                                    <p className="pc-pokemon-name">{pokemon.name.toUpperCase()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedTeamPokemon && selectedStoragePokemon && (
                    <div className="pc-swap-section">
                        <h4>Intercambio</h4>
                        <p>¿Quieres intercambiar {selectedTeamPokemon.name} por {selectedStoragePokemon.name}?</p>
                        <div className="pc-swap-buttons">
                            <button
                                onClick={handleConfirmSwap}
                                disabled={loading}
                                className="btn btn-success"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={handleCancelSwap}
                                disabled={loading}
                                className="btn btn-danger"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <div className="pc-actions">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        Cerrar PC
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokemonPC;