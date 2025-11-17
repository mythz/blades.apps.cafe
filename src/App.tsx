import { useEffect } from 'react';
import { GameProvider, useGameContext } from './store/GameContext';
import { useStorage } from './hooks/useStorage';
import { MainMenu } from './components/UI/MainMenu';
import { GameCanvas } from './components/Game/GameCanvas';
import { PauseMenu } from './components/UI/PauseMenu';
import { GameOverScreen } from './components/UI/GameOverScreen';
import { ShopModal } from './components/UI/ShopModal';

function GameContent() {
  const { state, loadGame } = useGameContext();
  const { isInitialized } = useStorage();

  // Load saved game on mount
  useEffect(() => {
    if (isInitialized) {
      loadGame();
    }
  }, [isInitialized, loadGame]);

  return (
    <div className="app">
      {state.status === 'menu' && <MainMenu />}
      {state.status === 'shop' && <ShopModal />}
      {(state.status === 'playing' || state.status === 'paused') && <GameCanvas />}
      {state.status === 'paused' && <PauseMenu />}
      {state.status === 'gameover' && <GameOverScreen />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
