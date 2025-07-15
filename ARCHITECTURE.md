# Architecture

This project exposes a full VS Code environment to mobile devices using a server-based model.
The backend runs as a VS Code extension and communicates with a React Native client.

## Components

- **apps/backend** – VS Code extension acting as the server. It exposes GraphQL and Y.js endpoints over WebSockets.
- **apps/mobile** – React Native application using a Monaco-based editor to connect to the server.
- **packages/shared** – Shared GraphQL schema and generated types used by both the server and client.
- **packages/editor** – Mobile-friendly wrapper around Monaco.

## Communication

The extension starts a local server with two WebSocket endpoints:

1. `/graphql` – handles queries, mutations and file events via GraphQL subscriptions.
2. `/yjs` – synchronizes document edits using the Y.js protocol for low-latency collaboration.

The mobile app connects to these endpoints to mirror the local VS Code workspace, enabling file browsing, editing and real-time collaboration.

## Rationale

Documenting the architecture ensures contributors share the same mental model and helps prevent merge conflicts stemming from differing assumptions about how the project is structured.
