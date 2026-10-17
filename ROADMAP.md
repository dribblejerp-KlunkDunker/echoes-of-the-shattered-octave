# Echoes of the Shattered Octave — Master Roadmap

This document tracks the full evolution of **Echoes of the Shattered Octave — Book One: The Silenced Province**, from the completed hand-painted 26-enemy animation pass and Daggerfall-style regional travel maps through the ten highest-impact upgrades and all nine domain expansions (World & Exploration, Combat, Character & Progression, Items & Economy, Quests & Story, Companions, Audio, Visuals, Interface & QoL, and Technical).

---

## Next expansion: art, animation, simulation and tools

The checklist below is the authoritative scope for the new request. The older completed checklists later in this document describe the previous baseline, **not** completion of these enhanced versions. `[~]` means a partial implementation or pilot; `[x]` requires implementation and verification. No production republish is included.

### Delivery order and gates
1. **Visual identity pilot (current):** five-view Proctor, emissive Light-glass and equipment paper doll. Preserve saves, attack/walk animation, picking and inventory controls. Generated pixel illustrations are a pilot, not a claim of finished hand-painted art for every enemy.
2. **Combat life:** expand directional art to every creature; death/flinch, first-person weapon sequences and drawn fire. Verify all enemy families, corpse cleanup and weapon timing.
3. **Daggerfall systems:** lockpicking → crime/prison → traps, then stealth tools and physical puzzles. Persist state and test success/failure/escape and old-save defaults.
4. **Spatial renderer:** variable wall heights → raised floors/stairs/ramps → ceilings, reflective water, skies and grounded fog. Needs per-pixel depth, camera elevation, collision and picking to agree; do not bolt height onto the existing single-depth-per-column renderer.
5. **Living world and illustrated interface:** routines, scenery, portraits, panels and story presentation.
6. **Audio, access and distribution:** positional audio, quality budgets, accessibility, translation, mod/editor interfaces and desktop packages.

Every phase must retain the security regression tests and save/load behavior. Rendering changes need browser screenshots (day/night, indoor/outdoor, near/far), representative frame-time measurements before performance claims, and keyboard/touch/gamepad regression checks. Target low-end presets only after measurements on representative hardware; do not promise Chromebook frame rates from a server benchmark.

### Graphics — 3D view
- [~] Five-angle enemies: front/front-side/side/back-side/back, mirror opposite views. First pass is a Proctor pixel-art pilot; remaining species and final painted directional action sheets are pending.
- [ ] Variable-height low walls, tall towers and stepped rooftops; correct occlusion behind low walls.
- [ ] Stairs, ramps, raised platforms: Belfry and quarry terrace traversal with elevation-aware collision.
- [ ] Painted Cloister ceilings, tavern beams and cave rock ceilings (existing texture support is only a foundation).
- [ ] Area sky panoramas, drifting clouds, night stars and Part Three Kestrel flyovers.
- [ ] Water sky/building reflections and step-driven ripples in Whisper-Grove.
- [~] Light-glass emissive highlights and nearby wall light: Kaelen, shards and glass lamps. Light occlusion and dedicated arm masks remain later work.
- [ ] Ground-hugging Spectral Woods mist and torch-driven interior darkness.
- [ ] Higher-detail close-up wall artwork with asset-resolution and memory budgets.
- [ ] Moss, cracks, scorch marks, posters and Synod notices as seeded wall detail layers.
- [ ] More barrels, crates, carts, broken statues, graves and bones, placed without blocking routes.
- [ ] Swaying, player-reactive grass and reeds.
- [ ] Geographic landmark placement: Mausoleum tower across Deep Woods and Oakhaven chapel beyond Hedge (baseline silhouettes already exist).
- [ ] Low/medium/high sharpness, view distance and particle presets; measure each before tuning defaults.
- [ ] Refine optional CRT scanlines and curvature; retain a clean unfiltered setting.

### Graphics — menus and screens
- [ ] Carved-wood panel frames and brass corners throughout.
- [~] Equipment-linked paper doll: armour layers and selected weapon, preserving equip/remove controls; final painted character/gear sheets pending.
- [ ] Painted icons for every weapon, armour piece, potion and quest item.
- [ ] Angry, sad, afraid and wry conversation portraits for Kaelen, Lyra and major NPCs.
- [ ] Quest-specific logbook sketches.
- [ ] Area-specific painted loading screens.
- [ ] Cause-specific illustrated death screens.
- [ ] Full-screen illustrations for each Book One ending.
- [ ] Locally bundled, licensed blackletter title/heading font, with readable body text.
- [ ] Painted automap stamps for doors, quest givers, shops and dangers.

### Animation — enemies and creatures
- [ ] Dedicated hit-flinch artwork for every enemy (not just tint/deformation).
- [~] Three cached collapse poses generated from existing artwork; solid bodies persist until area departure, nonblocking/unpickable and excluded from saves. Browser lifecycle checks cover all 26 species. Bespoke hand-painted death sheets remain pending.
- [ ] Species-specific idle fidgets: robes, sniffing hounds, Quiet head turns.
- [ ] Detection turn/startle frames synchronized with hearing/sight alerts.
- [ ] Separate fleeing/charging running strides.
- [ ] Pressman/Deacon casting poses with pre-cast glow and readable timing.
- [ ] Requiem half-health shatter and Brood-Mother egg-sac shedding artwork.
- [x] Drowned Hollow sinking deaths on water/shallow-water floors; dry-land Hollows collapse and leave bodies. Verified clipping/fade, termination and dry-floor behavior in Chromium.
- [x] Swarm/Hush-Moth outward-scattering deaths using cached radial pixel fragments, fading without a corpse. Both species verified in Chromium.
- [ ] Grave emergence, ceiling drops and mist entrances with collision-safe spawn telegraphs.

### Animation — companions and NPCs
- [ ] Kaelen/Lyra hit reactions, injury poses and limping.
- [ ] Kaelen chest-holding Root-note pose synchronized with existing low-health hum.
- [ ] Lyra's visible musical air ripples.
- [ ] Camp sharpening/warming-hands loops.
- [ ] Townsfolk talking gestures/head turns.
- [ ] Daily work/tavern/home routines, with time skips and quest availability preserved.
- [ ] Cat/crow/rat walk and flee sheets; react to running.
- [ ] Miller, tanner and barman working loops.

### Animation — first person
- [~] Weapon-family wind-up/strike/recovery choreography across all 16 catalog weapons, using existing first-person images with grip-pivot rotation/translation/scale. Bespoke multi-frame painted swing sheets remain pending.
- [~] Mace/maul/axe overhead arcs, knife/spear thrusts, mirrored blade sweeps and ranged recoil implemented and verified. No staff exists in the current weapon catalog; staff artwork/moves remain pending.
- [ ] Draw, holster and weapon-switch transitions.
- [ ] Raised hands and Song-coloured casting glow.
- [ ] Optional gentle head bob and landing dip.
- [ ] Heavy-hit shake, deafness blur and Hushed grey/muffled effects, respecting access settings.
- [ ] Swinging doors, lifting chest lids and pulling levers.
- [ ] Ladder/climbing hands coordinated with traversal.
- [ ] Full-screen held notes/books with accessible readable text.

### Animation — world
- [~] Campfire/hearth sprites now use four cached, distinct flame silhouettes generated from their existing painted warm-colour pixels; logs/stone remain anchored. Torch/brazier assets and bespoke drawn fire sheets remain pending.
- [ ] Chimney, Golem-vent and campfire smoke.
- [ ] Player/enemy water splashes.
- [ ] Wind-driven signs and banners.
- [ ] Seasonal/area-specific leaves and blossom.
- [ ] Chapel/Belfry bell swing synchronized with ringing.
- [ ] Moored Kestrel drift/turn animation.
- [ ] Glimmering dropped Light-glass shards.
- [ ] Animated gates/portcullises with collision opening thresholds.
- [ ] Story-driven wall collapses/quarry cave-in, with safe player recovery.

### Gameplay
- [x] Skill-based three-pin lockpicking for tier-2/3 strongboxes and the Cloister vestry mechanical lock. Keyboard arrows/Space/Enter/Escape, touch buttons and controller D-pad/A/B supported. Story seals remain gated. Successful unlocks advance Lockpicking; higher ranks widen the safe band, slips cost Fatigue/noise and three slips end the attempt. No consumable pick/breakage system in this milestone.
- [ ] Pickpocketing based on NPC attention and player position.
- [ ] Drag/hide bodies; patrol discovery and alarm behavior.
- [ ] Synod robe disguises, proximity inspection and detection.
- [ ] Directional on-screen sound ripples, paired with positional sound.
- [ ] Throwable stone/bottle distractions and guard investigation.
- [ ] Spot/disarm tripwires, falling nets and alarm-bell traps.
- [ ] Note locks, pressure plates and turning-mirror puzzles in Cloister/Catacombs.
- [~] Oakhaven crime foundation: explicitly owned market honey prompts before theft; visible nearby NPC witnesses report a bounty, and the constable pursues with line of sight. Character sheet shows bounty/time served. Broader owned goods, assault and additional guard behavior remain pending.
- [ ] Player wanted posters after crime thresholds.
- [~] Guard intervention offers a checked gold fine, refusal with escape grace, or six hours of time-served jail and release at the town watch. Inventory/quest gear remains intact. Playable prison, confiscation and jail escape remain pending.
- [ ] Personality bribes and Strength threats in dialogue.
- [ ] Horse rental and world-map travel modifiers.
- [ ] Optional hunger/sleep needs over long journeys.
- [ ] Opt-in hardcore single-save/permadeath, isolated from normal saves/imports.

### Story and world-building
- [ ] Deed-sensitive tavern rumours.
- [ ] Synod broadsheet with changing editorial spin.
- [ ] Courier letters from helped NPCs.
- [ ] Rest dream scenes about the Shattered Octave.
- [ ] Light-glass memory echo scenes.
- [ ] Collectible Tobin journal pages and completion tracking.
- [ ] Choice-dependent Kaelen/Lyra endings.
- [ ] Organum, Iron Peaks and Rift lore teasers.

### Audio
- [ ] Distinct area/dungeon compositions for Oakhaven, Whisper-Grove and Deep Woods.
- [ ] Individual boss themes (not just shared boss-mode cues).
- [ ] Authored greetings/grunts per NPC/enemy; voice asset/license tracking (optional TTS already exists).
- [ ] Directional audio with wall muffling and distance falloff.
- [ ] Willow wind, rooftop rain and thunder layers.
- [ ] Story-evolving main theme across Book One.

### Technical and polish
- [ ] Audit/expand credits for all art, fonts, audio, tools and contributors.
- [ ] Photo mode: hide interface, pause safely and export a screenshot.
- [ ] Optional speedrun timer with pause/loading policy.
- [ ] Statistics page: kills, distance, playtime and Songs cast.
- [ ] Larger text, reduced shake, no flashes and high contrast across every new effect.
- [ ] Translation message catalog, locale selection, fallback and text expansion tests.
- [ ] Windows/macOS/Linux desktop packages, licenses, signing/update decisions and platform input verification.
- [ ] Versioned quest/enemy/map mod schemas with validation; no arbitrary script execution from imported content.
- [ ] Built-in dungeon editor using those schemas, preview/playtest and safe export/import.

### Crime-foundation pass verification
- Crime data (bounty, theft count, served hours) uses existing saved player data and normalizes imported values; old saves default to no crime. New town entities append after historical world extras to preserve entity-index ordering.
- Only the explicitly owned market honey invokes theft confirmation; cancellation and unowned loot create no theft, and duplicate pickup cannot duplicate stolen goods.
- Chromium verifies witnessed/unwitnessed theft, hidden witnesses and wall occlusion, bounty save/load, guard pursuit/intervention, insufficient funds, exact fine deduction, refusal/grace and jail release.
- Jail advances world time six hours, clears the bounty and preserves all inventory/quest equipment. It is a time-served resolution, not yet a playable prison map.
- Existing lockpicking, visual, death, weapon/fire, hostile-save and gameplay smoke regressions pass. Human visual review and long-form balance playtesting remain outstanding.

### Lockpicking pass verification
- Unlocks use existing `G.flags` keys per map/target; no save-version change. Missing Lockpicking skill in old saves defaults to 15.
- Chromium verifies real vestry interaction and a complete keyboard solve, touch button input, controller press/release edges, cancellation, three-slip failure and skill-dependent tolerance.
- Locked strongboxes pay nothing before success or on cancellation; dead/hidden chest guards prevent duplicate loot. Story `cell.locked` gates are never pickable.
- Save/load retains door unlock flags. Success advances progress or increases rank at the existing skill threshold. Existing browser, hostile-save and gameplay smoke regressions pass.
- Visual art review and physical-controller hardware testing remain outstanding; controller polling is tested with a browser Gamepad API fixture.

### Weapon-motion and fire pass verification
- Chromium exercises all 16 weapon overlays at five progress points, four motion families, mirrored slashes and resting sequence endpoints.
- Pure pose evaluation leaves combat state unchanged; the real `attack()` entrypoint retains its catalog cooldown, fatigue cost and duplicate-input lock. Damage/hit logic is unchanged.
- Campfire and hearth each have four distinct cached frames; source pixels and fuel-bed pixels remain unchanged. The renderer resolver advances frames with the animation clock.
- Existing direction, equipment, lighting, corpse and save/load browser regressions remain passing. These are transformed existing assets, not bespoke painted swing/fire sheets; art review remains outstanding.

### Combat-life pass verification
- Generated death artwork is cached by source/view and pose (three collapse poses or eight special poses), not allocated every frame or for every body.
- Real `killEnemy` regression confirms rewards once, one body per death, corpse picking disabled, persistent opaque final pose and no collision.
- All 26 catalog species pass death-art/cache/termination checks in Chromium; Hollow water/dry transitions and both scattering swarm species have dedicated assertions.
- Real `snapshotGame`/`restoreGame` preserves killed enemy state while omitting transient body artwork. Existing save version is unchanged; corpses intentionally do not survive reload.
- Area transfer clears session corpse/effect entities immediately; returning cannot resurrect them. Final hand-painted collapse art, directional species expansion, weapon sheets and drawn fire are still pending.
- Browser assertions and screenshots are not a substitute for human visual art review. No low-end performance claim has been made.

### Current pass acceptance
- Keep `index.html` script order and existing save schema compatible; no new dependencies or services.
- Direction choice uses enemy heading, not camera heading; mirror only opposite oblique views, retain animation poses and safe fallback for species without sheets.
- Glass emitters illuminate the existing wall/floor renderer and stop emitting when hidden/dead.
- Inventory doll reflects all five armour slots, selected weapon, portrait and two-handed shield suppression; HTML uses only validated catalog data.
- Verify syntax, hostile-save regression, directional octants, doll gear variants and lighting render output. Do not count headless DOM stubs as visual inspection.

---

## Status Legend
- `[x]` **Shipped & Verified** — Live in the game and playable now.
- `[~]` **In Progress** — Active pass underway.
- `[ ]` **Planned** — Scheduled for future books or passes.

---

## Foundation: Completed Milestones

### Hand-Painted Enemy & Companion Frames (All 26 Enemy Types + Kaelen & Lyra)
- `[x]` **12 Main Enemies**: Walking steps (`_w1`, `_w2`), attack wind-up (`_a1`), and strike (`_a2`) for Proctors, Legionnaires, Weaverlings, Drowned Hollows, Cacophony Hounds, the Tongueless, Office Marines, Outriders, Chord-Wardens, and the Wearer; drifting and lashing frames for Dirges and Quiets.
- `[x]` **9 Bosses & Mini-Bosses**: Steam Golem, Aegis Sentinel, Pressman Mallow, Phantom Weaver, The Requiem, The Brood-Mother, Deacon of the Unrung Bell, Outrider-Captain Hal Brennick, and Office Hushwardens.
- `[x]` **Hush-Moths**: Wings beat up and down as the cloud drifts; spirals into a tight funnel before diving at you.
- `[x]` **Cacophony Swarm**: The cloud leans and spreads as it drifts, pulls into a tight knot, then bursts toward you.
- `[x]` **Office Listening-Horn**: Swivels slowly back and forth (`_w1`, `_w2`), tilts toward you as its alarm timer runs down (`_a1`), and swings round to face you (`_a2`) when alerting the grey coats so you can read the alarm coming and silence it first.
- `[x]` **Kaelen & Lyra Companion Frames**: Kaelen walks, cocks his left glass arm back, and brings it down like a hammer for *Dissonant Blade*. Lyra sings with a hand on her chest when tending you, and throws her arms wide for the *Calling-Song*.

---

## Top 10 Biggest-Impact Upgrades

| # | Upgrade | Status | Notes / Implementation |
|---|---------|--------|------------------------|
| 1 | **Kaelen and Lyra frames** | `[x]` | Walking, Kaelen's *Dissonant Blade* (glass arm stays his left in every frame), and Lyra's *Calling-Song* & tending pose (`js/anim.js`, `js/assets.js`). |
| 2 | **Daggerfall-style World Map** | `[x]` | Continent view (*The Long Octave*) + regional maps (*The Resonant Reach*, *The Spectral Woods*), travel time, Cautious/Reckless pace, and road ambush encounters (`js/travel.js`). |
| 3 | **Spellmaking for Songs** | `[x]` | Combine Root Notes (174 Hz, 285 Hz, 396 Hz, 528 Hz, 639 Hz, 741 Hz), Intervals/Cadences (Unison, Falling Fifth, Third Above, Seventh, Octave), and Dynamics (Murmur, Narrow, Full Voice) into custom named Songs in the Song-book (`js/upgrades.js`). |
| 4 | **Procedural Dungeons** | `[x]` | Procedural Root-Catacombs & Sunken Vaults accessible from Oakhaven Quarry, Whisper Catacombs, and the Deep Woods — infinite replayability with seeded floors, keys, levers, resonant walls, and scaled loot (`js/upgrades.js`). |
| 5 | **Factions & Reputation** | `[x]` | Standing with the **Hedge Folk**, **The Choir-Church & Synod**, **The Office of the Catalogue**, and **The Free Captains** — shifts merchant prices, dialogue reactions, titles, and quest access (`js/upgrades.js`). |
| 6 | **Voiced Key Lines (TTS)** | `[x]` | Web Speech API voice synthesis with distinct pitch/rate profiles for Kaelen, Lyra, Sable, Vane, and bosses (Wearer, Requiem, Aegis, Deacon), toggleable in Options (`js/upgrades.js`). |
| 7 | **Expanded Dynamic Music Director** | `[x]` | Separate cues and harmonic layers for exploration, combat, towns, interiors, and boss phases with smooth crossfading and alert-swell when enemies spot you (`js/audio.js`, `js/upgrades.js`). |
| 8 | **Coloured Dynamic Lighting & Day-Night** | `[x]` | Per-column & per-sprite coloured light tinting from warm torches/hearths, green-gold Light-glass, and lilac mist; visible day-night sky/ambient cycle with darker nights and player lantern/torch toggle (`js/engine.js`, `js/upgrades.js`). |
| 9 | **Book One Ending Sequence & Credits** | `[x]` | Multi-ending sequence reflecting every major choice across Parts 1–4, scrolling credits, run summary, and the *"Book Two: The Rust Coast & Port Cantabile"* hook (`js/upgrades.js`). |
| 10 | **Difficulty & Accessibility Menu** | `[x]` | Narrative / Standard / Narrow-Master difficulty, adjustable controls & key rebinding, subtitles/captions, colourblind-safe HUD markers, CRT scanlines, Bayer dithering, and pixel scale (`js/upgrades.js`). |

---

## Domain Roadmaps

### 1. World & Exploration
- `[x]` **World Map & Fast Travel (`T`)**: Fills in as you explore; travel between discovered waypoints with Cautious/Reckless ambush risk.
- `[x]` **Weather System**: Rain, thick fog banks, and ash/snow in the Deep Woods — dynamically modifies how far your noise carries in the Narrow and how far enemies can see.
- `[x]` **More Indoor Buildings & Lore Bookshelves**: Enterable Oakhaven houses (the Baker's, the Chandler's, the Buyer's House on Cooper's Row) with readable bookshelves containing series bible lore volumes.
- `[x]` **Resonant & Breakable Secret Walls**: Hidden chambers behind cracked masonry or resonant stone that only open when struck or sung to with the right frequency.
- `[x]` **Swimming & Climbing**: Wade and swim through drowned sections in Whisper-Grove and the Under-hedge (managing breath/fatigue), and climb steep ledges/walls using your Climbing skill.
- `[x]` **Distant Landmarks**: Silhouette rendering on the horizon for the Dawning Spire, the Quarry Headframe, the Cloister Belfry, and the Mausoleum Tower.
- `[x]` **Ambient Life**: Birds, rats, wandering villagers, market stalls, and night watchmen on patrol.
- `[x]` **Foraging, Fishing & Harvesting**: Gather willow-bark, reed-pith, and moon-moss; fish at the Flume crossing and sunken pools; harvest raw Light-glass shards from glassrock veins.

### 2. Combat
- `[x]` **Directional Melee (Daggerfall-style)**: Drag the mouse to choose **Thrust** (high accuracy, armor-piercing), **Slash Left/Right** (wide arc, bonus vs unarmored), or **Chop Down / Cut Up** (high damage, bonus stagger, lower accuracy).
- `[x]` **Blocking & Parrying (`Right-Click` / `F`)**: Raise your weapon or shield to block; time it within the parry window during an enemy's `_a1` wind-up frame to deflect the blow and stagger the attacker.
- `[x]` **Enemy Weak Points**: Aim high or thrust accurately to strike the Steam Golem's open furnace, the Aegis Sentinel's violet chest-core, or a Proctor's hand-press.
- `[x]` **Status Effects**:
  - **Bleeding**: Damage over time until bandaged or tended.
  - **Deafened**: Cannot cast Songs or hear enemy audio cues.
  - **Hushed**: Noise locked near zero — accelerates Unwriting in siphoned areas.
  - **Frightened**: Reduced attack accuracy and trembling view.
- `[x]` **Expanded Ranged Weapons**: Rust Coast Crossbow, Glass-Shot Pistol, and **Throwing Knives** (silent, fast, retrievable).
- `[x]` **Stealth Kills**: Backstab unaware (`idle`) enemies from behind for 3× critical damage (4× with Carder's Knife or throwing knives).
- `[x]` **Enemy Morale**: Humanoid enemies call nearby allies on alert, flee at low health, and may surrender (offering sovereigns, lore, or their name for the Ledger).
- `[x]` **Boss Phases**: The Wearer, the Requiem, the Phantom Weaver, and the Brood-Mother shift tactics, summon aid, or alter frequencies at 50% health.
- `[x]` **Elite Named Enemies**: Veteran Legionnaires, Arch-Proctors, and Elder Hounds with distinct names, golden aura tint, higher stats, and guaranteed rare loot.
- `[x]` **Arena / Trial of the Narrow**: Challenge room in the Under-hedge / Deep Woods with waves of enemies for unique rewards and titles.

### 3. Character & Progression
- `[x]` **Use-Based Skill Progression**: Daggerfall-style skills (*Blade*, *Blunt*, *Firearms*, *Law-Song*, *Stealth*, *Climbing*, *Mercantile*, *Glasswork*, *Lore*, *Physician*) that level up as you use them alongside character XP.
- `[x]` **Custom Class Builder**: Build your own calling during character creation with selectable Advantages (e.g., *Pitch-Perfect*, *Hedge-Step*, *Iron Lungs*) and Disadvantages (e.g., *Glass-Sensitive*, *Loud Footfalls*, *Frail Voice*).
- `[x]` **Background / Origin Choices**: *Hedge-Born*, *Synod Orphan*, *Office Deserter*, *Rust Coast Drifter*, or *Dawning Choir Survivor*.
- `[x]` **Level Perks**: Choose a permanent perk every 2 levels (*Bell-Breaker*, *Silent Step*, *Resonant Lung*, *Parry Master*, *Glass-Drinker*, *Scribe's Eye*).
- `[x]` **Visible Injuries & Scars**: Heavy blows can leave injuries (cracked ribs, torn throat, glass-burn) that show on your character sheet and heal with rest or at Surgeon-Grafter Rooke's table.
- `[x]` **Reputation Titles**: Earn titles recognized in dialogue and on your sheet: *Bell-Breaker*, *Friend of the Hedge*, *Keeper of Names*, *Bane of the Catalogue*, *Singer in the Dark*.

### 4. Items & Economy
- `[x]` **Weapon Durability, Forges & Repair**: Weapons wear down with use (`cond`); repair and temper them at anvils/forges or with whetstones.
- `[x]` **Light-Glass Enchanting**: Imbue iron and bronze weapons with harvested Light-glass shards for harmonic damage (174 Hz Mending, 528 Hz Sun-Shard, 741 Hz Unnaming).
- `[x]` **Buy & Decorate a House in Oakhaven**: Purchase the shuttered house on Cooper's Row from the Greenhall factor; includes a personal storage chest, a safe bed with a permanent hush-lamp, an alchemy bench, and display trophies.
- `[x]` **Dynamic Shop Stock**: Merchant inventories expand and shift after major story milestones (the Rite, Whisper-Grove, Deep Woods).
- `[x]` **Rare Named Weapons with Lore**:
  - *Tobin's Tuning-Blade* (tied to Tobin Ashgrove's disappearance in 417)
  - *Vesper's Boarding Hook* (from the *Wave-Cutter*)
  - *The Unrung Mace of Dawning*
  - *Sable's Ivory Nib-Dagger*
- `[x]` **Bartering & Haggling**: Offer below asking price in shops; success scales with *Personality*, *Mercantile* skill, and faction standing.
- `[x]` **Item Weight & Encumbrance**: Carried weight vs. Strength-based capacity; exceeding it slows movement and increases footstep noise.
- `[x]` **Potion Brewing (Alchemy)**: Brew tonics, voice-draughts, hush-oils, and glass-salves from foraged herbs at campfires or alchemy tables.

### 5. Quests & Story
- `[x]` **Series Bible Side Quests**:
  - *The Year 417 (Tobin's Disappearance)*: Trace Tobin Ashgrove's last night at the Hedge and recover his tuning-fork and journal.
  - *The First Glass (Light-Glass Origins)*: Uncover the Dawning Choir specimen in the Root-vault.
  - *The Root Note*: Help the night-hummer and Cantor preserve the true 174 Hz cadence before the Rite.
- `[x]` **Consequential Choices**: Spare or kill bosses, side with factions, and unlock or close off faction quests and endings.
- `[x]` **Lyra's Personal Companion Quest**: *The Calling-Song's Coda* — recover Tobin's slate and help Lyra reconcile her father's sacrifice.
- `[x]` **Kaelen's Personal Companion Quest**: *Line Ninety-Four* — examine the Dawning bore-shard and ease or harden the tideline in his glass arm.
- `[x]` **Bounty Boards & Repeatable Guild Quests**: Town and camp noticeboards offering randomised hunts, courier runs, and name-recoveries.
- `[x]` **Journal Quest Maps & Toggleable Markers**: View objective locations on the automap/world map, with a toggle to play pure 1996 no-marker style.

### 6. Companions
- `[x]` **Companion Approval**: Kaelen, Lyra, and Sable react to your mercy, ruthlessness, and Ledger choices; high approval unlocks personal perks and combo attacks, while very low approval can make them return to camp.
- `[x]` **Party Banter**: Contextual exchanges between Kaelen, Lyra, and Sable as you travel.
- `[x]` **Companion Gear Slots**: Equip your active companion with a weapon, body armour, and trinket.
- `[x]` **More Companions from the Series Bible**: Recruit **Sable** (Archivist of the Veil — reads names to stun/unwrite enemies) and **The Calmed Aegis** (in Part Four) alongside Kaelen and Lyra.
- `[x]` **Camp Scenes on Rest**: Optional fireside conversations when resting with a companion.
- `[x]` **Companion Combo Abilities**: Trigger *Resonant Coda* (Lyra's song supercharges Kaelen's glass arm or your weapon for a devastating harmonic strike).

### 7. Audio
- `[x]` **Surface-Aware Footsteps**: Distinct procedural acoustics for stone/cobble, wood planks, grass/moss, and shallow/deep water.
- `[x]` **Cave & Cathedral Echo / Reverb**: Procedural delay/reverb tail inside the Quarry, Root-vault, Whisper Catacombs, Cloister, and Mausoleum.
- `[x]` **Distinct Enemy Sound Sets**: Idle, alert, attack, hurt, and death sound synthesis per enemy family.
- `[x]` **Kaelen Humming the Root Note**: When Kaelen (or a Dissonant Blade player) is badly hurt (<35% HP), a low 174 Hz hum rises under the audio mix, just as described in the series bible.
- `[x]` **Dynamic Alert Music Swell**: Music swells in tension when enemies spot you and fades smoothly back when you break line of sight.

### 8. Visuals
- `[x]` **Reactive HUD Portraits**: Daggerfall-style player and companion portrait in the HUD that reflects health state, glassing stage, and damage flashes.
- `[x]` **Retro Visual Settings**: Toggleable CRT scanline/curvature filter, Bayer dithering intensity, and internal pixel resolution scale (1× chunky 320×200 or 2× crisp).
- `[x]` **Combat & World Particles**: Sparks on armour/metal hits, blood droplets on flesh hits, and cyan-gold Light-glass shimmer on glass/song strikes.
- `[x]` **Decorated Interiors**: Tapestries, banners, bookshelves, forges, and alchemy tables across interiors.
- `[x]` **Animated Title Screen & Cutscene Stills**: Drifting mist/spores on the title screen and illustrated canvas vignettes on major chapter transitions.

### 9. Interface & Quality of Life
- `[x]` **Expanded Save Slots & Boss Autosave**: 6 session slots with thumbnail previews, portable save codes/files, plus automatic save slot before boss fights.
- `[x]` **Controller / Gamepad Support**: Full HTML5 Gamepad API support (left stick move, right stick look, triggers attack/block, D-pad weapons/songs, face buttons interact/panels).
- `[x]` **Key-Rebinding Menu**: Customise movement, interact, song-book, block/parry, and panel hotkeys.
- `[x]` **Minimap Toggle (`Tab-M` / HUD)**: Optional corner minimap overlay during play.
- `[x]` **Interactive Tutorial**: Optional in-play contextual lessons teaching the Narrow (noise vs. stillness), directional swings, parrying, and Songs.
- `[x]` **Shop Tooltips & Item Comparison**: Side-by-side stat deltas (`+AR`, `+dmg`, `noise`, `weight`) when browsing merchants or inventory.
- `[x]` **In-Game Bestiary & Lore Codex**: Automatically records all 26 enemy types as you encounter/defeat them (with their drawn sprite frames and weaknesses) plus series bible lore entries and tracked Achievements.

### 10. Technical & Platform Notes
- `[x]` **Enhanced Touch Controls**: Responsive virtual thumbstick, swipe-to-slash directional Strike button, Block/Parry button, and clean scaling on phones and tablets.
- `[x]` **On-Demand Asset & Audio Streaming**: Fast startup with progressive audio/map initialisation.
- `[x]` **Automated Quest & Systems Smoke Suite (`window.runOctaveTests()`)**: Built-in automated playthrough and systems verification suite that tests quests, combat, spellmaking, procedural dungeons, and save/load integrity.
- `[x]` **Preview Host Compatibility**: Graceful handling of sandboxed iframe restrictions (session slots + copyable save codes when `localStorage` is blocked, free-look mouse without requiring Pointer Lock, and in-window fullscreen scaling).
