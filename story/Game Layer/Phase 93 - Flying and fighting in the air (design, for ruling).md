# Phase 93: flying and fighting in the air (design, ruled and built)

*Written 15 Nov 2026, after the owner's word: "yes I want the flying combat to be a system." Nothing is built yet. Everything not quoted from a book is [PROPOSED]; seven questions at the end are the owner's. The owner also offered his Forge engine ("if it will help use my idtechengine"); what it can and cannot do here is in §7.*

## Ruled and built (15 Nov 2026)

The owner's answers: *"keep everything lore bound 1 no. 2 yes. 3 no. 4 based off the book it is randomized. 5 yes. yes. use as much of my engine that is useful."*

1. **No new gun.** She stays unarmed.
2. **Vane keeps the wheel,** and the traveller works the stations.
3. **She is never lost:** a forced landing costs half a day and up to 40 sovereigns of canvas and drift-glass. Knocked down at the rail, the proctors take three tenths of your purse and go back up their line.
4. **It is chance, as in the books:** even odds that a long flight (south to a far country, or home from one) is met. The roll is `Math.random` at the moment of the flight; nothing visual uses it. Short hops inside the Reach are never met. A switch in Options (Graphics & access, "Meetings in the air") turns it off.
5. **The set-piece names stand,** with one change for the lore. *The battery at the Saddle* is not built here: the guns at the Saddle are the Arbiterium column's, laid in Book Three, after Harvestmonth 419. A battery that stands in 419 belongs to Bastion Fortis's walls, so the battery kind waits for the Peaks' flights. The first set piece is the courier-cutter over the Valley of Velocity on the way south: Book Three ch. 1's standing rain, and its law that what moves goes on getting faster, so a weeping tank's jet pushes her round.
6. **Short working orders only:** "Up." "Hold her." "Lower." (Vane's own word in Book One ch. 21), "Into the cloud." "Down to the deck."
7. **The Forge:** the horn uses the four ai_cast states from `scripts/ai/ashen_enemy_aicast_mds.gd` (relaxed, query, alert, combat, shown as swivelling, pausing, turned and coming) on the same 0 to 100 awareness meter. The Forge declares the meter but does not yet fill it, so the fill and drain (what the horn hears, at its distance, through cloud and rain) are written here and offered back.

**Built:** `js/air93.js`; the flight hook in `js/kestrel16.js` (`setFlightHook`); test `test/air93.test.js` (16 checks); French `tools/i18n/p93-air.tsv` (102 lines). The cutter, the chains and the tank-cradle are drawn in code. The pictures are `screenshots/p93/p93-closing.gif`, `p93-cutter.jpg` and `p93-hooked.jpg`. The numbers are [PROPOSED] for the owner to tune:

| Number | Value |
|---|---|
| Odds of a meeting | 1 in 2 |
| The stretch the cutter works | 200 seconds |
| Start height | 540 ft |
| Cloud band | 600 to 760 ft |
| Ceiling | 900 ft |
| The cutter starts at | 1,500 yards |
| It loses you at | 2,300 yards |
| It closes, coming / turned | 22 / 9 yards a second |
| The long gun | every 45 s, 4 in 10 hit, half that running dark |
| A chain | 3 blows of the axe |
| Lashing the hold / patching a tank | 6 / 7 seconds standing by it |

## 1. What the books give us

The Kestrel does not fight in the air. She hides, climbs, sinks, sheds weight and holds her rail. Every rule below grows out of these lines.

| Canon | Where | What the system makes of it |
|---|---|---|
| The swivel long gun goes over the side, "tomorrow, in the dark, over the slag-pit". Without it the Kestrel is "a fat brass goose over open country". | Book One ch. 8 | **She is unarmed.** The player never shoots ship against ship (question 1). |
| The Office courier-cutter: "forty feet, lead-grey, no envelope at all but four hard little drift-tanks slung in a cage amidships, which made her brutally fast and meant she could not carry anything heavier than paper and proctors. A long gun forward on a swivel. A grapnel-thrower aft. And on the bow… a brass horn the size of a wash-tub." | Book One ch. 21 | The first enemy ship. It is fast, light, armed fore and aft, and it **hunts by ear**. |
| "It found them the way you find a hive: by listening until the sound got louder." "We're a bell." The cargo hums, and the fix is "Pack it like glass for a long haul": straw, blankets, coats and canvas round every crate. | Book One ch. 21 | **Noise is the hunter's sense.** The things that ring (the crates, sour tanks, voices, the drum) can be muffled. |
| The second shot "clipped the number-three lift-tank, and drift-glass does not explode; it *weeps*, very slowly, a cobalt vapour that takes the lift with it". They put her down in the woods. | Book One ch. 21 | **Damage takes lift away slowly**; it does not explode. The worst outcome is a forced landing. |
| "Water down to a day and no ballast and the gun over the side." Eighteen souls, maybe nineteen. | Book One ch. 8, ch. 21 | **Weight is life.** Water, ballast, cargo and people come out of the same sum. |
| On the listening-horns, "a man sat with his ear to the narrow end… turning it". The horn on the nearest cutter "stopped swivelling. It swung. Slowly. Toward the Kestrel. And stopped." | Book Three ch. 8 | The hunter's **attention can be read**: a horn that is swivelling has not heard you; a horn that stops has. |
| "Iron hooks on chains, thrown from her rail… One caught the rail by the tank-cradle. One caught the foremast shrouds. One went through the patched sailcloth of the bag." Proctors with felted rods and brass hand-forks tuned to 741, and Office marines with carbines, "who did not take names", come over the rail. | Book Three ch. 8 | **Boarding.** Grapnels hook three kinds of place. Each chain can be cut. Boarders are fought on the deck. |
| Eleven guns on an embankment, "laid there, and waiting… at a single place in the air five hundred feet over the Valley floor". "A minute to reload a twelve-pounder for a good crew." | Book Three ch. 1 | **Laid guns** are set to one height and one place. Do not be there. They reload in a minute. |
| The Justiciary cutter *Equity*, with a black envelope and long-barrelled carbines. Church packets with the white sun-disc. | Books Three and Four; Book Two ch. 9 | More ships: the Justiciary hunts with law, and a Church packet stops and searches. |

**The time rule (Phase 89).** Places are shown as of Harvestmonth 419, and the player never does what the books do later. So none of these scenes is replayed: not the Valley ambush, not the boarding in the mist, not the Equity at the Watch. The system uses their **kinds** (a cutter, a battery, a packet, a squall) in new encounters of its own, on the map-table journeys between the countries.

## 2. The shape of it

An air encounter is played **on the Kestrel's deck in first person**. The deck is the map the game already has (`js/kestrel16.js`, used by Ten Heartbeats in `js/cutter68.js`). The deck can now drop out of a journey on the map table. The sky around it moves, and the threat is a sprite in that sky that comes and goes. Vane has the wheel. The traveller works the ship at **stations**, the same way the book's crew does (question 2):

| Station | What the traveller does there | Who is there in canon |
|---|---|---|
| **The wheel** | Asks for a height: up, hold, down, or "down to the deck". Asks for a heading: into the cloud, into the wind, away. Vane answers in his own words. | Vane |
| **The tank-cradle** | Draws a tank down to sink, or opens one to climb. Patches a weeping tank (a held job with a timer while the cobalt comes out). | Pennick |
| **The hold** | Packs the crates "like glass" with straw and blankets to stop the ringing. Throws weight over the side: water first, then spares, then cargo. Weight thrown overboard stays gone until the next port. | Hetty; Mags |
| **The rail** | Cuts grapnel chains with the deck axe (a chain takes several blows, and each blow is loud). Fights boarders. Watches the hunter's horn. | the whole crew |
| **The lamps** | Hoods the binnacle and the stern lamp for dark running. A dark ship is harder to see, and harder to steer. | Mags |

**The four numbers** on the flight card (see the picture, `screenshots/p93/hud-mock.jpg`):

1. **Height,** in feet, against the bands that matter: the deck (under 100), the trees and roofs, the cloud base, and the ceiling, above which the tanks sing sour and she will not hold.
2. **Lift:** each of the four tanks with its state (sound, singing sour, weeping), against the weight carried (souls, water, cargo, ballast). Lift less than weight means she sinks.
3. **Noise:** everything on board that rings, added up (the crates unpacked, sour tanks, voices above the Narrow, the drum, the axe at the rail), less what muffles it (packing, mist, wind, distance).
4. **The horn:** the hunter's attention, in four states taken from the Forge engine's stealth machine (§7): **swivelling** (it has not heard you), **pausing** (it heard something), **turned** (it knows the bearing), and **coming** (it is closing on you). The horn is drawn on the hunter's bow, and the card says only what you could see from the deck.

## 3. The threats

| Threat | Canon kind | What it does in the system [PROPOSED] | How to beat it |
|---|---|---|---|
| **Office courier-cutter** | Book One ch. 21 | Hunts by noise from out of sight. When the horn is turned, it closes at twice the Kestrel's speed. Its forward long gun fires about every minute and can hole a tank or the envelope. In grapnel range, it throws the grapnel aft and sends four proctors down the line. | Be quiet before it hears you. Go into cloud or mist. Go lower than it dares at night. Cut the grapnel. It carries nothing heavy, so it cannot follow a long climb while it is hooked to you. |
| **Office flotilla** (three cutters) | Book Three ch. 8 | One cutter hunts and two circle. When the hunter's horn turns, all three come down with grapnels on the rail, the shrouds and the bag. Proctors and marines come over the rail. | Hold the rail. Cut chains faster than they come (the bag's chain first: a hook in the envelope tears a cell). If the hunter's crew is broken on your deck, the others draw off. |
| **Laid guns** | Book Three ch. 1 | A battery waits by a known landmark, laid to one height. The slow-matches show as a line of red points. If you cross at that height you are hit. After the first shot, one crew re-lays its gun in about a minute. | Hear of the battery first (a notice board, Brenna Corliss, a Free Captain), or see the slow-matches. Cross at another height, or wait out of range for the dark hour. |
| **Church packet** | Book Two ch. 9 | Signals you to heave to. It inspects for mirrors, songs, Cantors and contraband. | Heave to and be searched (what you carry decides what follows), or run. Running reaches the Church's ledger, as fighting the Office column reaches the Office's (Phase 86). |
| **Justiciary cutter** | Books Three and Four | Hails, and follows you to your next mooring. The black envelope means law, not war. | Be clean when you land, or land somewhere else. No fight in the air. |
| **Weather** | Book One ch. 21 ("the wind… pushed her"); every book | Squalls push her off her heading. Cloud hides her. Icing above the ceiling makes the tanks sing sour. The Bleach's glare near the Heights blinds the deck. | Use the weather as cover, and keep out of what you cannot carry. |

**Damage** is always slow, as the book has it. A weeping tank loses lift by the minute until Pennick patches it. A hook through the bag tears a cell, and the ship sits lower until the next port. A hole in the hull only lets the wind in. Drift-glass never explodes.

**When it goes wrong** (question 3): she sinks below the trees and **puts down**, as she did in the deep woods. The journey breaks off at an emergency landing on the line of the route. She needs a repair (time, sovereigns, and canvas or drift-glass from a port) before she flies again. Boarders who win the deck take the cargo and the passengers' papers, never the ship and never a book character.

## 4. Where it happens

- **On map-table journeys** between the three countries and to the far countries (the 30-hour flight south, and later ones). Whether a journey meets anything is worked out from the route, the day, the hour and the weather, the way Phase 86 sets the roads: the same for every player, never chance (question 4).
- **Each route has its own kind.** The Rust Coast run has cutters out of the Office's coastal stations. The way south to the Heights has a battery at a pass and the Bleach's glare at the end. The crossing to the Woods has weather and mist.
- **The quiet way:** some journeys meet nothing at all. A journey made at the dark hour, with the crates packed, meets less.
- **Set pieces** [PROPOSED; one per route, new, and none from the books]:
  - *The courier over the Cay*: one cutter, sea-fog, and a lighthouse that sees you.
  - *The battery at the Saddle*: on the flight south, a Free Captain's warning bought in Port Cantabile.
  - *The packet's lantern*: a Church packet off the Heights, while you carry something it would want.
  - *The squall line*: the crossing to the Woods, all weather and no enemy.

## 5. Fighting at the rail

The rail is where the traveller's own fighting comes in. It uses the melee and blocking already in the game (Phase 88's fatigue, the shield's knocks), on a deck that moves:

- **The deck heels** when the ship turns hard or a cutter hangs on her grapnels. Footing goes the way the chain-walks do in the Tiers (Phase 92): walking through a heel throws you, standing still holds you.
- **Boarders are canon kinds:** proctors (a felted rod, and a hand-fork at 741 that makes a sung note fail) and Office marines (carbines, taking no names). They are new enemy entries drawn in code with their own pictures.
- **Cutting a chain** takes several blows. While you cut you are not guarding. The bag's chain matters most.
- **The crew fights too,** where the books have them on deck. Nobody from the books dies in a system encounter, and nobody says a line the books do not give them, except crew orders written for the system and marked [PROPOSED] (question 6).

## 6. What the owner will see built, if approved

1. `js/air93.js`: the encounter engine (the four numbers, the threats, the stations, the forced landing), a switch in Options, and the `p93_` flags.
2. The flight card (the HUD in the picture), drawn in code, with French.
3. The courier-cutter, the boarders, the grapnel and its chain, the battery's slow-matches and the packet, each drawn in code with its own picture.
4. The first set piece, on the flight south to the Heights, so it can be played at once from Phase 92's map table.
5. Tests: the same journey gives the same encounter for everyone; muffling lowers the horn; the forced landing always lands somewhere reachable; nothing visual uses random numbers.
6. The record, the French and the game-lore entry (Vol VIII), as every phase now has.

## 7. The owner's Forge engine

The Forge (`idtech3-nextgen-forge`, Godot 4.6, Jolt physics) is attached to this session, and I read it. Two honest points:

- **What carries over.** Its enemy brain (`scripts/ai/ashen_enemy_aicast_mds.gd`) is Return to Castle Wolfenstein's ai_cast stealth machine. It has four states (relaxed, query, alert, combat) and an awareness meter that fills and drains. That is the listening-horn exactly: swivelling, pausing, turned, coming. I propose porting that logic, not its code, to JavaScript for the horn. That way the Office hunts the same way in both games.
- **What does not carry over.** *Echoes* is a browser game: a JavaScript ray-caster and its WebGL view. A Godot build cannot run inside it, so the air scenes themselves have to be made in this game's own engine. If you want a full 3D air battle (the Kestrel and a cutter as real models in the sky), the Forge is the right place to build that as its own scene or cinematic. That would be a separate piece of work on the Forge's side, behind its asset review (question 7).

## 8. Questions for the owner

1. **Re-arm the Kestrel?** The long gun went over the side in Book One, and the books never give her another. *Recommend: no.* She stays a fat brass goose; the system is about hiding, weight and the rail. (Buying a swivel gun back in Driftwood Cay would cost lift, and it would put a gun on her that the books do not have.)
2. **Who flies?** *Recommend:* Vane keeps the wheel, and the traveller works the stations and asks for heights and headings; the traveller takes the wheel only when Vane hands it over in a set piece.
3. **Can the Kestrel be lost?** *Recommend: no.* The worst case is a forced landing and a repair. She is in every book.
4. **How often?** *Recommend:* about one encounter in two long journeys, from the route, the day and the weather (never chance). Short hops inside a country meet nothing, and the dark hour with the crates packed meets less. A switch in Options turns encounters off.
5. **The set pieces' names and places** (the courier over the Cay, the battery at the Saddle, the packet's lantern, the squall line) are [PROPOSED]. *Recommend: keep, and build the battery first,* on the flight south.
6. **Crew orders.** The crew will need short working lines ("Down." "Hold her." "Cut it!") that the books do not give them. *Recommend:* allow plain orders only, marked [PROPOSED], and no new speeches.
7. **The Forge.** *Recommend:* port only the horn's stealth logic now. A 3D air battle in the Forge is a separate project, for you to call.

Opus 5.5, high effort, for the build once these are answered.
