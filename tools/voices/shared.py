#!/usr/bin/env python3
"""Phase 103: the answers anyone can give, voiced once per voice group.

Any of the 170 people can be asked any of the 27 shared topics (TOPICS in the game: a plain answer and an informed
one), and the town's gossips can pass on any of the rumours. Recording each answer in every person's own voice would
be about 29 hours of speech (roughly 500 MB). Instead each person is put in the voice group nearest their own casting,
and each group records each shared answer once:

  - a plain group for each Kokoro voice anyone is cast in, so a person's shared answers come in the same voice as
    their own lines (their own pitch and treatment are not kept: those would need a recording per person)
  - children, and two breathy groups (a man's and a woman's) for the Hollows and the whispering old
  - three people keep their own voice for these too, because no group would sound like them: Kaelen Vance (the glass
    ring of his arm), the Aegis (a chord), and Registrar-General Quist (a voice that reads rather than speaks)

A group only records what its members can be heard to say: the informed answer only, if every member is informed
(tier 'high'); the rumours only for groups with a gossip in them. Silent people get no group. The refusals a blunt
tone can draw ("No.") and the three polite blessings are recorded per group too, so everyone who speaks has a group,
even a person who answers every topic in their own words (a blessing can follow their own answer).

  node tools/voices/dump-dialogue.js        # writes tools/voices/dialogue.json and shared.json (needs the server)
  python3 tools/voices/shared.py            # writes the shared lines into voices/script.json and voices/groups.json
  python3 tools/voices/build.py --model DIR # renders them (incremental)
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from cast import CAST, GROUPS, OWN_SHARED  # noqa: E402

# a Kokoro voice outside the nine plain groups joins the nearest group of the same sex and speech
NEAREST = {
    'bm_george': 'bm_daniel', 'bf_emma': 'bf_isabella', 'bf_alice': 'bf_lily',
    'am_santa': 'am_fenrir', 'am_onyx': 'am_fenrir', 'am_liam': 'am_michael', 'am_puck': 'am_michael',
    'am_adam': 'am_michael', 'am_echo': 'am_michael', 'am_eric': 'am_michael',
    'af_jessica': 'af_aoede', 'af_bella': 'af_aoede', 'af_heart': 'af_nova', 'af_nicole': 'af_aoede',
    'af_sarah': 'af_aoede', 'af_kore': 'af_nova', 'af_sky': 'af_nova',
}
REFUSALS = ['Lower your voice and ask me again like a person.', 'I have nothing to say to that tone.', 'No.']   # game.js askTopic
BLESSINGS = ['Blessings of the Narrow on you.', 'Keep your voice low, friend.', 'Mind how you go.']
RUMOUR_LEAD = "I couldn't say. But I'll tell you what I heard: "

def fxname(f): return f[0] if isinstance(f, (tuple, list)) else f

def cast_key(pid, person):
    base = re.sub(r'_(wg|dw)$', '', pid)
    return next((k for k in (pid, base, person.get('sprite')) if k and k in CAST), None)

def group_of(pid, person):
    if person['profile'].get('silent'): return None
    k = cast_key(pid, person)
    if not k: return None
    if k in OWN_SHARED: return k
    c = CAST[k]; fx = {fxname(f) for f in c.get('fx', [])}
    voice = c.get('voice') or 'am_adam'
    man = voice[1] == 'm'
    if 'child' in fx: return 'shared_child'
    if 'whisper' in fx: return 'shared_breath_m' if man else 'shared_breath_f'
    v = voice if ('shared_' + voice) in GROUPS else NEAREST.get(voice)
    return 'shared_' + v if v and ('shared_' + v) in GROUPS else ('shared_bm_daniel' if man else 'shared_bf_lily')

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
    print('%d people in %d groups; %d shared lines, %d words (about %.0f minutes of speech)' % (len(groups), len(need), len(lines), words, words / 2.9 / 60))
    for g in sorted(need): print('  %-20s %3d people, %3d answers%s' % (g, by[g], len(need[g]), ', rumours' if g in gossip else ''))

if __name__ == '__main__':
    main()
