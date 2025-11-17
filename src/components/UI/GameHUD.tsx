interface GameHUDProps {
  coins: number;
  gameTime: number;
  difficulty: string;
}

export function GameHUD({ coins, gameTime, difficulty }: GameHUDProps) {
  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);

  return (
    <div className="game-hud">
      <div className="hud-center">
        <span className="hud-coins">💰 {coins}</span>
        <span className="hud-time">
          ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="hud-difficulty">{difficulty.toUpperCase()}</span>
      </div>
    </div>
  );
}
