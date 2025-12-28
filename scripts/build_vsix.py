#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def run(cmd: list[str], cwd: Path | None = None) -> None:
    print("> " + " ".join(cmd))
    subprocess.run(cmd, cwd=str(cwd) if cwd else None, check=True)


def main() -> None:
    repo = Path(__file__).resolve().parents[1]
    backend = repo / "apps" / "backend"
    out_vsix = repo / "mobile-vscode-server.vsix"

    if not (backend / "package.json").exists():
        raise SystemExit(f"Backend package.json not found at: {backend / 'package.json'}")

    # 1) Install (root) - ensures workspace deps are wired
    run(["yarn", "install"], cwd=repo)

    # 2) Build + bundle backend extension (workspace scripts run in correct place)
    run(["yarn", "workspace", "mobile-vscode-server", "build"], cwd=repo)
    run(["yarn", "workspace", "mobile-vscode-server", "bundle"], cwd=repo)

    # 3) Package VSIX from backend manifest, NOT the repo root
    if out_vsix.exists():
        out_vsix.unlink()

    run(
        [
            "npx",
            "--yes",
            "@vscode/vsce",
            "package",
            "--no-dependencies",
            "-o",
            str(out_vsix),
        ],
        cwd=backend,
    )

    print(f"\n✅ VSIX created: {out_vsix}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Command failed with exit code {e.returncode}: {e.cmd}", file=sys.stderr)
        raise
