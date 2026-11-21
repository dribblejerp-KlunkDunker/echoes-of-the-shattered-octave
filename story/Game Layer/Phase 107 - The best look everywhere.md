# Phase 107: the best look everywhere (part one)

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

## Part two (next)

- The Hanger's beech trunks: a plain smooth grey tree with no bark (root flare, branch scars), as the owner asked.
- Natural edges: some of the rock walls that ring every open map's horizon become tree lines, hedge banks and broken cliff.
