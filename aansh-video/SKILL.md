---
name: aansh-video
description: Make animated explainer / podcast-style videos as code — a cartoon host with lip-sync, explainer cards and word-by-word captions, drawn on one canvas and rendered to MP4 with HyperFrames. Use when the user asks for a podcast video, explainer video, animated reel, or captioned video from an audio file.
---

# aansh-video (starter edition) — by aansh.ai

Every video is a HyperFrames project whose picture is ONE `<canvas>` drawn by plain JS as a pure
function of time `t`. A paused GSAP timeline drives `FILM.render(ctx, t)`; HyperFrames seeks it
frame by frame and renders the MP4. Because the picture only depends on `t`, renders are exact
and repeatable.

Skill folder: `SKILL_DIR` below means the folder this file lives in (e.g. `~/.claude/skills/aansh-video`).

## Requirements
Node 18+, ffmpeg, Python 3 with `numpy librosa` (for lip-sync), and for transcription
`whisper-cli` (`brew install whisper-cpp`) plus a ggml model (e.g. `ggml-large-v3.bin`).

## 1. Start a project
- One new folder per video: `cp -r SKILL_DIR/template ~/videos/<name>` — never share a folder between videos.
- Put the voice track at `assets/voice.mp3` and get its length:
  `ffprobe -v error -show_entries format=duration -of csv=p=0 assets/voice.mp3`
- In `index.html`: set both `data-duration` values to the length and add the `<audio>` element
  (see the comment there). In `scenes.js` set `makeFilm(<length>, …)`.

## 2. Audio → timing
- Words: `SKILL_DIR/tools/transcribe.sh assets/voice.mp3 en` → `w.json` (use `hi` for Hindi etc.; set `MODEL=` to your model path).
- If the user gave an exact script, save it as `transcript.txt` and align it so captions use THEIR words:
  `python3 SKILL_DIR/tools/align.py transcript.txt w.json assets/words.js`
  (without a script, write `transcript.txt` from whisper's text first). Report how many words matched.
- Lip-sync: `python3 SKILL_DIR/tools/mouth.py assets/voice.mp3 assets/mouth.js`
- `window.WORDS = [{w, s, e}]` (seconds) and `window.MOUTH` (+ `MOUTH_FPS`) are read by `engine.js`.

## 3. Write the story
- Read the transcript and split it into beats: hook → problem → idea → steps → numbers → recap → call to action.
- One scene per beat, cut on the word that introduces it: find the word's `s` time in `WORDS` and
  put it in `SHOTS = [[start, end, sceneFn], …]`. Scenes should change every 5–15 s.
- Helpers in `assets/engine.js` (`window.K`): `text` (with wrap), `card`, `pop` (bounce-in), `prog`/ease
  functions, `paperBg`, `host` (simple talking character), `captions`, `hash`/`noise`.
- Show what is being said: numbers count up, lists tick in one by one on their word, icons for nouns.
- Keep text big (≥40 px), keep the caption strip (y ≈ 940–1030) clear, keep everything inside 1920×1080.
- Never use `Math.random()` or `Date.now()` — use `hash(n)` / `noise(x)`.

## 4. Check
1. Every frame through the stub-canvas harness (catches NaN / negative radius / exceptions):
   `node SKILL_DIR/harness.js assets/words.js assets/mouth.js assets/engine.js assets/scenes.js`
   (set `global.FRAME` inside for 1080×1920 projects).
2. `npx --yes hyperframes@0.8.143 lint .`
3. Snapshot and actually LOOK at them:
   `npx --yes hyperframes@0.8.143 snapshot . --at 2,10,25,… --no-end -o snapshots/s1` → read the contact sheet.
   Fix overlaps, cut-off figures, unreadable text, captions covering content.

## 5. Render & deliver
- `npx --yes hyperframes@0.8.143 render . -q high --fps 30 -o renders/<name>.mp4` (run in background; long videos take a while).
- Share copy: `ffmpeg -i in.mp4 -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart <name>-share.mp4`
- WhatsApp copy (~50 MB): same with `-crf 26 -preset medium -tune grain -b:a 160k`.

## Rules
- Captions must use the user's own wording when they provide a script.
- Don't put a real person's likeness or cloned voice on something they didn't make or endorse; label illustrated versions of real people as such.
- Report honestly what you verified (snapshots vs a full watch-through).
- Renders are CPU-heavy: at most 2 at a time.
