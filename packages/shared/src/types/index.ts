// Game-related types
export interface GameLevel {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: string[];
  rewards: Reward[];
}

export interface Reward {
  id: string;
  type: 'points' | 'badge' | 'crop' | 'tool';
  value: number;
  name: string;
  description: string;
}

// Player-related types
export interface Player {
  id: string;
  username: string;
  email: string;
  level: number;
  totalPoints: number;
  achievements: Achievement[];
  farm: Farm;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
}

// Farm-related types
export interface Farm {
  id: string;
  name: string;
  plots: Plot[];
  inventory: InventoryItem[];
  tools: Tool[];
}

export interface Plot {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  crop?: Crop;
  soilQuality: number;
  waterLevel: number;
  isOccupied: boolean;
}

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  growthStage: number;
  maxGrowthStage: number;
  plantedAt: Date;
  harvestableAt: Date;
  waterRequirement: number;
  soilRequirement: number;
  expectedYield: number;
}

export type CropType = 'vegetables' | 'fruits' | 'grains' | 'herbs';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  type: 'seed' | 'crop' | 'fertilizer' | 'pesticide';
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  type: 'watering_can' | 'hoe' | 'fertilizer_spreader' | 'harvester';
  durability: number;
  maxDurability: number;
  efficiency: number;
}

// UI-related types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: string;
    sizes: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
