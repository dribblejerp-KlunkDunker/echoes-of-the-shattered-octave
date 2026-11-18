# Phase 96: the Cloud Deck and the Valley Farms (findings, for ruling)

Team D, 16 Nov 2026. Nothing was built. This page says why, and what in the game already rests on the two places.
Short names: **B2** = `story/Books/Book Two - The Great Discord/Part Two Ch8-14.md`; **P89** and **P90** = the plan
(`story/Game Layer/Phase 89 ...` and `Phase 90 ...`); **WB** = `story/World Bibles/`. Evidence is from the team's lore
briefs (`/home/claude/army96/d/LORE-clouddeck.md`, `LORE-farms.md`).

## What the plan proposed

- P89:275: "**The cloud deck** [PROPOSED]. Below the city and above the gulf's floor, a sea of cloud. Gulls. The Keel Docks' winch-boats go down through it to the valley farms that feed the city."
- P89:276: "**The valley farms** [PROPOSED]. At the gulf's floor, among the peaks 'pale as teeth': terraced barley under black netting, worked by Umbral folk who come down the chains for the season."
- P90:134 to 135: "the winch-boat stage; the descent through cloud; the gulls' rock" and "terraces under black netting; the seasonal huts; the chain-foot store".

## What the book says

1. **No cloud under the city.** B2:921: "below every walkway there was nothing ... the gulf, two thousand feet of dark air, and the peaks at the bottom of it pale as teeth under the stars." Coming in, the city's shadow is watched "swinging slowly across the peaks below it" (B2:571). No line of Book Two puts cloud, mist or fog under the city. The "cloud deck" is only in the older bibles (WB Vol I:211 "a permanent cloud deck"; Vol II:85 "four thousand meters of cloud"), and the manuscript wins (Vol III(b):2). The book's depth is two thousand feet, not four thousand metres (B2:621).
2. **Nothing grows on the gulf's floor.** B2:523: "Peaks, white as bone ... snow on their summits even at the end of Ashfall ... nothing growing." The floor under the city lies inside the Spire's mile, where "the light was wrong" (B2:529); only the city's moving shadow gives ordinary light (B2:567). A gull that leaves the shade "went pale ... Then it came apart" (B2:581 to 583); cloth in the glare goes "thin. Like silk" in seconds (B2:613). Black netting would not last a season. Barley in the books is the Reach's (Book One:1508).
3. **No chain reaches the ground.** B2:2357: "The nine ... came down from rings in the Spire's flank at their long slants and took hold of the city's rim ... and nobody walked on them who was not mad or a Tiers child on a dare." Every chain ends in the city's frame (B2:1957, 2837; Vol VIII:2272). So there is no "chain-foot" on the floor (and "the chain's foot" already names the Pilgrim Chain's city end, P90:120).
4. **The Tiers do not go down.** B2:921: "Ladders went up from the Keel Docks through the hanging houses". The docks are "the very bottom of the city" (B2:619). The only going-down in the bibles is Book Four's evacuation "down nine chains" (Vol III:160), a later event the player must never touch.
5. **The only supply shown is by skyship.** B2:621: "They were not docks. They were cradles: great iron baskets hung on chains below the city's lowest tier ... each big enough to take a skyship's gondola ... Three were occupied ... a Church packet ... a pair of battered freighters". No book or bible names winch-boats, farms or any supply from below. Vol I:219 gives the city's food as "Thin fare. Preserved fruit, altitude-bread", which is stores, not a harvest.
6. **No rock under the city** for "the gulls' rock": it hangs "over a gulf of nothing" (B2:545); the Phase 94 record: "There is no rock under it." The gulls wheel "in the shade under the city on the updrafts" (B2:577).

## Why neither place can be built lore-bound

The cloud deck contradicts the book's clear view of the peaks. The farms need crops where the book says "nothing growing", inside light that unmakes a gull, reached by a chain that does not exist, by people the book only shows climbing up. The winch-boats that link them have no source at all, and the city does not need them: the book's freighters in the cradles are its supply.

## What in the game already rests on them (js/heights92.js; the Commander owns it)

| Line | Now | Recommended |
| --- | --- | --- |
| 56 `arrive` | "... Pennick brings her in under the city to the Keel Docks, where the winch-boats come up through the cloud." | "... Pennick brings her in under the city, through its shadow, to the Keel Docks, where the iron cradles swing over the gulf." |
| 61 `docks` | "The Keel Docks. The winch-boats come up through the cloud deck here, and the ladders go up from here into the city." | "The Keel Docks. Eleven iron cradles for the skyships, and the ladders go up from here into the city." |
| 62 `winchboat` | "A winch-boat, hung on its rope over the gulf. The cloud is a long way down." | Make the deco a freighter in a cradle: "A freighter's gondola, made fast in its cradle over the gulf. Two thousand feet down, the peaks are pale as teeth." |
| 129 harbourmaster, "The Keel Docks" | "The winch-boats come up through the cloud from the valley farms. The ladders go up from here. Everything the city eats comes past me, and I count it." | "The freighters come into the cradles, and the ladders go up from here. Everything the city eats comes past me, and I count it." |

Also: the header comment (line 17, "the cloud deck far below") and the gulf's floor texture `t_p92_cloud` (lines 185, 253) should become the white peaks under dark air, with snow on them (Harvestmonth is before the white tide takes the snow, B2:2717); the winch-boat art (lines 326 to 332, "sacks of barley") goes with the deco. The harbourmaster's counting stays [PROPOSED]: the book allows it, since the freighters lie in her cradles.

## Questions for the owner

1. Vol II:93 puts the Chalk Cliffs "below the cloud deck", and another team is building them. Shall a cloud deck stay in the game anywhere out of sight of the city (low, beyond the gulf, under the peaks), so that line stands, or is the line read without it?
2. Do you want anything in the place of these two? The canon thing nearest to them is a freighter in the Keel Docks' cradles (B2:621), which could become a small place of its own.
