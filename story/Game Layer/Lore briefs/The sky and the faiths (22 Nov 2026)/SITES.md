# Standing stones: where they can stand (site survey, 22 Nov 2026)

Read-only survey of the repo at `/home/claude/echoes-of-the-shattered-octave` (nothing in it was changed). Every cell, height, wall and entity below was read from the game's own map objects, not from the prose docs. Coordinates are cells, as the maps use them: x grows east, y grows SOUTH, (0,0) is the north-west corner, and an entity at (21.5,15.5) stands in the middle of cell (21,15).

## 0. How to read the directions

- **Angle.** The game uses `atan2(y, x)`: 0 degrees is east (+x), and the angle grows toward +y, which is SOUTH. So north is -90, east 0, south 90, west 180 (or -180). Turning clockwise on a map with north up is increasing angle.
- **Compass bearing** (clockwise from north, what the HUD calls heading) is the game angle plus 90. Code: `heading = Engine.cam.dir + Math.PI / 2` (js/game.js, compass strip). N = -90, NNE = -67.5, NE = -45, ENE = -22.5, E = 0, ESE = 22.5, SE = 45, SSE = 67.5, S = 90, SSW = 112.5, SW = 135, WSW = 157.5, W = 180, WNW = -157.5, NW = -135, NNW = -112.5 (game degrees).
- **Open wind.** For each of the sixteen winds I cast three rays (the wind and 8 degrees either side) and call the wind open when all three run 12 cells or more before meeting a solid wall cell, a tree/building/stone entity that blocks walking, or the map edge. Knee-high walls (a cell `top` under 0.5) and water do not stop a ray. "Closed: NE 6" means the shortest of the three ran 6 cells. A closed figure of 12 means just under 12.

## 1. How the survey was made

1. `index.html` lists 226 scripts. I ran them in order inside a Node `vm` with stubbed browser globals, then called the game's own `buildAllMaps()` (every module wraps it to add its maps). That gives 101 maps; 36 are flagged `outdoor: true`.
2. For each cell I read `GameMap.cells` (a cell object is a wall, a door or a low block with `top`), `floorCells` and `floorTextures` (water is index 2 and blocks walking), and `groundAt(x,y)` / `gradeAt(x,y)` for height. `entities` gave every deco, npc, enemy and item. Solid entities count as obstacles (radius at least 0.4).
3. Reachability: a flood from each door-arrival point and the map's spawn, 8-neighbour, using the game's rules (js/engine.js: `STEP_UP = 0.36`, `MAX_GRADE = 1.1`; js/game.js `solidAt`). Every site listed can be walked to. "Steps" is that walking distance from the nearest door.
4. "On a path": distance to the nearest cell whose floor is a road, track, cobble, plank, flag or ledge texture. "Detour" in my working was the extra walking if the route between two doors went through the cell; the doc quotes the path distance instead.
5. "Dark": the map's `ambient` (extra light at night; 0 means none), its fog colour, and the nearest entity with a `glow` or a lamp, hearth, brazier, torch, lantern, campfire or fire sprite. Stars are drawn only where `map.outdoor` is true (js/sky.js `drawStars`: `if (!F.outdoor ...) return`).

## 2. Every outdoor map

"Outdoor" means `map.outdoor === true`, the flag that turns the sky and stars on. Thirty-six maps have it; the list below is all of them. Sizes are in cells. Region names follow js/travel.js (the Reach, the Spectral Woods, Dawning Heights, and so on) and the module headers.

- `oakhaven`: **Oakhaven**, 70 by 64. The Reach. TOWN, lit streets (lamps, hearths, hush-lamps); hedge-walled. Ambient 0, music `town`, danger 0. How to get there: The starting town. Doors to every Oakhaven interior; North Gate (23,0) to the clearing needs flag `gate_open`; south-east gate (69,51) to the Flume Road.
- `clearing`: **Outside the Hedge**, 40 by 36. The Reach. Open country (hedge-walled field, hounds and proctors, a hill 1.2 high with the Watch-stone). Ambient 0, music `wild`, danger 1. How to get there: From the North Gate. Exits: hurdle (0,22) to the Watch Downs; gap (39,26) to the standing-stones; east hedge (39,33) to the Greenroot Road, needs flag `p9p_known`; the quarry.
- `p20_downs`: **The Watch Downs**, 44 by 38. The Reach (Sheep-Walk). Open downland, no foes, no lights. Ambient 0, music `wild`, danger 0. How to get there: Hurdle in the clearing's west hedge; stile (12,37) down to the Grey Wethers.
- `p47_stones`: **The standing-stones**, 34 by 30. The Reach. Open ground with the existing Weekstones ring. Ambient 0, music `wild`, danger 1. How to get there: Gap (39,26) in the clearing's east hedge. A dead end.
- `p49_meadow`: **The water-meadow**, 34 by 22. The Reach. Open meadow (ambient 0.2). Ambient 0.2, music `wild`, danger 2. How to get there: Only by the tannery-culvert scene on Massday night (js/meadow49.js); back door (0,11) is locked until flag `p49_back`.
- `p22_combe`: **Wethercombe**, 60 by 60. The Reach (Sheep-Walk). Chalk combe, farm country (hamlet scale), hills to 8.0. Ambient 0, music `wild`, danger 1. How to get there: South end of the Hundred Hollows (arrives 34.5,1.6); doors to the Bellwether, the Hursts' farmhouse, the tithe barn and a cottage; gap (14,59) to the Hanger.
- `p22_hanger`: **The Hanger**, 50 by 44. The Reach (Sheep-Walk). Dense beech wood (616 solid trees; no ground with 3 cells clear). Ambient 0, music `wild`, danger 2. How to get there: Gap in the combe's south hedge.
- `p79_road_w`: **The Greenroot Road: the Long Common**, 235 by 134. Greenroot Road (Reach to Greenroot), the Long Common. Road across open common. Ambient 0, music `wild`, danger 1. How to get there: Clearing east hedge (39,33), needs flag `p9p_known`; east end (234,98) to the middle stretch.
- `p79_greenroad`: **The Greenroot Road**, 235 by 134. Greenroot Road, middle stretch (ford, mere, the Narrows). Road across open country. Ambient 0, music `wild`, danger 1. How to get there: West end from the Long Common; east end (234,22) to Greenroot Wood.
- `p79_road_e`: **The Greenroot Road: Greenroot Wood**, 235 by 134. Greenroot Road, Greenroot Wood. Road across wooded country; foes include dirges and hush-moths. Ambient 0, music `wild`, danger 1. How to get there: From the middle stretch; (129,0) to the Deep Grove; the Howe door; east end (234,84) to Greenroot.
- `greenroot`: **Greenroot**, 36 by 28. Greenroot (end of the road). HAMLET, found empty; graves, a charnel stair; some lamps. Ambient 0, music `wild`, danger 1. How to get there: East end of the Greenroot Road.
- `p85_deepgrove`: **The Deep Grove**, 80 by 62. Greenroot Wood. Dense wood (784 trees; no ground with 3 cells clear). Ambient 0, music `grove`, danger 0. How to get there: Gap (129,0) in the north of Greenroot Wood.
- `flume_road`: **The Flume Road**, 64 by 32. The Reach (Flume). Road along the Flume: 64 by 32, hedged, one cell of ground with 3 clear. Ambient 0, music `wild`, danger 1. How to get there: Oakhaven's south-east gate; lane (8,31) down to the Stride.
- `p83_stride`: **The Flume Road: the Stride**, 120 by 180. The Reach (Flume Road). Road across Sallow Bottom; briar-sprites. Ambient 0, music `wild`, danger 1. How to get there: Lane from the Flume Road (arrives 40.5,1.6); (70,179) down to the Pound Stair.
- `p83_poundstair`: **The Flume Road: the Pound Stair**, 96 by 190. The Reach (Flume Road). Road beside sixteen locks, stepping down 7.6 to 0. Ambient 0, music `wild`, danger 1. How to get there: From the Stride; (62,189) down to Stillwater Landing.
- `flume_landing`: **Stillwater Landing**, 34 by 26. The Reach (Flume). TOWN-scale wharf, Stillwater Landing, lit; no ground with 3 clear. Ambient 0, music `town`, danger 0. How to get there: Bottom of the Pound Stair; gangway (0,13) to the Sunk Lanes.
- `p85_sunklanes`: **The Sunk Lanes**, 96 by 36. The Reach (Low Rings). Flooded causeway, boards over water, lit by lamp-posts. Ambient 0, music `grove`, danger 1. How to get there: Gangway from Stillwater Landing.
- `flume_lowrings`: **The Low Rings**, 38 by 30. The Reach (Low Rings). HAMLET, flooded streets; no ground with 3 clear. Ambient 0, music `grove`, danger 1. How to get there: East end of the Sunk Lanes; west (0,13) to Cross Pool.
- `p85_crosspool`: **The Low Rings: Cross Pool**, 72 by 56. The Reach (Low Rings). Flooded market square; boards (floor t_wood) are the only dry ground; lamps. Ambient 0, music `grove`, danger 1. How to get there: West of the Low Rings.
- `p83_wethers`: **The drove road: the Grey Wethers**, 120 by 160. The Reach (Sheep-Walk drove road). Road over open downs; about 105 standing-stone-like grey wethers; far fires. Ambient 0, music `wild`, danger 0. How to get there: Stile from the Watch Downs (arrives 60.5,1.6); (40,159) on to the Hundred Hollows.
- `p83_hollows`: **The drove road: the Hundred Hollows**, 110 by 170. The Reach (Sheep-Walk drove road). Road over downs pitted with hollows; hounds, a woolwight. Ambient 0, music `wild`, danger 1. How to get there: From the Grey Wethers; (56,169) down to Wethercombe; a door from the Antler Galleries.
- `p30_hollow`: **The Hollow**, 30 by 22. The Reach (behind the tannery). TOWN lane, lit; no ground with 3 clear. Ambient 0, music `town`, danger 0. How to get there: The tannery's back door.
- `whispergrove`: **Whisper-Grove — the Sunken Court**, 48 by 48. The Spectral Woods. TOWN, the lit sunken marble court (ambient 0.17, lilac fog); 18 cells with 3 clear, all within 8 of a light. Ambient 0.17, music `grove`, danger 1. How to get there: Part Three (flag `part3`); the Kestrel's ladder; arches to the Bell Yard and the Malting yard.
- `p31_bellyard`: **The Bell Yard and Ashlane**, 34 by 22. The Spectral Woods. TOWN lane, lit; no ground with 3 clear. Ambient 0.17, music `grove`, danger 1. How to get there: Archway (0,29) in Whisper-Grove.
- `p61_yard`: **The Malting: the queue-yard**, 30 by 18. The Spectral Woods. Queue-yard of the Malting, lit; no ground with 3 clear. Ambient 0.2, music `wild`, danger 0. How to get there: Whisper-Grove (32,5), locked until flag `wg_plan`.
- `deepwoods`: **The Deep Woods**, 56 by 56. The Spectral Woods. Open wood and the Kestrel's camp (ambient 0.21); crowded with crew and foes. Ambient 0.21, music `coda`, danger 1. How to get there: Part Four (flag `part4`); a door to the Mausoleum of Chords.
- `p16k_kestrel_deck`: **The Drift-Kestrel, deck**, 60 by 40. The Spectral Woods (a ship). Ship deck in a field of lit mist (ambient 0.42); 5 cells with 3 clear. Ambient 0.42, music `grove`, danger 0. How to get there: The mast-ladder in Whisper-Grove or the hatch at the Deep Woods camp.
- `p50_deck`: **The Drift-Kestrel, at night**, 44 by 24. The Reach (a ship, at night). Ship deck, one night (js/ash50.js); no foes. Ambient 0.22, music `grove`, danger 0. How to get there: The Part Two ending's night aboard.
- `p59_orchard`: **The Conservatory: the reed orchard**, 26 by 20. The Reach. Conservatory reed orchard: reeds in rows (each a use `p59_look` deco); no real open ground. Ambient 0, music `wild`, danger 0. How to get there: East door of the Conservatory Reading Room (Oakhaven).
- `ln17_orchard`: **The Conservatory Orchard**, 30 by 20. The Reach (an EXTRA). Conservatory orchard at dusk; one cell with 3 clear. Ambient 0, music `wild`, danger 0. How to get there: Extras menu only ("The Long Night", js/longnight17.js).
- `cantabile_harbour`: **Port Cantabile**, 96 by 68. Port Cantabile (Tempest Archipelago / Rust Coast), an EXTRA. TOWN, lit cliff harbour (ambient 0.2); 48 cells with 3 clear, all within 20 of a lamp. Ambient 0.2, music `town`, danger 0. How to get there: Extras menu only (js/cantabile17.js); ferry to the Cay.
- `cantabile_cay`: **Driftwood Cay**, 44 by 30. Port Cantabile (an EXTRA). Island: turf, a burying-ground on the spine (z 2.5), the orphan-house. Ambient 0, music `wild`, danger 0. How to get there: Ferry from the harbour (loadMap at 5.2,14.6).
- `p96_vigil`: **Sun-Peak Vigil**, 56 by 48. The Dawning Heights. Monastery yard in snow (ambient 0.3); walled cloister and a 7-deep landing shelf. Ambient 0.3, music `inside`, danger 0. How to get there: No door leads in from another map; "the Kestrel sets you down" (js/vigil96.js). Postern (34,1) to the Chalk Cliffs.
- `p96_cliffs`: **The Chalk Cliffs**, 36 by 150. The Dawning Heights. Cliff ledges down a 36 by 150 face; eight shadow remnants at night (danger 2). Ambient 0.28, music `inside`, danger 2. How to get there: Postern from the Vigil, arrives at the cliff head (18.5,146.5).

Maps with a ceiling-less sky that are NOT flagged outdoor (no stars are drawn in them): `p92_tiers` (Sol-Luminary, the Umbral Tiers, 160 by 226), `p94_anchorage` (80 by 136), `p95_chain` (the Pilgrim Chain, 64 by 266), `p96_blacksquare`, `p97_mile` (the White Mile, 48 by 112, ambient 0.92) and the whole Rift: `p100_wall` (Null-Watch: the Wall, 372 by 133) and `p100_halls`. The Rift is starless by the owner's ruling of 22 Nov ("no stars over the rift is good"), so nothing goes there.

Maps that cannot take a stone (no cell with 3 clear on all sides and 12 open on any wind, or lit town streets): `oakhaven` (75 cells have 3 clear, all within 20 cells of a lamp or hearth), `whispergrove`, `cantabile_harbour`, `flume_landing`, `flume_lowrings`, `p85_sunklanes`, `flume_road`, `p30_hollow`, `p31_bellyard`, `p61_yard`, `greenroot`, `p22_hanger`, `p85_deepgrove`, `p59_orchard`, `ln17_orchard`, `p16k_kestrel_deck`, `p50_deck`.

## 3. The candidate sites, ranked (30)

Ranking weighs: how much of the horizon is open, a rise or headland under it, a path the player will walk, no light near, no marker or foe crowding it. 1 to 16 are the best and most walked; 17 to 25 are good; 26 to 30 are weak or caveated and are there so every region has an entry. Regions covered: the Reach (clearing, Downs, meadow, combe), the Greenroot Road (three maps), the Flume and drove roads (four maps), the Dawning Heights (cliffs, Vigil), the Tempest Archipelago (the Cay, an extra), the Spectral Woods, the Low Rings.

| Rank | Map and cell | Region | What it is |
| --- | --- | --- | --- |
| 1 | `p79_road_e` (84.5, 27.5) | Greenroot Road | highest swell on Greenroot Wood stretch |
| 2 | `p20_downs` (21.5, 15.5) | Reach: Downs | Long Down shoulder, darkest ground in the Reach |
| 3 | `p79_road_w` (84.5, 42.5) | Greenroot Road | Long Common swell on the road |
| 4 | `p22_combe` (9.5, 18.5) | Reach: Wethercombe | Wethercombe west scarp, z 6.1 |
| 5 | `p83_wethers` (61.5, 18.5) | Flume / drove roads | drove track just inside the Grey Wethers |
| 6 | `p79_road_w` (21.5, 69.5) | Greenroot Road | first rise on the Long Common |
| 7 | `p79_greenroad` (42.5, 48.5) | Greenroot Road | rise in the middle stretch |
| 8 | `p20_downs` (30.5, 24.5) | Reach: Downs | mid-Downs level field on the track |
| 9 | `p79_road_w` (162.5, 57.5) | Greenroot Road | Long Common swell, mid-stretch |
| 10 | `p83_poundstair` (24.5, 15.5) | Flume / drove roads | head of the Pound Stair, z 7.6 |
| 11 | `p79_greenroad` (60.5, 66.5) | Greenroot Road | middle-stretch rise |
| 12 | `p83_stride` (39.5, 21.5) | Flume / drove roads | head of the Stride, z 2.4 |
| 13 | `p79_road_w` (201.5, 57.5) | Greenroot Road | east Long Common rise |
| 14 | `p83_wethers` (78.5, 132.5) | Flume / drove roads | south end of the Wethers, z 2.6 |
| 15 | `p79_road_e` (180.5, 105.5) | Greenroot Road | late Greenroot Wood |
| 16 | `p83_hollows` (54.5, 141.5) | Flume / drove roads | drove track, Hundred Hollows |
| 17 | `clearing` (7.5, 30.5) | Reach: clearing | clearing SW knoll |
| 18 | `p49_meadow` (14.5, 12.5) | Reach: meadow | water-meadow centre |
| 19 | `p22_combe` (20.5, 45.5) | Reach: Wethercombe | combe meadow by the Hanger gap |
| 20 | `p20_downs` (10.5, 24.5) | Reach: Downs | rise by the boundary stones |
| 21 | `p79_greenroad` (132.5, 39.5) | Greenroot Road | road above the Leap |
| 22 | `p96_cliffs` (24.5, 65.5) | Dawning Heights | cliff ledge, upper |
| 23 | `p96_cliffs` (24.5, 108.5) | Dawning Heights | cliff ledge, middle |
| 24 | `clearing` (35.5, 12.5) | Reach: clearing | clearing NE field |
| 25 | `p79_greenroad` (210.5, 75.5) | Greenroot Road | east middle-stretch rise |
| 26 | `cantabile_cay` (38.5, 13.5) | Port Cantabile (extra) | Cay east tip (extra) |
| 27 | `cantabile_cay` (19.5, 23.5) | Port Cantabile (extra) | Cay south shore (extra) |
| 28 | `deepwoods` (27.5, 33.5) | Spectral Woods | Deep Woods camp (lit, crowded) |
| 29 | `p85_crosspool` (58.5, 40.5) | Low Rings | Cross Pool boards (lamp at 1.5) |
| 30 | `p96_vigil` (28.5, 25.5) | Dawning Heights | Vigil cloister garth (enclosed) |

Cells with a fraction (.5) are cell centres. Place the stone at exactly that point, or at any point within one cell of it; the checks hold within a cell.

### 1. `p79_road_e` (84.5, 27.5), The Greenroot Road: Greenroot Wood
- Region and kind: Greenroot Wood stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 2.59 (+2.01 above the average of the ring 8 cells out), steepest slope within 3 cells 0.38 (walkers climb up to 1.1).
- Clear space: 11.0 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: W 60 (cells, tested out to 60).
- Walking: 25 cells from worn road or track floor (`t_p79_road`); about 56 steps from the nearest door (The Deep Grove).
- Dark: map ambient 0, music `wild`; nearest light entity p91_lamp 49 cells.
- Nearest existing markers (within 14): none.
- Note: A long swell in the Greenroot Wood stretch, the highest ground for a long way along it (about 2.0 above the plain round it). Grade at most 0.38, so it can be walked up. No marker within 14 cells; the nearest oak is 11 cells off.

### 2. `p20_downs` (21.5, 15.5), The Watch Downs
- Region and kind: The Reach: the Watch Downs (Sheep-Walk region); open downland. Map is 44 by 38 cells.
- Ground: floor `t_grass`, height 1.08 (+0.64 above the average of the ring 8 cells out), steepest slope within 3 cells 0.41 (walkers climb up to 1.1).
- Clear space: 4.5 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: SE 27 (cells, tested out to 60).
- Walking: 1 cells from worn road or track floor (`t_p20_track`); about 24 steps from the nearest door (Outside the Hedge).
- Dark: map ambient 0, music `wild`; nearest light entity none.
- Nearest existing markers (within 14): p20_cairn (17.5,12.5) 5.0; p20_stone (21.5,8.5) 7.0; p20_stone (14.5,18.5) 7.6; sign (32.5,15.2) 11.0.
- Note: Shoulder of the Long Down, 5 cells from the beacon cairn (p20_cairn, 17.5,12.5), with the sheep-track 1 cell off. This map has no lamp, hearth or glow entity at all and danger 0, so it is the darkest and quietest ground in the Reach. Keep the stone off the cairn's knoll itself.

### 3. `p79_road_w` (84.5, 42.5), The Greenroot Road: the Long Common
- Region and kind: Long Common stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.26 (+1.25 above the average of the ring 8 cells out), steepest slope within 3 cells 0.29 (walkers climb up to 1.1).
- Clear space: 10.0 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): S to WSW, clockwise (90 to 157.5 deg); WNW to ESE, clockwise (-157.5 to 22.5 deg). Closed: SE 11, SSE 11, W 11 (cells to the first wall or tree).
- Longest view: ENE 60 (cells, tested out to 60).
- Walking: 14 cells from worn road or track floor (`t_p79_road`); about 90 steps from the nearest door (Outside the Hedge).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 23 cells.
- Nearest existing markers (within 14): none.
- Note: On the Long Common, on a swell above the plain, with the road's line through it (detour 1). The nearest light is the well's hush-lamp (the deco 'lamp' near 90.2,65.6), 23 cells off. Hounds and proctors roam this map.

### 4. `p22_combe` (9.5, 18.5), Wethercombe
- Region and kind: The Reach: Wethercombe (Sheep-Walk region); chalk combe, farm country. Map is 60 by 60 cells.
- Ground: floor `t_p22_ramo12`, height 6.12 (+1.23 above the average of the ring 8 cells out), steepest slope within 3 cells 0.72 (walkers climb up to 1.1).
- Clear space: 5.5 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNW to SSW, clockwise (-112.5 to 112.5 deg). Closed: SW 11, WSW 9, W 9, WNW 9, NW 11 (cells to the first wall or tree).
- Longest view: SSE 42 (cells, tested out to 60).
- Walking: 15 cells from worn road or track floor (`t_p20_track`); about 26 steps from the nearest door (The Bellwether).
- Dark: map ambient 0, music `wild`; nearest light entity p12_stake_lantern 19 cells.
- Nearest existing markers (within 14): p22_stake (21.6,17.5) 12.1; p22_stake (21.6,21.5) 12.5; p22_stake (21.6,14.5) 12.7; p22_stake (21.6,25.5) 14.0.
- Note: On the west scarp of Wethercombe, 6.1 high on a map whose top is 8.0 at (0.5,13.5). West is shut by the map edge 9 cells away. Vol VIII puts the Chalk Ram (a hill figure) in this west scarp, and the survey stakes at x 21.6 (y 11.5 to 29.5) are 12 cells east: read js/sheepwalk22.js before placing, so the stone does not stand on the figure.

### 5. `p83_wethers` (61.5, 18.5), The drove road: the Grey Wethers
- Region and kind: The Reach: the drove road, the Grey Wethers; road over downs. Map is 120 by 160 cells.
- Ground: floor `t_grass`, height 0.00 (+0.00 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 5.3 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): SSE to ESE, clockwise (67.5 to 22.5 deg). Closed: SE 10 (cells to the first wall or tree).
- Longest view: S 60 (cells, tested out to 60).
- Walking: 3 cells from worn road or track floor (`t_p20_track`); about 17 steps from the nearest door (The Watch Downs).
- Dark: map ambient 0, music `wild`; nearest light entity p22_beacon_lit 35 cells.
- Nearest existing markers (within 14): sign (57.6,5.6) 13.5.
- Note: On the drove track just inside the Grey Wethers from the Watch Downs stile (the way in from p20_downs is at 60.5,1.6). Flat. The track runs through this column, so set the stone three or four cells aside, as here. The far fire-lights (p22_beacon_lit) are 35 cells off.

### 6. `p79_road_w` (21.5, 69.5), The Greenroot Road: the Long Common
- Region and kind: Long Common stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.97 (+1.60 above the average of the ring 8 cells out), steepest slope within 3 cells 0.32 (walkers climb up to 1.1).
- Clear space: 8.4 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNE to NNW, clockwise (-67.5 to -112.5 deg). Closed: N 11 (cells to the first wall or tree).
- Longest view: S 52 (cells, tested out to 60).
- Walking: 16 cells from worn road or track floor (`t_p79_road`); about 35 steps from the nearest door (Outside the Hedge).
- Dark: map ambient 0, music `wild`; nearest light entity p79_glass0 33 cells.
- Nearest existing markers (within 14): none.
- Note: The first rise on the Long Common after leaving the clearing by the east hedge (about 35 cells from the arrival at 1.6,42.5). Ground 1.6 above its surroundings, on a map where the nearest light is 33 cells off.

### 7. `p79_greenroad` (42.5, 48.5), The Greenroot Road
- Region and kind: Middle stretch of the Greenroot Road (ford, mere, Narrows); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.85 (+1.50 above the average of the ring 8 cells out), steepest slope within 3 cells 0.29 (walkers climb up to 1.1).
- Clear space: 11.1 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): S to ESE, clockwise (90 to 22.5 deg). Closed: SE 12, SSE 12 (cells to the first wall or tree).
- Longest view: ENE 60 (cells, tested out to 60).
- Walking: 14 cells from worn road or track floor (`t_p79_road`); about 70 steps from the nearest door (The Greenroot Road: the Long Common).
- Dark: map ambient 0, music `wild`; nearest light entity campfire 30 cells.
- Nearest existing markers (within 14): none.
- Note: A broad rise early in the middle stretch (the ford, the mere, the Narrows): 1.5 above the plain, 14 cells from the road. 

### 8. `p20_downs` (30.5, 24.5), The Watch Downs
- Region and kind: The Reach: the Watch Downs (Sheep-Walk region); open downland. Map is 44 by 38 cells.
- Ground: floor `t_grass`, height 0.00 (-0.12 above the average of the ring 8 cells out), steepest slope within 3 cells 0.11 (walkers climb up to 1.1).
- Clear space: 3.6 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: WNW 31 (cells, tested out to 60).
- Walking: 1 cells from worn road or track floor (`t_p20_track`); about 11 steps from the nearest door (Outside the Hedge).
- Dark: map ambient 0, music `wild`; nearest light entity none.
- Nearest existing markers (within 14): sign (27.6,33.2) 9.2; sign (37.5,30.6) 9.3; sign (32.5,15.2) 9.5; sign (40.5,23.3) 10.1.
- Note: Mid-Downs field, the hurdle-gate arrival from the clearing is at (41.6,24.5), 11 cells east. Level, a track cell 1 cell away. Existing finger-posts and signs stand at 9 cells and more.

### 9. `p79_road_w` (162.5, 57.5), The Greenroot Road: the Long Common
- Region and kind: Long Common stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.36 (+1.34 above the average of the ring 8 cells out), steepest slope within 3 cells 0.34 (walkers climb up to 1.1).
- Clear space: 9.4 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): SSE to S, clockwise (67.5 to 90 deg); SW to ESE, clockwise (135 to 22.5 deg). Closed: SE 10, SSW 11 (cells to the first wall or tree).
- Longest view: N 57 (cells, tested out to 60).
- Walking: 28 cells from worn road or track floor (`t_p79_road`); about 88 steps from the nearest door (The Greenroot Road).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 71 cells.
- Nearest existing markers (within 14): none.
- Note: A swell on the road line in the middle of the Long Common, 1.3 above the plain, between the clapper bridge (118.3,54.2) and Crow Tor (171.6,80.6). 

### 10. `p83_poundstair` (24.5, 15.5), The Flume Road: the Pound Stair
- Region and kind: The Reach: the Flume Road, the Pound Stair; road down a flight of locks. Map is 96 by 190 cells.
- Ground: floor `t_grass`, height 7.60 (+0.18 above the average of the ring 8 cells out), steepest slope within 3 cells 0.22 (walkers climb up to 1.1).
- Clear space: 10.9 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: S 60 (cells, tested out to 60).
- Walking: 3 cells from worn road or track floor (`t_p79_road`); about 16 steps from the nearest door (The Flume Road: the Stride).
- Dark: map ambient 0, music `wild`; nearest light entity none.
- Nearest existing markers (within 14): sign (27.6,4.6) 11.3.
- Note: The highest walkable ground of the Pound Stair, the plateau at z 7.6 at the head of the sixteen locks, 3 cells from the road. The valley drops away to the south. Flat, so a stone here stands on a shelf.

### 11. `p79_greenroad` (60.5, 66.5), The Greenroot Road
- Region and kind: Middle stretch of the Greenroot Road (ford, mere, Narrows); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.00 (+0.95 above the average of the ring 8 cells out), steepest slope within 3 cells 0.34 (walkers climb up to 1.1).
- Clear space: 6.2 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNE to ESE, clockwise (-67.5 to 22.5 deg); S to SW, clockwise (90 to 135 deg); W (-180 deg). Closed: N 10, SE 9, SSE 7, WSW 11, WNW 8, NW 7, NNW 8 (cells to the first wall or tree).
- Longest view: NE 60 (cells, tested out to 60).
- Walking: 9 cells from worn road or track floor (`t_p79_road`); about 73 steps from the nearest door (The Greenroot Road: the Long Common).
- Dark: map ambient 0, music `wild`; nearest light entity campfire 27 cells.
- Nearest existing markers (within 14): none.
- Note: A rise in the middle stretch 9 cells off the road; the deco 'crates' at 25 cells and a campfire at 27 are the nearest. 

### 12. `p83_stride` (39.5, 21.5), The Flume Road: the Stride
- Region and kind: The Reach: the Flume Road, the Stride; road. Map is 120 by 180 cells.
- Ground: floor `t_grass`, height 2.44 (+0.63 above the average of the ring 8 cells out), steepest slope within 3 cells 0.26 (walkers climb up to 1.1).
- Clear space: 5.6 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: SSE 60 (cells, tested out to 60).
- Walking: 3 cells from worn road or track floor (`t_p79_road`); about 20 steps from the nearest door (The Flume Road).
- Dark: map ambient 0, music `wild`; nearest light entity p83_none 47 cells.
- Nearest existing markers (within 14): none.
- Note: At the head of the Stride, 3 cells from the road, ground 2.4 high on the first rise after the arrival from the Flume Road (40.5,1.6). 

### 13. `p79_road_w` (201.5, 57.5), The Greenroot Road: the Long Common
- Region and kind: Long Common stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 2.50 (+1.86 above the average of the ring 8 cells out), steepest slope within 3 cells 0.36 (walkers climb up to 1.1).
- Clear space: 5.4 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NW to WSW, clockwise (-135 to 157.5 deg). Closed: W 7, WNW 6 (cells to the first wall or tree).
- Longest view: NNE 59 (cells, tested out to 60).
- Walking: 22 cells from worn road or track floor (`t_p79_road`); about 54 steps from the nearest door (The Greenroot Road).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 110 cells.
- Nearest existing markers (within 14): none.
- Note: Near the east end of the Long Common, 1.9 above its surroundings, the best rise on that stretch's east half. 

### 14. `p83_wethers` (78.5, 132.5), The drove road: the Grey Wethers
- Region and kind: The Reach: the drove road, the Grey Wethers; road over downs. Map is 120 by 160 cells.
- Ground: floor `t_grass`, height 2.59 (+0.78 above the average of the ring 8 cells out), steepest slope within 3 cells 0.14 (walkers climb up to 1.1).
- Clear space: 5.6 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): N (-90 deg); ENE to SW, clockwise (-22.5 to 135 deg). Closed: NNE 6, NE 8, WSW 7, W 11, WNW 11, NW 8, NNW 10 (cells to the first wall or tree).
- Longest view: ENE 42 (cells, tested out to 60).
- Walking: 29 cells from worn road or track floor (`t_p20_track`); about 49 steps from the nearest door (The drove road: the Hundred Hollows).
- Dark: map ambient 0, music `wild`; nearest light entity p22_beacon_lit 31 cells.
- Nearest existing markers (within 14): p83_weth2 (80.6,126.7) 6.1; p83_weth0 (72.2,127.7) 7.9; p83_weth0 (83.8,126.0) 8.3; p83_weth0 (85.3,126.5) 9.0.
- Note: South end of the Grey Wethers field, on a rise (z 2.59) 6 cells from the nearest wether stone (p83_weth2 at 80.6,126.7). A new stone here would read as one more of the flock, so it needs a look of its own (taller, dark). Off the track by 29 cells.

### 15. `p79_road_e` (180.5, 105.5), The Greenroot Road: Greenroot Wood
- Region and kind: Greenroot Wood stretch of the Greenroot Road (Reach to Greenroot); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.13 (+0.97 above the average of the ring 8 cells out), steepest slope within 3 cells 0.36 (walkers climb up to 1.1).
- Clear space: 5.7 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NE to W, clockwise (-45 to -180 deg); NNW to N, clockwise (-112.5 to -90 deg). Closed: NNE 8, WNW 9, NW 7 (cells to the first wall or tree).
- Longest view: ESE 54 (cells, tested out to 60).
- Walking: 8 cells from worn road or track floor (`t_p79_road`); about 45 steps from the nearest door (Singers' Howe).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 32 cells.
- Nearest existing markers (within 14): none.
- Note: Late in Greenroot Wood, 8 cells from the road, 1.0 above the plain, on the way to Greenroot from the Howe's post (154.6,90.2) and the lych-house (172.5,68.6).

### 16. `p83_hollows` (54.5, 141.5), The drove road: the Hundred Hollows
- Region and kind: The Reach: the drove road, the Hundred Hollows; road over downs. Map is 110 by 170 cells.
- Ground: floor `t_grass`, height 1.44 (+0.04 above the average of the ring 8 cells out), steepest slope within 3 cells 0.21 (walkers climb up to 1.1).
- Clear space: 10.2 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: NW 60 (cells, tested out to 60).
- Walking: 2 cells from worn road or track floor (`t_p20_track`); about 28 steps from the nearest door (Wethercombe).
- Dark: map ambient 0, music `wild`; nearest light entity p22_beacon_lit 119 cells.
- Nearest existing markers (within 14): none.
- Note: On the drove track near the south end of the Hundred Hollows, 2 cells from the track. Level. Hounds and a woolwight roam the map by night.

### 17. `clearing` (7.5, 30.5), Outside the Hedge
- Region and kind: The Reach: Outside the Hedge; open country. Map is 40 by 36 cells.
- Ground: floor `t_grass`, height 0.58 (+0.58 above the average of the ring 8 cells out), steepest slope within 3 cells 0.32 (walkers climb up to 1.1).
- Clear space: 3.7 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNW to E, clockwise (-112.5 to 0 deg). Closed: ESE 9, SE 6, SSE 5, S 5, SSW 5, SW 6, WSW 7, W 7, WNW 7, NW 8 (cells to the first wall or tree).
- Longest view: NE 37 (cells, tested out to 60).
- Walking: 26 cells from worn road or track floor (`t_wood`); about 10 steps from the nearest door (The Watch Downs).
- Dark: map ambient 0, music `wild`; nearest light entity hearth 13 cells.
- Nearest existing markers (within 14): grave (7.5,22.5) 8.0; p84_mile (3.3,23.6) 8.1; sign (2.2,23.6) 8.7; lamp (20.5,30.5) 13.0.
- Placed foes within 10 cells: hound@2.
- Note: A low knoll in the south-west of the clearing, 0.6 high. A hound is placed 2 cells away. Hearth 13 cells, Sable's camp lamp further.

### 18. `p49_meadow` (14.5, 12.5), The water-meadow
- Region and kind: The Reach: the water-meadow beyond the Hedge; open meadow. Map is 34 by 22 cells.
- Ground: floor `t_grass`, height 0.00 (+0.00 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 7.0 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNE to ESE, clockwise (-67.5 to 22.5 deg); WSW to NNW, clockwise (157.5 to -112.5 deg). Closed: N 12, SE 11, SSE 9, S 9, SSW 9, SW 11 (cells to the first wall or tree).
- Longest view: ENE 19 (cells, tested out to 60).
- Walking: no worn path floor on this map; about 12 steps from the nearest door (spawn).
- Dark: map ambient 0.2, music `wild`; nearest light entity none.
- Nearest existing markers (within 14): p84_mile (3.9,12.6) 10.6; sign (2.8,12.6) 11.7.
- Note: The middle of the water-meadow, a level field with 7 cells clear all round and no light. Ambient is 0.2 here (brighter than the open country), and the way in is the culvert scene, so few players see it.

### 19. `p22_combe` (20.5, 45.5), Wethercombe
- Region and kind: The Reach: Wethercombe (Sheep-Walk region); chalk combe, farm country. Map is 60 by 60 cells.
- Ground: floor `t_grass`, height 0.00 (-0.12 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 3.3 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: N 45 (cells, tested out to 60).
- Walking: 4 cells from worn road or track floor (`t_p20_track`); about 13 steps from the nearest door (Ewe Barrow).
- Dark: map ambient 0, music `wild`; nearest light entity p12_stake_lantern 25 cells.
- Nearest existing markers (within 14): p84_mile (16.7,57.0) 12.1; sign (15.6,57.0) 12.5; p22_beacon (6.5,45.5) 14.0.
- Note: Combe meadow near the Hanger's gap, 4 cells from the track, 4 cells from the track. 12 cells from a finger-post and milestone.

### 20. `p20_downs` (10.5, 24.5), The Watch Downs
- Region and kind: The Reach: the Watch Downs (Sheep-Walk region); open downland. Map is 44 by 38 cells.
- Ground: floor `t_grass`, height 1.52 (+1.40 above the average of the ring 8 cells out), steepest slope within 3 cells 0.38 (walkers climb up to 1.1).
- Clear space: 3.2 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NW to SW, clockwise (-135 to 135 deg). Closed: WSW 10, W 10, WNW 10 (cells to the first wall or tree).
- Longest view: ENE 34 (cells, tested out to 60).
- Walking: 13 cells from worn road or track floor (`t_p20_track`); about 13 steps from the nearest door (The drove road: the Grey Wethers).
- Dark: map ambient 0, music `wild`; nearest light entity none.
- Nearest existing markers (within 14): p20_stone (8.5,27.5) 3.6; p20_stone (14.5,18.5) 7.2; sign (9.4,33.5) 9.1; sign (13.6,35.0) 10.9.
- Note: A rise 1.4 high among the boundary stones, 3.6 cells from the nearest one (p20_stone at 8.5,27.5). Clearance is the minimum, 3.2.

### 21. `p79_greenroad` (132.5, 39.5), The Greenroot Road
- Region and kind: Middle stretch of the Greenroot Road (ford, mere, Narrows); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 0.00 (+0.00 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 8.9 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): all sixteen winds (the whole horizon). Closed: none (cells to the first wall or tree).
- Longest view: ESE 60 (cells, tested out to 60).
- Walking: 1 cells from worn road or track floor (`t_p79_road`); about 131 steps from the nearest door (The Greenroot Road: Greenroot Wood).
- Dark: map ambient 0, music `wild`; nearest light entity campfire 104 cells.
- Nearest existing markers (within 14): sign (128.0,31.4) 9.3.
- Note: Flat ground on the road above The Leap (sign at 128.0,31.4, 9 cells), 1 cell from the road texture. Every wind open. No light for 100 cells.

### 22. `p96_cliffs` (24.5, 65.5), The Chalk Cliffs
- Region and kind: The Dawning Heights: the Chalk Cliffs; cliff ledges. Map is 36 by 150 cells.
- Ground: floor `t_p96c_ledge`, height -9.30 (+17.18 above the average of the ring 8 cells out), steepest slope within 3 cells 0.11 (walkers climb up to 1.1).
- Clear space: 17.6 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): ESE to ENE, clockwise (22.5 to -22.5 deg). Closed: E 12 (cells to the first wall or tree).
- Longest view: N 60 (cells, tested out to 60).
- Walking: 0 cells from worn road or track floor (`t_p96c_ledge`); about 92 steps from the nearest door (Sun-Peak Vigil).
- Dark: map ambient 0.28, music `inside`; nearest light entity p92_shadelamp 79 cells.
- Nearest existing markers (within 14): none.
- Note: High on the Chalk Cliffs, a wide ledge 22 above the void below (z -4.6) near the rest-stone (p96c_reststone at 7.6,106.5, 17 cells). Shadow remnants (p96c_remnant, eight on the map) crawl up these cliffs at night; the dusk bell rings from the Vigil.

### 23. `p96_cliffs` (24.5, 108.5), The Chalk Cliffs
- Region and kind: The Dawning Heights: the Chalk Cliffs; cliff ledges. Map is 36 by 150 cells.
- Ground: floor `t_p96c_ledge`, height -4.57 (+22.20 above the average of the ring 8 cells out), steepest slope within 3 cells 0.11 (walkers climb up to 1.1).
- Clear space: 7.1 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): ESE to ENE, clockwise (22.5 to -22.5 deg). Closed: E 12 (cells to the first wall or tree).
- Longest view: N 60 (cells, tested out to 60).
- Walking: 0 cells from worn road or track floor (`t_p96c_ledge`); about 47 steps from the nearest door (Sun-Peak Vigil).
- Dark: map ambient 0.28, music `inside`; nearest light entity p92_shadelamp 37 cells.
- Nearest existing markers (within 14): none.
- Note: Mid-cliff ledge (z -9.3), 36 cells from the iron ring, 44 from the rest-stone, 18 from an overhang. Same danger as 22.

### 24. `clearing` (35.5, 12.5), Outside the Hedge
- Region and kind: The Reach: Outside the Hedge; open country. Map is 40 by 36 cells.
- Ground: floor `t_grass`, height 0.00 (-0.15 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 3.5 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): S to NNW, clockwise (90 to -112.5 deg). Closed: N 12, NNE 7, NE 5, ENE 4, E 4, ESE 4, SE 5, SSE 7 (cells to the first wall or tree).
- Longest view: WSW 36 (cells, tested out to 60).
- Walking: 9 cells from worn road or track floor (`t_wood`); about 16 steps from the nearest door (The standing-stones).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 7 cells.
- Nearest existing markers (within 14): lamp (35.3,19.3) 6.8; sign (28.5,17.5) 8.6; sign (36.5,22.5) 10.0; sign (22.5,7.5) 13.9.
- Placed foes within 10 cells: hound@5, proctor@6.
- Note: The clearing's north-east field, 3.5 cells clear, with Sable's camp lamp 7 cells off (the lamp at 35.3,19.3) and a hound and proctor placed within 6.

### 25. `p79_greenroad` (210.5, 75.5), The Greenroot Road
- Region and kind: Middle stretch of the Greenroot Road (ford, mere, Narrows); road. Map is 235 by 134 cells.
- Ground: floor `t_grass`, height 1.26 (+1.15 above the average of the ring 8 cells out), steepest slope within 3 cells 0.34 (walkers climb up to 1.1).
- Clear space: 6.2 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NW to W, clockwise (-135 to -180 deg). Closed: WNW 11 (cells to the first wall or tree).
- Longest view: SW 60 (cells, tested out to 60).
- Walking: 13 cells from worn road or track floor (`t_p79_road`); about 64 steps from the nearest door (The Greenroot Road: Greenroot Wood).
- Dark: map ambient 0, music `wild`; nearest light entity campfire 175 cells.
- Nearest existing markers (within 14): none.
- Note: A rise (1.15 above) towards the east end of the middle stretch, 14 cells from the road, 37 cells short of the Narrows cairn (210.3,38.4). 

### 26. `cantabile_cay` (38.5, 13.5), Driftwood Cay
- Region and kind: Port Cantabile (Tempest Archipelago / Rust Coast): Driftwood Cay; island. Map is 44 by 30 cells.
- Ground: floor `p17c_turf`, height 0.50 (+0.11 above the average of the ring 8 cells out), steepest slope within 3 cells 0.55 (walkers climb up to 1.1).
- Clear space: 4.5 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): S to N, clockwise (90 to -90 deg). Closed: NNE 9, NE 6, ENE 5, E 5, ESE 5, SE 6, SSE 9 (cells to the first wall or tree).
- Longest view: WNW 25 (cells, tested out to 60).
- Walking: 31 cells from worn road or track floor (`p17c_plank`); about 33 steps from the nearest door (spawn).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 26 cells.
- Nearest existing markers (within 14): sign (34.6,17.8) 5.8; p17c_gravebell (32.2,12.4) 6.4; p17c_gravebell (31.6,14.4) 7.0; p17c_gravebell (31.6,10.2) 7.6.
- Note: East tip of Driftwood Cay, with the harbour view-sign (34.6,17.8) 5.8 cells away and the burying-ground graves (small bells on hooks) 6 cells west. EXTRA: this map is reached only from the Port Cantabile extra (a ferry from the harbour).

### 27. `cantabile_cay` (19.5, 23.5), Driftwood Cay
- Region and kind: Port Cantabile (Tempest Archipelago / Rust Coast): Driftwood Cay; island. Map is 44 by 30 cells.
- Ground: floor `p17c_turf`, height 0.50 (+0.25 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 5.1 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): W (-180 deg); NNW to E, clockwise (-112.5 to 0 deg). Closed: ESE 11, SE 7, SSE 6, S 6, SSW 6, SW 7, WSW 11, WNW 5, NW 6 (cells to the first wall or tree).
- Longest view: NE 28 (cells, tested out to 60).
- Walking: 14 cells from worn road or track floor (`p17c_plank`); about 18 steps from the nearest door (spawn).
- Dark: map ambient 0, music `wild`; nearest light entity lamp 11 cells.
- Nearest existing markers (within 14): sign (20.4,15.6) 8.0; p17c_gravebell (21.6,13.6) 10.1; p17c_gravebell (23.6,13.8) 10.5; lamp (12.4,15.4) 10.8.
- Note: South shore of the Cay, 8 cells from the orphan-house sign. Same EXTRA caveat as 26.

### 28. `deepwoods` (27.5, 33.5), The Deep Woods
- Region and kind: The Spectral Woods: the Deep Woods; open wood with a camp. Map is 56 by 56 cells.
- Ground: floor `t_moss`, height 0.00 (+0.00 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 4.2 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): E to WSW, clockwise (0 to 157.5 deg); NNW to NNE, clockwise (-112.5 to -67.5 deg). Closed: NE 6, ENE 5, W 5, WNW 5, NW 6 (cells to the first wall or tree).
- Longest view: WSW 28 (cells, tested out to 60).
- Walking: no worn path floor on this map; about 5 steps from the nearest door (spawn).
- Dark: map ambient 0.21, music `coda`; nearest light entity lamp 6 cells.
- Nearest existing markers (within 14): sign (26.2,39.5) 6.1; lamp (24.0,38.6) 6.2; lamp (27.5,27.2) 6.3; lamp (29.2,26.2) 7.5.
- Note: The Deep Woods camp. Lamps are 6 cells away (the Kestrel's camp), the ambient is 0.21 (the Woods' own lilac glow), and crew and foes crowd the clearing. Listed only because the Spectral Woods have no better ground by the same test: no cell here has 3 clear, 80 degrees open, no person or foe within 7 and a light more than 10 away.

### 29. `p85_crosspool` (58.5, 40.5), The Low Rings: Cross Pool
- Region and kind: The Reach: the Low Rings, Cross Pool; flooded hamlet. Map is 72 by 56 cells.
- Ground: floor `t_wood`, height 0.12 (+0.11 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 9.9 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNE to SW, clockwise (-67.5 to 135 deg); W to NNW, clockwise (-180 to -112.5 deg). Closed: N 12, WSW 11 (cells to the first wall or tree).
- Longest view: WNW 42 (cells, tested out to 60).
- Walking: 0 cells from worn road or track floor (`t_wood`); about 12 steps from the nearest door (The Low Rings).
- Dark: map ambient 0, music `grove`; nearest light entity p16f_lamp 2 cells.
- Nearest existing markers (within 14): p16f_lamp (60.0,40.6) 1.5; sign (48.6,37.6) 10.3; sign (69.6,39.4) 11.2; p84_mile (70.7,39.4) 12.2.
- Note: On the boards of Cross Pool, one hush-lamp 1.5 cells away (p16f_lamp at 60.0,40.6). Not dark. Flooded country: the boards (floor t_wood) are the walkable ground.

### 30. `p96_vigil` (28.5, 25.5), Sun-Peak Vigil
- Region and kind: The Dawning Heights: Sun-Peak Vigil; monastery yard. Map is 56 by 48 cells.
- Ground: floor `t_p96v_snow`, height 0.00 (+0.00 above the average of the ring 8 cells out), steepest slope within 3 cells 0.00 (walkers climb up to 1.1).
- Clear space: 3.8 cells to the nearest wall, tree, building or map edge. Open (12 or more cells clear): NNE to ESE, clockwise (-67.5 to 22.5 deg); S (90 deg); WSW to NNW, clockwise (157.5 to -112.5 deg). Closed: N 12, SE 11, SSE 9, SSW 9, SW 11 (cells to the first wall or tree).
- Longest view: NE 15 (cells, tested out to 60).
- Walking: no worn path floor on this map; about 14 steps from the nearest door (Sun-Peak Vigil: the Abbess's cell).
- Dark: map ambient 0.3, music `inside`; nearest light entity none.
- Nearest existing markers (within 14): p96v_pillar (27.2,31.8) 6.4; p96v_pillar (30.2,31.8) 6.5; p96v_pillar (24.2,31.8) 7.6; p96v_pillar (33.2,31.8) 7.9.
- Note: The cloister garth of Sun-Peak Vigil: a snow garth ringed by pillars (p96v_pillar), twelve clergy about. Enclosed by the cloister walls on four sides, so only a thin sky view; ambient 0.3. Listed to show the Vigil has no open ground except the landing shelf (28.5,41.5), which is only 7 cells deep.

Where `Nearest existing markers` is empty there is none of the kinds listed in section 4 within 14 cells. The big road maps also carry hundreds of `p79_rock0`/`p79_rock1` decos: those are crag scenery (cliffs and ravine lines), not markers, and every site above is at least 8 cells from one.

## 4. What is already standing (so new stones do not repeat or overlap)

All are `kind: 'deco'` entities on the named map unless noted. `sign` is the finger-post / board sprite; `p84_mile` is the milestone sprite put at nearly every way out (24 maps, js/bearings82b.js and js/mounts84.js), always 1.1 cells beyond its finger-post.

- **clearing** (Outside the Hedge): `grave` use `tobin_cairn` (7.5,22.5) a moss-grown cairn by the old stile; signs: the Watch-stone (28.5,17.5) and its steps (21.4,20.6), the hound-watch stand (36.5,22.5), finger-posts (21.6,31.9), (37.7,29.3), (2.2,23.6); `p84_mile` (22.7,31.9), (38.8,29.3), (3.3,23.6).
- **p47_stones**: the Weekstones ring, eight stones (use `p47_stone`): `p47_stone_tall` Rootday (18.5,9.4); `p47_stone1` Hearthday (22.46,11.04); `p47_stone2` Massday (24.1,15.0); `p47_stone0` Stasisday (22.46,18.96); `p47_stone1` Dawnday (18.5,20.6); `p47_stone2` Driftday (14.54,18.96); `p47_stone0` Memoryday (12.9,15.0); `p47_fallen` Nullday (14.54,11.04), lying flat; `p47_pebbles` (18.5,10.55). Ring centre (18.5,15.0), radius 5.6, on a rise of 0.31. The ring is already a stone place with a quest and a night-time look (the skyline painting in js/sky.js shows it at bearing 0.11 from the clearing). Do not add to it; if one of the new stones is to stand with the ring, reuse the existing ones.
- **p20_downs**: `p20_cairn` the beacon cairn (17.5,12.5); `p20_stone` boundary stones (14.5,18.5), (21.5,8.5), (8.5,27.5); signs: the Scar (32.5,15.2), the sheepfold (27.6,33.2), the dew-pond (9.4,33.5), Hedge Knoll (37.5,30.6), finger-posts (40.5,23.3), (13.6,35.0); `p84_mile` (14.7,35.0). The Scar (a chalk crag, no way up) is the plateau at about (28 to 34, 6 to 12), z 2.3: not a place to stand.
- **p22_combe**: `p22_sarsen` Ewe Barrow door (6.6,50.4); `p22_beacon` (54.5,17.5), (6.5,45.5); `p22_pylon` (48.5,50.5); `p22_stake` survey stakes x 21.6 at y 11.5, 14.5, 17.5, 21.5, 25.5, 29.5; signs: the Wether spring (25.6,6.4), finger-posts (35.6,2.2), (15.6,57.0); stable (26.5,23.5); `p84_mile` (16.7,57.0).
- **p83_wethers (the Grey Wethers)**: about 105 grey stones scattered x 25 to 104, y 71 to 128: sprites `p83_weth0`, `p83_weth1`, `p83_weth2` (34, 34 and 32 of them) and five larger `p83_wethm1` to `p83_wethm5` (83.5,101.5), (74.5,95.5), (88.5,113.5), (71.5,109.5), (80.5,120.5); all solid, use `p83_wether`. Also the sign "The Grey Wethers" (63.5,100.5), the dew-pond (87.7,88.5), the pinfold (23.4,112.2) with `p83_tally` (19.5,111.3), the drove-road sign (57.6,5.6), the dry valley (60.5,72.5), finger-posts (59.4,2.2), (41.6,157.8), `p84_mile` (60.5,2.2), (42.7,157.8); three `p22_beacon_lit` far fires (28.5,30.5), (92.5,104.5), (16.5,92.5) that act as lights.
- **p83_hollows**: `p83_shaft` (80.5,96.0); signs (48.1,7.5), (48.5,66.5), (39.5,129.5), finger-posts (49.4,2.2), (57.6,167.8); `p84_mile` (50.5,2.2), (58.7,167.8); far fires `p22_beacon_lit` (30.5,4.5), (98.5,26.5), (12.5,30.5).
- **p83_stride**: `p20_stone` gauging stone (73.4,100.6); signs: the Stride (77.2,84.7), the skep wall (54.4,37.4), the arch (70.4,79.5), the brook and three footbridges (47.4,96.6), (52.3,98.4), (57.3,101.4), (63.3,106.4); finger-posts (39.4,2.2), (71.6,177.8); `p84_mile` (40.5,2.2), (72.7,177.8).
- **p83_poundstair**: sixteen `p83_gate` lock gates at x 43.6, y 7.5 and every 11 cells to 183.5 (use `p83_gate` on the first three); `p12r_post` mooring stakes (56.5,30.5), (56.5,63.5), (56.5,96.5), (56.5,129.5), (40.6,46.8), (40.6,112.8); side-pound signs (49.2, 9.8 / 64.8 / 119.8 / 174.8); the Pound Stair sign (27.6,4.6); finger-posts (29.4,2.2), (63.6,187.8); `p84_mile` (30.5,2.2), (64.7,187.8).
- **p79_road_w (Long Common)**: `p20_stone` fallen-looking milestone (13.3,41.2); signs: the Delph (60.8,63.8), the winding-house (64.5,69.4), the clapper bridge (118.3,54.2), the wayside well with its hush-lamp (90.2,65.6), Crow Tor (171.6,80.6; "nobody has found the way up": z 5.5 at about (172,72), do not use), Long Water (164.5,105.3), finger-posts (2.2,43.6), (232.8,97.4); `p84_mile` (3.3,43.6), (233.9,97.4); stable (230.5,101.5).
- **p79_greenroad (middle)**: `p20_stone` fallen milestone, use `p79_stone` (157.5,65.0); `p79_cairn` carters' cairn at the Narrows (210.3,38.4); `p12r_post` ford post (135.2,67.8); signs: toll-board (36.4,82.2), a ruined hearth (33.6,77.5), the hand-rope crossing (134.6,56.4), the Leap (128.0,31.4), the mere (171.4,79.1), the tarn (51.0,104.4), the Hang (200.8,58.2); finger-posts (2.2,102.6), (232.8,21.4); `p84_mile` (3.3,102.6), (233.9,21.4).
- **p79_road_e (Greenroot Wood)**: `p20_stone` milestone (226.1,83.2); signs: the Cleave (28.8,46.8), the timber bridge (132.2,60.8), the fen (60.8,94.4), the eel-stage (79.2,117.4), the HOWE post (154.6,90.2), the lych-house (172.5,68.6); `bigbell` alarm wire (174.5,66.4, use `trap`).
- **greenroot**: six `grave` (use `p9p_look`) near (26 to 33, 9 to 15); signs the charnel stair (30.4,14.35), finger-post (2.2,14.6), the mill board (15.55,9.7); `p84_mile` (1.1,14.6).
- **flume_road / flume_landing / flume_lowrings / p85_crosspool / p85_sunklanes**: `p16f_post` ringing stakes (9.5,15.6), (19,16.4), (43,15.6), (50,16.8), (46.4,13); `p12r_post` mooring posts (Low Rings: (14.2,17.9), (25.2,18.9), (33.8,17.6), (9.6,10.6); Sunk Lanes (44.5,21.5)); `p85_cross` the sunken market cross (36.5,28.5); `p85_kerb` kerbs under the water; `p85_hook` (31.5,44.4); finger-posts and `p84_mile` at each gangway.
- **p85_deepgrove**: `p85_stool` the Stool (40.5,8.2); `p85_boulder` glades at (43.7,53.9), (18.3,32.3), (43.4,33.2), (68.1,32.7), (44.4,26.1) and others; carved-bark signs (37.0,47.4), (12.0,25.4), (37.0,25.4), (62.0,25.4).
- **cantabile_cay**: 24 `p17c_gravebell` mounds (x 21.5 to 32.4, y 7.2 to 14.4) and three `p17c_barehook` (26,8.6), (30,11), (24,12.8) on the spine; signs (20.4,15.6) the high rock, (34.6,17.8) the view. **cantabile_harbour**: `p17c_molebell` (74.4,51), `p17c_sundisc` (39.5,16.9), `p17c_ring` (56.5,52.8), `p12r_post` along the mole.
- **p96_cliffs**: `p96c_cairn` (18.5,6.5, use `p96c_cairn`: a cairn with names cut in each stone); `p96c_ring` iron rings (19.6,29.2) and others; `p96c_reststone` (7.6,106.5); finger-post (19.6,145.9). **p96_vigil**: `p96v_gatebell` (30.4,39.5), `p96v_lintel` (28.5,39.0), `p96v_bell` (28.5,8.5), 24 `p96v_pillar` round the garth (x 18.2 to 39.2, y 16.2/31.8, and the east and west sides).
- **deepwoods**: 13 `grave` (one `nan_grave`), a `tomb` (32.4,15.73), six `p_statue_broken`/`p_statue_head` pieces; signs (47.4,2.4), (26.2,39.5). **whispergrove**: nine broken statues and heads, signs (26.2,43.2), (29.9,6.1), (2.2,30.6). **oakhaven**: signs (22.4,3.1), (66.8,52.6), (55.5,47.5) and milestones (23.5,3.1), (67.9,52.6).

No deco or sprite is named monolith, megalith, menhir, obelisk, stele, shrine or waymark. The existing markers are cairns (`p20_cairn`, `p79_cairn`, `p96c_cairn`, `tobin_cairn`), boundary and gauging stones (`p20_stone`), the Weekstones and the Grey Wethers. A new stone should use a sprite of its own (section 5) so it cannot be mistaken for those.

## 5. How the game lets a player use or look at a fixed thing

- A fixed thing is an entity with `kind: 'deco'`. `GameMap.deco(sprite, x, y, opts)` (js/maps.js) adds one, with defaults `solid: true, radius: 0.35`; `opts` can set `scale`, `label`, `use`, `solid`, `radius`, `glow`, `look`.
- Key press `interact()` (js/game.js:1443) calls `Engine.pick(G.ents, USE_RANGE)` (`USE_RANGE = 2.6` cells, whatever is under the crosshair). If the thing is a deco with a `use` string, `useDeco(e)` runs; if it has no `use`, the player just gets its `label` as a message (`decoLabel`). There is also a fallback: any deco with a `use` within 1.6 cells plus its radius and roughly in front is used. The on-screen hint while aiming is `e.label` (js/game.js:2374).
- `useDeco` is a long if-chain in js/game.js. Modules do not edit it; they wrap it and claim their own `use` prefix. The model is `js/stones47.js`, which is already the stone code:
  ```js
  m.deco(sprite, p.x, p.y, { solid: true, scale: 1.18, radius: 0.42, label: STONE_NAME[i], use: 'p47_stone', stone: i });   // placing it
  function useOwn(e) { if (!e || typeof e.use !== 'string' || e.use.indexOf('p47_') !== 0) return false; if (e.use === 'p47_stone') { useStone(e); return true; } ... }
  const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); };
  showEvent(STONE_NAME[i], body, [{ t: 'Hold the note here', f: () => {...} }, { t: 'Leave it.', f: null }]);   // the modal
  ```
  `showEvent(title, html, choices)` (js/game.js:1554) opens the event panel, sets `G.state = 'event'`, and each choice `{ t, f }` closes it and calls `f`. A "looked through" view can open as a new panel or canvas from `useOwn`; `Engine.cam` (x, y, dir) gives the way the player faces, and `G.state` / `G.openPanel` gate input.
- Sprites are drawn in code: `Engine.addSprite(name, { w, h, data: Uint32Array, hs, cx: 0.5, dy: 0 })` (js/engine.js:107), as `stones47.js` does for `p47_stone_tall` (16 by 40, `hs` 1.75) so a stone can be taller than a person. Both renderers (js/engine.js and the GPU path) draw it.
- New decos go on an existing map from a `buildAllMaps` wrapper (stones47.js:`wire`, bearings82b.js:`addBase`). To keep saves lined up, js/bearings82b.js inserts the new base entity at `m.baseCount` and then does `m.baseCount++`; a save keeps the first `baseCount` entities by place (js/game.js:2569), and only enemies and items found after it are restored as extras, so a deco must be rebuilt by the module every time. Never insert into the middle of a list.
- Other ways a fixed thing is looked at: `kind: 'deco'` with `look` text and `use: '<prefix>_look'` (js/thin29.js, js/p59 `p59_look`); `label` alone for a one-line read; a trap or lock via `trapType`; `Engine.pickWall` for wall cells and doors.

## 6. Height, and the compass

- **Elevation exists, per cell and per corner.** `GameMap.lvls` (a Float32 per cell) holds flat levels (`setLvl`, `raise`); `GameMap.verts` and `smooth` hold sloped ground at cell corners (`hill(cx, cy, rx, ry, height, {steep})`, `ramp`). `groundAt(x, y)` returns the height in world units; the eye rides 0.88 above the feet. A walker can step up 0.36 (`STEP_UP`) and climb a slope up to 1.1 rise per run (`MAX_GRADE`); steeper ground is a cliff, and walking down off a crag makes you tumble. Flat maps have `lvls` and `smooth` null. There is no per-map altitude number, only these heights.
- Highest reachable ground by map (height at its top cell): `p83_poundstair` 9.25 at (92.5,17.5); `p22_combe` 8.0 at (0.5,13.5); `p79_greenroad` 6.44 at (178.5,32.5); `p79_road_e` 5.98 at (17.5,52.5); `p79_road_w` 5.52 at (179.5,63.5) (Crow Tor); `p83_stride` 3.78; `p83_hollows` 3.16; `p83_wethers` 3.08; `deepwoods` 2.6 at (50.5,31.5); `flume_road` 2.7; `cantabile_cay` 2.5; `p20_downs` 2.33 at (16.5,12.5); `clearing` 1.2 at (25.5,15.5); `p47_stones` 0.31. `cantabile_harbour` is 11.2 at (34.5,8.5). `p96_vigil` and `p96_cliffs` run the other way: the yard is 0 and the ground falls away to -30 and -40 (the cliff drop).
- Sky horizon: the painted skyline ridges are per map in `LANDMARKS` (js/upgrades.js:1406), each at a game-radian bearing `a` (e.g. oakhaven's Grey Teeth at -pi/2, the north). They do not block walking; they are background.
- **The compass.** The HUD strip (js/game.js ~2447) draws N, NE, E, SE, S, SW, W, NW as letters across an 86-pixel strip, 1.6 radians each side of the player's heading (`heading = cam.dir + pi/2`, 0 = north). There is no degree readout. Cardinal letters are gold, the diagonals grey. With the screen reader on, F4 (or `]`) says "You are facing north-east" in eight directions (js/reader97.js:222). `js/compass97.js` adds marks on that strip only for quest givers (gold diamond), side-quest givers (pale-blue disc), an arrow at the end when the target is behind, and a hollow diamond for "the door toward the nearest one"; it reads `LOGMAP.QUEST_GIVERS` and has nothing for places or stars. A stone that is looked through can show its own bearing (for example "bearing 047, north-east") by using the formula above.
- **Stars.** js/sky.js draws stars at fixed world directions (`st.cx`, `st.sy`, `st.el`) through the camera's `dirX`, `dirY`, in the same x/y axes as the map, and only where `F.outdoor`. `js/deepsky113.js` is an empty stub for Phase 113b (the deep night sky); the brief says it will go where the night is truly dark, and its rule for "how darkness is reckoned" is not in the repo, so the `ambient` and nearest-light figures above are the only measures I could give.

## 7. Cautions for the builder

- Hounds, proctors, outriders, hush-wardens, woolwights and tongueless roam the road and Downs maps by night (counts listed per map in section 2 and in each site's foes line). The Downs (`p20_downs`), the meadow, the Cay and the Reach roads' middle are the quietest; `p96_cliffs` has eight remnants at night.
- `p79_road_w` is reached only through the clearing's east hedge, which is locked until flag `p9p_known`; the clearing itself until flag `gate_open`. Sites 3, 6, 9, 13 (Long Common), 7, 11, 21, 25 (middle) and 1, 15 (Greenroot Wood) are therefore after those flags. The Spectral Woods need Part Three and Four flags; Cantabile and the Cay are Extras-menu only; the Dawning Heights need the story to have reached them.
- Sites 5, 8, 16, 2 are within three cells of the worn track: set the stone aside from it, as the coordinates do, so it does not block the lane.
- Where I could not verify something I said so (how the Vigil is entered; that the Chalk Ram's exact cells need js/sheepwalk22.js). Nothing else in this file is from memory.
