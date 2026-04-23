# SympTax Mobile

Native mobile application for the SympTax platform, built with Expo and React Native.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Open the app**:
   - Install **Expo Go** on your Android or iOS device.
   - Scan the QR code displayed in the terminal.

## Architecture

- **`app/`**: Expo Router file-based navigation.
  - `(auth)`: Login and registration flow.
  - `(tabs)`: Main application navigation (Home, Medicines, Chat, etc.).
- **`lib/`**: Shared logic for API communication, authentication, and push notifications.
- **`assets/`**: Images, icons, and splash screens.

## Building for Production

To generate an APK for Android:
```bash
eas build -p android --profile preview
```

To generate an App Bundle (AAB) for Play Store:
```bash
eas build -p android --profile production
```
