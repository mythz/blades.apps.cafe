import { useState } from 'react';
import { useGameContext } from '../../store/GameContext';
import { Difficulty } from '../../types/game';
import { DIFFICULTY_BONUSES } from '../../utils/constants';

export function MainMenu() {
  const { state, dispatch } = useGameContext();
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);

  const handleStartGame = (difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', difficulty });
    setShowDifficultySelect(false);
  };

  if (showDifficultySelect) {
    return (
      <div className="menu-container">
        <h1 className="game-title">Select Difficulty</h1>
        <div className="menu-buttons">
          <button onClick={() => handleStartGame('easy')} className="menu-button">
            Easy <span className="coin-bonus">({DIFFICULTY_BONUSES.easy} coins)</span>
          </button>
          <button onClick={() => handleStartGame('medium')} className="menu-button">
            Medium <span className="coin-bonus">({DIFFICULTY_BONUSES.medium} coins)</span>
          </button>
          <button onClick={() => handleStartGame('hard')} className="menu-button">
            Hard <span className="coin-bonus">({DIFFICULTY_BONUSES.hard} coins)</span>
          </button>
          <button onClick={() => handleStartGame('insane')} className="menu-button">
            Insane <span className="coin-bonus">({DIFFICULTY_BONUSES.insane} coins)</span>
          </button>
          <button onClick={() => setShowDifficultySelect(false)} className="menu-button secondary">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <h1 className="game-title">SWORD FIGHTING ARENA</h1>
      <div className="menu-buttons">
        <button onClick={() => setShowDifficultySelect(true)} className="menu-button">
          Start Game
        </button>
        <button onClick={() => dispatch({ type: 'OPEN_SHOP' })} className="menu-button">
          Shop
        </button>
        <button onClick={() => dispatch({ type: 'OPEN_STATS' })} className="menu-button">
          Statistics
        </button>
      </div>
      <div className="stats-display">
        <p>Coins: {state.coins} | Wins: {state.wins} | Losses: {state.losses}</p>
        {state.winStreak > 0 && <p className="win-streak-indicator">🔥 {state.winStreak} Win Streak!</p>}
      </div>
    </div>
  );
}
