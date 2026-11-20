#!/usr/bin/env python3
"""Add every person's own dialogue (greetings and topic answers) to voices/script.json, and cast anyone not yet cast.

  node tools/voices/dump-dialogue.js        # -> tools/voices/dialogue.json (from the running game)
  python3 tools/voices/extract.py           # -> voices/script.json (lines marked "auto"), tools/voices/cast_auto.json
  python3 tools/voices/build.py --model DIR # renders what is new

The owner, 18 Nov 2026: "any time there is dialogue it should be read aloud in the best possible voices available",
then "continue using Kokoro for now".

What is spoken, by the rules the hand-made script already followed (its "skipped" list):
  - stage directions are not: a line that opens on He / She / It / Its / They / His / Her, or a "Name: who they are"
    label, or an ellipsis and nothing else;
  - where narration and quoted speech are mixed, only the quotes are spoken, unless the words outside the quotes are
    themselves speech (they say I, me, my, we, you: "My mother said 'salt at the end'" is one spoken line);
  - a silent character is not voiced, except where the game gives the words to someone who speaks for them (General
    Ward's iron-cant is said aloud by Ninety-Four);
  - a line with a {placeholder} is filled in play and stays unvoiced; so does any topic that is not plain text.
Hand-written lines already in the script are never touched; a line it already has (same speaker, same words) is not
added twice. Lines this tool adds carry "auto": true and are replaced wholesale each time it runs.

Casting (tools/voices/cast_auto.json; an entry in cast.py always wins): from the speaker's profile in js/voices.js.
A woman's voice from about 165 Hz up, a child's from about 280 Hz; British or American by the person's hash (the Reach
is mixed); pitch from how far the profile sits from the voice's own; gravel, breath and bell from the profile's style.
Nothing is random: the same dialogue always casts the same.
"""
import hashlib, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))

# who says a silent character's words aloud
PROXY = {'p100_ward': 'p100_94'}
# speakers whose base id is not their NPC id (the game's VOICE_ACT checks the base, js/voice-acting.js baseOf)
def base_of(i): return re.sub(r'_(wg|dw)$', '', i)

OPENER = re.compile(r"^(he|she|it|its|they|their|his|her|the cat|the dog)\b", re.I)
FIRST = re.compile(r"\b(i|i'm|i've|i'd|i'll|me|my|mine|myself|we|we're|we've|us|our|ours)\b", re.I)
STAGE = re.compile(r"\b(looks?|watch(es)?|waits?|writes?|nods?|shrugs?|turns?|smiles?|stares?|rubs?|underlines?|unrolls?|decides?|"
                   r"measures?|lifts?|holds?|sings?|hums?|chimes?|does not|doesn't|did not|has not moved|is sitting|is listening|"
                   r"goes back|walks past|has no voice|says nothing|keeps? (on )?(digging|singing|working)|stops?|glances?|"
                   r"frowns?|sighs?|points?|taps?|strikes?|knocks?|raps?|beckons?|ignores?)\b", re.I)
LABEL = re.compile(r"^(?!Entry\b|Note\b|Stage\b)(The )?[A-Z][\w'’-]*(?: [A-Z][\w'’-]*)*: (the |a |an |[a-z0-9])")   # "Solenne: the tall woman ..."

CAPTION = re.compile(r"^[A-Z][\w'’-]+(?: [A-Z][\w'’-]+)+, (with|in|carrying|holding|at|by)\b")   # "Dorran Sedge, with his lantern ..."

def narration(t):
    """A stage direction: it opens on the person in the third person, says nothing in the first, and does something."""
    if not OPENER.match(t) or FIRST.search(t): return False
    head = ' '.join(t.split()[:9])
    return bool(STAGE.search(head)) or t.lower().startswith(('the cat', 'the dog'))
QUOTE = re.compile(r'[“"]([^”"]+)[”"]')

def clean(t):
    t = re.sub(r'<br\s*/?>', ' ', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('&nbsp;', ' ').replace('&amp;', '&')
    return re.sub(r'\s+', ' ', t).strip()

def norm(s):
    s = s.lower().replace('’', '').replace("'", '')
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()

def spoken(text):
    """(what is said aloud, the run of it that is shown on screen) or (None, reason)."""
    t = clean(text)
    if '{' in t: return None, 'filled in play'
    if not re.search(r'[A-Za-z]', t): return None, 'no words'
    quotes = [q.strip() for q in QUOTE.findall(t) if re.search(r'[A-Za-z]', q)]
    if quotes:
        outside = QUOTE.sub(' ', t)
        outside = re.sub(r'\([^)]*\)', ' ', outside)
        if FIRST.search(outside) and not narration(outside.strip()):
            say = re.sub(r'\([^)]*\)', ' ', t)          # speech that quotes someone: all of it, asides dropped
            say = re.sub(r'\s+', ' ', say).strip()
            return (say, max(re.split(r'\s*\([^)]*\)\s*', t), key=len).strip()), None
        say = ' '.join(q.strip(' —–-') for q in quotes)
        return (say, max(quotes, key=len)), None
    if t.startswith('(') and t.endswith(')'): return None, 'stage direction'
    if narration(t) or ((LABEL.match(t) or CAPTION.match(t)) and not FIRST.search(t)): return None, 'stage direction'
    say = re.sub(r'\s*\([^)]*\)\s*', ' ', t).strip()
    if not re.search(r'[A-Za-z]', say): return None, 'no words'
    return (say, max(re.split(r'\s*\([^)]*\)\s*', t), key=len).strip()), None

def h(s, n=6): return hashlib.sha1(s.encode('utf-8')).hexdigest()[:n]

POOL = {
    ('m', 'gb'): ['bm_lewis', 'bm_george', 'bm_daniel', 'bm_fable'],
    ('m', 'us'): ['am_adam', 'am_michael', 'am_eric', 'am_liam', 'am_onyx', 'am_echo', 'am_puck', 'am_fenrir', 'am_santa'],
    ('f', 'gb'): ['bf_alice', 'bf_emma', 'bf_isabella', 'bf_lily'],
    ('f', 'us'): ['af_heart', 'af_sarah', 'af_nicole', 'af_kore', 'af_bella', 'af_jessica', 'af_nova', 'af_river', 'af_aoede'],
    ('c', 'us'): ['af_sky', 'af_nova'],
}
WOMAN = re.compile(r'(woman|wife|girl|mother|sister|lyra|hetty|orla|nell|bettany|ada|vosk|sable|mags|wren)', re.I)
MAN = re.compile(r'(townsman|man\b|hob|kaelen|harrow|vane|rooke|aldric|tobiah|tam|legionnaire|proctor)', re.I)
def auto_cast(sp, prof, look=''):
    f0 = float(prof.get('f0') or 120); fs = float(prof.get('fs') or 1.0); style = prof.get('style') or 'human'
    # sex from the person's portrait or painting where the game has one; otherwise from the profile's pitch
    sex = 'c' if f0 >= 280 or re.search(r'\bpim\b', look) else 'f' if WOMAN.search(look) else 'm' if MAN.search(look) else 'f' if f0 >= 185 else 'm'
    k = int(h(sp, 8), 16)
    accent = 'us' if sex == 'c' else ('gb' if k % 2 == 0 else 'us')
    pool = POOL[(sex, accent)]
    voice = pool[(k >> 4) % len(pool)]
    centre = 300 if sex == 'c' else 205 if sex == 'f' else 120
    pitch = max(-5, min(3, round((f0 - centre) / (14 if sex == 'm' else 18))))
    if sex == 'c': pitch = max(pitch, 2)
    if sex == 'm': pitch = min(pitch, 1)            # a man pitched further up sounds strained, not young
    speed = round(max(0.78, min(0.96, 0.86 + (fs - 1.0) * 0.6)), 2)   # matched to the hand-cast lines' pace (about 2.9 words a second)
    fx = []
    if sex == 'c': fx.append('child')
    if style == 'gravel': fx.append('gravel')
    if re.search(r'\bhollow\b', look): fx.append(('whisper', 0.75))   # the Hollows, as cast.py's own 'hollow'
    elif style == 'breathy': fx.append(('whisper', 0.35))
    if style == 'brass': fx.append('bell')
    if style == 'chord': fx.append('stack')
    fx.append('room')
    return dict(voice=voice, speed=speed, pitch=pitch, lang='en-gb' if voice[0] == 'b' else 'en-us', fx=fx)

def main():
    people = json.load(open(os.path.join(HERE, 'dialogue.json')))
    sp_path = os.path.join(ROOT, 'voices', 'script.json')
    script = json.load(open(sp_path))
    hand = [l for l in script['lines'] if not l.get('auto') or l.get('kind') == 'shared']   # shared lines are shared.py's
    have = {(l['speaker'], norm(l.get('text') or '')) for l in hand}
    have_any = {norm(l.get('text') or '') for l in hand}
    ruled_out = {norm(x.get('original') or '') for x in script.get('skipped', [])}   # lines the hand-made script already ruled unspoken
    import importlib.util
    spec = importlib.util.spec_from_file_location('cast_hand', os.path.join(HERE, 'cast.py'))
    cast_mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(cast_mod)
    hand_cast = getattr(cast_mod, 'HAND_CAST', cast_mod.CAST)
    added, skipped, auto, seen = [], {}, {}, set()
    # one person, one voice: ids that share a name (Hesper and Hesper's second post, the sexton in three places) are cast once
    def who(i):
        # a person's own name, with their portrait: "A trooper of the Watch" is four people, not one; nor is "One of the mast-crew"
        nm = re.split(r',', (people.get(i) or {}).get('name', '') or '')[0].strip()
        if not nm or re.match(r'(?i)(a|an|one of|some)\b', nm): return ''
        return nm.lower() + '|' + (people.get(i) or {}).get('portrait', '')
    by_name = {}
    for i in sorted(people):                      # the hand-cast first: a person met again under another id keeps their voice
        if base_of(i) in hand_cast and who(i): by_name.setdefault(who(i), base_of(i))
    for nid in sorted(people):
        p = people[nid]
        speaker_id = PROXY.get(nid, nid)
        prof = people.get(speaker_id, p)['profile']
        if prof.get('silent') and nid not in PROXY:
            skipped['silent'] = skipped.get('silent', 0) + len(p['lines']); continue
        sp = base_of(speaker_id)
        for ln in p['lines']:
            r, why = spoken(ln['text'])
            if not r: skipped[why] = skipped.get(why, 0) + 1; continue
            say, shown = r
            n = norm(say)
            if len(n) < 2: skipped['no words'] = skipped.get('no words', 0) + 1; continue
            if norm(ln['text']) in ruled_out or n in ruled_out: skipped['ruled out by hand'] = skipped.get('ruled out by hand', 0) + 1; continue
            if (sp, n) in have or (sp, n) in seen: continue
            if n in have_any and (sp, n) not in have:   # the same words already recorded by someone else: theirs plays
                pass
            seen.add((sp, n))
            kind = 'greet' if ln['kind'] == 'greet' else 'topic'
            line = {'id': '%s.%s.%s' % (sp, 'g' if kind == 'greet' else 't', h(sp + '|' + n)), 'speaker': sp, 'kind': kind,
                    'text': say, 'auto': True, 'source': 'NPCS.%s.%s%s' % (nid, 'greet.' if kind == 'greet' else 'topics.', ln['key'])}
            if norm(shown) != n: line['match'] = shown
            if nid in PROXY: line['for'] = nid
            added.append(line)
            if sp not in hand_cast and sp not in auto:
                nm = who(speaker_id)
                if nm and nm in by_name: auto[sp] = dict(auto[by_name[nm]]) if by_name[nm] in auto else dict(hand_cast[by_name[nm]])
                else: auto[sp] = auto_cast(sp, prof, ' '.join([people.get(speaker_id, p).get('portrait', ''), people.get(speaker_id, p).get('sprite', '')]))
            if sp not in by_name.values(): by_name.setdefault(who(speaker_id), sp)
    script['lines'] = hand + added
    json.dump(script, open(sp_path, 'w'), indent=1, ensure_ascii=False); open(sp_path, 'a').write('\n')
    json.dump(auto, open(os.path.join(HERE, 'cast_auto.json'), 'w'), indent=1, sort_keys=True)
    words = sum(len(l['text'].split()) for l in added)
    print('hand lines %d, auto lines %d (%d words, about %d min), new voices %d; not spoken: %s' % (len(hand), len(added), words, round(words / 150), len(auto), skipped))

if __name__ == '__main__':
    main()
