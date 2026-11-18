# Phase 97: reading aloud, the compass, the map's places, Oakhaven's houses (for review)

*Written 17 Nov 2026. Four things the owner asked for on 17 Nov, built beside the White Mile. Code: `js/reader97.js`, `js/compass97.js`, `js/places97.js`, `js/eaves78.js`, `js/r3d21.js`, `js/maps.js`, `js/voices.js`. Tests: `test/reader97.test.js` (27 checks), `test/compass97.test.js` (10), `test/places97.test.js` (17), `test/eaves78.test.js` (78). French: `tools/i18n/p97-reader.tsv`. None of this adds to the story; the only new in-game words are the reader's own and the map's labels, listed at the end.*

## 1. Everything read aloud

The owner: "I need all the lines properly voiced, my brother cant read so he needs everything read to him."

- **What it does.** With "Read everything aloud" on, the game speaks every piece of text as it appears: messages, the hint line, what a person says (announced as "Brenna Corliss says:"), an event and its numbered choices, panels and menus, the button under the pointer or the keyboard focus, and the title and options screens.
- **Keys.** F2 turns it on and off. F3 (or `[`) says the last thing again. F4 (or `]`) reads the whole screen; in play that is where you are, your health, the hour, which way you face, the hint, and where the nearest quest marker lies. Esc stops the voice.
- **Where to turn it on.** A switch in the corner of the title screen ("Read aloud: On / Off"), and a row in Options. It is remembered on the device.
- **Whose voice.** The device's own speaking voice (the browser's), in the game's language, with a different pitch for each speaker. A line that already has a recorded voice plays the recording and is not read twice.
- **What it is not.** It is not a recorded cast. The game has 491 recorded lines (12 MB). It has about 9,800 story lines. See question 1.
- **Also fixed:** the people and foes of the Heights (Phases 92 to 97) had no voice of their own for grunts and greetings; they have now.

## 2. The compass points to quest and side-quest markers

The owner: "I also want the compass to point to any quest or sidequest markers".

- A **gold diamond** on the compass strip is a quest marker; a **pale blue disc** is a side-quest marker. When the marker is behind you, a small arrow shows at that end of the strip.
- When the nearest marker is on another map, a **diamond with a dark centre** points at the door that leads toward it (up to six doors away; locked doors are not counted).
- It follows the same markers the map shows, and the same Options switch ("Map Objective Markers") turns both off.
- **What it points at:** the people who have a quest or side quest for you. See question 3.

## 3. Places you read or hear of go on the map

The owner: "when I read or hear of a place of interest I want them to show up on the map with a special mini marker that signifies what kind of location it is".

- When a person, a notice, a letter, a sign or a message names a place, that place is marked on its map, and a line says so ("The Greenhall is on your map now." or "... is marked on the map of Oakhaven."). Asking a person the way does the same.
- Each mark is a small picture of its kind: an inn, a healer, a chapel, a hall, a gate, a works, a store, a shop, a house, a mooring, a way down, water, a market, a school, a tower, or a plain place.
- Under the map is a list, "Marked on this map:", so the marks can be read (and read aloud).
- A full name is caught wherever you are. A plain word ("the chapel", "the mill") is only taken to mean the one in the town you are standing in.
- Quest and side-quest markers are drawn on the same map in the compass's colours.

## 4. Oakhaven's houses

The owner: "the houses for oakhaven are a bit small like the front doors are too small and the roofs are to low."

- The ground storey is higher (a third of a person more), the upper storey taller, and the ridges higher (a one-storey house's ridge is now three people high and a two-storey house's nearly three and a half).
- Front doors stand a quarter taller than a person, in a timber case with posts, a head and a stone step, in four kinds: oak, tarred, painted green-grey, and the hall's studded dark oak.
- The chapel tower and the mooring mast were raised so they still stand over the roofs.
- The Hollow's houses were raised a little less. No other town was changed. See question 4.
- This is in the 3D view. The classic view draws walls one height and is unchanged but for the tower and the mast.

## For the owner

1. **Recorded voices for every line, or the device's voice?** Recording all 9,800 lines the way the 491 were made would take the download from 12 MB to about 250 MB, and every later text change would need its line made again. The reader built here speaks everything today, in English and French, at no size. *Recommend: keep the reader for everything, and record more of the lines that matter most (the main story's speakers) in batches, as a job of its own.*
2. **The reader's keys** (F2, F3 or `[`, F4 or `]`). *Recommend: keep; tell me if your brother's keyboard or controller needs others.*
3. **The compass points at people with quests, not at each step of a quest.** Quests here are logbook text, not tracked steps, so there is no "next step" to point at yet. Giving every quest a place for each step is a real piece of work across all the quests. *Recommend: decide after you have played with the markers.* **Ruled 18 Nov: "the compass is good." It stays as built; no quest steps.**
4. **Shall the other towns' houses be raised the same way?** Only Oakhaven and the Hollow were changed. *Recommend: yes, town by town with a picture each, since each style has its own proportions.*

## The new words

Reading aloud: "Reading aloud is on. F3 says the last thing again. F4 reads the whole screen. F2 turns reading off." / "Reading aloud is off." / "You can answer:" / "You can choose:" / "{0} says:" / "Nothing to say again yet." / "You are in {0}." / "Health {0} of {1}." / "It is {0}." / "You are facing {0}." / "Read everything aloud" / "for a player who cannot read: F3 or [ says it again, F4 or ] reads the screen, F2 on or off" / "Read aloud: On" / "Read aloud: Off" / the eight compass points.

The compass, spoken: "A quest marker is {0}, about {1} paces." / "A side-quest marker is {0}, about {1} paces." / "The way to the nearest quest marker is {0}, about {1} paces, through {2}." / "No quest markers are in reach." / "A quest marker is right beside you." / "A side-quest marker is right beside you." / "ahead", "ahead and to the left", "ahead and to the right", "to your left", "to your right", "behind you" / "a door".

The map: "{0} is on your map now." / "{0} is marked on the map of {1}." / "Marked on this map:" / "Nothing is marked on this map yet. Places you read or hear of are marked here." / "a quest marker", "a side-quest marker", "the way to the nearest quest marker" / the sixteen kinds named above.
