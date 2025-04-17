# React Native Chat App with Convex

A real-time chat application built with React Native, Expo, and Convex. Features include chat room creation, real-time messaging, QR code sharing, and push notifications.

## Features

- Create and join chat rooms
- Real-time messaging
- Share chat rooms via QR codes
- Push notifications for new messages
- Modern UI with smooth animations
- TypeScript support
- Expo managed workflow

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Convex account

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Convex account at https://dashboard.convex.dev

3. Initialize Convex:

   ```bash
   npx convex dev
   ```

4. Create a `.env` file with your Convex credentials:

   ```
   CONVEX_URL=your_convex_deployment_url
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Run on your device or simulator:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Project Structure

```
├── app/                 # Expo Router screens
│   ├── (tabs)/         # Tab-based screens
│   └── chat/           # Chat room screens
├── components/         # React components
├── convex/            # Convex backend
│   ├── schema.ts      # Database schema
│   ├── users.ts       # User operations
│   ├── chatRooms.ts   # Chat room operations
│   ├── messages.ts    # Messaging operations
│   └── pushNotifications.ts # Push notification utilities
├── store/             # State management
│   └── chatStore.ts   # Zustand store for chat state
├── types/             # TypeScript types
├── hooks/             # Custom React hooks
└── lib/               # Utility libraries
```

## Key Features

### Real-time Messaging

Messages are sent and received in real-time using Convex's subscription-based data synchronization. This ensures all participants see messages instantly without manual refreshing.

### QR Code Sharing

Each chat room has a unique QR code that can be scanned to join. The app supports both generating and scanning QR codes for a seamless sharing experience.

### Push Notifications

Participants receive push notifications when new messages arrive in a chat room, even when the app is in the background. Tapping a notification navigates directly to the relevant chat.

## Technical Decisions

- **Expo Router**: For type-safe navigation and deep linking support
- **Convex**: For real-time backend functionality and easy setup
- **Zustand**: For lightweight state management
- **FlashList**: For optimized list rendering
- **expo-notifications**: For push notification support
- **react-native-qrcode-svg**: For QR code generation

## Error Handling

- Graceful error handling for network issues
- Proper validation of QR codes
- Push notification permission handling
- Loading states for async operations
- Message send retry functionality

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
