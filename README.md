# 🚀 MobileVSCode

**A true, professional-grade, and collaborative coding experience for mobile devices.**

MobileVSCode is an open-source platform that enables a rich, extensible, and collaborative development environment on tablets and mobile devices. It's built on a robust client-server architecture, connecting a React Native frontend to a powerful VS Code extension backend.

![MobileVSCode Open Graph Image](launch-assets/mobile-vscode-og.png)

## ✨ Features

- **Real-Time Collaboration**: Code with others using a high-performance CRDT engine (Y.js).
- **Full Monaco Editor**: The power of desktop VS Code's editor on your mobile device.
- **Extensible Plugin System**: A rich plugin API allows for creating powerful, context-aware extensions.
- **Interactive UI**: An integrated Plugin Dock and Command Palette provide a seamless user experience.
- **Git Integration**: Manage your version control workflow directly from the app.
- **Cross-Platform**: Designed for Android, iPadOS, and ChromeOS.

## 📦 Monorepo Structure

This project is a monorepo managed with Yarn Workspaces.

- `apps/mobile`: The React Native (Expo) mobile client.
- `apps/mobile-vscode-server`: The VS Code extension backend.
- `packages/shared`: Shared GraphQL schema and types.
- `packages/plugin-sdk`: The official SDK for building plugins.

## 🚀 Getting Started

1. **Prerequisites**: Node.js, Yarn, Expo CLI, Android/iOS simulator.
2. **Clone the repository**: `git clone https://github.com/your-repo/mobile-vscode.git`
3. **Install dependencies**: `yarn install`
4. **Run the VS Code Server**:
   - Open the `apps/mobile-vscode-server` folder in VS Code.
   - Press `F5` to run the extension in a new Extension Development Host window.
   - In the new window, run the command `MobileVSCode: Start Server`.
5. **Configure the Mobile App**:
   - Update `apps/mobile/src/config.ts` with your computer's local IP address.
6. **Run the Mobile App**:
   - `yarn start:mobile`

## 🧩 Plugin Development

We've made it easy to build plugins for MobileVSCode! See our [CONTRIBUTING.md](./CONTRIBUTING.md) and our official [Plugin Documentation](https://mobilevscode.dev/docs).

To create a new plugin:
```bash
npm install -g yo generator-mobile-vscode-plugin
yo mobile-vscode-plugin
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
