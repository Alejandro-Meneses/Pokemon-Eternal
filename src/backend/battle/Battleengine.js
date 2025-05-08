import { getTypeEffectiveness, getEffectivenessMessage } from '../../constants/Types';

/**
 * Motor de batalla Pokémon
 * Maneja la lógica de combate, cálculos de daño, y estado de la batalla
 */
class BattleEngine {
    /**
     * Inicializa un motor de batalla
     * @param {Object} playerPokemon - Pokémon del jugador
     * @param {Object} rivalPokemon - Pokémon del rival/oponente
     */
    constructor(playerPokemon, rivalPokemon) {
        // Pokémon en batalla
        this.playerPokemon = playerPokemon;
        this.rivalPokemon = rivalPokemon;
        
        // Inicializar HP actual basado en stats
        this.playerPokemon.currentHP = this.playerPokemon.stats.hp;
        this.rivalPokemon.currentHP = this.rivalPokemon.stats.hp;
        
        // Estado de la batalla
        this.battleLog = [];
        this.isFinished = false;
        this.winner = null;
        this.currentTurn = null; // Se determinará por velocidad cuando se ejecute el turno
    }
    
    /**
     * Determina el orden de los movimientos basado en velocidad
     * @param {Object} playerMove - Movimiento seleccionado por el jugador
     * @returns {String} - Quién ataca primero ("player" o "rival")
     */
    determineAttackOrder(playerMove) {
        // Prioridad de movimientos (a implementar en el futuro si es necesario)
        // Si los movimientos tienen prioridades diferentes, el de mayor prioridad va primero
        
        // Si tienen igual prioridad, se decide por velocidad
        const playerSpeed = this.playerPokemon.stats.speed;
        const rivalSpeed = this.rivalPokemon.stats.speed;
        
        if (playerSpeed > rivalSpeed) {
            return "player";
        } else if (rivalSpeed > playerSpeed) {
            return "rival";
        } else {
            // En caso de empate, se decide aleatoriamente
            return Math.random() < 0.5 ? "player" : "rival";
        }
    }
    
    /**
     * Calcular el daño de un ataque
     * @param {Object} attacker - Pokémon atacante
     * @param {Object} defender - Pokémon defensor
     * @param {Object} move - Movimiento utilizado
     * @returns {Number} - Cantidad de daño calculado
     */
    calculateDamage(attacker, defender, move) {
        // Si el movimiento no tiene poder, no hace daño
        if (!move.power) return 0;
        
        // Verificar que el tipo del movimiento esté definido
        if (!move.type) {
            console.warn(`Tipo de movimiento no definido para ${move.name}, usando el primer tipo del Pokémon`);
            move.type = attacker.types[0];
        }
        
        // Obtener las estadísticas relevantes según el tipo de movimiento
        const attackStat = move.category === 'physical' ? attacker.stats.attack : attacker.stats['special-attack'];
        const defenseStat = move.category === 'physical' ? defender.stats.defense : defender.stats['special-defense'];
        
        // Calcular multiplicador de tipo (efectividad)
        const typeMultiplier = getTypeEffectiveness(move.type, defender.types[0], defender.types[1] || defender.types[0]);
        
        // STAB (Same Type Attack Bonus) - Bonificación por mismo tipo
        const stab = attacker.types.includes(move.type) ? 1.5 : 1;
        
        // Fórmula básica de daño (similar a los juegos)
        // ((2 * nivel + 10) / 250 * (ataque / defensa) * poder + 2) * modificadores
        const level = attacker.level || 50; // Usar nivel del atacante, con 50 como respaldo
        const baseDamage = Math.floor(((2 * level + 10) / 250) * (attackStat / defenseStat) * move.power + 2);
        // Aplicar modificadores
        const random = Math.random() * (1 - 0.85) + 0.85; // Factor aleatorio entre 0.85 y 1
        let finalDamage = Math.floor(baseDamage * stab * typeMultiplier * random);
        
        // Asegurar que el daño sea al menos 1 si el movimiento debería hacer daño
        finalDamage = Math.max(1, finalDamage);
        
        // Registro para depuración
        console.log(`Daño calculado: ${finalDamage}`, {
            attackStat, defenseStat, typeMultiplier, stab, baseDamage, random
        });
        
        return finalDamage;
    }
    
    /**
     * Ejecuta un turno completo de batalla usando el movimiento seleccionado por el jugador
     * @param {Object} playerMove - Movimiento seleccionado por el jugador
     * @returns {Object} - Resultado del turno completo
     */
    executeTurn(playerMove) {
        if (this.isFinished) {
            return {
                success: false,
                message: "La batalla ha terminado"
            };
        }
        
        // Seleccionar un movimiento aleatorio para el rival
        const availableMoves = this.rivalPokemon.moves;
        
        if (!availableMoves || availableMoves.length === 0) {
            console.error("El rival no tiene movimientos disponibles");
            return {
                success: false,
                message: "Error: el rival no tiene movimientos disponibles"
            };
        }
        
        const rivalMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        
        console.log("Movimiento rival seleccionado:", {
            name: rivalMove.name,
            type: rivalMove.type,
            power: rivalMove.power,
            category: rivalMove.category
        });
        
        // Determinar quién ataca primero basado en velocidad
        const firstAttacker = this.determineAttackOrder(playerMove);
        
        // Resultados de cada ataque
        let playerAttackResult = null;
        let rivalAttackResult = null;
        
        // Ejecutar ataques en el orden determinado
        if (firstAttacker === "player") {
            playerAttackResult = this.executeAttack("player", playerMove);
            
            // Solo ejecutar el ataque del rival si la batalla no ha terminado
            if (!this.isFinished) {
                rivalAttackResult = this.executeAttack("rival", rivalMove);
            }
        } else {
            rivalAttackResult = this.executeAttack("rival", rivalMove);
            
            // Solo ejecutar el ataque del jugador si la batalla no ha terminado
            if (!this.isFinished) {
                playerAttackResult = this.executeAttack("player", playerMove);
            }
        }
        
        // Devolver resultado completo del turno
        return {
            success: true,
            firstAttacker,
            playerAttackResult,
            rivalAttackResult,
            battleState: this.getBattleState()
        };
    }
    
    /**
     * Ejecuta un ataque individual
     * @param {String} attacker - Quién ataca ("player" o "rival")
     * @param {Object} move - Movimiento usado
     * @returns {Object} - Resultado del ataque
     */
    executeAttack(attacker, move) {
        // Configurar los Pokémon según quién ataca
        const attackingPokemon = attacker === "player" ? this.playerPokemon : this.rivalPokemon;
        const defendingPokemon = attacker === "player" ? this.rivalPokemon : this.playerPokemon;
        
        // Calcular daño
        const damage = this.calculateDamage(attackingPokemon, defendingPokemon, move);
        
        // Aplicar daño
        if (attacker === "player") {
            this.rivalPokemon.currentHP = Math.max(0, this.rivalPokemon.currentHP - damage);
        } else {
            this.playerPokemon.currentHP = Math.max(0, this.playerPokemon.currentHP - damage);
        }
        
        // Calcular efectividad para el mensaje
        const typeMultiplier = getTypeEffectiveness(move.type, defendingPokemon.types[0], defendingPokemon.types[1] || defendingPokemon.types[0]);
        const effectivenessMessage = getEffectivenessMessage(typeMultiplier);
        
        // Construir mensaje de resultado
        let resultMessage;
        if (attacker === "player") {
            resultMessage = `${attackingPokemon.name} usó ${move.name}${damage > 0 ? ` y causó ${damage} de daño` : ''}. ${effectivenessMessage}`;
        } else {
            // Para el rival, formato especial: "El rival [Nombre] usó [Ataque]"
            resultMessage = `El rival ${attackingPokemon.name} usó ${move.name}${damage > 0 ? ` y causó ${damage} de daño` : ''}. ${effectivenessMessage}`;
        }
        
        // Verificar si la batalla ha terminado
        if (this.rivalPokemon.currentHP <= 0) {
            this.isFinished = true;
            this.winner = "player";
            resultMessage += ` ¡${this.rivalPokemon.name} se ha debilitado!`;
        } else if (this.playerPokemon.currentHP <= 0) {
            this.isFinished = true;
            this.winner = "rival";
            resultMessage += ` ¡${this.playerPokemon.name} se ha debilitado!`;
        }
        
        return {
            success: true,
            message: resultMessage,
            damage: damage,
            effectiveness: typeMultiplier,
            move: move.name
        };
    
    }
    
    /**
     * Obtener el registro de batalla
     * @returns {Array} - Array con los mensajes del log de batalla
     */
    getBattleLog() {
        return [...this.battleLog];
    }
    
    /**
     * Obtener el estado actual de la batalla
     * @returns {Object} - Estado actual
     */
    getBattleState() {
        return {
            isFinished: this.isFinished,
            winner: this.winner,
            playerHP: {
                current: this.playerPokemon.currentHP,
                max: this.playerPokemon.stats.hp,
                percentage: (this.playerPokemon.currentHP / this.playerPokemon.stats.hp) * 100
            },
            rivalHP: {
                current: this.rivalPokemon.currentHP,
                max: this.rivalPokemon.stats.hp,
                percentage: (this.rivalPokemon.currentHP / this.rivalPokemon.stats.hp) * 100
            }
        };
    }
    
    /**
     * Ejecuta un ataque del rival
     * @returns {Object} - Resultado del ataque del rival
     */
    executeRivalMove() {
        if (this.isFinished) {
            return {
                success: false,
                message: "La batalla ha terminado"
            };
        }
        
        // Seleccionar un movimiento aleatorio para el rival
        const availableMoves = this.rivalPokemon.moves;
        
        if (!availableMoves || availableMoves.length === 0) {
            console.error("El rival no tiene movimientos disponibles");
            return {
                success: false,
                message: "El rival no tiene movimientos disponibles"
            };
        }
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const rivalMove = availableMoves[randomIndex];
        
        console.log("Movimiento rival seleccionado:", {
            name: rivalMove.name,
            type: rivalMove.type,
            power: rivalMove.power,
            category: rivalMove.category
        });
        
        // Ejecutar el ataque del rival
        const attackResult = this.executeAttack("rival", rivalMove);
        
        // Devolver resultado completo con estado de batalla
        return {
            success: true,
            message: attackResult.message,
            move: rivalMove.name,
            damage: attackResult.damage,
            effectiveness: attackResult.effectiveness,
            isFinished: this.isFinished,
            playerHP: {
                current: this.playerPokemon.currentHP,
                max: this.playerPokemon.stats.hp,
                percentage: (this.playerPokemon.currentHP / this.playerPokemon.stats.hp) * 100
            }
        };
    }
}

export default BattleEngine;