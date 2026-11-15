#!/usr/bin/env python3
"""Writes Phase 90's record from layouts90_data.py, so the plans and the words never disagree."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from layouts90_data import PLACES, SMALL
from layouts90 import REALMNAME, REALM_HZ
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'story/Game Layer/Phase 90 - The Layouts (for ruling).md')
CITY = {'reach': 'reach', 'heights': 'heights', 'cinder': 'cinder', 'peaks': 'fortis', 'dunes': 'dunes', 'coast': 'coast',
        'woods': 'woods', 'rift': 'rift', 'middle': 'organum'}
KINDW = {'gate': 'the way in', 'lamp': 'lamp', 'room': '', 'hazard': 'hazard', 'keeper': 'the keeper', 'secret': 'secret',
         'closed': 'seen, not entered', 'vista': 'a view', 'haven': 'haven'}
WAY = {'path': '', 'climb': ' (a climb)', 'one': ' (a drop, one way)', 'short': ' (**the shortcut**, opened from the far side)'}

head = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'layouts90_head.md')).read()
o = [head]
for realm in ['reach', 'heights', 'cinder', 'peaks', 'dunes', 'coast', 'woods', 'rift', 'middle']:
    o.append(f"\n---\n\n## {REALMNAME[realm]} ({REALM_HZ[realm]})\n")
    o.append(f"![The city at walking scale](../../screenshots/p90/city-{CITY[realm]}.jpg)\n")
    o.append(f"![The great places, room by room](../../screenshots/p90/places-{realm}.jpg)\n")
    for p in [p for p in PLACES if p['realm'] == realm]:
        o.append(f"\n### {p['name']}\n*{p['kind']}; keeper: {p['keeper'] or 'none'}.*" + (f" {p['note']}" if p.get('note') else '') + "\n")
        names = {r[0]: r[1] for r in p['rooms']}
        for i, (rid, label, x, y, kind, note) in enumerate(p['rooms'], 1):
            tag = KINDW[kind]
            o.append(f"{i}. **{label}**" + (f" ({tag})" if tag else '') + (f": {note}." if note else '.'))
        ways = '; '.join(f"{names[a]} to {names[b]}{WAY[t]}" for a, b, t in p['edges'])
        o.append(f"\n*Ways:* {ways}.\n")
    sm = [s for s in SMALL if s[0] == realm]
    if sm:
        o.append("\n### Smaller places\n")
        for _, name, rooms in sm: o.append(f"- **{name}:** {rooms}.")
o.append(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'layouts90_tail.md')).read())
open(OUT, 'w').write('\n'.join(o) + '\n')
print(OUT, sum(1 for _ in open(OUT)))
