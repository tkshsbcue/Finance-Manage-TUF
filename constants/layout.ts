import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// All widths are percentage-based off screen width with a max cap
export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  // Main content padding
  paddingH: 20,
  // Card/box width — fills screen minus horizontal padding (20px each side)
  cardWidth: Math.min(SCREEN_WIDTH - 40, 398),
  // Inner element width (inputs, toggles) — slightly narrower
  inputWidth: Math.min(SCREEN_WIDTH - 50, 349),
  // Bank card width
  bankCardWidth: Math.min(SCREEN_WIDTH - 50, 343),
};
