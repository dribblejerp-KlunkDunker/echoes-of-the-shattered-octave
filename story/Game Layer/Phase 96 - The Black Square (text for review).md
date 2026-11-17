# Phase 96: the Dawning Heights, part four: the black square (text for review)

*Written 16 Nov 2026 by Team C (builder C-BUILD-BELLYARD), under the owner's approval of Phases 89 and 90 (14 Nov) and the Team C design of 16 Nov. Code: `js/bellyard96.js` (global `BLACKSQUARE96`; `BELLYARD96` still points at it until the files are renamed). Test: `test/bellyard96.test.js`. French: `tools/i18n/p96-bellyard.tsv`. Every line is new and [PROPOSED] unless a book is named.*

## The place is the black square, not "the Bell Yard"

The plan (Phase 89 l.274, Phase 90 l.133) called this place "the Bell Yard": "the yard under the bell-gallery, where the bell-ropes come down through a hole in the vault", with a ringers' bench, and said the name was Book Two's. Reading the books for this build showed three things wrong with that, and the book wins:

1. **"The Bell Yard" is a Whisper-Grove street.** It is in Book One, not Book Two: "Halder Wick, fifty-eight, joiner, of the Bell Yard" (Book One full MS l.4097), "there were flowers in a window-box on Bell Yard" (l.4235). The game has already built it (`js/grove31.js`, Phase 31). A second Bell Yard in Sol-Luminary would collide with it.
2. **The bell is not in the bell-gallery.** The gallery is "a narrow stone balcony under the white dome" (Book Two, Part Two l.1737), in the Bleach, reached only past the iron door and through the sealed Lightward Nave. From the gallery, the bell rings *below*: "Below them, in the black tower, a bell began to ring the third hour, and the procession." (l.1785). The bell is the black tower's: "It rang down through the whole of the Umbral Tiers from the Basilica's black tower" (l.1637).
3. **No yard, ropes, vault or ringers are in the book.** The one open ground the book gives by the Basilica on the shade side is the black square: "Through the black square in front of the Basilica's west end, where the shade lay thick as wool and the great black doors stood shut under their black lancet windows." (l.2305).

So this phase builds **the black square in front of the Basilica's west end**, with the black tower and its bell over it, as Book Two gives it. Nobody rings the bell where the player can see; the tower is never entered.

## The book's lines this place stands on

All from `story/Books/Book Two - The Great Discord/Part Two Ch8-14.md` (quoted in `/home/claude/army96/c/LORE-bellyard.md`, with the hammock line checked for this record):

- l.1403: "Below the line, in the shade, its west end was black: black stone, black doors, black glass in the high lancet windows ... The great dome over the crossing had been gilded once; you could see the shape of the old gold in the ribs of it ... It was white now ... and it stood up into the overexposed sky like a bone."
- l.1637: "At noon a bell rang. It rang down through the whole of the Umbral Tiers from the Basilica's black tower, a deep slow bronze note that Lyra felt in the cot-frame, and she heard the Tiers go silent beneath it, level on level".
- l.1647: "The bell rang again. Once. And the Tiers stayed silent for a long time after."
- l.1785: "Below them, in the black tower, a bell began to ring the third hour, and the procession."
- l.2305: "Through the black square in front of the Basilica's west end, where the shade lay thick as wool and the great black doors stood shut under their black lancet windows."
- l.2309: "Every shutter on the square was open a crack. He could feel them watching."
- l.2311: "He went up the black steps to the black doors".
- l.2911: "The Tiers slept in the morning; they lived at night."
- Vol VII l.84 to l.92 (the hours): the hours of the morning count from midnight. So "the third hour" is three in the morning.

## What is kept out (the books do these later, in Ashfall 419)

- **No herald and no proclamation.** At noon on the twelfth of Ashfall the bell calls the Tiers to hear the Restoration read from the tower (l.1639 to l.1645). In Harvestmonth no Restoration has been called. Here the bell only rings.
- **The great black doors never open.** Ignatius opens them to Kaelen in Ashfall (l.2315). The lock says "nobody here knocks".
- **No Pure Note from the tower.** The book's note through the tower's stones (l.2305) is held "because the Church was preparing a Rite" (l.1415); none is being prepared in Harvestmonth (the design's ruling).
- **No named person.** Nobody from the books is met here. The watchers behind the shutters are unnamed, and none of them speaks of the Rite, the Vessel, the angel or the Cantor of the Reach.

## What was built

- **The way in.** A black arch in the Tiers' black wall at **p92_tiers (72, 5)**, set from this module's `join()`. It is west of the iron door (80, 5), toward the Basilica's black west end, inside the bell-gallery stair's room (x 70 to 92), on walkable row 6, clear of the Bleach patch at x 61 to 67 and of the offerings east of the iron door. It is not the school's cell (89, 5). Label: "A black arch in the wall. The way round to the Basilica's west end." An arch at (13, 22) leads back to the Tiers at (72.5, 6.6).
- **The map, `p96_blacksquare`** (26 x 24). Black flagstones (x 3 to 22, y 6 to 21); houses of black stone on the west, south and east; the Basilica's west front along the north. The shade is near black, with a cold colour grade so that black reads as black and white as white.
- **The black steps** (x 9 to 16, y 3 to 5), three steps, each a quarter of a unit higher going north.
- **The great black doors** at the top (12 and 13, 2): two leaves of black oak, iron-strapped. Locked for good (`p96c_never`): "The great black doors. They stand shut, and nobody here knocks."
- **Three black lancet windows** over the doors.
- **The white dome** over the line, above the black roof: seen from the square's south side, glowing so that it stays white. Never reached.
- **The black tower** (x 19 to 21, y 3 to 6), its bell high in an opening on its south face. The tower door (20, 6) is barred inside. At the tower's foot, **the board of hours**.
- **Six shutters**, one on each side's houses, each open a crack with a faint glint behind it. By day (six in the morning to about half past two in the afternoon) somebody sleeps behind each one. By night three of the six answer, in the Narrow, each its words in turn; the other three do not answer.
- **The wonder: the bell.** It rings when the hour turns to **noon** or **the third hour**, while the player is in the square or in the Tiers. It strikes three times, six seconds apart: a bronze tone made in code, a 65 Hz fundamental with a hum below it and inharmonic partials, dying away over about five seconds. On the first stroke a silence starts at the wall and goes down the Tiers **level on level**, twenty rows a second (the docks, two hundred rows down, after about ten seconds). It holds everywhere until forty seconds after the last stroke. While it holds:
  - in the square, the shutters do not answer ("They do not answer until the bell has done.");
  - in the Tiers, the folk stand still where the silence has reached, and do not talk; they walk again when it lifts. In the Tiers the bell says once a toll: "From the Basilica's black tower, a bell: a deep slow bronze note. Beneath it the Tiers go silent, level on level."
  - The first toll ever heard adds: "The whole of the Tiers goes still under it, and stays still a long time after." (l.1647.)
  - A long rest that steps over the hour does not ring it. Each toll heard raises `p96c_tolls` (to nine).
- **Flags:** `p96c_sq` (bits for lines said once, 0 to 255), `p96c_tolls` (0 to 9). Both read through a clamp.
- **No foes, gear, items or lamps.** The Souls group `m` is unused.

Test: `test/bellyard96.test.js`, 16 checks: the arch both ways; reaching the steps' top, the tower door, the board and every shutter; the locked doors; the shutters by day, by night and under the bell; three strokes; the wave (row 7 at once, row 200 at about ten seconds); the lift forty seconds after the last stroke; noon and the third hour by the hour crossing; a rest over the hour; the cap at nine; the Tiers' folk still and silent, then walking; the art; the white dome; French for every line; no book names, herald, proclamation or Rite; no page errors; no chance in the building.

## For the owner

1. **The place is the black square, not "the Bell Yard".** The plan's name collides with Whisper-Grove's street, and the book puts the bell in the black tower over this square. *Recommend: keep. The file names keep "bellyard" until the Commander renames them.*
2. **The in-game name** "Sol-Luminary: the black square" [PROPOSED], from the book's own words. *Recommend: keep.*
3. **The way in** is a black arch west of the iron door, at Tiers (72, 5) [PROPOSED]. *Recommend: keep.*
4. **The bell's numbers** [PROPOSED]: three strokes, six seconds apart; the silence going down at twenty rows a second and lifting forty seconds after the last stroke; a 65 Hz bronze tone. The book gives noon with two rings and a herald between them, and "the third hour"; it does not say how many strokes. *Recommend: keep, and tune after you have stood in it.*
5. **The bell rings every day at noon and the third hour** in Harvestmonth. The book only shows it in Ashfall, but nothing says it is silent before. *Recommend: keep.*
6. **The board of hours** and its words [PROPOSED]. *Change any.*
7. **The watchers' words.** Three lines are the design's ("Light keep you true. Speak low.", "When the bell goes, we stop. All of us. All the way down.", "Nobody knocks at those doors."); six more are [PROPOSED]. *Change any.*
8. **Who sleeps when.** By day (tod 0.25 to 0.6) the watchers sleep (Book Two l.2911: "The Tiers slept in the morning; they lived at night.") The window is [PROPOSED]. *Recommend: keep.*
9. **Nobody rings the bell where the player can see**, and the tower is never entered. The book names no ringer. *Recommend: keep.*

## Flags for the Commander

- **Door cell:** p92_tiers (72, 5), portal to p96_blacksquare (13.5, 21.4). The school's is (89, 5); the Anchorage's (94, 13).
- **The Tiers' sound under the bell.** heights92 has no hook for an ambient murmur; the only sound it keeps is the 528 Hz Unison hum, which is the Bleach's and is left alone. The silence is shown in the Tiers by the folk (they stand still and do not talk), from this module, without editing heights92.js. If a murmur is ever added to the Tiers, it should fall silent with `BLACKSQUARE96.silentAt(row)`.
- **Shared wrappers:** this module wraps `talk` (only for `p92_` people in the Tiers while the silence holds where they stand), `useDeco`, `loadMap`, `update` and `buildAllMaps`, as the other modules do.
- **Colour grade:** at load it sets `POST.config.grade.p96_blacksquare = 'crypt'` (cold), because the default interior grade is candle-warm and turned the white dome to parchment. No other map is touched.
- **Small changes to the design:** the fog distance is 24, not 10, because sprites beyond about 1.14 fog lengths are not drawn and the dome must show from the south side. The way back is at (13, 22), not (13, 23), because row 22 is the south houses' face.
- heights92's bell-stair line already says the bell hangs "in the black tower, on this side", as the book has it.

## The new lines

| English | French |
|---|---|
| Sol-Luminary: the black square [PROPOSED] | Sol-Luminary : la place noire |
| A black arch in the wall. The way round to the Basilica's west end. [PROPOSED] | Une arche noire dans le mur. Le chemin qui contourne jusqu'à l'extrémité ouest de la Basilique. |
| The black arch, back down into the Tiers [PROPOSED] | L'arche noire, pour redescendre dans les Étages |
| The black square in front of the Basilica's west end. The shade lies thick as wool. Every shutter on the square is open a crack, and you can feel them watching. (Book Two l.2305, l.2309) | La place noire, devant l'extrémité ouest de la Basilique. L'ombre y est épaisse comme de la laine. Chaque volet de la place est entrouvert, et vous sentez qu'on vous observe. |
| The black steps, up to the black doors. (Book Two l.2311) | Les marches noires, jusqu'aux portes noires. |
| The great black doors of the Basilica's west end (Book Two l.2305) | Les grandes portes noires de l'extrémité ouest de la Basilique |
| The great black doors. They stand shut, and nobody here knocks. [PROPOSED] | Les grandes portes noires. Elles restent closes, et personne ici ne frappe. |
| Black glass in a high lancet window. (Book Two l.1403) | Du verre noir dans une haute fenêtre en lancette. |
| Over the black roof, on the other side of the line: the great dome over the crossing. It was gilded once. It is white now, and it stands up into the sky like a bone. (Book Two l.1403) | Au-dessus du toit noir, de l'autre côté de la ligne : le grand dôme de la croisée. Il fut doré autrefois. Il est blanc à présent, et se dresse dans le ciel comme un os. |
| The door of the black tower [PROPOSED] | La porte de la tour noire |
| The tower door. It is barred inside. [PROPOSED] | La porte de la tour. Elle est barrée de l'intérieur. |
| The Basilica's bell, high in the black tower. Its note is deep and slow, and bronze. (Book Two l.1637) | La cloche de la Basilique, tout en haut de la tour noire. Sa note est grave et lente, et de bronze. |
| A board on the tower's foot, the words cut in and blacked: "The Basilica's bell is rung at noon, and at the third hour. When it rings, be still." [PROPOSED; the hours are Book Two l.1637, l.1785] | Un panneau au pied de la tour, les mots gravés et noircis : « La cloche de la Basilique sonne à midi, et à la troisième heure. Quand elle sonne, restez immobile. » |
| A shutter, open a crack. Somebody is behind it. (Book Two l.2309) | Un volet entrouvert. Quelqu'un se tient derrière. |
| A shutter, open a crack. Somebody sleeps behind it. (Book Two l.2911) | Un volet entrouvert. Quelqu'un dort derrière. |
| Nobody answers. The crack stays open, and somebody stays behind it. [PROPOSED] | Personne ne répond. Le volet reste entrouvert, et quelqu'un reste derrière. |
| They do not answer until the bell has done. [PROPOSED] | On ne vous répond pas tant que la cloche n'a pas fini. |
| Over you, in the black tower, the bell: a deep slow bronze note. Behind every shutter on the square the talk stops. [PROPOSED; "a deep slow bronze note" is Book Two l.1637] | Au-dessus de vous, dans la tour noire, la cloche : une note de bronze, grave et lente. Derrière chaque volet de la place, les voix se taisent. |
| From the Basilica's black tower, a bell: a deep slow bronze note. Beneath it the Tiers go silent, level on level. (Book Two l.1637) | De la tour noire de la Basilique, une cloche : une note de bronze, grave et lente. Sous elle, les Étages se taisent, niveau après niveau. |
| The whole of the Tiers goes still under it, and stays still a long time after. (Book Two l.1647) | Tous les Étages s'immobilisent sous elle, et restent immobiles longtemps après. |
| Light keep you true. Speak low. (the greeting is canon; the design's line) | Que la Lumière vous garde juste. Parlez bas. |
| Up here we keep to the shade, and the shade keeps to us. [PROPOSED] | Ici, en haut, nous gardons l'ombre, et l'ombre nous garde. |
| Go back down quietly. Quiet is how we know each other. [PROPOSED] | Redescendez sans bruit. C'est au silence que nous nous reconnaissons. |
| When the bell goes, we stop. All of us. All the way down. (the design's line, from Book Two l.1637) | Quand la cloche sonne, nous nous arrêtons. Tous. Jusqu'en bas. |
| It rings at noon, and at the third hour. We hear it in our sleep. [PROPOSED] | Elle sonne à midi, et à la troisième heure. Nous l'entendons dans notre sommeil. |
| After it has done, nobody is the first to speak. You wait for somebody else to. [PROPOSED] | Quand elle a fini, personne ne parle le premier. On attend qu'un autre le fasse. |
| Nobody knocks at those doors. (the design's line) | Personne ne frappe à ces portes. |
| The black steps are the Church's. We sweep up to the bottom one and no further. [PROPOSED] | Les marches noires sont à l'Église. Nous balayons jusqu'à la première, pas plus loin. |
| If the Church wants you, it will find you. You do not knock. [PROPOSED] | Si l'Église vous veut, elle vous trouvera. On ne frappe pas. |
