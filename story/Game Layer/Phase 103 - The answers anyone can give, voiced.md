# Phase 103: the answers anyone can give, voiced

19 November 2026. Branch `p103-voices`. Built by Opus 5.5. The owner, 19 Nov: "Yes make the answers anyone can give should be voiced. Leave the French voices out for now."

## What changed in the game
- **The shared answers are spoken.** When you ask someone about a topic they have no answer of their own for (Oakhaven, the Hedge, the Narrow, Kaelen Vance, the Rite and the rest: 27 topics, each with a plain answer and an informed one), the answer now plays. So do the gossips' rumours ("I couldn't say. But I'll tell you what I heard: ..."), the three refusals a blunt tone can draw ("No."), and the three blessings a polite answer can end with ("Mind how you go."), which play after the answer, own or shared.
- **In the person's own voice, as near as can be.** Recording every shared answer in each of 160 people's exact voices would be about 29 hours of speech and roughly 500 MB. Instead everyone is in a **voice group**: one for each Kokoro voice anyone is cast in, so a person's shared answers come in the same voice as their own lines. What is not kept is their own pitch and treatment (an old man's waver, a rough throat): the group speaks plainly, with a little room. Three groups are different:
  - **children** (Pim, Kit Farrant, Linnet, the treble, the Cay's child) answer in a child's voice;
  - **the Hollows and the whispering old** (the sexton, the mourner, the shutters and the broom, Halder Wick, Auld Bessa) answer in breath, a man's or a woman's;
  - **Kaelen Vance, the Aegis and Registrar-General Quist** keep their own voice for these too: no group sounds like a glass arm, a chord, or a voice that reads.
- **A recording plays only for the whole answer.** A shared line never plays off part of something else (a direction that happens to start "No." plays nothing).
- **The silent stay silent** (Lyra after the Grove, Mags signing, General Ward), and so do the paintings and the cat. French play stays unvoiced, as ruled.
- Options are unchanged: Options > Graphics & access > Voices.

## Size
{SIZE}

## How it is made
1. `node tools/voices/dump-dialogue.js` (with the game served) now also writes `tools/voices/shared.json`: the shared topics and rumours from the running game, and each person's tier and gossip flag in `dialogue.json`.
2. `python3 tools/voices/shared.py` puts everyone who speaks in a group (`voices/groups.json`) and writes each group's lines into `voices/script.json` (kind `shared`). A group records only what its people can be heard to say: only the informed answers if every member is informed; the rumours only if a gossip is in it.
3. `python3 tools/voices/build.py --model DIR` renders them. New: `--worker` renders only (no manifest, no pruning), so two can run side by side on different `--only` lists; a plain run then writes `js/voice-lines.js`, now with `VOICE_GROUPS` (who answers in which group).
4. `js/voice-acting.js` plays a shared answer when the whole answer matches a recording in the person's group, and a blessing on the end after it.

## The groups
{GROUPS}

## For the owner
- Any group's voice can be changed, or a person moved to another group, and only that group re-rendered.
- If a person's shared answers should carry their own pitch and treatment exactly, that person can be given their own set (about 2 MB and 15 minutes of rendering each), as Kaelen, the Aegis and Quist have.

## Verification
{VERIFY}
