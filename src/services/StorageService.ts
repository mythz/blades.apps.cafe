import { SaveData } from '../types/game';

class StorageService {
  private dbName = 'SwordFightingArena';
  private version = 1;
  private db: IDBDatabase | null = null;
  private storeName = 'gameData';

  async init(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.warn('IndexedDB failed to open, falling back to localStorage');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveGame(data: SaveData): Promise<boolean> {
    // Try IndexedDB first
    if (this.db) {
      try {
        return await this.saveToIndexedDB(data);
      } catch (error) {
        console.warn('IndexedDB save failed, falling back to localStorage', error);
      }
    }

    // Fallback to localStorage
    this.backupToLocalStorage(data);
    return true;
  }

  private async saveToIndexedDB(data: SaveData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const saveObject = { id: 'mainSave', ...data };
      const request = store.put(saveObject);

      request.onsuccess = () => {
        this.backupToLocalStorage(data); // Also backup to localStorage
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async loadGame(): Promise<SaveData | null> {
    // Try IndexedDB first
    if (this.db) {
      try {
        const data = await this.loadFromIndexedDB();
        if (data) return data;
      } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage', error);
      }
    }

    // Fallback to localStorage
    return this.loadFromLocalStorage();
  }

  private async loadFromIndexedDB(): Promise<SaveData | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('mainSave');

      request.onsuccess = () => {
        if (request.result) {
          const { id, ...data } = request.result;
          resolve(data as SaveData);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  backupToLocalStorage(data: SaveData): void {
    try {
      localStorage.setItem('swordFightingArena_save', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }

  loadFromLocalStorage(): SaveData | null {
    try {
      const data = localStorage.getItem('swordFightingArena_save');
      if (data) {
        return JSON.parse(data) as SaveData;
      }
    } catch (error) {
      console.error('Failed to load from localStorage', error);
    }
    return null;
  }

  async deleteSave(): Promise<boolean> {
    // Delete from IndexedDB
    if (this.db) {
      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.delete('mainSave');

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn('Failed to delete from IndexedDB', error);
      }
    }

    // Delete from localStorage
    try {
      localStorage.removeItem('swordFightingArena_save');
    } catch (error) {
      console.warn('Failed to delete from localStorage', error);
    }

    return true;
  }

  async hasSaveData(): Promise<boolean> {
    const data = await this.loadGame();
    return data !== null;
  }
}

export const storageService = new StorageService();
