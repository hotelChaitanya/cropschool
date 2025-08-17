export default {
  expo: {
    name: 'CropSchool',
    slug: 'cropschool',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    platforms: ['ios', 'android', 'web'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.cropschool.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.cropschool.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    extra: {
      eas: {
        projectId: 'your-project-id-here',
      },
    },
  },
};
