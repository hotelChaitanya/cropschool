/**
 * Audio Manager - Sound effects and music management
 */

import { EventEmitter } from './EventEmitter';

export interface AudioConfig {
  masterVolume?: number;
  musicVolume?: number;
  sfxVolume?: number;
  maxConcurrentSounds?: number;
}

export interface Sound {
  id: string;
  url: string;
  buffer?: AudioBuffer;
  volume?: number;
  loop?: boolean;
  category: 'music' | 'sfx';
}

export interface PlayingSound {
  id: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  duration?: number;
  loop: boolean;
}

export class AudioManager extends EventEmitter {
  private audioContext: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  private sounds: Map<string, Sound> = new Map();
  private playingSounds: Map<string, PlayingSound> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private config: AudioConfig = {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 1.0,
    maxConcurrentSounds: 32,
  };

  private isInitialized = false;
  private isMuted = false;

  constructor(config: Partial<AudioConfig> = {}) {
    super();
    this.config = { ...this.config, ...config };
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create gain nodes for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();

      // Connect gain nodes
      this.musicGainNode.connect(this.masterGainNode);
      this.sfxGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);

      // Set initial volumes
      this.masterGainNode.gain.value = this.config.masterVolume!;
      this.musicGainNode.gain.value = this.config.musicVolume!;
      this.sfxGainNode.gain.value = this.config.sfxVolume!;

      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.emit('error', error);
    }
  }

  /**
   * Load a sound file
   */
  public async loadSound(sound: Sound): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.loadingPromises.has(sound.id)) {
      return this.loadingPromises.get(sound.id);
    }

    const loadPromise = this.loadSoundFile(sound);
    this.loadingPromises.set(sound.id, loadPromise);

    try {
      await loadPromise;
      this.sounds.set(sound.id, sound);
      this.emit('sound-loaded', sound.id);
    } catch (error) {
      console.error(`Failed to load sound '${sound.id}':`, error);
      this.emit('sound-error', { id: sound.id, error });
    } finally {
      this.loadingPromises.delete(sound.id);
    }
  }

  private async loadSoundFile(sound: Sound): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(sound.url);
      const arrayBuffer = await response.arrayBuffer();
      sound.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      throw new Error(`Failed to load audio file: ${sound.url}`);
    }
  }

  /**
   * Load multiple sounds
   */
  public async loadSounds(sounds: Sound[]): Promise<void> {
    const loadPromises = sounds.map(sound => this.loadSound(sound));
    await Promise.all(loadPromises);
  }

  /**
   * Play a sound
   */
  public playSound(
    soundId: string,
    options: {
      volume?: number;
      loop?: boolean;
      fadeIn?: number;
      startTime?: number;
    } = {}
  ): string | null {
    if (!this.isInitialized || this.isMuted) return null;

    const sound = this.sounds.get(soundId);
    if (!sound || !sound.buffer || !this.audioContext) {
      console.warn(`Sound '${soundId}' not found or not loaded`);
      return null;
    }

    // Check concurrent sound limit
    if (this.playingSounds.size >= this.config.maxConcurrentSounds!) {
      // Stop oldest sound
      const oldestId = this.playingSounds.keys().next().value;
      if (oldestId) {
        this.stopSound(oldestId);
      }
    }

    try {
      // Create source and gain nodes
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = sound.buffer;
      source.loop = options.loop || sound.loop || false;

      // Connect nodes
      source.connect(gainNode);

      const categoryGain =
        sound.category === 'music' ? this.musicGainNode : this.sfxGainNode;
      gainNode.connect(categoryGain!);

      // Set volume
      const volume = options.volume ?? sound.volume ?? 1.0;
      gainNode.gain.value = volume;

      // Fade in if specified
      if (options.fadeIn && options.fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          volume,
          this.audioContext.currentTime + options.fadeIn
        );
      }

      // Generate unique playing ID
      const playingId = `${soundId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store playing sound
      const playingSound: PlayingSound = {
        id: playingId,
        source,
        gainNode,
        startTime: this.audioContext.currentTime,
        duration: sound.buffer.duration,
        loop: source.loop,
      };

      this.playingSounds.set(playingId, playingSound);

      // Handle sound end
      source.addEventListener('ended', () => {
        this.playingSounds.delete(playingId);
        this.emit('sound-ended', playingId);
      });

      // Start playback
      const startTime = options.startTime || 0;
      source.start(0, startTime);

      this.emit('sound-started', playingId);
      return playingId;
    } catch (error) {
      console.error(`Failed to play sound '${soundId}':`, error);
      this.emit('sound-error', { id: soundId, error });
      return null;
    }
  }

  /**
   * Stop a playing sound
   */
  public stopSound(playingId: string, fadeOut = 0): void {
    const playingSound = this.playingSounds.get(playingId);
    if (!playingSound) return;

    try {
      if (fadeOut > 0 && this.audioContext) {
        // Fade out
        playingSound.gainNode.gain.setValueAtTime(
          playingSound.gainNode.gain.value,
          this.audioContext.currentTime
        );
        playingSound.gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + fadeOut
        );

        // Stop after fade
        setTimeout(() => {
          playingSound.source.stop();
          this.playingSounds.delete(playingId);
        }, fadeOut * 1000);
      } else {
        // Immediate stop
        playingSound.source.stop();
        this.playingSounds.delete(playingId);
      }

      this.emit('sound-stopped', playingId);
    } catch (error) {
      // Source might already be stopped
      this.playingSounds.delete(playingId);
    }
  }

  /**
   * Stop all sounds of a category
   */
  public stopSounds(category?: 'music' | 'sfx', fadeOut = 0): void {
    for (const [playingId, playingSound] of this.playingSounds) {
      const sound = Array.from(this.sounds.values()).find(
        s => s.buffer === playingSound.source.buffer
      );
      if (!category || sound?.category === category) {
        this.stopSound(playingId, fadeOut);
      }
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.config.masterVolume;
    }
    this.emit('volume-changed', {
      type: 'master',
      volume: this.config.masterVolume,
    });
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.config.musicVolume;
    }
    this.emit('volume-changed', {
      type: 'music',
      volume: this.config.musicVolume,
    });
  }

  /**
   * Set SFX volume
   */
  public setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.config.sfxVolume;
    }
    this.emit('volume-changed', { type: 'sfx', volume: this.config.sfxVolume });
  }

  /**
   * Mute/unmute audio
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = muted ? 0 : this.config.masterVolume!;
    }
    this.emit('mute-changed', muted);
  }

  /**
   * Get current volumes
   */
  public getVolumes(): { master: number; music: number; sfx: number } {
    return {
      master: this.config.masterVolume!,
      music: this.config.musicVolume!,
      sfx: this.config.sfxVolume!,
    };
  }

  /**
   * Check if a sound is loaded
   */
  public isSoundLoaded(soundId: string): boolean {
    const sound = this.sounds.get(soundId);
    return sound ? !!sound.buffer : false;
  }

  /**
   * Get active sound count
   */
  public getActiveSourceCount(): number {
    return this.playingSounds.size;
  }

  /**
   * Check if audio is supported
   */
  public static isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  /**
   * Destroy the audio manager
   */
  public destroy(): void {
    // Stop all sounds
    this.stopSounds();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Clear data
    this.sounds.clear();
    this.playingSounds.clear();
    this.loadingPromises.clear();

    this.removeAllListeners();
  }
}
