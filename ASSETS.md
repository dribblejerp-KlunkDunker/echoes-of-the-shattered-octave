# Assets and licences

Every audio, font and image asset in the repository, with where it came from, its licence and its status. Written for the Phase 7 credits audit (VOICES team). The in-game "Full credits" panel (Options > Graphics & access) is built from the same audit (`js/voices.js`); the narrative version is `CREDITS.md`.

**Rule of this file:** nothing here claims authorship or a licence the repository cannot show. *Unverified* means the repository records no author, source or licence for it, so the answer must come from the project owner before any public release.

| Status | Meaning |
|---|---|
| verified | A licence text ships in the repository and names the authors |
| own code | Generated at run time by the game's own JavaScript; no external asset involved |
| procedural stand-in | Drawn or synthesised by the game's code as a placeholder for final art or recordings |
| unverified | The repository does not record the source, author or licence |

## Fonts (fonts/, css/fonts.css)

Latin subsets cut with the `@fontsource` packages (stated in the css/fonts.css header). Licence for all four families: SIL Open Font License 1.1, texts in `fonts/OFL-*.txt`.

| File | Family | Size | Copyright holder (from the OFL text) | Licence | Status |
|---|---|---|---|---|---|
| `OFL-Alegreya.txt` | Alegreya | 4 KB | The Alegreya Project Authors (2011) | OFL 1.1 text | verified |
| `OFL-AlegreyaSC.txt` | Alegreya SC | 5 KB | The Alegreya Project Authors (2011) | OFL 1.1 text | verified |
| `OFL-Cinzel.txt` | Cinzel | 4 KB | The Cinzel Project Authors (2020) | OFL 1.1 text | verified |
| `OFL-UnifrakturMaguntia.txt` | UnifrakturMaguntia | 4 KB | j. 'mach' wust (2010), Peter Wiegel (2009) | OFL 1.1 text | verified |
| `UnifrakturMaguntia.woff2` | UnifrakturMaguntia | 26 KB | j. 'mach' wust (2010), Peter Wiegel (2009) | OFL 1.1 | verified |
| `alegreya-latin-400-italic.woff2` | Alegreya | 23 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-latin-400-normal.woff2` | Alegreya | 22 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-latin-500-italic.woff2` | Alegreya | 24 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-latin-500-normal.woff2` | Alegreya | 24 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-latin-700-italic.woff2` | Alegreya | 24 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-latin-700-normal.woff2` | Alegreya | 24 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-sc-latin-500-normal.woff2` | Alegreya SC | 30 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `alegreya-sc-latin-700-normal.woff2` | Alegreya SC | 30 KB | The Alegreya Project Authors (2011) | OFL 1.1 | verified |
| `cinzel-latin-500-normal.woff2` | Cinzel | 15 KB | The Cinzel Project Authors (2020) | OFL 1.1 | verified |
| `cinzel-latin-700-normal.woff2` | Cinzel | 15 KB | The Cinzel Project Authors (2020) | OFL 1.1 | verified |

UnifrakturMaguntia is used for titles and panel headings only (readable Cinzel fallback). Its OFL names a Reserved Font Name; whether the packaged subset counts as a modified version is unverified.

## Music (music/)

Ten MP3 cues streamed by `Audio_.music` (js/audio.js). The README calls the score "an original orchestral score" and js/audio.js comments describe General MIDI orchestra cues. The repository records no composer, no rendering tool and no soundfont.

| File | Used for | Size | Source | Licence | Status |
|---|---|---|---|---|---|
| `coda.mp3` | Part Four, Deep Woods and Mausoleum | 2490 KB | not recorded (README: original score) | unverified | unverified |
| `combat.mp3` | combat loop | 824 KB | not recorded (README: original score) | unverified | unverified |
| `dungeon.mp3` | dungeons and crypts | 2453 KB | not recorded (README: original score) | unverified | unverified |
| `ending.mp3` | ending screens | 2534 KB | not recorded (README: original score) | unverified | unverified |
| `greening.mp3` | the Greening loop | 753 KB | not recorded (README: original score) | unverified | unverified |
| `grove.mp3` | Whisper-Grove | 2773 KB | not recorded (README: original score) | unverified | unverified |
| `tavern.mp3` | taverns | 1709 KB | not recorded (README: original score) | unverified | unverified |
| `title.mp3` | title screen | 2419 KB | not recorded (README: original score) | unverified | unverified |
| `town.mp3` | Oakhaven streets | 1928 KB | not recorded (README: original score) | unverified | unverified |
| `wild.mp3` | wilderness and the Reach | 2766 KB | not recorded (README: original score) | unverified | unverified |

If a General MIDI soundfont was used to render these, its licence also applies to the audio. Check this before any release.

## Generated sounds (js/audio.js)

No sample files. All run-time WebAudio: `Audio_.sfx.*` (footsteps by surface, hit, swing, bow, shot, hound, bell, golem, hurt, door, pickup, ui, song, fifth, murmur, press, quiet, crack, voice, thunder, rain, bird, rat), the drone and wind beds, the hush-lamp whistle and the `Audio_.hum` Root-note hum.

| Item | Module | Status |
|---|---|---|
| Sound effects, drone, wind, hum | js/audio.js | own code |
| Grunts and greetings | js/voices.js | own code, procedural stand-in |

Licence of the game's own code: **unverified** (the repository contains no LICENSE file).

## Voices (js/voices.js)

Formant-synthesised vocal sounds: a sawtooth buzz through three band-pass formants plus breath noise. No recordings and no text-to-speech voices are bundled. The optional "Grunts + spoken" setting uses the browser's own `speechSynthesis` (through the game's `speakLine` in js/upgrades.js); those voices belong to the player's device and are never shipped.

| Voice set | Profiles | Style | Status |
|---|---|---|---|
| NPCs (every key of `NPCS`, plus the generic Hollow) | 31 people; the _wg and _dw versions share a person | human, gravel (Kaelen, Hob), brass (Herald), breathy (Hollows, Mourner), chord (Aegis), cat | procedural stand-in |
| Enemies (every key of `ENEMIES`) | 26 families | brass (Legion, Office), beast (hound, Brood-Mother, weaverling), swarm (mites), golem, multi (Wearer, Weaver, Requiem, Dirge), breathy (Drowned, Deacon), chord (Aegis) | procedural stand-in |
| Silent | the Quiet, Hush-moths, the Tongueless, the Hushwarden (marked mute), and Lyra when her slate flags say she has no voice | none | by design |

## Images (img/)

None of these has a recorded author, tool or licence in the repository. How they were produced is **unverified**.

| Group | Files | Status |
|---|---|---|
| Screens and paintings | `ending.jpg`, `title.jpg` | unverified |
| Maps | `map.jpg`, `map_continent.jpg`, `map_reach.jpg`, `map_woods.jpg` | unverified |
| Creation faces | `face_1.jpg`, `face_2.jpg`, `face_3.jpg`, `face_4.jpg`, `face_5.jpg`, `face_6.jpg` | unverified |
| Dialogue portraits | `p_aegis.jpg`, `p_aldric.jpg`, `p_bettany.jpg`, `p_flambeau.jpg`, `p_halder.jpg`, `p_harrow.jpg`, `p_herald.jpg`, `p_hetty.jpg`, `p_hob.jpg`, `p_kaelen.jpg`, `p_lyra.jpg`, `p_mags.jpg`, `p_nell.jpg`, `p_orla.jpg`, `p_pim.jpg`, `p_proctor.jpg`, `p_quist.jpg`, `p_rooke.jpg`, `p_sable.jpg`, `p_tam.jpg`, `p_tobiah.jpg`, `p_tongueless.jpg`, `p_townsman.jpg`, `p_townswoman.jpg`, `p_vane.jpg`, `p_vosk.jpg`, `p_wren.jpg` | unverified |

Total 39 files, 1478 KB.

## Embedded art (js/assets.js)

One 2.4 MB JavaScript file of base64 PNGs: `tex` (19 wall and floor textures), `spr` (193 sprites for creatures, people and props), `fp` (11 first-person weapons) and `meta` (110 entries for directional views and similar). Author, tool and licence **not recorded: unverified**. Side and back views, flinches, death poses and similar variants are derived from these sprites at run time.

## Procedural stand-ins by module

All drawn or generated by the game's own code at run time; they ship no files. Each is a placeholder for painted art.

| Module | What it makes |
|---|---|
| js/directions.js, enemy-fx.js, creature-life.js, telegraphs.js | enemy side and back views, flinches, startles, strides, casting tells |
| js/fp-hands.js, fp-feel.js | first-person hands, head bob, landing dip, hit shake |
| js/sky.js, weather.js, post.js, lighting.js, water.js | sky, stars, panoramas, weather, fog, bloom, light, reflections |
| js/ceilings.js, decals.js, scenery.js, flora.js, windbells.js, firesmoke.js, gates.js, doors.js, smalllife.js | ceilings, wall decals, props, grass, banners, fire and smoke, gates, doors, crows, rats, the cat |
| js/companions.js, townsfolk.js | companion and townsfolk motion on existing sprites |
| js/frames.js, icons.js, portraits.js, logmap.js, screens.js | carved frames and brass corners, item icons and paper doll, mood portraits, logbook sketches and automap stamps, loading, death and ending pictures |
| js/reading.js, rumours.js, couriers.js, dreams.js, tobin.js, epilogue.js | held books, Gazette pages, letters, dream and memory-echo pictures |
| js/voices.js | vocal grunts and greetings (audio) |

## Screenshots (screenshots/)

85 README images (JPG, PNG, GIF) captured from the game itself. The game does not load them. Status: own capture.

## Maintaining this file

When an asset is added, add a row with its source, author and licence. If any of these is unknown, write *unverified* rather than guessing. `test/voices.test.js` fails if a font, a music file or an image in the folders above is missing from this file.
