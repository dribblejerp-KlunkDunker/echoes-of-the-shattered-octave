# Phase 108: every town raised (for review)

The owner, 17 November 2026, of Oakhaven: "the houses for oakhaven are a bit small like the front doors are too small and the roofs are to low." Phase 97 raised Oakhaven and the Hollow and asked (question 4): "Shall the other towns' houses be raised the same way?" The owner, 18 November: **"yes every town should have raised houses"**. Then, 21 November: "proceed".

**Nothing was added to the world.** This is how the houses are drawn in the 3D view. The maps (walls, doors, what you can walk through) are untouched, and the classic view draws the old boxes, as it does for Oakhaven.

## What was done

Every house with a roof in the ten other towns now stands as Oakhaven's do (`js/towns108.js`):
- **Taller ground storey:** a band of the house's own wall is carried up over the map's ring, which is one person high.
- **Taller doors:** each front door stands a quarter taller than a person, in a timber or stone door-case with a head and a step. These are Phase 97's four leaves: oak, tarred, green-grey paint, and the halls' studded dark oak.
- **Everything above goes up too:** the upper storey and its windows, the roof and ridge, and the porches, hoists and bell-cotes. Ground-floor windows stay where they were.

Each town keeps its own proportions:

| Town | Ground storey taller by | Door | Why [PROPOSED] |
| --- | --- | --- | --- |
| Oakhaven (Phase 97) | 0.38 | 1.24 | the owner's own ruling |
| Greenroot | 0.38 | 1.24 | the Reach's timber, as Oakhaven |
| the Low Rings | 0.38 | 1.24 | Oakhaven's own timber and plaster, as the water left it |
| Port Cantabile (the quay) | 0.40 | 1.26 | a port of stone and lime-wash, quay houses with lofts over |
| Whisper-Grove, the Bell Yard and Ashlane | 0.45 | 1.30 | a marble city: the tallest doors in the Reach |
| the Malting's yard | 0.40 | 1.26 | a long brick range |
| Wethercombe | 0.32 | 1.20 | low flint cottages under deep thatch |
| Outside the Hedge (Kaelen's hut) | 0.30 | 1.20 | as the Hollow's cottages |
| Stillwater Landing | 0.30 | 1.20 | tarred board on the water, low against the wind |
| Driftwood Cay | 0.30 | 1.20 | one cottage roped down against the wind |

A barn, shed or store rises a little less, by Oakhaven's own rule (barn, shed, store, granary, washhouse); a home does not, whatever it is built of. 44 houses were raised in all.

**Not raised, each for a reason:**
- **Greenroot's chapel:** its spire must stand over the roofs. Its tower is 4 high and the highest raised ridge is 2.83.
- **The painted fronts up Port Cantabile's Salt Stair:** they are built against the stair, with no door of their own.
- **The counting-house:** it already stands well over its ring.
- **Wethercombe's barn, inn and farmhouse:** they already stand 1.1 to 1.3 high from Phase 22's own builder; the shut-up cottage was raised to match them.
- **The quarry headframe** Outside the Hedge.

Picture: `screenshots/p108-towns.jpg` (before on the left, after on the right: Greenroot, the quay, Whisper-Grove, the Malting).

How: each town's own planner (`js/eaves78.js`, `js/eaves82.js`) plans its houses as before; a new hook (`EAVES78.POST`) then raises them. Port Cantabile's quay houses and the Malting now record their doors (`ring0`) so the door-cases know where to go.

## For the owner

1. **The later places are not built as houses with roofs.** Sun-Peak Vigil is one tall stone wall with doors cut in it, the Rift's Null-Watch is blockwork, and Cross Pool is jetties on the water. Raising them would mean designing their buildings' roofs from the books first. *Recommend: leave them as they are for now, and give each its own roofs when its region is next built on (the Heights and the Rift are both still being built).*
2. **The proportions per town** (the table above) are mine. *Recommend: look at the picture; tell me any town that should be taller or lower.*

## Verification
- New: `test/towns108.test.js` (5 checks), covering:
  - each town's raised count;
  - each house's shape against its town's table;
  - every window either in the map's own wall or above the band;
  - a reason for everything not raised, and towers over every roof;
  - every raised door's leaf;
  - the maps untouched, and Oakhaven and the Hollow as Phase 97 left them.
- Also run: the eaves, places and town suites, the 3D renderer, light, the visual sweep, presets, offline cache, French (listed in the pull request).
