import { useGameContext } from '../../store/GameContext';

export function StatsScreen() {
  const { state, dispatch } = useGameContext();

  const winRate = state.wins + state.losses > 0
    ? ((state.wins / (state.wins + state.losses)) * 100).toFixed(1)
    : '0.0';

  const avgDamagePerGame = state.wins + state.losses > 0
    ? (state.totalDamageDealt / (state.wins + state.losses)).toFixed(1)
    : '0.0';

  return (
    <div className="stats-overlay">
      <div className="stats-screen">
        <h2>STATISTICS</h2>

        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Wins</div>
            <div className="stat-value">{state.wins}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Total Losses</div>
            <div className="stat-value">{state.losses}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{winRate}%</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Current Win Streak</div>
            <div className="stat-value win-streak">{state.winStreak}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Max Win Streak</div>
            <div className="stat-value">{state.maxWinStreak}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Perfect Wins</div>
            <div className="stat-value perfect">{state.perfectWins}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Max Combo</div>
            <div className="stat-value combo">{state.maxCombo}x</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Total Coins Earned</div>
            <div className="stat-value coins">{state.totalCoins}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Total Damage Dealt</div>
            <div className="stat-value">{state.totalDamageDealt}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Total Damage Taken</div>
            <div className="stat-value">{state.totalDamageTaken}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Avg Damage/Game</div>
            <div className="stat-value">{avgDamagePerGame}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Games Played</div>
            <div className="stat-value">{state.wins + state.losses}</div>
          </div>
        </div>

        <button onClick={() => dispatch({ type: 'CLOSE_STATS' })} className="menu-button close">
          Close
        </button>
      </div>
    </div>
  );
}
