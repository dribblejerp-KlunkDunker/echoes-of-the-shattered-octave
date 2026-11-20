# Phase 104: every character's own voice for the shared answers

19 to 20 November 2026. Branch `p104-own-voices`. Built by Opus 5.5. The owner, 19 Nov: "give every character their own voices. I agree leaving the rule as is. do 3 and what was decision 4".

## What changed in the game
- **Everyone says the shared answers in their own voice.** Phase 103 voiced the answers anyone can give (the 27 shared topics, the gossips' rumours, a blunt tone's refusals, a polite answer's blessing) in groups: one recording per Kokoro voice, shared by everyone cast in it. Now each person says them in **their own casting**, the same voice, speed, pitch and treatment as their own lines: Old Harrow's age, Two-Eleven's gravel, the Hollows' breath, a child's lift. A person who appears in several places (the sexton, Kaelen, Vane, Sable) is one casting and says them the same way everywhere.
- **Nothing else changed**: the silent stay silent, French play stays unvoiced, Options > Graphics & access > Voices is as before.

## Size
**7,940 recordings in 151 castings for 160 people, about 21 hours of speech, 372 MB.** The voices folder went from 114 MB (Phase 103) to 404 MB, and the offline download (everything the game keeps for play without a connection) from 163 MB to **453 MB**. That is the cost of a voice of their own for everyone.

If the offline download is too big for a phone, one option for later: keep the shared answers online only (they would play when connected, and be silent offline), which would bring the offline download back to about 80 MB. Not done; the owner's call.

## How it is made
The speech itself depends only on the voice and the words, so it is made **once per Kokoro voice** (1,575 pieces, kept on the build machine in `~/.cache/octave-voice-raw/`, not in the repository). Each person's speed and pitch are then applied by time-stretching (Rubber Band, through pedalboard) and their treatment as usual. That made the rendering about 3½ hours instead of about 17.

1. `node tools/voices/dump-dialogue.js` (with the game served): `tools/voices/dialogue.json` and `shared.json`.
2. `python3 tools/voices/shared.py`: each person's casting (`voices/groups.json`, read by the game as `VOICE_GROUPS`) and their shared lines in `voices/script.json`. A person records only what they can be heard to say: the informed answers only if they are informed, the rumours only if they are a gossip.
3. `python3 tools/voices/build.py --model DIR --worker --only <castings>` in two processes split by Kokoro voice, then a plain `build.py` run to write the manifest.

## Also settled the same evening
- **Pegs by the hearth for the keepers' trophies:** none; the rule stands as it is.
- **The reader's keys:** kept as built (F2 on and off, F3 or `[` again, F4 or `]` the whole screen, Esc stops).
- Recorded in `story/Game Layer/Rulings of 19 Nov 2026.md`.

## Verification
- `test/voice-acting.test.js`: everyone who speaks says the shared answers in the voice of their own lines (checked person by person against their own recordings); every shared answer a person can be heard to give is recorded in their casting; the silent have none; in play, Two-Eleven's shared answer plays in his own voice, read-aloud skips it, a blessing follows, "No." plays, part of an answer plays nothing; Pim, the sexton and Kaelen in three places say them in their own castings, Lyra after the Grove says nothing. Passes.
- `pwa18` (the offline download with 453 MB of media), `voices`, `companion-talk`, `parish`, `story-i18n`, `ripples`: pass. The game code is unchanged from Phase 103 apart from comments; the rest of the voice suites passed there.
