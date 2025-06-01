import React, { useEffect, useState, useCallback } from "react";
import "../../Styles/Board.css";
import { useNavigate } from "react-router-dom";
import PokemonPC from "./PokemonPC";

export default function Board() {
  const [grid, setGrid] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ row: 5, col: 5 });
  const [encounterCooldown, setEncounterCooldown] = useState(false);
  const navigate = useNavigate();

  // Estado para el PC
  const [showPC, setShowPC] = useState(false);

  // Nuevo estado para el sistema de niveles y recompensas
  const [playerLevel, setPlayerLevel] = useState(1);
  const [defeatedPokemon, setDefeatedPokemon] = useState(0);
  const [pokeDollars, setPokeDollars] = useState(0);

  // Bloquear scroll completamente
  useEffect(() => {
    // Función para prevenir las teclas que causan scroll
    const preventScrollKeys = (e) => {
      // Teclas que causan scroll: flechas, espacio, inicio, fin, Re Pág, Av Pág
      const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      
      if (keys.includes(e.keyCode)) {
        // Si la tecla está en el control del juego, permitirla pero prevenir el scroll
        if ([37, 38, 39, 40].includes(e.keyCode)) {
          // Permitir el evento para el juego pero prevenir el scroll
          e.preventDefault();
          return;
        }
        
        // Para otras teclas que causan scroll, simplemente prevenirlas
        e.preventDefault();
        return false;
      }
    };
    
    // Prevenir scroll con rueda o trackpad
    const preventWheelScroll = (e) => {
      e.preventDefault();
      return false;
    };
    
    // Agregar listeners para todos los tipos de eventos
    window.addEventListener('keydown', preventScrollKeys, { passive: false });
    document.addEventListener('wheel', preventWheelScroll, { passive: false });
    document.addEventListener('touchmove', preventWheelScroll, { passive: false });
    document.addEventListener('mousewheel', preventWheelScroll, { passive: false });
    document.addEventListener('DOMMouseScroll', preventWheelScroll, { passive: false });
    
    // También podemos deshabilitar el comportamiento de scroll en el body
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Limpieza al desmontar el componente
      window.removeEventListener('keydown', preventScrollKeys);
      document.removeEventListener('wheel', preventWheelScroll);
      document.removeEventListener('touchmove', preventWheelScroll);
      document.removeEventListener('mousewheel', preventWheelScroll);
      document.removeEventListener('DOMMouseScroll', preventWheelScroll);
      
      // Restaurar el comportamiento de scroll del body
      document.body.style.overflow = '';
    };
  }, []);

  // Cargar datos del jugador al inicio
  useEffect(() => {
    // Cargar datos guardados del localStorage
    const savedLevel = localStorage.getItem('player_level') || 1;
    const savedDefeated = localStorage.getItem('defeated_pokemon') || 0;
    const savedDollars = localStorage.getItem('poke_dollars') || 0;

    setPlayerLevel(Number(savedLevel));
    setDefeatedPokemon(Number(savedDefeated));
    setPokeDollars(Number(savedDollars));

    const newGrid = generateGridConBordes(11, 11);
    setGrid(newGrid);
  }, []);

  // Función para actualizar después de una victoria
  const updatePlayerProgress = (victoriesCount, dollarsEarned) => {
    // Actualizar derrotas
    const newDefeatedCount = defeatedPokemon + victoriesCount;
    setDefeatedPokemon(newDefeatedCount);

    // Actualizar PokeDólares
    const newDollars = pokeDollars + dollarsEarned;
    setPokeDollars(newDollars);

    // Calcular nivel (1 nivel por cada 5 victorias)
    const newLevel = Math.floor(newDefeatedCount / 5) + 1;
    if (newLevel !== playerLevel) {
      setPlayerLevel(newLevel);
      // Mostrar notificación de subida de nivel
      alert(`¡Felicidades! Has subido al nivel ${newLevel}. Los Pokémon salvajes serán más fuertes.`);
    }

    // Guardar progreso
    localStorage.setItem('player_level', newLevel);
    localStorage.setItem('defeated_pokemon', newDefeatedCount);
    localStorage.setItem('poke_dollars', newDollars);
  };

  const handleEncounter = useCallback(() => {
    if (grid[playerPosition.row]?.[playerPosition.col] === "grass" &&
      !encounterCooldown &&
      Math.random() < 0.1) {

      setEncounterCooldown(true);
      setTimeout(() => setEncounterCooldown(false), 1000);

      // Pasar el nivel del jugador como parámetro para la dificultad
      navigate('/battle', {
        state: {
          playerLevel: playerLevel
        }
      });
    }
  }, [grid, playerPosition.row, playerPosition.col, encounterCooldown, navigate, playerLevel]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const { row, col } = playerPosition;
      let newRow = row;
      let newCol = col;

      if (e.key === "ArrowUp" || e.key === "w") newRow--;
      if (e.key === "ArrowDown" || e.key === "s") newRow++;
      if (e.key === "ArrowLeft" || e.key === "a") newCol--;
      if (e.key === "ArrowRight" || e.key === "d") newCol++;

      if (
        newRow >= 0 &&
        newRow < grid.length &&
        newCol >= 0 &&
        newCol < grid[0].length &&
        grid[newRow][newCol] !== "wall"
      ) {
        setPlayerPosition({ row: newRow, col: newCol });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPosition, grid]);

  useEffect(() => {
    if (grid.length > 0) {
      handleEncounter();
    }
  }, [playerPosition, grid.length, handleEncounter]);

  // Escuchar eventos de batallas ganadas
  useEffect(() => {
    const handleBattleVictory = (e) => {
      if (e.detail && e.detail.victory) {
        // Actualizar progreso con 1 victoria y 25 PokeDólares
        updatePlayerProgress(1, 25);
      }
    };

    window.addEventListener('battleResult', handleBattleVictory);
    return () => window.removeEventListener('battleResult', handleBattleVictory);
  }, [defeatedPokemon, pokeDollars, playerLevel]);

  const generateGridConBordes = (rows, cols) => {
    const getRandomTile = () => {
      return Math.random() < 0.5 ? "grass" : "floor";
    };

    const grid = [];

    for (let row = 0; row < rows; row++) {
      const currentRow = [];
      for (let col = 0; col < cols; col++) {
        if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
          currentRow.push("wall");
        } else {
          currentRow.push(getRandomTile());
        }
      }
      grid.push(currentRow);
    }

    return grid;
  };

  const getTileClass = (tileType) => {
    switch (tileType) {
      case "grass": return "grass-terrain";
      case "wall": return "wall-block";
      case "floor": return "floor-tile";
      default: return "";
    }
  };

  const handleOpenPC = () => {
    setShowPC(true);
  };

  const handleClosePC = () => {
    setShowPC(false);
  };
  
  return (
    <div className="game-container">
      {/* Indicadores de nivel y moneda en la parte superior */}
      <div className="game-stats">
        <div className="level-indicator">
          <span className="level-label">Nivel:</span>
          <span className="level-value">{playerLevel}</span>
        </div>
        {/* Nuevo indicador de victorias */}
        <div className="victories-indicator">
          <span className="victories-value">{defeatedPokemon % 5}</span>
          <span className="victories-label">/ 5</span>
        </div>
        <div className="money-indicator">
          <span className="money-value">{pokeDollars}</span>
          <span className="money-label">PokeDólares</span>
        </div>
      </div>

      <div className="board">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="board-row">
            {row.map((tile, colIdx) => (
              <div
                key={colIdx}
                className={`cell ${getTileClass(tile)}`}
              >
                {playerPosition.row === rowIdx && playerPosition.col === colIdx && (
                  <div className="player-character"></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Botón PC Pokémon (sin contenedor toolbar) */}
      <button
        className="pc-button"
        onClick={handleOpenPC}
        title="PC Pokémon"
      >
        PC Pokémon
      </button>

      {/* Modal del PC Pokémon */}
      {showPC && (
        <PokemonPC
          onClose={handleClosePC}
        />
      )}
    </div>
  );
}