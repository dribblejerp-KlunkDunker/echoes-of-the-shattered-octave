# LOOKS-76: written portrait descriptions for everyone who borrows the townsman or townswoman portrait

> **A reader's brief, 24 Nov 2026.** Made by a read-only reader for the Commander, as the source for the painted portraits the owner ruled for on 24 Nov ("yes all 79 should get faces of their own"). Its book and code citations were made by the reader and are spot-checked, not all verified: each entry is checked against its file before its portrait is made. Everything marked [PROPOSED] is a suggestion, not canon. Where the game's own text contradicts a book, the portrait follows the book.

Read-only pass over `/home/claude/echoes-of-the-shattered-octave` (js/, story/Books/, story/World Bibles/). Nothing in the repository was changed.

## Counts and exceptions (top of file)

- Borrowers found: 79 grep lines (`grep -n "portrait: 'towns" js/*.js`), minus the 3 already done (Old Marrable, trooper 132, the Tallyman) = 76 to describe. The grep undercounts: portraits set by a helper default (`pers` in cantabile17.js), a ternary (vigil96.js), an `npc()` argument (heights92.js, rift100.js) or the life60 sprite fallback (life60.js:175) never show in it. Those are marked "[beyond the grep]" in the heading.
- Entries written: 110 (`grep -c '^### '`). One entry covers a pool or a merged id (the Orrin Pale triple, hesper and hesper2, quain and quain2, the Oakhaven townsfolk, the road-walkers, the Hollow loops, the mast-crew, the watchers, the Umbral folk). 13 headings are marked beyond the grep.
- In the books: 37 entries carry some book text; about 22 of them give a real look, sound or carriage line, the rest give only the role or a bible line. The other 73 are "Not in the books (the game's own)".
- Not described, and why: the four prologue figures `p17p_seraphina`, `p17p_ignatius`, `p17p_solenne`, `p17p_dorran` (js/prologue17.js:701-706). They borrow `townsman` through a helper but are wordless cutscene figures with a single caption line and empty `topics`, so no talk window ever shows their portrait. They need own portraits from the books, not a description here. Also not borrowers, so left out: Brenna Corliss (`bettany`), Anselm Dray and Two-Eleven and the Quartermaster (`hob`).

## How to read the entries

- The two painted portraits being borrowed. `img/p_townsman.jpg`: a man of about forty-five, grey-green knitted cap, stubbled, linen shirt open at the neck, brown leather apron. `img/p_townswoman.jpg`: a woman of about thirty-five, cream kerchief over her hair, brown dress with a paler collar, a clay jar held at her side.
- "Tint" means the figure is the townsman or townswoman painting recoloured by a multiplier `[r, g, b]` (1.0 = unchanged). Since Phase 124b (`js/faces124.js`) the head, hair and bare skin keep the painting's own colours; only the cloth takes the tint. A tint below 1.0 in a channel darkens that colour channel, so `[0.8, 0.88, 1.0]` reads as cool grey-blue cloth, `[1.1, 0.85, 0.7]` as warm russet, `[1.05, 0.8, 1.0]` as plum.
- The sprite painters (`js/people25.js`): townsman "A working man of Oakhaven: a cap, a pale shirt with the sleeves rolled, a leather apron, boots" (people25.js:126); townswoman "A woman of Oakhaven: a white headscarf, a dark dress with an apron, a clay jug held on the hip" (people25.js:156); hob/Jabez "The smith: a shaven head, bare arms, a leather apron over a dark shirt, boots" (people25.js:280); sexton "The gravedigger: a ragged hood and coat, both hands resting on a long-handled shovel" (people25.js:641); mourner "A veiled figure in dark rags, white lilies held at the chest, barefoot" (people25.js:725).
- `[PROPOSED]` marks a choice made here because neither the code nor the books give it. Where a book describes someone, the book is followed and nothing contradicting it is added. Where the game's own lines contradict the book, both are quoted and the entry says which the portrait follows.
- Book citations are to `story/Books/...` and `story/World Bibles/...` by short name. Vol VIII (the game's own layer) is never cited as canon.
- A portrait is a 96 by 96 painted bust, so every paragraph below describes the head and the chest up only.

---

# THE REACH AND OAKHAVEN

### Ada Pellow, widow of Cooper's Row (`p9_ada`, `js/sidequests.js:434`)
- **Met:** Oakhaven, on the step of her house in Cooper's Row (16.9, 30.6), during the side quest "A Reed for Pellow".
- **Borrows now:** townswoman.
- **What the game gives:** the plain townswoman painting, no tint (sidequests.js:454): white headscarf, dark dress and apron, clay jug on the hip. No `desc`. Lines: "I have buried a husband and I have hung his reed twice. I will not be shouted at on my own step." (sidequests.js:108); "Seventy years in one parish. It was louder when I was a girl. Everything was." (sidequests.js:111); of her husband Joram's split reed: "it hangs with its mouth open as if it had something to tell me." (sidequests.js:114).
- **What the books give:** Book One ch.11 (`Chapters/11 The Greening.md:198`): "She was fifty-one years old. Her youngest had had a marsh-fever two springs ago". She climbs into the thorn at the Greening toward "the voice of Ada Pellow" (same file:210). Nothing on her hair or face. The game's "seventy years" and widowhood do not match the book's fifty-one-year-old mother.
- **Sex and rough age:** woman. Book: fifty-one. The game's own line says seventy; the portrait follows the book.
- **The portrait:** A woman of fifty-one, thin from a hard year, standing very straight. Hair [PROPOSED] iron-brown going grey at the temples, parted flat and covered by a plain white headscarf tied under the chin. Lined forehead, grey eyes held level and a little too dry, mouth closed against being pitied. A dark wool bodice buttoned to the throat. In both hands against her chest she holds the split First Reed, a short green-grey cane tube with its slot gaped open. That split reed is hers alone.

### Marrit Pell, housekeeper to the Governor (`p46_marrit`, `js/governor46.js:123`)
- **Met:** Oakhaven, in the Governor's house above the square (12.5, 7.6).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting at scale 0.93 (governor46.js:123): white headscarf, dark dress and apron, jug on the hip. No `desc`. Lines: "Wipe your boots. He's at the Greenhall, if it's him you want. He mostly is." (governor46.js:92); "I bathed that boy. I know what he looks like from the back walking off up the North Gate road in the snow" (governor46.js:95); "Boots. Then talk." (governor46.js:124).
- **What the books give:** She is not in the books by name. Book One ch.2 gives only Aldric's "Your room's as you left it. I had them air it every spring." No look lines for the housekeeper. The code marks the name and part [PROPOSED] (governor46.js header).
- **Sex and rough age:** woman, not stated; she bathed Kaelen as a boy, so past fifty.
- **The portrait:** A small, upright housekeeper of about sixty-five. Hair [PROPOSED] white, scraped back under a starched linen cap tied with a bow. Narrow, scrubbed face, a mouth that has said "boots" ten thousand times, pale blue eyes that look at the floor before they look at you. Plain dark gown, a grey woollen collar, the cuffs turned back. Unique: a heavy brass ring of keys pinned at her breast, and a folded pale linen square, cut to a thumb's width, held in one hand.

### Orrin Pale, sexton of Oakhaven (`orrin`, `js/data.js:615`; also `p29_sexton`, `js/thin29.js:148`; `p16h_orrin`, `js/heist16.js:922`)
- **Met:** Oakhaven, in the Chapel of the Carillon (heist16 places him at 1.7, 5.9); at dawn (05:30 to 08:00) salting the chapel paths at (46.2, 11.6) (thin29.js:338). Three ids, one man: data.js, thin29 and heist16 all call him "Orrin Pale, sexton", and data.js:612 says js/chapel27.js stands him in the chapel.
- **Borrows now:** townsman (all three ids).
- **What the game gives:** data.js and heist16 draw the plain townsman (heist16.js:961); thin29 uses the `sexton` sprite, the gravedigger in ragged hood and coat. No `desc`. Lines: "Salt for the paths, a spade for the rest. What do you need?" (data.js:616); "Salt for the paths, before the town is up. What is buried stays buried, and says nothing." (thin29.js:149); "He keeps his hand on a ring of keys and his eyes on the floor." (heist16.js:146).
- **What the books give:** Not named in the books. Book One has an unnamed sexton: "The sexton, about a burial on Massday." (`Chapters/03 Burl.md:190`) and "The sexton's salt lay in white drifts along the paths" (`Chapters/11 The Greening.md:72`). The code says so: "Canon has an Oakhaven sexton (ch. 4, ch. 15) but no name; Orrin Pale is the library's [PROPOSED]" (data.js:612).
- **Sex and rough age:** man, not stated; the game's lines suggest late fifties, and he has "a daughter on the other side of the Hedge" (heist16.js, keysKnown).
- **The portrait:** A gaunt man of fifty-eight, shaven that morning with a nick on the jaw. Hair [PROPOSED] thin, flat, the colour of old salt. Pale lashes and pale, watchful eyes that rest on the floor, deep lines either side of a closed mouth. A black sexton's coat buttoned up to a white collar worn grey at the fold. Unique: grains of white salt caught in the creases of his coat and a heavy ring of iron keys hanging at his chest.

### Brenna Loft, baker (`p12_baker`, `js/festivals12.js:489`)
- **Met:** Oakhaven's square, at the harvest table during Last Sheaf week (Harvest Home).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting (festivals12.js:489), markup 0.9, sells hearth bread, cider and moot-curd. Name marked [PROPOSED] (festivals12.js:117). Lines: "Softly, love. New flour, the first in a year that tastes of nearly what it should." (festivals12.js:118); "If you are going to shout, buy something first, and shout into the bread." (festivals12.js:120); "The first loaf is for luck. Yours is the second." (festivals12.js:123).
- **What the books give:** Not in the books by name. The books have only "the baker's wife, floured to the elbow, stopped in her doorway with a tray of loaves on her hip" (`Chapters/02 Charcoal and Glass.md:92`), who the game calls Agnes Tull (see below). Brenna Loft is a separate, game-only baker at the festival.
- **Sex and rough age:** woman, not stated; "love" in her speech suggests mid-forties.
- **The portrait:** A round-faced, quick-eyed woman of forty-five with a smear of white flour along one cheekbone. Hair [PROPOSED] bright chestnut, bundled under a flour-dusted cap with a few curled strands escaped. A broad, easy mouth halfway to a joke, dimples, sleeves rolled to the elbow showing strong freckled forearms. A clean apron over a plain bodice. Unique on this list: she is the only smiling face, and she holds up one golden loaf with a dock-leaf tucked under it.

### Dunna Sedge, sheaf-binder (`p12_dunna`, `js/festivals12.js:494`)
- **Met:** Oakhaven's north field (the NE corner inside the Hedge), at the dead hour (04:00 to 06:00) during the secret cutting of the Last Sheaf.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting. Name [PROPOSED] (festivals12.js:141). Lines: "Not here. Not now. Ask Harrow." (festivals12.js:142); "Dunna Sedge has her hood up and a sickle in her hand. 'Quiet as your footfalls?' she breathes." (festivals12.js:143); of the field: "My mother cut this field. Shh." (festivals12.js:149).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, not stated; her mother also cut the field, so perhaps thirty-five.
- **The portrait:** A lean woman of thirty-five caught mid-whisper in grey pre-dawn. A dark wool hood pulled up, hiding her hair except one pale-straw wisp at the temple [PROPOSED]. High cheekbones, wind-chapped skin, grey eyes wide and unblinking, one finger half lifted toward her lips. Coarse brown cloak clasped at the throat. Unique: a short curved sickle held blade-up against her shoulder, and a single ear of cut grain tucked into the hood's edge.

### Garrow Finch, quarry hauler (`p11_dicer`, `js/tavern11.js:908`)
- **Met:** the Boar & Dulcimer's cellar, east of the crates (5.4, 10.5), before the Greening.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting (tavern11.js:919). No `desc`. Lines: "Hetty's board says no dice, and Hetty's board is upstairs. A throw of bones, if you have a coin to lose?" (tavern11.js:69); "Bones? One to twenty sovereigns. Nobody down here ever got rich, and nobody has had to leave." (tavern11.js:70); "'Bones, or back up the stair,' says Garrow, and shakes the cup inside his coat." (tavern11.js:71).
- **What the books give:** Not in the books. (The only Garrow in the books is Ulf Garrow, a Sounder captain in Book Four, `Part One Ch1-4.md:212`, a different man.)
- **Sex and rough age:** man, not stated; "a quarry hauler off shift", so thirty-five to forty.
- **The portrait:** A thick-necked man of thirty-eight, shoulders hunched under a collar. Hair [PROPOSED] cropped black with fine grey quarry dust still in it. A flattened nose broken once, black stubble, quick dark eyes that watch the hand rather than the face. A loose canvas coat, its lapel bulging. Unique: the leather dice-cup held half out of the coat, one bone die balanced on his thumb, and a half-grin that never reaches the eyes.

### Nessa Tolliver, ferrywoman (`rounds`/Rounds dealer; npc id in `js/hearth15.js:1070`)
- **Met:** the Boar & Dulcimer, the table by the east window, before the Greening.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting. Marked [PROPOSED]: "a ferrywoman off the Flume" (hearth15.js header). Lines: "Nessa Tolliver, a ferrywoman off the Flume, shuffles a worn deck with one hand. 'Evening. A round of Rounds, if you have the patience?'" (hearth15.js:147); "Rounds. Two to thirty sovereigns. I only cheat the river." (hearth15.js:148); "'Rounds, or the next seat,' says Nessa, and cuts the deck." (hearth15.js:149).
- **What the books give:** Not in the books. (Nessa Lark of Book Three is a different woman.)
- **Sex and rough age:** woman, thirty to forty.
- **The portrait:** A weathered river-woman of thirty-six, leaning back with one eyebrow raised. Hair [PROPOSED] dark, black-brown, in one thick wet-looking braid over her left shoulder. Sun-and-wind-reddened cheeks, light hazel eyes narrowed to read a hand across a table. A stiff oilskin collar turned up over a salt-stained shirt. Unique: one hand holds a fan of worn, soft-cornered playing cards, and the other thumb rides the deck.

### Bethan Marl, neighbour to the Tarrows (`p13h_wenna`, `js/house13.js:392`)
- **Met:** Oakhaven's north-west lane outside the shuttered house the map calls "A shuttered house" (the Kept House side quest).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting (house13.js:500). The npc id says "wenna" but the shown name is Bethan Marl (house13.js:100). Lines: "Softly, if you would. I stand out here because I cannot sit in there." (house13.js:102); "Does it ring? Not next door, it does not. Keep your voice down." (house13.js:103); "If you mean to shout, shout at your own door." (house13.js:104). Header: "She keeps the key and will not use it." (house13.js:5).
- **What the books give:** Not in the books. (Wenna Holt and Abbess Wenna of the books are other women.)
- **Sex and rough age:** woman, not stated; a long-standing neighbour, about fifty-five.
- **The portrait:** A stooped, guarded woman of fifty-five. Hair [PROPOSED] grey-brown in two thin plaits pinned flat over a dark kerchief. Heavy-lidded eyes shadowed from nights of not sleeping, a downturned mouth, a long chin. A faded blue shawl clutched shut at the neck with both hands. Unique: a small iron door-key hung on a cord round her neck that she keeps touching and does not lift.

### Agnes Tull, the baker's wife (`p29_agnes`, `js/thin29.js:117`)
- **Met:** Oakhaven, inside the baker's, a room behind the barred baker's door at (14, 7).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting. No `desc`. Lines: "Mind the flour. I would offer you a chair but they are all full of bread." (thin29.js:119); "I have not slept since the Hedge went up, so do not haggle; I will cry." (thin29.js:119); the trough that "carries at night" (thin29.js header: she "punches the dough down every hour of the night").
- **What the books give:** Not named, but the baker's wife is in Book One: "the baker's wife punched the dough down every hour through the night and wept with exhaustion into the flour" (`Chapters/01 The Tending Note.md:77`); "The baker's wife, floured to the elbow, stopped in her doorway with a tray of loaves on her hip and stared" (`Chapters/02 Charcoal and Glass.md:92`); "the baker's wife standing in the m[iddle]" of the broken bakery (`Chapters/11 The Greening.md:74`).
- **Sex and rough age:** woman, not stated; mother-of-a-business age, about forty-five.
- **The portrait:** A woman of forty-five, entirely worn out. Hair [PROPOSED] dishwater blonde in a loose knot, half undone, grey at the roots. Reddened, puffed eyes with purple shadows, a smile put on out of habit. Flour dusted over both forearms to the elbow, sleeves pushed up, a faint streak on the forehead. Unique: wet tracks cut through the flour on her cheeks, as though she has been crying into the dough again.

### Ambrose Vettle, chandler (`p29_ambrose`, `js/thin29.js:120`)
- **Met:** Oakhaven, in the chandler's shop behind the barred door at (40, 29).
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting, markup 1.1. Name [PROPOSED] ("Book One has no Oakhaven chandler", thin29.js header). Lines: "Tallow's cheaper. Wax is for the chapel and people who want to be seen buying wax." (thin29.js:122); "Buy something or let my door shut. Every draught costs me a candle." (thin29.js:122). His wife is a life60 walker (`life60-oakhaven.js`, "Vettle's wife, the chandler's").
- **What the books give:** Not in the books.
- **Sex and rough age:** man, not stated; about fifty-five.
- **The portrait:** A narrow, tight-lipped man of fifty-five. Hair [PROPOSED] sparse, grey, combed in thin strands across a freckled scalp. A long nose, pinched cheeks, sharp light eyes. A tallow-stained brown apron over a collarless shirt. Unique: a stub of unlit candle tucked behind one ear and a thumb dipped in yellow wax, as if he is quietly counting the draught.

### Sim Fletch, tannery hand (`p29_sim`, `js/thin29.js:132`)
- **Met:** Oakhaven's tannery interior (4.5, 5.6), at the vats.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting. No `desc`. Lines: "Jabez is outside. He likes the air. I like the work; it stops you hearing the Hollow through the wall." (thin29.js:133); "Lime, then the beam, then the vats. Same as always." (thin29.js:133); "Mind the vats. They do not care whose hand goes in." (thin29.js:133).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, not stated; young, about twenty-five.
- **The portrait:** A lanky young man of twenty-five with his shoulders drawn up as if against a noise. Hair [PROPOSED] sandy, cropped short and uneven, flecked with lime dust. A long freckled face, anxious pale-green eyes. A bleached canvas smock, the neck stained green-brown. Unique: both hands held up lime-burned and peeling, and a tuft of grey wool pushed into one ear.

### Moll Fletch, tannery hand (`p29_moll`, `js/thin29.js:134`)
- **Met:** Oakhaven's tannery interior (10.6, 5.6), near the back door to the Hollow.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting. No `desc`. Lines: "That door goes through to the Hollow. Rooke keeps it shut. We hear them in there at night, humming." (thin29.js:135); "Eighty-four in the Hollow, Rooke says, and more since. We send the scraps through for their fires." (thin29.js:135); "No, you cannot go through. Ask Rooke." (thin29.js:135).
- **What the books give:** Not in the books. (Same surname as Sim; the relationship is not stated.)
- **Sex and rough age:** woman, about thirty.
- **The portrait:** A solid, stern woman of thirty with her head turned slightly toward a wall as if hearing something through it. Hair [PROPOSED] black, cropped to the jaw and tied back in a stained rag. Strong dark brows, brown eyes steady and unsurprised, a straight mouth. Sleeves rolled above the elbow over forearms stained tan to the wrist. Unique: a deep old vat-burn scar crossing the left forearm, and an ear tilted toward the Hollow.

### Anselm Fenn, Consortium clerk (`p15l_clerk`, `js/ledger15.js:659`)
- **Met:** Oakhaven, the Greenhall's desk (13.6, 4.3), before the Greening.
- **Borrows now:** townsman (tier high).
- **What the game gives:** plain townsman painting, standing still. No `desc`. Lines: "Good day. The Consortium draws letters of credit here, payable to the bearer. Five in the hundred on cashing. Quietly, please; the Factor is at the next desk." (ledger15.js:132); "Letters of credit. Gold in, paper out. Do not unfold one near the lamp." (ledger15.js:133); "If you want to shout, shout at the Factor." (ledger15.js:134).
- **What the books give:** Not in the books. (Maddock and Elsie Fenn are other Fenns.)
- **Sex and rough age:** man, not stated; about forty.
- **The portrait:** A neat, bloodless clerk of forty. Hair [PROPOSED] fair, thinning, combed flat with oil. Clean-shaven, a long upper lip, round steel spectacles that make his pale eyes smaller. A high-collared grey Consortium coat, a stock tied tight. Unique: a sealed letter held by one corner away from the lamp, and ink on the first two fingers.

### Dessa Quill, letter-writer (`p16h_dessa`, `js/heist16.js:921`)
- **Met:** Oakhaven, on the Chapel steps (50.4, 10.8), during the Held Letters job.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting (heist16.js:957). No `desc`. Lines: "I write letters. Forty-one since the gate was barred. Not one has had an answer." (heist16.js:117); "I write letters for people who cannot, and I sit where the Chapel can see me, so nobody says I hide it." (heist16.js:116); "I have sat here nine nights." (heist16.js, `again`).
- **What the books give:** Not in the books. (Jory Quill is another Quill, a courier.)
- **Sex and rough age:** woman, about thirty-five.
- **The portrait:** A thin, wide-awake woman of thirty-five with violet shadows under her eyes. Hair [PROPOSED] very dark, pulled back hard and pinned. A sharp nose, a determined thin mouth, grey eyes steady on whatever she is watching. A black wool shawl over a plain grey bodice. Unique: a slim lap-desk strapped at her chest, a quill behind one ear, and ink drying on the side of her right hand.

### Reeve Alder Mossbrook (`p16h_mossbrook`, `js/heist16.js:925`)
- **Met:** Oakhaven, the Greenhall (4.2, 4.0), at the Reeve-Moot (the quarry-lease job).
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting. No `desc`, but the notice line: "He is a big, careful man with a pen he keeps turning in his fingers." (heist16.js:330). Lines: "The Reeve-Moot is always glad of an honest petitioner. Sit, sit." (heist16.js:327); "I have a good deal to do, and none of it is you." (heist16.js:329).
- **What the books give:** Not in the manuscripts. Vol II (`World Bibles/Vol II - Gazetteer and Bestiary.md:42`): "Reeve Alder Mossbrook (m, 60s) Head of the Reeve-Moot. Signed the quarry lease in 404 for a price that looked excellent. Has not slept properly since 412. Decent, ruined".
- **Sex and rough age:** man, sixties (Vol II).
- **The portrait:** A heavy, careful man of sixty-six. Hair [PROPOSED] thick and white, brushed back from a high forehead, with wide white side-whiskers. Heavy, drooping lids over tired brown eyes, a slow mouth, loose jowls. A dark broadcloth coat with a plain pewter chain of office. Unique: a goose-quill pen turned between thick fingers at his chest, the nails bitten.

### Ines Tarn, night clerk (`p16h_ines`, `js/heist16.js:926`)
- **Met:** the Quarry's counting-room off Depot Three (10.2, 3.0), during the roster job.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting (heist16.js:976), named Ines Tarn. No `desc`. Lines: "Oh. You are not on the sheet. Please do not tell Corporal Pike I looked up. I am owed four months and I have forgotten how it feels to sit down." (heist16.js:340); "Counting-room. Staff only. I did not see you. I am writing." (heist16.js:341); "I have not got a penny and I have not got a minute. Go away." (heist16.js:342).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about twenty-eight.
- **The portrait:** A gaunt young clerk of twenty-eight, eyes ringed with fatigue, caught mid-glance upward. Hair [PROPOSED] mouse-brown, tied low at the nape, strands escaping. A small, pale, pointed face, chapped lips, eyes that dart toward a door. A thin grey bodice with ink-blackened cuffs pinned back. Unique: a green eyeshade pushed up on her forehead, and a pen gripped as if it were a weapon.

### Steward Merrin Oake, Timber Compact (`p16h_steward`, `js/heist16.js:923`)
- **Met:** Oakhaven's clearing (19.4, 29.4), by his wagon, during the roster job.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting (heist16.js:967). No `desc`. Lines: "Does it ring? True enough. We are the Timber Compact; we cut what the Consortium counts, and nobody counts us." (heist16.js:287); "Compact steward. If you are the Consortium's, say so and I will move my wagon." (heist16.js:288); "I have eleven in my books that were on it." (heist16.js:291).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A weather-cured man of fifty with a short square grey-brown beard cut straight across. Hair [PROPOSED] grizzled and clipped. Dark, level eyes under heavy brows, a thin clenched mouth. A worn wool coat with a leather yoke, sawdust at the collar. Unique: a battered account-book clamped under one arm with a pencil tied to its spine, a ribbon of Compact green on the lapel.

### Reeds-Miner Tomas, timber-cutter (`p9_tomas`, `js/sidequests.js:438`)
- **Met:** Oakhaven's clearing beyond the Hedge (24.6, 30.4), beside his timber wagon.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting (sidequests.js:458). No `desc`. Lines: "I have one good hand and a bad temper. Choose which you want to speak to." (sidequests.js:159); "He holds up the glove. Three fingers to a saw, and the fourth grew back wrong. Everybody looks." (sidequests.js:165); "Timber comes out of the clearing and goes into the town, and the Hedge takes the noise off it at the gate. I have wondered where the noise goes." (sidequests.js:162).
- **What the books give:** Manuscripts: no. Vol II (`Vol II - Gazetteer and Bestiary.md:43`): "Reeds-Miner Tomas (m, 40s) ... Timber-cutter. The one who tells you the logs ring like bronze bells. Blunt, kind, three fingers missing — the fourth grew back wrong and he keeps it in a glove."
- **Sex and rough age:** man, forties (Vol II).
- **The portrait:** A blunt, kind-faced man of forty-five with sawdust in his eyebrows. Hair [PROPOSED] dark brown going grey, cropped under a shapeless wool cap. A broken-veined nose, a short bristled beard, brown eyes that look straight at you without a flicker. A coarse canvas coat. Unique: his left hand raised in a thick leather glove, the empty fingers of the glove bending where the missing joints should be.

### Ilse Brennan, Cantor-Master (`lib_ilse`, `js/libraries26.js:60`)
- **Met:** Oakhaven, the Conservatory Reading Room (Parts 1 and 2).
- **Borrows now:** townswoman (tier high).
- **What the game gives:** plain townswoman painting. No `desc`. She cannot speak. Lines: "She writes on her slate, in a hand as clear as print, and turns it round: 'Read what you like. Quietly. The reeds are listening.'" (libraries26.js:62); "The Debt of Overtone. Eleven years ago I sang one note too many for a dying boy. He lived. The note kept my voice." (libraries26.js:68); "My best pupil and my worst listener." (libraries26.js:69).
- **What the books give:** Book Four Part One (`Part One Ch1-4.md:2005`): "Ilse Brennan was seventy-eight. She had been Cantor-Master of the Reedside Conservatory for forty years ... She had lost her voice in 408." And (:2011): "She was small, and bent, and white-haired, and her face had gone thin with the winter." Also "the small upright hand" of her writing (:2023). The game's "eleven years ago" and the book's 408 agree.
- **Sex and rough age:** woman, seventy-eight.
- **The portrait:** A small, bent old woman of seventy-eight. Thin white hair drawn back under a plain linen cap, a face worn thin as paper with long lines running down from the nose, grey-blue eyes sharp and patient, mouth closed for good. A dark Cantor's gown with a plain white collar. In both hands she holds up a small slate with a single word written on it in a small upright hand, and a stub of chalk is caught in her sleeve.

### Lissa Merrow (`p30_lissa`, `js/hollow30.js:141`)
- **Met:** Oakhaven's Hollow, on the step of the red-shutter house, behind the tannery.
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting at scale 0.68 (a child's height). No `desc`. Lines: "I am not sick. It is only in my arms, Rooke says, up to here. He looks every month." (hollow30.js:142); "Mind my cup." (hollow30.js:142); "I keep my own cup, because if you drink out of a cup that has been in a house, you get what the house has." (hollow30.js:145).
- **What the books give:** Book One ch.3 (`Chapters/03 Burl.md:182`): "On the step of the house with the red shutters, Lissa Merrow sat in the sun. She was eleven. Her forearms ended in neat white bandages a hand's width below the elbow, and she was holding a tin cup of water between them ... She watched the Grafters go by with an expression of perfect, terrible calm." Also "Lissa Merrow stood at the front with her bandaged forearms at her sides, humming with her mouth shut, and did not look away." (`Chapters/09 Beneath.md:116`).
- **Sex and rough age:** girl, eleven. The borrowed adult portrait does not fit her.
- **The portrait:** An eleven-year-old girl, very still. Hair [PROPOSED] straw-fair, in a single plait over one shoulder. A thin serious face, grey eyes unafraid, an expression "of perfect, terrible calm". A faded blue pinafore. Both forearms end in neat white bandages held out before her chest, and between them, pressed from both sides, a tin cup of water that she does not spill.

### Hob Wendle, field-hand (`p30_hob`, `js/hollow30.js:151`)
- **Met:** Oakhaven's Hollow, behind the tannery, before the Greening.
- **Borrows now:** townsman (scale 1.08).
- **What the game gives:** plain townsman painting, slightly enlarged. No `desc`. Lines: "Mind the step. I would get up, only it is a business, getting up, on these." (hollow30.js:152); "Field-hand. Was. You cannot follow a plough on roots." (hollow30.js:152); "I left white threads in the dust of every lane." (hollow30.js:155).
- **What the books give:** Book One ch.3 (`Chapters/03 Burl.md:74`): "Hob Wendle first: a field-hand of forty, big-shouldered and sheepish, whose roots had come out through the soles of his feet in the summer ... Three of his toes had gone to wood." Chapter 13 (`Chapters/13 Ash in the Hold.md:104`): "sitting with his back against the deckhouse and his boots stretched out in front of him and a blanket over his knees". The game agrees with the book here.
- **Sex and rough age:** man, forty.
- **The portrait:** A big-shouldered man of forty, sheepish, looking down and slightly away. Hair [PROPOSED] thick, sun-bleached brown, in need of a cut. A broad, open, freckled face, soft hazel eyes, an embarrassed half-smile. A rough field-hand's shirt open at the neck, a blanket pulled up around the shoulders. Unique: a few fine white root-threads showing at the open collar, as though the roots have started to climb.

### Umber, a runaway of the Veil (`umber`, `js/data.js:529`)
- **Met:** the mist outside Oakhaven's Hedge, at night (one of the Office of the Catalogue's quarry); the code says: "Umber [PROPOSED]: the Veil runaway in the mist outside the Hedge" (data.js:527).
- **Borrows now:** townswoman (tier high).
- **What the game gives:** the figure is Sable's painting (`sprite: 'sable'`): "a dark bob, a black robe with a cowl, a ledger held up in the left hand" (people25.js:250). No `desc`. Lines: "Entry: a stranger, polite, at the wrong end of the continent. Sit. Not there. That is where the proctors will come from." (data.js:530); "I am a day-book, not a cure. Say what you came to say." (data.js:530); "I copied the harvest schedule fair, fourteen times, in a straight hand." (data.js:532).
- **What the books give:** Not in the books (the name does not appear; she is Sable's "junior" by the game's own line, data.js:537). Sable herself is in the books; her look is not Umber's.
- **Sex and rough age:** woman, about twenty-five (a junior archivist).
- **The portrait:** A young Veil archivist of twenty-five, pale, careful, a little hunted. Hair [PROPOSED] ash-brown, a straight chin-length bob with a ruler-straight fringe, damp with mist. Ink-dark eyes that note everything including the tone; a precise thin mouth. A dark Veil robe with a cowl pushed back. Unique: loose pages of the Veil's day-leaves showing under her coat at the breast, and a thumb stained black with ink.

### Godwin Pettigrew, lamplighter (`n28_lamplighter`, `js/narrow28.js:432`)
- **Met:** Oakhaven, walking the lanes at dusk lighting the hush-lamps.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting (narrow28.js:418). Name in `LAMPLIGHTER` (narrow28.js:145). Lines: "Evening. Mind the pole. Every lamp in Oakhaven by full dark, and not one of them quiet." (narrow28.js:433); "Can't stop. Twenty-four lamps and one taper, and the dark does not wait on me." (narrow28.js:433); "Lamps first. Talk after." (narrow28.js:433).
- **What the books give:** Not named. Book One: "the lamplighters came, walking the lanes with their poles and their tapers, lighting the hush-lamps one by one." (`Chapters/01 The Tending Note.md:181`). No look lines.
- **Sex and rough age:** man, about sixty.
- **The portrait:** A spare, hurrying man of sixty looking over his shoulder at the dusk. Hair [PROPOSED] short white stubble under a flat cap with the ear-flaps tied up. A narrow sunken face, deep crow's-feet, small bright eyes. A soot-grey coat with a brass-buttoned collar. Unique: a long lamplighter's pole passing upright beside his head with a small flame burning at its tip lighting one side of his face.

### The night-hummers (`n28_hummer`, `js/narrow28.js:434`)
- **Met:** Oakhaven, at three crossings at night: (22.6, 24.4), (23.0, 44.6) and (50.6, 22.6) (narrow28.js:147).
- **Borrows now:** townswoman, for all three, one id and one name, "A night-hummer".
- **How many and how chosen:** one NPC definition, up to three on the map at once, placed by clock; the figures are townswoman, townsman, townswoman in that order (narrow28.js:147), but the portrait is always `townswoman` (a man stands at the middle crossing and shows the woman's face).
- **What the game gives:** plain townswoman or townsman painting. Lines: "Hm-mm. All's well. Sit if you like; the stool next door is free." (narrow28.js:435); "Hm. Keep to the Narrow, love, and the street keeps you." (narrow28.js:435); "Lower. I am humming for the whole street, not for you." (narrow28.js:435).
- **What the books give:** Night-hummers are in Book One. Old Tam is one: "He was eighty-one. He had been a night-hummer since the first autumn of the Hedge, and a basket-maker for sixty years before that ... He had a face like a walnut and a voice, when he hummed at the crossings, that could not reach any note above the middle of the stave." (`Chapters/06 The Listening Hour.md:66`). Tam has his own portrait (`img/p_tam.jpg`); these are the other hummers.
- **Sex and rough age:** mixed; not stated.
- **Four faces for the pool:** (1) a woman of seventy, white hair under a grey shawl, lips parted on a low hum, one hand cupped behind her ear [PROPOSED]; (2) a man of sixty-five with a walnut-brown face and a bald crown, eyes closed, a mug in his hand; (3) a stout woman of fifty with her sleeves pushed up and a knitted scarf pulled over her chin, humming through the wool; (4) a gaunt man of fifty with a lantern raised beside his cheek and a stiff, tired jaw. All four are described [PROPOSED] and none is Tam.

### Bastien Corvo, pedlar of Cantabile broadsheets (`moor_bookseller`, `js/books.js:595`)
- **Met:** the Boar & Dulcimer's taproom (14, 3.5), near the east table.
- **Borrows now:** townsman.
- **What the game gives:** the river coat of the wharf (`p16f_cutter`, a townsman tint of `[0.8, 1.0, 0.72]`, a green cloth) when it exists, else plain townsman (books.js:675). No `desc`. Lines: "Dry pages, if you would like something to read." (books.js:597); "Paper tears more easily than people think. So do manners." (books.js:599); of him, Odile Quayle: "My best customer and my worst debtor ... Do not use the word 'owes'. He faints." (libraries26.js:83).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty.
- **The portrait:** A lean, ink-stained pedlar of forty with a ready mouth. Hair [PROPOSED] oiled black, combed back, with a narrow pencil moustache. Quick dark eyes, one brow permanently up. A moss-green river coat, a loose collar, a cravat tied carelessly. Unique: a satchel of dry stitched broadsheets clutched to his chest and a pencil stub in his hat-band.

### Abel Sedge, turf-cutter (`p29_abel`, `js/thin29.js:127`)
- **Met:** the Watch Downs, east of the fold (29.2, 34.6), beside a turf stack.
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting. Name [PROPOSED] (thin29.js header). Lines: "Read the sign? Sheep-walk. There are no sheep. The turf is short anyway, as if it remembers them." (thin29.js:128); "There are no sheep. Nobody says where they went, and I have stopped asking." (thin29.js:128); "There are no sheep. That is what you came to ask, so there it is." (thin29.js:128).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about sixty.
- **The portrait:** A sun-cured man of sixty whose face is the colour of old turf. Hair [PROPOSED] iron-grey, flattened by a hat he has just taken off and holds against his stomach. Sunken cheeks, grey stubble, narrowed eyes that have looked at distance all his life. A neckerchief knotted over a coarse shirt. Unique: a few blades of cut turf stuck to the shoulder of his coat and a long-handled turf-spade standing up beside his ear.

### Mother Hurst (`p29_hurst`, `js/thin29.js:123`)
- **Met:** Wethercombe, in the farmhouse by the hearth (2.6, 4.4).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting. No `desc`. Lines: "Come in off the combe. They are all up at the fold; I mind the soup. There are no sheep, mind. You will have noticed." (thin29.js:124); "There were, and now there are none, and the turf keeps the shape of them." (thin29.js:124); "No, there are no sheep. Everybody asks. Shut the door." (thin29.js:124).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about seventy-five.
- **The portrait:** A tiny, sharp old woman of seventy-five. Hair [PROPOSED] white, thin as thistledown, under a faded blue mob-cap. A face folded in a thousand creases, bright black eyes, a toothless pursed mouth. A dark shawl crossed over a hearth-warmed gown. Unique: a wooden soup ladle held up at her chest like a sceptre, a drop of broth on the tip.

### Jem Cotter, shearer (`p29_jem`, `js/thin29.js:125`)
- **Met:** Wethercombe, in the barn (7.4, 4.6), the door barred against "the woolwight".
- **Borrows now:** townsman.
- **What the game gives:** plain townsman painting. No `desc`. Lines: "I barred it from the inside because of the woolwight. You came in anyway, so you are either very quiet or not what I thought you were." (thin29.js:126); "Two years of clip and nobody to buy it." (thin29.js:126); "Bar the door behind you. Properly. Both pins." (thin29.js:126).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A wary, thick-forearmed man of forty-five who is peering past you at the door. Hair [PROPOSED] sandy-red and curling, grey wool-fluff snagged in it. A broad red face, rust-red stubble, pale blue eyes ringed white with watchfulness. A greasy leather jerkin over a rolled-sleeve shirt. Unique: a pair of hand-shears held up at the shoulder, and a lock of raw fleece wound round one wrist.

### Tamar Farrant, shepherd (`p22_tamar`, `js/sheepwalk22.js:790`)
- **Met:** Wethercombe, by the Farrants' fold (the Sheep-Walk).
- **Borrows now:** townswoman.
- **What the game gives:** the townswoman painting tinted `[0.95, 0.92, 0.82]` (a warm, sun-faded cloth; sheepwalk22.js:638). No `desc`. Lines: "Mind the gate, love. It is the only thing between them and the whole of the Reach." (sheepwalk22.js:123); "Farrant. We had the sheep-walk off the Downs for six generations. I am the seventh, and I am starting again." (sheepwalk22.js:124); "I fed my children my father's ewes, one a month, and I would do it again. Nothing took them. We did." (sheepwalk22.js:127).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about forty-five.
- **The portrait:** A hard, weathered shepherd of forty-five who has made a decision and stopped discussing it. Hair [PROPOSED] brown-grey, wind-whipped, tied under a faded straw-yellow kerchief with flecks of white wool in it. A square jaw, a sunburnt nose, tired pale-green eyes. A wool-oiled jacket in ochre-tan. Unique: a long hooked shepherd's crook rising behind her shoulder, and a strand of sheep's wool caught in her hair.

### Gideon Thrale of the Bellwether (`p22_gideon`, `js/sheepwalk22.js:797`)
- **Met:** the Bellwether, the drovers' inn, in Wethercombe.
- **Borrows now:** townsman.
- **What the game gives:** the townsman painting tinted `[1.08, 0.88, 0.72]` (a warm russet cloth; sheepwalk22.js:640). No `desc`. Lines: "Sit where the light is. The fire is mutton-fat and it smokes, but it is warm." (sheepwalk22.js:150); "I opened an inn on a road nobody walks. Say something I have not already said to myself." (sheepwalk22.js:152); "Tamar's, that. Tell her it was good." (sheepwalk22.js:156).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A rueful, stocky innkeeper of fifty with a faint smoke-smudge on one cheek. Hair [PROPOSED] thinning auburn, with ginger-and-grey sideburns. A crooked half-smile, droll brown eyes that agree with whatever criticism you have not yet said. A russet waistcoat over a rolled-sleeve shirt, the cloth marked with mutton-fat. Unique: a pewter tankard of cider raised to his chest and a bar-cloth over one shoulder.

### Ennis Crowle, beekeeper (`p29_ennis`, `js/thin29.js:129`)
- **Met:** the Flume road, among her skeps (5.0, 14.6).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting, markup 0.9, sells honey. No `desc`. Lines: "Softly by the skeps, if you would. They take a voice to heart." (thin29.js:131); "Honey's four. The bees do the work; I only tell them things." (thin29.js:131); "Not so loud. You will put them off their comb." (thin29.js:131).
- **What the books give:** Book Four Part One (`Part One Ch1-4.md:2105`): "The face in the bark was a woman's: Ennis Crowle, who had kept bees on the Flume road. Her eyes were shut." And :2333, "the first was Ennis Crowle ... who had kept bees on the Flume road." Vol V (`Vol V - The Winter Gazetteer.md:214`): "Ennis Crowle (beekeeper, Flume road), the first sung down." No age or colouring is given.
- **Sex and rough age:** woman; age not stated.
- **The portrait:** A calm, quiet-voiced woman of fifty-five whose whole face is gentle with listening. Hair [PROPOSED] pale grey-white, in a low braid under a beekeeper's wide straw hat with its veil pushed back over the brim. Soft brown eyes lowered and half shut, a faint private smile. A cream linen smock. Unique: a single honeybee walking on the back of her hand, which she holds up at her chest as if to whisper to it.

### Tobit Dree, lockkeeper (`p16f_pellam`, `js/flume16.js:1063`)
- **Met:** Stillwater Landing, the lower lock (the smugglers' wharf).
- **Borrows now:** townsman (the npc id is `pellam`, the shown name Tobit Dree, flume16.js:156).
- **What the game gives:** the `hob` painting (Jabez: shaven head, bare arms, leather apron over a dark shirt) tinted `[0.78, 0.9, 1.05]`, a cool slate-blue cloth (flume16.js:506). No `desc`. Lines: "Lock dues in advance, friend. Or a coin for the news. Or both. Everyone does both." (flume16.js:157); "Tobit Dree, lockkeeper. Before you ask: yes, I will sell you what I know, and yes, I sold the same this week to the Church's man" (flume16.js:160); "Quietly. The basin carries." (flume16.js:159).
- **What the books give:** Not in the books by name. (The books' Pellam is Pellam Quist, an Office registrar, a different man.)
- **Sex and rough age:** man, about fifty.
- **The portrait:** A heavy-lidded man of fifty with a shaven, shining head and a sly half-smile of someone who has sold the same sentence six times. Thick neck, big stubbled jaw, pale eyes that move once, slowly, to your purse. A slate-blue shirt open at the collar. Unique: a heavy iron lock-key on a leather thong against his chest and a small tally-board of chalk marks pinned to one shoulder strap.

### Madge Tallow, fence (`p16f_madge`, `js/flume16.js:1064`)
- **Met:** Stillwater Landing, on the wharf.
- **Borrows now:** townswoman.
- **What the game gives:** the townswoman painting tinted `[1.05, 0.8, 1.0]` (a plum or mulberry cloth; flume16.js:506, sprite `p16f_dockwoman`). No `desc`. Lines: "Do not tell me where it came from. I will tell you what it is worth, and it is less than you hoped." (flume16.js:179); "Half. Half of what a clean shop pays, and no questions." (flume16.js:180); "Put it on the board or put it back." (flume16.js:181).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about fifty-five.
- **The portrait:** A shrewd, stout woman of fifty-five who has already priced your coat. Hair [PROPOSED] black with one broad white streak at the left temple, bundled under a plum-coloured headcloth. A heavy chin, small hard black eyes, pursed lips. A plum bodice with a brass-buttoned collar. Unique: a jeweller's loupe on a cord against her chest, and one hand holding a coin to the light.

### Barnaby Haft, Timber Compact cutter (`p16f_orrin`, `js/flume16.js:1067`)
- **Met:** Stillwater Landing, beside the chained lock (the shown name is Barnaby Haft, flume16.js:186; the id says "orrin").
- **Borrows now:** townsman.
- **What the game gives:** the townsman painting tinted `[0.8, 1.0, 0.72]`, a green-tinged cloth (sprite `p16f_cutter`, flume16.js:506). No `desc`. Lines: "Does it ring? No. Nothing rings on this wharf, that is the trouble." (flume16.js:187); "Forty logs and a chained lock." (flume16.js:188); "If you are not here about the wheel, you are in the way of the wheel." (flume16.js:189).
- **What the books give:** Not in the books. (This is a different man from the Oakhaven sexton Orrin Pale; the id only borrows the name.)
- **Sex and rough age:** man, about thirty-five.
- **The portrait:** A worried, broad-backed timber cutter of thirty-five. Hair [PROPOSED] reddish-blond, cropped, with a pale scar through one eyebrow. A short ginger beard, rough pink cheeks, worried blue eyes. A green-tinged canvas jacket with sawdust on the shoulders. Unique: a Timber Compact wage-ticket pinned in his cap-band, and one hand wrapped in a rag from a splinter.

### The wharf hand (`p16f_hand`, `js/flume16.js:1068`)
- **Met:** Stillwater Landing, on the planks.
- **Borrows now:** townsman.
- **What the game gives:** the townsman painting tinted `[0.85, 0.95, 0.9]` (a cool grey-green cloth; sprite `p16f_dockman`, flume16.js:506). Name "Wharf hand" (flume16.js:206). Lines: "You came along the Flume road on foot? Under the Wash? Then you timed it. Good." (flume16.js:207); "Mind the planks. They are not all as old as they look." (flume16.js:208); "Not now." (flume16.js:209).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about thirty.
- **The portrait:** A lean wharf labourer of thirty, face sun-dark and squinting. Hair [PROPOSED] black, tied back with a twist of tarred cord. A short black beard, a missing front tooth showing in a lazy half-smile. A grey-green shirt, stained dark at the collar with river water. Unique: a coil of wet rope slung over one shoulder and a plank-splinter held between his teeth.

### The raft-wife (`p16f_wife`, `js/flume16.js:1069`)
- **Met:** Stillwater Landing, by the shut wheel and the raft.
- **Borrows now:** townswoman.
- **What the game gives:** the townswoman painting tinted `[0.8, 0.95, 1.05]` (a cool blue-grey cloth; sprite `p16f_rafter`, flume16.js:506). Name "Raft-wife" (flume16.js:212). Lines: "My man poles the raft. The wheel has been shut since spring." (flume16.js:213); "We are out of tea, patience and luck, in that order." (flume16.js:214); "Mind your feet near the edge." (flume16.js:215).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about forty.
- **The portrait:** A thin, cold, unbeaten woman of forty. Hair [PROPOSED] dark brown streaked with early grey, tied in a knot under a blue-grey shawl pulled over her head. Chapped red cheeks, sharp grey eyes under a creased frown. Unique: a grey blanket clutched round her shoulders and both hands wrapped in rags, red and raw from the river wind.

### Gil Wade, punt-poler (`p29_gil`, `js/thin29.js:136`)
- **Met:** the Low Rings, in the flooded lanes (8.5, 12.0).
- **Borrows now:** townsman.
- **What the game gives:** the same cool grey-green `p16f_dockman` townsman tint `[0.85, 0.95, 0.9]` as the wharf hand. No `desc`. Lines: "Roof to roof, a penny a pole. I know where the street still has a bottom." (thin29.js:137); "Mind the sinkholes. Where the water goes dark, the street went down with it." (thin29.js:137); "Pay or wade." (thin29.js:137).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A tall, rangy man of forty-five who reads the water like a page. Hair [PROPOSED] thin grey-blond, wet through, plastered flat. A long rawboned face, a drooping grey moustache, calm pale eyes. A sodden grey-green shirt. Unique: a long punt-pole rising past one ear with green weed trailing from its foot, and a water-tide mark darkening his coat to the waist.

### Ysolde Marrow, salvager (`p29_ysolde`, `js/thin29.js:138`)
- **Met:** the Low Rings (27.5, 10.6), among the roofs and upper floors.
- **Borrows now:** townswoman.
- **What the game gives:** the plum-tinted `p16f_dockwoman` townswoman `[1.05, 0.8, 1.0]`, markup 1.2, fence rate 0.45. No `desc`. Lines: "Salvage, dry and wet. I ask no questions about what you bring me, and you ask none about where I got it." (thin29.js:141); "Out of the upstairs rooms, mostly. Nobody is coming back for any of it." (thin29.js:140); "Buying or selling? Talking is extra." (thin29.js:141).
- **What the books give:** Not in the books. (Ysolde Carrow, the Consortium's Chancellor-Magnate, is another woman; Ysolde Marrow shares only the first name.)
- **Sex and rough age:** woman, about forty.
- **The portrait:** A tough, damp-haired woman of forty with an eye for brass. Hair [PROPOSED] russet, cropped ragged at the jaw. A freckled snub-nosed face with a dry mouth, grey-green eyes that say she has already been upstairs. A plum bodice, black with wet to the collarbone. Unique: a tarnished brass candlestick held up at her chest as if to show she has already found the buyer for it.

### Corvin Ash, smuggler (`p29_corvin`, `js/thin29.js:142`)
- **Met:** Stillwater Landing (9.4, 12.4), among the barrels.
- **Borrows now:** townsman.
- **What the game gives:** the cool grey-green `p16f_dockman` tint `[0.85, 0.95, 0.9]`, markup 1.4. No `desc`. Lines: "Nothing on the manifest, nothing on the quay. Look quick." (thin29.js:144); "Tobit sells news; I sell what the news is about." (thin29.js:145); "Not here. Not loud. Barrels have ears." (thin29.js:145).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about thirty-five.
- **The portrait:** A narrow, cat-footed man of thirty-five with eyes slid to the side. Hair [PROPOSED] oily black beneath a low grey hood pushed half back. A hawk nose, a thin dark moustache, a thin lipless smile. A grey-green coat buttoned to the chin. Unique: a short pale knife-scar across his chin, and a finger laid against his lips.

### Prue Lettice, broadsheet-seller (`p29_prue`, `js/thin29.js:146`)
- **Met:** Stillwater Landing (17.8, 11.6), at the free-to-read board.
- **Borrows now:** townswoman.
- **What the game gives:** the plum-tinted `p16f_dockwoman` townswoman `[1.05, 0.8, 1.0]`. No `desc`. Lines: "Cantabile sheets, three weeks old, still true. The board is free to read; I only charge for the ones I read aloud." (thin29.js:147); "SYNOD REASSURES, it says, every week. I put it up anyway. People like to see what they are not to believe." (thin29.js:147); "Read the board. That is what it is for." (thin29.js:147).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about thirty-two.
- **The portrait:** A bright, sardonic woman of thirty-two with a half-smile saying she knows what you will not believe. Hair [PROPOSED] dark blonde, a short blunt cut under a plum cap. A narrow clever face, hazel eyes, ink on the corner of her mouth. A plum bodice with newsprint-grey cuffs. Unique: a flat bundle of broadsheets held in the crook of one arm and a pinch of black type-ink on the tip of her nose.

### Odile Quayle, book-runner (`lib_odile`, `js/libraries26.js:74`)
- **Met:** Stillwater Landing's Bonded Store (Parts 1 and 2).
- **Borrows now:** townswoman.
- **What the game gives:** plain townswoman painting, markup 1. Name marked [PROPOSED] (libraries26.js header). Lines: "Everything here came up the river inside something else." (libraries26.js:76); "Broadsheets, novels, sermons, filth, hymnals. I do not judge, I only carry. Mind the lamp." (libraries26.js:77); "If you are from the lock, you have seen nothing. If you are not, you have still seen nothing." (libraries26.js:78).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about thirty-eight.
- **The portrait:** A brisk, amused woman of thirty-eight, composed to the edge of laughter. Hair [PROPOSED] thick dark curls pinned up under a flat linen cap. Broad cheekbones, sly dark eyes, a long smile. A tight mouse-grey bodice. Unique: a pair of thin reading-spectacles on a cord at her chest and a loose page of printed text held to her collar, hidden by her thumb.

### Marl Dunning, bass (`p17n_marl`, `js/longnight17.js:584`)
- **Met:** the Root-vault under the Conservatory orchard, in the Long Night vigil (Extras menu).
- **Borrows now:** townsman.
- **What the game gives:** the `hob` painting (shaven head, bare arms, leather apron) tinted `[0.82, 0.9, 1.05]`, a cool blue-grey cloth (longnight17.js:567). No `desc`. Lines: "Does it ring? Don't answer. There is no breath to spare. Hold the middle of the note and it will find you." (longnight17.js:264); "My mother hummed it into the hollow of the oldest tree every year and never said what for. I have hummed it forty." (longnight17.js:269); "Sing, or sit down." (longnight17.js:266).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about fifty-five.
- **The portrait:** A big-chested bass of fifty-five, sitting very upright with his eyes open. Shaven or close-cropped head [PROPOSED], grey at the sides, with a heavy brow and a broad, calm nose. A slack, patient mouth, deep voice-lines at the throat. A cool slate-blue wool smock. Unique: hands laid flat and still in his lap as in the keeper's pose, a tuning-fork's brass shine at his belt.

### Tansy Quill, apprentice (`p17n_tansy`, `js/longnight17.js:585`)
- **Met:** the Root-vault under the Conservatory orchard, in the Long Night vigil.
- **Borrows now:** townswoman.
- **What the game gives:** the townswoman painting tinted `[0.8, 0.95, 1.12]`, a cool blue (longnight17.js:567). No `desc`. Lines: "Is it always this cold? Marl says it is the coldest place in the Reach. I thought he was being a Cantor about it." (longnight17.js:277); "I keep losing my place on the turn." (longnight17.js:278); "I have never been this far from the Conservatory in the dark." (longnight17.js:285).
- **What the books give:** Not in the books. (The only Tansy is a five-year-old girl on the Cay, Book Two `Part One Ch4-7.md:853`, a different child.)
- **Sex and rough age:** woman, about seventeen.
- **The portrait:** A thin, round-eyed girl of seventeen, shivering. Hair [PROPOSED] chestnut, chin-length and tousled, tucked into a hooded blue-grey cowl. Frost on her lashes, a red chilled nose, a small anxious mouth. A wool scarf wound up to her chin. Unique: a ring of frost along her hairline and her breath visible as a small cloud before her lips.

### Jory Fenn, lamplighter (`p17n_jory`, `js/longnight17.js:586`)
- **Met:** the Root-vault under the Conservatory orchard, in the Long Night vigil.
- **Borrows now:** townsman.
- **What the game gives:** the townsman painting tinted `[1.0, 0.85, 0.72]`, a warm rust cloth (longnight17.js:567). No `desc`. Lines: "I brought the oil. Six lamps, and a flask each, he says. I said that is not much of a plan." (longnight17.js:290); "Lamps first. The moths come for the light and the dark comes for the rest." (longnight17.js:291); "I have lit lamps in the Reach for twenty years. First time one has been lit for something." (longnight17.js:295).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A lined, practical man of forty-five with lamplight on half his face. Hair [PROPOSED] short, ginger gone dusty, under a rust-brown cap. A weathered jaw, kind grey eyes, a dry half-smile of someone who finally has a reason. A rust waistcoat. Unique: a flask of lamp-oil held up at his chest with a cork between his teeth, and a smear of soot on his forehead.


---

# THE SPECTRAL WOODS (Whisper-Grove, the Malting, the Mausoleum yard)

How the Hollows are drawn (all the entries below that say "Hollow"): the `hollow` sprite is a faded, grey-blue figure in grey rags; "a recolour of one of these is a state of the whole person (the Hollows: faded, grey-blue), not dyed cloth" (js/faces124.js:48). The books: "The man at the nearest pump had a wedding ring on his hand and a scar through one eyebrow and a face as smooth and empty as a pond with nothing in it" (`Book One/Chapters/05 The Quarry.md:88`); "A Hollow is a person with the top layer lifted off, and what is left underneath keeps working, the way a mill keeps turning when the miller has gone." (`Chapters/14 Entry.md:86`). A Hollow portrait should be a living face with the light gone out of it: eyes open, wet, level, nothing behind them.

### Oswin Marl, Veil ledger-keeper (`p15l_veil`, `js/ledger15.js:661`)
- **Met:** Whisper-Grove (23.4, 41.2), after the Greening, where he cashes the Consortium's letters of credit at 15 percent.
- **Borrows now:** townsman (tier high).
- **What the game gives:** plain townsman painting, standing still. No `desc`. Lines: "You are welcome at the desk. It is not much of a desk. Everything on it is kept." (ledger15.js:136); "Ledger-keeper. If it is paper, I will read it. If it is owed, I will write it down." (ledger15.js:137); "Raised voices are written down too. Shall I begin?" (ledger15.js:138).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about sixty.
- **The portrait:** A dry, neat old clerk of sixty who has been kept by the Veil and has kept it back. Hair [PROPOSED] snow-white, a monk's fringe round a bald crown. A long, folded face like a closed ledger, small black eyes, bloodless lips. A black Veil coat buttoned to a white neckband. Unique: a pair of wire-rimmed half-spectacles low on the nose and a quill held upright at his chest like a candle.

### Amos Fell, the Hollow sexton (`sexton`, `js/data.js:1046`)
- **Met:** the graveyard west of the Mausoleum in Whisper-Grove (10.6, 21.4, maps.js:1047), digging a grave that is dug and filled again.
- **Borrows now:** townsman.
- **What the game gives:** the `sexton` sprite: "a ragged hood and coat, both hands resting on a long-handled shovel" (people25.js:641). The name Amos Fell appears when you free him: "Amos Fell sits on the edge of the filled grave with his spade across his knees and his cap in his hands" (data.js:1050). Lines: "...one more before the light goes... one more..." (data.js:1047); "...deep enough... not deep enough... one more..." (data.js:1047).
- **What the books give:** Not in the books. (The Oakhaven sexton is unnamed there; Amos Fell is the game's own.)
- **Sex and rough age:** man, about sixty-five.
- **The portrait:** A stooped old gravedigger of sixty-five, eyes open on nothing. Hair [PROPOSED] grey, matted and clay-streaked, a few strands under a ragged hood. A heavy jaw with grey stubble, sunk dull brown eyes. A torn smock stiff with grave-earth. Unique: a smear of fresh black soil across the forehead and the polished wooden haft of a spade rising past his cheek.

### The Hollow mourners (`mourner`, `js/data.js:1074`)
- **Met:** Whisper-Grove's Mausoleum yard: four walk the yard-to-Mausoleum route in a loop (maps.js:1126 to 1131).
- **Borrows now:** townswoman (all four, one id).
- **How many and how chosen:** one definition, four on the map at once, phased along the route; the portrait is the one `townswoman`.
- **What the game gives:** the `mourner` sprite: "a veiled figure in dark rags, white lilies held at the chest, barefoot" (people25.js:725). Lines: "...lilies for the Cantor... lilies..." (data.js:1075); "...we're late... the bell hasn't gone..." (data.js:1075); when the bell is rung: "'...there,' she says, to no one. '...there now.'" (data.js:1077).
- **What the books give:** The books have no mourners as such; the nearest are the Hollows' loops (see above).
- **Sex and rough age:** women; four ages.
- **Four faces for the pool [PROPOSED]:** (1) a woman of fifty with her black veil lifted in a net across fair-grey hair and a face grey as ash, white lilies glowing faintly at her chest; (2) a very old woman of eighty, tiny, the veil hanging crooked over a toothless slack mouth; (3) a woman of thirty with dark wet eyes and a cheek-bone like a blade, lilies held in tight fists; (4) a broad woman of fifty-five with plaits of iron-grey hair under the veil and a bruised, patient tilt to her head.

### The lamplighter, a Hollow (`lamplighter`, `js/data.js:798`)
- **Met:** Whisper-Grove's plaza (20.5, 21.5, maps.js:850), in a loop.
- **Borrows now:** townsman.
- **What the game gives:** the `hollow` sprite. Line: "...the lamps are late tonight..." (data.js:798).
- **What the books give:** Book One, ch.15 (`Chapters/15 Statistical Anomaly.md:20`): "a lamplighter with his pole, going along Bell Yard lighting lamps that had no oil in them and had not been filled since 416, touching the taper to the wick and waiting, and moving on to the next one, and at the end of the row turning around and coming back to the first." Lyra "watching an old man light a lamp that would not light" (:22).
- **Sex and rough age:** man, old (book: "an old man").
- **The portrait:** An old man of seventy with a gentle, lowered, hopeful face turned toward a lamp that is not there. Hair [PROPOSED] a thin white halo, a bare spotted crown. Pale slack lips parted on "the lamps are late". Faded grey-blue cloth. Unique: the tip of a taper held up by his cheek, the wick-end black and the wick not lit, and wet eyes that keep waiting.

### Bettis Renn, "A Hollow with a basket" (`bettis`, `js/data.js:799`)
- **Met:** the Malting, in the harvest-house (23.0, 18.3, maps.js:930), until she is kept awake and carried to the Kestrel.
- **Borrows now:** townswoman. After she wakes the shown name is "Bettis Renn".
- **What the game gives:** the `hollow` sprite; on the Kestrel she is the plain townswoman (cutter68.js:298). Line: "...I will go second..." (data.js:799).
- **What the books give:** Book Two (`Book Two/Part One Ch4-7.md:851`): "Bettis Renn. Recovered from the harvest-house at the Malting. Has not spoken a word since the Cloister road, and has stopped screaming. Carried." Book Three: Sable "putting Bettis Renn's name back in her" (`Book Three/Part One Ch1-4.md:1359`). No look lines.
- **Sex and rough age:** woman; adult, age not stated.
- **The portrait:** A woman of thirty with a face scrubbed raw by weeping and then emptied. Hair [PROPOSED] flax-fair, chopped short and uneven, as if cut for her. Open grey eyes fixed forward, a mouth set to say "second" and not saying it. A grey-blue Hollow's rag. Unique: a small willow basket held in front of her chest by the handle with both hands, as though waiting to be called.

### A stray cat of Whisper-Grove (`cat`, `js/data.js:797`)
- **Met:** Whisper-Grove, near the water-light; she takes food on three different days and then follows you (tavern11.js header).
- **Borrows now:** townsman (the portrait that opens when you talk to the cat). This is the one borrower who is not a person.
- **What the game gives:** the `cat` sprite at scale 0.38. Lines: "The cat does not care." (data.js:797). Offer text: "A grey cat, wet to the elbows, sits where the water-light is best. She looks at the food in your hand and then at your face, in that order, as if one of them might be lying." (tavern11.js:124); "She is not a Hollow. She remembers all of it and keeps her own counsel." (tavern11.js:130).
- **What the books give:** Not in the books.
- **Sex and rough age:** female cat, adult (tavern11.js:124 says "she").
- **The portrait:** A cat's portrait, not a man's. A lean grey female cat, slightly damp, seated in green-white water-light with her chin lifted and one ear turned. Fur [PROPOSED] smoke-grey with paler grey ruffs, a tufted torn left ear. Wide amber eyes with narrow pupils that judge. Unique on this list: the only animal; a bead of water on her whisker and the marble edge of a flooded step behind her.

### A man against the wall, the twice-taken man (`p31_twice`, `js/grove31.js:122`)
- **Met:** Ashlane, off the Sunken Court in Whisper-Grove, sitting against a wall.
- **Borrows now:** townsman.
- **What the game gives:** a drawn sprite `p31_seated` (grove31.js:156 to 163): coat `[74, 72, 66]` (grey-olive), skin `[176, 162, 146]`, hair `[70, 62, 54]` (dark brown-grey); the head tipped back to the wall, open eyes, "the mouth, slack". Lines: "He has not moved. His eyes follow you. There is nothing behind them." (grove31.js:97); "His eyes are open and wet and they follow you when you crouch in front of him" (grove31.js:96).
- **What the books give:** Book One ch.14 (`Chapters/14 Entry.md:84-88`): "He was in the Ashlane, sitting against a wall with his legs straight out in front of him, and he was not doing anything. ... His eyes were open and wet and they tracked her when she crouched in front of him, and there was nothing behind them, and there would never be anything behind them again, because the Office had pressed him a second time." No age or hair is given. The game follows the book.
- **Sex and rough age:** man; age not given (the game sprite suggests forty-five).
- **The portrait:** A man of forty-five seated, head tipped back against stone. Hair [PROPOSED] dark brown going grey, uncombed. A slack, unshaven face, the lower lip hanging, eyes wide open, wet and bright and following you; nothing behind them. A grey-olive coat with the collar sagging. Unique: both hands lying open and palm-up on the stones beside him, at the very edge of the frame.

### The Hollow with a broom (`p31_sweeper`, `js/grove31.js:124`)
- **Met:** the Bell Yard in Whisper-Grove, on the step.
- **Borrows now:** townsman (but the line says "she": "...the step, then the next step... she likes the step done...", grove31.js:125).
- **What the game gives:** the `hollow` sprite. Line as above.
- **What the books give:** Book One has Hollows sweeping and washing in loops (`Chapters/14 Entry.md:86`), but no sweeper by name.
- **Sex and rough age:** the line says "she"; the borrowed portrait is a man. The portrait follows the line: a woman.
- **The portrait:** A woman of sixty, bent a little over the handle of a worn birch broom she is holding upright. Hair [PROPOSED] grey, in a long dry plait coiled flat on her head. A mild, pale, soft-chinned face with the light gone from it, eyes lowered to the step. Faded blue-grey sacking apron. Unique: fine step-dust on her sleeve and the bristles of the broom raised close to her cheek, still moving.

### The Hollow at a window (`p31_jugs`, `js/grove31.js:126`)
- **Met:** the Bell Yard, at a first-floor window.
- **Borrows now:** townswoman.
- **What the game gives:** the `hollow` sprite. Line: "...the blue one, and the white one... the blue one, and the white one..." (grove31.js:127).
- **What the books give:** No such figure by name (the loops are as above).
- **Sex and rough age:** woman, about forty.
- **The portrait:** A woman of forty framed as if in a window, her hands lifting something out of sight and setting it down again. Hair [PROPOSED] auburn, dull, unpinned and falling in front of one shoulder. A pleasant plain face smoothed to calm, hollow cheeks, wet grey eyes. A faded green blouse. Unique: two small clay jugs side by side on the sill at the edge of the picture, one blue and one white.

### The Hollow at the shutters (`p31_shutters`, `js/grove31.js:128`)
- **Met:** the Bell Yard, by a pair of shutters.
- **Borrows now:** townsman.
- **What the game gives:** the `hollow` sprite. Line: "...latched... latched... you can never be too sure..." (grove31.js:129).
- **What the books give:** The shutters are in the book (the Bell Yard is a street of shutters latched and streets swept, grove31.js header; ch.15). No person.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A heavy-shouldered man of fifty with one hand lifted to a latch. Hair [PROPOSED] sparse, rust-grey, cut square across the neck. A square slack face, thick brows, grey eyes that check and check again. A pale blue-grey shirt. Unique: a brass shutter-hook between two fingers and the grain of a weathered shutter blurring half the picture.

### The Hollow among the shelves (`lib_shelver`, `js/libraries26.js:89`)
- **Met:** Whisper-Grove's Moot-house library, shelving books by size.
- **Borrows now:** townsman.
- **What the game gives:** the `hollow` sprite. Lines: "...on the left, by size... not by name... not by name..." (libraries26.js:91); "He lifts a book from the bench and shelves it, carefully, by size. Then he takes it down again and shelves it again." (libraries26.js:97).
- **What the books give:** The Moot-house is in Book One ch.14 and ch.16; no shelver is named.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A slight, bookish man of forty-five with ink-stained fingers. Hair [PROPOSED] neat brown, thinning, still parted. A narrow intelligent face, wide wet brown eyes, soft lips that move on "by size". A faded blue-grey waistcoat. Unique: a single thin bound volume held flat against his chest with both hands, and the tall dim spines of the shelves behind him, ordered by height.


---

# PORT CANTABILE (the Salt Stair, the Mole, the Lantern Yard, Driftwood Cay)

Three notes for this section. (1) The twelve Cantabile coats are townsman/townswoman/hob paintings recoloured in `js/cantabile17.js:886-889` (tints given per person). (2) The portrait `townswoman` is set explicitly for eight of these entries (grep lines 1445 to 1460); the other six (Kerrow, Teel, Sloe, Dunmore, Quain, the deck-hand) get the `townsman` default from the `pers` helper at cantabile17.js:1442, so the grep did not list them; they are included here as "beyond the grep". (3) `p17c_hesper2` and `p17c_quain2` are the same people stood a second time on the Cay (cantabile17.js:1206 and 1204), so each gets one entry.

### Oona Salt, the Harbour-Queen (`p17c_oona`, `js/cantabile17.js:1445`)
- **Met:** the Mole-head by the bell (75.8, 52.2), where she takes the dues at the slack.
- **Borrows now:** townswoman.
- **What the game gives:** townswoman tinted `[0.7, 0.8, 1.15]`, a dark cold blue (cantabile17.js:886). No `desc`. Lines: "What's she singing?" (cantabile17.js:268); "I have ears, a harbour and a headache, and I can only put down one of them." (cantabile17.js:269); "That is the count,' she says, in the voice she uses for tide-tables. The voice does not shake. Her hand does, and she puts it flat on her coat, where nobody can see." (cantabile17.js, `ringEnd`).
- **What the books give:** Book Two (`Book Two/Part One Ch1-3.md:35`): "She was fifty-six, built like a capstan, in a coat that had been an admiral's before she took it off an admiral. She was the Harbour-Queen of Port Cantabile, which is not a title anybody gives you and not one anybody can take back". Book Four (`Book Four/Part One Ch1-4.md:658`): "Oona Salt met them at the mast-tower in her admiral's coat with a burn across the back of one hand and a face like a closed fist."
- **Sex and rough age:** woman, fifty-six.
- **The portrait:** Followed from the book. A woman of fifty-six "built like a capstan": thick neck, wide shoulders squared to the frame. Hair [PROPOSED] iron-grey, cropped short, wind-flattened. A face "like a closed fist": heavy jaw, deep creases beside the mouth, small pale sea-grey eyes watching the water behind you. She wears an old admiral's blue coat with tarnished brass buttons and a high stiff collar, the shoulder-braid cut off. Unique: a puckered burn scar across the back of one hand, laid flat on the coat at her chest.

### Auld Bessa, the last Reef-Reader (`p17c_bessa`, `js/cantabile17.js:1446`)
- **Met:** the Mole steps (57.2, 52.4), sitting on a bollard.
- **Borrows now:** townswoman.
- **What the game gives:** townswoman tinted `[0.95, 0.95, 1.0]`, nearly unchanged, a faintly cool cream and grey (cantabile17.js:886). No `desc`. Lines: "Eyes shut, head on one side. That is how it is done. What's she singing?" (cantabile17.js:300); "I am eighty-four. If you want something, it had better be short." (cantabile17.js:302); the intro: "The old woman sits on a bollard at the Mole steps with her head on one side, as if the sea were a long way off and talking low." (cantabile17.js:303).
- **What the books give:** Book Four (`Book Four/Part One Ch1-4.md:984`): "Auld Bessa, in the stern-sheets of the Merret ... a hundred feet below, eighty-four years old, with her eyes closed and her head on one side ... In her cracked thin voice". (:892) "The last Reef-Reader on the Rust Coast." Vol II (`Vol II - Gazetteer and Bestiary.md:316`): "(f, 80s) Can name the sea's key by ear."
- **Sex and rough age:** woman, eighty-four.
- **The portrait:** Followed from the book and the game. A tiny woman of eighty-four, face tipped a little to one side as if listening to a far sound. Hair [PROPOSED] sparse white, flying loose from under a faded blue-grey headscarf knotted at the nape. A face of fine deep creases with a thin mouth that has just remembered a joke. Eyes closed, lids thin and veined. A faded grey shawl. Unique on this list: eyes fully shut in the portrait, and a bit of sea-spray drying on her scarf.

### Marrin Tace, widow (`p17c_tace`, `js/cantabile17.js:1451`)
- **Met:** a room cut into the rock on the Salt Stair's fourth landing (4.6, 2.4).
- **Borrows now:** townswoman.
- **What the game gives:** townswoman tinted `[0.78, 0.8, 0.9]`, a muted dusty grey-blue (cantabile17.js:887). No `desc`. Lines: "Mind the step. I sweep it every morning, and every morning it is salt again." (cantabile17.js:347); "I do not sell it. That is the first thing everyone asks." (cantabile17.js:349); "Jory Tace, pilot, lost off the Cay passage three years ago and not found." (cantabile17.js:350).
- **What the books give:** Not in the books. (Vox-bottles are in Books Two and Three; Marrin Tace and Jory Tace are not.)
- **Sex and rough age:** woman, about fifty.
- **The portrait:** A neat, restrained widow of fifty. Hair [PROPOSED] brown-grey, smooth, parted in the middle and pinned in a low knot, with a few salt-pale strands at the temples. A long, thin, patient face, brown eyes that look slightly to one side as though at an unopened bottle, lips pressed together to hold something in. A dusty blue-grey bodice, a white collar spotless. Unique: a small tin pilot's-whistle shape faintly visible on a cord at her breast, worn bright.

### Hesper, of the four houses (`p17c_hesper`, `js/cantabile17.js:1453`; same person as `p17c_hesper2`, :1454)
- **Met:** the Lantern Yard (13.8, 51.4), where she runs four houses; again on Driftwood Cay (11.5, 21.4) at the orphan-house.
- **Borrows now:** townswoman (both ids).
- **What the game gives:** townswoman tinted `[1.05, 0.9, 0.85]`, a warm dusky rose (cantabile17.js:888). No `desc`, but the intro describes her: "She is a big slow woman with a soft face and a voice like a foghorn, and she has buried, she says, more children than most women on the Coast have borne." (cantabile17.js:406). Lines: "Four houses, and a Cay, and nine children at supper tonight, and I have lost count, which is not a thing I say lightly." (cantabile17.js:404).
- **What the books give:** Book Four (`Book Four/Part One Ch1-4.md:820`): "Hesper was alive. She was sitting on an upturned bucket by the garden wall with her arm in a sling, a big slow woman with a voice like a foghorn". The game's description follows it.
- **Sex and rough age:** woman; age not stated (the books' "buried more children than most women have borne" suggests sixty).
- **The portrait:** Followed from the book. A big, slow, soft-faced woman of sixty, rounded shoulders, filling the frame. Hair [PROPOSED] thick pewter-grey, in a heavy bun at the back, a stray lock across her cheek. A broad kind face, a double chin, small deep-set brown eyes that have stopped expecting thanks. A dusky rose dress with an apron. Unique: a small brass supper-bell held in one large hand at her chest, and orphan-house flour on her sleeve.

### Mags Tennant (`p17c_mags`, `js/cantabile17.js:1457`)
- **Met:** the foot of the mast-tower (79.2, 50.3), watching the Yard.
- **Borrows now:** townswoman, although she has her own portrait (`img/p_mags.jpg` exists). The sprite is `mags`, not a tint.
- **What the game gives:** the `mags` painting, which the code describes as "The boatwright: grey hair in a bun, a blue coat, one arm in a sling, a coil of rope over the other shoulder" (people25.js:694). Lines: "Mags watches your mouth, and then your hands. She signs: Here." (cantabile17.js:415); "She watches your mouth and then your hands, and signs: Here. Then the list, slowly: Dues. Chandler. Third landing. Dark." (cantabile17.js:418); "Not aboard. Never aboard." (cantabile17.js, `bottle`).
- **What the books give:** Book One (`Book One/Book One - The Silenced Province (full manuscript).md:1325`): "Margarethe Tennant was six feet and some inches of Rust Coast bosun, with forearms like hawsers and a face like a closed door, and she had been deaf since the day she was born." Book Three (`Book Three/Part Three Ch9-12.md:1017`): "Mags's eyes found hers, steady and grey and absolutely without panic." Book Two (`Part One Ch4-7.md:320`): "deaf from birth ... had come aboard the Wave-Cutter at nineteen". The game's "grey hair in a bun" does not match a woman who came aboard at nineteen and is a working bosun.
- **Sex and rough age:** woman. Book: deaf from birth; about thirty-five (aboard the Wave-Cutter at nineteen, before 414).
- **The portrait:** Followed from the book. A very tall, powerful woman of thirty-five whose head almost fills the frame, jaw set, "a face like a closed door". Hair [PROPOSED] dark brown, cropped to the collar, wind-cut, with no grey. Steady grey eyes that watch your mouth rather than your eyes; a wide plain mouth. A salt-stiffened blue bosun's coat open over a rough shirt, sleeves rolled. Unique: both heavy forearms crossing her chest and one hand lifted in a flat sign, thumb at her ear.

### A net-wife on the fifth landing (`p17c_wife`, `js/cantabile17.js:1458`)
- **Met:** the Salt Stair's fifth landing (29.0, 27.6).
- **Borrows now:** townswoman.
- **What the game gives:** townswoman tinted `[0.9, 1.0, 0.88]`, a pale sea-green (cantabile17.js:889). Name "A net-wife on the fifth landing" (cantabile17.js:427). Lines: "Mind the rail. It is a hundred and ninety feet from here to the Yard roofs, and the Yard roofs are not soft." (cantabile17.js:428); "They light the Stair at dusk, one landing at a time, from the bottom up. The lamplighter is on his fourth in three years." (cantabile17.js:429); "I am mending. If you are going to talk, hold the other end." (cantabile17.js:430).
- **What the books give:** Not in the books.
- **Sex and rough age:** woman, about forty-five.
- **The portrait:** A weathered woman of forty-five framed by a heap of netting on her lap. Hair [PROPOSED] fair, sun-bleached to straw, in a braid pinned up under a sea-green kerchief. A sharp tanned nose, light blue eyes squinting against wind, a mouth dry with dry humour. A sea-green smock tied at the neck. Unique: a netting-needle held between her teeth, a coil of tarred net across both hands held out toward you ("hold the other end").

### A child on the Cay (`p17c_child`, `js/cantabile17.js:1460`)
- **Met:** Driftwood Cay, the burying-ground (16.0, 18.0), among the grave-bells.
- **Borrows now:** townswoman.
- **What the game gives:** townswoman tinted `[1.15, 1.1, 1.0]`, a bright warm cream (cantabile17.js:889). Name "A child on the Cay". Lines: "That one is my brother's. He was three. It only rings when the wind is from the west, and nowhere else." (cantabile17.js:440); "Hesper says the crooked one rings crooked because the hook is crooked. I say it rings crooked because he was." (cantabile17.js:441); "Shh. You will frighten the bells." (cantabile17.js:442).
- **What the books give:** Not named. The Cay and its orphans are in Book Two (`Book Two/Part One Ch4-7.md:853`): "a girl of five called Tansy" is a Cay child by name, but she is a different child.
- **Sex and rough age:** child; sex not stated (the borrowed portrait is a woman's). About eight.
- **The portrait:** A small, serious child of eight with a solemn face and mismatched sleeves. Hair [PROPOSED] cropped, sandy, ragged, as if cut with a knife. A scab on the chin, wide pale eyes that watch the bells, a faint stubborn mouth. A cream smock far too big, the cuffs rolled. Unique: one finger raised to her lips, and a tiny rust-coloured bell at the very edge of the frame, hung crooked on a bent hook.

### Kerrow, Harbour office (`p17c_teague`, `js/cantabile17.js:1444`) [beyond the grep]
- **Met:** the Harbour office (7.5, 2.2), at the foot of the Stair's first flight.
- **Borrows now:** townsman (default of `pers`, cantabile17.js:1442).
- **What the game gives:** townsman tinted `[0.8, 0.88, 1.0]`, a cool grey-blue (cantabile17.js:886). Lines: "Harbour office. If it is dues, it is not me. If it is not dues, it is still not me." (cantabile17.js:248); "Be quick. The tide will not wait, and neither will the Harbour-Queen." (cantabile17.js:249); "Kerrow reads them in the voice you would use for a tide-table." (cantabile17.js:257).
- **What the books give:** The shown name Kerrow is not in the books. The id says "teague", and the books have a Teague on Oona's Mole crew ("Teague came down the ladder with the boat-hook", `Book Two/Part One Ch1-3.md:133`), but no description, and not as a clerk.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A pale, tired official of fifty with an unhurried voice. Hair [PROPOSED] iron-grey, thin, combed over a spotted dome. Tired, pouched grey eyes that read a tide-table without blinking. A colourless grey-blue coat buttoned to a flat collar. Unique: a rubber stamp and a stub of chalk held at his chest, and a faded harbour dues-chit pinned to his lapel.

### Hollis Teel, Free Captain (`p17c_teel`, `js/cantabile17.js:1447`) [beyond the grep]
- **Met:** the Yard (49.6, 54.2), seated on a bollard with his boots on a coil of rope.
- **Borrows now:** townsman (default).
- **What the game gives:** townsman tinted `[1.1, 0.85, 0.7]`, a warm rust (cantabile17.js:887). Lines: "Hollis Teel, the Long Odds. Salvage and nothing else, whatever you have heard. What's she singing?" (cantabile17.js:317); "I am sitting on the best bollard in the Yard and I am not moving." (cantabile17.js:319); intro: "He sits on a bollard with his boots on a coil of rope and a stone jar between them, and sings a little under his breath, and stops when he sees you listening." (cantabile17.js:320).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about fifty-five.
- **The portrait:** A leathery, amused sea-captain of fifty-five. Hair [PROPOSED] black going silver at the temples, unruly, with a faded red bandana tied over it. A full black-and-silver beard, a broken-veined nose, bright black eyes that laugh at the sea. A rust-coloured coat with tarnished brass. Unique: a stone rum-jar raised half-way up to his chest, and a half-sung note on his open mouth.

### Fenwick Sloe, chandler (`p17c_sloe`, `js/cantabile17.js:1448`) [beyond the grep]
- **Met:** the chandler on the Salt Stair's third landing (6.0, 2.4), with a diving-helm in his window.
- **Borrows now:** townsman (default).
- **What the game gives:** the `hob` painting (shaven head, bare arms, leather apron over a dark shirt) tinted `[0.85, 0.95, 0.8]`, a pale green-grey cloth (cantabile17.js:887). Shop, markup 1.1. Lines: "Rope, tar, lamp-oil, brass. The brass is from Fortis. Do not look at me like that, they all say it." (cantabile17.js:331); "I do not haggle. Haggling is a form of theft and the Harbour has a view." (cantabile17.js:333); "Your engineer will say it is the wrong thread. It is the right thread." (cantabile17.js:339).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A round-headed, bald man of fifty with a trader's sceptical squint. Shaven, shiny skull, a short grey bristle on the jaw, thick bare forearms. Small, quick, guarded eyes; a mouth ready to say "mostly". A sage-grey apron over a dark shirt. Unique: a small brass gauge-valve in a twist of oiled cloth held up at his chest, one eyebrow lifted at its price.

### Mr. Dunmore, Receiving Clerk (`p17c_dunmore`, `js/cantabile17.js:1452`) [beyond the grep]
- **Met:** a trestle desk in the Yard (46.0, 54.3), with a ledger, a stamp and a brass-bound box.
- **Borrows now:** townsman (default).
- **What the game gives:** townsman tinted `[0.7, 0.72, 0.76]`, an almost colourless grey (cantabile17.js:888), the Office's grey. Lines: "Bottles are received, graded and reconciled. Receipts are stamped." (cantabile17.js:374); "There is a queue. It is, at present, you." (cantabile17.js:376); the intro: "His coat is grey. He is pleasant in the way a closed door is pleasant." (cantabile17.js:377).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A bland, civil man of forty-five. Hair [PROPOSED] mouse-grey, parted exactly on the left, oiled flat. A smooth, regular, forgettable face, mild light eyes that look kindly at a point just past you, a small perfectly polite smile. A flat grey Office coat with a plain stand collar. Unique: a rubber receipt-stamp held up as if for inspection in a spotless hand, and not a hair out of place.

### Marlow Quain, pilot (`p17c_quain`, `js/cantabile17.js:1455`; same person as `p17c_quain2`, :1456) [beyond the grep]
- **Met:** the Mole steps (59.4, 54.1), asleep in his boat; again on Driftwood Cay (5.2, 15.7) after the crossing.
- **Borrows now:** townsman (default, both ids).
- **What the game gives:** townsman tinted `[0.78, 0.92, 1.0]`, a pale sea-blue (cantabile17.js:888). Lines: "Cay run, a copper there and back. I go at the slack and I come back at the slack." (cantabile17.js:388); "If it is the Cay you want, sit in the stern. If it is not the Cay, I am asleep." (cantabile17.js:389); "Marlow Quain sits in his boat at the Mole steps with his hat over his eyes." (cantabile17.js:391).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A lank, sun-browned boatman of forty-five tipping an old hat back off his eyes. Hair [PROPOSED] sandy, bleached by sea-glare. A long amused face with a pale line where the hat-brim sits, narrowed pale blue eyes, a whistling mouth caught on a note. A sea-blue shirt open at the throat. Unique: the wide, battered hat itself tilted back, and a long oar-blade rising behind his shoulder.

### A deck-hand of the Yard (`p17c_hand`, `js/cantabile17.js:1459`) [beyond the grep]
- **Met:** the Yard (31.0, 53.0).
- **Borrows now:** townsman (default).
- **What the game gives:** townsman tinted `[1.0, 0.92, 0.8]`, a warm sandy cloth (cantabile17.js:889). Name "A deck-hand of the Yard". Lines: "Mind the Twelfth. The Harbour does not forbid theft, it forbids theft from its own pocket. I was a thief nine years and never once took a nail from the Harbour." (cantabile17.js:434); "Fish, tar and rum. In that order, on a good day." (cantabile17.js:435); "Not now." (cantabile17.js:436).
- **What the books give:** Not in the books.
- **Sex and rough age:** man, about thirty-five.
- **The portrait:** A hard, wiry man of thirty-five with an ex-thief's easy, unlit eyes. Hair [PROPOSED] black, shaved at the sides and left short on top, with a nick through one ear. Weather-tanned skin, a crooked broken nose, a half-smile that is mostly teeth. A sandy tar-stained shirt, collar open. Unique: a single iron nail held between his fingers at his chest, which he is obviously not stealing.


---

# THE ROADS (the townsfolk pools, the road-walkers, and the Drift-Kestrel)

These are the "people" who are not one person: a single NPC definition that many figures share. The grep found two of them (`townsman` and `townswoman`, data.js:518 and 523, named "Oakhaven orchardman" and "Oakhaven goodwife"); the road-walkers in `js/life60*.js` reach the same portraits through a fallback (`js/life60.js:175`) and are listed after them as "beyond the grep". How the portrait is chosen for all of them: the talk window reads `n.portrait` of the NPC definition (js/game.js:1737), so the portrait follows the definition's id, not the face of the figure that stands there.

### Oakhaven orchardman, and the town's townsmen (`townsman`, `js/data.js:518`)
- **Met:** all over Oakhaven and its roads, and in the Boar & Dulcimer: the orchards (50.5, 32.5), (58.5, 36.5), the lane (19.5, 23.5), the meadow (30.5, 55.5), the tavern patron (10.5, 3.5) (js/townsfolk.js:44-50); the night-watch (23.5, 20.5) and the two constables (52.5, 20.5), (23.5, 9.5) (js/roads15.js:849-850); building workers outside the doors (roads15.js:668); a night-watchman placed by js/upgrades.js:1748.
- **Borrows now:** townsman (this is the base painting itself).
- **How many and how chosen:** by the map. roads15.js:844 lists 12 townsfolk, 2 night-watch and 2 constables as the standing roster (of 16, never fewer than 8 / 1 / 1, roads15.js:64); the townsman figures among them are about nine. Up to three more "workers" stand outside each building, alternating townsman and townswoman (roads15.js:668). All use this one NPC definition, so all show the one townsman portrait.
- **What the game gives:** the plain townsman painting: cap, pale shirt with rolled sleeves, leather apron, boots. Lines: "Evening. Keep it low." (data.js:519); "Hm?" (519); "Lower your voice before something hears you." (519).
- **What the books give:** Not named. Book One has "Oakhaven" as a crowd: the dye-works women, the carters, the tannery men (`Chapters/09 Beneath.md:110`). No individual look lines.
- **Sex and rough age:** men, thirty to sixty.
- **Six faces for the pool [PROPOSED]:** (1) an orchardman of fifty with apple-red cheeks, a sun-bleached straw hat, a cut-throat pruning knife at his belt; (2) a broad carter of forty with a flattened ear and a leather cap, a whip-coil on his shoulder; (3) a gnarled man of sixty-five, nearly toothless, a wool muffler to the chin and a clay pipe, cold; (4) a lean man of thirty in a plain linen shirt, sawdust in his hair, a carpenter's pencil behind his ear; (5) the night-watchman, a heavy man of fifty-five with grey side-whiskers under a flat black hat, a horn lantern at his chest; (6) the constable, a clean-shaven man of thirty-five in a stiff dark coat with a tin whistle on a cord and a tight mouth.

### Oakhaven goodwife, and the town's townswomen (`townswoman`, `js/data.js:523`)
- **Met:** Oakhaven's market (49.5, 20.5), the west lane (9.5, 14.5), the square (56.5, 15.5), (27.5, 19.5), the Boar, and the building doors (js/townsfolk.js:46, 48; js/roads15.js:845-848); a night-watchwoman (23.6, 44.4, roads15.js:849) and one placed at (23.5, 44.5) by upgrades.js:1749.
- **Borrows now:** townswoman (the base painting itself).
- **How many and how chosen:** as above: about seven townswomen in the roster of 16, plus alternating workers outside buildings. One definition, one portrait.
- **What the game gives:** the plain townswoman painting: white headscarf, dark dress with an apron, clay jug on the hip. Lines: "Blessings of the Narrow on you. Softly, now." (data.js:524); "Yes? Quietly." (524); "Hush! The children." (524).
- **What the books give:** Not named; the Oakhaven women as a body (the washerwomen, the carters' wives) are in Book One ch.9 (`Chapters/09 Beneath.md:110`).
- **Sex and rough age:** women, twenty-five to seventy.
- **Six faces for the pool [PROPOSED]:** (1) a market-woman of forty-five, rosy, with a red-checked kerchief and a basket of apples on her arm; (2) a girl of nineteen, freckled, her copper plait over one shoulder, a shy mouth, jug in both hands; (3) a stout washerwoman of fifty with her sleeves up and red hands, wet hair stuck to her temple; (4) a thin, severe woman of sixty-five with a black shawl and a white cap, lips pursed against a draught; (5) the night-watchwoman, a tall woman of forty in a man's wool greatcoat with a shuttered lantern at her chest; (6) a young mother of twenty-eight with a sleeping baby on her shoulder, a tired smile, her free finger at her lips ("Hush! The children").

### The road-walkers: the men of the life60 places (`p60_man_a`, `p60_man_b`, `p60_man_c`, `js/life60.js:103-105`) [beyond the grep]
- **Met:** Oakhaven's lanes (27 walkers, js/life60-oakhaven.js), Port Cantabile's Yard and Stair (21, js/life64-cantabile.js), and the smaller places (26, js/life74-smallplaces.js); Whisper-Grove has 18 more, all Hollows (js/life62-whispergrove.js). Ninety-two walkers in all, each with a name like "A wharf hand" (life64-cantabile.js:61).
- **Borrows now:** townsman, by the fallback at life60.js:175: `portrait: p.portrait || (/wom|child/.test(p.sprite) ? 'townswoman' : 'townsman')`; no walker sets a portrait of its own.
- **How many and how chosen:** one `NPCS` entry per walker, staged by the clock (each place stages only its own people; Oakhaven the most, 27). Three recolours of the townsman painting: `man_a` slate-blue coat (hue 210), `man_b` moss (hue 95), `man_c` russet leather (hue 30) (life60.js:103-105). Heads, hair and skin keep the painting's own colours (faces124.js).
- **What the game gives:** lines per walker, e.g. "A goodwife of Cooper's Row" (life60-oakhaven.js:48), "Vettle's wife, the chandler's" (:41). None is described.
- **What the books give:** Not in the books by name; their trades (washerwomen, carters, wharf hands, eel-catchers) are the books' crowd.
- **Sex and rough age:** men; not stated.
- **Four faces for the pool [PROPOSED]:** (1) a wharf hand of thirty in a slate-blue coat, black stubble, a rope-burn across one cheek; (2) a ferryman of fifty in a moss-green jerkin with a white clay pipe and a grey beard braided to a point; (3) a carter's boy of sixteen in a russet leather cap, cheeks smudged, wide-eyed; (4) a tinker of sixty with a russet leather hood, one gold earring and a lazy eye, a pan hung at his shoulder.

### The road-walkers: the women and children of the life60 places (`p60_wom_a`, `p60_wom_b`, `p60_wom_c`, `p17c_child`, `js/life60.js:106-108`) [beyond the grep]
- **Met:** as above (the same four files).
- **Borrows now:** townswoman (any walker whose sprite matches `wom` or `child`).
- **How many and how chosen:** by the same staging. Recolours of the townswoman: `wom_a` madder red (hue 355), `wom_b` ochre (hue 45), `wom_c` heather (hue 255) (life60.js:106-108); children walk as `p17c_child`, the cream-tinted child on the Cay (cantabile17.js:889).
- **What the game gives:** lines per walker, e.g. "A woman with a very small hat" (life64-cantabile.js:75), "An eel-catcher" (:70).
- **What the books give:** the "woman with a very small hat" is a joke in the game's own lines (flume16.js, Tobit Dree's customers); the books have no such figure.
- **Sex and rough age:** women and girls; not stated.
- **Five faces for the pool [PROPOSED]:** (1) an eel-catcher of thirty-five in an ochre apron, hair tied in a wet rag, a silver eel's tail swinging from her fist; (2) a woman of forty in a heather-purple shawl, spectacles, a neat brown bun, wearing a very small hat; (3) a girl of ten in a madder-red cap, scabbed knee, a hoop of willow in her hand; (4) a laundress of fifty-five in madder red, steam-curled grey hair, forearms like a man's; (5) a girl of fifteen carrying a tray, ochre apron, a pencil-thin gold hoop in one ear.

### The Hollow loops of Whisper-Grove (the life62 Hollows, `p62_hollow_a`, `p62_hollow_b`, `p62_hollow_c`, `hollow`, `js/life62-whispergrove.js:36-38`) [beyond the grep]
- **Met:** Whisper-Grove's plaza and Sunken Court (18 loops: a sweeper, a woman pegging out washing, a baker kneading in a doorway, a man winding an imaginary clock).
- **Borrows now:** townsman, for every one (the fallback tests for "wom" or "child" in the sprite name, and "p62_hollow_a" has neither), including the loops the code calls women (life62-whispergrove.js, the header: "a woman at a stall wrapping nothing, a woman pegging out washing, a woman rocking an empty shawl").
- **How many and how chosen:** 18 at once; sprites `hollow` and three recolours: brown wool (`hue 30`), faded blue (`hue 205`), green furred at the shoulders (`hue 95`). The Hollows' own recolour is "a state of the whole person, not dyed cloth" (faces124.js:48).
- **What the game gives:** the name is just "A Hollow". Lines are the loop each repeats.
- **What the books give:** Book One ch.15 (`Chapters/15 Statistical Anomaly.md:20`): "The first one they passed was a woman in a good coat walking from a pillar to a basin and back. The second was a lamplighter with his pole".
- **Sex and rough age:** mixed; the code names women among them.
- **Four faces for the pool [PROPOSED]:** (1) a woman of fifty in a good brown coat, face smooth and wet-eyed, hair neat, walking from a pillar to a basin; (2) a woman of thirty at a stall, her hands folded round nothing, a faint pegging-line of grey cloth over one shoulder; (3) a stout baker of fifty with flour-dust frozen on his forearms, brows lifted in a patient "one more loaf"; (4) a woman of seventy rocking an empty shawl against her chest, white hair scraped back, lips counting.

### Pennick, the Kestrel's engineer (`p16k_pennick`, `js/kestrel16.js:917`)
- **Met:** the Drift-Kestrel's tank-room below decks, after the escape (Part Three on); recruit him to take the tanks in hand.
- **Borrows now:** townsman (tier high).
- **What the game gives:** the townsman tinted `[0.7, 0.86, 1.04]`, "recoloured to engineer's blue-grey with the goggles pushed up" (kestrel16.js:975), two brass-rimmed lenses on the cap. No `desc`. Lines: "Mind the pipework. It is older than your manners and in better shape." (kestrel16.js:302); "It is going to fail. I am only deciding which morning." (kestrel16.js:303); "Touch nothing. If you must touch something, tell me what, so I know where to start." (kestrel16.js:304).
- **What the books give:** The books make him a young man and kill him. Book Three (`Book Three/Part One Ch1-4.md:547-557`): "He had hired him off the dock at Stillwater Landing for two sovereigns a month and his keep, because he had stood at the foot of the gangway talking to the Kestrel's lift-tanks as if they could hear him ... Pennick had slept in the tank-cradle. He had named the tanks." "Jonah Pennick. From Greystairs, in the Peaks. He was twenty-four. He had a sister in the Lodestone Vaults." Tobiah: "He talked to the tanks and he talked to me." He is lost when he cuts the Grandmother loose (:283). `Vol III (b) - Errata and Rulings.md:49`: "Pennick died in Book Three Ch1, and Tobiah is his heir." The game keeps him alive as a recruitable old pessimist; the book's Pennick is twenty-four.
- **Sex and rough age:** man. Book: twenty-four. The game's lines read middle-aged; the portrait follows the book.
- **The portrait:** A thin, earnest young man of twenty-four talking to a tank as if it could answer. Hair [PROPOSED] untidy ink-black, flattened by the goggles pushed up onto a battered blue-grey cap. A narrow Peaks face, big dark eyes, a streak of tank-oil across one cheek, a worried half-smile. An engineer's blue-grey coat, collar up. Unique: the two brass-rimmed goggle lenses glinting on the cap above his brow, and a copper tank-valve wheel in one grimy hand at his chest.


---

# THE DAWNING HEIGHTS (Sol-Luminary, the Tiers, Sun-Peak Vigil)

Book and game agree on one thing here: the Umbral folk of the Tiers live in black and keep their faces down (Book Two Part Two Ch8-14:745, "Every shutter on every hanging house was open a crack. Nobody spoke."). The Vigil clergy are the game's own: the books name only Coriel, and only in the bible.

### Winchmaster Bardo (`p94_bardo`, `js/anchorage94.js:319`)
- **Met:** the Sky-Dock winch-room, Sol-Luminary (anchorage94.js:140, at 43.4, 14.6).
- **Borrows now:** townsman (a 45-year-old in a green cap and apron).
- **What the game gives:** own sprite: "Bardo: fifties, broad, bare-headed and grey, a harness over a black coat, the notched link at his belt" (anchorage94.js:233): brake-gloves, a harness of crossed straps with three steel clips, a grey beard, the link in his belt. Lines: "Light keep you true, and keep your boots off my brake." (:123); "Nineteen men, to jerking tethers. I cut each one in the housing, where I have to look at it." (:128, the 'nineteen' topic); "I have nineteen strokes up here, and I have stood at the top of that stair and heard nineteen men hauling. I do not go down." (:132).
- **What the books give:** Not in the books by look. `World Bibles/Vol II - Gazetteer and Bestiary.md:98`: "Sky-Dock Winchmaster Bardo *(m, 50s)* ... Runs the tether-chains. Swears beautifully. Has lost nineteen men to jerking gravity tethers and keeps their tally cut into his winch housing." Sound only: he swears.
- **Sex and rough age:** man, fifties.
- **The portrait:** A broad, heavy man of fifty-five, bare-headed, iron-grey hair cropped like a brush [PROPOSED]. A square weathered face, a short grey beard, a flat unimpressed stare, mouth set to swear. Black work coat, crossed brown harness straps over the chest with steel clips. Unique: a notched steel link on a thong at his collar, with a row of tally scratches cut into the bare steel. Unlike anyone else: the knuckles of one hand are split white from the brake.

### Perpetua Lisle (`p95_perpetua`, `js/pilgrim95.js:420`)
- **Met:** the robing-room at the foot of the Pilgrim Chain (pilgrim95.js:200, at 16.5, 13.5).
- **Borrows now:** townswoman.
- **What the game gives:** own sprite: "Perpetua Lisle: sixty, upright, in the Tiers' black with her sleeves rolled, a white robe folded over her arm" (:361); silver-grey hair. Lines: "Seven years I have had nobody to robe. Stand still and let me see the length of you." (:174); "Mind the hems, they are clean." (:173); "I wash every one each spring and hang it back on its peg" (:178, the robes topic).
- **What the books give:** Not in the books (the name is [PROPOSED] by the game, pilgrim95.js:30). The robes and canopies are canon (Book Two Part Two Ch8-14:2391, "in their white robes, up the Pilgrim Chain under moving canopies like a procession of black mushrooms").
- **Sex and rough age:** woman, sixty.
- **The portrait:** A spare, upright woman of sixty with silver hair pinned flat under a black cap [PROPOSED]. A long, fine-boned face, grey eyes that measure you by the inch, a pursed, patient mouth. A plain black dress with the sleeves rolled to the elbow. Unique: a tailor's measuring tape of knotted white cord round her neck and a folded white linen robe over her left arm. Unlike anyone else: a pin-cushion strapped to her wrist, bristling with dark pins.

### A Flambeau of the winch (`p95_warden`, `js/pilgrim95.js:423`)
- **Met:** the winch of the Pilgrim Chain, two of them standing at 42.6, 18.6 and 46.4, 18.6 (pilgrim95.js:201).
- **Borrows now:** townsman.
- **How many and how chosen:** two at once, one NPC definition, so one portrait. Sprite `p95_flambeau` (the same body as the sentry enemies).
- **What the game gives:** crimson robe and hood, a censer on a chain burning "white-gold" (pilgrim95.js:121). Lines: "State your office." (:187); "Choir and bearers. Nobody else has walked the chain since the Fracture" (:189); "There is one note. The second note is sin." (:191).
- **What the books give:** `Book Four/Part Two Ch5-8.md:1657`: "A young man, red-haired, in crimson, with his censer burning white-gold on its chain ... in his little room of shade." :1048: "tall and grey and very straight, in the crimson of a Flambeau-Preceptor, with the gold chain of the office across his chest" (the Preceptor, Lucan Ostrel, is not the winch warden). Also :114: "with fire, and faith, in shifts."
- **Sex and rough age:** men, young to grey. The book's young Flambeau is red-haired.
- **Faces [PROPOSED]:** (1) the book's young one: a lanky man of twenty-two, red hair cropped under a crimson hood, freckled, a nervous jaw; (2) a stolid man of forty-five, shaved, bull-necked, a long white scar from ear to lip, eyes that do not move. Both: crimson hood, censer glow on the chin; (1) holds it in a shaking right hand, (2) in a steady left.

### The treble (`p96c_treble`, `js/school96.js:240`)
- **Met:** the Basilica school's practice-room, only at dusk (school96.js:16).
- **Borrows now:** townsman (a 45-year-old man; the singer is a child).
- **What the game gives:** "a child of about ten, a white surplice over a black cassock, hands folded, mouth open on the note" (:209); dark-brown hair. Lines: "I am holding it. The Cantor says if I hold it every night it will hold itself." (:71); "Speak low, please. I am practising." (:67); "We may sing here. Out there nobody speaks above the Narrow." (:72).
- **What the books give:** the role, not the face: `Book Two Part Two Ch8-14:2407`: "A child, usually: the best treble of the Basilica school, chosen each spring". Not in the books by look.
- **Sex and rough age:** a child of ten; sex not stated (game says "child").
- **The portrait:** A thin girl [PROPOSED] of ten, dark brown hair cut straight at the jaw, huge dark eyes lifted a little, mouth round and open on one held note. A white surplice with wide sleeves over a black cassock collar. Unique: a faint line of chalk dust on the first two fingers, from the slate. Unlike anyone else: she is the only face on the list with the mouth open in song.

### The Cantor (`p96c_cantor`, `js/school96.js:241`)
- **Met:** the Basilica school's practice-room at dusk, seated on a stool (school96.js:223).
- **Borrows now:** townsman.
- **What the game gives:** "seated on a stool, in white, grey-haired, the tuning-rod across the knees" (:222). Lines: "Sit, if you like, and keep the note company." (:78); "Every soul holds one true note. Sin is the note going flat. Grace is the note held." (:83); "The Church teaches that the second note is sin." (:85).
- **What the books give:** the doctrine, `Series Bible (canon)` ("preaches unison as holiness and every second note as sin", quoted in school96.js:84); no look.
- **Sex and rough age:** not stated; the sprite is grey-haired and drawn as a man. Rough age sixty.
- **The portrait:** An old man [PROPOSED] of sixty-five in white, thin grey hair combed back, a long gentle face with deep creases from nose to mouth, eyes shut half in listening, a faint, patient smile. Unique: an ivory-and-brass tuning-rod laid across his knees under both hands. Unlike anyone else: his head is tilted to one side, the ear turned to the room.

### Abbess Coriel (`p96v_coriel`, `js/vigil96.js:321`)
- **Met:** her cell at the Sun-Peak Vigil (vigil96.js:152).
- **Borrows now:** townswoman (a 35-year-old).
- **What the game gives:** "in her eighties, upright, white-haired, the plain habit, a staff" (vigil96.js:306); oatmeal wool habit with a veil, a tall plain staff. Lines: "Coriel. I am the Abbess of this house. There are twelve of us left. I am the oldest." (:102); "Three hundred sunrises I stood up there and watched, and I did nothing." (:103); "Sit. I will sit too." (:100, when tired).
- **What the books give:** look not given. `Vol II - Gazetteer and Bestiary.md:100`: "Abbess Coriel of Sun-Peak Vigil *(f, 80s)* ... Watched the Rite and did nothing. Will help the party, completely, instantly, at any cost to herself, and will not accept thanks."
- **Sex and rough age:** woman, eighties.
- **The portrait:** A very old, very upright woman of eighty-five. Hair white and fine, under a plain veil of undyed wool [PROPOSED]. A narrow face cut with age, pale eyes sunken but clear, a mouth with a patient, unbending line. Oatmeal habit, a plain wooden cross on a cord. Unique: a tall brown staff in her right hand at chest height, worn smooth. Unlike anyone else: she is the only elder on the list who looks you in the eye without asking you anything.

The other eleven Vigil clergy share two bodies (`p96v_cleric_m`: oatmeal habit, brown hair; `p96v_cleric_f`: grey habit, grey veil, brown hair). The portrait follows the sex (`FEMALE`, vigil96.js:159): the women borrow townswoman, the men townsman. None is in the books; the number "twelve" is (vigil96.js:6, "Twelve clergy left", from the Series Bible). Every entry below is [PROPOSED] for the face.

### Brother Fabian (`p96v_fabian`, `js/vigil96.js:324`)
- **Met:** the Vigil gate, at 28.5, 35.6.
- **Borrows now:** townsman.
- **What the game gives:** oatmeal habit, brown hair. "Light keep you true. Mind the ice on the step." (:108); "Ring the bell on the post and somebody comes." (:109).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** man, about fifty.
- **The portrait:** A heavy, round-faced man of fifty, bald but for a ring of grey, red cheeks from the weather, small kind eyes, a cold-chapped lower lip. Oatmeal habit, a rope belt. Unique: a brass bell-pull key on a string. Unlike others: a little trail of frost in his eyebrows.

### Sister Ottavia (`p96v_ottavia`, `js/vigil96.js:324`)
- **Met:** the tower, at the bell rope (27.5, 9.4).
- **Borrows now:** townswoman.
- **What the game gives:** grey habit, grey veil. "Do not touch the rope." (:112); "It is mine to ring. My hands know the weight of it, and the bell knows my hands." (:114).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about forty.
- **The portrait:** A strong, square-shouldered woman of forty, a grey veil pushed back, brown hair in a plait, a firm jaw, a steady, wary look. Grey habit with the sleeves tied up. Unique: the rope-burn scar, white and ridged, across both palms (shown at the chest, one palm turned up). Unlike others: her ears are red from the tower wind.

### Sister Domitia (`p96v_domitia`, `js/vigil96.js:324`)
- **Met:** the infirmary (16.9, 21.6).
- **Borrows now:** townswoman.
- **What the game gives:** grey habit. "Are you hurt? Then go to the Abbess, not to me." (:116); "She gives away what she needs. I scold her for it, and she does it again the next day." (:119).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about fifty-five.
- **The portrait:** A soft-bodied woman of fifty-five, a plump, tired face with a frown line between brown eyes, a wisp of brown hair escaping the grey veil, a scolding mouth that is also kind. Grey habit with a white apron over it. Unique: a wooden spoon and a small brown bottle of salve held together in one hand. Unlike others: a chilblained, pink nose.

### Brother Albinus (`p96v_albinus`, `js/vigil96.js:325`)
- **Met:** the garth, at 24.5, 14.8.
- **Borrows now:** townsman.
- **What the game gives:** "Light keep you true. You came up a long way to see snow." (:131); topics drawn from a shared pool.
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** man, about seventy.
- **The portrait:** A very thin man of seventy with a long nose, a bald head freckled with age, wispy white brows, wet blue eyes, a gentle half-smile. Oatmeal habit, a knitted grey scarf. Unique: a pair of cracked round spectacles tied with thread. Unlike others: his chin trembles a little.

### Sister Honoria (`p96v_honoria`, `js/vigil96.js:325`)
- **Met:** the east cloister, 39.8, 24.5.
- **Borrows now:** townswoman.
- **What the game gives:** "Light keep you true. Walk on the flags. The garth is deep." (:132).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about thirty.
- **The portrait:** A narrow young woman of thirty, pale, black-browed, a long thin nose, a clear, direct look, grey veil pulled tight. Grey habit, a small cough in her fist. Unique: a smudge of black ink on her chin and a pen behind her veil. Unlike others: one eyebrow always slightly raised.

### Brother Marcellin (`p96v_marcellin`, `js/vigil96.js:325`)
- **Met:** the south wall, 22.5, 32.9.
- **Borrows now:** townsman.
- **What the game gives:** "Light keep you true. We are not used to new faces." (:133).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** man, about forty.
- **The portrait:** A thickset man of forty, a heavy brow, a shadow of black beard on a wide jaw, deep-set suspicious dark eyes that slide away. Oatmeal habit, the hood half up. Unique: a stout hazel walking-stick under one arm, notched for counting. Unlike others: a broken nose set slightly crooked.

### Sister Prisca (`p96v_prisca`, `js/vigil96.js:325`)
- **Met:** the west court, 25.5, 22.5.
- **Borrows now:** townswoman.
- **What the game gives:** "Light keep you true. Shut the gate behind you, when you go." (:134).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about sixty.
- **The portrait:** A small, brisk woman of sixty, a seamed brown face like a walnut, bright black eyes, a tight bun under the grey veil, a mouth always about to give an order. Grey habit, a heavy iron key ring at her belt. Unique: the ring of three large keys, held up at her chest. Unlike others: one front tooth missing.

### Brother Quintin (`p96v_quintin`, `js/vigil96.js:325`)
- **Met:** the garth, 33.5, 26.5.
- **Borrows now:** townsman.
- **What the game gives:** "Light keep you true. The wind is from the south today." (:135).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** man, about thirty-five.
- **The portrait:** A lean, windburned man of thirty-five, sandy hair blown flat, narrow squinting blue eyes lined from looking at weather, a long chin. Oatmeal habit, a wool cap under the hood. Unique: a small slip of ribbon tied to a stick at his shoulder to show the wind. Unlike others: sunburn peeling on his nose in the snow.

### Sister Liviana (`p96v_liviana`, `js/vigil96.js:325`)
- **Met:** the parapet, 31.5, 4.5.
- **Borrows now:** townswoman.
- **What the game gives:** "Light keep you true. Do not lean on the parapet." (:136).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about twenty-two.
- **The portrait:** A girl of twenty-two, round freckled face, big pale-green eyes always a little widened, honey hair in two thin braids under the grey veil, a nervous smile. Grey habit, a scarf up over her chin. Unique: both hands in her sleeves, one holding a carved wooden bird. Unlike others: the youngest sister, with the only visible dimple.

### Sister Clemence (`p96v_clemence`, `js/vigil96.js:325`)
- **Met:** the west cloister, 16.8, 28.5.
- **Borrows now:** townswoman.
- **What the game gives:** "Light keep you true. Speak softly. The Abbess is resting." (:137).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** woman, about seventy-five.
- **The portrait:** A bent, birdlike woman of seventy-five, face lined like folded paper, hooded pale-grey eyes, almost no lips, a thin white wisp under the grey veil, a finger against her mouth. Grey habit, a shawl of grey wool. Unique: a rosary of black beads wound three times round one wrist. Unlike others: a trembling hand held steady by the other.

### Brother Galen (`p96v_galen`, `js/vigil96.js:325`)
- **Met:** the yard, 20.5, 9.5.
- **Borrows now:** townsman.
- **What the game gives:** "Light keep you true. Watch the sky. It changes fast up here." (:138).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** man, about fifty.
- **The portrait:** A long, stooped man of fifty, an upturned face with a high forehead, pale far-looking eyes, wiry black hair going grey at the temples, a loose-lipped, absent smile. Oatmeal habit. Unique: a brass spyglass held to his breast, the lens cap hanging by a cord. Unlike others: he is the only one not looking at the viewer but a little above and to one side.

### Mother Ysolde Carrow, the harbourmaster (`p92_ysolde`, `js/heights92.js:499`) [beyond the grep]
- **Met:** the Keel Docks, Sol-Luminary (heights92.js:188, at 72.6, 214.6).
- **Borrows now:** townswoman.
- **What the game gives:** own sprite `p92_veiled`: black coat and hood, a black hat, a net veil, black gloves, a shuttered lantern in one hand (:379). Lines: "Name. Cargo. Quietly: we speak in the Narrow here." (:127); "Everything the city eats comes past me, and I count it." (:129); "The one ahead owns their shadow and lends it." (:131).
- **What the books give:** `Book Two Part Two Ch8-14:641`: "The harbourmaster came down a ladder from the tier above with a veil over her face." `Book Four/Part Two Ch5-8:152`: "in her black veil and her black gloves, with her shuttered lantern ... Seraphina knew her by the way she put her feet: always in shade, always exactly, as if the deck were a floor of black and white tiles and the white ones would take her foot off. The two men with hooked poles came behind her in her shadow, step for step." Also :164 "She turned her veiled face to Seraphina." The name is the game's (Series Bible lists "Ysolde Carrow" among invented names).
- **Sex and rough age:** woman, age not stated; the lines read fifty to sixty.
- **The portrait:** A narrow, very still woman in a black net veil, the face behind it only a pale oval, a straight mouth, nothing else readable [PROPOSED: a faint silver curl at the temple]. Black coat, black gloves, a black hat. Unique: a shuttered lantern held at her chest, one thread of amber light through the slit. Unlike anyone else: she is the only face on the list that cannot be seen.

### The woman under the black canvas (`p92_canvas`, `js/heights92.js:502`) [beyond the grep]
- **Met:** the black market, Sol-Luminary (heights92.js:190, at 84.5, 148.6); she sells a shade-cloak, a cloth pole, a covered mirror, honey and pellets.
- **Borrows now:** townswoman.
- **What the game gives:** own sprite `p92_folk_b`: black coat, a dark shawl, a hooded head, a pale face kept down (heights92.js:374). Lines: "Under the canvas, quick. What do you need that you cannot buy in the light?" (:155); "Looking, or buying?" (:155); "The only one in the Tiers, and it stays under the cloth." (:158).
- **What the books give:** Not in the books by look. The covered mirror is the game's (Book Two :665 has the harbourmaster collecting glass).
- **Sex and rough age:** woman, age not given; about forty-five.
- **The portrait:** A sharp, quick woman of forty-five [PROPOSED] with a pointed face, a dark shawl over her hair, hooded black eyes that dart to the door, a thin smile with a gold tooth. Black coat. Unique: the corner of a black cloth drawn back from a hand-mirror at her chest, showing one glint of silver. Unlike others: a small black beauty-mark at the corner of her mouth.

### Joss Feveril, of the seventh chain (`p92_joss`, `js/heights92.js:503`) [beyond the grep]
- **Met:** the seventh chain, 134.6, 129.4 (heights92.js:190).
- **Borrows now:** townsman.
- **What the game gives:** own sprite `p92_folk_c` (a belt and one notched link, coat '#22201c', heights92.js:375). Lines: "Seventh chain. Mind the walk." (:162); "Every crewman wears one. A notch for every man you lost." (:165).
- **What the books give:** Not in the books (the game's own). Bardo's tally is in Vol II:98.
- **Sex and rough age:** man, about thirty.
- **The portrait:** A wiry man of thirty, black hair cropped, a dark chin, ropy forearms, alert brown eyes, a wry crooked grin. Black chain-crew coat, a leather belt. Unique: a notched steel link hung on the belt, with three cuts in it. Unlike others: a gap between the two front teeth.

### The Umbral folk (`p92_folk`, `js/heights92.js:503`) [beyond the grep]
- **Met:** the Tiers, a pool of walkers; the lines are the same for all.
- **Borrows now:** townsman (one definition, one portrait).
- **How many and how chosen:** one NPC definition `p92_folk` (with `rumour: true`); sprite `p92_folk_d` (black hooded coat, dark leather belt, pale face down).
- **What the game gives:** "Shh." (:170); "Quiet. Please." (:170); "We do not go above the line." (:171).
- **What the books give:** the crowd in `Book Two Part Two Ch8-14:745` (see the section header).
- **Sex and rough age:** mixed.
- **Five faces [PROPOSED]:** (1) a woman of forty with a bandaged hand and a black shawl; (2) an old man of seventy, no teeth, a hood with a white thread of hair; (3) a boy of fourteen, dark circles under his eyes, a black cap too large; (4) a stout woman of fifty with a baby's hand just visible at her collar; (5) a one-eyed man of fifty with a black eye-patch and a pole with a rag at the tip.

---

# THE CONTINENTAL RIFT (Null-Watch)

The Watch is canon (Book Three Part One:783: "Men and women in grey, in pairs, on the walls, in long coats with lead plates sewn into them that made them walk like people wading ... Faces set and tired, eyes on the edge of the world."). Every trooper on the wall talks, and the game draws "every mouth on the Watch open" (rift100.js:487). In the picture the mouth should be open mid-word. The troopers are drawn bodies, not tints.

### The Scavenger of the line (`p97_scav`, `js/whitemile97.js:349`) [White Mile]
- **Met:** the scavengers' shelf, the White Mile (whitemile97.js:168, at 17.5, 6.4).
- **Borrows now:** townswoman.
- **What the game gives:** "wound in black to the eyes; one hand bare" (:297): this version has the hand dark, not white; only the eyes show. Lines: "Light keep you true. You are a long way up for a stranger." (:155); "Mind the line. It does not look like anything." (:155); "Wrap your face and glove your hands." (:159).
- **What the books give:** Not in the books (the game's own).
- **Sex and rough age:** not stated; the game gives a woman's portrait. Age about thirty.
- **The portrait:** A woman of thirty swathed in black cloth to the eyes, only a band of brown skin and two steady, light-brown eyes showing [PROPOSED], dark sooty lashes. Unique: a coil of black drop-line over her shoulder. Unlike others: a thread of white frost in the wrap at her mouth.

### General Theresa Ward (`p100_ward`, `js/rift100.js:642`)
- **Met:** the mooring-yard at Null-Watch (rift100.js:324, at 308.4, 100.4); in the books, her cell at the top of Tower Nine.
- **Borrows now:** townswoman.
- **What the game gives:** own sprite: lead-grey long coat with lead plates, a dented breastplate, a faded sash, "her right, the knuckles on the iron", grey hair, "the one shut mouth in the yard" (:511-522). She has no voice; Ninety-Four speaks for her. Lines: "The General says, welcome to Null-Watch. The General says, keep talking." (:207); (Four flat heavy blows.) "The General says, the Watch holds the wall." (:209).
- **What the books give:** no look, but the manner: `Book Three Part One Ch1-4:809`: "Theresa Ward had commanded Null-Watch in it for six years, by knuckle and palm and fingertip on the iron over her heart, because she had not had a voice since the night the Rift opened." :815: "Theresa Ward had been a colonel of their gunners." :1864: "a round cell of obsidian with a cot and a desk ... The General was at the desk, reading. She looked up as Sable came in. She did not tap. She waited." `Vol VI:126`: "shouted her voice to rags on the wall on the first night of the Rift in 413 and it never came back."
- **Sex and rough age:** woman, an old gunner colonel; about sixty-five.
- **The portrait:** A hard, grey woman of sixty-five, iron-grey hair cut short, a lined, set face, very still, mouth shut (the only one on the Watch), pale eyes that wait. A dented lead breastplate over a lead-plated coat. Unique: her right fist resting on the breastplate, knuckles to the iron, about to strike. Unlike anyone else: a faded rose sash across the chest; and a scar-pale line round the throat where the voice went.

### Ninety-Four, the General's voice (`p100_94`, `js/rift100.js:642`)
- **Met:** beside the General (rift100.js:324, 309.2, 101.6); he sits on a stool by her door in the book.
- **Borrows now:** townsman.
- **What the game gives:** grey trooper coat, "94" on the breast, brown hair, light skin (:493). Lines: "Ninety-Four. I say what the General says." (:218); "Three sovereigns the cask at the Fenwick chandler's when I left" (:221); "In the Reach. I owed money there. You get the wall for a debt of that size." (:222).
- **What the books give:** sound and place only: `Book Three Part One Ch1-4:1864`: "94 sat on a stool by the door, talking quietly about the price of lamp-oil."
- **Sex and rough age:** man, about forty.
- **The portrait:** A mild, tired man of forty, thinning brown hair, a worn chin, an anxious, ready look turned to the side, mouth open mid-sentence. Grey lead-plated coat with 94 chalked on the breast. Unique: his head is tilted toward the General, listening for the next blow. Unlike anyone else: a tiny quill-cut callus and a smear of lamp-soot on the cheek.

### Nineteen (`p100_19`, `js/rift100.js:642`)
- **Met:** the wall, paired with trooper D on the north stretch (rift100.js:829).
- **Borrows now:** townsman.
- **What the game gives:** grey crop of hair, "a scarred eyebrow" (:495), a paler skin. Lines: "I kept eleven. You name a hen and it dies, so I numbered them. Then I came here, and they numbered me." (:241); "Loud is fine. Loud is alive." (:239).
- **What the books give:** Not in the books by look (the Watch's onions and hens are canon).
- **Sex and rough age:** man, about sixty.
- **The portrait:** A leathery man of sixty, hair cropped to grey stubble, a pale scar through the left eyebrow, a farmer's wide, patient face, mouth open mid-story. Grey coat, "19" on the breast. Unique: a single brown hen feather stuck in his collar. Unlike others: the white-scarred brow gives him a permanent mild surprise.

### Eighty-Eight (`p100_88`, `js/rift100.js:643`)
- **Met:** the wall, paired with trooper A (rift100.js:828).
- **Borrows now:** townsman.
- **What the game gives:** "one hand up, by his ear" (:496), brown hair, fair skin. Lines: "two short, a pause, one long: that is yes. Sorry. Eighty-Eight. I was listening to her knuckles." (:246); "Coldharrow. In the Peaks. You would not know it." (:249).
- **What the books give:** Not in the books by look.
- **Sex and rough age:** man, about twenty-five.
- **The portrait:** A young man of twenty-five, auburn hair, an eager, listening face, one hand cupped behind his ear, mouth open. Grey coat, "88". Unique: three chalk tally marks on the back of the cupped hand. Unlike others: he looks past the viewer, as if for the next knuckle-strike.

### Trooper A, Fifty-Seven (`p100_tr_a`, `js/rift100.js:644`)
- **Met:** the yard, the gate, the Halls (many paired posts; rift100.js:832, 868).
- **Borrows now:** townsman.
- **What the game gives:** grey coat, "57", brown hair (:492). Lines: "and then you take your onions, and you want them sliced thin, not chopped, thin, and you want a heavy pan" (:260).
- **What the books give:** the trooper's talk of onions, `Book Three Part One:783` and `Book Three Part Two Ch5-8:181`: "Rootday, Hearthday, Massday. And then your onions."
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A stocky man of forty-five, thick brown hair going grey over the ears, a round red face, a cook's authority, mouth open mid-recipe. Lead-plated grey coat, "57". Unique: a thumb and forefinger pinched together to show how thin the onion slice is. Unlike others: an onion-tear on one cheek.

### Trooper C, Two-Oh-Eight (`p100_tr_c`, `js/rift100.js:644`)
- **Met:** same posts as the others, often paired with trooper B (rift100.js:828).
- **Borrows now:** townswoman.
- **What the game gives:** a slightly bluer coat (`#666a74`), "208", fair-brown hair (:492). Lines: "you can have the blue or you can have the green, but you can't have both and expect your mother not to say something" (:264); "and she had a voice on her like yours, as it happens" (:264).
- **What the books give:** the Watch of "men and women" (Book Three Part One:783). No other look.
- **Sex and rough age:** the game's portrait is a woman; about thirty-five.
- **The portrait:** A woman of thirty-five, hair dark-blond pinned in a tight bun, a long, patient face, one eyebrow lifted at her mother's remembered opinion, mouth open mid-story. Slightly bluish lead-plated coat, "208". Unique: a faded blue ribbon wound round her wrist. Unlike others: a little green thread-end hanging from her collar.

### Trooper D, Nine (`p100_tr_d`, `js/rift100.js:644`)
- **Met:** the north stretch, the gate, the Halls (rift100.js:829, 832).
- **Borrows now:** townsman.
- **What the game gives:** grey-white cropped hair, pale skin, "9" (:492). Lines: "Rootday, Hearthday, Massday, Stasisday, Dawnday, Driftday, Memoryday, Nullday, Rootday, Hearthday" (:266); "Driftday! Memoryday! Nullday! Go on, you take the next round" (:266).
- **What the books give:** the days of the week as the Watch's talk (Book Three Part Two Ch5-8:181: "Rootday, Hearthday, Massday").
- **Sex and rough age:** man, about seventy.
- **The portrait:** A cropped, silver-headed man of seventy, a lean pale face, a drooping white moustache, rheumy pale eyes still alert, mouth open on a day's name. Grey coat, "9". Unique: a calendar-string of nine knots on a cord at his neck. Unlike others: no front teeth top left, giving every word a whistle.

### One of the mast-crew (`p100_mastcrew`, `js/rift100.js:646`)
- **Met:** around the mast in the mooring-yard, three at once (rift100.js:825).
- **Borrows now:** townsman (one NPC definition, so one portrait).
- **What the game gives:** a slightly bluish coat, "164", dark hair (:501). Lines: "and that's her lines made fast, and that's the windlass pawled" (:269); "and that one shouts. Good. Shout on the wall and you'll live." (:269).
- **What the books give:** Not in the books by look.
- **Sex and rough age:** men and women; about thirty to fifty.
- **Faces [PROPOSED]:** (1) a rope-handed man of thirty in a dark knit cap with a salt-white beard; (2) a broad woman of forty-five with a red scarf and a rigger's marlinspike through her collar; (3) a tall, thin man of fifty with an eyepatch and a weather-dark scalp; (4) a short young woman of twenty-three with her hair cropped and an iron ring in one ear.

### The roster-corporal (`p100_roster`, `js/rift100.js:647`)
- **Met:** the Talking Halls, at the roster board (rift100.js:339, at 21.5, 5.6).
- **Borrows now:** townsman.
- **What the game gives:** black hair, "302"; chalk in one hand, a slate in the other (:497). Lines: "Subject?" (:271); "Number and subject. No number? Visitor, then. Subject." (:271); "I have four hundred of these to chalk before the hour." (:271).
- **What the books give:** Not in the books by look (the roster is the game's; the Watch's subjects are canon).
- **Sex and rough age:** man, about forty.
- **The portrait:** A narrow, harassed man of forty, black hair slicked flat, a pinched chalk-dusted face, hooded, irritated eyes. Grey coat, "302". Unique: a stub of white chalk held up between two fingers at his chest, and his right cuff white to the elbow with it. Unlike others: a pencil-thin black moustache.

### One-Oh-Six, at the issue-hatch (`p100_issue`, `js/rift100.js:648`)
- **Met:** the issue-hatch in the Halls (rift100.js:339, at 38.5, 9.4); he sells coat, mitts and spike.
- **Borrows now:** townsman.
- **What the game gives:** cropped brown-grey hair, fair skin, "106" (:498). Lines: "Issue. Coat, mitts, spike. You sign with a mark if you can't sign." (:279); "Issue. What." (:279); "Lead plates, sewn in. It will not stop the quiet." (:281).
- **What the books give:** Not in the books by look.
- **Sex and rough age:** man, about fifty.
- **The portrait:** A flat-faced man of fifty, hair cropped brown going grey, a heavy brow, tiny deadpan eyes, a downturned mouth with no patience in it. Grey coat, "106". Unique: a lead-plated mitt held up at chest height as a sample, thumb up. Unlike others: a pencil stub behind a notched ear.

### Corporal One-Forty-Two (`p100_corp`, `js/rift100.js:650`)
- **Met:** the blanket at Magazine Four (rift100.js:340, at 47.5, 13.6).
- **Borrows now:** townsman.
- **What the game gives:** very dark hair, "142", "a corporal's two bars" on the sleeve (:499). Lines: "Nothing through there. Blankets. Keep talking and keep moving." (:286); "Say that louder and I will have you counting cable-eyes till Frostmonth." (:286).
- **What the books give:** Not in the books by look.
- **Sex and rough age:** man, about forty-five.
- **The portrait:** A stern, square man of forty-five, black hair cropped close, a stiff jaw, a flat, authoritative stare, a straight mouth ready to give an order. Grey coat, "142", two bars on the sleeve. Unique: a thumb hooked into his belt beside a ring of powder-store keys. Unlike others: he does not talk with the mouth open: his lips are shut, then a half-word.

### Fifty-One (`p100_51`, `js/rift100.js:650`)
- **Met:** the bunk hall, the footlocker (rift100.js:340, at 53.5, 6.6).
- **Borrows now:** townswoman.
- **What the game gives:** red-brown hair, fair skin, "51" (:500). Lines: "my nan sang it. Every night. I'd know it in my sleep. I do know it in my sleep." (:292); "Not so loud. Not about that." (:292); "I wrote it out so I would stop hearing the gap at the end." (:294).
- **What the books give:** Not in the books by look (the cradle-song is the game's).
- **Sex and rough age:** woman, about thirty.
- **The portrait:** A freckled woman of thirty, copper hair tied back with a bootlace, a pointed, soft face, hazel eyes lowered, mouth parted on three lines of a song. Grey coat, "51". Unique: a folded sheet of pencilled song-lyrics held to the chest. Unlike others: she is the only one with a closed eye, one lid lowered as if listening to a tune.

### Two-Oh-Seven (`p100_207`, `js/rift100.js:650`)
- **Met:** the powder-barrack (rift100.js:340, at 47.6, 8.4).
- **Borrows now:** townsman.
- **What the game gives:** black hair, brown skin, "207" (:500). Lines: "and it grounds the halberd soft, every time. Because of the powder." (:299); "Nine days. Ten tomorrow." (:299); "Six years it has walked the same nine paces." (:300).
- **What the books give:** Not in the books by look.
- **Sex and rough age:** man, about thirty-five.
- **The portrait:** A lean man of thirty-five with brown skin, black hair curling at the collar, kind dark eyes, a worried brow, mouth open mid-count. Grey coat, "207". Unique: a pinch of black powder rubbed into the creases of his thumb. Unlike others: a neat, thin line of beard along the jaw, only on the jaw.

### A watcher by the bunks (`p100_watcher`, `js/rift100.js:651`)
- **Met:** the Talking Halls, one beside each sleeping bunk (rift100.js:860).
- **Borrows now:** townsman (one NPC definition, so one portrait).
- **How many and how chosen:** one by every bunk with a sleeper; paired watchers (Book Three Part One:783: "Paired watchers sat by the bunks and talked to the sleepers, to keep the sleepers' breathing company.").
- **What the game gives:** grey-brown hair, "73" (:501). Lines: "and then your sister wrote, and the calf was a heifer after all— I can do both. Go on." (:305); "Wake him and you take the next two hours." (:305).
- **What the books give:** the role, as quoted above.
- **Sex and rough age:** mixed.
- **Faces [PROPOSED]:** (1) a heavy-lidded woman of fifty with a grey plait, one hand on the sleeper's blanket; (2) a young man of twenty with chapped lips, a rolled-up sleeve and a stained mug; (3) a sour man of sixty with a pipe unlit in his teeth; (4) a gentle woman of thirty-five with a baby's blanket over her shoulder.

