#!/usr/bin/env python3
import os, struct, zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ASSETS_DIR = os.path.join(ROOT, "assets")
ICON_PATH = os.path.join(ASSETS_DIR, "icon.png")
SPLASH_PATH = os.path.join(ASSETS_DIR, "splash.png")

def _crc(tag: bytes, data: bytes) -> int:
    return zlib.crc32(tag + data) & 0xffffffff

def _chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", _crc(tag, data))

def write_png(path: str, w: int, h: int, rgb=(20, 20, 24)):
    # Truecolor (RGB), 8-bit
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)

    r, g, b = rgb
    # Each row: filter byte 0 + RGB pixels
    row = bytes([0]) + bytes([r, g, b]) * w
    raw = row * h
    comp = zlib.compress(raw, level=9)

    data = sig
    data += _chunk(b"IHDR", ihdr)
    data += _chunk(b"IDAT", comp)
    data += _chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(data)

def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    if not os.path.exists(ICON_PATH):
        write_png(ICON_PATH, 1024, 1024, rgb=(35, 120, 255))
        print(f"created {ICON_PATH}")
    else:
        print(f"exists  {ICON_PATH}")

    if not os.path.exists(SPLASH_PATH):
        write_png(SPLASH_PATH, 1242, 2436, rgb=(10, 10, 12))
        print(f"created {SPLASH_PATH}")
    else:
        print(f"exists  {SPLASH_PATH}")

if __name__ == "__main__":
    main()
