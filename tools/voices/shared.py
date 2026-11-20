#!/usr/bin/env python3
"""Phase 103 (groups) and Phase 104 (every person's own voice): the answers anyone can give.

Any of the people can be asked any of the 27 shared topics (TOPICS in the game: a plain answer and an informed one),
and the town's gossips can pass on any of the rumours. Since Phase 104 (the owner, 19 Nov: "give every character their
own voices") each person says them in their own casting: their Kokoro voice, speed, pitch and treatment, exactly as
their own lines. People who share one casting (the sexton in three places, Kaelen in three) share the recordings.

A person only records what they can be heard to say: the informed answer only, if they are informed (tier 'high');
the rumours only if they are a gossip. Silent people record nothing. The refusals a blunt tone can draw ("No.") and the
three polite blessings are recorded for everyone who speaks, since a blessing can follow even their own answer.

  node tools/voices/dump-dialogue.js        # writes tools/voices/dialogue.json and shared.json (needs the server)
  python3 tools/voices/shared.py            # writes the shared lines into voices/script.json and voices/groups.json
  python3 tools/voices/build.py --model DIR # renders them (incremental; the speech is made once per Kokoro voice)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from cast import CAST  # noqa: E402

REFUSALS = ['Lower your voice and ask me again like a person.', 'I have nothing to say to that tone.', 'No.']   # game.js askTopic
BLESSINGS = ['Blessings of the Narrow on you.', 'Keep your voice low, friend.', 'Mind how you go.']
RUMOUR_LEAD = "I couldn't say. But I'll tell you what I heard: "

def fxname(f): return f[0] if isinstance(f, (tuple, list)) else f

def cast_key(pid, person):
    base = re.sub(r'_(wg|dw)$', '', pid)
    return next((k for k in (pid, base, person.get('sprite')) if k and k in CAST), None)

def group_of(pid, person):
    """whose recordings answer for this person: their own casting's (None for the silent and the uncast)"""
    if person['profile'].get('silent'): return None
    return cast_key(pid, person)

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def main():
    people = json.load(open(os.path.join(HERE, 'dialogue.json')))
    shared = json.load(open(os.path.join(HERE, 'shared.json')))
    topics, rumours = shared['topics'], shared['rumours']
    groups, need, gossip = {}, {}, set()
    for pid, p in people.items():
        g = group_of(pid, p)
        if not g: continue
        own = {l['key'] for l in p['lines'] if l['kind'] == 'topic'}
        tiers = ('high',) if p.get('tier') == 'high' else ('low', 'high')
        asked = [(t, tr) for t in topics if t not in own for tr in tiers]
        groups[pid] = g
        need.setdefault(g, set()).update(asked)
        if p.get('rumour'): gossip.add(g)
    lines = []
    for g in sorted(need):
        def add(lid, text, match=None):
            l = {'id': '%s.shared.%s' % (g, lid), 'speaker': g, 'kind': 'shared', 'text': text, 'source': 'shared answers (Phase 103)', 'auto': True}
            if match: l['match'] = match
            lines.append(l)
        for t in topics:
            for tr in ('low', 'high'):
                if (t, tr) in need[g]: add('%s.%s' % (slug(t), tr), topics[t][tr])
        for i, r in enumerate(REFUSALS): add('refuse.%d' % i, r)
        for i, b in enumerate(BLESSINGS): add('bless.%d' % i, b)
        if g in gossip:
            for i, r in enumerate(rumours): add('rumour.%d' % i, RUMOUR_LEAD + r)
    sp = os.path.join(ROOT, 'voices', 'script.json')
    script = json.load(open(sp))
    script['lines'] = [l for l in script['lines'] if l.get('kind') != 'shared'] + lines
    json.dump(script, open(sp, 'w'), indent=1, ensure_ascii=False); open(sp, 'a').write('\n')
    json.dump(dict(sorted(groups.items())), open(os.path.join(ROOT, 'voices', 'groups.json'), 'w'), indent=0); open(os.path.join(ROOT, 'voices', 'groups.json'), 'a').write('\n')
    words = sum(len(l['text'].split()) for l in lines)
    by = {}
    for g in groups.values(): by[g] = by.get(g, 0) + 1
    print('%d people in %d castings; %d shared lines, %d words (about %.0f minutes of speech)' % (len(groups), len(need), len(lines), words, words / 2.9 / 60))
    for g in sorted(need): print('  %-20s %3d people, %3d answers%s' % (g, by[g], len(need[g]), ', rumours' if g in gossip else ''))

if __name__ == '__main__':
    main()
