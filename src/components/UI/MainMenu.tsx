import { useState } from 'react';
import { useGameContext } from '../../store/GameContext';
import { Difficulty } from '../../types/game';

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
            Easy
          </button>
          <button onClick={() => handleStartGame('medium')} className="menu-button">
            Medium
          </button>
          <button onClick={() => handleStartGame('hard')} className="menu-button">
            Hard
          </button>
          <button onClick={() => handleStartGame('insane')} className="menu-button">
            Insane
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
        <button className="menu-button disabled" disabled>
          Settings
        </button>
      </div>
      <div className="stats-display">
        <p>Coins: {state.coins} | Wins: {state.wins} | Losses: {state.losses}</p>
      </div>
    </div>
  );
}
