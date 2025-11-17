import { useGameContext } from '../../store/GameContext';

export function PauseMenu() {
  const { dispatch } = useGameContext();

  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <h2>PAUSED</h2>
        <div className="menu-buttons">
          <button onClick={() => dispatch({ type: 'RESUME_GAME' })} className="menu-button">
            Resume
          </button>
          <button onClick={() => dispatch({ type: 'BACK_TO_MENU' })} className="menu-button">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
