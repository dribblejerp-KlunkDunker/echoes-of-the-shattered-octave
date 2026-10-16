# Echoes of the Shattered Octave — Book One

A first-person dark-fantasy RPG for the browser, made in the style of *The Elder Scrolls II: Daggerfall*. It is built on the *Echoes of the Shattered Octave* series bible.

**[Play it in your browser](https://shattered-octavebook1.pplx.app)** (also on [GitHub Pages](https://dribblejerp-klunkdunker.github.io/echoes-of-the-shattered-octave/))

![Title screen](screenshots/title.jpg)

Explore Oakhaven and the land past the Hedge, then sail the Drift-Kestrel to Whisper-Grove, the drowned marble capital of the Spectral Woods. Talk with townsfolk, take on quests and side quests, and trade with merchants. Fight Legionnaires, Proctors, golems, hounds and the Quiet. Keep the Narrow balanced, between the noise that brings the hounds and the silence that brings the Hush.

## Screenshots

| | |
|---|---|
| ![Oakhaven market by day](screenshots/oakhaven-market.jpg) | ![Oakhaven at dusk](screenshots/oakhaven-dusk.jpg) |
| Bettany in the Oakhaven market | Oakhaven at dusk, inside the Hedge |
| ![The Boar & Dulcimer tavern](screenshots/tavern.jpg) | ![Talking with Old Harrow](screenshots/dialogue.jpg) |
| Captain Vane at the Boar & Dulcimer | Daggerfall-style dialogue with Old Harrow, the gate-warden |
| ![Outside the Hedge](screenshots/outside-the-hedge.jpg) | ![A Carillon Legionnaire in the quarry](screenshots/quarry-legionnaire.jpg) |
| The clearing outside the Hedge | Facing a Carillon Legionnaire in the Oakhaven Quarry |
| ![A Hollow in the quarry](screenshots/quarry-hollow.jpg) | ![A Cacophony Hound in the Under-hedge](screenshots/underhedge-hound.jpg) |
| A Hollow at work in the quarry | A Cacophony Hound in the Under-hedge |
| ![The Root-vault](screenshots/rootvault.jpg) | ![A strongbox, crossbow readied](screenshots/strongbox-crossbow.jpg) |
| Steam machinery deep in the Root-vault | A strongbox, with the Rust Coast Crossbow readied |
| ![Buying from Captain Vane](screenshots/merchant.jpg) | ![Inventory and worn armour](screenshots/inventory.jpg) |
| Buying from Captain Vane | Inventory: worn armour, weapons and carried gear |
| ![Choosing a calling](screenshots/character-creation.jpg) | ![Sable in the mist outside the Hedge](screenshots/sable.jpg) |
| Choosing your calling, one of six character templates | Sable, Archivist of the Veil, keeping the Bound Ledger in the mist |
| ![Whisper-Grove at dusk](screenshots/whispergrove.jpg) | ![The Aegis Sentinel in the Cloister](screenshots/cloister.jpg) |
| Halder Wick's table for four in the lit water of Whisper-Grove | The Aegis Sentinel rises over the empty risers of the Cloister of the Lost Choir |
| ![The Phantom Weaver in the Whisper Catacombs](screenshots/catacombs.jpg) | |
| The Phantom Weaver at its loom in the Whisper Catacombs, with a weaverling in front of it | |

## Features

- Raycast 3D world with chunky Daggerfall-style textures, sprites and a first-person weapon view.
- Six character templates, plus attributes, skills and level-ups.
- Districts, interiors and dungeons: Oakhaven, the clearing, the quarry, the underhedge, the rootvault, the chapel and more.
- Part Three, "The Forgetting": after you escape Oakhaven, sail on to Whisper-Grove. Wade through the Sunken Court among walking Hollows, survive a Proctor ambush, and calm (or destroy) the Aegis Sentinel with Hymn 9 in the Cloister of the Lost Choir. Then steal an Office hand-press from the Malting, the Catalogue's harvest-house. Side stories include Halder Wick's table for four, the lamplighter and his dry lamps, four reflecting pools of strangers' memories, Bettis Renn, and the grey Arbiterium folder. Each choice shapes the Book One ending.
- Under Whisper-Grove: go down the Sunken Stair into the Whisper Catacombs, cut five missing Hollows out of their cocoons, and face the Phantom Weaver, which speaks in voices you know. Then decide what to do with the shroud it was weaving. New enemies: weaverlings, whose threads slow you; Drowned Hollows, whose screams draw the mist; and Pressman Mallow, whose blows make you forget. New side quests: The Missing Count, The Pressman's Round, and A Table for Four.
- Dialogue in the Daggerfall manner, with tone choices (Polite / Normal / Blunt), topics and directions.
- Songs: a magic system built on the Octave.
- Quests: the main story, "The Rite", plus side quests. In one of them, Sable, the last Archivist of the Veil, asks you to gather names for the Bound Ledger. Reading a name back restores a Hollow, but it costs her a piece of herself, and your choice changes the ending.
- Armour across five slots. Armour Rating softens hits, and heavy armour makes noise.
- Weapons including swords, axe, mace, spear, steam-maul, glass-shot pistol and crossbow. Bronze, bolts and blunt weapons each work best against certain enemies.
- Merchants who buy and sell. Prices shift with your Personality.
- Loot tables for enemies and 13 strongboxes hidden around the world.
- An original orchestral score, including a Whisper-Grove theme built on Hymn 9, with a music director that changes the music as the situation changes.
- Save slots for the session, save codes and save files.
- Keyboard, mouse and touch controls.

## Play locally

The game is plain HTML, CSS and JavaScript, with no build step. Serve the folder with any static web server:

```bash
# from the repository root
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from disk usually works too, but some browsers block audio or file loading on `file://`, so a local server is the safer choice.

### Host it on GitHub Pages

Go to **Settings → Pages**. Set **Source** to "Deploy from a branch", then pick `main` and `/ (root)`. This repository is already published at [dribblejerp-klunkdunker.github.io/echoes-of-the-shattered-octave](https://dribblejerp-klunkdunker.github.io/echoes-of-the-shattered-octave/). On a fork, it will be live at `https://<your-username>.github.io/echoes-of-the-shattered-octave/`.

## Controls

| Action | Input |
|---|---|
| Move | W A S D · Shift runs · Caps Lock toggles always-run |
| Look | Move the mouse over the view (rest it at a side edge to keep turning) · right-drag · Q and arrow keys · Z levels your gaze |
| Attack | Left-click to thrust · hold and move the mouse to slash or chop · wheel or 1–9 changes weapon |
| Use / Talk | E or Space, or click a bright name under the crosshair |
| Songs | Tab opens the song-book · F1–F5 cast · N murmurs |
| Panels | I inventory · C character · L logbook · M map · R rest · K ledger · Esc options and save |
| Sound | V sound on/off · B music on/off |
| Touch | Left thumb stick, right thumb drags to look, tap to use or strike |

## Project layout

```
index.html        entry point
css/style.css     Daggerfall-style interface
js/assets.js      embedded textures, sprites and weapon art
js/data.js        canon: classes, NPCs, quests, items, weapons, armour, merchants, loot
js/maps.js        districts, interiors and dungeons
js/engine.js      raycaster renderer
js/audio.js       sound effects and music director
js/grove.js       Part Three: Whisper-Grove story logic
js/game.js        game logic, UI, combat, dialogue, trade, saving
music/            soundtrack (MP3)
img/              portraits, title, map and ending art
screenshots/      images used in this README
```
