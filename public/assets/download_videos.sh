#!/usr/bin/env bash
# download_videos.sh — Download YouTube videos for eduScroll testing
#
# Usage:
#   ./download_videos.sh                          # download all videos listed below
#   ./download_videos.sh <youtube_url_or_id> ...  # download specific video(s)
#
# Requirements: yt-dlp (installed via pip)
#   pip install yt-dlp
#
# Output: saves as <youtubeId>.mp4 in the same folder as this script

YTDLP="/c/Users/XXXXXXX/AppData/Local/Packages/PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0/LocalCache/local-packages/Python312/Scripts/yt-dlp.exe"
OUTDIR="$(dirname "$0")"

# Fall back to yt-dlp on PATH if the absolute path doesn't exist
if [ ! -f "$YTDLP" ]; then
  YTDLP="yt-dlp"
fi

download() {
  local url="$1"
  echo ">>> Downloading: $url"
  "$YTDLP" \
    -f "best[ext=mp4]" \
    -o "$OUTDIR/%(id)s.mp4" \
    "$url"
}

# ── Default video list ─────────────────────────────────────────────────────────
# Add or remove entries here. Format: YouTube URL or bare video ID.
DEFAULT_VIDEOS=(
  "https://www.youtube.com/watch?v=DHjqpvDnNGE"   # JavaScript in 100 Seconds  — Fireship
  "https://www.youtube.com/watch?v=Tn6-PIqc4UM"   # React in 100 Seconds       — Fireship
  "https://www.youtube.com/watch?v=HkdAHXoRtos"   # Git in 100 Seconds         — Fireship
  "https://www.youtube.com/watch?v=Gjnup-PuquQ"   # Docker in 100 Seconds      — Fireship
  "https://www.youtube.com/watch?v=rrB13utjYV4"   # Linux in 100 Seconds       — Fireship
  "https://www.youtube.com/watch?v=ENrzD9HAZK4"   # Node.js in 100 Seconds     — Fireship
)

# ── Main ───────────────────────────────────────────────────────────────────────
if [ $# -gt 0 ]; then
  # Download only the URLs/IDs passed as arguments
  for arg in "$@"; do
    # Accept bare IDs (no "http") by prepending the YouTube URL
    if [[ "$arg" != http* ]]; then
      arg="https://www.youtube.com/watch?v=$arg"
    fi
    download "$arg"
  done
else
  # Download the full default list
  for url in "${DEFAULT_VIDEOS[@]}"; do
    download "$url"
  done
fi

echo ""
echo "Done. Files saved to: $OUTDIR"
