# Phase 96: the Dawning Heights, part four: the Basilica school (text for review)

*Written 16 Nov 2026 under the owner's approval of Phases 89 and 90 (14 Nov) and Team C's design. Code: `js/school96.js`; test:
`test/school96.test.js`; French: `tools/i18n/p96-school.tsv`. Every line is new and [PROPOSED] unless a book or bible is named.*

## The book changed the plan

Phase 89 and Phase 90 put "a child ... taught on a bench under the great east window", and "a single treble rehearsing at dusk"
there. The books say that bench cannot be sat at in Harvestmonth 419, and the book wins:

- Book Three, Part Two l.929: Seraphina was taught "in the Basilica school at Sol-Luminary, on a bench under the great east
  window, by a Cantor of the Pure Note with a tuning-rod and a voice like a bell."
- Book Two, Part Two l.1403: "Below the line, in the shade, its west end was black ... Above the line, its east end was white.
  Not painted. *Taken*."
- Book Two, Part Two l.1407: "The Lightward Nave ... The altar end. It has been sealed since the morning of the Fracture ...
  Nobody goes into it. Except me."

So the bench under the east window is in the sealed, Bleached east end, behind the iron wall. Nobody sits there, and the game
never places it: it is only told of, on a notice. The school itself lives on in 419 (Book Two, Part Two l.2391: "the
children's choirs of the Basilica school"), so it now meets in a room on the shade side of the iron wall. Book Two has such
rooms there: "a room on the shade side of the iron wall" (l.1431), "small and clean and black-walled ... and a hush-lamp on a
hook whistling its small high note" (l.1435). Where the school meets is not in the book: that is [PROPOSED].

The book also took two things out:
- No treble is said to be chosen in spring 419. The custom is told in the past ("there had always been a singer at the dawn
  office", Book Two l.2407). The child here is only practising, and never says it has been chosen or will stand on the stone.
- The nine hold the Pure Note in the stalls only "because the Church was preparing a Rite" (Book Two l.1415), and the Church
  came back to the Altar only in Ashfall (l.701). So no Pure Note pours from the Basilica here.

## What was built

- **The way in.** A low black door in the Tiers' black wall at **p92_tiers (89, 5)**, inside the bell-gallery stair's room,
  east of the iron door (80, 5). Book Two puts small black-walled rooms "on the shade side of the iron wall", so the door is
  in that same wall. It stays clear of the offerings (x 83.4 to 86.6), the sign at (81.6, 6.4) and the goods-cage top (90.6,
  12.0). It is set from `join()`, as the Anchorage's is. The way back is a door at (9, 13), out onto the planks at (89.5, 6.6).
- **The map** `p96_school`: an interior, 18 x 14, black stone, a black ceiling at 2.4, near-black fog, low light. It is lit
  only by four hush-lamps on hooks (one in the passage, two in the schoolroom, one in the practice-room).
- **The black passage** (x 8 to 10, y 10 to 12), with a hush-lamp on a hook. Its first line is the book's.
- **The schoolroom** (x 2 to 12, y 3 to 9): eight benches in four rows, each drawn a little different, worn pale where
  children sat; the Cantor's desk with the tuning-rod on it; a slate with the Cantor's lesson (Book Three, word for word); two
  high lancet windows of black glass (Book Two l.1403: "black glass in the high lancet windows"); the notice of 412 by the
  passage, which tells of the east window.
- **The roll's lectern** at the west wall. Reading the roll gives "Seven years of names, and a line through most of them", then
  its two numbers, and sets `p96c_roll` to 1.
- **The treble's practice-room** (x 14 to 16, y 3 to 6), through an open doorway at (13, 5): a low practice step of grey
  stone, worn hollow (not the Vessel's stone), and a hush-lamp.
- **The hours.** Only at dusk (tod 0.74 to 0.84) are the treble and the Cantor in the practice-room. Then the tuning-rod is
  in the Cantor's hands and not on the desk. The rest of the day and night the school is empty, and only the hush-lamps
  whistle (the game's own 'inside' sound).
- **The held note.** At dusk one treble note is held at **528** (Book Two l.1417: "Five hundred and twenty-eight."). It is full
  in the practice-room, fades through the schoolroom and is silent at the door. Every nine seconds it stops for a breath of
  1.5 seconds: held, but not seamless, as only the nine are seamless (Book Two l.1415). It is made with the game's own
  `Audio_.hum`, never a sound file.
- **The people** (no names; nobody from the books):
  - *The treble*, a child of about ten in a white surplice over a black cassock, standing on the step, mouth open on the note.
  - *The Cantor*, a Cantor of the Pure Note in white, seated on a stool, the tuning-rod across the knees (Book Three l.929).
- **Flags:** `p96c_seen` (bits, 0 to 255) and `p96c_roll` (0 or 1), both validated.
- A place to find, not fight: no foes, no items, no gear, no Souls lamps.

## Pictures looked at

`tools/dev/out/`: `p96c_tiersdoor.png` (the door in the black wall), `p96c_passage.png`, `p96c_room_north.png` (the desk,
slate and a lancet by day), `p96c_room_west.png`, `p96c_lectern.png`, `p96c_room_dusk.png` (the rod gone from the desk),
`p96c_pr_step_day.png` (the empty step), `p96c_pr_step_dusk.png`, `p96c_pr_in.png` and `p96c_pr_in2.png` (the treble on the
step, the Cantor seated). What they changed: the walls first stopped at one unit under a black band (fixed: the map is made a
relief map, as pilgrim95's house is, so walls reach the ceiling); the hush-lamps first washed the black stone beige and blew
the treble out (fixed: their light is now about the strength of the game's own lamp, and neutral, so the white reads white
and the stone stays dark); the practice-room's lamp was moved behind the Cantor, off the child; the child was lowered onto
the step.

## For the owner ([PROPOSED])

1. That the school meets now in a room on the shade side, behind a low black door in the black wall by the bell-gallery stair.
2. The roll's two numbers: 312 names in the year of the Fracture, 26 this year.
3. The notice of 412: "Lessons are held in the west room until the nave is opened."
4. The treble's practice-room and its low step; the treble at dusk only, with a breath every nine seconds.
5. Benches in rows (the book has one bench, above the line); two hush-lamps in the schoolroom (needed to see it).
6. The two people's lines beyond the book's lesson and the greeting (see the table).
7. Whether "the great east window" is the Basilica's (as built: above the line) or the school's own. The book does not say.

## Questions for the owner

- Should the child be named? The design keeps them as "the treble" and "the Cantor".
- The door is drawn the full height of the wall, like the Anchorage's. Should it read lower?

## The new lines

| English | French | Source |
| --- | --- | --- |
| Sol-Luminary: the Basilica school | Sol-Luminary : l'école de la Basilique | [PROPOSED] |
| A low black door in the black wall. The Basilica school. | Une porte basse et noire dans le mur noir. L'école de la Basilique. | [PROPOSED] |
| The low black door, back out to the bell-gallery stair | La porte basse et noire, pour ressortir vers l'escalier de la galerie des cloches | [PROPOSED] |
| A short passage, black, and a hush-lamp on a hook whistling its small high note. Beyond it, a schoolroom. | Un court passage, noir, et une veilleuse à un crochet qui siffle sa petite note aiguë. Au-delà, une salle de classe. | Book Two l.1435, l.1721 |
| A hush-lamp on a hook, whistling its small high note. | Une veilleuse à un crochet, qui siffle sa petite note aiguë. | Book Two l.1435 |
| The Basilica school. Benches in rows before a desk, a slate on the wall, and two high windows of black glass. | L'école de la Basilique. Des bancs en rangs devant un pupitre, une ardoise au mur, et deux hautes fenêtres de verre noir. | [PROPOSED]; the glass: Book Two l.1403 |
| Benches worn pale where children sat. They are swept. | Des bancs usés jusqu'au pâle là où les enfants s'asseyaient. Ils sont balayés. | [PROPOSED] |
| The Cantor's desk, of black wood, under the slate. | Le pupitre du Chantre, en bois noir, sous l'ardoise. | [PROPOSED] |
| A Cantor's tuning-rod, laid on the desk. Struck, it gives one note. | La verge d'accord d'un Chantre, posée sur le pupitre. Frappée, elle donne une seule note. | Book Three l.929 (the rod); [PROPOSED] |
| Chalk on the slate, in a child's hand under the Cantor's: "Every soul holds one true note. Sin is the note going flat. Grace is the note held." | De la craie sur l'ardoise, d'une main d'enfant sous celle du Chantre : « Chaque âme porte une note juste. Le péché, c'est la note qui baisse. La grâce, c'est la note tenue. » | Book Three l.929 |
| A high lancet window of black glass. Nothing comes through it. | Une haute fenêtre en lancette, de verre noir. Rien ne passe au travers. | Book Two l.1403 |
| A notice by the passage, dated 412: "Lessons are held in the west room until the nave is opened." | Un avis près du passage, daté de 412 : « Les leçons se tiennent dans la salle ouest jusqu'à ce que la nef soit rouverte. » | [PROPOSED] |
| The children were taught on a bench under the great east window. The east window is on the other side of the iron wall. | On enseignait aux enfants sur un banc, sous la grande fenêtre est. La fenêtre est se trouve de l'autre côté du mur de fer. | Book Three l.929; Book Two l.1403, l.1405 |
| The school's roll, on a lectern by the west wall. Read it | Le registre de l'école, sur un lutrin près du mur ouest. Le lire | [PROPOSED] |
| The school's roll. Seven years of names, and a line through most of them. | Le registre de l'école. Sept années de noms, et un trait sur la plupart d'entre eux. | Phase 89 (plan) [PROPOSED] |
| The year of the Fracture: three hundred and twelve names. This year: twenty-six. | L'année de la Fracture : trois cent douze noms. Cette année : vingt-six. | [PROPOSED] |
| A practice step: a low stone step, worn hollow in the middle by small feet. | Une marche d'exercice : une marche de pierre basse, creusée au milieu par de petits pieds. | [PROPOSED] |
| The practice-room. A low step, worn hollow, and nobody on it now. | La salle d'exercice. Une marche basse, creusée par l'usure, et personne dessus à présent. | [PROPOSED] |
| A child in white stands on a low step and holds one note. A Cantor sits by, a tuning-rod across the knees. | Un enfant en blanc se tient sur une marche basse et tient une seule note. Un Chantre est assis à côté, une verge d'accord en travers des genoux. | [PROPOSED] |
| From the little room off the schoolroom, one high note, held. Now and then it stops for a breath, and goes on. | De la petite salle qui donne sur la classe, une note aiguë, tenue. De temps en temps elle s'arrête le temps d'un souffle, et reprend. | [PROPOSED] |
| The treble | Le soprano | [PROPOSED] |
| The Cantor | Le Chantre | Book Three l.929 |
| Light keep you true. | Que la Lumière vous garde juste. | the Heights' greeting (brief) |
| Light keep you true. Speak low, please. I am practising. | Que la Lumière vous garde juste. Parlez bas, s'il vous plaît. Je m'exerce. | [PROPOSED] |
| You are very loud. Out there they would call that low-pitched. | Vous parlez très fort. Là-dehors, on appellerait ça avoir la voix basse. | [PROPOSED] |
| The note | La note | [PROPOSED] |
| I am holding it. The Cantor says if I hold it every night it will hold itself. | Je la tiens. Le Chantre dit que si je la tiens chaque soir, elle finira par se tenir toute seule. | [PROPOSED] |
| Singing | Chanter | [PROPOSED] |
| We may sing here. Out there nobody speaks above the Narrow. | Ici, nous avons le droit de chanter. Là-dehors, personne ne parle plus haut que l'Étroit. | [PROPOSED] |
| Light keep you true. Sit, if you like, and keep the note company. | Que la Lumière vous garde juste. Asseyez-vous, si vous voulez, et tenez compagnie à la note. | [PROPOSED] |
| Light keep you true. In this room we speak softly, and we listen. | Que la Lumière vous garde juste. Dans cette salle, nous parlons doucement, et nous écoutons. | [PROPOSED] |
| The lesson | La leçon | [PROPOSED] |
| Every soul holds one true note. Sin is the note going flat. Grace is the note held. | Chaque âme porte une note juste. Le péché, c'est la note qui baisse. La grâce, c'est la note tenue. | Book Three l.929 |
| The second note | La seconde note | [PROPOSED] |
| The Church teaches that the second note is sin. | L'Église enseigne que la seconde note est un péché. | Series Bible l.245 ("every second note as sin") |
| The east window | La fenêtre est | [PROPOSED] |
| We taught under the east window, before. We teach here now. | Avant, nous enseignions sous la fenêtre est. Maintenant, nous enseignons ici. | [PROPOSED]; Book Three l.929 |
