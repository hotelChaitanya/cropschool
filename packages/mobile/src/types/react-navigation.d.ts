// TypeScript declaration overrides for React Navigation compatibility
declare module '@react-navigation/native' {
  export const NavigationContainer: any;
}

declare module '@react-navigation/stack' {
  export function createStackNavigator(): any;
}

declare module 'expo-status-bar' {
  export const StatusBar: any;
}
