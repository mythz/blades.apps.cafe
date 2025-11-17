import { GameState } from '../types/game';
import { GameAction } from './actions';

export interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetGame: () => void;
}
