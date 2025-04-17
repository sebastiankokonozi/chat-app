```md
# React Native Chat Application with Convex Integration

## 1. Overview

This application is a **React Native chat solution** backed by [Convex](https://www.convex.dev/) as the real-time backend. It focuses on enabling:

- **Creation and sharing of chat rooms** (via a unique identifier and QR codes)
- **Sending, receiving, and persisting messages** in real time
- **Instant updates** for all participants in a chat room
- (Extension) **Push notifications** for new messages

### Key Tools & Technologies

- **Front-End**: React Native (JavaScript/TypeScript)
- **Backend**: Convex
- **QR Code Generation/Scanning**: A React Native-compatible library (e.g., `react-native-qrcode-svg` & `react-native-camera` or `react-native-qrcode-scanner`)
- **Push Notifications**: Either via Firebase Cloud Messaging (FCM) or Expo’s Push Notification service (depending on the chosen ecosystem)

---

## 2. Functional Requirements

1. **Chat Creation**

   - Users can create a new chat room.
   - Generate a unique identifier (e.g., UUID) for each new chat.
   - Display the chat details (ID/URL) so the user can share it.

2. **Sending Messages**

   - Users can send text messages to a chat room.
   - Each message includes: sender’s ID (username/device), timestamp, and content.
   - Messages are stored in Convex, associated with the respective chat room.

3. **QR Code Sharing**

   - Users can generate a QR code for a chat room’s unique link/deep link.
   - Users can scan a QR code to join an existing chat room.
   - Correctly parse the link or ID, then navigate to that chat room.

4. **Real-Time Messaging**

   - Messages should update instantly for all participants within a room.
   - Integrate with Convex’s real-time capabilities for subscription/updates.

5. **Push Notifications (Extension)**
   - Deliver notifications to users when they receive a new message.

---

## 3. Detailed Technical Requirements

### 3.1 Data Model (Convex)

- **Collections**:

  1. **Chats**

     - **\_id**: Unique ID
     - **title**: (Optional) Chat room title or display name (String)
     - **creatorId**: The ID of the user who created the chat (String)
     - **createdAt**: Timestamp of creation (Date/Number)

  2. **Messages**
     - **\_id**: Unique ID
     - **chatId**: Reference to the **Chats** collection (String)
     - **senderId**: ID of the user/device sending the message (String)
     - **content**: The text of the message (String)
     - **timestamp**: The time the message was sent (Date/Number)

### 3.2 APIs (Convex Functions)

- **createChat**

  - **Description**: Creates a new chat record and returns the newly created chat’s ID.
  - **Input**: `{ creatorId, [title] }`
  - **Output**: `{ chatId }`

- **sendMessage**

  - **Description**: Inserts a new message in the **Messages** collection.
  - **Input**: `{ chatId, senderId, content }`
  - **Output**: Inserted record or success message

- **fetchMessages** (with real-time subscription)

  - **Description**: Retrieves all messages for a given `chatId` in real time.
  - **Input**: `{ chatId }`
  - **Output**: Array of messages sorted by timestamp

- **fetchChat** (optional)
  - **Description**: Retrieves a specific chat’s metadata.
  - **Input**: `{ chatId }`
  - **Output**: Chat object

---

## 4. Feature Breakdown & Granular Tasks

### Feature 1: Chat Creation

1. **Create a `createChat` Convex function**

   - **Task**: Implement a backend function in Convex that inserts a new record into the **Chats** collection.
   - **Details**:
     - Accept `creatorId` and optional `title`.
     - Generate a `UUID` if needed.
     - Return the `_id` of the new chat.

2. **Integrate `createChat` in React Native**
   - **Task**: Build a screen (e.g., “Home” or “Create Chat”) with a button to create a new chat.
   - **Details**:
     - On tap, call `createChat` function via the Convex client.
     - Display the returned `chatId` or link (e.g., `myapp://chat/<chatId>`).

### Feature 2: Sending Messages

1. **Design the Chat Screen UI**

   - **Task**: Create a `ChatScreen` that displays a list of messages and an input field at the bottom.
   - **Details**:
     - Use a FlatList or SectionList to render messages.
     - Show message sender, content, and timestamp.

2. **Implement the `sendMessage` Convex function**

   - **Task**: Insert message logic in Convex with `chatId`, `senderId`, and `content`.
   - **Details**:
     - Return success or the saved object.
     - Possibly perform basic validation.

3. **Hook up “Send Message” in the UI**
   - **Task**: On the `ChatScreen`, when the user taps “Send,” call `sendMessage`.
   - **Details**:
     - Capture user input from a TextInput.
     - Clear the input upon successful send.

### Feature 3: QR Code Sharing

1. **Generate QR Code**

   - **Task**: In the Chat creation success screen (or Chat screen), have a button “Generate QR” that uses the chat’s deep link.
   - **Details**:
     - Use `react-native-qrcode-svg` (or similar).
     - Display the QR code containing `myapp://chat/<chatId>` or a universal link.

2. **QR Code Scanning**
   - **Task**: Implement camera permissions and scanning functionality with `react-native-camera` or `react-native-qrcode-scanner`.
   - **Details**:
     - Parse the scanned data.
     - If it matches the format (`myapp://chat/<chatId>`), navigate to `ChatScreen` with that `chatId`.

### Feature 4: Real-Time Messaging

1. **Enable Real-Time Subscriptions**

   - **Task**: In the `ChatScreen`, use Convex’s real-time subscription for `fetchMessages`.
   - **Details**:
     - Subscribe to changes in the `Messages` collection filtered by `chatId`.
     - Whenever a new message is added, the UI updates automatically.

2. **Handle Loading & Error States**
   - **Task**: Show a loader while the subscription is connecting.
   - **Details**:
     - If an error occurs (e.g., chat not found), provide an error message or fallback UI.

### Feature 5: Push Notifications (Extension)

1. **Setup Notification Service**

   - **Task**: Decide on the push notification service (FCM or Expo).
   - **Details**:
     - Configure the service keys and tokens.
     - Create a test script or dummy message to ensure notifications arrive.

2. **Trigger Notifications**
   - **Task**: Integrate with the backend so that when a new message is sent to a chat, a push notification is triggered for other participants.
   - **Details**:
     - Possibly store FCM/Expo tokens in the **Chats** or a separate **Users** collection.
     - Ensure notifications aren’t sent to the message sender (unless desired).

---

## 5. Deliverables

1. **Source Code**

   - Git repository with atomic commits.
   - Clear folder structure (e.g., `components/`, `screens/`, `convex/`, etc.).

2. **Documentation / README**

   - **Setup Instructions**: Steps to run the app locally, including installing dependencies, starting Convex, device/emulator instructions.
   - **Assumptions & Decisions**: Why certain libraries/tools were chosen.
   - **Key Endpoints**: Summarize the Convex functions and how they’re consumed in the frontend.

3. **Basic Tests**
   - Unit tests for utility functions (e.g., message formatting, QR link generation).
   - Integration tests to ensure the chat flow works end-to-end (create chat, send messages, see updates, etc.).

---

## 6. Evaluation Criteria

1. **Functionality**

   - Meets all specified requirements: chat creation, message sending, QR code sharing, real-time syncing, etc.

2. **Code Quality**

   - Clean, organized, commented, and follows React Native or TypeScript best practices.

3. **Real-Time Integration**

   - Effective use of Convex for back-end operations and real-time subscription updates.

4. **User Experience**

   - Intuitive UI/UX, quick message rendering, and minimal friction when creating/joining chats.

5. **Real-Time Performance**

   - Minimal latency; messages appear almost instantly on all devices.

6. **Error Handling**

   - Properly handle network errors, invalid QR codes, or chat IDs.

7. **Documentation**

   - Clear instructions that allow anyone to set up and test the project quickly.

8. **Testing**
   - Basic tests for confirming feature integrity.

---

### Final Thoughts

- **Potential Enhancements**:

  - Adding user profiles or authentication.
  - Media sharing (images, videos) with real-time updates.
  - Theming or advanced UI design.

- **Advice**: Start small. Get the foundational features (chat creation, sending messages, real-time updates) polished before adding QR code scanning and push notifications. Each of these adds extra layers of complexity, particularly around permissions and device capabilities.
```
