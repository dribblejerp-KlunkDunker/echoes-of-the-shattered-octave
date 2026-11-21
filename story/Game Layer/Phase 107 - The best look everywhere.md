# Phase 107: the best look everywhere

The owner, 20 November 2026: "change the ceilings so things feel different. lets change the bare beech trunks so it looks like a plain grey trees. with no bark. make the rifts far walls shimmer again. Change some of the edges so that it looks more natural of a barrier. fix all old sprites including the enemies. Whatever is technically the best visuals should be the benchmark everywhere proceed". Then, mid-phase: "commit and merge everything so far".

**Nothing was added to the world.** This is how things are drawn.

## The benchmark

The best-looking figures in the game are the moving paintings of Phase 76 (`js/paintfolk76.js`): each one is enlarged twice over with a sharp filter (smooth curves between the old pixels, then an unsharp pass), so a person at arm's length has four times the pixels. That is the benchmark this phase holds everything else to.

## Done in part one

**Sharp figures** (`js/sharp107.js`, Options row "Sharp figures", `GFX.sharpSprites`). Every sprite within 4.5 units of the eye in the 3D view (creatures and foes, the bosses, items, props, scenery cut-outs) is now drawn from a sharp enlargement made with the paintings' own filter. Its size, foot point and glow are unchanged (the 3D view sizes a sprite by its height setting, not by its pixels), so nothing moves or grows; glowing pixels (eyes, lamps, embers) stay glowing. At most three new enlargements a frame, counted in the game's own ticks, so nothing waits; each is made once and kept. The moving paintings are not enlarged twice. The classic view keeps its pixels. Off in Original, on in every other preset. Test: `test/sharp107.test.js`.

**Ceilings that differ** (`js/ceilings.js` v33). The 33 timber-ceilinged rooms all had the same sooty beam. Now five more ceilings, chosen by what the room is:

| Ceiling | Rooms |
| --- | --- |
| sooty beams (as before) | the inns: the Tavern, the Bellwether |
| a narrow chamfered beam over fresh limewash | the better houses: Lyra's house, Greenhall, the harbour office, the widow's house, Phase 46's house and room |
| close joists and the floorboards of the room above | ordinary houses and shops: the cooper's, Tarrow's, the cottages, the farmhouse, Orla's, the chandlers, the wick house, the surgery |
| open rafters under old thatch | the mill, the malting, the barn, the carders', the belfry |
| beams over plaster gone black with smoke | the tannery, the bakery |
| a boarded ceiling | the conservatory, the bonded store, the Kestrel below decks, the hold, the Greenroot chapel |

A timber room not in the list gets limewash, joists or beams by its name (hashed, the same every time). Test: `test/surfaces.test.js` (eight ceiling textures; each room's ceiling). Picture: `screenshots/p107-ceilings.jpg`.

**The Rift's far walls shimmer** (owner ruling, 20 Nov). Phase 106 asked whether the classic view's moiré on the Rift's far walls should be calmed. The owner wants it to shimmer: left as it is.

**A returning player's Original stays Original** (Codex review of PR #152). Switches made by files that load after the game has applied a returning player's saved preset used to start plainly on: a player who chose Original came back to sun shadows, clouds, ground cover and (new) sharp figures, and the menu called it Custom. They now start as the preset in force wants (`PRESETS.startValue`): Phase 21's shadows and clouds, Phase 105's ground cover and the sharp figures. Test: `test/sharp107.test.js` boots as a returning Original player.

## Part two

**The beeches** (`js/sheepwalk22.js`, the Hanger's wool-tree in `js/hanger22.js`). The owner: "change the bare beech trunks so it looks like a plain grey trees. with no bark". The trunk was one flat grey strip and stood in the 3D view like a square pillar. Now it is a round, smooth grey trunk with no bark: lit on the left and shadowed on the right with a hard dark edge, a root flare spreading into roots that grip the ground, two limbs forking up into the crown, a little green on the shaded side, and the dark "eyes" a beech keeps where old branches fell. The game's own line already says it: "A beech, smooth and grey as a seal". The wool-tree is the same beech, a shade darker under its wool.

**Natural edges** (`js/edges107.js`, Options row "Natural edges", `GFX.edges107`). The owner: "Change some of the edges so that it looks more natural of a barrier". Most open places ended in a tall, level, stone-grey wall all round the horizon. That wall is the tile of **the Hedge**, which in the books is Oakhaven's own: "The Hedge was grey", "three men deep of thorn and packed wool" (the game's own inspect line), "planted to swallow sound". Places far from Oakhaven had borrowed it as a plain border, and inspecting it there said "The Hedge". So:

| Kept exactly as it is (the grey wall there is the Hedge) | Changed |
| --- | --- |
| Oakhaven, Outside the Hedge, Greenroot, the Flume Road and its landings, the orchards, the queue-yard | the Watch Downs, Wethercombe, the water-meadow, the Stride, the Pound Stair, the Grey Wethers, the Hundred Hollows, the Sunk Lanes and Cross Pool: a field hedgerow (thorn and hazel, haws, old man's beard); the Deep Grove: the wood's edge (holly and hazel under the trees) |

The hedgerow's height rises and falls along each side, from chest height to a little over head height (the wood's edge from 1.4 to 2.8, the height of trees), so the skyline is uneven and the downs beyond show over the low stretches. Beside a gate it keeps full height for the gate posts. On a scarp or a hill the hedge stands on the highest ground under it (Codex review of PR #153: a wall's top is a height in the world, and on Wethercombe's scarp, the Pound Stair, the Hollows, the Stride and the Wethers hundreds of hedge cells would otherwise have sunk into the hill). Heights come from hashed smooth noise: the same every time. Nothing you could not walk through becomes walkable. Inspecting it says "A hedgerow: thorn and hazel, haws, and old man's beard over all. Too thick to push through." or "The edge of the wood: holly and hazel under the trees, too thick to push through." [PROPOSED: the wording and which places changed]. Off in Original, on in every other preset. Test: `test/edges107.test.js` (also checks the beech's round shading and root flare).

Picture: `screenshots/p107-beeches-edges.jpg` (before on the left, after on the right).

## Verification
- New: `test/sharp107.test.js` (6), `test/edges107.test.js` (6). Taught: `test/surfaces.test.js` (eight ceilings).
- Also passing: sprites21, creatures, body21, folk20, horizon20, presets, max20, cover105, story-i18n, pwa18, light21 (part one); and the suites listed in the pull request for part two.
