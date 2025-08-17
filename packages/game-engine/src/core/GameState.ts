import { Player, Farm, GameLevel } from '@cropschool/shared';

export interface GameState {
  player: Player;
  currentLevel: GameLevel;
  gameTime: Date;
  isPaused: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class GameStateManager {
  private state: GameState;
  private listeners: ((state: GameState) => void)[] = [];

  constructor(initialState: GameState) {
    this.state = { ...initialState };
  }

  getState(): GameState {
    return { ...this.state };
  }

  updateState(partialState: Partial<GameState>): void {
    this.state = { ...this.state, ...partialState };
    this.notifyListeners();
  }

  updatePlayer(playerUpdate: Partial<Player>): void {
    this.state = {
      ...this.state,
      player: { ...this.state.player, ...playerUpdate },
    };
    this.notifyListeners();
  }

  updateFarm(farmUpdate: Partial<Farm>): void {
    this.state = {
      ...this.state,
      player: {
        ...this.state.player,
        farm: { ...this.state.player.farm, ...farmUpdate },
      },
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  pauseGame(): void {
    this.updateState({ isPaused: true });
  }

  resumeGame(): void {
    this.updateState({ isPaused: false });
  }

  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.updateState({ difficulty });
  }

  saveToStorage(): void {
    try {
      localStorage.setItem('cropschool_gamestate', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  loadFromStorage(): boolean {
    try {
      const saved = localStorage.getItem('cropschool_gamestate');
      if (saved) {
        this.state = JSON.parse(saved);
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
    return false;
  }

  reset(): void {
    // Reset to initial state - you would implement this based on your game's initial state
    localStorage.removeItem('cropschool_gamestate');
  }
}
