import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  paddingH: 20,
  // 90% of screen width — responsive on all devices
  cardWidth: SCREEN_WIDTH * 0.92,
  // 85% of screen width for inputs/toggles
  inputWidth: SCREEN_WIDTH * 0.85,
  // Bank card
  bankCardWidth: SCREEN_WIDTH * 0.85,
};
