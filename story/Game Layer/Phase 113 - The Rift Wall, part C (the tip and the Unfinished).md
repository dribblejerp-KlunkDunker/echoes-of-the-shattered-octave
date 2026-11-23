# Phase 113, part C: the tip, and the Unfinished

Ruled by the owner on 22 Nov 2026 ("A then C"; "the rift may have keepers"; "if its in the volume keep it"). Every
proposal of the design was approved on 22 Nov. Built in `js/tip113.js`; tested by `test/tip113.test.js`; French in
`tools/i18n/p113-tip.tsv`.

## What was built

- **On the wall (`p100_wall`).** A small cart yard cut at the inner foot of the wall between Towers Seven and Eight, on the
  Watch's side. In the wall's face: **the cart gate**, two leaves of iron-strapped black oak two cells wide and three
  units tall (the eye is at 0.88), between iron-faced jambs, under a lead-sheathed lintel, with the ruts running in under
  it across the yard; used in front of it, it lets you into the sally-way. (The engine draws a door cell on a map without
  a ceiling one unit tall, so the gate is built as tall blocks and the way through is a thing to use; no wicket is drawn,
  since a wall picture repeats once every unit of height.) And **Tower Eight's postern**, barred on this side. A trooper of the Watch stands in the yard, near Battery Eight: she is the trooper who counts
  cable-eyes (Phase 100's picture, greeting and voice) with one subject of her own, **The cart gate**.
- **The sally-way (`p113_sally`).** A wagon-road cut under the wall, five cells wide and twenty-nine long, with a wider
  turning-place half way; its own ceiling; dark always, with grey daylight coming in at the far mouth. Ruts cut in the
  floor the width of a wagon; tungsten cable down the walls. A talking-post (a Souls lamp, group m, as the wall's are)
  just inside the wicket: resting there reads its note aloud. Five things to look at. The sleeve at the turning-place,
  and the letter in its cuff. Tower Eight's postern off the turning-place: it opens only from this side, and stays open
  after (the shortcut back to the wall).
- **The stage (`p113_tip`).** The far mouth in the wall's outer foot, twenty cells (thirty yards, Phase 100's scale) of
  bare grey rock, ruts running out to the stage: a ramp of sleepers rising to the very edge, a baulk of oak across its end,
  worn in two places. Beyond the lip the not-colour, as Phase 100 draws it. A cable fence (iron eyes on oak posts, cable
  through them) pens the ground either side, so nobody walks along the lip. A Lead Brother stands a hundred yards along
  it, out of reach. The stage takes the wall's own light by the hour (`RIFT100.wallDay` and `wallAmbient`): grey by day,
  black by night. No sky or star is drawn here.
- **Keep talking.** Standing Order Nine holds on the whole stage and in the far half of the sally-way, by Phase 100's own
  rule (a small hook, `RIFT100.addZone`): go quiet and you are Relieved and walk for the edge. No bell reaches here. A
  Relieved walker in the sally-way goes on out of the mouth and on across the rock.
- **The keeper: the Unfinished.** Not a foe: nothing to strike. Three breaths hang over the stage at the height of a face,
  with nobody under them (drawn in code). Come within two cells of the next one and it takes your jaw. While it holds,
  your Murmur says its half-sentence and not your own subject, and it is said every three and a half seconds whether you
  press N or not, so you cannot go quiet. Each saying spends voice, so that a full voice lasts about ninety seconds. The
  first saying is always the half; if you have read the leaving that ends it, the next saying finishes it, and the breath
  is gone for good. If your voice is spent it lets go, and the Watch's rule takes you at once (you wake at the last lamp,
  as the Souls rules have it; your own voice can still stop your walk, as on the wall). The three are taken one at a
  time, in order. When the third is finished the keeper is settled and its leavings appear, once.
- **The leavings.** *Three Leavings* (a valuable worth nothing: value 0, so no merchant will buy them; the game has no way
  to drop a thing, so they cannot be thrown away). *Carter's Sprag*, lying at the top of the stage from the start: it will
  not come until the keeper is settled. A blunt one-handed weapon, the Magazine Mallet's numbers (4 to 10, reach 1.3) a
  little heavier (speed 0.88 against 0.95) and no better; iron-shod. It has its own icon, gear-look entry, first-person
  painting (and so its pixel-hand and sculpted-hand grip), and it is in the Watch's Issue set.

Flags (small ints, read safely): `p113_know` (bits 1 the letter, 2 the shoe, 4 the card), `p113_jaw` (0 to 3),
`p113_done` (bits 1, 2, 4), `p113_tipk` (the keeper settled), `p113_tdrop` (its leavings given), `p113_post8` (Tower
Eight's postern opened from within), `p113_tbits` (1 the glass line said, 2 the sprag taken).

## Every line

On the wall:

- The cart gate (the gate's label; and the trooper's subject)
- "We have no subject for it." She says it in the middle of cable-eyes, as if it were a cable-eye. "There is something on
  the stage out there that finishes nobody's sentences. It has had three of ours by the jaw, over the years, and brought
  every one of them back in talking. That is more than the bell does. So nobody has reported it." She goes back to
  cable-eyes.
- Tower Eight's postern
- Tower Eight's postern. Barred from the other side, and the bar has not been lifted in a long time.

The sally-way (the name of the place is "The sally-way"):

- The ruts: Wheel-ruts in obsidian. Obsidian does not rut. It has been cut for the wheels, both sides, the width of an
  Office wagon.
- The brackets: Brackets for lamps, and no lamps. Whoever drives here does not want to see the walls, or does not come by
  night.
- The clerk's place: A flat place cut in the wall at the height of a standing clerk. A dry inkwell. A rule, chained. The
  stone under it is polished by the toes of boots. Somebody signed for every wagon here.
- The chalk: Chalk, in fives. Somebody kept count on the wall, and somebody else rubbed it out with a sleeve, not well.
  You do not count what is left.
- The sleeve: A sleeve of grey Office stuff, torn off at the shoulder and caught on a cable-eye at the height of a wagon's
  side. The cloth is as sound as the day it tore. Nothing rots here. There is paper in the cuff.
- The letter: Marget. They say it is a registration and no more, and a man is not kept for a registration. I have the
  pamphlet. I will be home by Hearthday. Do not sell the loom.
- The talking-post's note: IF YOU HAVE COME IN BY MISTAKE, GO OUT TALKING.
- At the far mouth: The sally-way ends in daylight, grey from above. Thirty yards of bare rock. Then nothing you can look
  at.
- With the glass arm, once: Your arm has stopped. Nothing in it. Nothing in the bone. You had forgotten what your own
  blood sounds like.

The stage (the name of the place is "The stage"):

- The stage: A ramp of sleepers, laid to the very edge, and a baulk of oak across the end of it to stop a wagon's wheels.
  The baulk is worn in two places, a wagon's width apart. The bed tips. The wheels do not go over.
- The edge: You do not look over. The not-colour is there, and it cannot be looked at. You look at your boots, and keep
  talking.
- A Lead Brother: A Lead Brother, a hundred yards along the lip, hooded, his face sealed in lead. He does not turn. He is
  the only man here allowed to say nothing.
- The shoe: One shoe, a woman's, the heel worn on the outside. In the toe, folded small, a cobbler's ticket: DUNN. One
  pair, resoled, paid. To be called for. Stott.
- The card: A card, soft with handling, pushed into a crack of the baulk. REGISTRATION, in nice letters. Under it a
  number, stamped: 41. Somebody held this the whole way here.

The Unfinished:

- Something that was waiting for a mouth has found yours. Your jaw is not your own. You hear yourself say, in a voice
  that is nearly yours:
- 1. "—and tell Marget I'll be home by—" / "—and tell Marget I'll be home by Hearthday." / Your mouth closes. Somewhere a
  long way off, or nowhere, a man has stopped worrying about a loom.
- 2. "Somebody fetch my good shoes from Dunn's. They're paid for. They're under the name of—" / "Somebody fetch my good
  shoes from Dunn's. They're paid for. They're under the name of Stott." / It lets go. You find you know the name of a
  cobbler in a town you have never seen.
- 3. "They said hold your number and wait to be called. I've held it. Mine's—" / "They said hold your number and wait to
  be called. I've held it. Mine's forty-one." / It lets go. Nobody calls the number.
- You say it again. You cannot not. It stops where it stopped the first time.
- Your voice gives out. It lets go of you, because you are no more use to it. It is very quiet. It is a relief.
- It is quiet on the stage. Then you remember where you are, and start talking.
- There are more. You can feel them in the timber, like a hum in a rail. But the three that had hold of you are
  finished, and the others have learned to wait.

The leavings:

- Three Leavings: A letter, a cobbler's ticket and a card numbered forty-one, tied together with a boot-lace. None of them
  has faded. Nothing does, here. Nobody will buy them, and you will find you cannot throw them away.
- Carter's Sprag: A sprag for chocking a wagon's wheel on a slope: a billet of ash shod with iron, polished where a hand
  has carried it. It was left under the last wheel at the top of the stage. It has stopped a great many wheels, and never
  the one that mattered.
- It will not come. Something on this stage is not finished with it.

## Left out

- The cart gate's look line ("Two leaves of black oak ... The two on Battery Eight have their backs to it.") is not
  used. In the game Tower Eight is hooded and unmanned ("nobody is standing to it"; Two-Eleven: "From Seven to Nine
  there's nobody but you"), so nobody stands on Battery Eight to have their back to the gate. The line is held for the
  owner: either the line or Phase 100's Tower Eight would have to change. The gate is drawn as the line says (black oak,
  iron-bound, a wicket in the left leaf) and carries only its name.

## Canon (copied from the design)

- The Office's docket: "SCHEDULE F. Incomplete draw. Residual to be conveyed under escort to Null-Watch and disposed of
  at the lip." (Book Three, Part Two, line 601). People come "in a cart"; "They tipped the cart" (Part One, 1319).
- No book shows the place. What falls from it lands under Batteries Eight, Nine and Ten (Part One, 2066, 2102), so the
  tip is on the lip by Battery Eight.
- "Nothing does [rot], here." (Part One, 1319). "The dead do not rot here, until suddenly everything does." (Series
  Bible, 228).
- Within about thirty yards of the lip, anyone who goes silent begins to go: "Not pulled; relieved." (Vol VI, 118). The
  Watch talks, always. The Lead Brothers stand along the lip, hooded, faces sealed in lead, the only men allowed to be
  silent; they "do not stop anyone who is not theirs".
- Within about thirty yards of the lip the glass goes silent (Vol VI, 141; Part One, 1011).
- The not-colour beyond the lip "cannot be looked at".
- The wall: obsidian in blocks the size of wagons, lead mortar, tungsten cable strung from iron eyes; posterns at the
  towers' feet. People sent for pressing are given a pamphlet in the queue: "It says Registration on the front, in nice
  letters." (Part One, 1411). The half-pressed wear grey Office smocks (1247).
- Throat-Wraiths (Vol II, 482 to 483): "Formed where a person died mid-sentence. They are the unfinished half, looking for
  a mouth. Attach to the jaw; the victim speaks words they never knew in a voice nearly their own, and cannot stop until
  the sentence ends. Record: eleven days." "Resolve: complete the sentence correctly. Requires knowing who died and what
  they were saying." "The sentence is tender."
- The game shows Harvestmonth 419.

## Approved 22 Nov (not in the books)

The cart gate; the sally-way; the stage; the three people and their sentences (Marget's husband, Stott, number
forty-one); the leavings; the trooper's line; the sprag; the talking-post's note; Tower Eight's postern as the shortcut.
Also the builder's own choices under them: the cart yard on the wall, the fence posts of oak, the darker lead of the
Brother seen a hundred yards off, the saying's period (three and a half seconds) and its cost.
