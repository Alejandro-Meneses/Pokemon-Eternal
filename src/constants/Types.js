export const TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
    'steel', 'fairy'
];

// Traducciones de tipos
export const TYPE_TRANSLATIONS = {
    'normal': 'Normal',
    'fire': 'Fuego',
    'water': 'Agua',
    'electric': 'Eléctrico',
    'grass': 'Planta',
    'ice': 'Hielo',
    'fighting': 'Lucha',
    'poison': 'Veneno',
    'ground': 'Tierra',
    'flying': 'Volador',
    'psychic': 'Psíquico',
    'bug': 'Bicho',
    'rock': 'Roca',
    'ghost': 'Fantasma',
    'dragon': 'Dragón',
    'dark': 'Siniestro',
    'steel': 'Acero',
    'fairy': 'Hada'
};

// Colores para los tipos
export const TYPE_COLORS = {
  'normal': {
    light: '#A8A878',
    medium: '#A8A878',
    dark: '#8A8A59',
    text: '#FFFFFF'
  },
  'fire': {
    light: '#F8B878',
    medium: '#F08030',
    dark: '#C86920',
    text: '#FFFFFF'
  },
  'water': {
    light: '#98B8F8',
    medium: '#6890F0',
    dark: '#4A7AE0',
    text: '#FFFFFF'
  },
  'electric': {
    light: '#F8D878',
    medium: '#F8D030',
    dark: '#DBBA18',
    text: '#212121'
  },
  'grass': {
    light: '#98D880',
    medium: '#78C850',
    dark: '#5CA935',
    text: '#FFFFFF'
  },
  'ice': {
    light: '#B8E8E8',
    medium: '#98D8D8',
    dark: '#7AC5C5',
    text: '#212121'
  },
  'fighting': {
    light: '#D88080',
    medium: '#C03028',
    dark: '#9D2721',
    text: '#FFFFFF'
  },
  'poison': {
    light: '#B058B0',
    medium: '#A040A0',
    dark: '#803380',
    text: '#FFFFFF'
  },
  'ground': {
    light: '#F0CFB0',
    medium: '#E0C068',
    dark: '#BDA53C',
    text: '#212121'
  },
  'flying': {
    light: '#C8B0F8',
    medium: '#A890F0',
    dark: '#8A70D8',
    text: '#FFFFFF'
  },
  'psychic': {
    light: '#F878A0',
    medium: '#F85888',
    dark: '#EC3F6F',
    text: '#FFFFFF'
  },
  'bug': {
    light: '#B8D068',
    medium: '#A8B820',
    dark: '#8D9A19',
    text: '#FFFFFF'
  },
  'rock': {
    light: '#D0C058',
    medium: '#B8A038',
    dark: '#93802D',
    text: '#FFFFFF'
  },
  'ghost': {
    light: '#A890B0',
    medium: '#705898',
    dark: '#554374',
    text: '#FFFFFF'
  },
  'dragon': {
    light: '#8870F8',
    medium: '#7038F8',
    dark: '#5018D8',
    text: '#FFFFFF'
  },
  'dark': {
    light: '#A08068',
    medium: '#705848',
    dark: '#513B2A',
    text: '#FFFFFF'
  },
  'steel': {
    light: '#D0D0E0',
    medium: '#B8B8D0',
    dark: '#9797BA',
    text: '#212121'
  },
  'fairy': {
    light: '#F8B8D0',
    medium: '#EE99AC',
    dark: '#E06B86',
    text: '#212121'
  }
};

// Matriz de efectividad de tipos (multiplicadores de daño)
export const TYPE_CHART = {
  'normal': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 1,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 0.5,
    'ghost': 0,
    'dragon': 1,
    'dark': 1,
    'steel': 0.5,
    'fairy': 1
  },
  'fire': {
    'normal': 1,
    'fire': 0.5,
    'water': 0.5,
    'electric': 1,
    'grass': 2,
    'ice': 2,
    'fighting': 1,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 2,
    'rock': 0.5,
    'ghost': 1,
    'dragon': 0.5,
    'dark': 1,
    'steel': 2,
    'fairy': 1
  },
  'water': {
    'normal': 1,
    'fire': 2,
    'water': 0.5,
    'electric': 1,
    'grass': 0.5,
    'ice': 1,
    'fighting': 1,
    'poison': 1,
    'ground': 2,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 2,
    'ghost': 1,
    'dragon': 0.5,
    'dark': 1,
    'steel': 1,
    'fairy': 1
  },
  'electric': {
    'normal': 1,
    'fire': 1,
    'water': 2,
    'electric': 0.5,
    'grass': 0.5,
    'ice': 1,
    'fighting': 1,
    'poison': 1,
    'ground': 0,
    'flying': 2,
    'psychic': 1,
    'bug': 1,
    'rock': 1,
    'ghost': 1,
    'dragon': 0.5,
    'dark': 1,
    'steel': 1,
    'fairy': 1
  },
  'grass': {
    'normal': 1,
    'fire': 0.5,
    'water': 2,
    'electric': 1,
    'grass': 0.5,
    'ice': 1,
    'fighting': 1,
    'poison': 0.5,
    'ground': 2,
    'flying': 0.5,
    'psychic': 1,
    'bug': 0.5,
    'rock': 2,
    'ghost': 1,
    'dragon': 0.5,
    'dark': 1,
    'steel': 0.5,
    'fairy': 1
  },
  'ice': {
    'normal': 1,
    'fire': 0.5,
    'water': 0.5,
    'electric': 1,
    'grass': 2,
    'ice': 0.5,
    'fighting': 1,
    'poison': 1,
    'ground': 2,
    'flying': 2,
    'psychic': 1,
    'bug': 1,
    'rock': 1,
    'ghost': 1,
    'dragon': 2,
    'dark': 1,
    'steel': 0.5,
    'fairy': 1
  },
  'fighting': {
    'normal': 2,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 2,
    'fighting': 1,
    'poison': 0.5,
    'ground': 1,
    'flying': 0.5,
    'psychic': 0.5,
    'bug': 0.5,
    'rock': 2,
    'ghost': 0,
    'dragon': 1,
    'dark': 2,
    'steel': 2,
    'fairy': 0.5
  },
  'poison': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 2,
    'ice': 1,
    'fighting': 1,
    'poison': 0.5,
    'ground': 0.5,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 0.5,
    'ghost': 0.5,
    'dragon': 1,
    'dark': 1,
    'steel': 0,
    'fairy': 2
  },
  'ground': {
    'normal': 1,
    'fire': 2,
    'water': 1,
    'electric': 2,
    'grass': 0.5,
    'ice': 1,
    'fighting': 1,
    'poison': 2,
    'ground': 1,
    'flying': 0,
    'psychic': 1,
    'bug': 0.5,
    'rock': 2,
    'ghost': 1,
    'dragon': 1,
    'dark': 1,
    'steel': 2,
    'fairy': 1
  },
  'flying': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 0.5,
    'grass': 2,
    'ice': 1,
    'fighting': 2,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 2,
    'rock': 0.5,
    'ghost': 1,
    'dragon': 1,
    'dark': 1,
    'steel': 0.5,
    'fairy': 1
  },
  'psychic': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 2,
    'poison': 2,
    'ground': 1,
    'flying': 1,
    'psychic': 0.5,
    'bug': 1,
    'rock': 1,
    'ghost': 1,
    'dragon': 1,
    'dark': 0,
    'steel': 0.5,
    'fairy': 1
  },
  'bug': {
    'normal': 1,
    'fire': 0.5,
    'water': 1,
    'electric': 1,
    'grass': 2,
    'ice': 1,
    'fighting': 0.5,
    'poison': 0.5,
    'ground': 1,
    'flying': 0.5,
    'psychic': 2,
    'bug': 1,
    'rock': 1,
    'ghost': 0.5,
    'dragon': 1,
    'dark': 2,
    'steel': 0.5,
    'fairy': 0.5
  },
  'rock': {
    'normal': 1,
    'fire': 2,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 2,
    'fighting': 0.5,
    'poison': 1,
    'ground': 0.5,
    'flying': 2,
    'psychic': 1,
    'bug': 2,
    'rock': 1,
    'ghost': 1,
    'dragon': 1,
    'dark': 1,
    'steel': 0.5,
    'fairy': 1
  },
  'ghost': {
    'normal': 0,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 1,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 2,
    'bug': 1,
    'rock': 1,
    'ghost': 2,
    'dragon': 1,
    'dark': 0.5,
    'steel': 1,
    'fairy': 1
  },
  'dragon': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 1,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 1,
    'ghost': 1,
    'dragon': 2,
    'dark': 1,
    'steel': 0.5,
    'fairy': 0
  },
  'dark': {
    'normal': 1,
    'fire': 1,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 0.5,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 2,
    'bug': 1,
    'rock': 1,
    'ghost': 2,
    'dragon': 1,
    'dark': 0.5,
    'steel': 1,
    'fairy': 0.5
  },
  'steel': {
    'normal': 1,
    'fire': 0.5,
    'water': 0.5,
    'electric': 0.5,
    'grass': 1,
    'ice': 2,
    'fighting': 1,
    'poison': 1,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 2,
    'ghost': 1,
    'dragon': 1,
    'dark': 1,
    'steel': 0.5,
    'fairy': 2
  },
  'fairy': {
    'normal': 1,
    'fire': 0.5,
    'water': 1,
    'electric': 1,
    'grass': 1,
    'ice': 1,
    'fighting': 2,
    'poison': 0.5,
    'ground': 1,
    'flying': 1,
    'psychic': 1,
    'bug': 1,
    'rock': 1,
    'ghost': 1,
    'dragon': 2,
    'dark': 2,
    'steel': 0.5,
    'fairy': 1
  }
};

/**
 * Obtiene el multiplicador de efectividad de un tipo de ataque contra un tipo de defensa
 * @param {string} attackType - Tipo del ataque
 * @param {string} defenseType1 - Tipo primario del defensor
 * @param {string} defenseType2 - Tipo secundario del defensor (opcional)
 * @returns {number} - Multiplicador de efectividad
 */
export const getTypeEffectiveness = (attackType, defenseType1, defenseType2 = null) => {
  // Si el tipo de ataque es undefined, usar normal como fallback
  if (!attackType) {
    console.warn("Tipo de ataque indefinido, usando 'normal' como fallback");
    attackType = 'normal';
  }
  
  // Normalizar tipos a minúsculas y asegurarse de que son strings
  const attack = String(attackType).toLowerCase();
  const defense1 = String(defenseType1).toLowerCase();
  
  // Verificar que los tipos existen en nuestra tabla
  if (!TYPE_CHART[attack]) {
    console.warn(`Tipo de ataque no reconocido: ${attackType}, usando efectividad neutral`);
    return 1; // Efectividad neutral como fallback
  }
  
  if (!TYPE_CHART[attack][defense1]) {
    console.warn(`Tipo de defensa no reconocido: ${defenseType1}, usando efectividad neutral`);
    return 1; // Efectividad neutral como fallback
  }
  
  let effectiveness = TYPE_CHART[attack][defense1];
  
  // Si hay un segundo tipo de defensa, multiplicamos por su efectividad
  if (defenseType2) {
    const defense2 = String(defenseType2).toLowerCase();
    if (TYPE_CHART[attack][defense2]) {
      effectiveness *= TYPE_CHART[attack][defense2];
    } else {
      console.warn(`Segundo tipo de defensa no reconocido: ${defenseType2}, ignorando`);
    }
  }
  
  return effectiveness;
};

/**
 * Obtiene el mensaje descriptivo basado en la efectividad
 * @param {number} effectiveness - Multiplicador de efectividad
 * @returns {string} - Mensaje descriptivo
 */
export const getEffectivenessMessage = (effectiveness) => {
  if (effectiveness === 0) {
    return "No afecta al Pokémon enemigo...";
  } else if (effectiveness < 1) {
    return "No es muy eficaz...";
  } else if (effectiveness > 1) {
    return "¡Es super eficaz!";
  }
  return "";
};

/**
 * Obtiene el color asociado a un tipo
 * @param {string} type - Tipo de Pokémon
 * @param {string} shade - Tonalidad (light/medium/dark)
 * @returns {string} - Código de color
 */
export const getTypeColor = (type, shade = 'medium') => {
  type = String(type).toLowerCase();
  
  if (!TYPE_COLORS[type]) {
    console.warn(`Tipo ${type} no reconocido para color, usando normal como fallback`);
    type = 'normal';
  }
  
  return TYPE_COLORS[type][shade] || TYPE_COLORS[type].medium;
};

/**
 * Traduce el nombre del tipo al español
 * @param {string} type - Tipo en inglés
 * @returns {string} - Tipo en español
 */
export const translateType = (type) => {
  if (!type) return "Normal";
  type = String(type).toLowerCase();
  return TYPE_TRANSLATIONS[type] || type;
};

export default {
  TYPES,
  TYPE_TRANSLATIONS,
  TYPE_COLORS,
  TYPE_CHART,
  getTypeEffectiveness,
  getEffectivenessMessage,
  getTypeColor,
  translateType
};