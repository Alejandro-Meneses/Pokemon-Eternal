# Pokémon Eternal

## 🌟 Descripción

Pokémon Eternal es un juego web basado en el universo Pokémon que permite a los usuarios crear cuentas, coleccionar Pokémon, y participar en batallas estratégicas por turnos. El proyecto combina una interfaz atractiva con mecánicas de juego inspiradas en la saga original.

**[Prueba la aplicación aquí](https://pokemoneternal.vercel.app)**

## 📋 Características Actuales

- **Sistema de Autenticación**: Registro de usuarios e inicio de sesión con JWT.
- **Interfaz Responsiva**: Diseño adaptable para dispositivos móviles y escritorio.
- **Sistema de Tipos**: Implementación del sistema de tipos de Pokémon.
- **Movimiento por Mapa**: Sistema básico para explorar el mapa del juego.
- **Sistema de Combate**: Versión inicial del sistema de batallas por turnos (en desarrollo).

## 🚀 Próximas Características

- **Sistema de Batalla Mejorado**: Implementación completa de un sistema de combate por turnos con mayor profundidad estratégica.
- **Evolución de Pokémon**: Sistema que permitirá a los Pokémon evolucionar basado en condiciones específicas.
- **Sistema de Captura**: Mecánica para capturar nuevos Pokémon durante las batallas.
- **Colección de Pokémon**: Sistema completo para visualizar y gestionar los Pokémon capturados.
- **Modo Multijugador**: Batallas en tiempo real contra otros jugadores.

## 🛠️ Tecnologías Utilizadas

### Frontend
- React.js
- React Router
- CSS personalizado para la interfaz de usuario
- FontAwesome para iconografía

### Backend
- Node.js
- Express.js
- MongoDB para almacenamiento de datos
- JWT para autenticación

### Despliegue
- Vercel para hosting y despliegue continuo

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura de tres capas:

1. **Interfaz de Usuario**: Desarrollada con React, se encarga de toda la interacción con el usuario.
2. **API REST**: Servidor Express que maneja peticiones y respuestas.
3. **Base de Datos**: MongoDB almacena usuarios, Pokémon y datos del juego.

## 💻 Instalación Local

Para ejecutar el proyecto en tu entorno local:

```bash
# Clonar el repositorio
git clone https://github.com/Alejandro-Meneses/Proyecto-Pokemon.git
cd pokemon-eternal

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# El frontend estará disponible en http://localhost:3000
# El backend escuchará en http://localhost:10000