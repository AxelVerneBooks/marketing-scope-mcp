#!/usr/bin/env python3
"""marketing-scope-mcp — 400x400 logo (deterministic).

Sister mark to research-scope-mcp's scoring lens: here a *score gauge* —
five stacked bars sized to the five offer-score dimensions (20/24/20/20/16
out of 100), rising like a signal meter, over the slate/cream brand field.
Re-run to regenerate byte-similar output: python3 build_logo.py
"""
from PIL import Image, ImageDraw

S = 400
CREAM = (246, 240, 226)
INK = (31, 41, 55)
SLATE = (55, 71, 90)
GREEN = (64, 122, 96)

img = Image.new("RGB", (S, S), CREAM)
d = ImageDraw.Draw(img)

# ink border frame (matches sibling's framed look)
d.rounded_rectangle([8, 8, S - 8, S - 8], radius=28, outline=INK, width=10)

# score gauge: five bars, widths proportional to dimension maxima 20/24/20/20/16
dims = [20, 24, 20, 20, 16]
max_sum = sum(dims)
bar_h = 34
gap = 18
top = 78
left = 70
right = S - 70
for i, w in enumerate(dims):
    y = top + i * (bar_h + gap)
    full = right - left
    filled = int(full * (w / max(max_sum / 2, 1)))  # roughly half-gauge fill
    d.rounded_rectangle([left, y, right, y + bar_h], radius=12, outline=SLATE, width=4)
    if filled > bar_h:
        d.rounded_rectangle([left, y, left + filled, y + bar_h], radius=12, fill=SLATE)

# check gate at the bottom (the build_plan→check_plan gate)
gate_y = S - 108
d.ellipse([S // 2 - 52, gate_y, S // 2 + 52, gate_y + 104], outline=GREEN, width=10)
d.line([(S // 2 - 24, gate_y + 52), (S // 2 - 2, gate_y + 74)], fill=GREEN, width=12)
d.line([(S // 2 - 2, gate_y + 74), (S // 2 + 30, gate_y + 30)], fill=GREEN, width=12)

img.save("docs/logo/logo-400.png")
print("wrote docs/logo/logo-400.png")
