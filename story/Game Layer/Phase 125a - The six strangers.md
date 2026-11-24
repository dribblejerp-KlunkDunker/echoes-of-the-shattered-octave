# Phase 125a: the six strangers

24 Nov 2026. Built from `Phase 125 - Who the traveller is, and in their boots (design, for ruling).md` §1.4 and §2, ruled 24 Nov 3:20 pm ("if kept with lore I approve"). Branch `p125a-strangers`. Line numbers are the files' own and were re-checked for this record: **B1** = Book One full manuscript, **SB** = Series Bible (canon), **B2a** = Book Two Part One Ch1-3.

## 1. Survey (before anything was changed)

| Where | What it showed | Done |
|---|---|---|
| `js/data.js` `CLASSES` (ll. 10-64) | name, desc, bio, summary, skills of the six callings | blade and archivist renamed; every desc and bio rewritten; summaries and skills kept (no book person in them) |
| `js/data.js` `CREATION_FACES` (ll. 97-133) | six likenesses = Kaelen, Lyra, Vane, Sable, Rooke, Mags, with their histories as "you" | all six replaced by strangers |
| `js/game.js` `renderCreate` | name box starts as the first likeness's name; calling list (`c.name`, `c.bio`); likeness panel (`sketch`, `facts`, `says`, `history`, `detail`); final card `name, c.name` | no change needed: it reads the data |
| `js/game.js` `renderCharacter`, `slotSummary`, `restoreGame` | `p.cls.name`; save stores `cls` as the id, load re-links to `CLASSES` | no change: old saves pick up the new names and never showed the likeness history after creation |
| `js/origins.js` `REASONS` | the suggestion text for each calling | all six rewritten (see 3) |
| `js/companion-talk.js` l. 54, 56; `js/party.js` l. 11; NPC names in `data.js` 368, 705, 724, 999, 1012 | "Kaelen Vance, the Dissonant Blade", "Sable, Archivist of the Veil", Kaelen's companion ability "Dissonant Blade" | **kept**: these are the heroes' own titles |
| `js/gearlook21.js` l. 25, `js/card21.js` l. 309 | comments only ("the Dissonant Blade's left arm") | left; not shown to a player |
| `tools/voices/*`, `js/voice-lines.js` | the old `says` lines exist only as the heroes' own voiced greetings (kaelen.greet.blunt, sable.greet.normal, vane.greet.polite, rooke.greet.polite, mags_dw) | no likeness or calling line is voiced: **0 voices re-made** |

## 2. The callings: was and now

| Calling | Was | Now | Safe because |
|---|---|---|---|
| blade name | Dissonant Blade | **Glass-Hand** [PROPOSED, ruled] | "Kaelen Vance — The Dissonant Blade" is his title (SB 302) |
| blade desc | "A former bore-engineer whose left arm set to Aether-Glass in the Fracture ... Hounds will not touch you." | "A bore-hand of the Consortium, from a works far from the Reach, whose left hand took raw seam glass in a bad hour underground. The glass drinks what it breaks, and the tideline climbs for it. You keep the hand wrapped. It does not help as much as you would like." | raw glass crystallizes flesh with no need of the Dawning (SB 160); "drinks what it breaks ... tideline climbs" is the physics rule (SB 87); "men like you", plural (B1 2341) |
| blade bio | Dawning floor, bulkhead wheel, medal, "consecrated", hounds "treat you as one of their own", charcoal outside the Hedge | a seam broke wrong on a night shift; ringing by morning, past the wrist by month's end; paid off in scrip; came because Oakhaven "had lost two shifts" | "the two lost shifts" (B1 1159); Ringing is the first stage (SB 160); scrip (B1 1430). Drops what B1 484 contradicts ("they would not go near the hut") and the medal (no book line) |
| cantor desc | "births, fevers and burials" (Lyra's line, SB 314) | "A cantor of a parish down the Greenroot road, taught by an old orchard-cantor before the reeds went. You sing the dead down, the fevers out and the lost home, always inside the Narrow ..." | dead (B1 512), fever (B1 3544), lost lambs home (B1 2135); orchard-cantors plural (B1 3544); reeds gone (B1 502) |
| cantor bio | "the old fourth line" (no book) | the tending note, the falling fifth, the jar against the throat; the teacher buried; the parish emptied "one house at a time"; the living "went north to the work" | the jar is "a Cantor's trick from the orchard days" (B1 250); the Greenroot road runs south from Oakhaven (B1 3792, 4888) |
| corsair desc | "You laugh loudest when you are most afraid" (Vane, SB 322) | "A hand off a Free Captains' crew, put down inland and not sent for." | glass shot "a sovereign a pellet" (SB 87); Consortium freighters fly green and black (B1 674) |
| corsair bio | "the seconds between a rope parting and a man noticing" (near Vane's rope) | lent to a Consortium freighter for one inland run and left at a mast in the Reach; counts "the miles to salt water" | the brief §4.5; not Vane's reason for inland ("Nobody had ever been drowned inland", B1 1357) |
| archivist name | Archivist of the Veil | **Catalogue Clerk** [PROPOSED, ruled] | Sable's title (SB 330); "the last Veil-sworn scribe" (SB 42) |
| archivist desc | "walked into the mist with a Ledger ... Every name you keep costs you a little of yourself" (Sable, SB 334) | "A conscripted clerk of the Office of the Catalogue who walked away from a harvest-house ... You know the forms, because you filled them in." | nine clerks at the Malting alone (B1 4904); two clerks "never came back to work" (B1 4942) |
| archivist bio | "a second Ledger ... costs you a piece of the name" | the woman of sixty-one kept; left pen and coat, walked out of the harvest-house gate; "a copy-book of your own now, an ordinary one" | as above; no Bound Ledger (B1 4125 is Sable's) |
| penitent desc | "carried a censer ... until the day the light turned. You still half-believe you were right. Your faith is fire, and both are guttering." (Crane, SB 340; the censer is the Inquisitor's, B1 2273) | "You carried for the Flambeaux, at a chapter far from the Reach, and held no rank ... You still know every word of the Pure Note, and you say none of them." | more than one chapter (B2a 248, Port Cantabile); Rites held wherever prepared (SB 246) |
| penitent bio | a Rite "the Church still denies" (the Dawning) | "a Rite in a far parish went wrong, and the chapter wrote it down as right"; the shoe and the jar kept; "came west by the back roads" | the brief §6.5: the shoe is the game's and safe only off the Dawning |
| quarry desc/bio | "Night shift at the Oakhaven works ... pump-house floor ... Grafters bring up in sacks"; "three shifts", "foremen", "the ladder" | a stonecutter of a quarry down the Flume; came because the works "had lost two shifts and three bore-heads" and paid scrip "to anyone who would ride the cage"; "Nobody said what had happened to the two shifts." | B1 1159; the cage (B1 1767); Hollows at the pumps (B1 1777) so no pump work; works two years old, quarry two hundred (B1 1711) so a stranger |

Summaries and skills kept word for word (the summary's "tideline" is the game's mechanic word from SB 87).

## 3. `js/origins.js`

Only `REASONS` changed (the eleven questions were read and lean on no hero). blade: "Dissonant Blade is an engineer's mind" → "The Glass-Hand has a bore-hand's patience". cantor: "births, fevers and burials" → "sings the dead down and the fevers out, as the orchard-cantors taught". corsair: "laughs loudest when most afraid" cut. archivist: name, and "Each name kept costs a little of you" (Sable) → "was taught to write it all down, and walked away from the desk still doing it". penitent: "still half-believe", "carried a censer ... until the light turned" (Crane) → "has not finished deciding what they believe ... carried for the fire until one Rite too many". quarry: "heard the Root breathe through the pump-house floor" → "knows the sound stone makes before it goes".

## 4. The six strangers [PROPOSED, every name and fact]

Fact labels: Years, Born, **Left behind** (new; replaces "Trade", since a face is not a calling), Mark, Ties, Wants. None is of Oakhaven, knows anyone there, or has met a hero.

| Face | Name | From | What the history leans on |
|---|---|---|---|
| 1 hooded man | **Ruan Hendy**, 31 | a village under the Titan's Spine, Iron Peaks | "Peak-folk bury their dead standing, so the mountain can carry them"; "weight wander[s]" (SB 213) |
| 2 woman, red braids | **Kerra Ellery**, 23 | a farm above Wend's Ford | Wend's Ford is four days down the Greenroot road (B1 4888); every reed in the Reach turned in an hour (B1 502) |
| 3 old man in a cap | **Esk Penhale**, 63 | a stepped street on Driftwood Cay | Driftwood Cay (SB 221; B1 2774); "tides that sing"; water "becomes blue jelly" (SB 221) |
| 4 hooded dark-haired woman | **Merryn Callis**, 26 | a rank of narrow houses in the Organum | "Its towers are pipes, its streets are ranks, and when the Synod speaks, the city plays" (SB 233) |
| 5 scarred bald man | **Piran Brackett**, 44 | Slag-Town, under Cinderhold, Blighted Caldera | "the Cold Burn freezes fires and makes frost scald, and the ember-blind walk the streets with their inner heat gone out" (SB 209) |
| 6 silver-haired woman | **Jenet Lowen**, 26 or more | Mirage Rest, Shifting Dunes | "The Stutter ages people unevenly"; the Erg of Singing Silica (SB 217) |

Invented, each [PROPOSED]: all six names; every age; Ruan's father, brother, the stone, the twelve years; Kerra's mother, the debt, the pruning knife, the collar; Esk's wife, daughter, the other man's cap, the unsent letter; Merryn's mother's lodging-house, the room paid a year ahead, "somebody there" unnamed; Piran's brother gone ember-blind, the mittens, the iron collar; Jenet's bucket, the pale seam, the wrapped singing stone; all six first lines.

**Names checked** (whole word, any case) against every `.md` under `story/Books` and `story/World Bibles`, every `js/*.js`, and the SB cast list (ll. 298-384). Rejected on the way for being too near a book or game name: Hobb (Hob Wendle), Liss (Lissa Merrow), Brida (Bridie Cole), Callow (Oren Calloway). The test repeats the check.

## 5. French, voices, old saves

`tools/i18n/p125-strangers.tsv`: 87 pairs (80 new French entries plus the six names kept as they are), merged; glossary terms used (Confins, Étroit, route de Greenroot, Côte de Rouille, Caye du Bois-Flotté, Gué de Wend, Pics de Fer, Épine du Titan, grenaille de verre). New French names: Main-de-Verre, Commis du Catalogue, Ville-des-Scories, Repos-du-Mirage, le Bégaiement, braise-éteinte [PROPOSED]. Voices: none needed. Old saves: the p123 fixture save, renamed "Kaelen Vance", loads with its name, calling id, numbers and face; its sheet and slot read Glass-Hand; no borrowed history is shown anywhere after creation (it never was).

## 6. What I was not sure of

- "Ringing" in SB 160 is "a tone only you can hear", but the game's starting glass is 42, which its sheet calls "Set". The text names no stage; the Glass-Hand's hand "was ringing" and has "climbed past the wrist".
- `js/game.js` l. 1661 tells any glassed player "four and a half fingers from the shoulder", which is Kaelen's end-of-book measure (B1 6176). It is not calling or likeness text, so it was left; worth a look in 125b.
- "tideline" is Kaelen's own word for his (B1 592), but SB 87 makes it the physics rule and the game uses it everywhere, so it stays.
- The Corsair's "counting" is near Vane's count at the rope; it was kept as cargo counting.
- The "Left behind" label wraps onto two lines in the likeness panel (picture).

## 7. Changed in the Commander's review (24 Nov)

- The Catalogue Clerk's first name copied was "entered as a unit". "Unit" is in no book. The Office's own word in Book One is *subject* ("a minute per subject across four thousand subjects", manuscript l. 4866), so the line now reads "entered as a subject" (French: "inscrite comme un sujet").
- Checked against the files by the Commander and found as cited: Series Bible ll. 160, 209, 213, 217, 221; manuscript ll. 250, 4888. The six names (and "Esk") are used nowhere else in the books, the bibles or the game.
