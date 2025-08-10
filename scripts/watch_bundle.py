#!/usr/bin/env python3
import os
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
OUT_FILE = DIST / "final.jsx"


def read_text(path: Path) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def transform_module_to_iife_section(filename: str, code: str) -> str:
    # remove imports
    code = re.sub(r"^\s*import\s+[^\n]*\n", "", code, flags=re.MULTILINE)
    # export function -> function
    code = re.sub(r"\bexport\s+function\s+", "function ", code)
    # export default function NAME -> function NAME
    code = re.sub(r"\bexport\s+default\s+function\s+", "function ", code)
    # export default X; -> (ignored in this project)
    code = re.sub(r"^\s*export\s+default\s+[^;]+;\s*$", "", code, flags=re.MULTILINE)
    # export { a, b } -> removed (not used)
    code = re.sub(r"^\s*export\s*\{[^}]*\};\s*$", "", code, flags=re.MULTILINE)
    banner = f"// ===== {filename} =====\n"
    return banner + code.strip() + "\n"


def bundle() -> str:
    # Order matters due to simple transform: define deps first
    order = [
        "layerPositions.js",
        "connectPlexus.js",
        "connectOrigin.js",
        "utils.js",
        "ui.js",
        "main.jsx",
    ]

    parts = ["//@target aftereffects", "(function () {"]
    for name in order:
        path = SRC / name
        if not path.exists():
            continue
        parts.append(transform_module_to_iife_section(name, read_text(path)))

    # replace main.jsx top-level call: remove imports already; keep body as-is
    # Ensure trailing call to createUI if present
    parts.append("})();\n")
    return "\n\n".join(parts)


def write_out(text: str):
    DIST.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(text)


def snapshot_src() -> dict:
    sig = {}
    for p in SRC.glob("*.js"):
        sig[p.name] = (p.stat().st_mtime, p.stat().st_size)
    for p in SRC.glob("*.jsx"):
        sig[p.name] = (p.stat().st_mtime, p.stat().st_size)
    return sig


def build_once(verbose=True):
    out = bundle()
    write_out(out)
    if verbose:
        print(f"[bundle] wrote {OUT_FILE.relative_to(ROOT)} ({len(out)} bytes)")


def watch_loop(interval=0.5):
    prev = {}
    build_once()
    while True:
        try:
            cur = snapshot_src()
            if cur != prev:
                prev = cur
                build_once()
            time.sleep(interval)
        except KeyboardInterrupt:
            print("[watch] stopped")
            return


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("--watch", "-w"):
        watch_loop()
    else:
        build_once()


if __name__ == "__main__":
    main()


