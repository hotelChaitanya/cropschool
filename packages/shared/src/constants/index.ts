// Game constants
export const GAME_CONFIG = {
  MAX_FARM_PLOTS: 20,
  MAX_INVENTORY_ITEMS: 100,
  INITIAL_COINS: 500,
  INITIAL_ENERGY: 100,
  ENERGY_REGENERATION_RATE: 1, // per minute
  LEVEL_UP_MULTIPLIER: 1.5,
} as const;

// Crop growth times (in minutes)
export const CROP_GROWTH_TIMES = {
  VEGETABLES: {
    CARROTS: 30,
    TOMATOES: 45,
    LETTUCE: 20,
    POTATOES: 60,
  },
  FRUITS: {
    STRAWBERRIES: 90,
    APPLES: 240,
    ORANGES: 180,
    BERRIES: 120,
  },
  GRAINS: {
    WHEAT: 120,
    CORN: 180,
    RICE: 150,
    BARLEY: 100,
  },
  HERBS: {
    BASIL: 25,
    ROSEMARY: 40,
    THYME: 35,
    OREGANO: 30,
  },
} as const;

// Experience points for different actions
export const EXPERIENCE_POINTS = {
  PLANT_SEED: 5,
  WATER_CROP: 2,
  HARVEST_CROP: 10,
  SELL_CROP: 3,
  COMPLETE_QUEST: 50,
  LEVEL_UP: 100,
} as const;

// Tool durability costs
export const TOOL_DURABILITY_COST = {
  WATERING: 1,
  PLANTING: 2,
  HARVESTING: 3,
  FERTILIZING: 2,
} as const;

// Default theme colors
export const THEME_COLORS = {
  PRIMARY: '#22c55e', // Green
  SECONDARY: '#3b82f6', // Blue
  SUCCESS: '#10b981', // Emerald
  WARNING: '#f59e0b', // Amber
  ERROR: '#ef4444', // Red
  BACKGROUND: '#ffffff',
  SURFACE: '#f8fafc',
  TEXT_PRIMARY: '#1e293b',
  TEXT_SECONDARY: '#64748b',
  TEXT_DISABLED: '#94a3b8',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    DELETE_ACCOUNT: '/user/delete',
  },
  GAME: {
    FARM: '/game/farm',
    INVENTORY: '/game/inventory',
    ACHIEVEMENTS: '/game/achievements',
    LEADERBOARD: '/game/leaderboard',
  },
  CROPS: {
    LIST: '/crops',
    PLANT: '/crops/plant',
    WATER: '/crops/water',
    HARVEST: '/crops/harvest',
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'cropschool_token',
  USER_PROFILE: 'cropschool_profile',
  GAME_SETTINGS: 'cropschool_settings',
  TUTORIAL_COMPLETED: 'cropschool_tutorial',
  SOUND_ENABLED: 'cropschool_sound',
  MUSIC_ENABLED: 'cropschool_music',
} as const;

// Validation rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

// Game difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: {
    GROWTH_SPEED_MULTIPLIER: 1.5,
    ENERGY_CONSUMPTION_MULTIPLIER: 0.8,
    REWARD_MULTIPLIER: 1.0,
  },
  MEDIUM: {
    GROWTH_SPEED_MULTIPLIER: 1.0,
    ENERGY_CONSUMPTION_MULTIPLIER: 1.0,
    REWARD_MULTIPLIER: 1.2,
  },
  HARD: {
    GROWTH_SPEED_MULTIPLIER: 0.7,
    ENERGY_CONSUMPTION_MULTIPLIER: 1.3,
    REWARD_MULTIPLIER: 1.5,
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;
