import { GameStateManager } from '../core/GameState';

export class ExperienceSystem {
  constructor(private gameStateManager: GameStateManager) {}

  addExperience(points: number): void {
    const state = this.gameStateManager.getState();
    const newTotal = state.player.totalPoints + points;
    const newLevel = this.calculateLevel(newTotal);

    this.gameStateManager.updatePlayer({
      totalPoints: newTotal,
      level: newLevel,
    });

    if (newLevel > state.player.level) {
      this.onLevelUp(newLevel);
    }
  }

  private calculateLevel(totalPoints: number): number {
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  private onLevelUp(newLevel: number): void {
    // Handle level up rewards, unlocks, etc.
    console.log(`Level up! New level: ${newLevel}`);
  }

  getExperienceForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  getExperienceProgress(currentPoints: number, currentLevel: number): number {
    const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelExp = this.getExperienceForNextLevel(currentLevel);
    const progress =
      (currentPoints - currentLevelExp) / (nextLevelExp - currentLevelExp);
    return Math.max(0, Math.min(1, progress));
  }
}
