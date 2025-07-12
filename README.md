# MobileVSCode

A mobile IDE powered by GraphQL, Y.js, LSP & DAP, built within a professional monorepo structure.

## Key Improvements & Architecture

-   **Unified Server Architecture**: All real-time services (GraphQL Subscriptions, Y.js collaborative editing, Language Server Protocol, Debug Adapter Protocol) are consolidated onto a single port (4000) with proper WebSocket upgrade handling.
-   **High-Performance Collaborative Editing**: Uses a delta-based synchronization strategy between Y.js and the Monaco Editor, ensuring excellent performance even with large files. Includes multi-user cursor awareness.
-   **Enhanced Security**: Includes robust path traversal protection in the file system API, validation of all user-provided IDs, and secure environment variable handling via `.env` files.
-   **Professional Tooling**:
    -   **GraphQL Code Generator**: Ensures end-to-end type safety between the backend and mobile client.
    -   **Jest**: Test configurations are set up for each workspace.
    -   **CI/CD**: A GitHub Actions pipeline is included for automated linting, building, and testing.
    -   **Yarn Workspaces**: Scripts are configured for easy monorepo management.

## Execution Instructions

### 1. Set up Environment
```bash
# Copy the example environment file
cp .env.example .env

# IMPORTANT: Open .env and update the IP address placeholders
# (e.g., 192.168.1.100) to match your computer's local network IP.

# Install all dependencies for all workspaces
yarn install
```

### 2. Generate GraphQL types
```bash
yarn codegen
```

### 3. Start the development servers
```bash
# Start the backend API
yarn start:backend

# In another terminal, start the mobile app
yarn start:mobile
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
