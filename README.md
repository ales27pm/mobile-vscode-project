# MobileVSCode

A mobile IDE client for your local Visual Studio Code instance, powered by GraphQL and Y.js for real-time collaborative editing.

## Architecture

This project enables you to control your local VS Code environment from a mobile device. It consists of two main parts:

1. **VS Code Extension (Backend)**: Runs on your desktop inside VS Code. It exposes the file system, Git, and other VS Code APIs through a secure GraphQL and WebSocket server.
2. **React Native App (Frontend)**: The mobile client that connects to the VS Code extension, allowing you to browse files, make edits, run searches, and use Git.

### Key Features

- **True VS Code Integration**: The backend is a VS Code extension, meaning it has full access to your configured environment, settings, and workspace context.
- **High-Performance Collaborative Editing**: Uses a delta-based synchronization strategy between Y.js and the Monaco Editor, ensuring excellent performance even with large files. Includes multi-user cursor awareness.
- **Secure by Design**: Includes robust path traversal protection in the file system API and leverages VS Code's own APIs for secure operations.
- **Professional Tooling**:
    - **GraphQL Code Generator**: Ensures end-to-end type safety.
    - **Yarn Workspaces**: Provides easy monorepo management.
    - **Launch & Debug**: Pre-configured for running and debugging the extension in the VS Code host.

## How to Run

### 1. Set up the Environment

```bash
# Copy the example environment file for the mobile app
cp .env.example .env

# Open .env and replace the placeholder IP with your
# computer's local network IP (e.g., 192.168.1.100).

# Install all dependencies for all workspaces
yarn install
```

### 2. Run the Backend (VS Code Extension)

Open this project folder in VS Code.
Press `F5` or go to Run -> Start Debugging. This will compile the extension and launch a new **Extension Development Host** window.
In the new window, open the Command Palette (Cmd/Ctrl + Shift + P) and run the command: **Start Mobile VSCode Server**.
You will see a notification with a one-time pairing token. You will need this for the mobile app.

### 3. Run the Frontend (Mobile App)

In a separate terminal, start the mobile app:

```bash
# Start the mobile app (Expo)
yarn start:mobile
```

Scan the QR code with the Expo Go app on your mobile device.
Enter the pairing token from the VS Code notification to connect the app to your desktop.

### 4. (Optional) Package the Extension

To create a distributable .vsix file for the extension:

```bash
yarn package:extension
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
