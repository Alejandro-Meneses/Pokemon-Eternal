import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import Welcome from "../Components/Welcome";
import Game from "../Components/Game/Game";
import Board from "../Components/Game/Board";
import Battle from "../Components/Game/Battle";
import Tutorial from "../Components/Tutorial";
import AboutUs from "../Components/AboutUs";
import Gacha from "../Components/Gacha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faGamepad,
  faBook,
  faInfoCircle,
  faSignOutAlt,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";

import "../Styles/App.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
/* const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );*/

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);



  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <Router>
      {!isLoggedIn ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="container">
          {/* Sidebar */}
          <div className="sidebar">
            <span className="logo"></span>
            {/* Corregido: reemplazado <a> con href inválido por un <div> */}
            <div className="logo-expand">Pokemon Eternal</div>
            <div className="side-wrapper">
              <div className="side-title"></div>
              <div className="side-menu">
                <Link className="sidebar-link" to="/">
                  <FontAwesomeIcon icon={faHome} className="icon" />
                  Inicio
                </Link>
                <Link className="sidebar-link" to="/game">
                  <FontAwesomeIcon icon={faGamepad} className="icon" />
                  Juego
                </Link>
                <Link className="sidebar-link" to="/tutorial">
                  <FontAwesomeIcon icon={faBook} className="icon" />
                  Tutorial
                </Link>
                <Link className="sidebar-link" to="/gacha">
                  <FontAwesomeIcon icon={faTicket} className="icon" />
                  GachaPon(NEW)
                </Link>
                <Link className="sidebar-link" to="/aboutus">
                  <FontAwesomeIcon icon={faInfoCircle} className="icon" />
                  Sobre Nosotros
                </Link>
                <Link
                  className="sidebar-link"
                  to="/login"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="main-container">
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/game" element={<Game />} />
              {/* Puedes crear y agregar estos componentes si aún no existen */}
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/gacha" element={<Gacha />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/Board" element={<Board />} />
              <Route path="/battle" element={<Battle />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}