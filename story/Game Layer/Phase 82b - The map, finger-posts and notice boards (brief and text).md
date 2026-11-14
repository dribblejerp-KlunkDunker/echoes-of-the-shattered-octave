# Phase 82b: the map agrees with the ground; finger-posts; notice boards

*Written 13 Nov 2026 so that this phase can be built on Opus 5.5 without inventing anything. It holds the rules, the facts already measured, and all the new writing. Nothing here is built yet. Every line of in-game text below is [PROPOSED] until the owner rules.*

Owner, 13 Nov: "make sure that each location is exactly where it is on the map with roads leading in the proper directions with signposts. Each town or city should have signposts for notices and extra bits of lore and side quests."

## 1. What was measured

**Which side each road leaves by** (every pair of ways in and out between outdoor places):

| From | Leaves by | To | Arrives at | Agrees |
|---|---|---|---|---|
| Oakhaven | north | the clearing | south | yes |
| Oakhaven | east | the Flume Road | west | yes |
| The clearing | west | the Watch Downs | east | yes |
| The clearing | east | the standing-stones | west | yes |
| The clearing | east | the Long Common | west | yes |
| The Long Common | east | the middle stretch | west | yes |
| The middle stretch | east | Greenroot Wood | west | yes |
| Greenroot Wood | east | Greenroot | west | yes |
| The Flume Road | south | Stillwater Landing | north | yes |
| Stillwater Landing | west | the Low Rings | east | yes |
| The Watch Downs | south | Wethercombe | north | yes |
| Wethercombe | south | the Hanger | north | yes |
| The Sunken Court | west | the Bell Yard | east | yes |
| The Sunken Court | **north** | the Malting yard | **west** | **no** |

**To fix:** the Malting yard's way back to the Court belongs on the yard's **south** side. Its test is `test/p61*.test.js`.
**Not measured:** the water-meadow's way in from Oakhaven (it is not a gate in the wall). Check it and record which side.

**The travel map** (`js/travel.js`, `TRAVEL_REGIONS`) lays in only Oakhaven and the clearing, on a painting 240 cells across. The Reach as walked is now about 800 cells across.

**Twenty ways out have no post within seven cells:** the clearing to Oakhaven; the Court to the Malting and to the Bell Yard; Greenroot to its road; the Flume Road to Oakhaven and to the Landing; the Landing to the Flume Road and to the Low Rings; Wethercombe to the Hanger and back; the Bell Yard to the Court; the stones to the clearing; the meadow to Oakhaven; the Malting yard to the Court; and all six gates of the Greenroot road's three stretches.

**Boards:** Oakhaven (the Parish and Guild board), the Sunken Court (the Way-Board) and the Deep Woods camp (the Notice-Stake) have one. Stillwater Landing, Wethercombe, Port Cantabile, the Hollow, the Low Rings and Greenroot have none.

## 2. What to build

1. **One layout, worked out and not hand-typed.** Put Oakhaven at a fixed point. Every other place's position follows from the gates: *where B stands = where A stands + A's gate − B's arriving gate*, one cell across the shared edge. Follow the roads outward until every place has a position. Lay those into the Reach's travel map (and the Woods' and the Coast's), so each place is on the map exactly where the roads put it. The region painting is redrawn in code at the new size, with the roads drawn through the gates. Places not yet found stay hidden, as now.
2. **A test that keeps it true** (`test/bearings82b.test.js`): for every pair of gates, the side left by is the opposite of the side arrived at; the layout has no two places overlapping; each place on the travel map lies in the direction its road leaves; every way out between outdoor places has a finger-post within five cells; every town in section 4 has a board.
3. **Finger-posts** (section 3) at every way out and fork. Each stands beside the road on the side the arm points. The classic and the 3D renderer both draw the existing `sign` sprite.
4. **Notice boards** (section 4). Reading one shows its notices and lore; its tasks are taken from it the way bounties are taken from the Oakhaven board (`bounty_board`).
5. French for every line (`tools/i18n/p82b-*.tsv`), the review record, pictures, the README.

## 3. The finger-posts

The Reach's posts keep the owner's ruling on milestones: words, not numbers. Pattern: *"A finger-post. [ARM]. Under it, smaller: [FAR PLACE], [how far in words]."*

| Where | Text |
|---|---|
| The clearing, by the Hedge gate | A finger-post. OAKHAVEN. Under it, smaller: THE NORTH GATE SHUTS AT DUSK. |
| The clearing, east hedge | (has the Greenroot road's post already; add an arm) THE STONES, a little way. |
| The Long Common, west gate | A finger-post. OAKHAVEN, by the Hedge. The other arm: GREENROOT, two days. |
| The Long Common, east gate | A finger-post. THE LEAP. Under it, smaller: GREENROOT, a day and a half. |
| The middle stretch, west gate | A finger-post. THE LONG COMMON. Under it, smaller: OAKHAVEN, half a day. |
| The middle stretch, east gate | A finger-post. GREENROOT WOOD. Under it, smaller: GREENROOT, a day. |
| Greenroot Wood, west gate | A finger-post. THE LEAP. Under it, smaller: OAKHAVEN, a day. |
| Greenroot Wood, east gate | A finger-post. GREENROOT HAMLET. Somebody has chalked under it: nobody. |
| Greenroot, west side | A finger-post. OAKHAVEN, two days. The paint is fresh. Nobody is left to have painted it. |
| The standing-stones | A finger-post with one arm, pointing back the way you came. THE HEDGE. |
| The Flume Road, west end | A finger-post. OAKHAVEN, by the sluice-arch. |
| The Flume Road, the lane | A finger-post. STILLWATER LANDING, down. A second arm has been sawn off short. |
| Stillwater Landing, the lane head | A finger-post. THE FLUME ROAD, up. Under it, smaller: OAKHAVEN. Nobody has ever been seen to read it. |
| Stillwater Landing, the gangway | A plank on a post. THE LOW RINGS. Under it, in tar: at your own asking. |
| The Low Rings, the gangway | A plank on a post. STILLWATER. The post stands in water to its knees. |
| The Watch Downs, south stile | (has its post; add) WETHERCOMBE, down the drove. |
| Wethercombe, south hedge | A finger-post. THE HANGER. Under it, cut small with a knife: not after dark. |
| The Hanger, the gap | A finger-post, green with moss. WETHERCOMBE. The Bellwether's ram is burned into the wood under it. |
| The water-meadow | A post with no arm. Somebody has tied a hush-lamp's reed to it, and it whistles. |
| The Sunken Court, north | A way-post in marble. THE MALTING. Under it, in new Office paint: RELIEF STATION NINETEEN. |
| The Sunken Court, west | A way-post in marble. THE BELL YARD AND ASHLANE. Nobody has cleaned the weed off it. |
| The Bell Yard | A way-post in marble. THE COURT. |
| The Malting yard | A painted Office board on a stake. TO THE COURT. QUEUE THIS SIDE. |

## 4. The notice boards

Each board has **notices** (what the place tells you), **lore** (what it lets slip) and **tasks** (small things to take and do). Rewards are for the builder to set at the level of the Oakhaven board's small bounties.

### Stillwater Landing: the piling board
*Where:* on the wharf, by the board that already reads LOCK DUES PAID IN ADVANCE.
- Notice: THE LOWER LOCK IS SHUT BY ORDER. No name is given for whose order.
- Notice: TIMBER COMPACT. Strike fund paid out Stasisday, at the raft, to men on the roster. Men not on the roster: see the steward. Men not anywhere: we are asking.
- Notice: Rafts tied here longer than a month are the Landing's.
- Lore: A Cantabile broadsheet, pasted crooked, three weeks old. The headline has been torn off. What is left says the plazas of Whisper-Grove are full of people, standing.
- Lore: In pencil, low down, in a child's hand: the eels know where it goes.
- Task, **Three traps before light.** "Wanted: hands that can keep quiet. Ask at the pier end." Set three willow traps off the pier at night without raising your noise. The eel-trapper pays in eels and a little coin.
- Task, **Reed for the thatcher.** "Six bundles of Flume-Reed, cut green, to the cooperage door." Cut reed in the shallows by the gangway and leave it at the door.

### Wethercombe: the Bellwether's board
*Where:* on the inn's front wall, under the eaves.
- Notice: A fair-day bill, brown with age. WETHERCOMBE FAIR. EIGHT HUNDRED HEAD. The year is 417. There has not been another.
- Notice: STRAYS TO THE PINFOLD. A penny a head to have them back. Nobody has crossed it out, though there is nothing to stray.
- Notice: In Gideon Thrale's hand: ROOMS, A SOVEREIGN. CIDER. NO CREDIT ON WOOL UNTIL THERE IS WOOL.
- Lore: The levy notice of the autumn of 417, the Moot's seal still on it: every fleece in the Reach, for the Hedge.
- Lore: The rhyme, in chalk: When the Ram is white and the fires burn, the barrow gives back.
- Task, **Twelve hurdles.** "Hurdles wanted at the fold. Twelve. T. Farrant." Carry them from the barn, two at a time.
- Task, **The lead ewe's bell.** "Lost on the Downs: a wether-bell, bronze, the tongue tied with wool. It will not ring. That is how you will know it." Find it by the dew-pond and bring it to the fold.

### Port Cantabile: the Harbour board
*Where:* outside the Harbour office, under "Dues, bench and bell".
- Notice: DUES AT SLACK WATER, TO THE HARBOUR-QUEEN'S OWN HAND. Six sovereigns a hull, a day.
- Notice: ARTICLE THE SIXTEENTH. What lies below the tide-mark belongs to whoever brings it up. The Harbour takes a fifth.
- Notice: NOBODY SLEEPS ASHORE.
- Lore: Four broadsheets pinned one over another, each calling the others liars. One of them is right about something, and there is no telling which.
- Lore: A tide-table in a small neat hand, with the key the reef sings at each hour. The last column is headed WINTER, and every line of it is the same.
- Task, **A bell for a bare hook.** "There are hooks on the Cay with nothing on them. A bell is a copper." (This is the grave-bell the game already has; the board sends you to it.)
- Task, **Three chimes.** "Three shrouds on the second quay have lost their chimes. A harbour with a silent shroud is asking for it." Buy three at the chandler's and hang them.

### The Hollow: the Grafters' board
*Where:* at the head of the first row, by the well.
- Notice: INSPECTION, ROOTDAY MORNING. Households to stand at their doors. Those who cannot stand are to be brought to the door.
- Notice: THIRTY-ONE HOUSEHOLDS. Under it, in pencil, somebody keeps the number of souls, and has rubbed it out and written it again many times.
- Notice: No singing above the tending note.
- Lore: A list of doors in Rooke's hand, each with a mark like a leaf. Some marks have a second stroke through them.
- Lore: A child's drawing of a wagon, with the horses given too many legs.
- Task, **Three doors.** "Tonic for the pencilled doors, from the surgery. Knock once." Carry Rooke's tonic to three marked doors.
- Task, **Water for the end house.** "The end house cannot come to the well." Draw two pails and leave them on the step.

### The Low Rings: the board at the gangway
*Where:* nailed to the first roof, at the end of the gangway.
- Notice: BY ORDER OF THE MOOT. THE LOW RINGS ARE CLOSED UNTIL THE WATER IS PUT RIGHT. The date has been scraped off.
- Notice: Under it, in pencil: LEAVE THE WATER ALONE.
- Lore: A row of notches down the board's edge, each with a year cut beside it, each a hand higher than the last.
- Lore: A scrap of ledger paper: "took only what was ours. Left the cashbox."
- Task, **The chandler's book.** "My husband's day-book is in the loft over the shop. I am in the Ladder now and cannot fetch it. Mind the third board." Bring the book out of the chandler's loft.

### Greenroot: the board by the mill
*Where:* on the mill wall. Greenroot is empty on purpose, so this board gives no task.
- Notice: The chapel reed to be re-cut on Rootday next.
- Notice: In the physician's hand: THE WARD IS FULL. Do not bring them to me. Send, and I will come.
- Notice: Meal, by the peck. The prices have been chalked up, rubbed out and chalked lower.
- Lore: A notice begun in good ink, "To whoever comes after us," and nothing after it.

### The three boards that exist
Add two pieces of lore to each, in the same hand as what is there:
- **Oakhaven:** "The North Gate shuts at dusk. It does not open for a voice you know." And: "Lamp oil, four pence the pint. Five by the thaw."
- **The Sunken Court:** "Do not speak to the residents. Do not finish their sentences." And, in Veil-grey ink: "Two hundred and four in the Plaza of the Willows. Counted."
- **The Deep Woods camp:** "Fire small. Watch doubled. Nobody goes north alone." And, in Mags's hand: "Whoever took the good kettle, I know."

## 5. Canon these lines lean on

The Timber Compact, its strike fund and its eleven men "not anywhere" (Vol II; Phase 16). Cantabile's broadsheets as the reason anyone knows about Whisper-Grove, and "four papers, all libellous, one occasionally correct" (Vol I, II). The Hedge planted in autumn 417 with "raw wool from every sheep in the Reach" (Book Four). "Eight hundred sheep a fair-day"; Gideon Thrale; Tamar Farrant; the barrow rhyme (Phase 22). Article Sixteen, slack-water dues to the Harbour-Queen's own hand, six sovereigns a hull, nobody sleeps ashore, the Cay's bare hooks, "every shroud in the harbour carries a chime" (Vol IV, V; Phase 17). The Hollow's thirty-one households, pencilled doors, Rooke's list, the Grafters' Rootday wagon, the tending note (Book One). The Low Rings abandoned since the Flume began over-pumping (Vol II), and "LEAVE THE WATER ALONE" pencilled on a desk there (Phase 16); that the Moot closed them by order is new. Greenroot's chapel with a silent reed, its physician and locked ward (Vol II). Lamp oil at four pence, five by the thaw (the Library). Two hundred and four loops in the Plaza of the Willows (Book Four). Relief Station Nineteen (the game).

## 6. Questions for the owner

1. **All the text above.** *Recommend: approve as written; say which lines to change.*
2. **Distances on the Reach's posts** ("half a day", "a day and a half"). Only "Greenroot, two days" is from the books; the rest divide it. *Recommend: keep.*
3. **Greenroot's board gives no task,** because the hamlet is empty on purpose. *Recommend: keep.*
