import { useGameContext } from '../../store/GameContext';
import { GAME } from '../../utils/constants';

export function GameOverScreen() {
  const { state, dispatch } = useGameContext();
  const isVictory = state.winner === 'player';

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
          <p className="coins-earned">+{GAME.COINS_PER_WIN} Coins Earned!</p>
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
