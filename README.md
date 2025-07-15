# MobileVSCode: Your Visual Studio Code, Untethered.

**A high-performance, real-time IDE client for your local VS Code instance, built for mobile and tablet devices.**

![MobileVSCode Interface](https://user-images.githubusercontent.com/12345/placeholder-image.png)

MobileVSCode bridges the gap between powerful mobile hardware and professional development workflows. It provides a fluid, intuitive client that connects directly to your existing, fully-configured Visual Studio Code environment, allowing you to browse files, edit code, run searches and use Git from anywhere.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a high-level overview of how the server and mobile client work together.

## Key Features

- **True VS Code Backend**: Runs as a standard VS Code extension with full access to your workspace, terminals and settings.
- **Real-Time Collaborative Editing**: Powered by **Y.js** so you can see colleagues' cursors and work together on the same file.
- **Full Git Integration**: View repository status, stage changes and commit via an intuitive mobile UI.
- **Optimized & Secure Communication**: Dual WebSocket architecture. GraphQL Subscriptions handle low-frequency events while Y.js sync uses a high-efficiency binary protocol over encrypted channels.
- **Type-Safe & Robust**: A shared `packages/shared` core and automated GraphQL code generation keep client and server APIs in sync.
- **Real-Time File Sync**: File explorer updates live using an event-driven file system watcher.

## Architecture Deep Dive

![Architecture Diagram](https://user-images.githubusercontent.com/12345/architecture-diagram.png)

```
+-----------------------+      +--------------------------+
|   Mobile Device       |      |    Desktop VS Code       |
| (React Native App)    |      |  (Host with Extension)   |
+-----------------------+      +--------------------------+
|      UI Layer         |      |       VS Code API        |
|   (Monaco Editor)     |      |  (File System, Git, etc.)|
+--------^--------------+      +-------------^------------+
         |                                   |
         |                                   |
+--------+--------------+      +-------------+------------+
|   Apollo Client       |      | Mobile VSCode Server Ext |
+--------^--------------+      +-------------^------------+
         |                                   |
   +-----+-----------------------------------+-----+
   |                 Network Communication         |
   +---------------------v-------------------------+
   |                                               |
   |  (wss://.../graphql)      (wss://.../yjs/)    |
   |   GraphQL Subscriptions      Y.js Protocol    |
   |   (File Events, etc.)      (CRDT Sync)        |
   |                                               |
   +-----------------------------------------------+
```

### The Monorepo (Yarn workspaces)

- **apps/backend** – the VS Code extension server.
- **apps/mobile** – the React Native client application.
- **packages/shared** – shared GraphQL schema, generated types and utilities ensuring API consistency.

### The Dual-Protocol Backend

The server exposes two real-time endpoints for maximum efficiency:

1. **/graphql** – handles standard queries, mutations and file events over GraphQL subscriptions.
2. **/yjs** – dedicated endpoint for high-throughput Y.js document synchronization.

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- Yarn (Classic or Berry)
- Visual Studio Code
- Expo Go app on your iOS or Android device

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-username/mobile-vscode-project.git
cd mobile-vscode-project

# Install all dependencies for all packages
yarn install

# Create the environment file for the mobile app
cp .env.example .env
```

Edit `.env` and replace the placeholder IP address with your computer's local network IP (e.g., `192.168.1.100`).

### 2. Run the Backend (VS Code Extension)

1. Open the project in Visual Studio Code.
2. Press **F5** or choose **Run → Start Debugging**. This compiles the extension and launches an **Extension Development Host** window.
3. In that window, open the Command Palette and run **Start Mobile VSCode Server**. A notification will display a pairing token needed for the mobile app.

### 3. Run the Frontend (Mobile App)

```bash
yarn start:mobile
```

Scan the QR code with Expo Go and enter the pairing token when prompted to securely connect to your desktop.

## Technology Stack

| Category    | Technology                                                         |
|-------------|--------------------------------------------------------------------|
| Mobile App  | React Native, Expo, TypeScript, Zustand, React Navigation          |
| Backend     | VS Code Extension API, Node.js, Express, Apollo Server             |
| API & Sync  | GraphQL, WebSockets, Y.js (CRDTs), simple-git                      |
| Tooling     | Yarn Workspaces, ESLint, Jest, Maestro, GraphQL Code Generator     |

## Contributing

We welcome contributions of all kinds! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on setting up your development environment.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
