"""Align YOUR exact script to whisper's word timings, so captions use your words.
usage: python align.py transcript.txt w.json assets/words.js
Unmatched words are spread evenly between their matched neighbours."""
import json, re, sys, difflib

script = open(sys.argv[1], encoding="utf-8").read().split()
wj = json.load(open(sys.argv[2], encoding="utf-8", errors="replace"))

ww = []  # merge whisper sub-word tokens into words
for seg in wj["transcription"]:
    raw = seg["text"]; t = raw.strip()
    if not t: continue
    a, b = seg["offsets"]["from"] / 1000, seg["offsets"]["to"] / 1000
    if ww and (not raw.startswith(" ") or not t[0].isalnum()):
        ww[-1]["w"] += t; ww[-1]["e"] = b; continue
    ww.append({"w": t, "s": a, "e": b})

norm = lambda w: re.sub(r"[\W_]", "", w.lower())
A, B = [norm(w) for w in script], [norm(w["w"]) for w in ww]
T = [None] * len(script)
for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        T[blk.a + k] = (ww[blk.b + k]["s"], ww[blk.b + k]["e"])
matched = sum(1 for x in T if x)

i, n = 0, len(T)
while i < n:
    if T[i]: i += 1; continue
    j = i
    while j < n and not T[j]: j += 1
    s0 = T[i - 1][1] if i > 0 else 0.0
    s1 = T[j][0] if j < n else s0 + 0.3 * (j - i)
    d = (s1 - s0) / (j - i)
    for k in range(i, j): T[k] = (s0 + d * (k - i), s0 + d * (k - i + 1))
    i = j

out = [{"w": w, "s": round(s, 3), "e": round(max(e, s + 0.08), 3)} for w, (s, e) in zip(script, T)]
with open(sys.argv[3], "w", encoding="utf-8") as fh:
    fh.write("window.WORDS=" + json.dumps(out, ensure_ascii=False) + ";")
print(f"script words {len(script)}, whisper words {len(ww)}, matched {matched}")
