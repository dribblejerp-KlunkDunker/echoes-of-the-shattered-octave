# Phase 82b: the map agrees with the ground; finger-posts; notice boards (built, for review)

Owner, 13 Nov 2026: "make sure that each location is exactly where it is on the map with roads leading in the proper directions with signposts. Each town or city should have signposts for notices and extra bits of lore and side quests."

Built on branch `phase-75-pixel-folk` (pull request #119) from the brief, `Phase 82b - The map, finger-posts and notice boards (brief and text).md`. The owner approved the brief's text as written for the build; every line stays **[PROPOSED]** here so he can change any of them. Code: `js/bearings82b.js` (the layout, the charts, the posts), `js/boards82b.js` (the boards and their tasks), `js/malting61.js` (the yard's gate). Test: `test/bearings82b.test.js`. French: `tools/i18n/p82b-bearings.tsv`, `tools/i18n/p82b-boards.tsv`.

## What was built

1. **One layout, worked out from the gates.** Oakhaven stands at a fixed point; every other outdoor place is placed from the gate it is reached by (where B stands = where A stands + A's gate − B's arriving gate, one cell across the shared edge), following the roads outward. Fourteen places in the Reach and four in the Woods. The Reach as walked is 977 cells across and 186 high.
2. **The travel map's region paintings are drawn in code** from the places themselves: their ground, water, walls, trees, hills and names, laid where the layout puts them, with the roads drawn between the gates (never ruled straight). A place you have not found is not drawn. The Reach chart is so wide that the travel panel now lays it across the top with the list beneath. The Synod's wash is carried across onto the new charts place by place, and still grows stage by stage.
3. **The Malting yard's way back to the Court is on its south side** (it was on the west, while the Court's door to it is on the Court's north side). You come into the yard at the south gate facing north, the orchard on your left and the Malting on your right; the queue walks off that way.
4. **Twenty-three finger-posts,** one at every way out between outdoor places, beside the road inside the gate, in the brief's words. Both renderers draw the existing `sign` sprite.
5. **Six notice boards** (Stillwater Landing, Wethercombe, Port Cantabile, the Hollow, the Low Rings, Greenroot), each with its notices, lore and tasks, and two more lines of lore on each of the three boards that were there. A task is taken from the board like the Oakhaven board's writs (it goes into your logbook), done in the world, and paid at the board.
**Ruled by the owner during the build, 13 Nov:** "above the notice boards where they clip through buildings add a small roof over the notice board to protect it from the rain". Every board now stands under its own small shingled roof, drawn low enough to sit under a house's eaves, and a board against a wall stands a step out from it.

6. **The test** `test/bearings82b.test.js` keeps it true: every pair of gates leaves and arrives by opposite sides; no two places overlap; every place lies on the chart in the direction its road leaves; every way out has a post within five cells; every town has its board; every task can be taken, done and paid; every line has French; nothing uses random numbers.

## Readings I had to take (please check)

- **No room at one cell.** The brief's rule, one cell across, lays six places over others (the clearing's east hedge sends two roads east past Oakhaven's corner). Where that happens the place is moved further out along the same road, never sideways: every direction and every gate's line stays exact, and the extra cells are road, drawn on the chart. The biggest such stretch is the 92 cells from the clearing's east hedge to the Long Common.
- **The water-meadow (measured, as the brief asked).** Its way back leaves the meadow by its **west** side and comes out at Oakhaven's **south** wall, at the tannery culvert's mouth. It is not a pair of gates (you go out through the culvert in a scene), so it is recorded rather than changed, and the meadow is laid outside Oakhaven's south wall, where the culvert goes. See question 4.
- **The clearing's east hedge** had no post (the brief thought the Greenroot road's post was there; the nearest thing was the hound-watch stand). The post is built with both arms; the second arm uses the words the brief gives the Long Common's post for the same road: "The other arm: GREENROOT, two days."
- **The Watch Downs' south stile** had no post (the Downs' one finger-post stands by the east gate, thirty cells away). The brief's arm "WETHERCOMBE, down the drove" is given a post of its own at the stile, in the brief's pattern ("A finger-post. ...").
- **Greenroot has no mill** in the game. Its board stands on the wall of the house by the village well. See question 5.
- **Greenroot's own rule** (a hint is one short line) means its post shows "A finger-post" and you read the rest by using it.
- **Journey times** keep the old rule, one minute a cell, so they are now as long as the roads really are: Oakhaven to Greenroot is about 14 hours on foot, cautiously about 18 (it was a little over an hour). The posts say two days. See question 6.
- **Things the brief did not give, made for the build and [PROPOSED]:** the rewards (3 to 10 sovereigns, the trapper's two eels); the bronze rigging-chime, sold by Fenwick Sloe at the chandler's for one sovereign; the short lines that say what you have just done and what a thing is when you look at it (all in the tables below); the "A bell for a bare hook" task line; a task counts a grave-bell already hung, as the Oakhaven board counts kills already made; the night and quiet rule for the traps (after dark and before dawn, standing still or creeping); the third board in from the chandler's door creaks (a noise, no words).

## Questions for the owner

1. **All the text below.** *Recommend: approve as written; say which lines to change.*
2. **Distances on the Reach's posts** ("half a day", "a day and a half"). Only "Greenroot, two days" is from the books. *Recommend: keep.*
3. **Greenroot's board gives no task,** because the hamlet is empty on purpose. *Recommend: keep.*
4. **The water-meadow's culvert.** Leave it as recorded (the meadow's back door on its west side, coming out at Oakhaven's south wall), or turn the meadow a quarter so its Hedge side faces north? *Recommend: leave it; the culvert is a scene, and turning the meadow would move Phase 49's staging.*
5. **Which house in Greenroot is the mill?** *Recommend: the house by the well, where the board is now.*
6. **Journey times.** Keep one minute a cell (Oakhaven to Greenroot about 14 hours), or a rate that makes the world map agree with the posts' two days? *Recommend: keep it until Phase 84 brings the pony and the waypoints.*
7. **Three ways out the brief has no words for:** Oakhaven's North Gate, Oakhaven's sluice-arch (the Flume Road gate), and the clearing's west gate to the Watch Downs. They have no post yet; the test names them and waits for your words.

## The finger-posts and the chart's names (js/bearings82b.js; tools/i18n/p82b-bearings.tsv)

| # | English [PROPOSED] | Français |
|---|---|---|
| 1 | A finger-post. OAKHAVEN. Under it, smaller: THE NORTH GATE SHUTS AT DUSK. | Un poteau indicateur. OAKHAVEN. En dessous, plus petit : LA PORTE NORD FERME AU CRÉPUSCULE. |
| 2 | A finger-post. THE STONES, a little way. The other arm: GREENROOT, two days. | Un poteau indicateur. LES PIERRES, à deux pas. L'autre bras : GREENROOT, deux jours. |
| 3 | A finger-post. OAKHAVEN, by the Hedge. The other arm: GREENROOT, two days. | Un poteau indicateur. OAKHAVEN, par la Haie. L'autre bras : GREENROOT, deux jours. |
| 4 | A finger-post. THE LEAP. Under it, smaller: GREENROOT, a day and a half. | Un poteau indicateur. LE SAUT. En dessous, plus petit : GREENROOT, un jour et demi. |
| 5 | A finger-post. THE LONG COMMON. Under it, smaller: OAKHAVEN, half a day. | Un poteau indicateur. LA LONGUE COMMUNE. En dessous, plus petit : OAKHAVEN, une demi-journée. |
| 6 | A finger-post. GREENROOT WOOD. Under it, smaller: GREENROOT, a day. | Un poteau indicateur. LE BOIS DE GREENROOT. En dessous, plus petit : GREENROOT, un jour. |
| 7 | A finger-post. THE LEAP. Under it, smaller: OAKHAVEN, a day. | Un poteau indicateur. LE SAUT. En dessous, plus petit : OAKHAVEN, un jour. |
| 8 | A finger-post. GREENROOT HAMLET. Somebody has chalked under it: nobody. | Un poteau indicateur. HAMEAU DE GREENROOT. Quelqu'un a écrit dessous, à la craie : personne. |
| 9 | A finger-post. OAKHAVEN, two days. The paint is fresh. Nobody is left to have painted it. | Un poteau indicateur. OAKHAVEN, deux jours. La peinture est fraîche. Il ne reste personne pour l'avoir peinte. |
| 10 | A finger-post with one arm, pointing back the way you came. THE HEDGE. | Un poteau indicateur à un seul bras, qui montre le chemin d'où vous arrivez. LA HAIE. |
| 11 | A finger-post. OAKHAVEN, by the sluice-arch. | Un poteau indicateur. OAKHAVEN, par l'arche de l'écluse. |
| 12 | A finger-post. STILLWATER LANDING, down. A second arm has been sawn off short. | Un poteau indicateur. L'EMBARCADÈRE DE STILLWATER, en bas. Un second bras a été scié au ras. |
| 13 | A finger-post. THE FLUME ROAD, up. Under it, smaller: OAKHAVEN. Nobody has ever been seen to read it. | Un poteau indicateur. LA ROUTE DE LA FLUME, en haut. En dessous, plus petit : OAKHAVEN. Personne n'a jamais été vu en train de le lire. |
| 14 | A plank on a post. THE LOW RINGS. Under it, in tar: at your own asking. | Une planche sur un poteau. LES ANNEAUX BAS. En dessous, au goudron : à vos risques. |
| 15 | A plank on a post. STILLWATER. The post stands in water to its knees. | Une planche sur un poteau. STILLWATER. Le poteau a de l'eau jusqu'aux genoux. |
| 16 | A finger-post. WETHERCOMBE, down the drove. | Un poteau indicateur. WETHERCOMBE, en bas par le chemin de transhumance. |
| 17 | A finger-post. THE HANGER. Under it, cut small with a knife: not after dark. | Un poteau indicateur. LE PENDANT. En dessous, gravé petit au couteau : pas après la nuit tombée. |
| 18 | A finger-post, green with moss. WETHERCOMBE. The Bellwether's ram is burned into the wood under it. | Un poteau indicateur, vert de mousse. WETHERCOMBE. Le bélier du Bellwether est marqué au fer dans le bois, en dessous. |
| 19 | A post with no arm. Somebody has tied a hush-lamp's reed to it, and it whistles. | Un poteau sans bras. Quelqu'un y a attaché le roseau d'une veilleuse, et il siffle. |
| 20 | A way-post in marble. THE MALTING. Under it, in new Office paint: RELIEF STATION NINETEEN. | Une borne de marbre. LA MALTERIE. En dessous, en peinture neuve de l'Office : POSTE DE SECOURS DIX-NEUF. |
| 21 | A way-post in marble. THE BELL YARD AND ASHLANE. Nobody has cleaned the weed off it. | Une borne de marbre. BELL YARD ET ASHLANE. Personne n'en a ôté les herbes. |
| 22 | A way-post in marble. THE COURT. | Une borne de marbre. LA COUR. |
| 23 | A painted Office board on a stake. TO THE COURT. QUEUE THIS SIDE. | Un panneau peint de l'Office, sur un piquet. VERS LA COUR. FAITES LA QUEUE DE CE CÔTÉ. |
| 24 | The Long Common | La Longue Commune |
| 25 | The Greenroot Road | La route de Greenroot |
| 26 | Greenroot Wood | Le bois de Greenroot |
| 27 | The Sunken Court | La Cour Engloutie |
| 28 | A finger-post | Un poteau indicateur |

## The notice boards and their tasks (js/boards82b.js; tools/i18n/p82b-boards.tsv)

| # | English [PROPOSED] | Français |
|---|---|---|
| 29 | Notices | Avis |
| 30 | Lore | Ce qu'on y lit encore |
| 31 | To take | À prendre |
| 32 | Close | Fermer |
| 33 | Take it. Reward: {0} sovereigns. | La prendre. Récompense : {0} souverains. |
| 34 | In hand: {0} of {1}. | En cours : {0} sur {1}. |
| 35 | Done. Claim {0} sovereigns. | Fait. Réclamer {0} souverains. |
| 36 | Done and paid. | Fait et payé. |
| 37 | You take the notice down and put it in your pocket. | Vous décrochez l'avis et le mettez dans votre poche. |
| 38 | That is done. The board will pay for it. | C'est fait. Le tableau paiera. |
| 39 | You claim {0} sovereigns. | Vous réclamez {0} souverains. |
| 40 | And two eels from the trapper. | Et deux anguilles du piégeur. |
| 41 | The pier end. A willow trap goes off here. | Le bout de la jetée. Une nasse d'osier se pose ici. |
| 42 | A willow trap, set off the pier. | Une nasse d'osier, posée au bout de la jetée. |
| 43 | You set a willow trap off the pier, quietly. | Vous posez une nasse d'osier au bout de la jetée, sans bruit. |
| 44 | Not now. Before light: after dark, and before the dawn. | Pas maintenant. Avant le jour : après la tombée de la nuit, et avant l'aube. |
| 45 | Too much noise. Wait until you are quiet. | Trop de bruit. Attendez que le silence revienne. |
| 46 | Flume-Reed in the shallows by the gangway. | Du roseau du Bief dans les hauts-fonds, près de la passerelle. |
| 47 | You cut a bundle of Flume-Reed, green. {0} of 6. | Vous coupez une botte de roseau du Bief, vert. {0} sur 6. |
| 48 | You have six bundles. They go to the cooperage door. | Vous avez six bottes. Elles vont à la porte de la tonnellerie. |
| 49 | The cooperage door. The reed is to be left here. | La porte de la tonnellerie. C'est ici qu'on laisse le roseau. |
| 50 | You leave the reed at the cooperage door. | Vous laissez le roseau à la porte de la tonnellerie. |
| 51 | Six bundles. You have {0}. | Six bottes. Vous en avez {0}. |
| 52 | Hurdles, stacked by the barn. | Des claies, empilées près de la grange. |
| 53 | You take two hurdles from the barn. | Vous prenez deux claies à la grange. |
| 54 | Your arms are full. | Vous avez les bras pleins. |
| 55 | The fold. Hurdles and the bell go here. | Le parc. Les claies et la clochette vont ici. |
| 56 | You set two hurdles at the fold. {0} of 12. | Vous posez deux claies au parc. {0} sur 12. |
| 57 | You hang the bell at the fold. It does not ring. | Vous accrochez la clochette au parc. Elle ne sonne pas. |
| 58 | You have nothing for the fold. | Vous n'avez rien pour le parc. |
| 59 | Something bronze in the grass by the dew-pond. | Quelque chose de bronze dans l'herbe, près de la mare de rosée. |
| 60 | A wether-bell, bronze, the tongue tied with wool. It does not ring. | Une clochette de meneuse, en bronze, le battant noué de laine. Elle ne sonne pas. |
| 61 | A shroud with no chime. | Un hauban sans carillon. |
| 62 | A shroud with its chime again. | Un hauban qui a retrouvé son carillon. |
| 63 | You hang a chime on the shroud. The wind finds it at once. | Vous accrochez un carillon au hauban. Le vent le trouve aussitôt. |
| 64 | You have no chime. The chandler on the third landing sells them. | Vous n'avez pas de carillon. Le chandelier du troisième palier en vend. |
| 65 | Bronze rigging-chime | Carillon de gréement en bronze |
| 66 | A bar of small bronze tubes for a shroud-head, the kind every hull in the harbour carries. | Une barre de petits tubes de bronze pour la tête d'un hauban, comme en porte chaque coque du port. |
| 67 | Rooke's tonic, for the pencilled doors. | Le tonique de Rooke, pour les portes marquées au crayon. |
| 68 | You take three bottles of Rooke's tonic. | Vous prenez trois flacons du tonique de Rooke. |
| 69 | A marked door. Knock once. | Une porte marquée. Frappez une fois. |
| 70 | Rooke's tonic, left on the step. | Le tonique de Rooke, laissé sur le seuil. |
| 71 | You knock once and leave the tonic on the step. {0} of 3. | Vous frappez une fois et laissez le tonique sur le seuil. {0} sur 3. |
| 72 | You have no tonic left. The surgery has it. | Il ne vous reste pas de tonique. Le cabinet de Rooke en a. |
| 73 | Two pails by the well. | Deux seaux près du puits. |
| 74 | You draw two pails. | Vous tirez deux seaux. |
| 75 | The step of the end house. | Le seuil de la dernière maison. |
| 76 | You leave the pails on the step of the end house. | Vous laissez les seaux sur le seuil de la dernière maison. |
| 77 | You have no water. Draw it at the well. | Vous n'avez pas d'eau. Tirez-la au puits. |
| 78 | A day-book on the loft shelf. | Un livre de comptes sur l'étagère du grenier. |
| 79 | The chandler's day-book. You bring it out of the loft. | Le livre de comptes du chandelier. Vous le sortez du grenier. |
| 80 | Stillwater Landing: the piling board | L'Embarcadère de Stillwater : le tableau du pieu |
| 81 | THE LOWER LOCK IS SHUT BY ORDER. No name is given for whose order. | L'ÉCLUSE BASSE EST FERMÉE PAR ORDRE. Aucun nom ne dit de qui vient l'ordre. |
| 82 | TIMBER COMPACT. Strike fund paid out Stasisday, at the raft, to men on the roster. Men not on the roster: see the steward. Men not anywhere: we are asking. | PACTE DU BOIS. Caisse de grève versée le Stasedi, au radeau, aux hommes inscrits au registre. Hommes non inscrits : voir l'intendant. Hommes introuvables : nous posons la question. |
| 83 | Rafts tied here longer than a month are the Landing's. | Les radeaux amarrés ici plus d'un mois appartiennent à l'Embarcadère. |
| 84 | A Cantabile broadsheet, pasted crooked, three weeks old. The headline has been torn off. What is left says the plazas of Whisper-Grove are full of people, standing. | Une feuille de Cantabile, collée de travers, vieille de trois semaines. Le gros titre a été arraché. Ce qui reste dit que les places de Whisper-Grove sont pleines de gens, debout. |
| 85 | In pencil, low down, in a child's hand: the eels know where it goes. | Au crayon, tout en bas, d'une écriture d'enfant : les anguilles savent où ça va. |
| 86 | Wethercombe: the Bellwether's board | Wethercombe : le tableau du Bellwether |
| 87 | A fair-day bill, brown with age. WETHERCOMBE FAIR. EIGHT HUNDRED HEAD. The year is 417. There has not been another. | Une affiche de jour de foire, brunie par l'âge. FOIRE DE WETHERCOMBE. HUIT CENTS TÊTES. L'année est 417. Il n'y en a pas eu d'autre. |
| 88 | STRAYS TO THE PINFOLD. A penny a head to have them back. Nobody has crossed it out, though there is nothing to stray. | BÊTES ÉGARÉES À LA FOURRIÈRE. Un sou par tête pour les reprendre. Personne ne l'a rayé, bien qu'il n'y ait plus rien pour s'égarer. |
| 89 | In Gideon Thrale's hand: ROOMS, A SOVEREIGN. CIDER. NO CREDIT ON WOOL UNTIL THERE IS WOOL. | De la main de Gideon Thrale : CHAMBRES, UN SOUVERAIN. CIDRE. PAS DE CRÉDIT SUR LA LAINE TANT QU'IL N'Y A PAS DE LAINE. |
| 90 | The levy notice of the autumn of 417, the Moot's seal still on it: every fleece in the Reach, for the Hedge. | L'avis de réquisition de l'automne 417, le sceau du Conseil encore dessus : chaque toison des Confins, pour la Haie. |
| 91 | The rhyme, in chalk: When the Ram is white and the fires burn, the barrow gives back. | La comptine, à la craie : Quand le Bélier est blanc et que brûlent les feux, le tertre rend ce qu'il a pris. |
| 92 | Port Cantabile: the Harbour board | Port Cantabile : le tableau du Port |
| 93 | DUES AT SLACK WATER, TO THE HARBOUR-QUEEN'S OWN HAND. Six sovereigns a hull, a day. | DROITS À L'ÉTALE, DANS LA MAIN MÊME DE LA REINE DU PORT. Six souverains par coque et par jour. |
| 94 | ARTICLE THE SIXTEENTH. What lies below the tide-mark belongs to whoever brings it up. The Harbour takes a fifth. | ARTICLE SEIZIÈME. Ce qui gît sous la laisse de marée appartient à qui le remonte. Le Port en prend un cinquième. |
| 95 | NOBODY SLEEPS ASHORE. | PERSONNE NE DORT À TERRE. |
| 96 | Four broadsheets pinned one over another, each calling the others liars. One of them is right about something, and there is no telling which. | Quatre feuilles épinglées l'une sur l'autre, chacune traitant les autres de menteuses. L'une d'elles a raison sur quelque chose, et rien ne dit laquelle. |
| 97 | A tide-table in a small neat hand, with the key the reef sings at each hour. The last column is headed WINTER, and every line of it is the same. | Une table des marées d'une petite écriture soignée, avec le ton que chante le récif à chaque heure. La dernière colonne porte HIVER en tête, et chacune de ses lignes est la même. |
| 98 | The Hollow: the Grafters' board | Le Creux : le tableau des Greffeurs |
| 99 | INSPECTION, ROOTDAY MORNING. Households to stand at their doors. Those who cannot stand are to be brought to the door. | INSPECTION, RACINEDI MATIN. Les foyers se tiendront à leur porte. Ceux qui ne peuvent se tenir debout y seront amenés. |
| 100 | THIRTY-ONE HOUSEHOLDS. Under it, in pencil, somebody keeps the number of souls, and has rubbed it out and written it again many times. | TRENTE ET UN FOYERS. En dessous, au crayon, quelqu'un tient le compte des âmes, et l'a effacé et récrit bien des fois. |
| 101 | No singing above the tending note. | Pas de chant au-dessus de la note de soin. |
| 102 | A list of doors in Rooke's hand, each with a mark like a leaf. Some marks have a second stroke through them. | Une liste de portes de la main de Rooke, chacune avec une marque comme une feuille. Certaines marques sont barrées d'un second trait. |
| 103 | A child's drawing of a wagon, with the horses given too many legs. | Un dessin d'enfant représentant un chariot, dont les chevaux ont trop de pattes. |
| 104 | The Low Rings: the board at the gangway | Les Anneaux bas : le tableau de la passerelle |
| 105 | BY ORDER OF THE MOOT. THE LOW RINGS ARE CLOSED UNTIL THE WATER IS PUT RIGHT. The date has been scraped off. | PAR ORDRE DU CONSEIL. LES ANNEAUX BAS SONT FERMÉS JUSQU'À CE QUE L'EAU SOIT REMISE EN ORDRE. La date a été grattée. |
| 106 | Under it, in pencil: LEAVE THE WATER ALONE. | En dessous, au crayon : LAISSEZ L'EAU TRANQUILLE. |
| 107 | A row of notches down the board's edge, each with a year cut beside it, each a hand higher than the last. | Une rangée d'encoches le long du bord du tableau, chacune avec une année gravée à côté, chacune une main plus haut que la précédente. |
| 108 | A scrap of ledger paper: "took only what was ours. Left the cashbox." | Un bout de page de registre : "pris seulement ce qui était à nous. Laissé la caisse." |
| 109 | Greenroot: the board by the mill | Greenroot : le tableau près du moulin |
| 110 | The chapel reed to be re-cut on Rootday next. | Le roseau de la chapelle sera recoupé Racinedi prochain. |
| 111 | In the physician's hand: THE WARD IS FULL. Do not bring them to me. Send, and I will come. | De la main du médecin : LA SALLE EST PLEINE. Ne me les amenez pas. Faites-moi appeler, et je viendrai. |
| 112 | Meal, by the peck. The prices have been chalked up, rubbed out and chalked lower. | Farine, au boisseau. Les prix ont été écrits à la craie, effacés, puis récrits plus bas. |
| 113 | A notice begun in good ink, "To whoever comes after us," and nothing after it. | Un avis commencé à la bonne encre, "À ceux qui viendront après nous", et rien après. |
| 114 | "The North Gate shuts at dusk. It does not open for a voice you know." | "La porte Nord ferme au crépuscule. Elle ne s'ouvre pas pour une voix que vous connaissez." |
| 115 | "Lamp oil, four pence the pint. Five by the thaw." | "Huile de lampe, quatre sous la pinte. Cinq au dégel." |
| 116 | "Do not speak to the residents. Do not finish their sentences." | "Ne parlez pas aux résidents. Ne finissez pas leurs phrases." |
| 117 | In Veil-grey ink: "Two hundred and four in the Plaza of the Willows. Counted." | À l'encre gris du Voile : "Deux cent quatre sur la Place des Saules. Comptés." |
| 118 | "Fire small. Watch doubled. Nobody goes north alone." | "Petit feu. Garde doublée. Personne ne va au nord seul." |
| 119 | In Mags's hand: "Whoever took the good kettle, I know." | De la main de Mags : "Toi qui as pris la bonne bouilloire, je sais." |
| 120 | Three traps before light. | Trois nasses avant le jour. |
| 121 | "Wanted: hands that can keep quiet. Ask at the pier end." | "On demande : des mains qui savent se taire. S'adresser au bout de la jetée." |
| 122 | Set three willow traps off the pier at night without raising your noise. The eel-trapper pays in eels and a little coin. | Posez trois nasses d'osier au bout de la jetée, de nuit, sans faire de bruit. Le piégeur d'anguilles paie en anguilles et en un peu de monnaie. |
| 123 | Reed for the thatcher. | Du roseau pour le chaumier. |
| 124 | "Six bundles of Flume-Reed, cut green, to the cooperage door." | "Six bottes de roseau du Bief, coupées vertes, à la porte de la tonnellerie." |
| 125 | Cut reed in the shallows by the gangway and leave it at the door. | Coupez du roseau dans les hauts-fonds près de la passerelle et laissez-le à la porte. |
| 126 | Twelve hurdles. | Douze claies. |
| 127 | "Hurdles wanted at the fold. Twelve. T. Farrant." | "On demande des claies au parc. Douze. T. Farrant." |
| 128 | Carry them from the barn, two at a time. | Portez-les depuis la grange, deux à la fois. |
| 129 | The lead ewe's bell. | La clochette de la meneuse. |
| 130 | "Lost on the Downs: a wether-bell, bronze, the tongue tied with wool. It will not ring. That is how you will know it." | "Perdue sur les Hauts : une clochette de meneuse, en bronze, le battant noué de laine. Elle ne sonnera pas. C'est à cela que vous la reconnaîtrez." |
| 131 | Find it by the dew-pond and bring it to the fold. | Trouvez-la près de la mare de rosée et rapportez-la au parc. |
| 132 | A bell for a bare hook. | Une cloche pour un crochet nu. |
| 133 | "There are hooks on the Cay with nothing on them. A bell is a copper." | "Il y a des crochets sur la Caye où rien ne pend. Une cloche coûte un sou." |
| 134 | Buy a small bell at the chandler's on the third landing and hang it on a bare hook on Driftwood Cay. | Achetez une petite cloche chez le chandelier du troisième palier et accrochez-la à un crochet nu sur la Caye du Bois-Flotté. |
| 135 | Three chimes. | Trois carillons. |
| 136 | "Three shrouds on the second quay have lost their chimes. A harbour with a silent shroud is asking for it." | "Trois haubans du deuxième quai ont perdu leurs carillons. Un port qui a un hauban muet le cherche." |
| 137 | Buy three at the chandler's and hang them. | Achetez-en trois chez le chandelier et accrochez-les. |
| 138 | Three doors. | Trois portes. |
| 139 | "Tonic for the pencilled doors, from the surgery. Knock once." | "Du tonique pour les portes marquées au crayon, à prendre au cabinet. Frappez une fois." |
| 140 | Carry Rooke's tonic to three marked doors. | Portez le tonique de Rooke à trois portes marquées. |
| 141 | Water for the end house. | De l'eau pour la dernière maison. |
| 142 | "The end house cannot come to the well." | "La dernière maison ne peut pas venir au puits." |
| 143 | Draw two pails and leave them on the step. | Tirez deux seaux et laissez-les sur le seuil. |
| 144 | The chandler's book. | Le livre du chandelier. |
| 145 | "My husband's day-book is in the loft over the shop. I am in the Ladder now and cannot fetch it. Mind the third board." | "Le livre de comptes de mon mari est au grenier au-dessus de la boutique. Je suis à l'Échelle maintenant et je ne peux pas aller le chercher. Attention à la troisième planche." |
| 146 | Bring the book out of the chandler's loft. | Sortez le livre du grenier du chandelier. |

## Pictures

`screenshots/p82b-chart-reach.jpg`, `p82b-chart-woods.jpg`, `p82b-travel-reach.jpg`, `p82b-travel-woods.jpg`, `p82b-board-panel.jpg`, `p82b-landing-board.jpg`, `p82b-combe-board.jpg`, `p82b-common-post.jpg`, `p82b-clearing-post.jpg`, `p82b-yard-gate.jpg`, and the walk `p82b-combe-walk.gif`.
