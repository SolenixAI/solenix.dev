#!/usr/bin/env python3
"""SolenixAI brand assets, generated from one set of tokens (matches index.html).

Run: python3 brand/build.py  -> writes brand/out/*.svg
Assets: logo mark, org avatar, org banner (light/dark), Jager's profile banner (light/dark).
"""
import pathlib

OUT = pathlib.Path(__file__).parent / "out"
FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif"

# Same values as the :root tokens in index.html
T = {
    "dark":  dict(bg1="#0b0d12", bg2="#11141b", line="#1e222b", text="#f4f2ee", muted="#a39e97",
                  accent="#f59e0b", sun1="#fbbf24", sun2="#f97316", ring="#f59e0b"),
    "light": dict(bg1="#fbfaf8", bg2="#f3f1ed", line="#e4e0d9", text="#1c1917", muted="#57534e",
                  accent="#c2410c", sun1="#fbbf24", sun2="#ea580c", ring="#ea580c"),
}


def mark(c, x, y, s, uid, ring_w=1.5):
    """The logo: sun + one orbit ring + one agent dot. 32-unit grid scaled by s/32."""
    k = s / 32
    return (f'<g transform="translate({x} {y}) scale({k})">'
            f'<circle cx="16" cy="16" r="14" fill="none" stroke="{c["ring"]}" stroke-opacity=".45" stroke-width="{ring_w}"/>'
            f'<circle cx="16" cy="16" r="8" fill="url(#sun{uid})"/>'
            f'<circle cx="27" cy="9" r="2.2" fill="{c["ring"]}"/></g>')


def defs(c, uid):
    return (f'<defs>'
            f'<linearGradient id="bg{uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c["bg1"]}"/><stop offset="1" stop-color="{c["bg2"]}"/></linearGradient>'
            f'<radialGradient id="sun{uid}" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="{c["sun1"]}"/><stop offset="1" stop-color="{c["sun2"]}"/></radialGradient>'
            f'<radialGradient id="glow{uid}" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="{c["sun2"]}" stop-opacity=".22"/><stop offset="1" stop-color="{c["sun2"]}" stop-opacity="0"/></radialGradient>'
            f'<clipPath id="card{uid}"><rect x="1" y="1" width="1198" height="338" rx="24"/></clipPath>'
            f'</defs>')


def banner(mode, eyebrow, title, line1, line2, desc):
    c, u = T[mode], mode[0]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="340" viewBox="0 0 1200 340" role="img" aria-label="{title}. {desc}">
  {defs(c, u)}
  <rect x="1" y="1" width="1198" height="338" rx="24" fill="url(#bg{u})" stroke="{c["line"]}" stroke-width="2"/>
  <g clip-path="url(#card{u})">
    <circle cx="1030" cy="400" r="270" fill="url(#glow{u})"/>
    <g fill="none" stroke="{c["ring"]}" stroke-opacity=".16" stroke-width="2">
      <circle cx="1030" cy="400" r="215"/><circle cx="1030" cy="400" r="280"/><circle cx="1030" cy="400" r="345"/>
    </g>
    <circle cx="1030" cy="400" r="150" fill="url(#sun{u})"/>
    <g fill="{c["ring"]}"><circle cx="829" cy="321" r="6"/><circle cx="1180" cy="140" r="5"/><circle cx="880" cy="104" r="4"/></g>
  </g>
  {mark(c, 70, 66, 30, u)}
  <g font-family="{FONT}">
    <text x="112" y="88" font-size="19" font-weight="600" letter-spacing="3" fill="{c["accent"]}">{eyebrow}</text>
    <text x="66" y="182" font-size="84" font-weight="700" letter-spacing="-2.5" fill="{c["text"]}">{title}</text>
    <text x="70" y="240" font-size="31" fill="{c["muted"]}">{line1}</text>
    <text x="70" y="283" font-size="31" fill="{c["muted"]}">{line2}</text>
  </g>
</svg>
'''


def avatar():
    """Org avatar: the mark on the dark background, full bleed (GitHub rounds the corners)."""
    c = T["dark"]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c["bg1"]}"/><stop offset="1" stop-color="{c["bg2"]}"/></linearGradient>
    <radialGradient id="sunA" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="{c["sun1"]}"/><stop offset="1" stop-color="{c["sun2"]}"/></radialGradient>
    <radialGradient id="glowA" cx=".5" cy=".5" r=".5"><stop offset=".4" stop-color="{c["sun2"]}" stop-opacity=".28"/><stop offset="1" stop-color="{c["sun2"]}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgA)"/>
  <circle cx="256" cy="256" r="230" fill="url(#glowA)"/>
  {mark(c, 56, 56, 400, "A", ring_w=0.8)}
</svg>
'''


def logo(mode):
    c = T[mode]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">'
            f'<defs><radialGradient id="sunL" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="{c["sun1"]}"/><stop offset="1" stop-color="{c["sun2"]}"/></radialGradient></defs>'
            f'{mark(c, 0, 0, 32, "L")}</svg>\n')


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    files = {
        "logo-dark.svg": logo("dark"),
        "logo-light.svg": logo("light"),
        "avatar.svg": avatar(),
    }
    for m in ("dark", "light"):
        files[f"banner-org-{m}.svg"] = banner(m, "AI · WEBSITES · OPEN SOURCE", "SolenixAI",
            "AI and websites for small businesses", "Open-source tools that make AI agents easy to set up",
            "AI and websites for small businesses. Open-source tools that make AI agents easy to set up.")
        files[f"banner-jager-{m}.svg"] = banner(m, "FOUNDER · SOLENIXAI", "Jager Cooper",
            "AI and websites for small businesses", "Open-source tools for AI agents",
            "Founder of SolenixAI. AI and websites for small businesses, open-source tools for AI agents.")
    for name, svg in files.items():
        (OUT / name).write_text(svg)
        print(f"{name}: {len(svg.encode())} bytes")
