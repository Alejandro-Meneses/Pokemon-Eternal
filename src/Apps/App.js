import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import "../Styles/App.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Importa el componente de Font Awesome
import { faHome, faGamepad, faBook, faInfoCircle, faSignOutAlt,faTicket } from "@fortawesome/free-solid-svg-icons";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para manejar la carga

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false); // La comprobación del token ha terminado
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (isLoading) {
    // Muestra un indicador de carga mientras se verifica el token
    return <div>Cargando...</div>;
  }
  return (
    <Router>
      <Routes>
        {/* Ruta para la página principal (index) */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <div className="container">
                <div className="sidebar">
                  <span className="logo"></span>
                  <a className="logo-expand" href="#">
                    Pokemon Eternal
                  </a>
                  <div className="side-wrapper">
                    <div className="side-title">MENU</div>
                    <div className="side-menu">
                      <Link className="sidebar-link" to="/">
                           <FontAwesomeIcon icon={faHome} className="icon" />
                        Inicio
                      </Link>
                      <Link className="sidebar-link" to="/">
                      <FontAwesomeIcon icon={faGamepad} className="icon" />
                        Juego
                      </Link>
                      <Link className="sidebar-link" to="/">
                      <FontAwesomeIcon icon={faBook} className="icon" />
                        Tutorial
                      </Link>

                      <Link className="sidebar-link discover" to="/">
                      <FontAwesomeIcon icon={faTicket} className="icon" />
                        GachaPon(NEW)
                      </Link>
                      <Link className="sidebar-link" to="/">
                      <FontAwesomeIcon icon={faInfoCircle} className="icon" />
                        Sobre Nosotros
                      </Link>
                      <Link
                        className="sidebar-link"
                        to="/login"
                        onClick={handleLogout} // Llama a handleLogout al hacer clic
                      >
                       <FontAwesomeIcon icon={faSignOutAlt} className="icon" />

                        Cerrar sesión
                      </Link>
                    </div>
                  </div>
                  <div>
                  </div>
                    </div>
                    <div className="main-container">
                    </div>
                  </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta para la página de login */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Ruta para la página de registro */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
