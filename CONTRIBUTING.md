# Contributing to MobileVSCode

We welcome contributions of all kinds! Whether it's reporting a bug, improving documentation, or submitting a new plugin, your help is appreciated.

## Developing Plugins

The best way to contribute is by building a plugin.

1. **Scaffold a Plugin**: Use our official generator to create a new plugin project.
   ```bash
   npm install -g yo generator-mobile-vscode-plugin
   yo mobile-vscode-plugin
   ```
2. **Develop**: Follow the generated README to start developing your plugin.
3. **CI Validation**: We provide a reusable GitHub Actions workflow to help you test your plugin. Create a `.github/workflows/ci.yml` file in your plugin's repository with the following content:
   ```yaml
   name: Plugin CI
   on: [push, pull_request]
   jobs:
     validate:
       uses: mobile-vscode/mobile-vscode/.github/workflows/plugin-ci.yml@main
   ```
4. **Submit to Registry**: Once your plugin is ready, open a Pull Request to our [plugin-registry](https://github.com/mobile-vscode/plugin-registry) repository to have it included in the official gallery.

## Reporting Bugs

Please open an issue on our [GitHub Issues](https://github.com/your-repo/mobile-vscode/issues) page. Include a clear description, steps to reproduce, and any relevant logs or screenshots.
