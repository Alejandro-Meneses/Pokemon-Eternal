/**
 * Clase Move - Representa un movimiento Pokémon
 */
class Move {
    /**
     * Crea una nueva instancia de movimiento
     * @param {Object} moveData - Datos del movimiento
     */
    constructor(moveData) {
        this.id = moveData.id;
        this.name = moveData.name.replace ? moveData.name.replace(/-/g, ' ') : moveData.name;
        
        // Asegurar que el tipo esté correctamente definido
        if (typeof moveData.type === 'string') {
            this.type = moveData.type.toLowerCase();
        } else if (moveData.type && moveData.type.name) {
            this.type = moveData.type.name.toLowerCase();
        } else {
            // Valor por defecto si no hay tipo
            this.type = 'normal';
            console.warn(`Tipo no definido para el movimiento ${this.name}, usando 'normal' como valor predeterminado`);
        }
        
        this.power = moveData.power || 0;
        this.accuracy = moveData.accuracy || 100;
        this.pp = moveData.pp || 10;
        
        // Asegurar que la categoría esté correctamente definida
        if (moveData.damage_class && moveData.damage_class.name) {
            this.category = moveData.damage_class.name;
        } else {
            // Por defecto, basado en el tipo (simplificación)
            const physicalTypes = ['normal', 'fighting', 'flying', 'ground', 'rock', 'bug', 'ghost', 'poison', 'steel'];
            this.category = physicalTypes.includes(this.type) ? 'physical' : 'special';
        }
        
        this.effect_entries = moveData.effect_entries || [];
    }

    /**
     * Obtener una descripción corta del efecto del movimiento
     * @returns {String} - Descripción corta
     */
    getShortEffect() {
        if (this.effect_entries && this.effect_entries.length > 0) {
            return this.effect_entries.find(entry => entry.short_effect)?.short_effect || 
                   "Sin descripción disponible";
        }
        return "Sin descripción disponible";
    }

    /**
     * Obtener la descripción para el tooltip
     * @returns {String} - Descripción formateada para el tooltip
     */
    getTooltipDescription() {
        // Formatear información para el tooltip usando la categoría directamente de la API
        const categoryLabel = this.category === 'physical' ? 'Físico' : 
                             this.category === 'special' ? 'Especial' : 'Estado';
        
        return `${this.name}\n` +
               `Tipo: ${this.type.toUpperCase()}\n` +
               `Categoría: ${categoryLabel}\n` +
               `Poder: ${this.power || '—'}\n` + 
               `Precisión: ${this.accuracy || '—'}\n`;
    }

    /**
     * Cargar un movimiento desde la PokeAPI
     * @param {String|Number} nameOrId - Nombre o ID del movimiento a cargar
     * @returns {Promise<Move>} - Promesa con el movimiento cargado
     */
    static async fetchMove(nameOrId) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/move/${nameOrId}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status} al cargar el movimiento ${nameOrId}`);
            }
            
            const data = await response.json();
            
            return new Move({
                id: data.id,
                name: data.name,
                type: data.type,
                power: data.power,
                accuracy: data.accuracy,
                pp: data.pp,
                damage_class: data.damage_class,
                effect_entries: data.effect_entries
            });
        } catch (error) {
            console.error(`Error al cargar el movimiento ${nameOrId}:`, error);
            
            // Crear un movimiento básico por defecto en caso de error
            return new Move({
                id: typeof nameOrId === 'number' ? nameOrId : 0,
                name: typeof nameOrId === 'string' ? nameOrId.replace(/-/g, ' ') : 'Ataque',
                type: 'normal',
                power: 40,
                accuracy: 100,
                pp: 35,
                damage_class: { name: 'physical' },
                effect_entries: [{ short_effect: 'Un ataque básico que causa daño al objetivo.' }]
            });
        }
    }
}

export default Move;