# Phase 113, part A: the Rift Wall keeps its secret. The old garrison's store and the night on the wall

22 November 2026. Branch `p113-stores`. Ruled by the owner, 22 Nov ("A then C"). Design A was written by the Commander, with every English line; the builder built it and did not rewrite any line. Code: `js/stores113.js`. Test: `test/stores113.test.js`. French: `tools/i18n/p113-stores.tsv`.

**The one rule.** The traveller never goes past the lip, never goes out by the postern, and is never told what is down there. The postern at Tower Nine's foot stays barred exactly as Phase 100 has it ("... Not yours. Not tonight."). Seven words are in none of this phase's strings, English or French; the test checks every string with word boundaries.

## What was built

**The old garrison's store** [PROPOSED]. A door in the obsidian at Tower Nine's foot on Null-Watch's wall (`p100_wall`, cell 301,21), four steps from where the Quartermaster stands, labelled "The old garrison's store" (the map's name too; the id stays `p113_stores`). Why that name: Phase 100's Quartermaster already says "Stores are the other side of the Watch", and that stands. So this room is not the Watch's stores but the old garrison's, which he has kept since 406 ("Quartermaster of the old garrison at Null-Watch from 406", Book Three Part Two, line 289). His errand line "Not from stores: stores is counted this month" means the Watch's stores, and stays. Inside: a narrow, crowded vault with its own ceiling, sixteen cells by seven, an aisle three wide between racks that go floor to roof down both sides and across the end; the shot-racks stand across the aisle near the end with a gap, and the cot is in the nook behind them. Two lamps hang low over the racks with a dim warm light, and the same door leads back out. The door is added from `js/stores113.js`, which wraps `buildAllMaps` after Phase 100 does: no change to `js/rift100.js` was needed. The room's own look is the knotted strings: a pale cord with dark knots hangs from the edge of every rack board, from every crate, tin and stack, from nails in the walls, and from the vault. Nine things to look at (the name shows when you face it; E says the line):

| Thing | Line |
| --- | --- |
| Onions | Onions, in nets, to the roof. The Watch eats them and then talks about them. |
| Cable-eyes | Crates of iron cable-eyes, greased. No crate has a number on it. Each has a string nailed to the lid, and the string has knots in it. |
| Lead plates | Lead plates for the coats, stacked like slates. |
| Lamp-oil | Lamp-oil in tins, each tin with its string. |
| The tally-board | A board of nails by the door, a string on every nail, every string knotted. It is the whole ledger of the stores. He could tell you what each knot is. Nobody else on the Watch could, which is why he is still here. |
| The bread-racks | Bread-racks, floor to roof. More goes out of this room than comes back as crumbs. Nobody has asked where. |
| The hook | A hook by the door, at the height of a big man's shoulder. The wood under it is worn pale in the shape of something round. |
| The cot | A cot behind the shot-racks, with a dent in it the size of a lead coat. He has slept in this room since before the crack. |
| Old shot | Lead shot for the old guns, in pyramids. Nobody has fired the old guns in six years. Nobody has moved the shot either. |

**The cart** [PROPOSED], at the west gate: "The cart". Looked at: *A carter's wagon, unhitched, with the Watch's crates on it. The carter has gone for his dinner.* During errand one: *The crate chalked Q is not heavy. Something in it shifts like cloth. You do not open it.* (The crate chalked Q is gone from the cart once taken.)

**The errands** [PROPOSED]: the Quartermaster's own subject, **Work**. No items are given; only flags, all small ints, read through a clamp and kept in saves: `p113_qm` (0 nothing yet, 1 the crate asked, 2 brought, 3 oil asked, 4 brought, 5 blanket asked, 6 brought, 7 letter asked, 8 letter read), `p113_carry` (0 nothing, 1 the crate, 2 the oil, 3 the blanket), `p113_seen` (the night seen), `p113_bits` (said once: 1 the glass arm heard, 2 after the night).

1. If the traveller has the glass arm, the first time they ask for Work: "You ring, traveller. Left side, under the sleeve. I have carried crates that rang like that, and heard them from the next table. There is work, if you want it. I will not tell you what it is for, and that is not rudeness."
2. Errand one (0 to 1): "You have two hands and no number. That is rare here. There is a crate come on the cart at the west gate, chalked Q. Bring it down to Nine. I would go myself, but the wall is four miles and I have walked it." While the battery rail's trolley is still chocked he adds: "The trolley is chocked at this end. Knock the chock out and it will save your legs." (Asked again before the crate is brought, he says the same.)
3. Brought (1 to 2), and errand two at once (2 to 3): "Set it there. Mind the onions. That is the right crate. You would be surprised how often it is not." / "Now a pint of lamp-oil from One-Oh-Six at the hatch. Tell her it is for my lantern. She will count it out by the gill and talk the whole time. Let her."
4. One-Oh-Six at the issue-hatch, on that errand: "For the old man's lantern? He burns a pint a week in one lantern and I have never asked. Nobody has asked. Here."
5. Brought (3 to 4), errand three (4 to 5): "That is a week of light. Now a blanket. Not from stores: stores is counted this month. Ask in the Halls. Somebody will have one to spare, and they will not ask you why. That is the Watch."
6. Any trooper already standing in the Talking Halls or the squad's barrack (Nineteen stands on the wall, not indoors, so it is one of the unnamed troopers in the Halls, or Fifty-One or Two-Oh-Seven in the barrack), on that errand: "For the Quartermaster? Take mine. I sleep in the coat anyway."
7. Brought (5 to 6): He folds it small, and then smaller. "That will do. That will do very well."
8. **Glass arm**: that is the end. Work gives only "That is all I have for you. Go and talk to somebody about onions."
9. **No glass arm**: the next Work (6 to 7): "The cart brought a letter, and Two-Eleven is on the wall till the dead hour. I never had the reading. Would you? Out loud. Everything is out loud here." The traveller reads it aloud in the conversation (the letter is the answer you give, so the reading-aloud option speaks it as well):

   > Hal. The wool came dear and I have got the grey after all, it will not show the dirt. You do not say how big. Two-Eleven writes a fair hand but he does not say how big, so I am making it for a small one and it can be grown into. Whose it is you do not say either, and I have stopped asking. The oven is drawing badly since the wet. I have a new girl for the mornings who cannot be taught to leave a loaf alone. Keep your feet dry. Your sister.

   After it (7 to 8): He is quiet for a moment, which for a man of the Watch is a long time. "She always did make them to be grown into." / "If you are not asleep at the third hour, the wall is a fair place to stand. Between Five and Six. Look east, and do not look long. I will not say more, and you will not ask me after."
10. After the letter, Work gives (a line the Commander added, 22 Nov): "That is the work done. The third hour, if you are awake. Between Five and Six."

**The night on the wall.** On the wall-walk between Towers Five and Six, in the third hour of the night, once, for anyone standing there, told or not (a glassed traveller is never told and may still be there). The hour: the engine's sky has no day left in it from `tod` 0.7985 (full dark, about 19:10 by the clock); hours of the night count from full dark (Vol VII §5), so the third hour is from two hours after it to three, about 21:10 to 22:10 (`THIRD_HOUR` in the code). The lines come one at a time, seven or eight seconds apart:

1. Far along the wall, at the foot of Tower Nine, a lantern comes out of the wall, by a door you were not let through. (The Commander's revision of the first line, 22 Nov.)
2. It goes out across the grey ground at a steady walk. One lantern. One man, with something on his back.
3. Out on the end of the buttress a wheel turns. You cannot hear it. The wind here carries nothing three feet.
4. A gold point goes over the lip and down. Past where the rock goes black. Still down. It gets small, and does not go out.
5. A long way down it stops. Then it moves sideways, slowly, as if something had taken hold of it.
6. And near it, very small and yellow, a second light. Answering.
7. Beside you a trooper is on the price of onions. She does not stop, and she does not look east. Nobody on this wall looks east at the third hour. You notice that now.
8. You do not know what you saw. You know that nobody is going to tell you.

With them the lights move (code-drawn discs, no random numbers): a lantern out of the wall at Tower Nine's foot and across the rock to the buttress's end, where it stays; a gold point over the lip and down, smaller as it goes, never out; it stops, and moves a little sideways; a second, smaller, yellower light near it. The Watch's rule runs on underneath: say nothing and the quiet still comes on.

Afterwards Work gives, once: with no glass arm, "You were on the wall." He does not ask it. "Then say nothing, here or anywhere. Things get said. They get said, and then they have been said." He hitches his coat. "Keep talking, traveller." With the glass arm: "Keep talking, traveller."

## Far sights, and the dark

- **Far sights on this wall are placed by eye, because the wall is drawn short.** The book has the night seen from exactly the stretch between Five and Six: "Far off along the wall, at the foot of Tower Nine, he could see a knot of lanterns", and the gold point watched over the lip and down until it is a spark (Book Three Part One, lines 859 to 913). On the game's short, curved wall Tower Nine's buttress lies north of that stretch, behind Towers Six and Seven and the parapet, and the lip is out of anyone's sight. The book wins. So from that stretch the night is drawn as far lights: at the true compass bearing of the end of Tower Nine's buttress, turned outward toward the Rift by the least angle that clears the wall and the towers from where you stand (and a degree and a half more, so they do not sit on a tower's edge), far off, just above the parapet line. First a small warm point moving a short way (the lantern crossing); then the gold point sinking toward the parapet line, smaller, never out; it stops; it slides a little sideways; then the second light, smaller and yellower, beside it. Anything truly nearer still hides them. Elsewhere on the wall the lights are drawn where they truly are, and only where they could be seen (the lantern on the buttress, from the walk past Tower Nine).
- **The night is starless, by the book**: over the Rift the sky is "black and starless" (Book Three Part Two, lines 143 and 273; Part One, line 983, "under no stars"). The far lights are the only points of light out there. The sky itself is another builder's (`js/deepsky113.js`, `js/light21.js`); this phase does not touch it.
- **Why the wall is grey at the third hour.** Phase 100 built Null-Watch's wall to be lit the same at every hour: `m.bright = true`, an ambient of 0.95, and the map not marked outdoor, from Vol VI line 110, "Light: grey from above", and Phase 106 recorded it ("The Continental Rift is the same grey by night as by day"). This phase did not change that. For a ruling.

## Canon, with where it is (copied from the design)

- The Quartermaster, Halvard Greer of Greystairs in the Peaks: "Quartermaster of the old garrison at Null-Watch from 406. Penal legion from the spring of 413" (Book Three, Part Two, line 289). "Kept on at the Watch because nobody else knew where anything was" (347). Sixty, in a lead coat (109). Cannot read; can write his name and two words more (Vol VI, 147).
- His sister keeps a bakery in Greystairs and knits. Two-Eleven writes his letters. Things come "on the cart" (75).
- He goes out "at the third hour, as he had every night for six years" (65), from the postern at Tower Nine's foot, with something on his back and a lantern (67).
- He can hear glass: of a captain's crates of cores, "he could hear them from the next table" (Part One, 931).
- The wind off the Rift has no pitch and carries no sound more than a few feet.
- The Watch talks, always, about nothing. Hours of the night are counted from full dark and given bare: "the third hour"; "the dead hour" is the hour before dawn (Vol VII, lines 89 to 94).
- The game shows Harvestmonth 419. Nobody here has heard of the *Drift-Kestrel*.

## [PROPOSED] (not in the books)

The stores' place (behind a door at Tower Nine's foot) and all its furniture; the cart at the west gate; the four errands; the letter, and "Hal"; who gives the oil and the blanket; the hour's exact span by the game's clock; the lights' paths.
