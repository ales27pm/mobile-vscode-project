#!/usr/bin/env python3
import subprocess


def run(cmd):
    print('> ' + ' '.join(cmd))
    subprocess.run(cmd, check=True)


def main():
    run(['yarn', 'install'])
    run(['yarn', 'codegen'])
    run(['yarn', 'workspace', 'extension', 'run', 'vscode:prepublish'])
    run(['npx', 'vsce', 'package', '-o', 'mobile-vscode-server.vsix'])


if __name__ == '__main__':
    main()
