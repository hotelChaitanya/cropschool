export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
