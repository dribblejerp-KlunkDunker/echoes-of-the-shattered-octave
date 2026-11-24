# LORE-callings: the six callings and the six likenesses, read against the books

> **A reader's brief, 24 Nov 2026.** Made by a read-only reader for the Commander. The lines the design leans on were checked against the manuscript and the Series Bible by the Commander; the rest of the line numbers were spot-checked by the reader and not all verified. Everything marked [PROPOSED] is a suggestion, not canon. The design that came of it is `Phase 125 - Who the traveller is, and in their boots (design, for ruling).md`.


Read-only pass. Nothing in the repository was changed. Written 24 Nov 2026.

## 0. How to read this file

Abbreviations (all paths under `/home/claude/echoes-of-the-shattered-octave/`):

- **DATA** = `js/data.js`. Line numbers are that file's.
- **B1** = `story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`. Line numbers are the full manuscript's, NOT the `Chapters/` files'. Chapter starts in B1: Prologue 9, Ch1 233, Ch2 562, Ch3 899, Ch4 1293, Ch5 1695, Ch6 1925, Ch7 2235, Ch8 2562, Ch9 2824, Ch10 3052, Ch11 3348, Ch12 3584, Ch13 3816, Ch14 4073, Ch15 4221, Ch16 4463, Ch17 4644, Ch18 4852, Ch19 5088, Ch20 5282, Ch21 5482, Ch22 5664, Ch23 5888, Ch24 6160, Echo I 6377.
- **B2a** = `story/Books/Book Two - The Great Discord/Part One Ch1-3.md`; **B2b** = `.../Part One Ch4-7.md`; **B2c** = `.../Part Two Ch8-14.md`.
- **B3a/B3b/B3c** = `story/Books/Book Three/Part One Ch1-4.md`, `Part Two Ch5-8.md`, `Part Three Ch9-12.md`.
- **B4a/B4b** = `story/Books/Book Four/Part One Ch1-4.md`, `Part Two Ch5-8.md`.
- **SB** = `story/World Bibles/Series Bible (canon).md`. **V1..V8** = the Vol I..VIII files; **V3b** = `Vol III (b) - Errata and Rulings.md`. V8 (Game Layer) is the game's own layer, not canon, and is only cited where the game's invention matters.
- Precedence: manuscript beats any bible. V3 and V3b strike parts of V1 and V2. V3b is the later sheet and wins over V3.
- "The books are silent" means I searched with `grep -rn -i` over Books and World Bibles and found nothing. The grep terms are named where the silence matters.
- **[PROPOSED]** marks every suggestion of mine. Nothing marked so is canon.

Calendar anchor (needed for every "where would they be" below). SB 635: "Day 1 falls on 6 Harvestmonth 419 and the Rite on 16 Harvestmonth. That mapping is the game's working assumption and is not yet ruled." B1 242: "*Oakhaven, the Resonant Reach. Autumn, 419 SR. Seven years after the Fracture.*" The Church arrives Dawnday, Day 6 (SB 635: "the Church takes Lyra on Dawnday, Day 6"). The Rite is Hearthday, Day 11. V7 37 gives Harvestmonth as the month with the canon "The Greening; the Oakhaven evacuation".

Big structural finding, stated once up front: **the game's calling descriptions and bios are partly lifted from the book characters they sit beside.** Four of the six callings are, in the game's own words, a named book character with the serial numbers filed off (Blade = Kaelen; Corsair = Vane; Archivist = Sable; Penitent = Ignatius Crane). Cantor = Lyra, less exactly. Only the Quarry-Hand is the game's own. Details are in each section.

---

## 1. The text as the game has it (DATA, quoted with line numbers)

Header comment, DATA 95-96: `// ---- faces offered at character creation ---- // A face is a history, not a class: any calling can wear any of them.`

### 1.1 The six callings (DATA 10-64)

**Dissonant Blade** (DATA 12-18), hz '174 Hz'.
- desc (13): "A former bore-engineer whose left arm set to Aether-Glass in the Fracture. The glass drinks what it breaks, and the tideline climbs for it. Hounds will not touch you. Neither, for long, will anyone else."
- bio (14): "The morning the Light let go, you were on the Dawning floor with a hand on the bulkhead wheel. You held it while the glass came through, and you were still holding it when your left arm set. The Synod gave you a medal you have never worn and a word, consecrated, that you have never used. The hounds treat you as one of their own; the town does not. You burn charcoal outside the Hedge and count the mornings the glass has climbed."
- summary (15): "Front-line fighter and living tuning fork. High Strength and Endurance, an innate glass arm that breaks the Cacophony, and a short song-list. Close the distance, keep the noise down, and let the tideline pay for every victory."
- numbers (16-18): Strength 60, Int 55, Will 50, Agi 45, End 60, Pers 35, Speed 45, Luck 40; hp 30, voice 10, glass: true, weapons ['sword','glass'], songs ['murmur'], pellets 4; skills "Long Blade, Glasswork, Engineering".

**Cantor** (DATA 21-27), hz '174 Hz'.
- desc (22): "You sing the births, fevers and burials of orchard country, always inside the Narrow. Your tending notes are older than the Church knows. You have never picked up a sword and you will not start now."
- bio (23): "The orchard cantors taught you to hold a note under your breath, where the hounds cannot hear it and the Silence cannot find it. You learned the old fourth line from a woman who died before the Synod took the bells, and you have sung it at every burial since, quietly, as a private heresy. You have never carried a blade. When people ask what you do, you say you keep the door open between the living and the rest."
- summary (24): "Singer, healer and crowd-quieter. High Willpower and Personality, the deepest song-list and the most Voice, but little health. Stay behind the blade, mend what is broken, and spend your voice where it changes the room."
- numbers (25-27): Str 35, Int 55, Will 70, Agi 45, End 45, Pers 65, Speed 45, Luck 45; hp 20, voice 40, glass false, weapons ['hands','pistol'], songs ['murmur','tending','fifth','root'], pellets 9; skills "Law-song, Mending, Etiquette".

**Corsair** (DATA 30-36), hz '639 Hz'.
- desc (31): "Rust Coast, by way of the air. You count, you judge rope and angles, and you carry glass shot that costs a sovereign a pellet. You laugh loudest when you are most afraid."
- bio (32): "You have signed on with seven crews and left six of them in ports you cannot pronounce. You count because counting is the only prayer that has ever answered you: casks, cartridges, shares, the seconds between a rope parting and a man noticing. The glass shot in your pouch is worth more than the clothes you stand in. You have never once let a stranger see you afraid, and that is the only discipline you keep."
- summary (33): "Skirmisher and gunhand. High Agility and Speed, a short sword and a pistol, and the largest pouch of glass shot of any calling. Hit first, move often, and never let anything corner you in a corridor."
- numbers (34-36): Str 50, Int 45, Will 40, Agi 65, End 50, Pers 55, Speed 60, Luck 55; hp 25, voice 12, glass false, weapons ['sword','pistol'], songs ['murmur'], pellets 12; skills "Short Blade, Firearms, Streetwise".

**Archivist of the Veil** (DATA 39-45), hz '741 Hz'.
- desc (40): "A conscripted scribe of the Office of the Catalogue who walked into the mist with a Ledger. You know what the glass cores are. You can read a Legionnaire's name off its bell. Every name you keep costs you a little of yourself."
- bio (41): "The Office took you young, gave you a clean coat and a desk with a lock, and taught you to copy a name without reading it. You read them anyway. The first was a woman of sixty-one, entered as a unit, whose hand you recognised from a letter in your mother's kitchen. You have been keeping a second Ledger ever since, in a hand the Office cannot read, and every entry costs you a piece of the name you were born with."
- summary (42): "Lore-keeper and debuffer. The highest Intelligence, three glass fragments at the start, and songs that name what is hunting you. Fragile in a stand-up fight, invaluable before one: read the room before it reads you."
- numbers (43-45): Str 35, Int 75, Will 60, Agi 45, End 40, Pers 50, Speed 45, Luck 50; hp 18, voice 30, glass false, weapons ['hands','pistol'], songs ['murmur','tending','name'], pellets 7; skills "Ledger-craft, Lore, Resonance".

**Flambeau Penitent** (DATA 48-54), hz '285 Hz'.
- desc (49): "You carried a censer for the Church until the day the light turned. You still half-believe you were right. Your faith is fire, and both are guttering."
- bio (50): "You were the one who carried the fire, not the one who decided where it went. That was the comfort, and you took it for eleven years. Then a Rite went wrong in a way the Church still denies, and you stood in the ash with a child's shoe in your hand and the Pure Note still ringing in your teeth. You keep the ash in a jar. You have not decided whether it is a relic or a confession, and you suspect it is both."
- summary (51): "Armoured zealot and glass-fire caster. Strong Willpower and Endurance, a bell-bronze mace that rings against the Cacophony, and Doctrine to hold a party together. Slow and loud, but hard to put down."
- numbers (52-54): Str 55, Int 50, Will 65, Agi 40, End 55, Pers 45, Speed 40, Luck 35; hp 26, voice 25, glass false, weapons ['sword','hands'], songs ['murmur','fifth'], pellets 3; skills "Blunt Weapon, Doctrine, Glass-fire".

**Quarry-Hand** (DATA 57-63), hz '396 Hz'.
- desc (58): "Night shift at the Oakhaven works. You have heard the Root breathe through the pump-house floor and you have seen what the Grafters bring up in sacks. Strong back, short list of friends."
- bio (59): "The works run three shifts, and you have worked all of them. You know the sound the pump makes when the Root is awake, the smell of a gallery that is about to settle, and which of the foremen will send you down anyway. You have carried two friends up the ladder and left one below because there was no time. The foreman wrote it down as a fall. You have not written it down at all."
- summary (60): "The tank. The highest Strength and Endurance and the biggest health pool, with a sword and a head for climbing. No pistol, few pellets and almost no songs: solve it with muscle and let the singers handle the rest."
- numbers (61-63): Str 70, Int 40, Will 45, Agi 50, End 70, Pers 40, Speed 50, Luck 40; hp 36, voice 8, glass false, weapons ['sword'], songs ['murmur'], pellets 2; skills "Axe, Climbing, Endurance".

### 1.2 Starting gear (not in DATA)
- `js/game.js` 152: `CLASS_KIT = { blade: ['a_jerkin','a_gloves'], cantor: ['a_gambeson','a_softboots'], corsair: ['a_jerkin','a_buckler','a_hobnails'], archivist: ['a_hood','a_gambeson'], penitent: ['a_gambeson','a_kettle'], quarry: ['a_jerkin','a_hobnails','a_gloves'] }`.
- `js/gear87.js` 106-117 (the later, owner-ruled kits, which override): blade = set 'siphon' (goggles, apron, gauntlets, boots) with weapons sword + glass; cantor = set 'cantor' (cowl, cassock, sandals, mantle) with hands + pistol; corsair = set 'captains' (bandana, coat, gloves, boots, buckler) with axe + pistol; archivist = set 'hush' (hood, gambeson, mitts, softboots) with throwknife x6 + pistol; penitent = kettle helm + gambeson with mace + hands; quarry = set 'works' (kettle helm, jerkin, gauntlets, boots) with sledge.
- Note for a designer: the kit weapons differ from DATA's `weapons` arrays (Corsair gets an axe and Penitent a mace in the kit; the Archivist throwing knives). The "Siphon" set on the Blade is named for the Siphon, which is Kaelen's Foundry's trade (B1 41: "a cathedral of black iron... thrown up against the Spire's flank in a single summer by the Consortium of Bores").

### 1.3 The six likenesses (DATA 97-133): quoted in full in section 9, with each sentence tied to the book line it comes from.

---

## 2. THE DISSONANT BLADE (glass-armed bore-engineer)

### 2.1 Is it a thing in the books?
**Not a trade. It is one man, and "Dissonant Blade" is his title in the bible.** SB 302: "#### Kaelen Vance — The Dissonant Blade · 174 Hz" and, under it, "*Thirty-four. Vanguard. Left arm of cyan Light-glass, Stage Three and spreading.*" The word "Dissonant" in the manuscript is a legal status, not a calling: B1 6162 (writ, ch.24): "*Writ of Attainder and Grace. Be it known that the persons herein named are declared Dissonant, their goods forfeit, their testimony void, their names struck.*" (also B1 6200, which names "Kaelen Vance, late Chief Resonant Engineer, badge four-oh-eight-A").

The two halves of the game's description are separate things in the books:
1. "Bore-engineer": a real Consortium trade. B1 480: "At seventeen he went to the Organum, to the Synod's great Conservatory of Bores"; B1 4267 (the Ledger reads out Kaelen): "Chief Resonant Engineer, Consortium of Bores, badge four-oh-eight-A. Conservatory of Bores, 402 to 406, first in your year. Author of the Vance Sequence, revisions one through three." Others are of the same trade: B1 1725 (Tobiah Marsh, "Junior engineer, night shift... I studied it. At the Conservatory.").
2. "Glass arm": the books give it to exactly one living person in Book One, and the Church has a word for people like him. B1 2341-2345 (Crane to Kaelen): "Do you know what the Church calls men like you, Engineer?" / "Consecrated." SB 246: "The glassed are called Consecrated." SB 160 gives the four stages: "*Ringing*: a tone only you can hear. *Frost*: a sheen under the skin. *Set*: a limb calcifies (Kaelen, when Book One opens). *Heartglass*..."

### 2.2 What the books give the trade
- **What the glass does (the "drinks what it breaks" law).** SB 87: "the glass arm drinks what it breaks and the tideline climbs for it". B1 1855: "He laid his glass hand flat against the side of the bronze, the way you lay a hand on a struck bell to stop it ringing... and felt the glass drink it." B1 3264: "he got his glass hand flat on the boiler and the arm *pulled*, the way it had pulled the bell out of a Legionnaire's helmet". B2b 661: "The glass drinks what it breaks. He had known that since the clamps outside Oakhaven, since the first hound; it was the whole law of his life now."
- **What it takes (the tideline).** B1 592: "The glass began at his fingertips and ran unbroken to the shoulder... He called it the tideline. Every morning he measured from the point of his shoulder to the tideline, along the line of the collarbone, the way other men checked the weather. This morning it was two fingers and a half. At midsummer it had been one." B1 594: "He wrote the number on the wall with a nub of charcoal". B1 1709: "He had not measured the tideline. He would measure it at dawn. He already knew." B1 3266: "*The tideline*, he thought, distantly. *That will have cost me.*" End of Book One: B1 6176: "Four and a half fingers from the point of the shoulder puts the tideline past the collarbone, across the top of the chest, and three inches from the notch of the throat." Last stage: SB 160 "*Heartglass*: the glass reaches the heart and the person becomes a humming statue, alive and aware."
- **What it costs in daily life.** B1 570-578: he sleeps with the arm "in a trough of sand" because "Wool muffled the glass, but it muffled it the way a hand over a mouth muffles a scream". B1 608: "It was no good for fine work anymore. It could still hold, and it could still hit, but it had no feeling except the one, and that one never switched off." B1 646-648: the town made him wear a felt sleeve: "On still days, in the lanes, the ringing got into people's teeth, and the children cried, and the old women said it was drawing the hounds, which it was not."
- **What it hears.** B1 580: "It heard everything." B1 654 (Legionnaire's bell): "Its bell was level with his shoulder, and his shoulder was glass, and so he heard what was inside the bell much more clearly than he wanted to." SB 160: "Glass is also a party line: two pieces cut from the same Spire are one thing in two places, so Vaelen has heard everything said aloud near Kaelen's arm since 412. A tone struck at a glassed limb's own pitch — a hand-press at 741, an Aegis chord — locks it rigid and leaves it ringing flat for days."
- **Hounds.** B1 484: "The hounds did not touch him. Everyone knew that. They came down to the clearing sometimes... But they would not go near the hut. The Grafters said it was the glass. *Spire-blood*, the old women said". B1 618-622 (the hound's bed twenty paces from his door): "'You're getting bold,' he said". So the game's "The hounds treat you as one of their own" (DATA 14) overstates the book: the books say the hounds keep away from him and (B1 2271) flinch from the Church's glass-fire, but never that they accept him.
- **Pay / rank / who commands.** The Consortium of Bores employs the trade (SB 250: "seven chairs, the first held by Chancellor-Magnate Ysolde Carrow, heir of the Carrow Bore and Kaelen's old mentor"). The glassed are the Church's relics rather than its servants: B1 5134: "eleven thousand and forty at Sol-Luminary, of which thirty-nine were listed as SKY CHOIR (CONSECRATED), which meant the Church had decided they were relics rather than corpses." B1 2343-2345: "The High Patriarch would give a great deal to have you kneel in the Chapel of the Organum. A living relic of the Dawning."
- **What others call him.** "the glass man, the Governor's boy, the one the hounds won't touch" (B1 1394). Later: "the man with the glass arm" (B3a 831; B3c 303).
- **How one becomes one.** In the books, only by the Foundry: "on the last morning of the Rite he heard the Spire ask its question and tried to stop the bore... held a bulkhead against the glass flood, and his left arm set" (SB 302). B1 175-183 shows it. Raw glass otherwise "crystallizes flesh in four stages" (SB 160) and "A limb that takes it in calcifies and begins to ring" is the game's own lore text (DATA 142), consistent with SB 160.
- **The medal.** The game says the Synod gave you "a medal you have never worn" (DATA 14). `grep -i medal` over Books and Bibles finds nothing. The books are silent; it is the game's invention. What the Synod gave Kaelen, per the manuscript, is B1 482: "Seven years ago he came home with a Synod discharge and no letter of explanation".

### 2.3 Named people of the trade (avoid being any of them)
- **Kaelen Vance**, Chief Resonant Engineer, badge 408-A, Governor's son, glass left arm, charcoal-burner outside the Hedge. SB 302; B1 480-486, 592-648, 4267, 6200.
- **Casimir Vaelen**, the Supreme Arbiter, "A hundred and forty years old, eighty of them glass-laced... his glass is *laced*, never *set*" (SB 467; V3b 5-6 strikes V3 "never been glassed").
- **The thirty-nine "SKY CHOIR (CONSECRATED)"** (B1 5134, 5720), kept by the Church as relics.
- **The Glass Court**: "The Glass Court is Stage Four" (SB 160); "nine dead monarchs, revived with glass hearts" is the game's lore text (DATA 143).
- **The Carrow Bore's author**: "*Y. Carrow*" signs the drawing in the Factor's office (B1 2381); SB 250 Ysolde Carrow.
- Bore-engineers in Book One: **Tobiah Marsh**, junior engineer, night shift (B1 1725); the unnamed "bore-master" (B1 3116, 3294); **Garret Tull**, Deep Guild bore-mechanic (SB 352), who is not in Oakhaven in Book One.
- In later books a second glass-armed named person appears at the edge: **Hadda Steyn** takes Kaelen's "bare glass arm by the wrist" (B4a 552). She is not described as glassed herself in the lines I read.

### 2.4 Where in Book One such a person is recognised, challenged, welcomed or in danger
- **The Hedge gate, Rootday morning:** a Synod Legionnaire fetches Kaelen with a letter; Old Harrow "would come no nearer" (B1 626-630). The town's reaction: "Oakhaven watched him go by the way it always watched him: sideways" (B1 652).
- **A Legionnaire's bell speaks to the glass** (B1 654-664). Anyone glass-armed hears the murmur; the murmur is a pressed person.
- **The Church at the North Gate, Dawnday:** the arm sings back to the Pure Note unbidden (B1 2249: "Not ring. *Sing.* A single note, rising up through the sand in a pure clear line"), and Crane names him "Consecrated" (B1 2343-2345). The Church wants a Consecrated hand at the collar (B1 2387: "The Church has asked that the wire be threaded by a Consecrated hand").
- **Factor Vosk** ("sees pitch as color through resonance lenses", SB 382) reads him within a minute (B1 2381-2391).
- **Anyone who hears glass:** Vaelen hears every piece of Dawning glass continuously (SB 160; V3 43). Other glass is outside that: see 2.5.
- **The Boar & Dulcimer:** Vane "could hear him too: a thin, high, sweet ringing" (B1 1394). The tavern's rules ("NO SINGING...", B1 1373) are the town's cover for a glass man.
- **Welcome:** the Kestrel (B1 1430-1434, Vane takes Consortium scrip from him for berths). Lyra's house (B1 1131-1139).

### 2.5 What a stranger with a glass arm could plausibly be in Harvestmonth 419
- **[PROPOSED] A glassed person whose glass is not Dawning glass and not a Foundry casualty.** Safe because: (a) B1 2341 "men like you" is plural; (b) SB 160 says raw glass crystallises flesh in four stages with no requirement of the Dawning; SB 209: "The Deep Guilds mine the richest Aether-Glass seams on the continent"; (c) the party-line rule is for "two pieces cut from the same Spire" (SB 160), so a limb of Heat or Growth glass would not be heard by Vaelen; (d) the game's own lore text (DATA 142) says "A limb that takes it in calcifies and begins to ring".
- **[PROPOSED] A bore-hand or tuner of a different Consortium bore** who took raw glass in a seam accident, at Ringing or Frost stage, not Set. Safe because: B1 1747 shows bore-head failures killing crews even at Oakhaven ("Marten, and Old Coyle, and the Tanner twins"); the Consortium works many bores (SB 250).
- **What they cannot be:** (1) anyone on the Dawning floor in 412 who held a bulkhead (SB 302 and B1 175 give that to Kaelen, and the three gantry boys he threw into the conduit); (2) anyone Consecrated by the Church (the Church lists its thirty-nine, B1 5134); (3) anyone with a limb set "from the fingertips to the shoulder" and cyan (that is Kaelen's exact description, B1 482, 592); (4) anyone the hounds are said to "treat as one of their own" (the books do not say it even of Kaelen); (5) the Conservatory of Bores alumnus whose Sequence is used at Oakhaven (the Vance Sequence is Kaelen's, B1 4267).
- **[PROPOSED] Why on the road to Oakhaven:** the quarry takes bore-hands (B1 1747 shows losses of crews, "two lost shifts", B1 1159), and the mooring mast brings Consortium freight (B1 674-676, ship at the mast). A bore-hand sent as a replacement is safe; the Church's arrival (Day 6) is the danger.

### 2.6 What the books do later with the trade
Kaelen's glass spreads to the throat (V3b: "a finger's width from the throat at the end of Book Two, and half a finger after the Valley"); he is the only man who can reach the Keystone: B4a 522 "a man with a glass arm walking toward a god in the dark", B4a 552 (Hadda Steyn takes his "bare glass arm by the wrist"). SB 475 (decided ending, "the Resonant Accord"): "Kaelen takes the place of the Chorister he talked into letting go: he becomes the new voice of Light, sealed in the Dawning Spire." **The game must not give any glassed traveller that role, the Dawning tone, or the "hear the Choristers" progression to its end.** Book Two puts a Consecrated on the Free Captains' foredeck as a scandal (B2c 1599: "a Consecrated, on the foredeck of the Free Captains' ship, with an arm of glass").

---

## 3. THE CANTOR

### 3.1 Is it a thing in the books?
**Yes, a real trade, under this exact name. It is the one calling here whose title the manuscript uses of a whole order, and Oakhaven's Cantor is Lyra Ashgrove.**
- B1 480: "the Governor's boy and the orchard-cantor's girl".
- B1 2307-2311 (the Warrant): "the Cantor of Oakhaven, Lyra Ashgrove, having been chosen by the Consortium of Bores and by the Arbiterium for the honor of the Unison Hold".
- B1 6200 (writ): "Lyra Ashgrove, Cantor, of Oakhaven".
- B1 2135: "the old song the Cantors had used for three hundred years to bring lost lambs home off the hills at dusk".
- SB 314: "*Thirty-three. Support. The Cantor of Oakhaven, who sings its births, fevers, and burials.*" The game's desc (DATA 22) "You sing the births, fevers and burials of orchard country" lifts this almost word for word.
- The "old faith" status: V3 22 re-labels "The Reach's Cantor tradition is the 'old faith' — practical, agricultural, un-theological." V6 77: "the Cantors of the Reach... an orchard trade — tending notes, felling-songs, midwifery. **The only order that kept the song.**"

### 3.2 What the books give the trade
- **The voice and the Narrow.** B1 266: "the most frightening moment in an Oakhaven birth was now the moment of silence... Too loud, a[nd the hounds]..." (the rhyme: "too loud brings the hounds, too still brings the Hush", DATA 141). B1 250: the jar trick: "a Cantor's trick from the orchard days, for when you wanted a sound to go *into* a body instead of into the air. The jar caught the note and gave it to the skin." B1 1937: "sitting on the edge of the loft bed with a clay jar pressed to the hollow of her own throat, the way Cantors had tested themselves for three hundred years."
- **What the Cantor does.** Sings the dead down: B1 512 ("after she had sung the Tanner twins into the ground side by side"), B1 1051 ("You'll sing me down... Proper, mind. Not in a jar. Not in the Narrow."). Heals: B1 1087 (callers at the door all afternoon). Brings lost children home: B1 458, 2135. Sings fevers: B1 3544 ("an orchard-cantor had stood up in that kitchen at four in the morning... and sung her back").
- **Not the lamps.** B1 412: "the lamplighters came, walking the lanes with their poles and their tapers... the night-hummers went out with their stools and their shawls, old men and old women mostly". The lamps and crossings are other people's trade (the game's Lyra face gives them to the Cantor, see section 9).
- **Pay and standing.** The books do not give a wage. A bowl of milk: B1 3544, "Mistress Pellow had put a bowl of new milk on Lyra's step every week of the two years since". The Rite pays one: B1 827: "Paid enough to leave the Reach if she wants". Town standing: the Cantor's chair in the Greenhall "where the Cantor's chair used to stand" has been replaced by the Queen's seal (B1 684).
- **Who commands a Cantor.** Nobody, formally. The Church does not license them: its stance is "every second note a sin" (SB 144: "The Church declared every second note a sin"). The "rubric" of the Rite is the Church's: B1 2828 (epigraph, "Rubric of the Rite of Unison"), B1 2836 ("the chosen voice is not worn out on ordinary speech").
- **How one becomes one.** B1 3010: "the shape her father's hands had made in the air when he taught it to her in the reed-rows when she was four years old". The school: "the Reedside Conservatory" (B3b 1443, a quotation from "Cantor-Master Ilse Brennan, to her students at the Reedside Conservatory, Oakhaven, in a note she wrote on a slate in 408"; B4a 2005: "She had been Cantor-Master of the Reedside Conservatory for forty years, and she had taught Lyra the tending note at eight, the falling fifth at twelve, and the felling-song at sixteen. She had lost her voice in 408."). **Book One never mentions Reedside; Books Three and Four do.** (grep `reedside|Conservatory` in B1 finds only the Conservatory of Bores.)
- **What it costs.** The wire: B1 3950: "Nothing came out of it. Nothing at all: not the tending note, not the Root note, not a rasp". V3b: "**Lyra** has no voice at all, not a whisper (Book Two Ch14)." V1 459 (a Vol I table, weaker than the books): "Throat damage is permanent; mana is literally breath; a Cantor who loses her voice loses everything."
- **The orchards.** B1 502: "The orchards themselves were gone. The wind-reeds had been the Reach's glory once... On the day the Spire of Dawning broke, every reed in the Reach turned in an hour to something like spun sugar, brittle and glassy and clear, and the next wind blew them into glittering dust." SB 638 ("Tobin's seven wind-reed pipes hang on pegs in Lyra's house, the last reeds in the Reach that had not turned").
- **The bells.** B1 410: "the Synod had requisitioned every bell in the Reach in the first year of the quarry." (so the game's "a woman who died before the Synod took the bells" (DATA 23) is dated at the latest to 417, in the books' terms).

### 3.3 Named people of the trade
- **Lyra Ashgrove**, Cantor of Oakhaven (SB 312-318). House on Cooper's Row, "two rooms and a loft" (B1 498).
- **Tobin Ashgrove**, her father, orchard-cantor, taken in spring 417 (SB 636: "taken in the spring at the Pellow farm... his lyre is found by the stile"); B1 2135 (he sang at full voice "until the hounds came and there was nothing left of h[im]").
- **Cantor-Master Ilse Brennan** (B3b 1443; B4a 2005): taught Lyra; lost her voice 408; seventy-eight in Book Four.
- **Dorran Sedge**: "kept the river gate for twenty years and the reed-beds at Reedside before that" (B4a 1799), not called a Cantor.
- Not Cantors but of the same world: **Old Tam**, night-hummer (B1 1989); **Bettany**, midwife, hums the tending note "badly" (B1 3956).

### 3.4 Where in Book One a Cantor is recognised, challenged, welcomed or in danger
- **The Church's warrant** names the Cantor of Oakhaven as the chosen voice (B1 2307-2311); **two Legionnaires are posted on her** (B1 2315-2325). A second Cantor is a second candidate for the collar. SB 575: "*Source: Cantor, local (1). Collar: standard. Wire: standard.*"
- **The Rubric days** (B1 2836-2914): "no speech, honey and raw egg, oiled throat, and two kind women who tell her she is fortunate" (SB 591). **The inquisitor's test**: she passes by saying "*I am fortunate*" flattened onto 174 (SB 593; B1 3034-3078).
- **The Hedge at the dead hour:** the voice of the dead calls through the Hedge (B1 446-460); the Wearer lures Pim at the Listening Hour (SB 635); the town's rule: "the way every child in Oakhaven was taught to, the way the rhyme said" (B1 448).
- **The Hollow:** burl-sick patients, the Grafters come on Rootday (B1 380, 939-945). A Cantor is the only one who "sings them down".
- **Welcome:** the town hums the Root note under the Church's one note (B1 2932-2936: "It was quieter than speech... a low warm ugly homely note under the pure one"). Anyone who sings the tending quietly would be a friend to the Hollow and to Lyra (B1 1051).

### 3.5 What a stranger who is a Cantor could plausibly be in Harvestmonth 419
- **[PROPOSED] A cantor of another parish or hill valley, not Reedside-trained, who walked in on the Greenroot road.** Safe because: SB 201 puts "Greenroot Hamlet" downriver; the books name no other living Cantor in Oakhaven or the Reach except Lyra and Ilse Brennan; "the orchard-cantors" are plural (B1 410, 682, 502). The books are silent on how many other Cantors survived.
- **[PROPOSED] Trained by an old orchard-cantor and not at Reedside.** Safe because B1 is silent on Reedside; but do **not** make them a student of Ilse Brennan (B4a 2005: she knows her students).
- **What they cannot be:** (1) Oakhaven's Cantor (Lyra holds the office; "the Cantor of Oakhaven" is her title in the warrant, B1 2307); (2) the daughter or son of Tobin Ashgrove; (3) someone who knows the Cantors' Secret (see 3.6); (4) a child of the Pellows, Carders, Madders, Hales (named families, B1 passim); (5) anyone who "sings the Tanner twins down" (B1 512 is Lyra).
- **Why on the road:** the Church's warrants are public (B1 2307-2311 reads "Aloud. In the square"); a Cantor might come for the Rite's Hold or flee it. Day 6 is the last day roads are open: B1 3404 shows the Hedge closing during the Greening.

### 3.6 What the books do later
- Lyra goes to Ashfall's Registry Square and the Basilica (SB 525: "The Basilica of the Pure Note straddles the line on the ninth tier... The rubric again: two kind women, honey and egg"). SB 450 (Book Four): "Ilse Brennan's letter: **the orchard Cantors were the Root's nurses**, singing its five-note lullaby every Longest Night until the vault was sealed three hundred years ago." V5 196-199 and V6 40-50 build on it (V6 marks the Rota [PROPOSED]). SB 475: "the Cantors' craft is the Architects' lost curriculum, and Lyra spends the rest of her life teaching children the law-songs."
- **The game must not reveal the Secret** (the five-note lullaby, the Long Tending, "founded to sing to the Root"). The DATA 22 line "Your tending notes are older than the Church knows" nudges toward it. SB 144 allows it as a hint ("fragments of the law-songs") but SB 312-318 calls it Lyra's "Hidden weight" she "does not know".

---

## 4. THE CORSAIR

### 4.1 Is it a thing in the books?
**Yes: the Rust Coast Free Captains and their air-crews. "Corsair" is used for Vane by the bible and the Free Captains' ships; the manuscript's word is "smuggler", "carrier", "captain", "Free Captains".**
- SB 322: "#### Vane — Corsair of the Rust Coast · 639 Hz".
- SB 266-268: "### The Free Captains of the Rust Coast / Smugglers and privateers under Oona Salt, Harbor-Queen of Port Cantabile. They sell black-market glass and **vox-bottles**... Mercenary, proud, and for sale to anyone."
- B1 1327: "the Free Captains had begun paying double for deaf bosuns."
- B1 5486 (epigraph): "— Free Captains' handbill, Port Cantabile".
- B1 674-676: "a ship that flew nothing at all from a Consortium mast was either a Consortium secret or a smuggler with a Consortium contract."
- The game's own lore text calls them "Air-crews of the Rust Coast, bound by shares and no flag" (DATA 145). B1 has "shares" nowhere in that sense; the books are silent on shares (grep `shares` finds nothing relevant). V4 199-215 is the Articles of the Free Captains; V4 is a bible about Book Two.

### 4.2 What the books give the trade
- **Ships and crews.** B1 1321: "She was sixty feet of brass rib and oak plank under a grey sailcloth envelope that had been patched so often it looked like a quilt, and four lift-tanks slung beneath her keel glowed the faint cobalt of drift-glass." Crew in Book One: Vane, **Mags Tennant** (bosun), **Pennick** (young engineer, "talks to the lift-tanks", SB 382).
- **What a corsair carries.** B1 1562: "a matched pair of Rust Coast work, long-barrelled and silver-chased, and he had named them *Last Rites* and *Second Opinion*... loaded... with glass shot". B1 2774: "the swivel gun in its tarpaulin on the foredeck. He had bought it in Driftwood Cay eleven years ago". Glass shot costs "a sovereign a pellet" (SB 87).
- **What they wear.** The books are silent beyond "a cap" and coats; the game's `captains` set is the game's own.
- **Pay and debt.** B1 2634 (Oona Salt's letter): "*Four hundred and eighty sovereigns against the Kestrel, and you have paid me sixty since the spring... Bring me two hundred by the turn of the season or bring me the ship.*" B1 3888 (Vane's confession): "Thirteen hundred-odd crates' worth, and I signed for every one". Crates are the Catalogue's, not the Consortium's: B1 1313 (stencil: "OFFICE OF THE CATALOGUE • RESONANT ENGRAMS • HANDLE IN SILENCE"); B1 4534: "Eleven consignments between Greenleaf of 417 and Leaffall of this year... Twelve crates, then sixteen, then twenty-four and twenty-four and twenty-four and twenty-four".
- **Who commands them.** The captain; behind him the Harbour-Queen: "Oona Salt, the Harbour-Queen" (V4 183; SB 266). Law is "the Articles, read aloud in a flat voice and enforced by **the drop** from the derrick on the Mole-head" (V4 184). **V4 is a bible about Book Two; none of the Articles is in the Book One text.** Only the Twelfth and the Sixteenth are marked "canon" there.
- **Fears.** The trench and the Hush: B1 1685 ("'Forty-eight,' he told the dark, the way he did most nights"); the vox-bottle (B1 1677); "the dark was now full of things that could call to you in your mother's voice" (B1 1327). Deaf bosuns are valued because of it.
- **How one becomes one.** Silent for a hand; for a captain "a tow went wrong" and a ship (B1 1357). SB 322 is the full story of Vane.
- **What it costs.** "He laughed when the trench opened under the *Wave-Cutter*... because that was the th[ing]" (B1 2712); SB 322: "loudest laugh in the room when he is most afraid" (the game lifts this: DATA 31 "You laugh loudest when you are most afraid").
- **What they are called.** "the carrier styled Vane, of registry OK-114" (B1 6200); Rust Coast "hand-cant" (B1 1327).

### 4.3 Named people of the trade
- **Captain Vane**, 41, master of the *Drift-Kestrel*, formerly of the *Wave-Cutter* (SB 322; B1 2810).
- **Mags (Margarethe) Tennant**, "six feet and some inches of Rust Coast bosun... deaf since the day she was born" (B1 1327).
- **Pennick**, engineer, who "talks to the lift-tanks" (B1 1321; SB 382). Pennick's *predecessor* was eaten by a Terrasque calf (B1 1307).
- **Vesper**, Vane's first mate, five years in the tonal trench (SB 362; not in Book One).
- **Oona Salt**, Harbour-Queen of Port Cantabile, fifty-six (V4 209; B1 2630-2634).
- **Hesper** (Lantern Yard, takes wreck orphans, SB 509); **Ormond Dace**, bottled at the Cape lip (SB 557); **Hap Tolland**, master of the Free Captains' coal-freighter *Small Hours* (SB 456).

### 4.4 Where in Book One a corsair is recognised, challenged, welcomed or in danger
- **The Consortium mooring mast above the quarry** (B1 1321-1323, 690): the only skyship at Oakhaven. A second air-crew hand with no ship is out of place.
- **The Boar & Dulcimer** (B1 1360-1390): the only public house; no singing, no dice (B1 1373). A corsair's laugh is against house rules. Vane drinks there; he is the one corsair the town knows.
- **The paymaster's clerk** (B1 2596-2624) counts the crates; his first posting "was the harvest-house at Whisper-Grove" (B1 2622). A stranger who knows the Rust Coast would be asked.
- **Aboard the Kestrel:** the hold talks (B1 1305-1313: "twelve of them talked in their sleep"); a stranger aboard would hear the crates and be asked what they hear.
- **The Church's cutter** (B1 5518): "an Office courier-cutter, forty feet, lead-grey". The final writ (B1 6200) declares "the carrier styled Vane, of registry OK-114" Dissonant; anyone seen with the Kestrel is in the writ's reach.
- **Welcome:** Vane takes "the glass man" and "the Cantor" at once (B1 1430-1434: "I don't know what it is yet, and I love it already").

### 4.5 What a stranger who is a corsair could plausibly be in Harvestmonth 419
- **[PROPOSED] A hand or gunner of another Free Captains' air-crew, left ashore.** Safe because B1 1327 says the Free Captains hired widely; B1 2774 puts the docks at "Driftwood Cay"; B1 1321 has only one ship at the mast, and no book line says that no other Rust Coast hand is inland.
- **[PROPOSED] Came inland on a Consortium freighter** ("Consortium freighters flew green and black", B1 674-676). Safe: the mast is Consortium property.
- **What they cannot be:** (1) Vane, Mags, Pennick, Vesper; (2) someone of the *Wave-Cutter*'s forty-eight (B1 1685; SB 322: "Forty-eight men lived"); (3) the "violet-eyed woman" (B1 1357); (4) a Free Captain who owes Oona Salt for a ship (B1 2634 gives that to Vane); (5) anyone who carries Catalogue crates (that is the Kestrel's trade, B1 1313).
- **Why on the road:** work; running from Oona Salt's reach is Vane's reason (B1 1357: "The northern runs went inland. Nobody had ever been drowned inland."), so a second runner with the same reason would echo him; avoid.

### 4.6 What the books do later
Book Two Part One is the Rust Coast: SB 495-511 (Port Cantabile, Oona Salt, the Salt Stair, Wendmere and the Chime, vox-bottles). Vane dies in Book Four (V3b: "**Vane's** death stays in **Book Four**"). The Hush eats the Coast. **The game should not use the Articles, the Mole-bell, Wendmere or the vox-bottle method (SB 561) as set pieces.**

---

## 5. THE ARCHIVIST OF THE VEIL

### 5.1 Is it a thing in the books?
**Yes, but as a single person and a dead order. "Archivist of the Veil" is Sable's title.** SB 330: "#### Sable — Archivist of the Veil · 741 Hz". SB 334: "The last Veil-sworn scribe, conscripted into the Catalogue." SB 42: "The Silent Veil was an independent order of archivists, absorbed by the Synod as the **Office of the Catalogue**. Sable is the last Veil-sworn scribe, conscripted." SB 181: "c. 300 SR | The Silent Veil is absorbed as the Office of the Catalogue."
- B1 4498 / 4626: "an archivist of the Silent Veil".
- The game's desc (DATA 40) "A conscripted scribe of the Office of the Catalogue who walked into the mist with a Ledger" is Sable's own story verbatim: SB 334 "she recorded the Unnaming of Whisper-Grove, seventy-four thousand names, then stole the Bound Ledger and walked into the mist". The line "Every name you keep costs you a little of yourself" is SB 334: "for every name she keeps safe, she gives up an equal weight of herself."
- The Office staff proper are "clerks": B1 4904: "Eleven staff... Nine of them are clerks and two of them are proctors". They are not called Veil-sworn.

### 5.2 What the books give the trade
- **The Ledger and its price.** B1 4125: "The Bound Ledger holds what is written in it. That is its whole nature and its whole price. It is not paper; the Veil bound the first of them eleven hundred years ago out of something that is not paper... But it holds nothing for free. It is a set of scales. Weight for weight: to keep a thing, the scribe gives up a thing of her own, and the Ledger decides what". **Note: "the first of them" and B1 4918 "the Bound Ledger of Whisper-Grove" imply more than one bound ledger exists.** SB 42/334 says only one scribe is Veil-sworn. B1 4127: "seventy-four thousand six hundred and eleven names into it in eleven days."
- **Reading the names.** B1 4105: "'Entry forty thousand, one hundred and one. Ivo Renn, forty-one, cooper, of Ashlane...' She read it the way the Veil had taught her to read, flat and clear and unhurried, in the voice of a person reading a will."
- **The rules of the Veil.** B1 4167 and 4223-4225 (epigraph): "The Veil keeps three rules. Write what happened. Write who it happened to. Do not comfort yourself in the margin." — "Precept of the Silent Veil".
- **The inventory.** B1 4119-4143 (the three fragments: the scriptorium, her mother's hands, her name). V3b: "**Sable** has **one** piece left at the end of Book Two".
- **The scriptorium and the Veil-house.** B1 4135: "Cold stone, tallow, wet wool, and vinegar, because we cleaned the desks with vinegar on the last day of every month. Fourteen desks. Mine was by the second window." B1 5646: "The Mausoleum of Chords... The old Veil-house. Eleven hundred years of records." B1 5680: the Veil-house "with no roof on it".
- **The Office at work.** B1 4864-4870 (she wrote the intake pamphlet: "Nine seconds... a man at the end... to take coats and bundles and give a numbered ticket"); B1 4872 (the Malting: "a brewer's before it was a harvest-house: a long brick range with two kiln-chimneys"); B1 4930-4944 (Quist's soft speech).
- **Pay / rank / commanders.** "Registrar-General Pellam Quist runs the harvest-houses" (SB 252; DATA 144). B1 4924: "he had taught her how to rule a page when she was nineteen years old." The books give no wage; the game's "a desk with a lock" is silent in the books.
- **What they carry.** A pen: B1 4195 ("took up her pen"). The Ledger "came round from her elbow and hung in the air" (B1 4918). A hand-press "at 741" is the Office's tool (SB 160: "a hand-press at 741"; B2b 531 "the proctors' hand-presses in the plaza at Whisper-Grove, tuned to seven hundred and forty-one").
- **Ink names.** The books are silent. SB 334: "'Sable' is only a Veil designation." No book line about ink names. (grep `ink name|designation` finds only that.)
- **What others call them.** "the Office's great outstanding irregularity is a scribe who walked off with a bound ledger" (B1 4904).
- **Fears / costs.** The nightly inventory (B1 4119-4123: "the word *scriptorium* had begun to arrive a half-second late"); the Hush-less quiet of Whisper-Grove.

### 5.3 Named people of the trade
- **Sable**, last Veil-sworn scribe (SB 334).
- **Registrar-General Pellam Quist**, "small, neat, elderly... half-moon spectacles... ink on the side of his hand" (B1 4924).
- **Renshaw**, a clerk (B1 4926, "Renshaw, a chair, and hot water").
- **The unnamed paymaster's clerk** who started at the Whisper-Grove harvest-house (B1 2596-2624).
- **Hester Vell**, Deputy Registrar (V3b: "Vol IV's proposed Deputy Registrar Halloway is renamed Hester Vell"; SB 428: "knits, warns her").
- **Ambrose** (coffee, SB 428) in Registry Square; **Wren Halloway**, WG-41,005, the boy in the Aegis (SB 340).
- The four hundred and thirty-two and "Annet Sowerby" (WG-41,006), etc., are cores, not scribes.

### 5.4 Where in Book One an archivist is recognised, challenged, welcomed or in danger
- **At Oakhaven:** the Legionnaires' bells murmur a pressed person (B1 654-664) and the Synod clerk with a ledger records deaths (B1 1622: "a Synod clerk followed them with a ledger, looked at the boots, and wrote for some time"). The paymaster's clerk counts crates and says "My first posting was the harvest-house at Whisper-Grove" (B1 2622): **an Office-trained hand would be recognised by a man of the Office's own.**
- **Whisper-Grove (Ch.14-16):** Sable is the only person there (B1 4089-4195). A second archivist would meet her in the Moot-house.
- **The Malting, the clerks' hall, Quist** (B1 4872-4944): "every person in that building who is not physically holding a subject will come and look at me" (B1 4904). A stranger of the Office walking in would be handled the same way.
- **The Hall of Carriage** (B1 5866, the one B1 mention, where Sable opens the Ledger to a page of it; V3b "basement: Sorting... third floor: the carpet corridor and the walnut cabinet of staff trays"). A scribe's name is in a tray (V3b: "A **copy** of her name sits in the third tray").
- **Welcome:** the Kestrel's Sable-seeking (B1 3896: "There's a scribe... If anybody alive knows how to put a name back into a head, it's whoever worked out how to take it out").

### 5.5 What a stranger who is an archivist could plausibly be in Harvestmonth 419
- **[PROPOSED] An Office clerk or registry hand (not Veil-sworn), conscripted, who left a harvest-house or a carriage office.** Safe because: B1 4904 gives staff at the Malting as nine clerks and two proctors, and the Office runs harvest-houses across the Woods and (B1 4864 area) "in 417, to the Iron Peaks and the Caldera"; the Office conscripts: DATA 40 says so, SB 42 "conscripted". The books name no other deserter.
- **[PROPOSED] Does not carry a Bound Ledger**; carries an ordinary registry book or a copy-book. Safe: B1 4934 "the Office's own duplicate schedules were intact".
- **[PROPOSED] Never at Whisper-Grove in 416** or only as a junior copyist. Safe: B1 4942 "two of the clerks had never come back to work afterward"; the books name no clerks at Whisper-Grove other than Sable and Quist, and Renshaw.
- **What they cannot be:** (1) Sable; (2) "the last Veil-sworn scribe" (SB 42: so no second Veil-sworn hand); (3) a person who "walked into the mist with a Ledger" (the DATA 40 phrase, which is Sable's); (4) Quist's student at nineteen (B1 4924 is Sable's). The game bio's "woman of sixty-one... hand you recognised from a letter in your mother's kitchen" (DATA 41) collides with nothing I found.
- **Note on the name.** "Archivist of the Veil" claims the Veil. SB 42 says only Sable is Veil-sworn. **The game's name collides with canon; the traveller should be an Office clerk who studied Veil forms, or a Veil-trained child of a dead house.** **[PROPOSED]** only; no line says either.
- **Why on the road:** "The Office took you young" is plausible: the Office relief stations are the Reach displaced's first room (B1 4872-4890), but those come after the Greening (Day 11+). Before Day 11 the Office has no desk at Oakhaven (B1 1622 shows only a clerk with the Legion).

### 5.6 What the books do later
Sable gives Wren Halloway his name back in B2c (Ch.14; SB 395: "It costs her mother's hands"); loses her true name at the Malting (V3b); enters the dead by docket in Registry Square (B3, SB 423-437); V3b "anyone may stand in the door for a Hollow and pay the price" (SB 437). **The game should not use the Registry Square third floor, form F/3, the Concordance, or the Aegis's name.**

---

## 6. THE FLAMBEAU PENITENT

### 6.1 Is it a thing in the books?
**The Flambeaux are in the books in force. "Penitent" is not a word in the books.**
- `grep -rn -i penitent Books` returns nothing. V3 162 uses "penitent" once, in a different sense. The only use as a faction is SB 292: "**Restore** draws on the Church's penitents, Null-Watch, and the Sky Choir remnants." (a bible line, no manuscript).
- The Flambeaux: B1 2265-2267: "On either side of them walked the Flambeaux... Tall men and women in robes the red of banked coals, hooded, their faces in shadow, each carrying a fire-stave: a staff of black iron as tall as a man, topped with an iron cage, and in every cage a fist-sized lump of amber Aether-Glass, burning. Glass-fire."
- SB 246: "The Church's Inquisition, the **Flambeaux**, burns dissonants: the off-pitch, the burl-sick, the heretical, the inconvenient... The Flambeaux carry glass-fire — white-gold flame fed on amber Aether-Glass, which the Cacophony will not cross". V1 400: "**The Flambeau** (itinerant) — the Inquisition. Ignatius's former order. Produces silence. Motto: *Progress is noisy.*"
- The game's Penitent desc (DATA 49) is Ignatius Crane: SB 340: "The Inquisitor who swung the censer through three hundred sunrises of the Rite and, when the light turned, ordered the choir burned. He still half-believes he was right... His fire is fed by faith, and as his faith dies his flame gutters". ("You carried a censer... until the day the light turned. You still half-believe you were right. Your faith is fire, and both are guttering.")

### 6.2 What the books give the trade
- **Dress and tools.** B1 2265-2267 above. The censer: "a great brass censer on a chain, walked the Inquisitor" (B1 2273). The chain: "The chain creaked at the top of each arc." (B1 2275). **The censer is the Inquisitor's, singular** (B1 2273: "alone, in red, swinging a great brass censer"). The books do not give a rank of "censer-bearer". Glass-fire flare keeps hounds back: B1 2271: "a Flambeau on that side raised his stave, and the white-gold fire in its cage flared, and the jitter flinched back into the trees."
- **The mace.** The game's bell-bronze mace "Cast by the Flambeaux from a cracked chapel bell" (DATA 164) is the game's own; the books say the Synod "requisitioned every bell in the Reach" for bore-teeth (B1 410). Silent about Flambeau weapons other than staves and, later, "a long gun" (B4a 768: "a Flambeau standing at the rail with a long gun. Not a censer. A gun").
- **Ranks.** Inquisitor (Crane, B1 2273); **Flambeau-Preceptor** (Lucan Ostrel, SB 463; B4b 1536 "the Preceptor"); **Canon** (B4b 1260 "the black cassock of a canon of the Basilica"); **High Patriarch** (Severin Ashe, SB 246); **chapel-reader** (B1 652, "the chapel-reader's sermons"); the Church's "sisters" in grey with gold at the collar (B1 2836). A Flambeau chapter exists at Port Cantabile: B2a 248: "there's a Flambeau chapter up there now and they pay for talk". **No book line gives the Flambeaux a novice grade, vows, or "years of service"; the books are silent on how one is made a Flambeau.**
- **The Rubric.** The Rite's rubric (epigraph B1 2828; B1 2836 "it was in the rubric... the chosen voice is not worn out on ordinary speech"; B1 2914 "which the rubric required, 'that the Light may see the instrument'"; B1 3078 "as the rubric required"). It binds the Cantor, not the Flambeau.
- **The Pure Note.** "Five hundred and twenty-eight... Held without end, as the catechism said, the breath passed down the line from voice to voice so that the note never broke." (B1 2263). 528 Hz; the game gives the Penitent '285 Hz', which is SB 340's hz for Crane ("Flambeau of the Synod · 285 Hz").
- **The doctrine.** "*Where the second note has taken root, let the Pure Flame be the only song.*" (B1 2238, Warrant epigraph). "The Only Song" is a printed pamphlet "every Flambeau who had ever gone up the Greenroot road carried a printed copy in the breast of his [robe]" (B4b 1048).
- **What they are called.** "holy daughters" for the choir (B1 2345); Crane is "the Inquisitor". The reading aloud of the warrant by a "herald in white and gold" (B1 2303).
- **What it costs / what it does.** The Bleach took Crane's left hand (SB 340; B1 2299-2303: "bleached out... translucent white of a skinned almond"). His seven years: "I have prayed about that humming for seven years" (B1 2345). The game's "ash... a child's shoe... the Pure Note still ringing in your teeth" is the game's own scene (the books never describe a Flambeau holding a shoe); the Dawning Rite is the only Rite the books show going wrong, and in it the Flambeaux "lifted their staves" and burned the choir (B1 183-185: "'*Dissonance!*'... 'Purify them! Purify the Rite!' Along the walls, where they had stood for three hundred days with their fire-staves grounded, the Flambeaux lifted their staves.").

### 6.3 Named people of the trade
- **Ignatius Crane**, Inquisitor, 38, left hand bleached (B1 2299-2303; SB 340). Bonds: **Solenne**, "the woman he burned"; **Tull**, "whose brother his Flambeaux burned" (SB 340).
- **Lucan Ostrel**, Flambeau-Preceptor, canon in Book Four (SB 463).
- **High Patriarch Severin Ashe**, blind in the Bleach (SB 463), "A true believer who has never heard a Chorister" (SB 372).
- **Canon Placidus Sorell**, the mole (SB 463).
- **Abbess Wenna of the Unrung Bell** (SB 380): an ally, not a Flambeau.
- Two Flambeaux Vesper kills at the seventh anchor-house (SB 531), unnamed.
- Solenne (the soprano on the Dawning risers): **not** a Flambeau (B1 183-190).

### 6.4 Where in Book One a Flambeau is recognised, challenged, welcomed or in danger
- **The North Gate, Dawnday sunrise:** the Church comes up the Greenroot road "singing" with thirty choristers and the Flambeaux and the Inquisitor at the head (B1 2259-2275). "Nobody had heard singing anywhere — aloud, in the open, in daylight — and lived" (B1 2261). **A person in a Flambeau's red who arrives on Day 6 is one of the procession; a person who has left the order meets the procession.**
- **The square:** "The Flambeaux had grounded their staves at the four corners of the square, so that the glass-fire burned in its cages like four small suns" (B1 2329).
- **The Hollow:** "the Hollow be given to the Pure Flame at the hour the Rite of Unison is begun" (B1 2311). A Penitent is the person who might be asked to light it.
- **The Chapel of the Pure Note** with its "empty belfry" (B1 2323: "The note went up out of the empty belfry and settled over Oakhaven like a lid").
- **Ignatius' hearing:** the Church's own know their kind; Crane "heard" Kaelen's humming "every dawn" (B1 2345). He would know a Flambeau who lost his faith.
- **Welcome:** the Hollow and the Cantor would not welcome a Flambeau; "The town hums the Root note" (B1 2932). The Kestrel takes anyone (B1 1434).

### 6.5 What a stranger who is a Penitent could plausibly be in Harvestmonth 419
- **[PROPOSED] A former censer-bearer or lay brother of a Flambeau chapter other than Crane's, who left after a Rite at a chapel elsewhere** (not the Dawning, which the books give to Crane and the choir). Safe because: SB 246 says "wherever it prepares a Rite it holds the Pure Note"; V1 400 says the Flambeau are "itinerant"; B2a 248 has a Flambeau chapter at Port Cantabile, so there are several. The books name no other Rite that "went wrong".
- **[PROPOSED] Not a rank-holder.** The books give only Inquisitor / Preceptor / Canon by name; a lay bearer is below any named rank, and no line forbids one.
- **What they cannot be:** (1) Ignatius Crane; (2) Ostrel; (3) a survivor of the Dawning Rite: the Dawning choir and Flambeaux were mostly burned or bleached (B1 5134: eleven thousand and forty dead at Sol-Luminary); the books do not say all Flambeaux there died, but "Ignatius... the Light took the hem of his robe... it had stopped" (B1 2305); (4) Solenne's sister Seraphina, who bears the Sun-Blade (B1 187-190; she is not a Flambeau); (5) "a child's shoe in the ash" is the game's invention (no book line); it is safe only if the Rite is not the Dawning.
- **Why on the road:** the Church's arrival is announced: B1 2299-2315. A defector could be a day ahead of the procession on the Greenroot road. Day 5 or earlier.
- **Safe lines:** "He still half-believes he was right" is Crane's; the game's "You still half-believe you were right" (DATA 49) is therefore not safe as is. Recommend rewording in the next phase.

### 6.6 What the books do later
Crane is "Book One's hunter, Book Two's reluctant convert" (SB 340); V3 162: Solenne "makes him *look*, every day, at what the fire did". The Church turns on itself: SB 463 and the Basilica chapters (SB 525); Severin Ashe's last proclamation (B4b 1446-1468, "The canon put the pen in his fingers"). **The game should not have a Flambeau defect to the Chord or sign a proclamation; those are Crane's and Severin's arcs.**

---

## 7. THE QUARRY-HAND

### 7.1 Is it a thing in the books?
**Yes, as a workforce, but never as a named trade. The Oakhaven works are real and have named jobs.** B1 1382: "carters and quarrymen mostly" drink at the Boar; B1 1394: "the quarry-hands at the mast"; B1 2944: "The night shift and the day shift had both been kept on, and they stood along the rails in their drab with their caps off." The game's own wording ("Night shift at the Oakhaven works") matches B1 1725 (Tobiah: "Junior engineer, night shift") and B1 3294 ("Tam's widow's grandson on the day shift on the third terrace").

### 7.2 What the books give the trade
- **The place.** B1 1711: "The Oakhaven quarry had been a hole in the ground for two hundred years before the Consortium came: a stepped bowl of grey stone a quarter-mile across, from which the Reach had cut its millstones and its chapel steps and the lintels of half the houses in Oakhaven." **The Consortium's works are two years old**: SB 190: "417 SR | The Oakhaven quarry bore begins." B1 1323: "the green-gold glass the quarry had been bleeding for two years and more." **So no one has worked "the works" for more than about two years; the older quarry trade (stonecutting) is two hundred years old.**
- **The gate.** B1 1707: "Kaelen held the disc up to the grille, and the clerk in the gatehouse looked at it... and pulled the lever. Two Legionnaires stood on either side of the gate with their bells tilted to the sky". B1 799: "a disc of green Root-glass the width of his palm, stamped with the drill-and-wheel." Pay: "Consortium scrip. Green and black, stamped with the drill-and-wheel" (B1 1430), "a Consortium paymaster to sign a Consortium chit" (B1 1339).
- **The shifts.** Day shift and night shift (B1 1725, 2944, 3294, 1751 "before the day shift"). **The books name two, not three** (grep `three shifts|third shift|middle watch`: only "the middle watch", B1 1707 and 1847, as a time of night). The game's "three shifts" (DATA 59) is not in the books.
- **Who commands.** The Factor: "Factor Adela Vosk, the Consortium's resident factor at the Oakhaven works" (SB 382); the "bore-master" (B1 3116: "the bore-master brought the chains down another notch"; B1 3294); a gatehouse clerk (B1 1707); the Legionnaires "walk her line... before the day shift" (B1 1751, 1847). **Foremen**: the word does not occur (grep `foreman|foremen|overseer|ganger`: no hits in B1). The books are silent on foremen.
- **The bore and the pumps.** B1 1775: "The Carrow Bore hung in the middle of it on its chains. Its head was buried in the Root to the collar, turning, turning, and where it went in, the Root bled. Green-gold glass welled out of the wound... and along the channels to the pumps. There were men at the pumps. A dozen of them, in grey smocks... 'Catalogue labor,' said Tobiah". **The pumps are worked by Hollows (pressed people), not by quarry-hands.** This contradicts the game's "the pump-house floor" and "the sound the pump makes when the Root is awake" (DATA 58-59) as an ordinary hand's daily knowledge. B1 1787: the Root's breathing is heard in the chamber at the bottom, 400 feet down (B1 1767-1769: "At four hundred, the clay gave way to something else. Root").
- **The descent.** "The cage went down on its cable in the dark" (B1 1767). The books give a **cage on a cable**, no ladder. (grep `ladder`: the ladders in B1 are the Kestrel's mast ladder and the Foundry gantry.) The game's "carried two friends up the ladder" (DATA 59) is not in the books.
- **Dangers.** B1 1747: "The pitch went up a whole tone in about four heartbeats... And then the head went. And the crew on the platform— Marten, and Old Coyle, and the Tanner twins." B1 1159: "The harmonic slippage, the three shattered bore-heads, the two lost shifts — *attrition*". B1 3986: "Marten and Old Coyle and the Tanner twins died of slippage, sir. In the summer." The Factor calls loss "attrition" (B1 1159).
- **The Grafters.** They come to the Hollow on Rootday with masks and wagons (B1 380, 939-945): "a shell of stiffened leather over the whole face, with round glass eyepieces and, over the mouth, a lattice of fine wire". They cut sap-limbs. **They do not "bring up in sacks" anything from the quarry**: silent. The game's "what the Grafters bring up in sacks" (DATA 58) is invented.
- **Depots and tailings.** "the tailings" (B1 1829), "Depot Three" with "a reverse-phase coil out of its straw" (B1 1847), "cable-drums, the tanker bays, the glass-channels cut into the stone. The gantries, and the long low sheds of the depots, and a censer-platform" (B1 1715).
- **How one becomes one.** Silent; the Tanners and Marten are townsfolk (B1 512, 1747).
- **What they are called.** "quarrymen" (B1 1382), "quarry-hands" (B1 1394).

### 7.3 Named people of the trade
- **Tobiah Marsh**, junior engineer, night shift, "Consortium drab, with a junior's single green bar" (B1 1723). Later heir of Pennick (V3b "Pennick died in Book Three Ch1, and Tobiah is his heir").
- **Marten, Old Coyle, the Tanner twins**: dead of slippage in summer (B1 1747, 3986).
- **Tam's widow's grandson**, day shift, third terrace (B1 3294; unnamed). **Old Tam**, night-hummer, basket-maker, 81 (B1 1989).
- **Factor Adela Vosk**; **the bore-master** (unnamed); **Aldric Vance**, the Governor who sold the Root (B1 684-700).
- **Garret Tull** (Deep Guild bore-mechanic, SB 352) is the same wider trade, not in Oakhaven.

### 7.4 Where in Book One a quarry-hand is recognised, challenged, welcomed or in danger
- **The quarry gate** (B1 1707): disc, gatehouse clerk, Legionnaires whose bells "talk in their sleep". A hand has a disc or a chit; a stranger without one is stopped.
- **The night shift** (B1 1725-1751): Tobiah knows his crew; a hand he does not know is noticed.
- **The Factor's morning walk** (B1 1751, 1847): she "walk[s] her line of Legionnaires with her green lenses and listen[s] to each one" and the Legion reports what it heard.
- **The Rite day** (B1 2944): both shifts on the rails, caps off. **The Greening day** (B1 3386): "The day shift was running up the quarry road."
- **The Boar & Dulcimer** (B1 1382) is where quarrymen drink, and where Davin Hale is torn apart by hounds (B1 1578-1622).
- **Welcome:** Tobiah is open and eager (B1 1723-1751). The Governor needs hands: "I've got Tam's widow's grandson on the day shift" (B1 3294).

### 7.5 What a stranger who is a quarry-hand could plausibly be in Harvestmonth 419
- **[PROPOSED] A newly hired hand from outside, brought on to replace "two lost shifts" and "three shattered bore-heads"** (B1 1159). Safe because: the attrition is stated; the Consortium has paid "scrip" to men since 417; the works have been hiring (B1 1159).
- **[PROPOSED] A stonecutter of the old quarry** (pre-417 millstone trade, B1 1711) turned works-hand. Safe because the quarry is two hundred years old.
- **What they cannot be:** (1) Tobiah Marsh; (2) a survivor of the summer's bore-head crew (the only crew named is Marten, Old Coyle, the Tanner twins; B1 1747 says they all died: "And the crew on the platform—"; the books name no survivors, but the line reads as a full crew); (3) anyone who has worked the works for more than about two years; (4) a pump-worker (Hollows work the pumps, B1 1777); (5) a foreman or a bore-master (B1 3116 has one).
- **Why on the road:** work; the Factor's recruiting is the books' silence; Consortium scrip draws hands.

### 7.6 What the books do later
Oakhaven's Greening and evacuation end the works in Book One itself (B1 3386-3404; V7 37-138). The Grove: "212 rooted in a ring around the shaft-head" with Aldric Vance rooted in the iron (SB 450; B4a 1829-1863: "'If we're to be a wood, we'll be one wood.'"). Tobiah becomes Pennick's heir (V3b). **The game should not give a quarry-hand the shaft-head Grove or the 212, and should not revisit the quarry after the Rite.**

---

## 8. Cross-cutting observations a designer needs

1. **Four callings are book characters renamed.** Blade = Kaelen (SB 302 "The Dissonant Blade"); Corsair = Vane (SB 322 "Corsair of the Rust Coast"); Archivist = Sable (SB 330 "Archivist of the Veil"); Penitent = Crane (SB 340 "Flambeau of the Synod"). The Cantor = Lyra (SB 312 "Cantor of the Living Chord"). Of the six, only the Quarry-Hand has no direct book-character title. The traveller is "a stranger" whose trade is the same as a named person's: every trade section above lists who they must not be.
2. **Contradictions between game text and books** (to fix or accept):
   - DATA 14 "The hounds treat you as one of their own" vs B1 484 "they would not go near the hut".
   - DATA 14 "a medal": no book line.
   - DATA 59 "three shifts", "foremen", "the ladder": the books have two shifts, a bore-master and a cage; the pumps are Hollows' work (B1 1777).
   - DATA 58 "the Grafters bring up in sacks": no book line; the Grafters are surgeons (B1 939-945).
   - DATA 40 "walked into the mist with a Ledger": Sable's (SB 334).
   - DATA 49 "You still half-believe you were right": Crane's (SB 340).
   - DATA 23 "the old fourth line": the books give the falling fifth, the tending note, the felling-song (B4a 2005), the five-note lullaby (V5 198, a bible about Book Five), and the calling-song (B1 2135). **The "old fourth line" is not in the books.**
   - `grep` of the game's lore list: DATA 143 "nine dead monarchs, revived with glass hearts" is the game's summary of the Glass Court (SB 160); it is consistent.
3. **Time window.** The traveller meets Day 1 to Day 11 (6-16 Harvestmonth by the game's working assumption, SB 635). The Church arrives Day 6; the Rite is Day 11; the Greening empties the town. Anything proposed above that "arrived before Day 6" is safe; "arrived on Day 6" meets the Church.
4. **The calling Conservatory names clash.** "The Conservatory of Bores" (the Synod's, at the Organum; B1 480) is not "the Reedside Conservatory" (the Cantors' school, Oakhaven; B3b 1443). Use both full names.
5. **Hz.** DATA gives Blade 174, Cantor 174, Corsair 639, Archivist 741, Penitent 285, Quarry 396. SB 302 (Kaelen 174), 312 (Lyra 174), 322 (Vane 639), 330 (Sable 741), 340 (Crane 285), 352 (Tull 285), 346 (Aegis 396). The Quarry-Hand's 396 is the Aegis's and the Behemoth's. The Blade and Cantor share Kaelen's and Lyra's; the traveller inherits their characters' hz.

---

## 9. The six likenesses as now written: which sentences are the book character's own history

(Text quoted from DATA; "BOOK" gives the line that shows it. "Silent" = I found no book line. "Contradicts" = a book line says otherwise.)

### 9.1 Kaelen Vance (DATA 98-103)
- sketch (99): "The Governor's son, and Lyra Ashgrove's shadow since you were both nine." BOOK: SB 302 "The Governor's son and Lyra's childhood shadow"; B1 480 "They had been children together, she and Kaelen Vance: the Governor's boy and the orchard-cantor's girl". Age nine: silent.
- sketch: "You left the Reach at seventeen to learn how to fix a note, and came home with an arm of glass and no words about it." BOOK: B1 480 "At seventeen he went to the Organum, to the Synod's great Conservatory of Bores"; B1 482 "Seven years ago he came home with a Synod discharge and no letter of explanation, and his left arm turned to glass".
- history (100): "born in the Governor's house above the square, to a father who signs the town's bread": BOOK: B1 684-700 Aldric Vance is Governor; "signs the town's bread": silent.
- history: "Lyra taught you the Root note at nine, standing on a chair": BOOK: B1 480 "She taught him the Root note, which he was hopeless at"; chair and age: silent.
- history: "At seventeen the Conservatory of Bores took you... calibration tables, bores... You were the best of your year at it." BOOK: B1 4267 "Conservatory of Bores, 402 to 406, first in your year. Author of the Vance Sequence".
- history: "Then came the morning the sky rang, and you came home up the Greenroot road with a glass arm and a habit of silence": BOOK: B1 175-183 (the Foundry), B1 482 (home). Greenroot road: silent for his return (the Church uses it, B1 2259).
- detail (101): "a hut north of the North Gate, outside the Hedge, where the hounds do not come": BOOK: B1 472, 568, 628, 484. "a chalk list on a beam": B1 594 is a charcoal column "on the wall"; the beam list is on the Kestrel (B1 4042-4059). "pay it down a name a day": the list is the tideline measure (B1 592), not names.
- facts (102): Years thirty-four (SB 302), "a left arm of Light-glass to the elbow" (B1 592: fingertips to the shoulder, not to the elbow: **contradicts**), "turning it palm up" silent.
- says (103): "I don't build things anymore. I just know how they break." BOOK: SB 308 verbatim.
- **All of it goes.** The face is Kaelen.

### 9.2 Lyra Ashgrove (DATA 104-109)
- sketch (105): "Cantor of Oakhaven... teach every child in the parish their first note": BOOK: B1 2307, B1 6200 "Cantor, of Oakhaven". Teaching every child: silent. "reeds fresh every dusk, keep its lamps lit": **contradicts** B1 412 (lamplighters).
- history (106): "Your father was Cantor before you": BOOK: B1 480 "the orchard-cantor's girl", SB 314 "Her father Tobin, the orchard-cantor". "set the long cane in your hands before you could hold your head up": B1 3010 gives "when she was four years old" (conflicts mildly).
- history: "You tuned the First Reed over the door standing on a chair": silent (grep `First Reed` none).
- history: "buried your father in the Cantors' ground": **contradicts** B1 2135 ("until the hounds came and there was nothing left of h[im]") and SB 636 (his lyre found by the stile).
- history: "a house on Cooper's Row with a green door": B1 498 "Her father's house on Cooper's Row was two rooms and a loft"; colour: silent.
- history: "the rhyme they are taught here: too loud brings the hounds, too still brings the Hush": the town's, not hers alone (B1 448).
- says (109): "A martyr is just a musician who gave up before the coda." BOOK: SB 318; B1 2465 (Kaelen recalls it from the stile at twelve).
- **All of it goes.**

### 9.3 Captain Vane (DATA 110-115)
- sketch (111): "Rust Coast corsair, master of the Drift-Kestrel": BOOK: SB 322; B1 1305-1319.
- history (112): "In 414 the Wave-Cutter went into a tonal trench with her tow, and forty-eight men came home because of what you did with the axe at the hawser, and one did not": BOOK: SB 322; B1 1357 ("cut his tow over the trench off Cape Dissonance, five years back"); B1 1685 "'Forty-eight,'". The first mate is Vesper, SB 322.
- history: "bought the Drift-Kestrel in 417 with money you would rather not discuss": BOOK: SB 190 ("Vane buys the Drift-Kestrel on Catalogue money"); B1 2634 (the debt).
- history: "eleven Consortium consignments under your name, twelve crates a run": B1 4534 says eleven consignments, "twelve crates, then sixteen, then twenty-four"; the carrier is the **Catalogue's** (B1 4465 "Office of the Catalogue").
- detail (113): "a vox-bottle on a chain you have never unstopped": BOOK: B1 1677-1685; SB 328 ("carries a vox-bottle labelled VESPER"); "on a chain" silent.
- facts (114): Years forty-one (B1 2810). Born "A fish stair below the mast-yard, Port Cantabile": silent.
- says (115): "Every sailor dies, friend. The trick is to be somewhere else when it happens." BOOK: SB 328 ("*Every sailor dies. The trick is to be somewhere else when it happens.*").
- **All of it goes.**

### 9.4 Sable (DATA 116-121)
- sketch (117): "Archivist of the Veil. You wrote the forms the Office still files people under": BOOK: SB 330; B1 4864-4870 (the intake pamphlet).
- history (118): "The Veil took you young": silent (B1 4924: "taught her how to rule a page when she was nineteen"). "a civilisation does not need saving, it needs recording": silent.
- history: "In 416 you wrote down Whisper-Grove: seventy-four thousand six hundred and eleven names in eleven days": BOOK: B1 4127 verbatim.
- history: "Then you took the Bound Ledger and walked into the mist, and you have stayed in the drowned city ever since, reading twenty of them aloud every night, in a hand the Office cannot read": BOOK: B1 4089-4127, 4514 ("I have read twenty o[f them]").
- history: "the Office asked you to make its paperwork efficient": BOOK: SB 334 ("I made it efficient. That is what I was good at.").
- history: "you copied registers for eleven years and read them for four": silent.
- detail (119): "the Bound Ledger, which keeps a name only for an equal weight of you": BOOK: B1 4125 (weight for weight); "dictate your own punctuation": silent; "a pen you cut yourself": silent.
- facts (120): "Forty-one, by your own count": SB 334 cites ch.22. "Registrar-General Quist, who poured the second cup": B1 4924-4942 (Quist); "second cup": silent.
- says (121): "I am a list, not a cure. Say what you came to say." Silent in B1; SB 334's line is "*Entry forty-one thousand and five. Wren Halloway...*".
- **All of it goes.**

### 9.5 Anselm Rooke (DATA 122-127)
- sketch (123): "Surgeon-Grafter. The Synod sends the saws and you hold them": BOOK: SB 382; B1 951.
- history (124): "You learned the cutting in the Organum, where the Grafters train": B1 951 "He had come to the Reach from the Organum four years ago". Training: silent.
- history: "Four years ago they sent you to the Reach, and in those four years you have cut more limbs off more people than any butcher in the Reach has cut off pigs": BOOK: B1 951-953 near verbatim ("In those four years he had cut more limbs off more people than any butcher in the Reach had cut off pigs, and he had done every one of them with enormous care").
- history: "sap-limbs... chalked the doors": BOOK: B1 1067 (sap-mark "past cutting"); chalk: SB 382 "his green sap-mark means past cutting".
- history: "The Inquisitor has asked twice for your list of sap-marks": SB 577 ("admits the Inquisitor has asked for his list"); "twice": silent.
- detail (125): "a surgery off the tanners' lane": silent. "a bottle of Bettany's": B1 3956 (Bettany's long drops): "hers are for healing and yours are for cutting": silent.
- facts (126): "Orla Hale, whose floor you cannot cross": B1 1007-1067. "Fifty, or near it": B1 951.
- says (127): "I have cut more limbs than any butcher in the Reach and done every one with care." BOOK: SB 382 and B1 953.
- **All of it goes.**

### 9.6 Mags Tennant (DATA 128-133)
- sketch (129): "Bosun of the Drift-Kestrel": BOOK: B1 1327. "you have never needed a voice to be heard in a headwind": B1 1327 (deaf since birth).
- history (130): "raised in a boat-shed below the mast-yard at Port Cantabile, the youngest of a stevedore's family": silent. "learned the dock-crews' hand-speech": B1 1327 "spoke Rust Coast hand-cant". "Twelve years on the quay": silent.
- history: "Vane took you on as boatswain because you were the only hand he had met who would tell him a hold was heavy before the lift did": **contradicts** B1 1327 ("the only bosun on the Driftwood Cay docks who had not already heard about him"; the Free Captains "paying double for deaf bosuns").
- history: "Two years now of running crates with your name on the paper and no questions in it": B1 4534 (two years' consignments); "your name on the paper": the paper is Vane's (B1 4484).
- detail (131): "You sign when the wind is up and speak when it drops... read a man's lips": B1 1327 (reads lips in three languages); "speak": silent.
- facts (132): "About forty": silent. "a marlinspike": silent. "a collarbone that aches before weather": B1 4898 (a broken collarbone, Ch.18).
- says (133): "Slower. I read lips, not minds." silent (B1 shows her reading lips; line is the game's).
- **All of it goes.**

### 9.7 Survivors of the cut
- Nothing in the likenesses is the traveller's own. Every `says` line in DATA 103/109/115/121/127/133 is a book character's voice.
- The `detail`/`facts` fields name "Ties" (Lyra, Quist, Orla Hale, Vane, Mags, the Governor) that are all named book people.
- The only lines safe to keep in a traveller's face are the generic shapes, not the sentences: e.g. a left-handed measure each morning (the tideline measurement is Kaelen's, B1 592, so no).

<!--END-->
