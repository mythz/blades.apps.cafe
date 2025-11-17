import { useGameContext } from '../../store/GameContext';

export function TutorialOverlay() {
  const { state, dispatch } = useGameContext();

  if (!state.showTutorial || state.status !== 'menu') return null;

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-panel">
        <h2>Welcome to Sword Fighting Arena!</h2>

        <div className="tutorial-section">
          <h3>Controls</h3>
          <ul>
            <li><strong>Move:</strong> Arrow Keys or A/D</li>
            <li><strong>Jump:</strong> Up Arrow, W, or Space</li>
            <li><strong>Attack:</strong> Enter or J</li>
            <li><strong>Pause:</strong> Escape or P</li>
          </ul>
        </div>

        <div className="tutorial-section">
          <h3>How to Play</h3>
          <ul>
            <li>Defeat enemies by reducing their health to zero</li>
            <li>Avoid falling into the lava below!</li>
            <li>Build <span className="highlight">combos</span> for bonus damage</li>
            <li>Heal automatically every 60 seconds</li>
            <li>Earn coins to unlock better swords and abilities</li>
          </ul>
        </div>

        <div className="tutorial-section">
          <h3>Pro Tips</h3>
          <ul>
            <li>Higher difficulties give more coins per win</li>
            <li>Perfect wins (no damage) count toward achievements</li>
            <li>Use platforms to your advantage</li>
            <li>Save up for the Legendary Blade!</li>
          </ul>
        </div>

        <button onClick={() => dispatch({ type: 'HIDE_TUTORIAL' })} className="menu-button">
          Got it!
        </button>
      </div>
    </div>
  );
}
