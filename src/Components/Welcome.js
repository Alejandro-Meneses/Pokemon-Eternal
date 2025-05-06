import React from "react";
import "../Styles/Welcome.css"; // Archivo CSS para estilos específicos

export default function Welcome() {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">¡Bienvenido a Pokemon Eternal!</h1>
      <p className="welcome-text">
        Explora el mundo de Pokemon Eternal, donde puedes coleccionar, entrenar y luchar con tus Pokémon favoritos. ¡Prepárate para una aventura épica!
      </p>
      <div className="welcome-actions">
        <button className="welcome-button">Comenzar</button>
        <button className="welcome-button secondary">Ver Tutorial</button>
      </div>
    </div>
  );
}