#!/usr/bin/env python3
"""
build-icon.py — the app icon: the Auticare logo with Owly in it
════════════════════════════════════════════════════════════════════════════
    .venv/Scripts/python scripts/build-icon.py    (after build-owly.py)

OUT  assets/icon.png   1024 x 1024 master (Linux, and the window icon)
     assets/icon.ico   16 - 256 px, what the Windows installer and taskbar use

The Auticare mark is a ring of navy chevrons; that ring is what makes the icon
read as Auticare even at 32 px, so it is kept whole as the frame. Owly stands
in the middle of it — the logo's inner VR head and wordmark are behind him and
would be unreadable at icon sizes anyway. A rounded tile with a soft sky
gradient sits underneath, so the icon is not lost on a dark taskbar.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "assets" / "images" / "Auticare_logo_Embright (1).png"
OWLY = ROOT / "assets" / "avatar" / "owly-happy.png"
N = 1024


def rounded_tile():
    tile = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    grad = Image.new("RGBA", (N, N))
    top, bottom = (255, 255, 255), (214, 234, 255)
    px = grad.load()
    for y in range(N):
        t = y / (N - 1)
        c = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(N):
            px[x, y] = c + (255,)
    mask = Image.new("L", (N, N), 0)
    ImageDraw.Draw(mask).rounded_rectangle((24, 24, N - 24, N - 24), radius=210, fill=255)
    tile.paste(grad, (0, 0), mask)
    # a soft drop shadow under the tile, so it has an edge on any background
    shadow = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((34, 44, N - 14, N - 6), radius=210, fill=(20, 40, 80, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    return Image.alpha_composite(shadow, tile)


def logo_ring():
    logo = Image.open(LOGO).convert("RGBA")
    # white background -> transparent, so the ring sits on the gradient
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (r, g, b, 0)
    logo = logo.crop(logo.getbbox())
    # keep only the chevron ring: the VR head and wordmark in the middle would
    # peek out round Owly. In the source the wordmark reaches 0.318 of the
    # ring's width from the centre and the chevrons start at 0.354.
    cx, cy, r = logo.width / 2, logo.height / 2, logo.width * 0.336
    hole = Image.new("L", logo.size, 255)
    ImageDraw.Draw(hole).ellipse((cx - r, cy - r, cx + r, cy + r), fill=0)
    alpha = Image.composite(logo.split()[3], Image.new("L", logo.size, 0), hole)
    logo.putalpha(alpha)
    side = 880
    return logo.resize((side, round(logo.height * side / logo.width)), Image.LANCZOS)


def main():
    icon = rounded_tile()
    ring = logo_ring()
    icon.alpha_composite(ring, ((N - ring.width) // 2, (N - ring.height) // 2))

    owly = Image.open(OWLY).convert("RGBA")
    h = 640
    owly = owly.resize((round(owly.width * h / owly.height), h), Image.LANCZOS)
    # a white halo behind him, so his outline stays clear of the navy chevrons
    halo = Image.new("RGBA", (N, N), (0, 0, 0, 0))
    ox, oy = (N - owly.width) // 2 + 10, (N - h) // 2 + 40
    halo.paste((255, 255, 255, 235), (ox, oy), owly.split()[3])
    halo = halo.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(6))
    icon = Image.alpha_composite(icon, halo)
    icon.alpha_composite(owly, (ox, oy))

    out_png = ROOT / "assets" / "icon.png"
    icon.save(out_png, optimize=True)
    icon.save(ROOT / "assets" / "icon.ico",
              sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("assets/icon.png 1024x1024, assets/icon.ico 16-256")


if __name__ == "__main__":
    main()
