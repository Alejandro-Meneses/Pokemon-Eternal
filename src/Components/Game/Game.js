import React, { useState, useEffect } from "react";
import "../../Styles/Game.css";
import Pokemon from "../../backend/models/Pokemon"; // Importa el modelo de Pokémon
import Board from "../Game/Board"; // Importa el componente Board
import Battle from "../Game/Battle"; // Importa el componente Battle

export default function Game() {
  const [pokemons, setPokemons] = useState([]); // Estado para almacenar los datos de los 3 Pokémon
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const [view, setView] = useState("game"); // Estado para alternar entre Game, Board y Battle

  useEffect(() => {
    const fetchRandomPokemons = async () => {
      try {
        const randomIds = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1025) + 1); // IDs aleatorios (1-898)
        const promises = randomIds.map((id) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json())
        );
        const results = await Promise.all(promises); // Espera a que todas las solicitudes se completen
        const pokemonInstances = results.map((data) => new Pokemon(data)); // Crea instancias del modelo
        setPokemons(pokemonInstances); // Guarda los Pokémon en el estado
        setLoading(false); // Cambia el estado de carga
      } catch (err) {
        setError(err.message); // Maneja errores
        setLoading(false);
      }
    };

    fetchRandomPokemons();
  }, []); // Solo se ejecuta una vez al montar el componente

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="header">
        {/* Botones para alternar entre vistas */}
        <button
          onClick={() => setView("game")}
          className="toggle-button"
          disabled={view === "game"} // Deshabilita el botón si ya estás en Game
        >
          Ir a Game
        </button>
        <button
          onClick={() => setView("board")}
          className="toggle-button"
          disabled={view === "board"} // Deshabilita el botón si ya estás en Board
        >
          Ir al Tablero
        </button>
        <button
          onClick={() => setView("battle")}
          className="toggle-button"
          disabled={view === "battle"} // Deshabilita el botón si ya estás en Battle
        >
          Ir a Batalla
        </button>
      </div>

      {/* Renderizado condicional */}
      {view === "board" ? (
        <Board /> // Muestra el componente Board
      ) : view === "battle" ? (
        <Battle /> // Muestra el componente Battle
      ) : (
        <div className="game-container">
          {pokemons.map((pokemon) => (
            <div key={pokemon.id} className={`pokemon-card type-${pokemon.types[0]}`}>
              <h1 className={`pokemon-name type-text-${pokemon.types[0]}`}>{pokemon.name.toUpperCase()}</h1>
              <img
                className="pokemon-image"
                src={pokemon.sprites.officialArtwork}
                alt={pokemon.name}
              />
              <div className="pokemon-info">
                <p>
                  <strong>Tipos:</strong> {pokemon.types.join(", ")}
                </p>
                <p>
                  <strong>Estadísticas:</strong>
                </p>
                <ul className="pokemon-stats">
                  {Object.entries(pokemon.stats).map(([stat, value]) => (
                    <li key={stat}>
                      {stat.toUpperCase()}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}