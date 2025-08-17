'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Settings {
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    audioCues: boolean;
    subtitles: boolean;
  };
  parental: {
    timeLimit: number; // minutes per day
    allowedGames: string[];
    requireParentApproval: boolean;
    progressReports: boolean;
  };
  general: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
    autoSave: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    shareProgress: boolean;
  };
}

const defaultSettings: Settings = {
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    audioCues: true,
    subtitles: false,
  },
  parental: {
    timeLimit: 60,
    allowedGames: ['math-adventure', 'word-explorer', 'science-lab'],
    requireParentApproval: false,
    progressReports: true,
  },
  general: {
    theme: 'auto',
    language: 'en',
    notifications: true,
    autoSave: true,
  },
  privacy: {
    dataCollection: false,
    analytics: true,
    shareProgress: true,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('accessibility');
  const [isClient, setIsClient] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('cropschool-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('cropschool-settings', JSON.stringify(settings));
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 3000);

    // Apply accessibility settings immediately
    applyAccessibilitySettings();
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('cropschool-settings');
  };

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;

    // High contrast
    if (settings.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Large text
    if (settings.accessibility.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  };

  const tabs = [
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'parental', name: 'Parental Controls', icon: '👨‍👩‍👧‍👦' },
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
  ];

  const gameOptions = [
    { id: 'math-adventure', name: 'Math Adventure' },
    { id: 'word-explorer', name: 'Word Explorer' },
    { id: 'science-lab', name: 'Science Lab' },
    { id: 'art-studio', name: 'Art Studio' },
    { id: 'music-maker', name: 'Music Maker' },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🌱</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                CropSchool
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/games" className="text-gray-600 hover:text-blue-600">
                Games
              </Link>
              <Link
                href="/parents"
                className="text-gray-600 hover:text-blue-600"
              >
                Parent Dashboard
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Customize your CropSchool experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Categories
              </h2>
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Accessibility Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          High Contrast Mode
                        </h3>
                        <p className="text-sm text-gray-600">
                          Increases contrast for better visibility
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.accessibility.highContrast}
                          onChange={e =>
                            updateSetting(
                              'accessibility',
                              'highContrast',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Reduced Motion
                        </h3>
                        <p className="text-sm text-gray-600">
                          Minimizes animations and transitions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.accessibility.reducedMotion}
                          onChange={e =>
                            updateSetting(
                              'accessibility',
                              'reducedMotion',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Large Text
                        </h3>
                        <p className="text-sm text-gray-600">
                          Increases text size for better readability
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.accessibility.largeText}
                          onChange={e =>
                            updateSetting(
                              'accessibility',
                              'largeText',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Audio Cues
                        </h3>
                        <p className="text-sm text-gray-600">
                          Provides audio feedback for interactions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.accessibility.audioCues}
                          onChange={e =>
                            updateSetting(
                              'accessibility',
                              'audioCues',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Subtitles
                        </h3>
                        <p className="text-sm text-gray-600">
                          Shows text for spoken content
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.accessibility.subtitles}
                          onChange={e =>
                            updateSetting(
                              'accessibility',
                              'subtitles',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Parental Controls */}
              {activeTab === 'parental' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Parental Controls
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Daily Time Limit
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Set maximum play time per day
                      </p>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="15"
                          max="180"
                          step="15"
                          value={settings.parental.timeLimit}
                          onChange={e =>
                            updateSetting(
                              'parental',
                              'timeLimit',
                              parseInt(e.target.value)
                            )
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg font-semibold text-blue-600 min-w-[80px]">
                          {Math.floor(settings.parental.timeLimit / 60)}h{' '}
                          {settings.parental.timeLimit % 60}m
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Allowed Games
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose which games your child can access
                      </p>
                      <div className="space-y-2">
                        {gameOptions.map(game => (
                          <label
                            key={game.id}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type="checkbox"
                              checked={settings.parental.allowedGames.includes(
                                game.id
                              )}
                              onChange={e => {
                                if (e.target.checked) {
                                  updateSetting('parental', 'allowedGames', [
                                    ...settings.parental.allowedGames,
                                    game.id,
                                  ]);
                                } else {
                                  updateSetting(
                                    'parental',
                                    'allowedGames',
                                    settings.parental.allowedGames.filter(
                                      id => id !== game.id
                                    )
                                  );
                                }
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900">{game.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Require Parent Approval
                        </h3>
                        <p className="text-sm text-gray-600">
                          New games require parent permission
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.parental.requireParentApproval}
                          onChange={e =>
                            updateSetting(
                              'parental',
                              'requireParentApproval',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Weekly Progress Reports
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive email reports about your child's progress
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.parental.progressReports}
                          onChange={e =>
                            updateSetting(
                              'parental',
                              'progressReports',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    General Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Theme
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose your preferred color scheme
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'auto'].map(theme => (
                          <label key={theme} className="relative">
                            <input
                              type="radio"
                              name="theme"
                              value={theme}
                              checked={settings.general.theme === theme}
                              onChange={e =>
                                updateSetting(
                                  'general',
                                  'theme',
                                  e.target.value
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="p-3 border-2 rounded-lg text-center cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50">
                              <span className="capitalize font-medium">
                                {theme}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Language
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select your preferred language
                      </p>
                      <select
                        value={settings.general.language}
                        onChange={e =>
                          updateSetting('general', 'language', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive updates and reminders
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.notifications}
                          onChange={e =>
                            updateSetting(
                              'general',
                              'notifications',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Auto-Save Progress
                        </h3>
                        <p className="text-sm text-gray-600">
                          Automatically save game progress
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.autoSave}
                          onChange={e =>
                            updateSetting(
                              'general',
                              'autoSave',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Privacy Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Data Collection
                        </h3>
                        <p className="text-sm text-gray-600">
                          Allow collection of usage data to improve the app
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.dataCollection}
                          onChange={e =>
                            updateSetting(
                              'privacy',
                              'dataCollection',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Analytics
                        </h3>
                        <p className="text-sm text-gray-600">
                          Allow anonymous analytics to help us improve
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.analytics}
                          onChange={e =>
                            updateSetting(
                              'privacy',
                              'analytics',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Share Progress
                        </h3>
                        <p className="text-sm text-gray-600">
                          Allow sharing progress with teachers and educators
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacy.shareProgress}
                          onChange={e =>
                            updateSetting(
                              'privacy',
                              'shareProgress',
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        Data Protection Notice
                      </h3>
                      <p className="text-sm text-yellow-700">
                        CropSchool is committed to protecting your child's
                        privacy. We follow COPPA guidelines and never share
                        personal information with third parties without explicit
                        consent.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  onClick={resetSettings}
                  className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reset to Defaults
                </button>

                <div className="flex items-center space-x-4">
                  {showSaveConfirmation && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Settings saved!</span>
                    </div>
                  )}

                  <button
                    onClick={saveSettings}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
