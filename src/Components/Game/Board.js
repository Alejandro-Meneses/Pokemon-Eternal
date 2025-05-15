import React, { useEffect, useState,useCallback } from "react";
import "../../Styles/Board.css";
import { useNavigate } from "react-router-dom"; // Importar para la navegación

export default function Board() {
  const [grid, setGrid] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ row: 5, col: 5 });
  const [encounterCooldown, setEncounterCooldown] = useState(false); // Para evitar encuentros consecutivos
  const navigate = useNavigate(); // Hook para navegación

  useEffect(() => {
    const newGrid = generateGridConBordes(11, 11);
    setGrid(newGrid);
  }, []);

  // Función para manejar encuentros de Pokémon
   const handleEncounter = useCallback(() => {
    // Verificar si estamos en grass y aplicar probabilidad de encuentro (10%)
    if (grid[playerPosition.row]?.[playerPosition.col] === "grass" && 
        !encounterCooldown && 
        Math.random() < 0.1) { // 10% de probabilidad
      
      // Activar cooldown para evitar encuentros consecutivos
      setEncounterCooldown(true);
      setTimeout(() => setEncounterCooldown(false), 1000);
      
      // Navegar a la pantalla de batalla
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

  // Efecto para verificar encuentros cuando la posición del jugador cambia
  useEffect(() => {
    // Verificar posibles encuentros después de cada movimiento
    if (grid.length > 0) {
      handleEncounter();
    }
  }, [playerPosition ,grid.length, handleEncounter]);

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

  return (
    <div className="board">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="board-row">
          {row.map((tile, colIdx) => (
            <div key={colIdx} className={`cell ${tile}`}>
              {playerPosition.row === rowIdx && playerPosition.col === colIdx && (
                <div className="player"></div>
              )}
            </div>
          ))}
        </div>
      ))}
      {grid.length > 0 && grid[playerPosition.row][playerPosition.col] === "grass" && (
        <div className="encounter-indicator">
          Estás en zona de hierba. Posible encuentro: 10%
        </div>
      )}
    </div>
  );
}