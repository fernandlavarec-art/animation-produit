#!/usr/bin/env bash
# Encode work/frames en MP4 (H.264, CRF 17) puis contrôle qualité (images figées ≥0,4 s, images noires).
# usage : bash tools/finish.sh out/ma_video.mp4
set -e
cd "$(dirname "$0")/.."
OUT=${1:-out/video.mp4}; mkdir -p "$(dirname "$OUT")"
ffmpeg -y -loglevel error -framerate 30 -i work/frames/%04d.jpg -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration -show_entries stream=nb_frames -of default=nw=1 "$OUT"
if ffmpeg -i "$OUT" -vf "freezedetect=n=0.001:d=0.4,blackdetect=d=0.1" -an -f null - 2>&1 | grep -E "freeze_start|black_start"; then echo "⚠️  QA : problèmes ci-dessus"; else echo "QA OK"; fi
