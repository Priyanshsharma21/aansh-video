"""Audio -> lip-sync envelope.  usage: python mouth.py voice.mp3 assets/mouth.js
Writes window.MOUTH (0..1 per frame) and window.MOUTH_FPS."""
import sys, json, numpy as np, librosa

SR, HOP = 16000, 533  # ~30 frames per second
y, _ = librosa.load(sys.argv[1], sr=SR, mono=True)
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=HOP))
f = librosa.fft_frequencies(sr=SR, n_fft=1024)
band = S[(f > 300) & (f < 3000)].sum(0)          # speech band only
e = np.clip(band / (np.percentile(band, 97) + 1e-9), 0, 1)
e = np.convolve(e, [0.25, 0.5, 0.25], "same")       # smooth jitter
e = np.where(e < 0.06, 0, e)                        # closed mouth in silence
with open(sys.argv[2], "w") as fh:
    fh.write("window.MOUTH_FPS=%r;window.MOUTH=%s;" % (SR / HOP, json.dumps([round(float(v), 3) for v in e])))
print("frames", len(e), "seconds", round(len(e) * HOP / SR, 2))
