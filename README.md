# PayU - Finance Management App

A pixel-perfect React Native implementation of a finance management application, built from a Figma design as part of a UI development challenge.

## Overview

This project was built as part of the TUF App Dev Challenge, and I’m sharing my submission here.

The application is developed using React Native, and I’ve closely followed the Figma design—matching about 95% of it. For the remaining 5%, I explored some creative freedom, like adding an iOS 6–style skeuomorphic touch to the home screen card.

You’ll also notice thoughtful details across the app—interactive buttons (like the star and others) include smooth animations and haptic feedback to enhance the overall user experience.

## Demo

### iOS

https://github.com/user-attachments/assets/646cd15e-47de-423e-931d-66337b23c4dc

### Android

https://github.com/tkshsbcue/Finance-Manage-TUF/issues/2#issue-4224872181

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo SDK | 54 |
| Runtime | React Native | 0.81.5 (New Architecture) |
| Language | TypeScript | 5.9 (Strict) |
| UI | React | 19.1 |
| Routing | Expo Router | 6 (File-based, typed routes) |
| Styling | NativeWind + TailwindCSS | 4.x / 3.4 |
| Animations | React Native Reanimated | 4.1 |
| Charts | react-native-svg | 15.x |
| State | Zustand | 5.x |
| Fonts | Inter (Google Fonts) | 400/500/600/700 |
| Haptics | expo-haptics | 15.x |
| Sensors | expo-sensors | 15.x |

## Screens

### 1. Sign In / Sign Up
- Single screen with a **smooth sliding toggle** between Sign In and Sign Up — the white pill slides between tabs with a bouncy, natural feel
- Dark gradient background matching the Figma spec exactly
- When you start typing your password and hit the keyboard's "next" key, it jumps to the next field automatically — no need to tap
- A **circular arrow button** smoothly appears next to the password field when you're typing, letting you submit without reaching for the button
- The keyboard **never covers the input fields** — on iOS, the content pushes up in perfect sync with the keyboard; on Android, it scrolls smoothly to keep everything visible

### 2. Home
- **3D Bank Card** — tilt your phone and the card responds in real-time. It rotates in 3D following your hand movement, a holographic light streak slides across the surface, and the shadow shifts underneath as if the card is floating. All driven by the phone's accelerometer
- Weekly/Monthly toggle slides with the same bouncy animation as the auth screen
- **Favourite star button** — tap to star and tiny gold particles burst outward like confetti, with a satisfying vibration. Tap again to unstar with a subtle shrink animation
- **Floating + button** — tap it and three navigation bubbles orbit out from the center with a springy pop, each linking to a different tab. Tap the backdrop or the X to collapse them back

### 3. Balances
- **Credit score gauge** — a semi-circular meter with four colored segments (green, pink, blue, gold). When you first visit the tab, an indicator dot sweeps along the arc to your score position while the number counts up from 0 — both perfectly in sync. The animation only plays the first time you visit, not every time you switch back
- **Bar chart** — bars spring up from the bottom one by one in a wave pattern, each group slightly after the previous, with a gentle overshoot before settling
- Currency card with an **enable button** that morphs from gray to green, swapping the + icon for a checkmark with a satisfying bounce

### 4. Profile
- Preview and Edit modes with the same smooth toggle animation
- Edit mode has a full form with smart keyboard navigation — each field chains to the next
- Tap anywhere outside the fields to dismiss the keyboard, or drag the page down and the keyboard follows your finger

## What Makes This Feel Premium

### Buttery Smooth Animations
Every animation targets **60fps** and runs independently of the app's main logic. Nothing stutters — the tab slides, the gauge sweep, the star particles, the card tilt — they all run on a separate animation thread so even if the app is doing work in the background, animations never drop frames.

### It Responds to Touch Instantly
Buttons react the moment your finger touches them with zero delay. Combined with haptic vibrations (you feel a subtle buzz on star, enable, and menu interactions), the app feels tactile and responsive — like touching real objects.

### Fits Every Screen
The layout adapts to any phone size. Nothing overflows or looks squished — whether it's a compact phone or a large tablet, every card, input, and chart scales proportionally.

### Smart Keyboard Handling
The keyboard experience is native-quality on both iOS and Android. Fields chain together, the content scrolls to stay visible, and dismissing the keyboard feels natural (drag down or tap outside). No content ever gets hidden behind the keyboard.

### Persistent Header
When switching between Home, Balances, and Profile, the top bar (logo + icons) stays perfectly still while only the content below fades smoothly. This small detail makes navigation feel polished and grounded.

### Thoughtful Loading
Charts and gauges on the Balances page animate only when you first visit — not while the app loads in the background. This means the Home tab loads instantly and you get to enjoy the chart animations when you actually see them.

## Project Structure

```
app/
  _layout.tsx              # Root Stack + dark theme config
  index.tsx                # Redirect to sign-in
  (auth)/
    _layout.tsx            # Auth Stack
    sign-in.tsx            # Sign In / Sign Up (unified)
    sign-up.tsx            # Redirect to sign-in
  (tabs)/
    _layout.tsx            # Tab navigator + persistent header
    home.tsx               # Home screen
    balance.tsx            # Balances + charts
    profile.tsx            # Profile + edit form

components/
  AnimatedStarButton.tsx   # Star toggle with particles + haptics
  AnimatedEnableButton.tsx # Enable toggle with color morph
  FloatingActionButton.tsx # FAB with orbiting menu items
  SkeuomorphicCard.tsx     # 3D tilt card with accelerometer
  KeyboardView.tsx         # Reusable keyboard wrapper

constants/
  layout.ts                # Responsive width constants
  categories.ts            # Expense category definitions

lib/
  database.ts              # SQLite database layer

store/
  useTransactionStore.ts   # Zustand state management

types/
  index.ts                 # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm 9+ (comes with Node.js)
- Android Studio (for Android builds) — [setup guide](https://reactnative.dev/docs/set-up-your-environment?platform=android)
- Xcode 15+ (for iOS builds, macOS only) — [setup guide](https://reactnative.dev/docs/set-up-your-environment?platform=ios)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Finance-Manage-TUF

# 2. Install dependencies
npm install
```

### Running on Android

```bash
# Option 1: Development build (recommended for testing)
npx expo prebuild --platform android
npx expo run:android

# Option 2: Build release APK directly
npx expo prebuild --platform android
cd android
./gradlew assembleRelease

# The APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

> **Note:** Make sure you have an Android emulator running or a physical device connected via USB with USB debugging enabled. To verify, run `adb devices` — you should see your device listed.

### Running on iOS (macOS only)

```bash
# 1. Generate native iOS project
npx expo prebuild --platform ios

# 2. Install CocoaPods dependencies
cd ios && pod install && cd ..

# 3. Run on simulator or connected device
npx expo run:ios

# To run on a specific simulator:
npx expo run:ios --device "iPhone 16 Pro"
```

> **Note:** You need Xcode 15+ installed with iOS 17+ simulator. For running on a physical device, you'll need an Apple Developer account and must configure code signing in Xcode.

### Quick Start (Expo Go — limited features)

If you just want to preview the UI without native builds:

```bash
npx expo start
```

Then scan the QR code with **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)).

> **Limitation:** Features requiring native modules (accelerometer on bank card, haptics) won't work in Expo Go. Use a development build for the full experience.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Metro bundler cache issues | `npx expo start --clear` |
| Android build fails | `cd android && ./gradlew clean && cd ..` then rebuild |
| iOS pod issues | `cd ios && pod deintegrate && pod install && cd ..` |
| Fonts not loading | Restart the dev server with `npx expo start --clear` |

---

## Download APK

> **[Download Latest APK]()**
>
> *Direct download link for Android. No build setup required — just install and run.*

---

## Design Reference

All screens were implemented pixel-for-pixel from the provided Figma design, with exact:
- Typography (Inter font family — Regular 400, Medium 500, SemiBold 600, Bold 700)
- Font sizes, line heights, and letter spacing values
- Color palette (#0A0A0A background, #262626 cards, #FAFAFA accents)
- Border radii, border widths, padding, and gap values
- Component dimensions matching Figma frame measurements

## Author

Built as a UI development challenge submission.
