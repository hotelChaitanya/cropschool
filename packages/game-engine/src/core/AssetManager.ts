/**
 * Asset Manager - Loading and caching of game assets
 */

import { EventEmitter } from './EventEmitter';

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'audio' | 'json' | 'text';
  data?: any;
  loaded: boolean;
  error?: string;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

export class AssetManager extends EventEmitter {
  private assets: Map<string, Asset> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();
  private cache: Map<string, any> = new Map();

  /**
   * Add an asset to load
   */
  public addAsset(id: string, url: string, type: Asset['type']): void {
    if (this.assets.has(id)) {
      console.warn(`Asset '${id}' already exists`);
      return;
    }

    const asset: Asset = {
      id,
      url,
      type,
      loaded: false,
    };

    this.assets.set(id, asset);
  }

  /**
   * Add multiple assets
   */
  public addAssets(
    assets: Array<{ id: string; url: string; type: Asset['type'] }>
  ): void {
    assets.forEach(asset => this.addAsset(asset.id, asset.url, asset.type));
  }

  /**
   * Load a single asset
   */
  public async loadAsset(id: string): Promise<void> {
    const asset = this.assets.get(id);
    if (!asset) {
      throw new Error(`Asset '${id}' not found`);
    }

    if (asset.loaded) {
      return;
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id);
    }

    const loadPromise = this.loadAssetData(asset);
    this.loadingPromises.set(id, loadPromise);

    try {
      await loadPromise;
      asset.loaded = true;
      this.emit('asset-loaded', asset);
    } catch (error) {
      asset.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('asset-error', { asset, error });
      throw error;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  /**
   * Load multiple assets with progress reporting
   */
  public async loadAssets(assetIds?: string[]): Promise<void> {
    const idsToLoad = assetIds || Array.from(this.assets.keys());
    const totalAssets = idsToLoad.length;
    let loadedAssets = 0;

    const updateProgress = (currentAsset?: string) => {
      const progress: LoadProgress = {
        loaded: loadedAssets,
        total: totalAssets,
        percentage: totalAssets > 0 ? (loadedAssets / totalAssets) * 100 : 100,
        currentAsset,
      };
      this.emit('load-progress', progress);
    };

    updateProgress();

    const loadPromises = idsToLoad.map(async id => {
      try {
        updateProgress(id);
        await this.loadAsset(id);
        loadedAssets++;
        updateProgress();
      } catch (error) {
        loadedAssets++; // Count failed loads too
        updateProgress();
        throw error;
      }
    });

    await Promise.all(loadPromises);
    this.emit('all-assets-loaded');
  }

  private async loadAssetData(asset: Asset): Promise<void> {
    switch (asset.type) {
      case 'image':
        asset.data = await this.loadImage(asset.url);
        break;
      case 'audio':
        asset.data = await this.loadAudio(asset.url);
        break;
      case 'json':
        asset.data = await this.loadJSON(asset.url);
        break;
      case 'text':
        asset.data = await this.loadText(asset.url);
        break;
      default:
        throw new Error(`Unsupported asset type: ${asset.type}`);
    }

    // Cache the asset data
    this.cache.set(asset.id, asset.data);
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

      img.src = url;
    });
  }

  private async loadAudio(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Failed to load audio: ${url}`);
    }
  }

  private async loadJSON(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to load JSON: ${url}`);
    }
  }

  private async loadText(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Failed to load text: ${url}`);
    }
  }

  /**
   * Get an asset by ID
   */
  public getAsset<T = any>(id: string): T | null {
    const asset = this.assets.get(id);
    return asset?.loaded ? asset.data : null;
  }

  /**
   * Get an image asset
   */
  public getImage(id: string): HTMLImageElement | null {
    return this.getAsset<HTMLImageElement>(id);
  }

  /**
   * Get an audio asset
   */
  public getAudio(id: string): ArrayBuffer | null {
    return this.getAsset<ArrayBuffer>(id);
  }

  /**
   * Get a JSON asset
   */
  public getJSON<T = any>(id: string): T | null {
    return this.getAsset<T>(id);
  }

  /**
   * Get a text asset
   */
  public getText(id: string): string | null {
    return this.getAsset<string>(id);
  }

  /**
   * Check if an asset is loaded
   */
  public isAssetLoaded(id: string): boolean {
    const asset = this.assets.get(id);
    return asset ? asset.loaded : false;
  }

  /**
   * Check if all assets are loaded
   */
  public areAllAssetsLoaded(): boolean {
    return Array.from(this.assets.values()).every(asset => asset.loaded);
  }

  /**
   * Get loading progress
   */
  public getLoadingProgress(): LoadProgress {
    const total = this.assets.size;
    const loaded = Array.from(this.assets.values()).filter(
      asset => asset.loaded
    ).length;

    return {
      loaded,
      total,
      percentage: total > 0 ? (loaded / total) * 100 : 100,
    };
  }

  /**
   * Remove an asset
   */
  public removeAsset(id: string): void {
    this.assets.delete(id);
    this.cache.delete(id);

    // Cancel loading if in progress
    const loadingPromise = this.loadingPromises.get(id);
    if (loadingPromise) {
      this.loadingPromises.delete(id);
    }
  }

  /**
   * Clear all assets
   */
  public clear(): void {
    this.assets.clear();
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get asset info
   */
  public getAssetInfo(): Array<{
    id: string;
    type: string;
    loaded: boolean;
    error?: string;
  }> {
    return Array.from(this.assets.values()).map(asset => ({
      id: asset.id,
      type: asset.type,
      loaded: asset.loaded,
      error: asset.error,
    }));
  }

  /**
   * Preload images by creating image objects
   */
  public preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const promises = urls.map(url => this.loadImage(url));
    return Promise.all(promises);
  }

  /**
   * Create a data URL from an image asset
   */
  public getImageDataURL(id: string): string | null {
    const img = this.getImage(id);
    if (!img) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL();
  }

  /**
   * Destroy the asset manager
   */
  public destroy(): void {
    this.clear();
    this.removeAllListeners();
  }
}
