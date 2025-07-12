# 🚀 Announcing MobileVSCode v1.0

After months of development, we are thrilled to announce the official v1.0 launch of **MobileVSCode**—a true, professional-grade, and collaborative coding experience for mobile and tablet devices.

MobileVSCode is not just another text editor. It's an extensible platform built on a robust client-server architecture that bridges the gap between powerful mobile hardware and the limitations of mobile operating systems.

## Key Features in v1.0

-   **Full-Fledged Monaco Editor**: Get the same powerful editor that powers desktop VS Code, with rich language support, right on your mobile device.
-   **Real-Time Collaboration**: Using a high-performance CRDT engine (Y.js), you can code collaboratively with others in real-time, with shared cursors and instant synchronization.
-   **Complete Git Integration**: View your repository status, stage changes, and commit your work, all from a dedicated version control UI.
-   **Extensible Plugin Ecosystem**: The core of MobileVSCode is its plugin architecture. The `PluginBus` and `PluginDock` allow developers to create and use powerful extensions that react to editor intents like hovering and selection.
-   **Interactive Code Patches**: Plugins can do more than just show information—they can suggest concrete code changes that you can apply directly to your document with a single tap.
-   **Cross-Platform**: Built with React Native, MobileVSCode is designed to run on Android, iPadOS, and ChromeOS.

## For Developers: The Plugin SDK

We are also launching the `@mobilevscode/plugin-sdk`. It's never been easier to build powerful, context-aware extensions for a mobile IDE. Check out our **documentation site** to get started with our plugin template and CLI tools.

## Get Started

Download the MobileVSCode app from the app stores and install the server extension from the VS Code Marketplace to begin.
