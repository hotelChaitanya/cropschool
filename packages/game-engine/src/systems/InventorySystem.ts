import { GameStateManager } from '../core/GameState';
import { InventoryItem } from '@cropschool/shared';

export class InventorySystem {
  constructor(private gameStateManager: GameStateManager) {}

  buyItem(itemId: string, quantity: number): boolean {
    // Implementation for buying items
    return true;
  }

  sellItem(itemId: string, quantity: number): boolean {
    const state = this.gameStateManager.getState();
    const item = state.player.farm.inventory.find(i => i.id === itemId);

    if (!item || item.quantity < quantity) {
      return false;
    }

    // Update inventory
    const updatedInventory = state.player.farm.inventory
      .map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
      )
      .filter(i => i.quantity > 0);

    // Add coins (simplified pricing)
    const earnedCoins = quantity * 10;

    this.gameStateManager.updateFarm({ inventory: updatedInventory });
    this.gameStateManager.updatePlayer({
      totalPoints: state.player.totalPoints + earnedCoins,
    });

    return true;
  }

  useItem(itemId: string, quantity: number): boolean {
    const state = this.gameStateManager.getState();
    const item = state.player.farm.inventory.find(i => i.id === itemId);

    if (!item || item.quantity < quantity) {
      return false;
    }

    // Update inventory
    const updatedInventory = state.player.farm.inventory
      .map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
      )
      .filter(i => i.quantity > 0);

    this.gameStateManager.updateFarm({ inventory: updatedInventory });
    return true;
  }

  addItem(item: InventoryItem): void {
    const state = this.gameStateManager.getState();
    const existingItem = state.player.farm.inventory.find(
      i => i.name === item.name && i.type === item.type
    );

    let updatedInventory: InventoryItem[];
    if (existingItem) {
      updatedInventory = state.player.farm.inventory.map(i =>
        i.id === existingItem.id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      updatedInventory = [...state.player.farm.inventory, item];
    }

    this.gameStateManager.updateFarm({ inventory: updatedInventory });
  }
}
