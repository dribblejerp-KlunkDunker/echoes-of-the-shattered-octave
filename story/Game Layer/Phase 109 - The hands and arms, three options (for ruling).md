# Phase 109: the hands and arms, three options (for ruling)

The owner, 18 November 2026: "when its an opportune time the hands and arms need a massive overhaul as well", with options shown before anything replaces what is there, and "ill let opus do it for now and then use fable later on to do any touch ups". On 20 November he set the bar: "Whatever is technically the best visuals should be the benchmark everywhere." Then, 21 November: "proceed with the next step".

**Nothing in the game has changed.** Three teams each built one complete option, drawn in code like everything else. Each was built in the same four poses as today's hands, over the same frame of Oakhaven's street, so they can be compared side by side. The game still uses today's hands (Phase 98) until the owner chooses.

Pictures:
- `screenshots/p109-options.jpg`: today and the three options, in four rows (a blade in hand, the bare fist, the glass arm, open hands for a Song).
- `screenshots/p109-sculpted-night.jpg`: option 1 at night.

## The three options

### 1. Sculpted, lit by the world (`tools/hands109/hands109s.js`)
Real 3D hands and arms built in code (palm, three-jointed fingers, thumb, wrist, forearm, cuff, sleeve) and drawn by their own small 3D renderer.
- **Good:**
  - It is the only option the world lights: by day the sun, at night a lamp warms the hands and the glass catches it.
  - The Song's light really lights the inner edges of the fingers.
  - Leather, mail, steel and glass read as themselves.
  - Poses are joint angles, so the fingers can move: a grip can tighten and the hands can open for a Song.
- **Weak:** the bare fist still reads more like a pinch than a fist from the palm side. Nothing casts a shadow onto the blade.
- **Cost:** about 150 ms to draw one pose on the build machine's software graphics (far less on a real graphics card).
- **To put in the game:** a grip for each weapon, the swings and the climb as moving joints, the game's light fed in each frame. About two to three phases.

### 2. Painted (`tools/hands109/hands109p.js`)
The same kind of posed forms, painted pixel by pixel in code: light, half-tone and shadow, light thrown back from the street, rim light, then brush strokes along the forms.
- **Good:** the most lifelike skin of the three; the fists and the grip read at a glance; the glass is the approved planes.
- **Weak:**
  - The gloved fingers look a little knobbly up close.
  - It is the slowest (about 200 ms a pose, 60 MB of working memory), so every movement would have to be painted ahead of time.
  - It does not change at night.
- **To put in the game:** a grip for each weapon; every swing, the Song and the climb painted ahead as frames.

### 3. Pixel art (`tools/hands109/hands109x.js`)
The same kind of model, drawn at a third of the size in crisp pixel art (small colour ramps, outlines on the shadow side, a little dithering on the sleeve) and scaled up.
- **Good:**
  - It sits naturally in the game's pixel look and matches the walls and the people.
  - It is by far the fastest (11 to 26 ms a pose), so the hands could be drawn fresh every frame and every swing.
  - The anatomy reads clearly.
- **Weak:**
  - The palm and thumb pad are broad flat areas.
  - The glove's wear spots are a little blotchy.
  - It does not change at night (it could take the light's colour later).
- **To put in the game:** a grip for each weapon and the swing poses as numbers. The least work of the three.

All three keep the glass arm on the **left**, as in the books ("a man with a glass arm"; "the edge of the glass came up along the bone"). They also keep the look approved on 14 November: deep azure planes, dark seams, a few bright edges, a bright rim, about a quarter of its old glow. At rest it does not blaze green; the books keep that for when it drinks a blow.

## For the owner

1. **Which one?** *Recommend: option 1, sculpted, for the 3D view.* It is the only one the world's light reaches, the only one whose fingers can truly move, and the closest to "technically the best visuals". Its bare fist would be fixed first. Then *option 3, pixel art, for the classic view*, where the old pixel look is the point. Both are built from posed joints, so one set of poses could drive both. Option 2 is the loveliest still picture, but it is the slowest and cannot move or change with the light.
2. **Anything in your choice you want changed before it goes in?** For example the glass's colour or the glove's leather.

## Verification
- Each option has its own test: `test/hands109s.test.js` (8 checks), `test/hands109p.test.js` (8), `test/hands109x.test.js` (7). Each checks:
  - every pose draws in the right place;
  - the same call gives the same picture every time;
  - no random numbers;
  - leather, bare skin and mail each draw differently;
  - drawing time;
  - no page errors.
- All three pass on the phase branch.
- The review sheet is made by `tools/dev/hands109.js`, which takes the backgrounds from the game itself (Oakhaven by day and by night) and today's hands from the game as it is.
