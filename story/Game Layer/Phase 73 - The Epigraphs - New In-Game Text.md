# Phase 73 — The Epigraphs (Book One's chapter epigraphs as documents in the world)

**Built 10 November 2026** (`js/epigraphs73.js`; test `test/epigraphs73.test.js`; ROADMAP R6; Story Brainstorm §3, "How books could carry story"). Every new line of in-game text, in English with its French (`tools/i18n/p73-epigraphs.tsv`). Status: **canon (book)** for every document's words and attribution (Book One, the block quote under each chapter heading); **[PROPOSED]** for every placement the book does not state, every label, and every gate.

**Book accuracy.** Each document shows the epigraph word for word and the attribution exactly as the book prints it (the test reads the manuscript and compares). Nothing else is written into them: the book quotes one passage of each document and never gives the rest, so no body text is invented. No voices: documents are read, not spoken. Nothing is gated on reading them.

## What is new, in short

- **Nineteen papers**, read in the held-document reader (`js/reading.js`) in the paper that suits their source: parchment for books, notebooks and the Church's Rubric; grey ruled Office paper (with the red stamp ring) for the Office's and the Arbiterium's forms and the ship's papers; plain paper for the vox-bottle's label, the Null-Watch primer and the Free Captains' handbill; slate for the saying cut into a plank.
- **Where several lie together** (Tobin's notebooks, Tobiah's papers, the Tuning Room's south wall) a short menu offers them by title, with a tick on the ones you have read, as the library's piles do.
- **Gates.** No paper is in the world, or will open, before the story reaches its chapter. The Part One papers are there from the first day; the later ones wait for the flags the existing modules set.
- **Props** are transient (never saved) and restaged on every map load; the herald's sheet comes and goes while you stand in the clearing. Reading a paper marks it in `G.flags.p73_read` and gives Lore +1 the first time.

## Which epigraphs, and which were skipped

Five of the twenty-four chapter epigraphs are already in the game word for word, so they are not placed again:

| Ch. | Epigraph | Already in the game |
|---|---|---|
| 1 | "Voice at the hedge, voice at the door…", Oakhaven skipping rhyme | `js/upgrades.js` lore book "Rhymes of the Hedge-Nursery", on the lore shelves |
| 3 | "The patient must not be permitted to cry out…", *Handbook of the Grafting Office* | the library's *Handbook of the Grafting Office (Oakhaven Works Issue)*, §4, in Rooke's surgery |
| 7 | "Where the second note has taken root, let the Pure Flame be the only song.", Warrant of Purification | the first line of the library's sermon *The Only Song*, in the chapel's pile |
| 15 | "The Veil keeps three rules…", Precept of the Silent Veil | Sable says it word for word (`js/grove31.js`); the library's *Rule of the House* and two Veil books keep the three rules |
| 22 | "Rule the page before you write on it…", P. Quist | the library's *Commonplace Book of the Scribe Styled Bistre* quotes it, attributed to the Registrar in 405 |

The Prologue's catechism (in the cinematic and the library's *Little Catechism*) and Echo I's epigraph (Ilias Marren; not a chapter, and the Loom-Wardens belong to later books) are outside the twenty-four.

## The nineteen documents

| Ch. | Title (kind, paper) | Where | Gate |
|---|---|---|---|
| 2 | *On the Calibration of Resonant Bores*, Tobiah Marsh's copy (Volume, parchment) | the quarry's pump hall, by Tobiah Marsh | Part One only (until the escape; then it is aboard, ch. 13) |
| 4 | The label on a vox-bottle (Label, paper) | the Bonded Store at Stillwater, by the broadsheet bales | none |
| 5 | Catalogue Circular 12 (Office circular, Office) | the quarry's pump hall, by the first pump | none |
| 6 | The notebook of 401 SR (Cantor's notebook, parchment) | Lyra's house, the Cantor's notebooks | none |
| 8 | Bill of lading (Ship's papers, Office) | the Kestrel's hold, by the crates | the hold (Part Three on) |
| 9 | Rubric of the Rite of Unison (Rubric, parchment) | the chapel, by the altar step | the Church has come (`church_come` or `rite_ready`, or later) |
| 10 | Vance Sequence, Revision Seven (Calibration sheet, Office) | Tobiah's charts in your pack, if he gave them to you; otherwise his papers on the engineer's bench below | the Rite has begun (`rite_started` or later); the bench only while you do not carry the charts |
| 11 | The notebook of 398 SR | Lyra's house, the Cantor's notebooks | none |
| 12 | A Rust Coast saying (Saying, slate) | the Kestrel's deck, a plank by the coiled rope | aboard (Part Three on) |
| 13 | *On the Calibration of Resonant Bores*, Tobiah Marsh's copy (Volume, parchment) | the Kestrel below, Tobiah's papers | aboard (Part Three on) |
| 14 | Form 9: Intake (Standing form, Office) | the Malting, the registration bench | the Malting (Part Three) |
| 16 | Carriage note, Registry OK-114 (Carriage note, Office) | the Malting's Tuning Room archive, the south wall's paper | Sable has joined (`sable_joined`) or Part Four |
| 17 | Requisition 44 (Requisition, Office) | the same south wall | Sable has joined, or the Cloister's Aegis has woken (`aegis_*`), or Part Four |
| 18 | Notes Toward an Efficient Intake (Office notes, Office) | the Malting's clerks' hall, a desk | the front door (`p61` ≥ 1), the press taken, or Part Four |
| 19 | The Arbiterium cover-sheet (Cover-sheet, Office) | the Tuning Room, the box on the table | the Malting (Part Three) |
| 20 | A Plain Account of the Cacophony (Primer, paper) | the Cloister of the Lost Choir, the end of a riser | the press taken, or the porch begun (`porch_*`, `wearer_porch`), or Part Four |
| 21 | A Free Captains' handbill (Handbill, paper) | the Kestrel's deck, the mast | the cutter chase (`c68` ≥ 1) or Part Four |
| 23 | The notebook of 404 SR | Lyra's house, the Cantor's notebooks | none |
| 24 | Writ of Attainder and Grace (Writ, Office) | the Deep Woods clearing, by the herald | while he stands there after reading (`herald_come`, `h66` 2 to 5) |

## [PROPOSED] choices

1. **What counts as already used.** An epigraph is skipped when all its words are already in the game's text (`js/`); partial echoes are not enough. Ch. 10's margin is quoted in the Rite's narration (`js/rite43.js`, `js/ash50.js`) without "STAGE 9 — UNISON HOLD.", and ch. 14's Form 9 is paraphrased by Quist (`js/data.js`), so both are placed. The Warrant (ch. 7) and the Grafting Office handbook (ch. 3), named in the plan as examples, are skipped because the library already carries their words.
2. **Tobin's notebooks are there from the start, with no gate**, all three entries (401, 398 and 404 SR). The book puts "the Cantor's notebooks, twenty years of them" on the shelf over the settle (ch. 1, l. 500), and every entry was written years before the book begins; none tells anything that happens. The 404 entry ("For a death with no body…") prepares ch. 23, where Lyra at last sings Tobin's office; it says nothing of that scene. Lyra's house is not reachable in Part Four, so gating it to ch. 23 would mean it could never be read.
3. **Tobiah's K. Vance in the quarry (ch. 2).** The book has the copy in his satchel at the quarry (ch. 5, l. 1725); the paper lies by him in the pump hall until the escape. From then on, the same copy is aboard with his papers (ch. 13's passage). Its title names it as his copy, so it never takes over `js/tobiah57.js`'s own card titled *On the Calibration of Resonant Bores*.
4. **The vox-bottle's label at the Bonded Store (ch. 4).** The book's only vox-bottle is Vane's, and its label says VESPER (ch. 5, l. 1677), so the epigraph's trade label is put on a bottle where Port Cantabile's goods come in. The bottle is a new prop.
5. **Circular 12 in the quarry's pump hall (ch. 5)**, pinned up by the first pump.
6. **The Rubric in the chapel (ch. 9).** The sisters "came up from the Chapel" with it (ch. 9, l. 2836); the paper lies by the altar step from the day the Church comes.
7. **The ship's papers aboard (ch. 8, 10, 13).** The bill of lading by the hold's crates, and Tobiah's book on the engineer's bench. The Kestrel is boardable only from Part Three, so these come after their chapters.
8. **Revision Seven's margin is Tobiah's charts (ch. 10).** The game's `charts` item is already "the only copy of the Vance Sequence, Revision Seven, with the margin on it" (`js/data.js`), which Tobiah gives you at the quarry or aboard (ch. 13, l. 4000: pinned round his charts). Using the charts from your pack reads the margin as a document once the Rite has begun (before it, the item shows its old description, so nothing is read before ch. 10). If you never took them, they lie with his papers on the engineer's bench aboard.
9. **The Rust Coast saying cut into a plank by the coiled rope (ch. 12).** A saying is not a document; the plank is new.
10. **The Malting's papers (ch. 14, 16–19).** The book says the archive under the kiln keeps "intake sheets and requisitions and carriage notes" and that "the shelves on the south wall were paper" (ch. 19, ll. 5120, 5124): the carriage note and the requisition are there. The cover-sheet lies in the box on the table where Kaelen read it. Form 9 is on the registration bench; S.'s notes on a clerk's desk. The existing grey folder (`js/grove.js`) keeps its own wording; the cover-sheet paper gives the book's.
11. **The primer at the Cloister (ch. 20)**, on the end of a riser of the children's choir.
12. **The handbill on the Kestrel's mast (ch. 21).**
13. **The herald's sheet (ch. 24).** The book's herald reads "from a sealed sheet with a black ribbon" (l. 6196); the standing form is what that sheet is drawn on. It can be read in the clearing by him after he has read it aloud, and goes when he does. With the herald scene switched off (the old two-choice card) it is not shown.
14. **The labels and the two short menu intros** are the game's; the intros use the book's own words (l. 500, l. 4000, l. 5120).
15. **French.** These are game text, not library books, so they are translated now (the library's books stay English until R8). "Greenleaf" has no translation yet in the catalogue: « Feuillevert » here. "Bill of lading" is « Connaissement »; "Writ of Attainder and Grace" « Mandat de Proscription et de Grâce ».

## The lines

All English<TAB>French pairs are in `tools/i18n/p73-epigraphs.tsv`. The documents, as shown (quoted lines, then the attribution):

- **ch. 2** *Every structure has a note at which it wishes to fail. The engineer's task is to find that note before the structure does, and to hold the bore a hair's breadth beneath it.* — K. Vance, *On the Calibration of Resonant Bores*, Conservatory of Bores, 409 SR
- **ch. 4** *VOX. Genuine Last Words, Sealed at the Deathbed. / Do Not Unstop Within a Mile of Open Country. / No Refunds.* — Label on a vox-bottle, Port Cantabile
- **ch. 5** *An engram is a harmonic template and possesses no identity. Speech emitted by a damaged engram is to be disregarded and is not to be recorded.* — Catalogue Circular 12, *On the Maintenance of Carillon Engrams*
- **ch. 6** *For lost lambs, the calling-song. Sing it full, or not at all. A lamb in the dark will not follow a whisper.* — T. Ashgrove, Cantor's notebook, 401 SR
- **ch. 8** *Item: engram cores, standard, in straw. Twelve crates. Consignee: Oakhaven Works, Carillon garrison. The consignment is not to be opened in transit. The Office is aware that carriers sometimes hear the consignment. Carriers who report hearing the consignment will not be engaged again.* — Bill of lading, Office of the Catalogue
- **ch. 9** *The chosen voice shall not speak from the third day, that the instrument be not worn. She shall be given honey and raw egg. She shall be washed. She shall be told that she is fortunate.* — Rubric of the Rite of Unison
- **ch. 10** *STAGE 9 — UNISON HOLD. On failure of the hold, for any cause, the Sequence is not to be halted. Slippage is to be absorbed by the source.* — Vance Sequence, Rev. 7, marginal note in an unknown hand
- **ch. 11** *Growth is the kindest of the eight laws and the least merciful. It has no idea what it is doing. It only knows the word more.* — T. Ashgrove, Cantor's notebook, 398 SR
- **ch. 12** *The line is not a promise. The line is a rope.* — Rust Coast saying
- **ch. 13** *A structure does not fail where it is weakest. It fails where the load finds it.* — K. Vance, *On the Calibration of Resonant Bores*
- **ch. 14** *Form 9: Intake. The subject is to be asked three questions and no more. Name. Age. Trade. Further speech is not to be recorded, as it lengthens the queue.* — Office of the Catalogue, standing forms
- **ch. 16** *Registry OK-114. Consignment: twelve crates. The carrier attests that the consignment travelled dry, secure and unopened. / Signature of carrier: (mark).* — Carriage note, Office of the Catalogue, Greenleaf 417
- **ch. 17** *Requisition 44: small clear voices, forty (40). Source: charitable choir, Cloister road, Whisper-Grove. Note: one roof, one hour, one wagon. Efficient.* — Office of the Catalogue, requisition file, Ashfall 416
- **ch. 18** *Queue discipline is the whole of the work. A subject who has been standing for two hours and has been told three times what will be asked will answer in under nine seconds. A subject who is surprised will take a minute and upset the line behind her.* — S., *Notes Toward an Efficient Intake*, Office of the Catalogue, 416
- **ch. 19** *Engineer V. is not to be informed of the object of Stage 9. His calibration is measurably more accurate when he believes the object is extraction.* — Arbiterium cover-sheet, Rite of Pure Unison, 411 SR
- **ch. 20** *It cannot read. It cannot guess. It knows nothing about you that was not said out loud within its hearing, which is why the old women say: do your weeping on paper.* — *A Plain Account of the Cacophony*, Null-Watch Press
- **ch. 21** *An Office cutter carries listening gear forward of the mast. Running silent will not help you. Your cargo is not silent.* — Free Captains' handbill, Port Cantabile
- **ch. 23** *For a death with no body, sing the full office anyway. The song is not for the dead. It is for the hole the dead left, and a hole will take a song the way dry ground takes rain.* — T. Ashgrove, Cantor's notebook, 404 SR
- **ch. 24** *Writ of Attainder and Grace. Be it known that the persons herein named are declared Dissonant, their goods forfeit, their testimony void, their names struck. Provided always that grace is offered to each, once, and that a man who refuses grace has chosen what follows.* — Standing form, the Arbiterium

Labels [PROPOSED]: "A small battered book with a broken spine" (book, l. 1725); "An Office circular, pinned up by the pumps"; "A vox-bottle: blue glass, red wax, a paper label"; "The Cantor's notebooks, twenty years of them" (book, l. 500); "The Rubric of the Rite, open by the altar step"; "A bill of lading, tacked to a crate"; "Tobiah Marsh's papers, on the end of the engineer's bench"; "Words cut into a plank by the coiled rope"; "A handbill, nailed to the mast"; "A stack of printed forms on the registration bench"; "A clerk's copy of the house notes, under a blotter"; "The shelves on the south wall: paper" (book, l. 5124); "A box on the table: CONSORTIUM — DAWNING WORKS — RITE OF PURE UNISON — 411/412" (book, l. 5128); "A primer from the Null-Watch Press, on the end of a riser"; "The sealed sheet with the black ribbon" (book, l. 6196). Menu intros: "Tobin Ashgrove's notebooks, full of intervals and orchard-lore and small pencil sketches of trees." (l. 500); "A month of readings, every quarter-hour, in his own small careful hand." (l. 4000); "The Office of the Catalogue keeps everything. It keeps intake sheets and requisitions and carriage notes." (l. 5120). Buttons: "Put it down." "Back." "Leave them."
