# aansh-video — animated explainer videos with Claude Code

A [Claude Code](https://claude.com/claude-code) skill by **aansh.ai** that turns a voice recording
into an animated, captioned explainer / podcast-style video: a cartoon host with lip-sync,
explainer cards that pop in on the right word, and word-by-word captions — all drawn in code
and rendered to MP4 with [HyperFrames](https://hyperframes.heygen.com).

![demo](docs/demo.jpg)

## Quick start (Mac)

### 1. Install the tools (one time)
```bash
brew install node ffmpeg whisper-cpp
pip3 install numpy librosa
```
You also need [Claude Code](https://claude.com/claude-code) installed and logged in.

### 2. Download a whisper model (one time)
Whisper turns speech into word timings for the captions.
```bash
mkdir -p ~/models
curl -L -o ~/models/ggml-large-v3.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3.bin
```
`ggml-large-v3.bin` (~3 GB) is the most accurate, and the best choice for Hindi.
For a smaller, faster download use `ggml-base.bin` (~150 MB) instead.

### 3. Add the skill to Claude Code
```bash
git clone https://github.com/<your-username>/aansh-video.git
cp -r aansh-video/aansh-video ~/.claude/skills/
```

### 4. Make a video
Open a terminal and start Claude Code:
```bash
claude
```
Then ask for your video, for example:
```
/aansh-video make a podcast-style explainer video from ~/Downloads/voice.mp3.
My whisper model is at ~/models/ggml-large-v3.bin.
Here's the script: <paste your script>
```
Claude will set up the project, time every word, write the scenes, check still frames,
and render the MP4 into the project's `renders/` folder. A few minutes of audio
can take 15–30 minutes to render.

### 5. Ask for changes in plain words
- "Make the captions bigger"
- "Change the host's shirt to red and give him glasses"
- "When I say ₹50,000, show a money card with that number"
- "Make a smaller copy for WhatsApp"

## Tips
- **Give the exact script.** Captions then use your wording instead of whisper's guesses.
- **Set the language** for non-English audio, e.g. "the audio is in Hindi".
- **Vertical video:** ask for 9:16 / 1080×1920 for Reels and Shorts.
- **Watch the final video once** before posting; caption timing can drift on long audio.

## Windows / Linux
The skill itself works anywhere Claude Code runs. Install the same tools another way:
- **Windows:** use [WSL](https://learn.microsoft.com/windows/wsl/install) and follow the Linux steps.
- **Linux:** `sudo apt install nodejs ffmpeg python3-pip`, `pip3 install numpy librosa`, and build
  [whisper.cpp](https://github.com/ggerganov/whisper.cpp), which provides `whisper-cli`.

## Troubleshooting
| Problem | Fix |
|---|---|
| `whisper-cli: command not found` | `brew install whisper-cpp` |
| `No module named librosa` | `pip3 install numpy librosa` |
| Captions are out of sync | Give Claude the exact script and ask it to re-check the timing around the bad spot |
| Video has no sound | Make sure the `<audio>` element in `index.html` points at your file |
| Render is slow | Normal: rendering uses a lot of CPU. Close other apps and run one render at a time |

## What's inside
| Path | What |
|---|---|
| `aansh-video/SKILL.md` | The workflow Claude follows |
| `aansh-video/template/` | Starter project: `engine.js` (helpers, simple host, captions, shot runner) + demo `scenes.js` |
| `aansh-video/tools/transcribe.sh` | Audio → word-level whisper JSON |
| `aansh-video/tools/align.py` | Aligns your exact script to whisper timings |
| `aansh-video/tools/mouth.py` | Audio → lip-sync envelope |
| `aansh-video/harness.js` | Runs every frame on a fake canvas to catch crashes before rendering |

Try the demo without any audio (opens a preview in your browser):
```bash
cd aansh-video/template && npx --yes hyperframes@0.8.143 preview
```

## Want more?
This is the starter edition. The custom characters, studio sets, icon libraries and multi-language
caption pipeline used in aansh.ai client videos are not included — reach out to aansh.ai for custom work.

## License
MIT for the code in this repo. `template/assets/gsap.min.js` is GSAP, under the
[GreenSock standard license](https://gsap.com/standard-license).
