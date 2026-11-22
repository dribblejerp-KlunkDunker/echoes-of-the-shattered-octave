# Phase 113b: the deep night sky

## What was asked

The owner, 22 Nov 2026: "at night in locations with little to no light pollution I want the night sky to be lit with
the most beautiful galaxies possible but not over the top. Something to be in awe of."

And, on reading the plan the same day: "Maybe a little over the top is actually ok. As far as the galaxies and
constellations." "I approve of all proposals." "no stars over the rift is good."

## What was built

A switch, Options, Graphics: **Deep night sky** ("the band of star-dust as a river of stars, and far galaxies, where the
night is truly dark"; French "Ciel nocturne profond"). On in Medium, High, Ultra and Cinematic; off in Original and Low.
Off, every picture is as it was before this phase, byte for byte (the test compares against the code before it).

With it on, out in open country on a clear moonless night:

- **The Chord as a river.** A broad band of star-dust along the same great circle the 3D view already drew its pale band
  on, wider and brighter toward its eastern end, where its core sits about 24 degrees up. Dark dust lanes run along it,
  one great lane that wanders and breaks, a branch and a spur across the core, and fine dark filaments. Star-clouds knot
  along it. Silver-blue in the arms, warm cream at the core, nine small rose knots along it, and in the far arms a faint
  teal on one side of the lane and violet on the other. Thousands of faint stars thicken toward it and thin in the lanes.
- **Eight notes** (approved 22 Nov). Eight stars along the Chord a little brighter than their neighbours, each with the
  faintest tint of one of the eight note colours the Octave lights already use, in order: Growth at the western end,
  Decay at the eastern, the Spire of Decay's end.
- **Three far galaxies** (approved 22 Nov), unnamed, in the southern sky away from the Chord: a tilted spiral about eight
  degrees long with a bright small core and a dust lane along it (south by west, 20 degrees up); a small face-on spiral
  (south-east, 22 degrees up); a pair of ragged clouds low in the east-south-east (one of them holds the tenth rose knot).
- **A deeper star field**: many faint stars and few bright, coloured by temperature (most white, some blue-white, a few
  amber), twinkling gently and more near the horizon; the dozen brightest carry a one-pixel cross glint.
- **Shooting stars**: a few in an hour of play, on a fixed schedule (one chance in each fifty seconds of the game's
  animation clock, from a hash, as the Kestrel's flyovers are scheduled), only where the night is truly dark: a short
  dithered streak, its head brightest, no glow of its own.
- It is all drawn in the game's pixel-art hand: one map texel to one logical pixel, the same 4 x 4 ordered dither in both
  views, light added in steps of 4 of 255. No bloom of its own, no lens flare, no painted nebula.

Both views show the same sky: one map is built once, in code (hashed noise, no random numbers), a few rows a frame, and
the classic view and the 3D view both read it.

## How dark is here (darkness, 0 a lit street to 1 the open wild) [PROPOSED]

- the night, cloud and haze, as the stars have always had them;
- the moon: its phase and how high it stands (a full moon high takes away about a third);
- the lamps and fires near you (the engine's own list of lights: lamps, campfires, hearths, Light-glass), counted out to
  thirty paces, so walking out of a lit place the sky deepens over about thirty paces;
- the kind of place: a short table (Oakhaven, Whisper-Grove's city and its Bell-Yard, Port Cantabile's harbour are cities
  with lit streets; the clearing, the Cay and the Hollow are hamlets); every town js/towns108.js knows is a town;
- indoors, underground, a place lit by its own light (the Bleach, the Rift) and the Rift itself: 0.

Below about 0.35 the old sky; from 0.35 to 0.75 the river comes up (softly, its lanes half drawn); above 0.75 the dust
lanes, the star grain, the far galaxies and the shooting stars.

## Canon this stands on

- **The Chord.** `story/Game Layer/Phase 20-21 - Author Rulings.md`, line 121: "Kept, and the name is kept: it is the
  Chord. The name now lives only in code comments; it is canon all the same." The 3D view's band is `js/light21.js`'s
  `bandN = normalize(vec3(0.35, 0.82, 0.45))`; the river lies along that same great circle. No player-facing text names it.
- **Over the Rift the night is black and starless.** Book Three: "under no stars" (`story/Books/Book Three/Part One Ch1-4.md`, line 983); "the sky over
  the Rift, which was black and starless" (`Part Two Ch5-8.md`, line 143); "Black and starless." (the same, line 273). On the Rift's maps
  (ids beginning `p100_` and `p113_`) no star of any kind is drawn, switch on or off. Confirmed by the owner, 22 Nov.
  Before this phase the Rift's sky was Phase 100's own grey ("grey from above, the same at every hour"): the classic view
  drew no stars there, and the 3D view worked its stars and pale band out but they could not show against the grey. Now
  the rule is the code's, not the grey's.
- **The Spire of Decay's quarter.** Book One (`story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md`, line 5848): "Through the willow-tops the stars were out, and
  the Spire of Decay's end of the sky had that faint wrongness to it that everybody had stopped mentioning." The game's
  painted continent (`js/travel.js`, the realms' places on `img/map_continent.jpg`) has the Rift, where the Gate of Decay
  was drilled, due east of the Reach. On the Reach's maps (the places on the Reach's chart, `js/bearings82b.js`) a patch
  of sky twenty degrees wide and fifteen high, low in the east, holds its stars perfectly still and its star-dust a shade
  greyer. With the switch on only. Nothing more.
- Stars are out on clear nights elsewhere in the books ("black against the stars", "pale as teeth under the stars").
- No book names a galaxy; none is named. No player-facing line about the sky but the Options row.

## Where the design and the sky disagreed

The design asked for the Chord's core "well above the horizon in the south-east". The Chord's great circle is canon, and
its south-eastern half is under the horizon: it comes up out of the horizon about 23 degrees north of east, stands
highest (63 degrees) in the north-west and goes down 23 degrees south of west. The core is placed at the nearest honest
point, low in the east-north-east end (bearing 36 degrees north of east, 24 degrees up), so the river rises out of the
eastern horizon, past the Spire of Decay's quarter, and climbs away over the north.

## For the stones

The owner wants named constellations with lore and standing stones that sight them. The sky's side is built now:

- The table arrives later as `window.STARLORE113 = { cons: [ { id, stars: [ { az, el, mag, hue } ], lines: [[i, j]] } ],
  wanderers: [ { id, az, el, mag, hue } ] }` (az radians in the game's sense, 0 east; el radians up; mag 0 to 1; hue
  [r, g, b] or null). Read with a guard: none, or a broken one, changes nothing. Replace the object to change it.
- Each star of a constellation is laid into the deep-sky map as a real star in both views, at its place, a little
  brighter and steadier than the field; no lines in the sky. A wanderer is a steady small disc that does not twinkle.
  They obey darkness, cloud, the moon and the Rift like every star: the bright ones stay in a lit town, the faint ones
  need the dark. They are drawn with the switch on.
- `DEEPSKY113.dirOf(id)`: { az, el } of the middle of a constellation or a wanderer, or null.
- `DEEPSKY113.visible(id)`: 0 to 1, how well it can be seen from where the player stands now (0 by day, indoors, on the
  Rift, under cloud, below the horizon).
- `DEEPSKY113.drawChart(ctx, id, x, y, w, h, opts)`: the zoomed picture through a stone: the same deep-sky map behind,
  the same field stars with a finer grain hashed from the sky itself, the figure's stars large with soft glints, its lines
  drawn in as a dotted pale gold (opts.lines 0 to 1 fades them in as a dither), framed with a margin in the stone's dark
  round sight. Deterministic. The first call builds the map if it is not built yet (about half a second).

## What was measured

- The map: 1536 x 384, built in about 230 slices of at most a few milliseconds (about half a second in all), the same
  every time; no random number drawn while it is built or drawn.
- On the map: the Chord's core 0.31 of white at most, the band's average 0.08, a far galaxy's core 0.18 at most (the
  owner's raised limits: about 0.32, 0.16 and 0.18).
- darkness: open country on a clear moonless night 1.0; an Oakhaven street at the same hour 0.21; a full moon high 0.68.
- The classic view's cost at 1x: about 0.9 ms a frame (median, on a shared machine under load); the 3D view, one texture
  read a sky pixel.

Files: `js/deepsky113.js` (all of it), small edits in `js/light21.js` (one sampler and two numbers in the sky shader, the
Rift's starless rule, the Spire's still stars), `js/sky.js` (the Rift's starless rule, the Spire's still stars),
`js/presets.js` (off in Low). Test: `test/deepsky113.test.js`.
