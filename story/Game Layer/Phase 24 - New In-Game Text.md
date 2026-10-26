# Phase 24 — The opening

*Written for review, Oct 2026. The code is `js/cinematic24.js`.*

## What is new, in short

A new game now opens on a camera sequence through the game's own maps before the first step, in the player's own renderer and preset. The six paragraphs the game always opened with (`INTRO`, `js/data.js`) are its captions, unchanged, and already in French. The shots:

1. *It is autumn, in the four hundred and nineteenth year…* Wethercombe from Hob's Knap, the sun on the west ridge.
2. *You have come up the Greenroot road to Oakhaven…* the road outside the Hedge at dusk, to the North Gate.
3. *Too loud brings the hounds. Too still brings the Hush.* the Deep Woods at night: three hounds come into a hush-lamp's light; then the picture drains grey as the camera stops.
4. *The Church is coming up the road behind you, singing under glass-fire…* the Synod column through Greenroot: the Flambeau with his lantern, the Herald, ten Proctors two abreast with censers of glass-fire between the files; the Pure Note (528 Hz) sounds under the music.
5. *Nobody has rung a bell in Oakhaven…* the east street at dusk, lamps lit, the moon up.
6. Black; the title card (the title screen's own sigil and words).
7. *Keep your voice in your chest.* fading up on the North Gate, Old Harrow before you: the first frame of play.

No story fact is added or changed. The column is staged from the game's own sprites and removed afterwards; the Flambeau's presence on the road nine days before the Rite follows the intro's own line ("The Church is coming up the road behind you").

## New text [PROPOSED]

Only Options labels; no story prose.

| Key | Text |
|---|---|
| Options row | Opening cinematic — *the flight over the Reach before a new game* (On / Off) |
| Options row | Watch the opening again — Play |
| Intro button, while it runs | Skip |

## Questions for sleeves

1. Should a later phase open on the Prologue itself (Solenne on the risers at the three hundredth sunrise, 412 SR) before this flight, or stay with the arrival at Oakhaven?
2. Narration is text captions only. A recorded narrator would need a voice built offline with `tools/voices`; is that wanted, and whose voice (the Tide-Weaver's)?
3. The sequence is about a minute. Too long for a second playthrough? (It can be turned off, and skipped at any time.)
