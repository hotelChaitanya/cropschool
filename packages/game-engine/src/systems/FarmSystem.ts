import { GameStateManager } from '../core/GameState';
import { Plot, Crop, InventoryItem } from '@cropschool/shared';
import { CROP_GROWTH_TIMES, EXPERIENCE_POINTS } from '@cropschool/shared';

export class FarmSystem {
  constructor(private gameStateManager: GameStateManager) {}

  plantCrop(plotId: string, cropType: string): boolean {
    const state = this.gameStateManager.getState();
    const plot = state.player.farm.plots.find(p => p.id === plotId);

    if (!plot || plot.isOccupied) {
      return false;
    }

    // Check if player has seeds
    const seedItem = state.player.farm.inventory.find(
      item =>
        item.type === 'seed' &&
        item.name.toLowerCase().includes(cropType.toLowerCase())
    );

    if (!seedItem || seedItem.quantity <= 0) {
      return false;
    }

    // Create new crop
    const now = new Date();
    const growthTime = this.getCropGrowthTime(cropType);
    const harvestableAt = new Date(now.getTime() + growthTime * 60000); // Convert minutes to milliseconds

    const newCrop: Crop = {
      id: `crop_${Date.now()}`,
      name: cropType,
      type: this.getCropType(cropType),
      growthStage: 0,
      maxGrowthStage: 4,
      plantedAt: now,
      harvestableAt,
      waterRequirement: 50,
      soilRequirement: 70,
      expectedYield: Math.floor(Math.random() * 5) + 1,
    };

    // Update plot
    const updatedPlot: Plot = {
      ...plot,
      crop: newCrop,
      isOccupied: true,
    };

    // Update inventory (remove seed)
    const updatedInventory = state.player.farm.inventory
      .map(item =>
        item.id === seedItem.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0);

    // Update game state
    const updatedPlots = state.player.farm.plots.map(p =>
      p.id === plotId ? updatedPlot : p
    );

    this.gameStateManager.updateFarm({
      plots: updatedPlots,
      inventory: updatedInventory,
    });

    // Add experience
    this.addExperience(EXPERIENCE_POINTS.PLANT_SEED);

    return true;
  }

  waterCrop(plotId: string): boolean {
    const state = this.gameStateManager.getState();
    const plot = state.player.farm.plots.find(p => p.id === plotId);

    if (!plot || !plot.crop || !plot.isOccupied) {
      return false;
    }

    // Update water level
    const updatedPlot: Plot = {
      ...plot,
      waterLevel: Math.min(100, plot.waterLevel + 25),
    };

    const updatedPlots = state.player.farm.plots.map(p =>
      p.id === plotId ? updatedPlot : p
    );

    this.gameStateManager.updateFarm({ plots: updatedPlots });

    // Add experience
    this.addExperience(EXPERIENCE_POINTS.WATER_CROP);

    return true;
  }

  harvestCrop(plotId: string): boolean {
    const state = this.gameStateManager.getState();
    const plot = state.player.farm.plots.find(p => p.id === plotId);

    if (!plot || !plot.crop || !plot.isOccupied) {
      return false;
    }

    const now = new Date();
    if (now < plot.crop.harvestableAt) {
      return false; // Crop not ready yet
    }

    // Create harvested item
    const harvestedItem: InventoryItem = {
      id: `item_${Date.now()}`,
      name: plot.crop.name,
      quantity: plot.crop.expectedYield,
      type: 'crop',
      description: `Fresh ${plot.crop.name} from your farm`,
    };

    // Add to inventory
    const existingItem = state.player.farm.inventory.find(
      item => item.name === harvestedItem.name && item.type === 'crop'
    );

    let updatedInventory: InventoryItem[];
    if (existingItem) {
      updatedInventory = state.player.farm.inventory.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + harvestedItem.quantity }
          : item
      );
    } else {
      updatedInventory = [...state.player.farm.inventory, harvestedItem];
    }

    // Clear the plot
    const updatedPlot: Plot = {
      ...plot,
      crop: undefined,
      isOccupied: false,
      waterLevel: 50, // Reset water level
    };

    const updatedPlots = state.player.farm.plots.map(p =>
      p.id === plotId ? updatedPlot : p
    );

    this.gameStateManager.updateFarm({
      plots: updatedPlots,
      inventory: updatedInventory,
    });

    // Add experience
    this.addExperience(EXPERIENCE_POINTS.HARVEST_CROP);

    return true;
  }

  update(deltaTime: number): void {
    const state = this.gameStateManager.getState();
    let hasUpdates = false;

    const updatedPlots = state.player.farm.plots.map(plot => {
      if (plot.crop && plot.isOccupied) {
        const now = new Date();
        const timePlanted = now.getTime() - plot.crop.plantedAt.getTime();
        const totalGrowthTime =
          plot.crop.harvestableAt.getTime() - plot.crop.plantedAt.getTime();
        const growthProgress = Math.min(timePlanted / totalGrowthTime, 1);
        const newGrowthStage = Math.floor(
          growthProgress * plot.crop.maxGrowthStage
        );

        if (newGrowthStage !== plot.crop.growthStage) {
          hasUpdates = true;
          return {
            ...plot,
            crop: {
              ...plot.crop,
              growthStage: newGrowthStage,
            },
          };
        }
      }
      return plot;
    });

    if (hasUpdates) {
      this.gameStateManager.updateFarm({ plots: updatedPlots });
    }
  }

  private getCropGrowthTime(cropType: string): number {
    // This is simplified - you would have a more comprehensive mapping
    const type = cropType.toLowerCase();
    if (type.includes('carrot')) return CROP_GROWTH_TIMES.VEGETABLES.CARROTS;
    if (type.includes('tomato')) return CROP_GROWTH_TIMES.VEGETABLES.TOMATOES;
    if (type.includes('wheat')) return CROP_GROWTH_TIMES.GRAINS.WHEAT;
    return 30; // Default
  }

  private getCropType(
    cropType: string
  ): 'vegetables' | 'fruits' | 'grains' | 'herbs' {
    // Simplified crop type detection
    const type = cropType.toLowerCase();
    if (type.includes('herb') || type.includes('basil')) return 'herbs';
    if (type.includes('fruit') || type.includes('apple')) return 'fruits';
    if (type.includes('grain') || type.includes('wheat')) return 'grains';
    return 'vegetables';
  }

  private addExperience(points: number): void {
    const state = this.gameStateManager.getState();
    this.gameStateManager.updatePlayer({
      totalPoints: state.player.totalPoints + points,
    });
  }
}
