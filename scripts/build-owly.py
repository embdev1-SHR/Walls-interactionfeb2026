#!/usr/bin/env python3
"""
build-owly.py — cut Owly out of the supplied artwork, once, at build time
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/build-owly.py

IN   assets/avatar/*.png        the four supplied poses, 1277 x 1232, most on a
                                white background (one with a rough alpha)
OUT  assets/avatar/owly-*.png   transparent, 420 px tall, ~100 KB each —
                                what js/guide.js shows

HOW THE BACKGROUND COMES OFF
    Every pose is first flattened onto white, so all four go through the same
    path (the one supplied with transparency had a coloured fringe round its
    shadow). Then the background is flood-filled IN FROM THE EDGES across pale,
    unsaturated pixels only — so the cream face and belly, which are pale too
    but enclosed by brown feathers, can never be reached. Inside that region:
      · white becomes fully transparent
      · the grey floor shadow becomes a soft transparent black, so Owly still
        stands on something wherever he is placed
      · pixels on the boundary keep partial alpha and have the white "un-mixed"
        out of their colour, so there is no pale halo on a dark background.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from collections import deque

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "avatar"
POSES = {
    "happy":   "Cheerful Owl Scholar with Books.png",
    "cheer":   "Cheerful Academic Owl Celebration.png",
    "curious": "Curious Owl with Question Marks.png",
    "sad":     "Sad Owl in Round Glasses.png",
}
HEIGHT = 420


def background_mask(rgb):
    """Pale, unsaturated pixels connected to the image border."""
    r, g, b = (rgb[..., i].astype(np.int32) for i in range(3))   # int16 overflows: 254 * 299
    lum = (r * 299 + g * 587 + b * 114) // 1000
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    passable = (sat < 26) & (lum > 150)
    h, w = passable.shape
    seen = np.zeros_like(passable)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and passable[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen, lum


def dilate(mask, n):
    out = mask.copy()
    for _ in range(n):
        m = out.copy()
        m[1:, :] |= out[:-1, :]; m[:-1, :] |= out[1:, :]
        m[:, 1:] |= out[:, :-1]; m[:, :-1] |= out[:, 1:]
        out = m
    return out


def cut(path):
    im = Image.open(path).convert("RGBA")
    white = Image.new("RGBA", im.size, (255, 255, 255, 255))
    rgb = np.asarray(Image.alpha_composite(white, im).convert("RGB")).astype(np.float32)

    bg, lum = background_mask(rgb.astype(np.uint8))
    alpha = np.ones(bg.shape, np.float32)
    out = rgb.copy()

    # background: transparent, except the floor shadow, kept as soft black
    shade = np.clip((248.0 - lum) / 120.0, 0, 1) * 0.55
    alpha[bg] = shade[bg]
    out[bg] = 0.0

    # the boundary band just outside the background: partial alpha from how
    # far each pixel is from white, then remove the white that was mixed in
    band = dilate(bg, 2) & ~bg
    whiteness = rgb.min(axis=2)
    a = np.clip((255.0 - whiteness) / 70.0, 0.15, 1.0)
    alpha[band] = np.minimum(alpha[band], a[band])
    ab = alpha[band][:, None]
    out[band] = np.clip((rgb[band] - 255.0 * (1 - ab)) / np.maximum(ab, 1e-3), 0, 255)

    rgba = np.dstack([out, alpha * 255.0]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    img = img.crop(img.getbbox())                       # trim empty margins
    w = round(img.width * HEIGHT / img.height)
    return img.resize((w, HEIGHT), Image.LANCZOS)


def main():
    for pose, name in POSES.items():
        img = cut(SRC / name)
        dest = SRC / f"owly-{pose}.png"
        img.save(dest, optimize=True)
        print(f"owly-{pose}.png  {img.width}x{img.height}  {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
