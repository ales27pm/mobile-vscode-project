# Contributing to MobileVSCode

Thank you for your interest in contributing to MobileVSCode! This guide provides all the information you need to set up your development environment and start hacking on the project.

## Project Structure

This repository is a monorepo managed with Yarn Workspaces. Key directories are:

```
/
├── apps/
│   ├── backend/  # The VS Code extension that runs on the desktop.
│   └── mobile/   # The React Native (Expo) mobile client application.
└── packages/
    ├── editor/                   # Shared wrapper around the Monaco editor component.
    ├── react-native-monaco-editor/ # React Native bindings for Monaco.
    └── shared/                   # GraphQL schema, generated types and other shared code.
```

## Prerequisites

- **Node.js** v18 or newer
- **Yarn** v1 (Classic)
- **Visual Studio Code**
- **Expo Go** installed on your iOS or Android device

## Development Setup

The backend (VS Code extension) and frontend (mobile app) run side by side during development.

### 1. Installation

From the project root, install all dependencies and generate initial GraphQL types:

```bash
yarn install
```

### 2. Backend Workflow (VS Code Extension)

1. Open the repository in VS Code.
2. Press **F5** or select **Run → Start Debugging**.
3. A new window titled **Extension Development Host** opens running the server.
4. In that window, open the Command Palette and run **Start Mobile VSCode Server**. A pairing token will appear in a notification.

### 3. Frontend Workflow (Mobile App)

Ensure `.env` is configured as described in the main README. Then start the Expo development server:

```bash
yarn start:mobile
```

Scan the QR code with Expo Go to load the app. Hot reloading works automatically. Restart the Extension Development Host (Cmd/Ctrl + Shift + F5) to pick up backend changes.

## Key Scripts

Run these from the project root:

| Script              | Description                                                            |
|---------------------|------------------------------------------------------------------------|
| `yarn install`      | Install dependencies across all workspaces.                             |
| `yarn codegen`      | Regenerate GraphQL types from the schema. Runs automatically on install.|
| `yarn lint`         | Check code quality and style using ESLint.                              |
| `yarn test`         | Run unit and component tests with Jest.                                 |
| `yarn package:extension` | Build the VS Code extension into a `.vsix` file.                 |
| `yarn start:mobile` | Launch the Expo development server.                                     |

## Coding Standards

- All new code must be written in **TypeScript**.
- Run `yarn lint` before committing to ensure style consistency.
- Commit messages should be concise and use the imperative mood (e.g., "Fix bug").

## Submitting Changes

1. Fork the repository and create a branch off `main`.
2. Make your changes while following the coding standards.
3. Add tests for any new functionality and run `yarn test`.
4. Commit with a descriptive message.
5. Push your branch and open a Pull Request against the main repository.
