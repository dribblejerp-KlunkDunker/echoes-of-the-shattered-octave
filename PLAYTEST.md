# Playtest checklist

This file lists what the automated tests cannot judge: feel, timing, how busy or quiet a place is, and whether a scene reads well. It is updated as each milestone lands. Newest items are at the top. Tick a box when you have looked, and write what you found under **Notes** in each section. Claude reads those notes and turns them into fixes or gate notes.

**Getting around quickly**
- **Rest** (the REST button) moves the clock 4 or 8 hours. Use it to reach dusk, night or noon.
- **The test console** opens with Shift + ` (backquote). Its codes are `richman` (money), `octave` (every Song), `ghostmode` and `showme` (reveals the map). Using any code marks the save.
- **Reaching each area:**
  - Oakhaven's interiors are behind their doors.
  - The Watch Downs are west of the clearing.
  - Wethercombe is past the Downs stile.
  - The Flume Road runs from Oakhaven's east Hedge door.

---

## R4: the thin places (merged 27 Oct, PR #68)
- [ ] **The baker's** (the north row, near the North Gate). Agnes Tull at the trough at night. Is her bread priced right?
- [ ] **The chandler's** (east of the square). Ambrose Vettle sells hush-whistles.
- [ ] **Street life in Oakhaven.** Too much, too little, or about right?
  - The tanker-wagon with two Legionnaires, about 10:00–10:45
  - Dogs at noon
  - The iron-oaks chiming when the wind is up
  - The sapling on Cooper's Row in the morning (saw it down; it's back the next day)
  - The sexton's salt by the chapel at dawn
  - The baker's thumping, heard near her shutters at night
- [ ] **Bettany, Hob and Old Tam move between their day and night places.** Do they ever pop in or out where you can see it? They shouldn't.
- [ ] **The Watch Downs:** Abel Sedge by the fold says "There are no sheep". Drink from the dew-pond (once a day).
- [ ] **Wethercombe:** the farmhouse (Mother Hurst), the barn (Jem Cotter) and the cottage open. At the Bellwether, rent the room upstairs (3) and read the slate of tabs.
- [ ] **The Flume Road:** Ennis Crowle and her skeps. Talk to her before, during and after Bettany's Telling the Bees.
- [ ] **The tannery:** two hands at the vats. The back door to the Hollow is shut for now.
- [ ] **The Low Rings and Stillwater Landing:** the punt-poler, the salvager, the smuggler, the broadsheet-seller and the board. Does the Landing feel like a "smugglers' town"?

**Notes:**

## R3: the Narrow comes home (merged 27 Oct, PR #67)
**Its gate needs your note: does Oakhaven feel tense but fair?**
- [ ] **The Narrow as law:**
  - Sprint, swing or sing loudly in front of townsfolk. Is the ward-sign too touchy, or not touchy enough?
  - A second breach soon after brings a 10-sovereign fine.
- [ ] **The Listening Hour** (new games start at dusk):
  - The lamplighter walks the lanes lighting lamps one by one. How does he look walking?
  - Night-hummers sit at three crossings.
  - The dead-hour call: "all's well, all's quiet, keep to the Narrow".
  - By day the lamps are dark.
- [ ] **Songs from people**, through Hold the Pitch:
  - Lyra teaches the Root note.
  - Bettany teaches the tending breath (18).
  - Old Tam teaches "The Miller's Daughter", once you have told him the truth at the Flume.
  - Tobin's reed-pipes in Lyra's house teach the falling fifth, once you have read his notebook page 2.
  - Are the pitch curves too hard or too easy?
- [ ] **"The Miller's Daughter":** how loud does it feel? The hounds should go to where you sang it.
- [ ] **Hound packs:** the leader is larger, and a falling fifth on it scatters the pack.
- [ ] **Hush-lamps:**
  - Underground, standing by a lamp keeps the Hush off.
  - A hush-whistle blown outdoors or underground plants a lamp for a minute.
- [ ] **Combat rules:**
  - Below 30% health your breathing is loud.
  - A Quiet comes to your lit lantern (U).
  - Where a hound bursts, nothing carries for a while.
- [ ] **Lyra before her voice returns** (Part Four): her whistle can be aimed at the one you look at (X), and her heal is smaller.
- [ ] **Standing:**
  - Harrow and Hetty say an extra line once the Hedge thinks well of you.
  - Prices shift a little.
  - Is there no number on screen anywhere?

**Notes:**

## R2: the canon sweep (merged 27 Oct, PR #65)
- [ ] The five re-voiced dying names. Do the voices sound right?
- [ ] The Boar & Dulcimer: Garrow's bones in the cellar, and the evening set applauded without a sound.
- [ ] Orrin Pale in the chapel with the stock (the dowsing rod included); Ignatius gives his three pellets once.
- [ ] Tobin's reed-pipes in Lyra's house; the cairn "by the old stile".
- [ ] Lyra's Whistled Fifth in Part Four.

**Notes:**

## R1: release blockers (merged 27 Oct, PR #64)
- [ ] The rite warning at the shaft ("Go down." / "Not yet.").
- [ ] The house shown as "left behind" on the noticeboard once you have left Oakhaven.
- [ ] Open quests close with a logbook line when you leave (the Sheep-Walk, the Hanger).
- [ ] The Eel-Run warning at the festival.

**Notes:**

## Fixes to confirm
- [ ] **The Flume Road surge save** (PR #66): save in the middle of a surge, then load. You should wake on a dry, quiet Wash.
- [ ] **The hound's bed message** (PR #66): walk onto the bed in Kaelen's clearing. It should say it is "a little longer than a big dog".

**Notes:**

---

## What the automated tests cover
Every milestone has its own test (`test/r1release27`, `r2canon27`, `r3narrow28`, `r4thin29`), and the whole suite is run serially against main before each merge. Some tests already fail on main and are not caused by these milestones: air11, arms12, bestiary20a, creatures, folk14, folk20, height-combat, presets, pwa18, roads15, sidequests, skies14, visual, together19. They are worth a separate clean-up pass.
