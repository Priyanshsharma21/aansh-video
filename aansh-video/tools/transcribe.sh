#!/usr/bin/env bash
# usage: tools/transcribe.sh voice.mp3 en   ->  w.json (word-level whisper output)
# needs: ffmpeg, whisper-cli (brew install whisper-cpp), a ggml model (MODEL env var)
set -euo pipefail
IN="$1"; LANG="${2:-en}"
MODEL="${MODEL:-$HOME/models/ggml-large-v3.bin}"
ffmpeg -y -loglevel error -i "$IN" -ar 16000 -ac 1 a.wav
whisper-cli -m "$MODEL" -f a.wav -l "$LANG" -ml 1 -sow -oj -of w
echo "wrote w.json"
