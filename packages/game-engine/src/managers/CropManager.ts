import { GameStateManager } from '../core/GameState';

export class CropManager {
  constructor(private gameStateManager: GameStateManager) {}

  update(deltaTime: number): void {
    // Update crop growth, handle automatic processes
    this.updateCropGrowth();
    this.checkForHarvestReadyCrops();
  }

  private updateCropGrowth(): void {
    const state = this.gameStateManager.getState();
    let hasUpdates = false;

    const updatedPlots = state.player.farm.plots.map(plot => {
      if (plot.crop && plot.isOccupied) {
        const now = new Date();
        const isReady = now >= plot.crop.harvestableAt;

        if (isReady && plot.crop.growthStage < plot.crop.maxGrowthStage) {
          hasUpdates = true;
          return {
            ...plot,
            crop: {
              ...plot.crop,
              growthStage: plot.crop.maxGrowthStage,
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

  private checkForHarvestReadyCrops(): void {
    // Notify when crops are ready for harvest
    const state = this.gameStateManager.getState();
    const readyCrops = state.player.farm.plots.filter(
      plot =>
        plot.crop && plot.isOccupied && new Date() >= plot.crop.harvestableAt
    );

    if (readyCrops.length > 0) {
      // Trigger notifications or events
      console.log(`${readyCrops.length} crops are ready for harvest!`);
    }
  }

  getCropById(cropId: string) {
    const state = this.gameStateManager.getState();
    for (const plot of state.player.farm.plots) {
      if (plot.crop && plot.crop.id === cropId) {
        return plot.crop;
      }
    }
    return null;
  }

  getAllCrops() {
    const state = this.gameStateManager.getState();
    return state.player.farm.plots
      .filter(plot => plot.crop && plot.isOccupied)
      .map(plot => plot.crop!);
  }
}
