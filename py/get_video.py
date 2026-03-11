#!/usr/bin/env python3
"""
Download YouTube Shorts using yt-dlp.
Usage:
    python download_shorts.py                        # downloads all IDs in SHORTS list
    python download_shorts.py <url_or_id> [...]      # downloads specific videos
"""

import subprocess
import sys
import os

# ── Config ────────────────────────────────────────────────────────────────────

# Folder where videos will be saved
OUTPUT_DIR = os.path.join(os.getcwd(), "shorts")

# Output filename template: saves as {youtubeId}.mp4
FILENAME_TEMPLATE = "%(id)s.%(ext)s"

# Video quality (best mp4 up to 1080p)
FORMAT = "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]/best"

# IDs or full URLs to download (used when no CLI args are given)
SHORTS = [
    "https://www.youtube.com/shorts/8ckU0uHVoVU",
    "https://www.youtube.com/shorts/cSOsCOeQmAY",
    "https://www.youtube.com/shorts/cSOsCOeQmAY",
    "https://www.youtube.com/shorts/g4Njwz2GCpg",
    "https://www.youtube.com/shorts/jGFbwVzxwXw",
    "https://www.youtube.com/shorts/nQr3FoJb5x8",
    "https://www.youtube.com/shorts/kRHL8kBqT8A",
    "https://www.youtube.com/shorts/x5CySimLfao",
    "https://www.youtube.com/shorts/fvy7YTi7YW8",
    "https://www.youtube.com/shorts/2QSK74oczSo",
    "https://www.youtube.com/shorts/0GVFwKK4ojg",
    "https://www.youtube.com/shorts/LAO5O0sszp0",
    "https://www.youtube.com/shorts/m6adruCPg5c",
    "https://www.youtube.com/shorts/e7-gKwg3z2c",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def check_yt_dlp():
    """Make sure yt-dlp is installed, offer to install it if not."""
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("yt-dlp not found. Installing via pip...")
        subprocess.run([sys.executable, "-m", "pip", "install", "yt-dlp"], check=True)
        print("yt-dlp installed.\n")

def to_url(id_or_url: str) -> str:
    """Accept a bare ID or a full YouTube URL."""
    if id_or_url.startswith("http"):
        return id_or_url
    return f"https://www.youtube.com/watch?v={id_or_url}"

def already_downloaded(video_id: str) -> bool:
    """Skip if the file already exists in the output folder."""
    path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")
    return os.path.exists(path)

def download(id_or_url: str) -> bool:
    """Download a single video. Returns True on success."""
    # Extract bare ID for the exists-check
    video_id = id_or_url.split("v=")[-1].split("&")[0] if "youtube" in id_or_url else id_or_url

    if already_downloaded(video_id):
        print(f"  ⏭  Already downloaded: {video_id}")
        return True

    url = to_url(id_or_url)
    cmd = [
        "yt-dlp",
        "--format", FORMAT,
        "--output", os.path.join(OUTPUT_DIR, FILENAME_TEMPLATE),
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--quiet",
        "--progress",
        url,
    ]

    print(f"  ⬇  Downloading: {video_id}")
    result = subprocess.run(cmd)

    if result.returncode == 0:
        print(f"  ✅ Done: {video_id}")
        return True
    else:
        print(f"  ❌ Failed: {video_id}")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    check_yt_dlp()
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    targets = sys.argv[1:] if len(sys.argv) > 1 else SHORTS

    print(f"\nSaving to: {OUTPUT_DIR}")
    print(f"Videos to download: {len(targets)}\n")

    ok, failed = 0, []
    for target in targets:
        success = download(target)
        if success:
            ok += 1
        else:
            failed.append(target)

    print(f"\n── Summary ──────────────────────────────")
    print(f"  ✅ Success : {ok}")
    print(f"  ❌ Failed  : {len(failed)}")
    if failed:
        print("\nFailed IDs:")
        for f in failed:
            print(f"  • {f}")

if __name__ == "__main__":
    main()