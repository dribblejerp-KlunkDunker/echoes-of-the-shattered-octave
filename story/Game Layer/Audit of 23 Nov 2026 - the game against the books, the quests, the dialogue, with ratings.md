# Audit of 23 November 2026: the game against the books, the quests, the dialogue, with ratings

Asked for by the owner, 23 Nov, 8:56 am: "match the game to the books and recheck any and all decisions to make sure it makes sense in game. Run a full analysis and audit on the games main quest, side quests and all dialogue. using your best opinion rate the game on a scale of 1-100 for story, quests, level of fun and how interesting each location so far is and what can be done if anything to improve it". And at 9:11 am: "If it makes sense at any point in the game if there is anything that a specific character or class can do, say or see that others cannot add it into the game for that specific character or class. I also want each class to act and feel different from the others, if it makes sense and adds something interesting".

Nothing in the game was changed by this audit. It is findings, scores and a list of what to do. The fixes are a phase of their own (section 8).

## 1. How this was done, and what it cannot tell you

- **The size of the thing.** 102 maps. 17,502 lines of in-game text, about 298,000 words (67,000 of them the Library's 65 books). 251 logbook entries in the code (67 main story, 184 side). 216 placed people, 346 placed foes and 873 things to use at the start of a new game, before the people and road meetings the game adds when you arrive in a place. **Corrected the same day:** that first count missed those arrivals, and three statements below that leaned on it were wrong and are corrected where they stand (the Watch Downs, the Greenroot Road, the Chalk Cliffs). I counted again after arriving in each of the sixteen emptiest places. 220 automated test suites.
- **Read in full by me:** every logbook entry, main and side; the Rite's and the nine days' design; the six callings and the six likenesses; Vol VIII's lists of standing contradictions and open questions (about 120 items); the Rift's lore briefs; Book One's chapter map against what the game plays.
- **Checked by machine, every line:** months, weekdays, years, units, money, modern words, every name and phrase the volumes strike, every contradiction Vol VIII records (is it still in the text today?), key numbers against the Book One manuscript, and British against American spelling.
- **Read by eye in samples:** about 600 lines of dialogue and narration, drawn from 46 files across every region.
- **Not done: nobody has played it for feel.** I can run the game without a screen and read what it holds, and I have looked at several hundred pictures of it over this session. I cannot feel a sword swing or get bored on a road. `PLAYTEST.md` has a notes box under every milestone since October, and every one is empty. So the "fun" score below is the least certain number here, and the first thing on the to-do list is a real playtest.

## 2. The scores

My opinion, out of 100. The reasons follow in the sections named.

| | Score | In one line |
|---|---|---|
| **Story** | **88** | Book One, told faithfully and in its own voice. The loss is that you watch it more than you shape it (section 4). |
| **Main quest** | **82** | Nearly every chapter of the book is played, each scene with its own way of playing. Little you do changes anything (section 4). |
| **Side quests** | **84** | About fifty threads in the Reach and the Woods, most with a way through that is not a fight. Thin in the newer countries (section 5). |
| **Dialogue and text** | **90** | The strongest part. Clean against canon; the voice holds across a quarter of a million words (section 6). |
| **Fun** | **68, give or take 10** | Many good systems, never felt by a hand. Long empty roads, six callings that play nearly alike, and a hero who is a bystander pull it down (section 7). |
| **Places, taken together** | **78** | The Book One places are 80 to 93. The roads and some of the newer country are 57 to 70 (section 9). |

## 3. The game against the books

### 3.1 What is right

The main story's numbers match Book One wherever I checked them: seventy-four thousand six hundred and eleven; eleven thousand and forty; one thousand three hundred and forty-two; four hundred and thirty-two; twenty-one aboard; forty-one nights; nine days; four hundred and eighty sovereigns; a hundred and forty years old. Nothing the volumes strike is left anywhere in the text: no rendering yards, no Chord-row, no Ferris, no Hoyt, no Hollow Sermon, no 401 Silencing, no Zodiac Drift, no Calloway. No real month and no invented feast outside Vol VII, apart from the known "Leaffall" which is the manuscript's own. The canon passes of October and November did their work.

### 3.2 New findings (not in any earlier record)

1. **By default you are Kaelen Vance, and then you meet Kaelen Vance.** Character creation asks you to "Choose your likeness" from six faces, and the six are Kaelen, Lyra, Vane, Sable, Rooke and Mags, each with that person's own history written as "you" (`js/data.js`, `CREATION_FACES`). The name box starts as the likeness's name. A player who presses Continue is "Kaelen Vance", with Kaelen's face and Kaelen's seven years, and walks out of the gate to a hut where Kaelen Vance lives. The Rite's own design says "the traveller is a stranger". These cannot both be true. **This is the largest thing in the audit that does not make sense in the game.** Three ways to settle it are in section 8, item 1.
2. **The Dissonant Blade's story is Kaelen's.** "The morning the Light let go, you were on the Dawning floor with a hand on the bulkhead wheel. You held it while the glass came through." In the Prologue the engineer who holds the bulkhead is Kaelen. Two men did not hold that wheel. The Archivist's story has the same trouble with Sable: "walked into the mist with a Ledger", where the Series Bible calls Sable "the last Veil-sworn scribe".
3. **Dawning glass at Null-Watch at dawn.** A Blade's arm is Light-glass from the Dawning Spire. Book Three: "on the first dawn when Dawning glass stood on the wall above it, it had turned over and *reached*. Forty-seven people had gone into the quiet because they were in the way." (Part One, 1856.) Vol VI: Kaelen "cannot be on the Watch at dawn". In the game a Blade can stand on the wall at dawn in Harvestmonth and nothing happens, because the game never fires the Refusal at all; the troopers only speak of it. So the game is silent rather than wrong, but it is silent about the Watch's one daily rite, and if the Refusal is ever played a glassed traveller must be off the Watch before it.
4. **"Thursday."** Five lines use a weekday the world does not have (the Series Bible's Canon Ledger: "No weekdays"): the Hollow loop "the bread's for Thursday" (three places), Bryony Wick's letter "Tom and Wat are to sing on Thursday", and Halder Wick's house "no Thursday marked on anything". Vol VIII noted Halder's old letter in October; these five were never changed.
5. **Redoubt Zero is in Book One.** The Rift recheck said it was in Vol II and the Series Bible only. Book One names it twice in Vane's mouth: "He had drunk in the taverns of Redoubt Zero, where the dead don't rot" (ch. 4) and "Whisper-Grove to the garrison at Redoubt Zero" (ch. 13). So it has taverns, a garrison and deliveries by air. The record is corrected; Phase 114 starts from it.
6. **The sleeper under the Shelf.** Book Three's thing below the wall is unnamed, asleep, and "so large that the word did not apply". The Series Bible had called it the Null-Amalgam. Today's ruling (the Amalgam walks, as the volumes have it) and the manuscript both stand if they are two things, and Series Bible v1.6 is worded so. That reading waits on the owner's word (`Rulings of 23 Nov 2026.md`).
7. **Spelling: the split is in the books, not the game.** Book One's manuscript is American ("color" 19 times against 3, "harbor", "armor"). Books Two, Three and Four are British ("colour", "harbour", "kilometre"). The game is British throughout ("colour" 60 against 3, "harbour" 106 against none), with one word mixed ("traveler" 27, "traveller" 24). So the game agrees with three books out of four, and only where it quotes Book One word for word does an American spelling show. For the author: Book One is the odd one out.
8. **Checked and withdrawn: "kilometre".** Five lines in Sol-Luminary use it. It is Book Four's own word ("A kilometre of black link", Part Two), so it stays.

### 3.3 Old contradictions still in the text today

Vol VIII, Part V, lists about seventy. I checked each against today's text. **Fixed since they were written:** Vosk is "she"; the lease is 414; Teague is dead; the Carders' door is in the lane behind the tannery; the Grafters come every second Rootday; Kaelen's letter is from his father; no "first mate" Mags; no "Ignatius the smith". **Still live:**

| Where | The game says | The book says |
|---|---|---|
| `game.js`, a rumour | the mooring mast is "on the east side of the square" | "above the roofs to the north ... over the quarry" (the map itself has it east) |
| a rumour, `data.js` | Harrow has kept the gate shut "eleven years" | the Hedge and its gate are from 417 |
| Vane, on the road | "I carried twelve crates for two years" | twelve crates is one run; thirteen hundred-odd in two years |
| Kaelen, on the road | "Nobody came to the hut in four years" | seven years since the Fracture |
| a rumour | a glass arm "green-gold at the wrist ... The Governor's son has the same" | Kaelen's is pale cyan Light-glass |
| Part Three's card, a rumour | seventy-four thousand forgot themselves "in one night in 416" | over at least four days; the names written in eleven |
| the epilogue | Lyra "talks in chalk now" after the coda | she answers the herald aloud in ch. 24; her voice goes in Book Two |
| Ada Pellow | "Seventy years in one street" | the Pellow farm, "out past where the Hedge runs now" |
| Old Tam | "nine winters" on the bridge | a night-hummer "since the first autumn of the Hedge" |
| the Tarrows' house | they left "on the last cart before the gate was barred", three weeks gone | Oakhaven has been shut in since 417 |
| the tannery | the Fenning twins, lost down the culvert | the book has no such pair; Pim's is its only culvert lure |

**Still waiting on the owner (names):** two Umbers (the Reach's runaway scribe of 419, and the library's scribe of 410 and c. 290); two Linnets (the Tarrow child and the hush-gift child); Abner Fenning's name; the Requiem branch.

**Left in the code, not reachable in a new game:** the Wearer beaten at the Hedge and its trophy, the Borrowed Collar. No Wearer stands in Oakhaven any more (checked in the running game). It only matters to old saves.

## 4. The main quest

**What it is.** "The Rite", in four parts, is Book One. Nearly every one of the book's chapters has its scene in the game, most of them played and not only told, and the Prologue and Echo I are playable extras. Each big scene has its own way of being played, and they are different from one another: walking in the column and humming under the Pure Note; standing in the Inquisitor's eyeline at the needle; keeping the Factor's lenses on you during the Hold; the falling fifth with Lyra; sixty seconds at the pumps spent on names; the corridor through the Greening; the winch drum and the count to ten; the night in the hold; the plaza fight; Hymn 9 and the Aegis; the queue at the Malting; the cutter and ten heartbeats; the ring of lamps. That variety is the main quest's great strength. Few games stage this many scenes without repeating a trick.

**What I would mark down.**

1. **You are a bystander by design.** The code says so in as many words: "The traveller is a stranger: the needle, the coil and the speaking-tube are Kaelen's hands, and the Rite ends the way it ends", and "Missing any of it changes lines, never fails a quest, and never changes what happens in the book." That keeps the book safe, and it costs the player the feeling that it matters what they do. The scenes where your part is real are the best ones: the names at the pumps go into your ledger; the child behind the bar; Bettis put back or carried; the bottles kept or opened; who sings the coda. There should be one such thing in every big scene.
2. **Who you are is unsettled** (finding 1 above). A story this exact about its people cannot be vague about the one person the player is.
3. **The story never notices your calling.** A Flambeau Penitent stands in the gatehouse while their own Church comes up the road, and is told what anyone is told. A Quarry-Hand goes down their own shaft as a visitor. See section 7.
4. **It is unrelieved.** Almost every scene is grief or dread. The book earns that. A game played for thirty hours needs the lighter hours to be reachable too: the festivals, Hetty's eyebrows, the rumours (which are funny), the Eel-Run. They exist; the main road never leads through them.
5. **The gap between Book One and the wider world.** Book One ends in the Deep Woods with the Kestrel patched for "forty-mile hops". The continent (Sol-Luminary, the Rift) is "the world in Harvestmonth 419", open after the ending. The game does not yet say, in the world, why you are now free to wander a continent while a column is nine days out. One scene at the fire would do it.

I did not find a way to break the main quest, and the tests walk its stages. I have not played it end to end by hand.

## 5. The side quests

**Strengths.** About fifty threads in the Reach and the Spectral Woods, and they are the game at its best: the forty-one nights; Tamsin Reed and "Tell Mam"; the Sexton's Grave; a Table for Four; the dry lamps; the Missing Count; the Pressman's Round; the Hush-Gift (which can end with nobody dead, by hand-cant); the Coat on the Peg; the Tarrows' house; the Woolwight; Counted in Eights; Hew Callan; the Year 417. Most can be settled without a fight. Many cost somebody something. And when you leave a place with a thread undone, the logbook says so in a closing line ("I never told Sable about the man in Ashlane who does nothing at all"). That last is rare and very good.

**Weaknesses.**

1. **The newer countries have almost none.** Sol-Luminary is eleven maps and has one logbook thread I could find (the Tallyman). Null-Watch has one (the Stray in Magazine Four), with the Quartermaster's errands and the Unfinished now added. The Greenroot Road, the drove road and the Flume Road, seven very large maps, have four or five between them (I am counting logbook threads; the notice boards' tasks and the keepers are apart from that). The Reach has a quest in every lane; the continent has a keeper, a lamp and a view.
2. **None of them asks who you are.** No side quest is offered to one calling and not another, and only two (Tamsin, Tobiah) have a way through that belongs to a calling.
3. **Rewards are flat.** Coin, experience, a keepsake. The keepsakes are well written. Few change what you can do.
4. **Finding them.** Many start from a thing you must happen to use or an hour you must happen to be there (the dead hour behind the cooperage). That is right for this world, and it means a first player will miss most of them. The rumours and the notice boards point at some. They could point at more.

## 6. The dialogue and the text

The voice is the book's: short, concrete, withheld. From the sample: "A town that keeps its empty houses mended is a town that means to stay." "They don't talk. Mam said that's holy." "Tomas stood a round for the mare. Not for the stranger. For the mare." "It has stopped a great many wheels, and never the one that mattered." It holds from the Boar to the Rift, which over this many words is the hardest thing to do, and it is done.

What the machine found is in section 3: five Thursdays, one word spelt two ways, and "gold" where the coin is the sovereign in two lines about the Kestrel's repairs. No modern slang. No real-world oaths. The eight weekdays are used correctly throughout.

What I would mark down: **everyone is eloquent.** A quarry hand, a child, a clerk and a general all speak in the same fine short sentences. The books vary this more than the game does (Two-Eleven's dog; the Quartermaster's two words). Some people should be allowed to be dull, or wrong, or to talk too much. And **the text is long for a game played with a sword in hand**: 94 entries run past six hundred characters. The reading-aloud option helps. A "short" setting that gives the first sentence and lets you ask for the rest would help more.

## 7. Fun, and the six callings

**What is there.** Swings by the mouse's direction, parries and blocks; Songs with a cost in voice and in noise; the Narrow, with the hounds on one side and the Hush on the other, which is the best single idea in the game because it makes the book's world into a rule you feel every minute; stealth, disguise, the law and the gaol; the lamps, the Piece and the keepers; mounts, fast travel and flying; weather that matters.

**What holds it back.**

1. **Nobody has felt it.** See section 1.
2. **Size without density.** Each of the three Greenroot Road maps is 235 by 134 cells and, once you are on it, holds five or six wayfarers and five or six things to use. The Rift's wall is 372 by 133 with twenty-four people and ten things to use. The Deep Woods, at 56 by 56, holds sixteen people, forty foes and fifteen things to use. For its size an old map is about twenty-five times as full as a new road. A road should be emptier than a town, and these are emptier than that. (Corrected: this first said the roads held nobody. They do; the count had been taken before arriving.)
3. **The callings play alike.** The code checks which calling you are in very few places. The Blade has the glass arm, noticed about twenty times. The Cantor has four Songs and three small touches. The Archivist has two or three. The Corsair has an eight-in-a-hundred better dodge and nothing else. The Penitent and the Quarry-Hand have different numbers and different starting gear and are otherwise the same person.
4. **The bystander's main quest** (section 4).
5. **Breadth.** There are a great many systems and keys. Each was added with a switch and a test, which is why the game still works. A new player meets all of them in the first hour.

### What each calling could know, say, see and do

The owner's instruction of 9:11 am. These are candidates; each is to be checked against the books scene by scene before it is written, in the usual way, and built as a phase. Marked [PROPOSED].

| Calling | Knows and says (from what the books give that trade) | Sees | Can do that others cannot | Should feel like |
|---|---|---|---|---|
| **Dissonant Blade** | Bores, calibration, the Consortium's paper; is called "consecrated" and warded against | Glass: cores in a crate, a Legionnaire's bell, the Factor's lenses on them | Lay the glass hand on a thing and Listen to what it has heard; be heard in turn by anyone who hears glass | A tuning fork with a clock on it: strong, feared, and paying for every use |
| **Cantor** | The old offices and their fourth lines; every child's first note; the Conservatory | Pitch: who is humming, what a reed is tuned to, a voice that is a little too exact | Hum under the Narrow without raising noise; tend others; sing a thing down instead of striking it | The one who changes a room by being quiet in it |
| **Corsair** | Ships, rope, cargo, the Free Captains' Articles, the Rust Coast | Loads and rigging: a hold that is heavy, a line about to part, a manifest with a column missing | Climb and haul where others cannot; read a ship; draw first | Fast, counting, never cornered |
| **Archivist of the Veil** | Forms, dockets, intake numbers, the Office's own language | Names: on a bell, a tape, a docket, a Hollow's loop | Read a thing its name; enter it; be believed by a clerk | The one who fights before the fight, on paper |
| **Flambeau Penitent** | The Rubric, the Pure Note, the Flambeaux and how a Rite is ordered | The Church from inside: who outranks whom, what a stave turned toward you means | Walk among the Church unchallenged for a while; hold a note that steadies others; use glass-fire | Armoured, slow, half-believing, and recognised by the wrong people |
| **Quarry-Hand** | The shifts, the foremen, the pumps, the men at them by name | Ground and timber about to give; which ladder is sound | Carry, break and climb what others cannot; be taken for one of the shift | Strength and a short list of friends, at home underground |

Where it would land first, because the game already has the scene: the Church at the gate (Penitent); the quarry, Tobiah and the pumps (Quarry-Hand); cargo night, Grab the Line and the cutter (Corsair); the Malting, the Bell Yard and every bell (Archivist); the Grafters' round, the Conservatory and the coda (Cantor); Vosk's lenses, the proctors' presses and the lip of the Rift (Blade).

## 8. What to do, in order

**Ruled by the owner the same morning (9:35 am):** "I like your suggestions. When its time proceed and I will accept all proposals now and future proposals so long as it makes sense." Item 1 is settled as (a), with "in their boots": at the book's great moments the player steps into the hero whose moment it is and steps back out (`Rulings of 23 Nov 2026.md`).

1. **Settle who the player is** (owner's ruling). (a) The likenesses become six faces with no canon name, and each calling gets its own person and history, a stranger to Oakhaven; recommended, because it is what the Rite's design already assumes and it is the root the callings can grow from. (b) You may truly play Kaelen, Lyra, Vane or Sable, and that person is then not met in the world; a very large change. (c) Keep the faces, blank the name, drop the histories; the cheapest, and the weakest.
2. **The callings** (section 7): a phase, with a lore brief for each calling, then lines, sights and one signature act each, scene by scene.
3. **Match the text to the books:** the eleven live lines in 3.3, the five Thursdays, the Blade's and the Archivist's stories, "traveller" spelt one way. A small phase. Each needs its French and, where a line is voiced, its voice.
4. **One real choice in every big scene of the main quest,** of the kind the pumps already have: something saved, carried, named or left, that the book does not forbid and the epilogue remembers.
5. **Fill or shorten the roads.** Either people and small stories every few hundred paces (a carter, a shrine, a grave, a stone of the Fold), or roads a third the length. The Fold's stones, now being built, begin this.
6. **Side quests for the newer countries:** three to five for each great place in Sol-Luminary and at the Rift, written from the books as the Reach's were.
7. **A playtest.** Two hours, one calling, with the notes boxes in `PLAYTEST.md` filled. Until then I can build a run that plays the first two hours without a person and reports how long each stretch took, how often it died and how far it walked between things to do. It would not tell us what is fun. It would tell us where nothing happens.
8. **The dawn Refusal,** heard and felt from inside Null-Watch, with a rule that keeps glass off the Watch at that hour. For Phase 114.
9. **Names to rule:** Umber, Linnet, Abner Fenning; the Requiem branch.
10. **A lighter road through the Reach:** point the main story once at the Eel-Run or the Last Sheaf.

## 9. Each place

Scored for how interesting it is to be in: what there is to meet, do, read and decide, and how much it is its own. From the contents of each map, its record, its text and its pictures. Not from play.

### The Reach (Book One, Parts One and Two)

| Place | Score | Why, and what would raise it |
|---|---|---|
| Oakhaven | 90 | A town that keeps its hours, with law, festivals and a story in most doors. Raise: callings recognised at the doors. |
| The Boar & Dulcimer | 88 | Hearthday, played. |
| The Hollow and the Carders' house | 84 | The Grafters' round; Rooke's book. |
| The Chapel, vestry and held letters | 82 | A heist with a reason. |
| The Greenhall and the Governor's house | 80 | Aldric's arc; the coat on the peg. |
| The Conservatory (reading room, reed-hall, orchard) | 80 | Quiet and exact. Little to do after the first visit. |
| Outside the Hedge (Kaelen's hut, the clamps, the hound's bed) | 80 | |
| The Quarry, Depot Three and the Root-vault | 80 | The Rite is the best scene in the game; the quarry map itself is bare between scenes. Raise: the shifts, for a Quarry-Hand. |
| The standing-stones | 78 | Counted in Eights. Will rise with the Fold. |
| The water-meadow | 75 | One scene, a good one. |
| The Under-hedge | 70 | A crawl with one find. |
| The Watch Downs | 66 | Forty-one things to look at, Abel Sedge the turf-cutter, four things to use, and no danger, as the author ruled it: the quiet way in. Raise: a small errand for Abel; the Fold's stone is now there. (Corrected from 55: the first count missed Abel and the uses.) |
| Wethercombe, the Bellwether, the Hanger, Ewe Barrow | 82 | The Woolwight is a proper mystery with a place for each clue. |
| Greenroot, its chapel and undercroft | 76 | Well dressed and empty of people, as the story has it. |
| The Flume Road, Stillwater Landing, the Low Rings | 78 | The lock, the loft, the smugglers' book room. |
| The Drift-Kestrel (deck, below, the hold at night) | 85 | A home that moves. |

### The Spectral Woods (Parts Three and Four)

| Place | Score | Why |
|---|---|---|
| Whisper-Grove, the Sunken Court | 93 | The game's best place: the Hollows on their loops, the pools, the lamps, the table, the fight. |
| The Malting and its queue | 90 | The benches Sable designed. Three ways in. |
| The Cloister of the Lost Choir | 90 | The cloaks, the tapes, Hymn 9, the voice at the door. |
| The Deep Woods and the camp | 88 | The fullest map in the game. |
| The Bell Yard and Ashlane | 86 | The roll of doors; the woman with the jugs. |
| The Mausoleum of Chords and the bell-tower | 84 | |
| The Whisper Catacombs and the Lower Plazas | 82 | |
| Port Cantabile and Driftwood Cay (the extra) | 84 | Thirty people and a harbour's own law. |

### The roads and the old country beyond (Phases 79 to 85)

| Place | Score | Why, and what would raise it |
|---|---|---|
| The Greenroot Road (three maps) | 64 | Handsome and very long, with five or six wayfarers on each stretch (a packman, a road-mender, a man carrying a child's coat) and as many things to use. Raise: item 5. (Corrected from 58: the first count missed the wayfarers.) |
| Singers' Howe | 74 | A barrow with a keeper. |
| The Flume Road: the Stride, the Pound Stair | 62 | The stuck gates are a good small puzzle in a great deal of walking. |
| The drove road: the Grey Wethers | 70 | The drovers' call on the stones. Will rise with the Fold's pegs. |
| The drove road: the Hundred Hollows | 58 | One thing to use on a map of 110 by 170. |
| The Sunk Lanes and Cross Pool | 68 | The punt and the child's reed. |
| The Deep Grove | 66 | The path that is not the same way twice. No one in it. |
| The Dry Flume and the Antler Galleries | 76 | The white forest of antler picks is the best idea among the newer places. |

### The Dawning Heights (Phases 92 to 97)

| Place | Score | Why, and what would raise it |
|---|---|---|
| Sol-Luminary: the White Mile | 84 | The procession that leans; the Tallyman. |
| Sol-Luminary: the Pilgrim Chain | 80 | A kilometre of chain is a place nobody else has. |
| Sol-Luminary: the Umbral Tiers | 78 | Grand. Eleven people in 160 by 226. Raise: quests. |
| Sun-Peak Vigil and the Abbess's cell | 78 | |
| Sol-Luminary: the Basilica school | 74 | |
| Sol-Luminary: the Seventh Anchor-House | 72 | |
| Sol-Luminary: the black square | 72 | |
| Sol-Luminary: the Anchorage | 68 | One person. |
| The Chalk Cliffs | 57 | A long climb with seven things to look at, four to use, eight foes and nobody on it. |

### The Continental Rift (Phases 100 and 113)

| Place | Score | Why, and what would raise it |
|---|---|---|
| Null-Watch: the Talking Halls | 86 | A barracks where the talk never stops is the book made into a room. |
| Null-Watch: the Wall | 72 | Four miles is the book's number and it is a long way to walk for seven things to use. Rising with the store, the night on the wall and the tip. Raise: the dawn Refusal. |
| The old garrison's store (Phase 113) | 80 | Small, and the Quartermaster is worth the walk. |
| The tip and the Unfinished (Phase 113, in review) | 82, provisional | Three half-sentences to finish. To be judged when it is merged. |

## 10. The decisions, rechecked

| Decision | Whose | Does it still make sense in the game? |
|---|---|---|
| The game follows Book One; the manuscript beats the bible | Owner, Oct | Yes. It is why section 3.1 is true. |
| The world beyond Book One is Harvestmonth 419, "seen and not settled" | Owner, 14 Nov | Yes, and it has held at the Rift under hard testing. It needs the one scene that says why you may wander (section 4, item 5). |
| The traveller is a stranger beside the heroes | Claude, the Rite, approved | Yes as a rule; it collides with the likenesses (finding 1). |
| The likenesses are the six canon people | Phase 23 | **No.** See finding 1. |
| Lamps, the Piece and keepers | Owner, 14 Nov | Yes. |
| "The Chord" for the river of stars | Owner, Phase 21 | Yes. The Series Bible also uses it for the heroes' movement; the Fold leans on the double meaning and does not fight it. |
| Gravewells stay at the Rift; a part of the Rift may have a keeper | Owner, 22 Nov | Yes. Both are kept true by "The dead do not rot here, until suddenly everything does." |
| Rift Wall: Design A, then C; the Shelf unseen and unnamed | Owner, 22 Nov | Yes. |
| The glassed traveller's arm goes silent at the lip (the tip) | Claude, approved 22 Nov | It stands, with a caution: the book's people learn this in Ashfall. The traveller tells nobody and the line says nothing of who cannot hear. |
| The night sky; no stars over the Rift; the Fold | Owner, 22 Nov | Yes. |
| The Null-Amalgam walks, as the volumes have it | Owner, 23 Nov | Yes, read as two things (finding 6), which waits on his word. |
| Umber, Linnet, Abner Fenning, the Requiem branch | Offered, never ruled | Open. |
