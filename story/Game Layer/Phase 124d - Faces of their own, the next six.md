# Phase 124d: Faces of their own, the next six, and how they are made now

24 November 2026. The owner's word at 4:50 pm, on seeing the first picture from the new tool beside the three he had approved: "yes I like the looks so far". Six more people have painted portraits of their own; 246 NPC entries still borrow (258 before Phase 124c; 12 served now).

## How they are made (changed from Phase 124c)

Phase 124c's three came from Canva's picture tool, which then ran out of credit. These six were made on the owner's own Hugging Face account, on the Space `mcp-tools/Z-Image-Turbo` (1024 by 1024, 8 steps, time shift 3), driven through its own page in the owner's Chrome. The Hugging Face connector could not be used: the version in Claude's gallery has picture-making switched off (Hugging Face's staff say so in their feedback thread), and the owner's Hugging Face settings were already right (Dynamic Spaces on, the Space added).

- **The allowance.** The free account stopped after nine pictures in one day ("You've hit your daily ZeroGPU quota"; the page says PRO members get eight times more). At that rate the 100 or so faces and pools left take about twelve days on the free account. Whether to pay for PRO is the owner's decision.
- **The picture is a screen capture** of the Space's result (573 by 573), with a strip cut from the top where the page draws three buttons, brought down to 96 by 96 (`img/p_own_<name>.jpg`, JPEG quality 88). Good enough at the game's size; the full 1024 picture is not kept.
- **Ages run young.** The tool paints people younger than the words say. Asking for "fifty-one" gave a woman of about forty, so Ada Pellow's prompt says "late fifties" to get the book's fifty-one. Each prompt below is the wording that was used, not the age that was wanted.
- **The seed.** Three were made with the seed fixed at 42 and came out looking like kin, so the random seed was turned back on and each seed is read off the page and written down here.

## The prompt

Every prompt is this, with the subject put in:

> Close-up head-and-shoulders bust portrait, a muted realistic oil painting for a grim low-fantasy role-playing game. The face fills the upper two thirds of the picture, cropped at the upper chest. Subject: <SUBJECT> Facing the viewer, centred. Plain, nearly black, dark warm brown background with nothing in it. Soft light from the upper left, earthy muted colours, soft painterly brushwork. No text, no lettering, no border, no frame.

## The six

| Person | NPC id(s) | Portrait | Seed |
|---|---|---|---|
| Perpetua Lisle, who robes the pilgrims | `p95_perpetua` (js/pilgrim95.js) | `img/p_own_perpetua.jpg` | 938371 |
| Ada Pellow of Cooper's Row | `p9_ada` (js/sidequests.js) | `img/p_own_ada.jpg` | 42 |
| Marrit Pell, the Governor's housekeeper | `p46_marrit` (js/governor46.js) | `img/p_own_marrit.jpg` | 42 |
| Orrin Pale, sexton of Oakhaven | `orrin` (js/data.js), `p29_sexton` (js/thin29.js), `p16h_orrin` (js/heist16.js): one man, three ids, two figures, so three rows | `img/p_own_orrin.jpg` | 42 |
| Brenna Loft, the festival's baker | `p12_baker` (js/festivals12.js) | `img/p_own_brenna.jpg` | 890744 |
| Dunna Sedge, sheaf-binder | `p12_dunna` (js/festivals12.js) | `img/p_own_dunna.jpg` | 832294 |

## Each one: the source, and the subject as worded

### Perpetua Lisle, who robes the pilgrims
- **Source:** Not in the books (the game's own; the name is [PROPOSED] in js/pilgrim95.js). The robes are canon (Book Two, "in their white robes, up the Pilgrim Chain"). The game: "sixty, upright, in the Tiers' black with her sleeves rolled, a white robe folded over her arm".
- **Subject as worded:** a spare, upright old woman of sixty-five, deeply lined face, wrinkles at the eyes and mouth, silver-white hair pinned flat under a plain black cap. A long, fine-boned face, grey eyes that measure you, a pursed, patient mouth. A plain black dress, a tailor's measuring tape of knotted white cord round her neck, a fold of white linen over her left shoulder.

### Ada Pellow of Cooper's Row
- **Source:** Book One ch. 11 (`Chapters/11 The Greening.md:198`): "She was fifty-one years old." Painted at the book's age, not the game line's "seventy" (that line is still to be corrected, with its voice, in Phase 125b). The split reed the reader's brief gave her is left out: a bust this size cannot show it.
- **Subject as worded:** a thin country woman in her late fifties, worn by a hard year, lined weathered face, holding herself very straight. Iron-brown hair gone grey at the temples, parted flat under a plain white headscarf tied under the chin. Deeply lined forehead, level grey eyes a little too dry, mouth closed against being pitied. A dark wool bodice buttoned to the throat.

### Marrit Pell, the Governor's housekeeper
- **Source:** Not in the books by name ([PROPOSED] in js/governor46.js). She bathed Kaelen as a boy, so she is old.
- **Subject as worded:** a small, upright old housekeeper of seventy, white hair scraped back under a starched white linen cap tied with a bow. Narrow, scrubbed, wrinkled face, a firm thin mouth, pale blue eyes. A plain dark gown with a grey woollen collar, and a heavy brass ring of keys pinned at her breast.

### Orrin Pale, sexton of Oakhaven
- **Source:** The books have an unnamed Oakhaven sexton (Book One ch. 3, ch. 11, "The sexton's salt lay in white drifts along the paths"); the name is the game's [PROPOSED]. He came out with a day's stubble where the brief said shaven: kept.
- **Subject as worded:** a gaunt village sexton, a man in his early sixties, clean-shaven with a small nick on the jaw. Thin, flat hair the colour of old salt. Pale lashes, pale watchful downcast eyes, deep lines either side of a closed mouth. A black coat buttoned up to a worn white collar, a heavy ring of iron keys hanging at his chest.

### Brenna Loft, the festival's baker
- **Source:** Not in the books (the book's baker's wife is the game's Agnes Tull, another woman). No age is stated anywhere; she came out about thirty, younger than the brief's guess of forty-five. Kept, and noted for the owner.
- **Subject as worded:** a round-faced, quick-eyed village baker, a woman of fifty, a smear of white flour along one cheekbone. Bright chestnut hair bundled under a flour-dusted linen cap, a few curled strands escaped. A broad, easy mouth halfway to a joke, dimples, a warm half-smile. A clean flour-dusted apron over a plain bodice.

### Dunna Sedge, sheaf-binder
- **Source:** Not in the books.
- **Subject as worded:** a lean farm woman of forty, a sheaf-binder, in grey light before dawn. A dark wool hood pulled up, hiding her hair except one pale-straw wisp at the temple, a single ear of cut wheat tucked into the hood's edge. High cheekbones, wind-chapped skin, wide unblinking grey eyes, lips just parted as if whispering. A coarse brown cloak clasped at the throat.

## What changed in the game

- `js/faces124.js` (`?v=5`): eight rows added to `FACES124.OWN` (Orrin Pale has three). Nothing else changed; the switch "Faces of their own" (Options, Graphics; off in Original) covers them as it covers the first three.
- `img/p_own_perpetua.jpg`, `p_own_ada.jpg`, `p_own_marrit.jpg`, `p_own_orrin.jpg`, `p_own_brenna.jpg`, `p_own_dunna.jpg`; `sw.js` rebuilt.
- No new in-game words, so no French.

## Tests

`test/own124.test.js` was taught the six first and failed on four checks (no rows, no files); with the rows and files in, 11 of 11. It now checks the size of every portrait it names, not only the first three.

## Pictures

`screenshots/p124d-own.jpg`: the talk window on Orrin Pale and on Marrit Pell.

## Left for the owner

1. Whether to pay for Hugging Face PRO so the rest can be made in a day or two, or let them come at about nine a day.
2. Brenna Loft came out about thirty. **Ruled 24 Nov, 5:55 pm: "leave Brenna at 30".** She stays as painted.

## Not done

- A seventh, Garrow Finch the quarry hauler, was asked for and refused by the allowance. He is first in the next batch.
