# Sound design for the Solenix motion piece, synced to its timeline. One piece in D:
# a driving minor pulse while the bodies are pulled apart, a riser into the freeze, near silence with
# a heartbeat, then the ignition and a warm D major bed. Effects share the key and the reverb.
import math, random, struct, wave

SR, DUR = 44100, 20.0
N = int(SR * DUR)
dry = [0.0] * N        # impacts, pulse
send = [0.0] * N       # goes to the reverb (pads, bells, plucks, whooshes)
rnd = random.Random(11)
TAU = 2 * math.pi
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def add(buf, t0, samples, gain=1.0):
    i0 = int(t0 * SR)
    for k, v in enumerate(samples):
        i = i0 + k
        if 0 <= i < N: buf[i] += v * gain

def env_ad(n, a, d):
    out = []
    for k in range(n):
        t = k / SR
        out.append(min(1.0, t / a) * math.exp(-t / d) if a > 0 else math.exp(-t / d))
    return out

def boom(dur=1.2, f0=110, f1=38, gain=1.0):
    # Pitched-down sine thump: the body of every impact.
    n = int(dur * SR); out = []; ph = 0.0
    for k in range(n):
        t = k / SR; f = f1 + (f0 - f1) * math.exp(-t * 9); ph += TAU * f / SR
        mid = math.sin(TAU * (220 - 130 * min(1, t / 0.18)) * t) * math.exp(-t * 9) * 0.5
        out.append(math.tanh(2.5 * (math.sin(ph) * math.exp(-t * 3.2) + mid)) / math.tanh(2.5) * gain)
    return out

def noise_burst(dur, lp=0.25, decay=0.08, gain=1.0, hp=False):
    n = int(dur * SR); out = []; y = 0.0; prev = 0.0
    for k in range(n):
        x = rnd.uniform(-1, 1); y += lp * (x - y); v = (x - y) if hp else y
        out.append(v * math.exp(-(k / SR) / decay) * gain)
    return out

def whoosh(dur, up=True, gain=1.0):
    # Filtered noise whose brightness and level sweep: whips, wipes and fly-ins.
    n = int(dur * SR); out = []; y = 0.0
    for k in range(n):
        u = k / max(1, n - 1); shape = math.sin(math.pi * (u if up else 1 - u) ** 0.8) if True else 1
        c = 0.02 + 0.35 * (u if up else 1 - u)
        y += c * (rnd.uniform(-1, 1) - y)
        out.append(y * shape * gain)
    return out

def pluck(m, dur=1.4, gain=1.0):
    n = int(dur * SR); f = hz(m); out = []
    for k in range(n):
        t = k / SR; e = min(1, t / 0.004) * math.exp(-t * 4.5)
        out.append((math.sin(TAU * f * t) + 0.35 * math.sin(TAU * 2 * f * t) * math.exp(-t * 8)) * e * gain)
    return out

def bell(m, dur=3.0, gain=1.0):
    n = int(dur * SR); f = hz(m); out = []
    for k in range(n):
        t = k / SR; e = min(1, t / 0.006) * math.exp(-t * 1.5)
        out.append((math.sin(TAU * f * t) + 0.45 * math.sin(TAU * f * 2.76 * t) * math.exp(-t * 3) + 0.2 * math.sin(TAU * f * 5.4 * t) * math.exp(-t * 6)) * e * gain)
    return out

def slam(t, g=1.0):
    add(dry, t, boom(0.9, 140, 45, 0.9 * g)); add(dry, t, noise_burst(0.12, 0.5, 0.025, 0.6 * g, hp=True)); add(send, t, noise_burst(0.3, 0.12, 0.08, 0.18 * g))

# ---- Bed: pads (per sample) ----
MINOR = [50, 57, 62, 65, 76]   # D3 A3 D4 F4 E5
MAJOR = [50, 57, 62, 66, 76]   # D3 A3 D4 F#4 E5
for i in range(N):
    t = i / SR
    if 8.4 <= t < 9.1: continue
    maj = t >= 9.1
    lvl = (0.020 + 0.03 * min(1, t / 8.4)) if not maj else 0.05 * min(1, (t - 9.1) / 0.8) * (1 + 0.35 * min(1, max(0, (t - 17.2) / 0.6)))
    if t < 0.15: lvl *= t / 0.15
    if t > DUR - 1.5: lvl *= max(0.0, (DUR - t) / 1.5)
    s = 0.0
    for k, m in enumerate(MAJOR if maj else MINOR):
        f = hz(m); s += math.sin(TAU * f * (1 + (k - 2) * 0.0008) * t + k) * (1.0 if k < 3 else 0.6) + 0.3 * math.sin(TAU * f * 2.003 * t)
    send[i] += s * lvl

# ---- Pulse: driving eighths (120 bpm) until the freeze, a slow heartbeat after the ignition ----
t = 0.0
while t < 8.4:
    acc = 1.0 if int(round(t / 0.25)) % 2 == 0 else 0.55
    add(dry, t, boom(0.22, 95, 55, 0.22 * acc * (0.7 + 0.5 * t / 8.4)))
    if int(round(t / 0.25)) % 2 == 1: add(dry, t, noise_burst(0.05, 0.85, 0.012, 0.06 + 0.05 * t / 8.4, hp=True))
    t += 0.25
t = 9.7
while t < 19.0:
    add(dry, t, boom(0.35, 80, 45, 0.16)); t += 0.5

# ---- Hits, synced to the picture ----
add(send, 0.0, whoosh(0.36, True, 0.5))
slam(0.0, 1.0)
add(dry, 0.37, boom(1.4, 160, 34, 1.3)); add(dry, 0.37, noise_burst(0.35, 0.6, 0.06, 0.55, hp=True))   # collision
slam(0.5, 0.9)
add(send, 1.32, whoosh(0.3, True, 0.35)); add(send, 1.5, whoosh(0.35, True, 0.4))
slam(2.0, 1.0)
[add(send, 2.40 + 0.07 * n, whoosh(0.22, False, 0.35)) for n in range(5)]
for k, m in enumerate([74, 77, 81]): add(send, 2.55 + 0.15 * k, pluck(m, 1.2, 0.35))
slam(3.25, 0.8); slam(3.5, 0.8)
add(send, 4.42, whoosh(0.22, False, 0.5))
for k, m in enumerate([62, 65, 69, 72, 74, 77]): add(send, 4.65 + 0.12 * k, pluck(m, 1.0, 0.32))
slam(5.0, 0.9); slam(5.5, 0.9); slam(6.0, 1.0)
[add(send, 6.61 + 0.07 * n, whoosh(0.22, False, 0.4)) for n in range(3)]; add(send, 6.95, whoosh(0.3, True, 0.3)); add(send, 7.25, whoosh(0.3, True, 0.3))
# Riser into the freeze: noise brightening plus a rising sine.
n = int(2.2 * SR); r = []; y = 0.0
for k in range(n):
    u = k / n; y += (0.02 + 0.4 * u) * (rnd.uniform(-1, 1) - y)
    r.append(y * u ** 2 * 0.55 + math.sin(TAU * (hz(50) + 400 * u * u) * k / SR) * u ** 3 * 0.12)
add(send, 6.2, r)
add(dry, 8.4, boom(1.0, 200, 30, 1.4)); add(dry, 8.4, noise_burst(0.5, 0.7, 0.09, 0.7, hp=True))    # freeze hit
add(dry, 8.74, boom(0.28, 70, 40, 0.5))                                                             # heartbeat
n = int(0.42 * SR); add(send, 8.62, [rnd.uniform(-1, 1) * (k / n) ** 2.5 * 0.5 for k in range(n)]); add(dry, 8.62, [math.sin(TAU * 40 * k / SR) * (k / n) * 0.25 for k in range(n)])
add(dry, 9.1, boom(2.2, 120, 28, 1.5)); add(dry, 9.1, [math.sin(TAU * 41 * k / SR) * min(1, k / SR / 0.5) * 0.12 * max(0, 1 - max(0, k / SR - 9.5) / 1.4) for k in range(int(10.9 * SR))]); add(send, 9.1, noise_burst(1.2, 0.05, 0.4, 0.35))           # ignition
for m in [74, 78, 81, 86]: add(send, 9.12, bell(m, 3.5, 0.16))
slam(9.2, 0.7); slam(9.7, 0.7)
[add(send, 11.6 + 0.1 * k, bell(m, 3.0, 0.16)) for k, m in enumerate([81, 86, 90])]                                             # orbit locks
add(send, 12.52, whoosh(0.22, False, 0.4)); slam(13.2, 0.7); add(send, 13.7, whoosh(0.3, True, 0.25))
add(send, 16.08, whoosh(0.22, False, 0.45)); add(send, 16.2, whoosh(1.0, True, 0.35))
slam(17.2, 0.8)
for m in [62, 69, 74, 78, 81]: add(send, 17.2, bell(m, 3.2, 0.12))
add(send, 17.75, whoosh(0.3, True, 0.25)); add(send, 18.3, pluck(86, 1.4, 0.4))

# ---- Reverb on the send (Schroeder), gentle low-pass, mix, normalise ----
def comb(sig, d, fb):
    out = [0.0] * len(sig); b = [0.0] * d; j = 0
    for i, s in enumerate(sig): y = b[j]; b[j] = s + y * fb; out[i] = y; j = (j + 1) % d
    return out
def allpass(sig, d, g):
    out = [0.0] * len(sig); b = [0.0] * d; j = 0
    for i, s in enumerate(sig): bb = b[j]; y = -s + bb; b[j] = s + bb * g; out[i] = y; j = (j + 1) % d
    return out
wet = [0.0] * N
for d, fb in [(1557, 0.83), (1617, 0.82), (1491, 0.84), (1422, 0.83)]:
    c = comb(send, d, fb)
    for i in range(N): wet[i] += c[i] * 0.25
wet = allpass(allpass(wet, 225, 0.5), 556, 0.5)
lp = 0.0
for i in range(N): lp += 0.22 * (wet[i] - lp); wet[i] = lp
off = int(SR * 0.012)
L = [dry[i] + send[i] * 0.7 + wet[i] * 0.6 for i in range(N)]
R = [dry[i] + send[i] * 0.7 + (wet[i - off] if i >= off else 0) * 0.6 for i in range(N)]
# Soft clip, then normalise to -1 dBFS (loudness is set at encode).
sc = lambda v: math.tanh(v * 2.2)
L = [sc(v) for v in L]; R = [sc(v) for v in R]
g = 0.89 / max(max(abs(v) for v in L), max(abs(v) for v in R))
with wave.open('sound.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<hh', int(L[i] * g * 32767), int(R[i] * g * 32767)) for i in range(N)))
print('sound.wav', DUR)
