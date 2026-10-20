# Credits

Audit for Echoes of the Shattered Octave, Book One (Phase 7, VOICES team). It lists what the repository itself can show. Where the repository records no author, source or licence, this file says **unverified** and does not guess. File-by-file detail is in `ASSETS.md`; the in-game panel (Options > Graphics & access > Full credits) shows the same content from `js/voices.js`.

## Typefaces

All four are bundled in `fonts/` (Latin subsets cut with the `@fontsource` packages, per `css/fonts.css`) and licensed under the SIL Open Font License 1.1. The full licence texts ship beside them.

| Typeface | Authors (from the OFL text) | Used for | Files |
|---|---|---|---|
| Cinzel | The Cinzel Project Authors, 2020 | capital-letter labels and buttons | `cinzel-latin-500-normal.woff2`, `cinzel-latin-700-normal.woff2`, `OFL-Cinzel.txt` |
| Alegreya | The Alegreya Project Authors, 2011 | body text | `alegreya-latin-400-italic.woff2`, `alegreya-latin-400-normal.woff2`, `alegreya-latin-500-italic.woff2`, `alegreya-latin-500-normal.woff2`, `alegreya-latin-700-italic.woff2`, `alegreya-latin-700-normal.woff2`, `OFL-Alegreya.txt` |
| Alegreya SC | The Alegreya Project Authors, 2011 | small capitals | `alegreya-sc-latin-500-normal.woff2`, `alegreya-sc-latin-700-normal.woff2`, `OFL-AlegreyaSC.txt` |
| UnifrakturMaguntia | j. 'mach' wust (2010) and Peter Wiegel (2009) | blackletter, titles and headings only | `UnifrakturMaguntia.woff2`, `OFL-UnifrakturMaguntia.txt` |

## Music

Ten cues in `music/`: `coda.mp3`, `combat.mp3`, `dungeon.mp3`, `ending.mp3`, `greening.mp3`, `grove.mp3`, `tavern.mp3`, `title.mp3`, `town.mp3`, `wild.mp3`. The README describes them as an original orchestral score and `js/audio.js` as General MIDI orchestra cues. Composer, rendering tool, soundfont and licence are **unverified**.

## Sound effects and voices

Every sound effect is generated live with WebAudio in `js/audio.js`; no sample files ship. Vocal grunts and greetings are formant-synthesised in `js/voices.js` (a profile for every NPC and enemy family; the Quiet, the Tongueless and a voiceless Lyra are silent). The optional spoken line uses the player's own browser voices; none are bundled. Licence of the game's own code: **unverified** (no LICENSE file in the repository).

## Art

- `img/`: 39 images (title, ending, four maps, six creation faces, dialogue portraits). How they were made is **unverified**.
- `js/assets.js`: embedded wall and floor textures, sprites and first-person weapon art. Origin **unverified**.
- Procedural stand-ins, drawn by the game's own code with no files: carved frames and brass corners, item icons and paper doll, mood portraits, logbook sketches, area cards, death and ending pictures, directional enemy views, flinches and poses, sky, weather, light, doors, gates, fire and smoke, small creatures. Each awaits painted art. The module list is in `ASSETS.md`.
- `screenshots/`: captures of the game for the README.

## Tools

- Playwright and Chromium run the browser tests in `test/`. They are not bundled and are not needed to play. Playwright is Apache-2.0 upstream; Chromium carries its own licences.
- `@fontsource` packages supplied the font subsets (the typefaces remain OFL; the packaging licence is **unverified** here).
- Python's `http.server` serves the game locally for play and tests (not bundled).
- The repository has no `package.json`, no build step and no npm dependency.

## Contributors

- Project owner: the GitHub account in the README's Pages link, `dribblejerp-klunkdunker`. Design, story and direction are the project's own; the repository cannot verify more than that.
- Code, from git history at the time of the audit: 93 commits authored as "Claude", 1 as "Codebuff". Commit trailers name Claude Opus 5.5 (74), Claude Sonnet 5.5 (6) and Codebuff (1) as co-authors. The game was built with AI assistance.

## Keeping this current

Add a row here and in `ASSETS.md` for anything new. If a source or licence is not known, write "unverified".
