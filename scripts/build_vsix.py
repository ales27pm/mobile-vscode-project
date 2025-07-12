#!/usr/bin/env python3
import subprocess
from pathlib import Path


def run(cmd):
    print('> ' + ' '.join(cmd))
    subprocess.run(cmd, check=True)


def main():
    run(['yarn', 'install'])
    run(['yarn', 'workspace', 'mobile-vscode-server', 'build'])
    vsix = 'mobile-vscode-server.vsix'
    run(['npx', 'vsce', 'package', '-o', vsix])
    print(f'Packaged extension to {vsix}')


if __name__ == '__main__':
    main()
