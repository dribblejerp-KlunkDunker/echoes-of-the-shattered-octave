# Phase 20 and Phase 21 — Author Rulings

*Ruled by sleeves, 22 Oct 2026. These answer the [PROPOSED] items in
`Phase 20 - New In-Game Text.md` and `Phase 21 - New In-Game Text.md`. Those two files stay as
they came from the Project; this file is what was decided about them. Item numbers match theirs.*

Where a ruling here and a phase doc disagree, the ruling wins.

---

## Two rulings that grow the game

### The Watch Downs become a region (Phase 20, item 1)

**Kept, and promoted.** sleeves: "a whole new region would be amazing." The Downs are no longer
a one-map walk-and-look; they are the first map of a new region west of the clearing. All the
invented features stand as canon: the Long Down and its beacon cairn, Hedge Knoll, the Scar, the
sheepfold, the dew-pond, the boundary stones, the hawthorns, and the finger-post that reads
SHEEP-WALK.

**Still open:** where the sheep went. It was not ruled on. Leave "There are no sheep" unexplained
until it is; do not answer it in a new map or a new line.

### The panorama becomes reachable (Phase 20, item 6)

**Kept, and promoted.** sleeves: "make the panorama something that can be reached and
explored." What is painted on the skyline today is to become places a player can walk to:

- the snapped iron pylon outside the Hedge
- the standing-stone ring outside the Hedge
- the broken tower stump in the Deep Woods
- Greenroot's chapel spire on the north-east skyline from Oakhaven
- the farmsteads, barns and orchards round Oakhaven
- the broken colonnade and marble spires round Whisper-Grove

This settles the question the phase doc left hanging: the pylon and the stone ring are canon.

**A constraint to design around.** `js/horizon20.js` states that Oakhaven's walls stay walls
because the Hedge beyond them is a story boundary: "the country there is shown … but never made
walkable." Making the panorama reachable reverses that rule. It does not lift the story gate. Any
new route to these places has to respect the Hedge. Two ways to do that: reach them from the Downs,
which are already outside the Hedge, or open them only after the point in the story where the
Hedge is passed. The route is not decided yet. Whichever team builds it should bring a proposal
before writing any maps.

---

## Confirmed as proposed

### Phase 20

| # | Item | Ruling |
|---|---|---|
| 2 | The beacon's view (Grey Teeth north; Oakhaven and the open belfry south-east) | Kept. See the note under "Checked", below. |
| 3 | The glass-fire lamp drawn in the tower's south opening once `rite_ready` is set | Kept. |
| 4 | The belfry: two round-headed openings a face, stone arches, moulded cornice, oak frame pegged on a plinth, **no bell ever drawn** | Kept. |
| 5 | The Drift-Kestrel in flight: two red pennants, lit stern windows, brass lift-tank | Kept. |
| 7 | Item icon looks | Kept. **The six Chapel letters' colours are confirmed** ("they match"): Lyra green; Kaelen blue-grey with black string; Hetty red; Orla brown with twine; Pim grey with a wool tie; Dessa violet with a blue ribbon. |
| 8 | The Whisper-Grove cat as a grey tabby, side-on | Kept. |
| 9 | Rear and side views of the 25 species; A Quiet as an absence with smoke, so the Hush is never shown | Kept. |
| 10 | Mood portraits and companion frames | Nothing to rule on. |
| §2 | The Downs borrow the Hedge's area-card picture | Kept for now. Once the Downs are a region they will want a card of their own. |
| §3 | PAINTER (branch `p20-painter`): all death pictures, the shared-picture mapping, the Port Cantabile and Cay cards, the open-door card | Kept, including the Tongueless and the Hush-Moths sharing the Quiet picture, and the Hollows' far figures. Cleared to merge on story grounds. |

### Phase 21

| # | Item | Ruling |
|---|---|---|
| 1 | The band of star-dust across the night sky | **Kept, and the name is kept: it is the Chord.** The name now lives only in code comments; it is canon all the same. If any player-facing text ever names it, use "the Chord". |
| 2 | Sun and moon on real arcs; the moon shows the calendar's phase | Kept. |
| 3 | The Octave lights reaching straight overhead | Kept. |
| 4 | The Synod Kite Shield's dead queen: a crowned ivory head in profile on oxblood, in a bevelled brass rim | Kept. It agrees with Phase 20 item 7. |
| 5 | Gear looks: Corsair Buckler, Carillon Bell-Helm (no face shows through the slit from any angle), Consortium Brigandine, Vesper's Boarding Axe, the Throwing Knives as a fan of three | Kept. |
| 6 | The glass arm climbs on the character card: hand first, forearm from 15%, whole arm from 40% | **Kept. The thresholds are confirmed as canon** ("the glassing thresholds are fine"). |
| 7 | Bare-armed travellers in a shirt of the calling's coat colour, sleeves rolled | Kept. |
| 8 | Card headwear following the portraits: faces 1 and 4 hooded, face 3 in a captain's cap | Kept. |
| 9 | The card's dark niche, tinted by the calling's cloak, with a worn plinth | Kept. |
| 10 | Close-up ground detail at 4× | Kept. |

---

## Checked: the Hedge Knoll line

The question (Phase 20, §2): the knoll's text never changes — "Nothing hangs in the tower. You can
see daylight through the frame." — but after `rite_ready` the lamp is drawn in the tower. Does the
line need a condition?

**No. The line is correct as written, before and after the Rite.**

Why: the lamp is only painted on the tower's **south** face, the opening over the Chapel door that
looks down on the square (`belfryTexel` in `js/horizon20.js` uses the lamp art only when
`face === 'S'`). Hedge Knoll stands north-west of the tower: in Oakhaven's coordinates the knoll
is at about (−2.5, −5.9) and the tower at (48–50, 5–7), 53 units away on a bearing of 13°. From
there you see the tower's north and west faces, which always carry the empty frame.

Measured on 22 Oct 2026 by rendering the view in the browser at commit `b09fd5d`. The test stood
at the knoll's post and on its summit and faced the tower at nine headings across ±14°, by day and
by night, on the Medium, High, Ultra and Cinematic presets. Each view was drawn with `rite_ready`
off and on, and the two frames were compared pixel by pixel.

| From | Belfry drawn on the tower | Pixels the Rite's lamp changes |
|---|---|---|
| Knoll, by its post | 35 px (Medium) to 142 px (High and up) | **0** on every preset, day and night |
| Knoll, summit | 24 px (Medium) to 115 px (High and up) | **0** on every preset, day and night |
| Control: in Oakhaven, south of the tower, facing it | yes | 8 px, 2 of them glowing |

The control shows the measurement catches the lamp where it should be seen. From the knoll you see
the belfry and its empty frame against the daylight, and the lamp never shows. The text and the
picture agree.

### Found while checking: the beacon's view on Medium

The beacon cairn's text says that from the Long Down you can see, south-east, "the Chapel's
bell-tower, its belfry open to the weather". The beacon is 77 units from the tower. The far view
draws the town out to 3.2 fog lengths, which on the Downs at Medium is about 70 units. So on
**Medium**, Oakhaven's roofs show from the beacon (about 1,100 px) but **the belfry is not drawn
at all** (0 px). On High, Ultra and Cinematic it is drawn (66–72 px).

This is not a story problem and nothing was changed. It is a small mismatch between a line and a
preset. Either let the far view reach a little further on the Downs, or accept that on Medium the
belfry is too far to make out. It is the renderer team's call. Note that the regional work above
will add more long sight-lines like this one.

---

## Not ruled on: housekeeping

These were flagged in Phase 20 §2 but are fixes, not canon, and no change was asked for. They stay
open:

- The notice "Graphics eased to … to keep the game smooth — Options to change"
  (`js/max20.js`) has no French. English-only, or write the line.
- `TX.wall` in `js/horizon20.js` is defined but never shown, and has no French. It is safe to delete.
- The "Chapel belfry" Options hint starts with a lower-case "the", while "Country beyond walls"
  starts with a capital.
