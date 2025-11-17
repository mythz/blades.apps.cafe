import { GameState, SaveData } from '../types/game';
import { storageService } from './StorageService';

class SaveManager {
  private lastSaveTime = 0;
  private saveDebounceMs = 1000; // Debounce saves to prevent spam

  async saveGame(state: GameState): Promise<void> {
    const now = Date.now();
    if (now - this.lastSaveTime < this.saveDebounceMs) {
      return; // Too soon, skip save
    }

    const saveData: SaveData = {
      coins: state.coins,
      totalCoins: state.totalCoins,
      wins: state.wins,
      losses: state.losses,
      unlockedSwords: state.swords.filter(s => s.unlocked).map(s => s.id),
      unlockedAbilities: state.abilities.filter(a => a.unlocked).map(a => a.id),
      equippedSword: state.player.equippedSword.id,
      equippedAbilities: state.player.abilities.map(a => a.id),
      settings: state.settings,
      lastPlayed: now,
    };

    await storageService.saveGame(saveData);
    this.lastSaveTime = now;
  }

  async loadGame(): Promise<SaveData | null> {
    return await storageService.loadGame();
  }

  async deleteSave(): Promise<boolean> {
    return await storageService.deleteSave();
  }

  async hasSaveData(): Promise<boolean> {
    return await storageService.hasSaveData();
  }

  exportSave(state: GameState): void {
    const saveData: SaveData = {
      coins: state.coins,
      totalCoins: state.totalCoins,
      wins: state.wins,
      losses: state.losses,
      unlockedSwords: state.swords.filter(s => s.unlocked).map(s => s.id),
      unlockedAbilities: state.abilities.filter(a => a.unlocked).map(a => a.id),
      equippedSword: state.player.equippedSword.id,
      equippedAbilities: state.player.abilities.map(a => a.id),
      settings: state.settings,
      lastPlayed: Date.now(),
    };

    const dataStr = JSON.stringify(saveData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sword_fighting_arena_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSave(jsonString: string): SaveData | null {
    try {
      const data = JSON.parse(jsonString) as SaveData;
      // Validate the data has required fields
      if (
        typeof data.coins === 'number' &&
        typeof data.totalCoins === 'number' &&
        Array.isArray(data.unlockedSwords) &&
        Array.isArray(data.unlockedAbilities)
      ) {
        return data;
      }
    } catch (error) {
      console.error('Failed to import save', error);
    }
    return null;
  }
}

export const saveManager = new SaveManager();
