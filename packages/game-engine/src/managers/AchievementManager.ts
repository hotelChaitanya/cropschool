import { GameStateManager } from '../core/GameState';
import { Achievement } from '@cropschool/shared';

export class AchievementManager {
  private achievementDefinitions: AchievementDefinition[] = [];

  constructor(private gameStateManager: GameStateManager) {
    this.initializeAchievements();
  }

  update(): void {
    this.checkAchievements();
  }

  private initializeAchievements(): void {
    this.achievementDefinitions = [
      {
        id: 'first_harvest',
        name: 'First Harvest',
        description: 'Harvest your first crop',
        iconUrl: '/icons/first-harvest.png',
        condition: state => {
          return state.player.totalPoints >= 10; // Simplified check
        },
      },
      {
        id: 'green_thumb',
        name: 'Green Thumb',
        description: 'Plant 10 crops',
        iconUrl: '/icons/green-thumb.png',
        condition: state => {
          return state.player.totalPoints >= 50; // Simplified check
        },
      },
      {
        id: 'level_5',
        name: 'Rising Farmer',
        description: 'Reach level 5',
        iconUrl: '/icons/level-5.png',
        condition: state => {
          return state.player.level >= 5;
        },
      },
      {
        id: 'crop_master',
        name: 'Crop Master',
        description: 'Harvest 100 crops',
        iconUrl: '/icons/crop-master.png',
        condition: state => {
          return state.player.totalPoints >= 1000; // Simplified check
        },
      },
    ];
  }

  private checkAchievements(): void {
    const state = this.gameStateManager.getState();
    const currentAchievements = state.player.achievements;

    this.achievementDefinitions.forEach(achievementDef => {
      // Check if already unlocked
      const alreadyUnlocked = currentAchievements.some(
        achievement => achievement.id === achievementDef.id
      );

      if (!alreadyUnlocked && achievementDef.condition(state)) {
        this.unlockAchievement(achievementDef);
      }
    });
  }

  private unlockAchievement(achievementDef: AchievementDefinition): void {
    const newAchievement: Achievement = {
      id: achievementDef.id,
      name: achievementDef.name,
      description: achievementDef.description,
      iconUrl: achievementDef.iconUrl,
      unlockedAt: new Date(),
    };

    const state = this.gameStateManager.getState();
    const updatedAchievements = [...state.player.achievements, newAchievement];

    this.gameStateManager.updatePlayer({
      achievements: updatedAchievements,
    });

    // Trigger achievement notification
    this.onAchievementUnlocked(newAchievement);
  }

  private onAchievementUnlocked(achievement: Achievement): void {
    console.log(`Achievement unlocked: ${achievement.name}`);
    // Here you would trigger UI notifications, sounds, etc.
  }

  getUnlockedAchievements(): Achievement[] {
    const state = this.gameStateManager.getState();
    return state.player.achievements;
  }

  getAchievementProgress(): AchievementProgress[] {
    const state = this.gameStateManager.getState();
    return this.achievementDefinitions.map(achievementDef => {
      const isUnlocked = state.player.achievements.some(
        achievement => achievement.id === achievementDef.id
      );

      return {
        id: achievementDef.id,
        name: achievementDef.name,
        description: achievementDef.description,
        iconUrl: achievementDef.iconUrl,
        isUnlocked,
        progress: this.getAchievementProgressValue(achievementDef, state),
      };
    });
  }

  private getAchievementProgressValue(
    achievementDef: AchievementDefinition,
    state: any
  ): number {
    // This would be more sophisticated in a real implementation
    // For now, return 1 if unlocked, 0 if not
    return achievementDef.condition(state) ? 1 : 0;
  }
}

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  condition: (state: any) => boolean;
}

interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  isUnlocked: boolean;
  progress: number; // 0-1
}
