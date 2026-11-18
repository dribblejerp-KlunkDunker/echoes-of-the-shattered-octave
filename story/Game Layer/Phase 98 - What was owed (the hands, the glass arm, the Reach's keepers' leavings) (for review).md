# Phase 98: what was owed (for review)

*Written 17 Nov 2026. The owner, 17 Nov: "lets bust out phase 87 then lets move onto 91", "as soon as this phase is done". Two debts, both from designs already ruled. Code: `js/fp87.js`, `js/body21.js`, `js/fp-hands.js`, `js/anim.js`, `js/feel88.js`, `js/flourish11.js`, `js/game.js`; `js/keepers98.js`, `js/gear87.js`, `js/gearlook21.js`. Test: `test/owed98.test.js` (23 checks, all pass). French: `tools/i18n/p98-owed.tsv`.*

## 1. Phase 87: the bare hands and the glass arm, painted in code

Phase 87 rebuilt every weapon's first-person picture in code. Two of the first week's eleven paintings were left: the bare hands and the glass arm. Its record said: "Still owed from (d): new pictures for the bare hands and the glass arm's pose." They are done.

- **The bare fist.** With nothing in your hand you now raise your right fist where a blade's hand is, at the same size and detail as the weapon pictures. It wears what you wear: bare skin with its tendons, a leather glove with its seams, a mail gauntlet with its rings, and your sleeve below.
- **The glass arm is on the left.** It is your left arm (the books; `p.glassed`). The old picture raised it on the right, where your right hand should be. It is now raised on the left, and its swing is mirrored with it.
- **The glass itself** keeps the look you approved on 14 Nov ("the glass arm does look better yes"): deep azure planes, dark seams, a few bright edges, a bright rim, about a quarter of its first glow. It is now drawn plane by plane in code, on the fist, each finger, the thumb and the forearm.
- **The other hand rests.** The hand that is not striking is held low at its own side: your right fist under the raised glass arm; your left fist (glass, if that arm is) under bare hands. As before, a glassed traveller's left fist rests under a one-handed blade. It is the same painting now, so it matches.
- **A Song is cast from open hands.** Both hands open and raised, backs toward you, the Song's light between the palms. The left one is glass if that arm is. They are larger and held a little higher than the old ones, and the Song's colour lies exactly over them.
- **A fist goes straight out.** A tap punches forward with either arm (it swept sideways before, like a sword). Dragging still chooses the stroke for the glass arm, and goes the way you drag.
- **The locked arm.** When a proctor's press locks the glass arm, the pale wash now lies on the arm itself. Before, it was a rectangle in the air.
- Works in the classic view and the 3D view.

Nothing here changes a number: damage, reach, speed and noise are as they were.

## 2. Phase 91, question 4: the Reach's two keepers leave what a keeper leaves

The rule (Phase 90, rule 5, approved): a keeper put down leaves a trophy, which is a valuable and nothing more, and one piece of gear in its realm's own look, once. Phase 91 asked whether the Reach's two keepers should follow it, and you said to ask again when the Heights' keepers were built. They are (the Lamplighter, the Nineteen, the Brother-Captain; the Tallyman is met, not fought), and on 17 Nov you said to move on to it.

**The Heights' three were checked first.** Each already leaves one piece of gear and one valuable, once: the Lamplighter his hood and a lump of amber glass; the Nineteen the Brake-Gloves and a link with nineteen notches; the Brother-Captain the Dark Stave and his warrant.

**The Reach's two, new [PROPOSED]:**

| Keeper | Trophy (a valuable) | Gear in the Reach's look |
|---|---|---|
| The Flint-Back (the Antler Galleries) | **Chalk-White Shell-Plate**, worth 85 | **Ridge-Flint**: a ridge of black flint off its back, still set in a fist of white shell. One-handed, 5 to 12, quick. It joins the Old Reach set's weapons and counts as flint for that set's bonus. Worth 60. |
| The Standing Note (the Dry Flume) | **The Standing Note's Reed**, worth 90 | **Beam-Key**: the engine-man's iron key it lay on. One-handed, blunt, 6 to 12, loud. It joins the Flume set's weapons. Worth 58. |

- **Once.** The leavings lie by the body with one line. A keeper that gets up after its week and is put down again leaves nothing more.
- **Given late.** If you put a keeper down before today, its leavings are by the body the next time you stand in its place.
- **No set asks for more.** Both are weapons, and a set counts any one of its weapons, so nobody loses a full-set bonus they had.
- **Each has its own look:** its own picture in the pack and its own first-person painting (a ragged black ridge in a white lump; an open-jawed iron key).
- What already lay in their places (the Antler Pick, the Floorstone Knife, the Lengthsman's Hook, the Sluice-Boots, the strongboxes) is untouched.

## 3. Found while checking, and put right

Every suite in the repository (200) was run against this work, and each failure was run again alone and against the earlier branches. Three older faults turned up and were fixed here:

- **The Vigil and the Chalk Cliffs had finger-posts with no milestone** (Phase 96). A milestone is placed by every finger-post, but those two places join the world after the milestones were laid. They now get theirs before you first stand in them, so the world map can send you there like anywhere else.
- **The Scavenger's Cloth-Pole was as quiet as the Old Cantor's Staff** (Phase 92). The staff is "quieter than every other long weapon" (Phase 79, approved). The cloth-pole's noise is now 0.7 (it was 0.6, the staff's own). The Tallyman's Hook (Phase 97) was set at 0.8 for the same reason.
- **The Warden of the Chain wears the Flambeaux's own painting,** which has its own walking poses, so the painted-people check now knows it is not meant to be rigged again.

Still failing, and failing the same way on `main` before any of this (so not from this work): `logmap` (a static list of older modules' journal lines), `smalllife` (a saved-state comparison), `sprites21` (every sprite at once needs more than eight atlas pages; the renderer's own limit is sixteen), `sync19` (the two-player census) and `net19` (it needs a network this machine does not give it).

## For the owner

1. **The glass arm on the left.** *Recommend: keep. It is the left arm everywhere else in the game and in the books.*
2. **Punches go straight out** where they swept before. *Recommend: keep.*
3. **The four names:** Chalk-White Shell-Plate, Ridge-Flint, the Standing Note's Reed, Beam-Key. *Recommend: keep, or give me yours.*
4. **The leavings are weapons, not worn pieces,** so that no set grows. *Recommend: keep.*
5. **The five old failing checks** listed above. *Recommend: a small phase of their own; say if you want it next.*
6. **Hearth trophies.** The house on Cooper's Row hangs the twelve Book One boss trophies on its pegs. The keepers' trophies here are valuables to sell, as the rule says, and do not hang there. *Recommend: leave as the rule has it, unless you want keepers' pegs too.*

## The new lines (English; the French is in `tools/i18n/p98-owed.tsv`)

1. The Flint-Back lies still. A plate of its shell has come away whole, and a ridge of black flint with it.
2. The note stops. The iron galleries ring on a moment, and then they are only iron. Something lies where the Standing Note lay.
3. Chalk-White Shell-Plate
4. A plate of the Flint-Back's shell, as broad as a shield and as white as the chalk it grew in. It is too brittle to carry on an arm. Somebody will want it on a wall.
5. Ridge-Flint
6. A ridge of black flint off the Flint-Back's shell, still set in a fist of white shell for a grip. Nobody knapped it. It grew its edge.
7. The Standing Note's Reed
8. The reed out of the Standing Note's throat, as long as a forearm and the colour of old horn. Held near iron, it hums the one note it ever made.
9. Beam-Key
10. An engine-man's key for the great nuts of the beam: iron, as long as a forearm, its jaw worn bright. The Standing Note lay on it for two hundred years. When it strikes, it rings.

Flags: `p98_ka` (the Flint-Back's leavings given), `p98_kf` (the Standing Note's). 0 or 1.
