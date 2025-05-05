import { useState, useEffect } from "react";
import "../Styles/App.css";
import AuthPopup from "../Components/Auth/Authpopup";

export default function App() {
  const [showAuthPopup, setShowAuthPopup] = useState(false); // Estado para controlar el popup
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar si el usuario está logueado
  const [username, setUsername] = useState(""); // Estado para almacenar el nombre del usuario

  useEffect(() => {
    const animElements = document.querySelectorAll(".anim");
    animElements.forEach((el) => {
    });
  }, []);
  const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = JSON.parse(atob(token.split(".")[1])); // Decodifica el payload del JWT
        setUsername(user.username); // Establece el nombre del usuario
        setIsLoggedIn(true); // Marca al usuario como logueado
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }

  const toggleAuthPopup = () => {
    setShowAuthPopup(!showAuthPopup); // Alterna la visibilidad del popup
  };

  return (
    <div className="container">
      <div className="sidebar">
        <span className="logo">S</span>
        <a className="logo-expand" href="#">
          Pokemon Eternal
        </a>
        <div className="side-wrapper">
          <div className="side-title">MENU</div>
          <div className="side-menu">
          <a className="sidebar-link" onClick={toggleAuthPopup}>
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
  Login / Register
</a>
            <a className="sidebar-link" href="#">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.135 20.773v-3.057c0-.78.637-1.414 1.423-1.414h2.875c.377 0 .74.15 1.006.414.267.265.417.625.417 1v3.057c-.002.325.126.637.356.867.23.23.544.36.87.36h1.962a3.46 3.46 0 002.443-1 3.41 3.41 0 001.013-2.422V9.867c0-.735-.328-1.431-.895-1.902l-6.671-5.29a3.097 3.097 0 00-3.949.072L3.467 7.965A2.474 2.474 0 002.5 9.867v8.702C2.5 20.464 4.047 22 5.956 22h1.916c.68 0 1.231-.544 1.236-1.218l.027-.009z" />
              </svg>
              Inicio
            </a>
            <a className="sidebar-link" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentcolor" class="size-6">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
              </svg>
              Juego
            </a>
            <a className="sidebar-link" href="#">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.23 7.29V3.283c0-.427.34-.782.77-.782.385 0 .711.298.763.677l.007.104v4.01h4.78c2.38 0 4.335 1.949 4.445 4.38l.005.215v5.04c0 2.447-1.887 4.456-4.232 4.569l-.208.005H6.44c-2.38 0-4.326-1.94-4.435-4.379L2 16.905v-5.03c0-2.447 1.878-4.466 4.222-4.58l.208-.004h4.8v6.402l-1.6-1.652a.755.755 0 00-1.09 0 .81.81 0 00-.22.568c0 .157.045.32.14.459l.08.099 2.91 3.015c.14.155.34.237.55.237a.735.735 0 00.465-.166l.075-.071 2.91-3.015c.3-.31.3-.816 0-1.126a.755.755 0 00-1.004-.077l-.086.077-1.59 1.652V7.291h-1.54z" />
              </svg>
              Tutorial
            </a>
           
            <a className="sidebar-link discover" href="#">
              <svg
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                id="svg6190"
                version="1.1"
                fill="currentColor"
                height="28px"
                width="28px"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    id="path1641"
                    d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 2a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6z"
                    style={{
                      opacity: 1,
                      vectorEffect: "none",
                      fill: "currentColor",
                      fillOpacity: 1,
                      stroke: "none",
                      strokeWidth: 4,
                      strokeLinecap: "square",
                      strokeLinejoin: "round",
                      strokeMiterlimit: 4,
                      strokeDasharray: "none",
                      strokeDashoffset: 3.2,
                      strokeOpacity: 0.55063291,
                    }}
                  ></path>
                  <rect
                    style={{
                      opacity: 1,
                      vectorEffect: "none",
                      fill: "currentColor", // Cambiado a currentColor
                      fillOpacity: 1,
                      stroke: "none",
                      strokeWidth: 4.45366764,
                      strokeLinecap: "square",
                      strokeLinejoin: "round",
                      strokeMiterlimit: 4,
                      strokeDasharray: "none",
                      strokeDashoffset: 3.2,
                      strokeOpacity: 0.55063291,
                    }}
                    id="rect1152-3-5"
                    width="2"
                    height="14.370387"
                    x="7"
                    y="-15"
                    transform="rotate(90)"
                  ></rect>
                  <rect
                    style={{
                      opacity: 1,
                      vectorEffect: "none",
                      fill: "currentColor", // Cambiado a currentColor
                      fillOpacity: 1,
                      stroke: "none",
                      strokeWidth: 4.45366764,
                      strokeLinecap: "square",
                      strokeLinejoin: "round",
                      strokeMiterlimit: 4,
                      strokeDasharray: "none",
                      strokeDashoffset: 3.2,
                      strokeOpacity: 0.55063291,
                    }}
                    id="rect1152-3-5-3"
                    width="2"
                    height="14.370387"
                    x="9.7678213"
                    y="-4.1643934"
                    transform="rotate(30)"
                  ></rect>
                  <rect
                    style={{
                      opacity: 1,
                      vectorEffect: "none",
                      fill: "currentColor", // Cambiado a currentColor
                      fillOpacity: 1,
                      stroke: "none",
                      strokeWidth: 4.45366764,
                      strokeLinecap: "square",
                      strokeLinejoin: "round",
                      strokeMiterlimit: 4,
                      strokeDasharray: "none",
                      strokeDashoffset: 3.2,
                      strokeOpacity: 0.55063291,
                    }}
                    id="rect1152-3-5-3-6"
                    width="2"
                    height="14.370387"
                    x="1.7678211"
                    y="3.6504133"
                    transform="rotate(-30)"
                  ></rect>
                </g>
              </svg>
              GachaPon(NEW)
            </a>
            <a className="sidebar-link" href="#">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.769 8.382H22C22 4.985 19.964 3 16.516 3H7.484C4.036 3 2 4.985 2 8.338v7.324C2 19.015 4.036 21 7.484 21h9.032C19.964 21 22 19.015 22 15.662v-.313h-4.231c-1.964 0-3.556-1.552-3.556-3.466 0-1.915 1.592-3.467 3.556-3.467v-.034zm0 1.49h3.484c.413 0 .747.326.747.728v2.531a.746.746 0 01-.747.728H17.85c-.994.013-1.864-.65-2.089-1.595a1.982 1.982 0 01.433-1.652 2.091 2.091 0 011.576-.74zm.151 2.661h.329a.755.755 0 00.764-.745.755.755 0 00-.764-.746h-.329a.766.766 0 00-.54.213.727.727 0 00-.224.524c0 .413.34.75.764.754zM6.738 8.382h5.644a.755.755 0 00.765-.746.755.755 0 00-.765-.745H6.738a.755.755 0 00-.765.737c0 .413.341.75.765.754z"
                />
              </svg>
              Sobre Nosotros
            </a>
          </div>
        </div>
        <div>
        </div>
        <div className="wrapper">
          <div className="header">
            <div className="user-settings">
              <img
                className="user-img"
                src="https://images.unsplash.com/photo-1587918842454-870dbd18261a?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=943&q=80"
                alt=""
              />
              <div className="user-name">Thomas</div>
              <svg viewBox="0 0 492 492" fill="currentColor">
                <path d="M484.13 124.99l-16.11-16.23a26.72 26.72 0 00-19.04-7.86c-7.2 0-13.96 2.79-19.03 7.86L246.1 292.6 62.06 108.55c-5.07-5.06-11.82-7.85-19.03-7.85s-13.97 2.79-19.04 7.85L7.87 124.68a26.94 26.94 0 000 38.06l219.14 219.93c5.06 5.06 11.81 8.63 19.08 8.63h.09c7.2 0 13.96-3.57 19.02-8.63l218.93-219.33A27.18 27.18 0 00492 144.1c0-7.2-2.8-14.06-7.87-19.12z" />
              </svg>
              <div className="notify">
                <div className="notification" />
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.707 8.796c0 1.256.332 1.997 1.063 2.85.553.628.73 1.435.73 2.31 0 .874-.287 1.704-.863 2.378a4.537 4.537 0 01-2.9 1.413c-1.571.134-3.143.247-4.736.247-1.595 0-3.166-.068-4.737-.247a4.532 4.532 0 01-2.9-1.413 3.616 3.616 0 01-.864-2.378c0-.875.178-1.682.73-2.31.754-.854 1.064-1.594 1.064-2.85V8.37c0-1.682.42-2.781 1.283-3.858C7.861 2.942 9.919 2 11.956 2h.09c2.08 0 4.204.987 5.466 2.625.82 1.054 1.195 2.108 1.195 3.745v.426zM9.074 20.061c0-.504.462-.734.89-.833.5-.106 3.545-.106 4.045 0 .428.099.89.33.89.833-.025.48-.306.904-.695 1.174a3.635 3.635 0 01-1.713.731 3.795 3.795 0 01-1.008 0 3.618 3.618 0 01-1.714-.732c-.39-.269-.67-.694-.695-1.173z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="main-container">
          </div>
        </div>
      </div>
    </div>
  );
}
