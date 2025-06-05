import React, { useEffect, useState, useCallback } from "react";
import "../../Styles/Board.css";
import { useNavigate } from "react-router-dom";
import PokemonPC from "./PokemonPC";
import { getPlayerStats } from "../../Services/UserService";

export default function Board() {
  const [grid, setGrid] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ row: 5, col: 5 });
  const [encounterCooldown, setEncounterCooldown] = useState(false);
  const navigate = useNavigate();

  // Estado para el PC
  const [showPC, setShowPC] = useState(false);

  // Estado para el sistema de niveles y recompensas - Sin PokeDollars
  const [playerLevel, setPlayerLevel] = useState(1);
  const [defeatedPokemon, setDefeatedPokemon] = useState(0);

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

  // Token para las llamadas a la API
  const token = localStorage.getItem('token');
  
  // Cargar datos del jugador al inicio
  useEffect(() => {
    // 1. Intentar cargar datos del servidor primero
    if (token) {
      getPlayerStats(token)
        .then(data => {
          if (!data.error) {
            console.log("Datos cargados del servidor:", data);
            // Actualizar estado con datos del servidor - sin pokeDollars
            setPlayerLevel(data.playerLevel || 1);
            setDefeatedPokemon((data.playerStats?.battlesWon || 0) % 5); // Para mostrar progreso actual
            
            // Guardar también en localStorage como respaldo - sin pokeDollars
            localStorage.setItem('player_level', data.playerLevel || 1);
            localStorage.setItem('defeated_pokemon', data.playerStats?.battlesWon || 0);
          } else {
            console.error("Error al cargar datos del servidor:", data.error);
            // Si hay error, usar datos de localStorage como respaldo
            loadFromLocalStorage();
          }
        })
        .catch(error => {
          console.error("Error en getPlayerStats:", error);
          loadFromLocalStorage();
        });
    } else {
      // Si no hay token, usar localStorage
      loadFromLocalStorage();
    }
    
    // Generar grid en cualquier caso
    const newGrid = generateGridConBordes(11, 11);
    setGrid(newGrid);
  }, [token]);
  
  // Función para cargar datos desde localStorage (como respaldo)
  const loadFromLocalStorage = () => {
    const savedLevel = localStorage.getItem('player_level') || 1;
    const savedDefeated = localStorage.getItem('defeated_pokemon') || 0;

    setPlayerLevel(Number(savedLevel));
    setDefeatedPokemon(Number(savedDefeated) % 5); // Solo mostrar el progreso actual
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
          playerLevel: playerLevel,
          defeatedPokemon: defeatedPokemon // Añadido para seguimiento
        }
      });
    }
  }, [grid, playerPosition.row, playerPosition.col, encounterCooldown, navigate, playerLevel, defeatedPokemon]);

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

  // Escuchar eventos de batallas ganadas - Simplificado y sin PokeDollars
  useEffect(() => {
    const handleBattleResult = (e) => {
      if (e.detail) {
        // Simplemente recargar los datos actualizados del servidor
        if (token) {
          getPlayerStats(token)
            .then(data => {
              if (!data.error) {
                // Actualizar estado con datos frescos del servidor - sin pokeDollars
                setPlayerLevel(data.playerLevel || 1);
                setDefeatedPokemon(data.levelProgress || 0);
              }
            })
            .catch(error => console.error("Error al actualizar estadísticas:", error));
        }
      }
    };

    window.addEventListener('battleResult', handleBattleResult);
    return () => window.removeEventListener('battleResult', handleBattleResult);
  }, [token]);

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

  const handleMobileMove = (direction) => {
    const { row, col } = playerPosition;
    let newRow = row;
    let newCol = col;

    switch(direction) {
      case 'up': newRow--; break;
      case 'down': newRow++; break;
      case 'left': newCol--; break;
      case 'right': newCol++; break;
      default: return;
    }

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

  return (
    <div className="game-container">
      {/* Indicadores de nivel y progreso - Sin mostrar PokeDollars */}
      <div className="game-stats">
        <div className="level-indicator">
          <span className="level-label">Nivel:</span>
          <span className="level-value">{playerLevel}</span>
        </div>
        {/* Indicador de victorias */}
        <div className="victories-indicator">
          <span className="victories-value">{defeatedPokemon}</span>
          <span className="victories-label">/ 5</span>
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

      {/* CONJUNTO DE 5 BOTONES: PC EN EL CENTRO + DIRECCIONES */}
      <div className="button-group">
        {/* Fila superior: Solo UP */}
        <div className="button-row">
          <div className="button-spacer"></div>
          <button 
            className="control-btn direction-btn"
            onClick={() => handleMobileMove('up')}
            aria-label="Mover arriba"
          >
            ▲
          </button>
          <div className="button-spacer"></div>
        </div>
        
        {/* Fila central: LEFT + PC + RIGHT */}
        <div className="button-row">
          <button 
            className="control-btn direction-btn"
            onClick={() => handleMobileMove('left')}
            aria-label="Mover izquierda"
          >
            ◀
          </button>
          <button
            className="control-btn pc-button-center"
            onClick={handleOpenPC}
            title="PC Pokémon"
          >
            🖥️
          </button>
          <button 
            className="control-btn direction-btn"
            onClick={() => handleMobileMove('right')}
            aria-label="Mover derecha"
          >
            ▶
          </button>
        </div>
        
        {/* Fila inferior: Solo DOWN */}
        <div className="button-row">
          <div className="button-spacer"></div>
          <button 
            className="control-btn direction-btn"
            onClick={() => handleMobileMove('down')}
            aria-label="Mover abajo"
          >
            ▼
          </button>
          <div className="button-spacer"></div>
        </div>
      </div>

      {showPC && (
        <PokemonPC
          onClose={handleClosePC}
        />
      )}
    </div>
  );
}