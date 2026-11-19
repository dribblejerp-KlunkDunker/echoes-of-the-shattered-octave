# Phase 101 — Sheep and mutton across the newer places (for review)

*Written 19 Nov 2026. Code: `js/mutton101.js`. Test: `test/mutton101.test.js` (21 checks, and two real purchases through the trade window). No new line of text, no new picture and no new French: the two dishes it places, their names, pictures and translations are Phase 22's.*

**Asked by the owner:** "if there should be sheep lets add them to the game. At any store that sells goods or at an inn make sure that Mutton is added to the menu or list of things to buy in a few different varieties."

## In short

- **Most of this was done in Phase 22 (October)**, on the same request: the sheep of Wethercombe and six mutton dishes. Since then about eighty phases have added towns, cities and sellers, and none of the new sellers had mutton.
- **Mutton:** three of the newer sellers now stock it, the three whose own trade and own words take it (Stillwater's smuggler, the Free Captains' woman at Sol-Luminary's Keel Docks, and Null-Watch's issue-hatch). Everywhere else the reason is given below.
- **Sheep:** no more were added. The built world has sheep everywhere the books allow them. The books put the next flocks in places that are not built yet; they are listed at the end for when those places are made.

## What Phase 22 already put in the game

- **The flock.** Tamar Farrant, seventh of the Farrants who had the sheep-walk, has brought eleven Rust Coast ewes and a tup up to Wethercombe. Captain Vane carried them in the Drift-Kestrel's hold from Cantabile, "and charged me for the smell". Ewes, lambs, the tup with his bell, strays to bring home; once all are home, they graze the Watch Downs too, and the Downs' finger-post changes from "There are no sheep" to "There are Farrant ewes on it again, and the turf is short because of them."
- **The Woolwight,** the night hunter dressed in fleeces, on Wethercombe, the Downs and the Hanger (Phase 22b).
- **Six dishes:** Salt Mutton, Mutton Broth, Mutton Chops, Mutton Pie, Mutton and Barley Hotpot, and the Roast Leg of Mutton.
- **The menus,** as the R2 canon sweep left them (ROADMAP §R2: "Oakhaven sells only dear salt mutton off Vane's boat; Wethercombe and the Coast keep the rest"):

| Seller | Where | Mutton |
|---|---|---|
| Gideon Thrale, the Bellwether | Wethercombe | all six |
| Tamar Farrant | Wethercombe | salt mutton, chops |
| Captain Vane (the Kestrel's stores) | the Boar & Dulcimer; Whisper-Grove | salt mutton, broth |
| Fenwick Sloe, chandler | Port Cantabile | salt mutton, broth |
| Hetty Bram, the Boar & Dulcimer | Oakhaven | salt mutton only (R2) |
| The market provisioner | Oakhaven's market | salt mutton only (R2) |

## Mutton: what this phase adds

| Seller | Where | Adds | Why it fits [PROPOSED] |
|---|---|---|---|
| **Corvin Ash, smuggler** (Phase 29) | the quay, Stillwater Landing | Salt Mutton, at his own markup (×1.4) | His own lines: "Timber goes down to Fortis … and some of what is in the barrels is neither." Fortis is the salt-mutton town: Vol I §III.4 gives Bastion Fortis "Root stew, salt mutton, black bread". |
| **Brenna Corliss, the Free Captains' woman** (Phase 92; Book Two names her) | the Keel Docks, Sol-Luminary | Salt Mutton (6), Mutton Broth (7) | Her own line: "Rope, cloth, tar, and what the Free Captains leave with me." The pair is ship's stores, as Vane's are. Dear because Sol-Luminary grows nothing and the Tiers are "seven years thin" (Book Two); the Reach's prices are 3 and 4. |
| **One-Oh-Six, at the issue-hatch** (Phase 100) | the Talking Halls, Null-Watch | Salt Mutton, Mutton Broth | Its own line: "Coat, mitts, spike, and what the sutler left." A sutler is the trader who victuals soldiers. The Watch eats soup at supper (*Keep Talking: Letters from the Wall*), and a Peaks man on the wall "knows more about sheep than any man ought". |

Each is added after what the seller already sold, once. Two varieties at most of these places, not six: salt mutton and broth are what travels by barrel, ship and supply line. Fresh chops, pies and roasts belong where the sheep are.

## Mutton: every other seller in the game, and why not

| Seller | Where | Why no mutton |
|---|---|---|
| Brenna Loft, baker; Agnes Tull, the baker's wife | Oakhaven | R2: no mutton pies in a starving town (`test/sheepwalk22.test.js` holds it). |
| Ambrose Vettle, chandler | Oakhaven | R2 would allow dear salt mutton, but his own line is "If it keeps a light lit or a street humming, I have it." **Question 2.** |
| Factor Adela Vosk, Consortium of Bores | the Greenhall, Oakhaven | arms and armour |
| Bettany | Oakhaven | the midwife and her tonics |
| Old Tam, the night-hummer | Oakhaven | Hush-cloth |
| Abner Fenning, tanner | Oakhaven | leather |
| Orrin Pale, sexton | Oakhaven | the chapel's things |
| Bastien Corvo, pedlar of books; Odile Quayle, book-runner | the moor; the Bonded Store | books |
| Madge Tallow, fence | Stillwater Landing | stolen goods |
| Ysolde Marrow, salvager | the Low Rings | "Out of the upstairs rooms, mostly": salvage from the flooded houses |
| Ennis Crowle, beekeeper | the Flume road | honey |
| The market herb-seller, tinker and oddments-seller; the Flume fisher-wife | Oakhaven's market; the Flume | each sells one trade |
| Anselm Dray, cobbler | the fourth tier, Sol-Luminary | boots |
| The woman under the black canvas | the Umbral Tiers | a scavenger of the line |
| Winchmaster Bardo | the Anchorage | chain-crew harness |
| Perpetua Lisle | the Seventh Anchor-House | the pilgrims' robing-room |

There are two inns in the built world, the Boar & Dulcimer and the Bellwether; both are in the Phase 22 table above.

## Sheep: where the books want them

The Reach was sheep country. Book One's Cantors had "the old song … to bring lost lambs home off the hills at dusk" for three hundred years (ch. 6, The Listening Hour), and the Conservatory taught anatomy "in a room with a sheep's larynx on a tray" (ch. 10, The Siphon Casing). Then the flocks went: in 417 the Hedge was packed with "raw wool from every sheep in the Reach" (Book Four, Part One), and the Downs flocks were eaten in the two shut years (the Phase 20–21 rulings, delegated). Since then the game makes the empty hills a running line, never an oversight:

- Mother Hurst, Wethercombe: "There are no sheep. There were, and now there are none, and the turf keeps the shape of them." (Phase 29)
- A drover on the Greenroot road: "Sheep, when there were sheep to drive. Now I walk the road because my feet know it." (Phase 79)
- The drove road's Grey Wethers are a hundred grey sarsens lying where a flock would (Phase 83).

Tamar's flock is the first to come back, and the game is built round that. A second flock in the Reach would cut across all of it, so none was added.

Outside the Reach, the books place sheep in three regions, none of them built yet:

1. **The Iron Peaks, above Coldharrow.** Book Three, Part Three: "My father kept sheep in the Peaks above Coldharrow." Null-Watch's Two-Thirty is a Peaks man. *Recommend: flocks on the high fields when the Iron Peaks are built.*
2. **The Rust Coast's farms,** where Tamar's ewes came from. *Recommend: a fold and a dark-faced flock when the Coast's country is built (Port Cantabile itself is a harbour town).*
3. **Fortis,** whose food is salt mutton (Vol I §III.4). *Recommend: the salt-mutton trade, fresh dishes at its inns, and a flock in its country when Fortis is built.*

The Dawning Heights grow nothing: Phase 92 was matched to Book Two with "no winch-boats or valley farms". Null-Watch is obsidian, lead and cable.

## Questions for the owner

1. **Fresh mutton at the Boar & Dulcimer once Tamar's flock is home?** R2 keeps Oakhaven to dear salt mutton, and its test holds it. A flock of eleven ewes and a tup will not feed Oakhaven's inn as well. *Recommend: no; Oakhaven stays as R2 left it.*
2. **Ambrose Vettle's chandlery:** dear salt mutton, as R2 allows? *Recommend: no; he sells what keeps a light lit.*
3. **"Any store that sells goods":** taken here to mean inns and sellers of food or provisions, not the specialists (the armourer, the cobbler, the tanner and so on). *Recommend: keep it so.* If every shop should carry mutton, it is one line per seller in `js/mutton101.js`.
4. **The Heights' prices,** 6 for salt mutton and 7 for broth, against 3 and 4 in the Reach. *Recommend: keep.*

## Verification

- `test/mutton101.test.js`: 21 checks, and two purchases through the real trade window. Each new list holds its rows once, after the seller's own goods; installing again adds nothing; the R2 holds stand (Hetty and the market salt only, the bakers and Ambrose none); Phase 22's lists are untouched; broth bought from One-Oh-Six at the listed price and eaten (voice and health back); salt mutton bought from Brenna Corliss for 6.
- The suites that touch these sellers: `sheepwalk22`, `r2canon27`, `r4thin29`, `heights92`, `rift100`, `festivals12`, `folk20`.
