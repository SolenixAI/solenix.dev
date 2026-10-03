#!/usr/bin/env python3
"""Banned words, read from their source of truth.

Takes the first "- **Avoid:**" list in design/DESIGN.md (the Voice section)
and reports every one that appears in the visible text of the pages given as
arguments. Items that describe a class rather than name a phrase ("any
scarcity", "or any invented metric") are judgment calls and are skipped;
"(say you)" style notes are dropped. Exit 1 when anything is found.
"""
import html
import re
import sys
from html.parser import HTMLParser
from pathlib import Path


def banned_phrases(design_md: str) -> list[str]:
    line = next(l for l in design_md.splitlines() if l.startswith("- **Avoid:**"))
    items = line.split(":**", 1)[1].split(",")
    out = []
    for raw in items:
        item = re.sub(r"\(.*?\)", "", raw).split("—")[0]
        item = re.sub(r"\s+or\s+any\b.*$", "", item).strip()
        if not item or re.search(r"\bany\b", item):
            continue
        # "operational / degraded" is two words; "AI replaces your lawyer / accountant"
        # is one phrase with its last word swapped.
        first, *alts = [p.strip() for p in item.split(" / ")]
        out.append(first)
        for alt in alts:
            out.append(alt if " " not in first or " " in alt else first.rsplit(" ", 1)[0] + " " + alt)
    return out


class Visible(HTMLParser):
    """Text a visitor can read: no scripts, styles, comments or attributes."""

    def __init__(self):
        super().__init__()
        self.skip = 0
        self.text: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "template", "svg"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "template", "svg") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)


def visible_text(page: str) -> str:
    p = Visible()
    p.feed(page)
    return html.unescape(" ".join(p.text))


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    phrases = banned_phrases((root / "design/DESIGN.md").read_text())
    found = 0
    for name in sys.argv[1:]:
        text = re.sub(r"\s+", " ", visible_text((root / name).read_text()))
        for phrase in phrases:
            pattern = r"(?<![\w-])" + re.escape(phrase).replace(r"\ ", r"\s+") + r"(?![\w-])"
            for m in re.finditer(pattern, text, re.IGNORECASE):
                found += 1
                ctx = text[max(0, m.start() - 30) : m.end() + 30].strip()
                print(f'check: {name}: banned word "{phrase}" (design/DESIGN.md Voice): …{ctx}…')
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
