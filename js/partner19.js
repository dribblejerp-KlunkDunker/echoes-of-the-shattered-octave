// ============================================================
//  partner19 — Phase 19 "Together", team PARTNER: the second traveller in the host's world.
//
//  PARTNER19 CONTRACT (stable; NET and SYNC code against it — the implementation follows in this file)
//  ---------------------------------------------------------------------------------------------------------------
//  HOST SIDE (NET19.role() === 'host', or no network at all: the local / hot-seat API the tests drive)
//   PARTNER19.join(card, opts?)  -> { ok, reason?, partner? }  The guest's character CARD (below) is validated and clamped
//                                   (no impossible stats or items). One partner at a time. opts: { seed?: int } seeds the
//                                   partner's own RNG stream (the host's Math.random is never used for the partner).
//   PARTNER19.input(cmd)         -> { ok, reason? }   One guest command (INPUT below): shape, ranges, size and rate checked;
//                                   the guest may only act as its own traveller; story commands are refused.
//   PARTNER19.leave(reason?)     -> WB | null         Ends the session; returns the write-back message for the guest's own
//                                   save (with NET19 present the host also sends it as 'p19p:wb').
//   PARTNER19.active()           -> boolean
//   PARTNER19.snapshot()         -> PSNAP | null      The partner as the guest needs to see it, for SYNC's snapshots:
//                                   { name, cls, face, map, x, y, dir, hp, hpMax, voice, voiceMax, lvl, xp, down, downLeft,
//                                     revive, act, weapon, loot: 'host'|'guest' (whose drop is next), xpEarned }
//   PARTNER19.hostState()        -> { hp, hpMax, down, downLeft, revive }   the host's own state, for the guest's HUD
//   PARTNER19.pause(on)          -> the guest dropped (NET reconnecting): the partner steps out of the world (not drawn,
//                                   not targetable, timers frozen) until pause(false). The host carries on alone.
//   PARTNER19.onStory(fn)        -> subscribe to the read-only copy of every story scene the host sees (STORY below).
//                                   With NET19 present each one is also sent as 'p19p:story'.
//  GUEST SIDE
//   PARTNER19.guest.card(src?)   -> CARD | { error }  src: omitted = the live game (G.player); or a save object (a session
//                                   slot or a decoded save code). Hardcore runs cannot travel.
//   PARTNER19.guest.enter()      -> boolean   Puts the guest's own game aside (EXTRAS17 isolation, a hidden registration)
//                                   while the guest plays in the host's world. SYNC calls it before taking over G.
//   PARTNER19.guest.returnHome(wb?) -> { ok, reason?, gained? }   Gives the guest's own game back and applies a validated
//                                   write-back to it (only to it). Without a valid wb the game comes back unchanged.
//   PARTNER19.guest.applyWriteBack(wb, player?) -> { ok, reason?, gained? }   validate + apply (default: the home save).
//   PARTNER19.guest.showStory(STORY) / hideStory()   the read-only story panel (text only; no choices can be made).
//  MESSAGES (type strings for NET19.on / NET19.send; JSON objects, every one size-capped and validated on receipt)
//   guest->host 'p19p:join' CARD · 'p19p:in' INPUT · 'p19p:leave' {}
//   host->guest 'p19p:joined' { ok, reason? } · 'p19p:story' STORY · 'p19p:wb' WB · 'p19p:host' hostState()
//  SYNC HOOKS: SYNC19 passes each guest input frame to PARTNER19.input(cmd), puts snapshot() and hostState() in its
//   snapshots, and calls pause(true / false) on a drop / reconnect.
//  CARD  { v:1, token:[A-Za-z0-9]{8,32}, name, cls, face:1-6, level, xp, attrs:{8 ATTRS}, weapons:[ids], weapon:int,
//          armor:{slot:id}, pellets, bolts, glass }
//  INPUT { t:'move', f:-1..1, s:-1..1, run:bool } | { t:'look', dir:rad } | { t:'turn', d:rad } | { t:'attack', label? }
//        | { t:'block' } | { t:'song', id:'tending'|'fifth' } | { t:'weapon', i:int } | { t:'use' } | { t:'revive' }
//        refused: 'choose', 'talk', 'flag', 'quest', 'interact', 'save' (the story and the world's choices are the host's)
//  STORY { kind:'event'|'dialogue'|'close'|'death'|'ending', title, text, choices:[text] }   plain text, never markup
//  WB    { v:1, token, xp, kills, gold, items:[{id,n}], spent:{pellets,bolts} }
// ============================================================
'use strict';
