import { useGameContext } from '../../store/GameContext';
import { DIFFICULTY_BONUSES } from '../../utils/constants';

export function GameOverScreen() {
  const { state, dispatch } = useGameContext();
  const isVictory = state.winner === 'player';
  const coinsEarned = isVictory ? (DIFFICULTY_BONUSES[state.difficulty] || 50) : 0;
  const isPerfect = isVictory && state.player.health === state.player.maxHealth;

  const handlePlayAgain = () => {
    dispatch({ type: 'START_GAME', difficulty: state.difficulty });
  };

  return (
    <div className="gameover-overlay">
      <div className="gameover-screen">
        <h1 className={isVictory ? 'victory' : 'defeat'}>
          {isVictory ? 'VICTORY!' : 'DEFEAT!'}
        </h1>
        {isVictory && (
          <>
            <p className="coins-earned">+{coinsEarned} Coins Earned!</p>
            {isPerfect && <p className="perfect-win">⭐ PERFECT WIN! ⭐</p>}
            {state.maxCombo > 1 && <p className="combo-info">Max Combo: {state.maxCombo}x</p>}
            {state.winStreak > 0 && <p className="streak-info">🔥 {state.winStreak} Win Streak!</p>}
          </>
        )}
        {!isVictory && state.winStreak > 0 && (
          <p className="streak-broken">Streak broken at {state.winStreak}</p>
        )}
        <p className="total-coins">Total Coins: {state.coins}</p>
        <div className="menu-buttons">
          <button onClick={handlePlayAgain} className="menu-button">
            Play Again
          </button>
          <button onClick={() => dispatch({ type: 'OPEN_SHOP' })} className="menu-button">
            Shop
          </button>
          <button onClick={() => dispatch({ type: 'BACK_TO_MENU' })} className="menu-button">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
