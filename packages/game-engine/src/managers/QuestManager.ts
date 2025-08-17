import { GameStateManager } from '../core/GameState';

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isCompleted: boolean;
  isActive: boolean;
  expiresAt?: Date;
}

export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  type: 'plant' | 'harvest' | 'sell' | 'level' | 'collect';
  isCompleted: boolean;
}

export interface QuestReward {
  type: 'experience' | 'coins' | 'item';
  amount: number;
  itemId?: string;
}

export class QuestManager {
  private activeQuests: Quest[] = [];

  constructor(private gameStateManager: GameStateManager) {
    this.initializeDefaultQuests();
  }

  update(deltaTime: number): void {
    this.checkQuestProgress();
    this.checkExpiredQuests();
  }

  private initializeDefaultQuests(): void {
    const defaultQuests: Quest[] = [
      {
        id: 'first_plant',
        title: 'First Steps',
        description: 'Plant your first crop to get started!',
        objectives: [
          {
            id: 'plant_1',
            description: 'Plant 1 crop',
            target: 1,
            current: 0,
            type: 'plant',
            isCompleted: false,
          },
        ],
        rewards: [
          { type: 'experience', amount: 50 },
          { type: 'coins', amount: 100 },
        ],
        isCompleted: false,
        isActive: true,
      },
      {
        id: 'harvest_master',
        title: 'Harvest Master',
        description: 'Harvest 5 crops to prove your farming skills!',
        objectives: [
          {
            id: 'harvest_5',
            description: 'Harvest 5 crops',
            target: 5,
            current: 0,
            type: 'harvest',
            isCompleted: false,
          },
        ],
        rewards: [
          { type: 'experience', amount: 200 },
          { type: 'coins', amount: 500 },
        ],
        isCompleted: false,
        isActive: true,
      },
    ];

    this.activeQuests = defaultQuests;
  }

  private checkQuestProgress(): void {
    // This would check game state for quest progress
    // For now, it's a simplified implementation
  }

  private checkExpiredQuests(): void {
    const now = new Date();
    this.activeQuests = this.activeQuests.filter(quest => {
      if (quest.expiresAt && now > quest.expiresAt) {
        return false; // Remove expired quest
      }
      return true;
    });
  }

  getActiveQuests(): Quest[] {
    return this.activeQuests.filter(
      quest => quest.isActive && !quest.isCompleted
    );
  }

  getCompletedQuests(): Quest[] {
    return this.activeQuests.filter(quest => quest.isCompleted);
  }

  completeQuest(questId: string): boolean {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) {
      return false;
    }

    // Check if all objectives are completed
    const allObjectivesCompleted = quest.objectives.every(
      obj => obj.isCompleted
    );
    if (!allObjectivesCompleted) {
      return false;
    }

    // Mark quest as completed
    quest.isCompleted = true;
    quest.isActive = false;

    // Give rewards
    this.giveRewards(quest.rewards);

    return true;
  }

  private giveRewards(rewards: QuestReward[]): void {
    const state = this.gameStateManager.getState();
    let totalExperience = 0;
    let totalCoins = 0;

    rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          totalExperience += reward.amount;
          break;
        case 'coins':
          totalCoins += reward.amount;
          break;
        case 'item':
          // Handle item rewards
          break;
      }
    });

    if (totalExperience > 0 || totalCoins > 0) {
      this.gameStateManager.updatePlayer({
        totalPoints: state.player.totalPoints + totalExperience + totalCoins,
      });
    }
  }

  updateObjectiveProgress(
    type: QuestObjective['type'],
    amount: number = 1
  ): void {
    this.activeQuests.forEach(quest => {
      if (!quest.isActive || quest.isCompleted) return;

      quest.objectives.forEach(objective => {
        if (objective.type === type && !objective.isCompleted) {
          objective.current = Math.min(
            objective.current + amount,
            objective.target
          );
          objective.isCompleted = objective.current >= objective.target;
        }
      });

      // Check if quest is now completed
      const allObjectivesCompleted = quest.objectives.every(
        obj => obj.isCompleted
      );
      if (allObjectivesCompleted) {
        this.completeQuest(quest.id);
      }
    });
  }
}
