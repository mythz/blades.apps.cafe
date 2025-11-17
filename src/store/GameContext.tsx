import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { GameState } from '../types/game';
import { GameAction } from './actions';
import { GameContextValue } from './types';
import { INITIAL_STATE, createCharacter } from '../data/initialState';
import { saveManager } from '../services/SaveManager';
import { SWORDS } from '../data/swords';
import { ABILITIES } from '../data/abilities';
import { GAME } from '../utils/constants';
import { applyKnockback } from '../engine/PhysicsEngine';

const GameContext = createContext<GameContextValue | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const player = createCharacter('player', 400, 300);
      const enemy = createCharacter('enemy', 700, 300);

      // Apply saved equipment
      player.equippedSword = state.swords.find(s => s.id === state.player.equippedSword.id) || SWORDS[0]!;
      player.abilities = state.abilities.filter(a =>
        state.player.abilities.some(pa => pa.id === a.id)
      );

      return {
        ...state,
        status: 'playing',
        difficulty: action.difficulty,
        player,
        enemy,
        gameTime: 0,
        winner: null,
        particles: [],
      };
    }

    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: { ...state.player, ...action.player },
      };

    case 'UPDATE_ENEMY':
      return {
        ...state,
        enemy: { ...state.enemy, ...action.enemy },
      };

    case 'SET_PLAYER':
      return { ...state, player: action.player };

    case 'SET_ENEMY':
      return { ...state, enemy: action.enemy };

    case 'DAMAGE_PLAYER': {
      if (state.player.invulnerable || state.player.state === 'dead') return state;

      // Check for shield effect
      const hasShield = state.player.activeEffects.some(e => e.type === 'shield');
      if (hasShield) {
        // Shield blocks damage, remove shield effect
        const player = {
          ...state.player,
          activeEffects: state.player.activeEffects.filter(e => e.type !== 'shield'),
        };
        return { ...state, player };
      }

      const newHealth = Math.max(0, state.player.health - action.amount);
      const player = {
        ...state.player,
        health: newHealth,
        state: newHealth <= 0 ? ('dead' as const) : ('hurt' as const),
        invulnerable: true,
        invulnerableTime: GAME.INVULNERABILITY_DURATION,
      };

      return { ...state, player };
    }

    case 'DAMAGE_ENEMY': {
      if (state.enemy.invulnerable || state.enemy.state === 'dead') return state;

      const newHealth = Math.max(0, state.enemy.health - action.amount);
      const enemy = {
        ...state.enemy,
        health: newHealth,
        state: newHealth <= 0 ? ('dead' as const) : ('hurt' as const),
        invulnerable: true,
        invulnerableTime: GAME.INVULNERABILITY_DURATION,
      };

      return { ...state, enemy };
    }

    case 'HEAL_CHARACTER': {
      const target = action.target === 'player' ? state.player : state.enemy;
      const newHealth = Math.min(target.maxHealth, target.health + action.amount);
      const updated = { ...target, health: newHealth };

      return action.target === 'player'
        ? { ...state, player: updated }
        : { ...state, enemy: updated };
    }

    case 'GAME_OVER': {
      const isPlayerWinner = action.winner === 'player';
      const coinsEarned = isPlayerWinner ? GAME.COINS_PER_WIN : 0;

      return {
        ...state,
        status: 'gameover',
        winner: action.winner,
        coins: state.coins + coinsEarned,
        totalCoins: state.totalCoins + coinsEarned,
        wins: isPlayerWinner ? state.wins + 1 : state.wins,
        losses: !isPlayerWinner ? state.losses + 1 : state.losses,
      };
    }

    case 'ADD_COINS':
      return {
        ...state,
        coins: state.coins + action.amount,
        totalCoins: state.totalCoins + action.amount,
      };

    case 'SPEND_COINS':
      if (state.coins < action.amount) return state;
      return { ...state, coins: state.coins - action.amount };

    case 'UNLOCK_SWORD': {
      const swords = state.swords.map(s =>
        s.id === action.swordId ? { ...s, unlocked: true } : s
      );
      return { ...state, swords };
    }

    case 'UNLOCK_ABILITY': {
      const abilities = state.abilities.map(a =>
        a.id === action.abilityId ? { ...a, unlocked: true } : a
      );
      return { ...state, abilities };
    }

    case 'EQUIP_SWORD': {
      const sword = state.swords.find(s => s.id === action.swordId && s.unlocked);
      if (!sword) return state;

      return {
        ...state,
        player: { ...state.player, equippedSword: sword },
      };
    }

    case 'EQUIP_ABILITY': {
      const ability = state.abilities.find(a => a.id === action.abilityId && a.unlocked);
      if (!ability) return state;

      // Toggle ability
      const hasAbility = state.player.abilities.some(a => a.id === action.abilityId);
      const abilities = hasAbility
        ? state.player.abilities.filter(a => a.id !== action.abilityId)
        : [...state.player.abilities, ability].slice(0, 3); // Max 3 abilities

      return {
        ...state,
        player: { ...state.player, abilities },
      };
    }

    case 'PAUSE_GAME':
      return { ...state, status: 'paused' };

    case 'RESUME_GAME':
      return { ...state, status: 'playing' };

    case 'OPEN_SHOP':
      return { ...state, status: 'shop' };

    case 'CLOSE_SHOP':
      return { ...state, status: 'menu' };

    case 'BACK_TO_MENU':
      return { ...state, status: 'menu', winner: null };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    case 'TICK':
      return {
        ...state,
        gameTime: state.gameTime + action.deltaTime,
      };

    case 'LOAD_SAVE': {
      const { data } = action;

      // Apply save data
      const swords = SWORDS.map(s => ({
        ...s,
        unlocked: data.unlockedSwords.includes(s.id) || s.price === 0,
      }));

      const abilities = ABILITIES.map(a => ({
        ...a,
        unlocked: data.unlockedAbilities.includes(a.id),
      }));

      const equippedSword = swords.find(s => s.id === data.equippedSword) || swords[0]!;
      const equippedAbilities = abilities.filter(a => data.equippedAbilities.includes(a.id));

      return {
        ...state,
        coins: data.coins,
        totalCoins: data.totalCoins,
        wins: data.wins,
        losses: data.losses,
        swords,
        abilities,
        settings: data.settings,
        player: {
          ...state.player,
          equippedSword,
          abilities: equippedAbilities,
        },
      };
    }

    case 'ADD_PARTICLES':
      return {
        ...state,
        particles: [...state.particles, ...action.particles].slice(-GAME.MAX_PARTICLES),
      };

    case 'UPDATE_PARTICLES':
      return {
        ...state,
        particles: action.particles,
      };

    case 'APPLY_KNOCKBACK': {
      const target = action.target === 'player' ? state.player : state.enemy;
      applyKnockback(target, action.direction, action.force);
      return action.target === 'player'
        ? { ...state, player: { ...target } }
        : { ...state, enemy: { ...target } };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const saveGame = useCallback(async () => {
    await saveManager.saveGame(state);
  }, [state]);

  const loadGame = useCallback(async () => {
    const data = await saveManager.loadGame();
    if (data) {
      dispatch({ type: 'LOAD_SAVE', data });
    }
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'BACK_TO_MENU' });
  }, []);

  const value: GameContextValue = {
    state,
    dispatch,
    saveGame,
    loadGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
}
