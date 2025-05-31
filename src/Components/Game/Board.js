import React, { useEffect, useState, useCallback } from "react";
import "../../Styles/Board.css";
import { useNavigate } from "react-router-dom";
import PokemonPC from "./PokemonPC"; // Nuevo componente que crearemos

export default function Board() {
  const [grid, setGrid] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ row: 5, col: 5 });
  const [encounterCooldown, setEncounterCooldown] = useState(false);
  const navigate = useNavigate();
  
  // Nuevo estado para controlar la visibilidad del PC
  const [showPC, setShowPC] = useState(false);

  useEffect(() => {
    const newGrid = generateGridConBordes(11, 11);
    setGrid(newGrid);
  }, []);

  const handleEncounter = useCallback(() => {
    if (grid[playerPosition.row]?.[playerPosition.col] === "grass" && 
        !encounterCooldown && 
        Math.random() < 0.1) {
      
      setEncounterCooldown(true);
      setTimeout(() => setEncounterCooldown(false), 1000);
      navigate('/battle');
    }
  }, [grid, playerPosition.row, playerPosition.col, encounterCooldown, navigate]);

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
  
  // Función para mapear tipos de terreno a clases CSS correctas
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

      {/* Barra de herramientas del juego */}
      <div className="game-toolbar">
        <button 
          className="pc-button"
          onClick={handleOpenPC}
          title="PC Pokémon"
        >
          PC Pokémon
        </button>
        
        {/* Puedes agregar más botones aquí como Centro Pokémon, Tienda, etc. */}
      </div>

      {/* Modal del PC Pokémon */}
      {showPC && (
        <PokemonPC 
          onClose={handleClosePC}
        />
      )}
    </div>
  );
}