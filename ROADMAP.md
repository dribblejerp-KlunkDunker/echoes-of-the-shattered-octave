# Echoes of the Shattered Octave — Master Roadmap

This document tracks the full evolution of **Echoes of the Shattered Octave — Book One: The Silenced Province**, from the completed hand-painted 26-enemy animation pass and Daggerfall-style regional travel maps through the ten highest-impact upgrades and all nine domain expansions (World & Exploration, Combat, Character & Progression, Items & Economy, Quests & Story, Companions, Audio, Visuals, Interface & QoL, and Technical).

---

## Next expansion: art, animation, simulation and tools

The checklist below is the authoritative scope for the new request. The older completed checklists later in this document describe the previous baseline, **not** completion of these enhanced versions. `[~]` means a partial implementation or pilot; `[x]` requires implementation and verification. No production republish is included.

### Delivery order and gates
The 94 unfinished checklist items at the start of this plan (85 not started, 9 partial) are grouped once below; counts include partial work, not equal-sized implementation tasks. The visual identity, combat, crime, traps, physical puzzles and pickpocketing pilots already delivered remain the baseline. Each phase is delivered in tested milestones, not one oversized rewrite.

| Phase | Scope / checklist ownership | Starting remaining | Delivery milestones |
|---|---|---:|---|
| 1 — Stealth, law & gameplay | Gameplay | 11 | **Delivered: throwable distractions + investigation** → **Delivered: body hiding/discovery** → **Delivered: disguises/inspection** → **Delivered: broader crime/wanted posters/prison** → **Delivered: bribes/threats at the watch** → **Delivered: horse rental + travel modifiers** → **Next: optional hunger/sleep** → hardcore. Directional sound feedback depends on phase 7 audio. |
| 2 — Spatial world | Graphics — 3D view | 15 | Depth/elevation foundation → low walls and stairs/ramps → ceilings/skies/water/fog → scenery/emissive occlusion → measured presets/CRT. |
| 3 — Combat life | Animation — enemies and creatures; first person | 17 | Species/action sheets → hit/detect/death/boss phases → first-person draw/holster/casting/interaction sequences. |
| 4 — Living world | Animation — companions and NPCs; world | 18 | Companion reactions/abilities → routines/work/wildlife → weather/scenery/fire/gates/collapse effects with safe collision. |
| 5 — Illustrated interface | Graphics — menus and screens | 10 | Frames/fonts/credits → inventory icons/final paper doll → portraits/log/automap → loading/death/ending illustrations. |
| 6 — Story reactivity | Story and world-building | 8 | Rumours/broadsheets/couriers → dreams/memory echoes/Tobin pages → choice-dependent endings and future-region lore. |
| 7 — Sound, access & tools | Audio; technical and polish | 15 | Positional/muffled sound → area/boss score and voice licensing → access/translation/statistics/photo/timer → validated mod schemas/editor → desktop packaging. |

Phase 1 acceptance for this pass: separate consumable stones and empty bottles (never the story Vox-Bottle); collision-clipped forward impact with readable feedback; idle guards and non-boss enemies investigate the impact, never abandon a visible wanted player or active combat; keyboard/touch/controller input; inventory save compatibility; transient sound targets cannot replay after load. No external services, production deployment, or Git delivery is included.

Body-handling acceptance for this pass: settled physical corpses can be dragged slowly with collision/line-of-sight clipping, dropped and concealed/recovered at marked nonblocking shrouded recesses. G / touch Body / controller left-stick opens a no-cost action panel; keyboard, touch and controller actions work. Visible bodies trigger one patrol alarm, drawing nearby idle allies to the body without revealing an unseen player or overriding combat. A constable witnessing an active drag can add one bounty. Hiding prevents discovery; loot and kill rewards remain independent. Bodies, concealment and alarms retain the existing current-visit-only lifecycle, cleared on departure/load/death as appropriate; dead enemies and loot still save normally. No Git delivery, deployment or external services are included.

Disguise acceptance for this pass: equip purchasable Synod clerk robes through existing armour inventory or Y/touch status/controller Back actions. Ordinary non-boss Proctors and Legionnaires ignore a covered traveller at a distance but inspect within 2.4 units of clear sight, exposing them after three cumulative seconds (twice as fast at noise 4+). Backing away/occlusion reduces suspicion. Witnessed attacks, loud/offensive Songs, throws, body dragging and changing into robes expose cover locally. Active combat, body-alarm searches, monsters/bosses, story locks and Oakhaven bounty enforcement are never bypassed. Exposure persists per area in existing saved flags; transient inspection does not. Written percentage/status feedback, inventory paper doll, keyboard/touch/controller flow, old-save and hostile-import regressions are required. Push verified milestone changes to a feature branch; no automatic merge or deployment.

Law/prison acceptance for this pass: expand Oakhaven jurisdiction to its inhabited interiors with explicitly owned non-quest goods and nonlethal civilian assault (40 bounty; four-second per-target reporting cooldown). Witnessed theft stays 20; witnesses require live, unstunned NPCs, sight and facing (constables always notice). Constables pursue visible offenders and search their last seen position without tracking through walls. Two world notices show current player/bounty at 40+, withdrawing after settlement. Arrest offers exact checked payment, refusal/grace, or a playable six-hour watch-house sentence. Non-quest inventory, ordinary weapons/armour and ammunition enter validated saved evidence escrow; quest items and innate weapons remain safe. Serve/pay for release and automatic gear return, or use existing mechanical lockpicking to reach evidence and escape; escape adds 60 once and leaves the fine outstanding. Re-arrest must preserve unrecovered evidence. Save/load, older saves, hostile imports, duplicate/stale actions, keyboard/touch/simulated-controller input, compact panels and story/loot compatibility require automated checks. Commit and push a feature branch; no merge or deployment.

Phase 2 requires per-pixel depth, camera elevation, collision and picking to agree; do not bolt height onto the existing single-depth-per-column renderer. Existing art pilots do not constitute finished hand-painted action sheets. Accessibility, save compatibility and security checks apply during every phase, not only phase 7.

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
- [x] Oakhaven adult pickpocketing: inspect eligible townsfolk/merchants at arm’s reach with P, touch Purse or controller Y. NPC-relative front/side/rear position, owner attention, noise and Stealth determine displayed lift odds. Caught attempts or third-party witnesses add a 20-sovereign bounty. One saved attempt per purse; loose coin only, no quest items or shop stock. Broader regional placement remains future expansion.
- [x] Drag/drop settled physical bodies at half walking speed without sprinting; conceal/recover them in nonblocking shrouded recesses in Oakhaven, the Quarry and the Cloister. G/touch Body/controller left-stick opens actions. Collision, closed doors and water constrain movement. Visible remains trigger one local 12-second patrol search, without overriding combat or revealing an unseen player; a constable witnessing dragging adds one 20-sovereign bounty per body. Remains/concealment/alarms are current-visit-only; enemy deaths and independent loot retain existing save behavior.
- [x] Synod Clerk Robes sold by Hob, worn through the body armour slot with grey-robed paper-doll art. Ordinary non-boss Proctors/Legionnaires accept distant cover; visible inspection within 2.4 units exposes you in three seconds, twice as fast at noise 4+. Retreat/occlusion reduces suspicion. Witnessed attacks, loud/offensive Songs, throws, dragging bodies and putting on robes break cover. Area exposure survives saves and clothes changes. Combat, body searches, monsters/bosses, story locks and bounty arrests are unaffected. Y/touch Cover/controller Back status and wear/remove actions; written inspection feedback.
- [ ] Directional on-screen sound ripples, paired with positional sound.
- [x] Throwable stones and empty bottles: collision-clipped forward impacts attract idle Oakhaven constables and ordinary non-boss enemies for 6/9 seconds. Walls reduce hearing; visible wanted players, player detection, weapon/Song hits and active combat take priority. O/touch Throw/controller right-stick opens a no-cost choice; 1/A stone, 2/X bottle. Saved inventory, old-save supply pickups, transient targets cleared on load/departure. Vox-Bottles retain their story behavior.
- [x] Three visible, inspectable Catacombs mechanisms: barbed tripwire (one-shot 5 damage), suspended net (eight-second movement slow) and alarm bell (nearby enemy alert). Disarm via existing skill-based three-pin controls; cancellation/three slips leave it armed. Spent/disarmed state persists. Dedicated trap artwork/trigger animations and wider dungeon placement remain later polish.
- [x] Optional Cloister three-voice reliquary and Catacombs physical puzzles: repeat Root → Fifth → Third on the Cloister reliquary; weight or step onto the drowned-chapel pressure plate to unlatch the west counter-weight niche; rotate the three niche-gallery brass mirrors (`/` and `\`) to guide the green-gold lantern beam into the eastern prismatic lens. Keyboard/touch/controller support, written beam/note clues, no resource cost and one-time shard/Lore rewards saved in flags.
- [x] Oakhaven crime system: explicitly owned market and interior goods prompt before theft; visible nearby unstunned NPC witnesses report a 20-sovereign bounty. Nonlethal civilian attacks are reported for 40 sovereigns with cooldown protection, preserving quest dialogues and shops. Constables pursue visible offenders and investigate last-seen positions.
- [x] Player wanted posters: two interactive noticeboards in Oakhaven display the current player warrant at 40+ bounty, showing recorded offences and withdrawing upon fine payment or completed custody.
- [x] Watch-house gaol and custody: guard intervention offers checked gold payment, refusal with escape grace, or entry into a playable six-hour custody sentence. Confiscated non-quest gear and ammunition enter validated saved escrow; quest possessions and innate weapons remain safe. Serve the remaining sentence on the bunk or pay the fine for full release and automatic evidence return. Alternatively, pick the cell door to explore the watch-house, pick the evidence chest to recover belongings, and exit via the street door to escape (+60 bounty once, fine remaining outstanding). Escrow merges unrecovered property across re-arrests.
- [x] Personality bribes and Strength threats at the watch confrontation: the arrest panel offers a bribe at 60% of the outstanding fine (minimum 5 sovereigns) checked against Personality, or a threat checked against Strength that keeps the warrant but buys 12 seconds of grace. Odds fall as the bounty grows and stay between 10% and 90%. An accepted bribe withdraws the warrant and notices and returns held evidence; a refusal costs nothing and adds 15 bounty. A successful threat stands the constable down; a refusal adds 20 bounty. Keyboard 3/4/5, touch buttons and controller Y/Back. Scoped to the law dialogue, not a general NPC persuasion system; bribes cannot clear a sentence already being served.
- [x] Horse rental and world-map travel modifiers: the North Gate stables hire the roan mare for 25 sovereigns per in-game day, tracked as absolute world hours (24-hour term, 10-sovereign refund on early return). While hired, world-map journeys take 65% of the road time and reckless travel costs 8% fatigue instead of 20%; the map and journey panel name the horse and its remaining hours. The term lapses silently on the world clock and can be renewed. Keyboard 1/2/Escape, touch buttons and controller A/X/B. Not a steered mount: the horse waits outside interiors, cannot be taken into dungeons and plays no part in combat.
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

### Horse-rental pass verification
- The stable marker appends after every earlier Oakhaven entity, so historical save indexes and the map's walkable floor are unchanged; it is non-solid and reachable from the North Gate square. `HORSE` terms live in `js/travel.js`; the service opens through the existing `useDeco` path like other world fixtures.
- The hire term is the saved number `player.horseUntil` in absolute world hours (`day * 24 + tod * 24`). Renting deducts exactly 25 sovereigns and sets `now + 24`; returning clears it and refunds 10. Old saves without the field start on foot. Imported terms are clamped to at most 48 hours past the loaded clock and stored as a bounded number, never rendered as markup.
- Travel maths stays in one place: `travelMinutes` multiplies by 0.65 while hired, and the quoted time is what `travelGo` advances on the clock. Reckless travel on horseback costs 8% of maximum fatigue instead of 20%; cautious travel is unchanged. Risk is untouched except through the shorter time on the road.
- Panel actions re-check the panel token, current map, play state and coin before acting, so a stale hire callback cannot double-charge after leaving the panel. Hiring is disabled without 25 sovereigns; returning is disabled without a live hire.
- Syntax, hostile-save security regression, the dedicated law suite, the new travel suite and the full Chromium suite pass with no browser runtime errors. The travel suite covers placement/reach, the interact path, cost, term, empty purse, road-time ratio, real journey hours and fatigue, refund, lapse and renewal, save/load, hostile-term clamping, old saves, stale callbacks, keyboard 1/2, touch taps, simulated controller A/X/B and a 640x400 overflow check.
- Body-recess fixtures in the law and visual suites now treat the stable as one more append-only town entity instead of assuming exactly three law additions; the assertions themselves are unchanged in strength.
- Human visual review, physical-controller hardware and long-form economy balance remain unverified. The horse is a travel modifier, not a steered mount: no mounted combat, no separate stable per region, and no appetite or injury model.

### Watch bribe and threat pass verification
- Social options reuse the existing arrest panel and saved crime state: no new saved keys, entity indexes, map layouts or save version. `bribeTerms()` and `threatTerms()` derive cost and odds from `crimeState().bounty` plus the saved Personality/Strength attributes.
- Bribe cost is 60% of the fine, floored at 5 sovereigns. Odds are `45 + (attribute - 45) - min(20, bounty * 0.2)`, clamped to 10–90%; threats take a further -5 shift. The panel prints the exact cost and both odds, so the player never gambles on hidden numbers.
- Accepted bribe: deducts exactly the quoted cost, clears the bounty, withdraws wanted notices, returns any escrowed evidence and grants 5 seconds of grace. Refused bribe: no coin leaves the purse, +15 bounty for attempted bribery. Accepted threat: warrant stands, the constable resets to idle and the player gets 12 seconds of grace. Refused threat: +20 bounty for threatening a constable.
- Every action is re-checked against the current panel token, map, custody state, bounty and available coin before it acts, so a stale callback from an older panel cannot spend gold or clear a newer warrant. Bribes are unavailable while serving a sentence, and the existing fine/prison/refusal paths are unchanged.
- Syntax, hostile-save security regression, dedicated law suite and the full Chromium suite pass with no browser runtime errors. The law suite covers cost/odds formulas, both outcomes for each action, the empty-purse state, readable refusal lines, stale callbacks, save/load persistence, and keyboard 3/4/5, touch taps and simulated controller Y/Back, plus a 640x400 overflow check.
- Human visual review, physical-controller hardware and long-form balance remain unverified. Headless screenshots in this environment do not rasterize the Google-hosted display fonts (the repository's existing screenshots show the same limitation), so layout was checked by DOM geometry rather than by eye. Bribes and threats are deliberately limited to the watch confrontation; general NPC persuasion, bribing a sentence already being served, and faction-wide corruption are not included.

### Broader crime, wanted posters, and prison pass verification
- Jurisdiction and crime reporting: Oakhaven jurisdiction covers town and inhabited interiors (Tavern, Greenhall, Mill, Surgery, Chapel, Tannery, Watch-house). Explicitly owned goods prompt before theft; witnessed theft adds 20 sovereigns. Civilian assault is nonlethal (no damage to shop/quest NPCs, 4-second per-target reporting cooldown, +40 bounty). Stunned NPCs cannot witness; constables always report. Distant regions and story-crisis states retain existing exceptions.
- Guard pursuit and last-seen investigation: constables pursue visible wanted offenders and record their last seen coordinates for 10-second investigation without tracking through solid occlusion.
- Wanted notices: two interactive noticeboards in Oakhaven display warrants when bounty reaches 40+, detailing offences (thefts, assaults, escapes) and withdrawing upon fine settlement or served sentence.
- Playable watch-house custody and evidence: arrest offers checked exact fine payment, refusal with 5-second grace, or custody. Custody teleports to a playable watch-house map with confiscated ordinary weapons, armour, inventory, and ammunition in evidence escrow. Quest items and innate weapons remain on the player. Serving sentence advances world time and releases the player with automatic evidence return; exact payment releases immediately.
- Escape route: the cell door features a mechanical lock (difficulty 2); picking allows walking out into the evidence office. The evidence chest can be picked to recover confiscated items. Stepping through the street door triggers an escape (+60 bounty once, custody cleared, fine outstanding). Re-arrest merges unrecovered property safely.
- Input and layout: keyboard (1/2/3/Enter/Escape), touch buttons, and gamepad controls work for all arrest and prison panels; compact 640×400 layout verified free of overflow.
- Persistence and security: save/load preserves custody remaining time, escrow contents, wanted notices, and lockpick state. Old saves default safely to zero crime. Hostile save codes cannot inject markup through warrants, evidence arrays, or custody objects; custody pointing outside watch-house is rejected.
- Syntax, security test, dedicated law suite, and full visual suite pass with no browser runtime errors. Screenshots: `/tmp/octave-prison-panel.png`, `/tmp/octave-prison-small.png`, `/tmp/octave-wanted-poster.png` (verification artifacts).

### Synod-disguise pass verification
- Clerk robes use existing item/armour/trade/save interfaces (`a_synodrobe`, body slot, AR 1, noise 0, value 32, weight 2). Hob sells them; no entity indexes, map layouts or story gates change. Equipped robes have a grey skirt and silver registry stole in the existing paper doll. Inventory, character and the live written HUD report cover/inspection/exposure.
- Ordinary non-boss Proctors and Legionnaires accept covered travellers at a distance. Inspection requires clear sight within 2.4 units, accumulates over three seconds (double at noise 4+), and decays by 0.75 seconds per second outside inspection. Panels pause inspection. Dead, hidden, passive and stunned patrols cannot inspect. Active combat, body-alarm searches, bosses, monsters, mechanical/story locks and wanted-player arrest retain their existing priority. Covered patrols still follow distractions.
- Witnessed attacks (even missed swings), loud/offensive Songs, successful throws, body dragging and visible clothing changes set the existing saved boolean flag `disguise:exposed:<area>` and alert visible ordinary Synod patrols. Unseen or unavailable actions and quiet murmurs do not expose cover. Changing robes or leaving/re-entering cannot clear exposure; other areas retain independent cover. New games reset flags; saves preserve equipped robes/exposure and reset only transient suspicion. Hostile flag text is never rendered or treated as a boolean exposure.
- Syntax, hostile-save security tests and the full Chromium suite pass with no runtime errors. Browser tests cover inspection timing/noise/decay/occlusion, paused HUD, listener exclusions, combat/body-alarm/monster/boss/arrest priority, witnessed/unseen acts, trade price and inventory Wear, paper-doll update, keyboard/touch/simulated-controller flows, missing/stale actions, compact-panel overflow, combined Body/Cover touch bounds, save/revisit and old-save defaults. Note-puzzle status selectors are now scoped to their modal rather than the new HUD live region; assertions remain intact. Screenshots: `/tmp/octave-disguise-panel.png`, `/tmp/octave-disguise-small.png`, `/tmp/octave-disguise-inventory.png`, `/tmp/octave-disguise-touch.png` (verification artifacts only).
- Physical-controller hardware, human visual/audio review and extended stealth balance remain unverified. Disguise eligibility is deliberately limited to the two baseline Synod patrol types, not a general faction-reputation system. Inspection is a timed proximity mechanic rather than a dialogue/password minigame. No production deployment or automatic PR merge is included; verified changes are pushed on a feature branch as requested.

### Body-handling pass verification
- Settled physical collapse visuals are selectable via a separate facing/range/line-of-sight check; Engine picking remains unchanged, so low corpses cannot steal loot interaction or block movement. Sinking/scattering/dissolving remains cannot be dragged. Dragging follows with a short trailing gap, half walking speed, no sprint and additional movement noise; collision sampling stops at solid props, closed doors and water.
- Nonblocking shrouded recesses append after historical entities in Oakhaven, the Quarry and the Cloister. Placement uses deterministic clear floor away from occupied props, spawns, doors and triggers. Concealment hides the body from patrols, and it can be recovered during the same visit.
- Discovery is checked every 0.25 simulation seconds: visible exposed bodies within six units alert eligible constables and ordinary humanoid patrols. Nearby visible allies within ten units search the discovery location for 12 seconds. Each body alarms once; hidden/dead/passive/stunned patrols and bosses do not join. Combat and visible wanted players remain higher priority; distractions cannot replace a body-search target. Body discovery alone does not create a bounty; a constable seeing the player actively drag one reports +20 once per body.
- Kill rewards and floor loot remain separate and cannot be duplicated by handling remains. Drag references reset on death/new game/departure/load; all corpse visuals and concealed bodies retain the existing transient lifecycle. Enemy death and loot save normally; body metadata is never imported or serialized. Older saves receive the appended recesses without changing save version.
- Syntax, hostile-save security tests and the full Chromium suite pass with no browser runtime errors. Regressions cover inspection/cancellation, facing/walls, prop/door/water clipping, slower movement/no sprint, hiding/recovery, local alarms/one-time bounty/threat priority, unchanged loot/rewards, stale callbacks, departure/reload/death, old saves and keyboard/touch/simulated-controller actions. Compact panel overflow and touch-button bounds are checked; screenshots: `/tmp/octave-body-panel.png`, `/tmp/octave-body-small.png`, `/tmp/octave-body-touch.png` (verification artifacts, not source).
- An existing puzzle no-cost regression fixture now starts at full Voice/Fatigue so passive regeneration between panel interactions cannot make exact-equality checks timing-dependent; no assertion was weakened. Physical-controller hardware, human visual/audio review and extended stealth balance remain unverified. Recesses reuse crate artwork; bodies are not persisted across area visits and patrol search navigation is limited to existing collision/sliding rather than full pathfinding.

### Throwable-distraction pass verification
- New travellers start with three `pebble` items and two `empty_bottle` items. Additional supplies append after historical Oakhaven entities at the square and east of the tavern for existing saves; no entity reordering or save-version change. Carried supplies can also be used from Inventory; the existing `bottle` (Vox-Bottle) remains unchanged.
- Forward aim is sampled to 5/7 units with wall and solid-body clipping; a blocked short throw consumes nothing. Successful throws consume exactly one item and apply a 0.75-second simulation-time cooldown, a brief nonblocking impact marker and written/audio feedback. No damage and no noise increase at the thrower location.
- Idle constables and ordinary non-boss enemies investigate a 7/11-unit sound radius (35% through walls), walking toward the impact and waiting until the 6/9-second investigation expires. Chasing, passive, hidden, dead, stunned and boss listeners are excluded. Seeing/hearing the player or taking a weapon/Song hit overrides investigation; constables prioritize visible wanted players and retain fine/jail behavior.
- Investigation targets and impact markers are transient; map departure clears them and imported `investigate` states normalize to idle. Inventory consumption persists normally. Inspection/cancellation, blocked throws and unavailable inventory spend nothing.
- Syntax, hostile-save security regressions and the full Chromium suite pass, including starting supplies, consumable counts, wall/body clipping, no source-noise/Vox changes, listener exclusions, movement/expiry, threat and hit priority, wall muffling, cooldown, departure/reload and actual keyboard/touch/simulated-controller controls. `/tmp/octave-distractions.png` records the throw panel. Physical-controller testing, human visual/audio review and long-form balance remain unverified; thrown flight artwork and navigation around complex obstacle mazes are not implemented.

### Pickpocketing pass verification
- Static purse IDs and fixed loose coin (4 sovereigns for townsfolk, 8 for merchants) are attached to existing Oakhaven adults without reordering/appending map entities. Children, companions, guards, night-watch extras and non-town NPCs are excluded; the Greening disables town theft.
- Inspection requires facing a visible living target within 1.65 units and clear line of sight. It costs nothing and pauses like other inspection panels. Front/side/rear is relative to the NPC heading; conversations turn their attention toward the player. Stealth improves odds; noise and frontal attention worsen them. Odds remain between 5% and 90%.
- An attempt records `pocket:oakhaven:<stable ID>` as `taken` or `caught` before awarding fixed gold or bounty. Success trains Stealth; every attempt counts as theft. The owner is excluded from the third-party witness scan; a caught owner always reports. Existing constable/fine/jail behavior handles the resulting bounty.
- Chromium covers front/rear/side risk, noise and skill effects, conversation attention, range/facing/walls, hidden/dead/companion/guard exclusions, cancellation, success/failure, witness reports, duplicate attempts, saved success/failure, old-save defaults, stale callbacks, keyboard/touch/simulated-controller inputs, and compact-panel overflow. Screenshots: `/tmp/octave-pickpocket.png` and `/tmp/octave-pickpocket-small.png` (verification artifacts, not source files).
- Physical-controller hardware testing and human visual/balance review remain outstanding; expanding purse placement beyond Oakhaven is not included in this pass.

### Cloister note-lock & Catacombs physical-puzzles pass verification
- Optional nonblocking reliquary appends after existing Cloister entities at (16.5, 12.5), and Catacombs physical puzzles append after existing Catacombs entities without altering story doors or save version.
- Drowned-chapel pressure plate at (4.5, 25.5) activates on player proximity or via the ballast-block inspection panel, opening the counter-weight niche at (10, 26) and granting one Light-Glass Shard and Lore progress once.
- Niche-gallery turning mirrors at (14.5, 2.5), (22.5, 2.5) and (22.5, 1.5) route a green-gold beam from (14.5, 4.5) to the eastern lens at (26.2, 1.5), updating in-world light segments and opening the prismatic niche at (27, 1) with a one-time shard and Lore reward.
- In-world interactions support keyboard (`1–3`, arrows, `Enter`/`Space`, `R`/`L`, `Escape`), touch buttons and Gamepad (`D-pad`, `A`, `X`, `B`) with written status descriptions and zero Voice/Fatigue cost.
- Chromium verifies in-world interaction, stepping onto the pressure plate, ballast toggling, mirror beam routing, reset/re-solve idempotence, keyboard/touch/controller inputs, save/load persistence and old-save defaults.
- Existing browser, security and gameplay smoke regressions pass. Audio listening quality, human visual review and physical-controller hardware testing remain unverified. Dedicated puzzle sprite sheets remain later polish.

### Dungeon-trap pass verification
- Three nonblocking mechanisms append after historical Catacombs entities, away from story triggers and the entrance. They reuse grate/web/bell artwork and advertise inspection in their labels.
- Proximity activation consumes a trap before applying its effect; spent or disarmed traps cannot retrigger. Nets use the existing movement-slow timer; bells alert nearby active, nonpassive enemies.
- Inspection describes consequences and opens the existing keyboard/touch/controller lockpicking panel for disarming. Leaving or failing three times does not silently disarm or activate a trap.
- Existing map/target flags retain `triggered`/`disarmed` states without changing save version. Old saves lacking flags start with armed mechanisms.
- Chromium verifies inspection/cancel, failed/successful disarm, placements, all three effects, one-shot damage and spent/disarmed reload behavior. Existing browser/security/smoke checks pass. Human visual review and physical-controller testing remain pending.

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
