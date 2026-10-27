# The Library of the Reach: notes for the owner

October 2026. The game has 65 in-world books (about 63,400 words), all English drafts.
- **Sources:** `tools/library/books/*.json`. Each book's `notes` lists its canon sources and every [PROPOSED] invention.
- **Placement:** `tools/library/placement.json` says where each book lives.
- **Build:** `node tools/library/build.js` builds `js/library26-books.js`. The game code is in `js/library26.js` (books) and `js/libraries26.js` (the four libraries).

## How the books were made and checked
1. **Writing.** Seven writers worked from one brief (canon first, no spoilers stated as fact, the Hush never described, names checked against `js/` and `story/`). They covered history, lives and letters, tales and verse, craft and the natural world, faith, law and the press, the wider world, and Whisper-Grove and the Veil.
2. **Cross-check.** One reviewer read all 65 against each other and against canon, and made about 40 small fixes:
   - name collisions between books;
   - dates of the bells, the lease and the Hedge;
   - the morning the orchards went;
   - mild Reach winters;
   - the tongue-stone custom dating from 417;
   - drift-glass, not lodestone, lifting skyships.

   Nothing was rewritten for taste.
3. **Placement.**
   - **Shelves:** the Conservatory (Oakhaven), the Bonded Store (Stillwater), the Moot-house (Whisper-Grove) and the Veil's scriptorium (the Mausoleum).
   - **Elsewhere:** piles where readers live, three vendors, books lying in the world, the keepers' quest books, and one gift.

## Questions that need your ruling
Book One's manuscript and the other sources disagree on these. The books are written around them, so nothing breaks, but a ruling would let later books be exact.
1. **When Tobin was taken.** The manuscript says spring 417, at the Pellow farm, before the Hedge. js/tobin.js says autumn 417, after it. The library leans on neither.
2. **When the bells were taken.** tobin.js p. 3 says Ashfall 412; the manuscript says the first year of the quarry (417). Every library book now says 417.
3. **When the Hedge was planted.** The manuscript says "two summers ago"; the journal says late summer; Book Four says autumn 417.
4. **Bell-hours in the Veil's House.** Vol V's "second bell" against Vol VII §5's striking of bell-hours. The Veil books keep the House's own bell.
5. **What lifts skyships.** Vol I says a lodestone core; the manuscript says drift-glass. The books follow the manuscript.
6. **Candles facing in at Canopy.** The Whisper-Grove books treat this as an old custom; Vol VII (b) reads as if it began after 416.
7. **Hounds in the Reach before 417.** Some books have hounds in the Reach from 413; the journal calls the 417 hounds the "first". The books read "first" as the first at the orchard edge.
8. **Veil scribes' names.** The books use ink and pigment designations that pass from holder to holder (Umber, Bistre, Woad, Orpiment, Ochre, Gall) [PROPOSED].
9. **Calendar names.** Book One's "Leaffall" is not in Vol VII. The books avoid it, and Tomas's quest text still says "August" (see the roadmap's R2).
10. **Pre-Unnaming names in the Spectral Woods.** Vol II says "no living names". The Grove books read that as describing the Hollows after 416, and give the townsfolk plain names.
11. **The Eight Keepers.** The fable comes close to the Compact; cut the Owl's line "We were told that somebody would" if it says too much.
12. **Hints at the harvest.** The midwife's day-book (Office clerks asking for "the voice" of each child) and the Grove histories (the Canopy keeps the dead) stay at suspicion. Please confirm they are within what the player may suspect.
13. **New lives for canon minor figures.**
    - Tomas as a former "reeds-miner", and his mare Dumpling.
    - Orrin Pale as sexton in 412.
    - Garra Thorne writing a schoolbook.
    - Ennis Crowle, Dorran Sedge and Absalom Rudd as authors.

    All are marked [PROPOSED].

## Weaker books (for a later pass)
- **The Lamplighter's Second Note and A Year of Nights** share a device: an Oakhaven lamplighter courting with a two-note lamp reed. One should change.
- **Fairweather's Companion and A First History of Oakhaven** read more like tours than stories.
- **The Little Catechism** is mostly a list, saved by its last line.
- **Several Whisper-Grove books** lean on the same "before the fall" irony, and they blur when read together.
