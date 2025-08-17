import { GameStateManager, GameState } from './GameState';
import { FarmSystem } from '../systems/FarmSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { ExperienceSystem } from '../systems/ExperienceSystem';
import { CropManager } from '../managers/CropManager';
import { QuestManager } from '../managers/QuestManager';
import { AchievementManager } from '../managers/AchievementManager';

export class GameEngine {
  private gameStateManager: GameStateManager;
  private farmSystem: FarmSystem;
  private inventorySystem: InventorySystem;
  private experienceSystem: ExperienceSystem;
  private cropManager: CropManager;
  private questManager: QuestManager;
  private achievementManager: AchievementManager;
  private gameLoop: number | null = null;
  private lastUpdate: number = 0;

  constructor(initialState: GameState) {
    this.gameStateManager = new GameStateManager(initialState);

    // Initialize systems
    this.farmSystem = new FarmSystem(this.gameStateManager);
    this.inventorySystem = new InventorySystem(this.gameStateManager);
    this.experienceSystem = new ExperienceSystem(this.gameStateManager);

    // Initialize managers
    this.cropManager = new CropManager(this.gameStateManager);
    this.questManager = new QuestManager(this.gameStateManager);
    this.achievementManager = new AchievementManager(this.gameStateManager);
  }

  start(): void {
    if (this.gameLoop) {
      this.stop();
    }

    this.lastUpdate = Date.now();
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  stop(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private update(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdate;
    this.lastUpdate = currentTime;

    const state = this.gameStateManager.getState();

    if (!state.isPaused) {
      // Update all systems
      this.cropManager.update(deltaTime);
      this.farmSystem.update(deltaTime);
      this.questManager.update(deltaTime);
      this.achievementManager.update();
    }

    // Continue the game loop
    this.gameLoop = requestAnimationFrame(this.update.bind(this));
  }

  // Getters for systems and managers
  getGameState(): GameState {
    return this.gameStateManager.getState();
  }

  getStateManager(): GameStateManager {
    return this.gameStateManager;
  }

  getFarmSystem(): FarmSystem {
    return this.farmSystem;
  }

  getInventorySystem(): InventorySystem {
    return this.inventorySystem;
  }

  getExperienceSystem(): ExperienceSystem {
    return this.experienceSystem;
  }

  getCropManager(): CropManager {
    return this.cropManager;
  }

  getQuestManager(): QuestManager {
    return this.questManager;
  }

  getAchievementManager(): AchievementManager {
    return this.achievementManager;
  }

  // Game actions
  plantCrop(plotId: string, cropType: string): boolean {
    return this.farmSystem.plantCrop(plotId, cropType);
  }

  waterCrop(plotId: string): boolean {
    return this.farmSystem.waterCrop(plotId);
  }

  harvestCrop(plotId: string): boolean {
    return this.farmSystem.harvestCrop(plotId);
  }

  buyItem(itemId: string, quantity: number): boolean {
    return this.inventorySystem.buyItem(itemId, quantity);
  }

  sellItem(itemId: string, quantity: number): boolean {
    return this.inventorySystem.sellItem(itemId, quantity);
  }

  useItem(itemId: string, quantity: number): boolean {
    return this.inventorySystem.useItem(itemId, quantity);
  }

  // Save and load
  saveGame(): void {
    this.gameStateManager.saveToStorage();
  }

  loadGame(): boolean {
    return this.gameStateManager.loadFromStorage();
  }

  pauseGame(): void {
    this.gameStateManager.pauseGame();
  }

  resumeGame(): void {
    this.gameStateManager.resumeGame();
  }

  resetGame(): void {
    this.stop();
    this.gameStateManager.reset();
  }
}
