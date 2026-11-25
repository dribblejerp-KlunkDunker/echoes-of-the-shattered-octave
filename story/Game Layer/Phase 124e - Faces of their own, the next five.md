# Phase 124e: Faces of their own, the next five

25 November 2026. On the owner's "merge and proceed" (5:38 pm). Five more people have painted portraits of their own, made as Phase 124d's were (the owner's Hugging Face, the Z-Image-Turbo Space, through its own page; the fixed prompt in `tools/faces/TEMPLATE.txt`). 241 NPC entries still borrow (258 before Phase 124c; 17 served now).

- **The allowance** stopped after eight pictures today (nine were asked for). Two were second tries, and Bethan Marl's second try was the one refused.
- **Held: Bethan Marl.** Her one picture gave her black rings round the eyes that read as bruises, from the words "shadowed by sleepless nights". Nothing says she is hurt, so she is not in the game yet; she is first tomorrow with the gentler wording.
- **A lesson for the prompts:** "shadows" and "purple" round the eyes come out as bruises. Say "tired" instead.

## The five

| Person | NPC id | Portrait | Seed |
|---|---|---|---|
| Garrow Finch, quarry hauler | `p11_dicer` (js/tavern11.js) | `img/p_own_garrow.jpg` | 334623 |
| Nessa Tolliver, ferrywoman | `p15_dealer` (js/hearth15.js) | `img/p_own_nessa.jpg` | 601547 |
| Agnes Tull, the baker's wife | `p29_agnes` (js/thin29.js) | `img/p_own_agnes.jpg` | 831856 |
| Ambrose Vettle, chandler | `p29_ambrose` (js/thin29.js) | `img/p_own_ambrose.jpg` | 628004 |
| Sim Fletch, tannery hand | `p29_sim` (js/thin29.js) | `img/p_own_sim.jpg` | 103685 |

## Each one: the source, and the subject as worded

### Garrow Finch, quarry hauler
- **Source:** Not in the books. He came out bearded where the brief said stubble: kept.
- **Subject as worded:** a thick-necked quarry hauler in his early forties, shoulders hunched into a canvas collar. Cropped black hair with fine grey quarry dust still in it. A flattened nose broken once, black stubble, quick dark eyes that watch the hand rather than the face, and a half-grin that never reaches the eyes. A loose canvas coat with a bulging lapel.

### Nessa Tolliver, ferrywoman
- **Source:** Not in the books (Nessa Lark of Book Three is another woman). The reader's brief had her id wrong (`rounds`, which is her card table's text, not a person); `test/own124` caught it.
- **Subject as worded:** a weathered river ferrywoman in her early forties, one eyebrow raised. Dark black-brown hair in one thick, wet-looking braid over her left shoulder. Sun-and-wind-reddened cheeks, light hazel eyes narrowed as if reading a hand across a table. A stiff oilskin collar turned up over a salt-stained shirt.

### Agnes Tull, the baker's wife
- **Source:** Book One: the baker's wife "punched the dough down every hour through the night and wept with exhaustion into the flour" (MS l. 308); "floured to the elbow" (l. 652). Her name is the game's. The first try gave her purple rings that read as bruises, which nothing in the book or game says; the prompt was reworded to tears and tired eyes and made again. No flour shows on her face at this size.
- **Subject as worded:** a worn-out baker's wife in her early fifties, lined and tired, who has been crying. Dishwater-blonde hair in a loose knot, half undone, grey at the roots. Tired, slightly reddened eyelids, a small smile put on out of habit, a dusting of white flour on her cheeks with two clean tear tracks through it, and a faint streak of flour on her forehead. A plain brown bodice.

### Ambrose Vettle, chandler
- **Source:** Not in the books. The first capture of him failed (a grey screen), so he was made twice; the second is kept.
- **Subject as worded:** a narrow, tight-lipped village chandler in his early sixties, lined and pinched. Sparse grey hair combed in thin strands across a freckled scalp. A long nose, pinched cheeks, sharp light eyes. A tallow-stained brown apron over a collarless shirt, and a stub of unlit candle tucked behind one ear.

### Sim Fletch, tannery hand
- **Source:** Not in the books by name (the tannery men are, MS l. 2932). The wool in his ear is the game's.
- **Subject as worded:** a lanky young tannery hand of twenty-five, shoulders drawn up as if against a noise. Sandy hair cropped short and uneven, flecked with lime dust. A long freckled face, anxious pale-green eyes, a tuft of grey wool pushed into one ear. A bleached canvas smock with the neck stained green-brown.

## What changed in the game

- `js/faces124.js`: five rows added to `FACES124.OWN`; five files `img/p_own_*.jpg`; `sw.js` rebuilt. No new in-game words.
- `tools/faces/`: the prompts for every face still to paint (`PROMPTS.tsv`), the fixed wording, and the record of those painted with their seeds (`MANIFEST.tsv`); see `Phase 124 - the portrait prompts, one for each face still to paint.md`.

## Tests

`test/own124.test.js` was taught the five first and failed on five checks; with the rows and files in, 11 of 11. It also caught the wrong id for Nessa Tolliver.

## Pictures

`screenshots/p124e-own.jpg`.
