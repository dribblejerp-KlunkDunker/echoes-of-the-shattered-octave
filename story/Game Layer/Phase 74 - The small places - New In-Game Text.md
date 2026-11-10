# Phase 74 — ROADMAP R10 wave 4: the small places keep the hours

*Recorded 10 Nov 2026 from the game's translation file (`tools/i18n/p74-smallplaces.tsv`). The people are [PROPOSED] (roles, no names); each is of a kind the book or the game already puts in that place, and none of the named people moves. No book character speaks, so nothing new is voiced.*

## What is new, in short

- **Thirty-one people in five small places** (`js/life74-smallplaces.js`, on the `js/life60.js` engine):
  - **Stillwater Landing** (7): two wharf hands (barrels; oiled lashings), an eel-catcher on the pier at first light, three of Tobit Dree's six buyers of news coming to his porch at their own hours (the woman from Cantabile with a very small hat at nine, the Reeve's clerk at one, the boy who does not say who he works for at half past three), and a wharf hand lighting the lamps at dusk. They keep to the quay and the piers, never the basin, and go home up the lane.
  - **The Low Rings** (2, by day only): a salvager hooking what the Flume gives back, and a woman who lived on the lane walking its boards. Never the sinkholes or the dry rooms; whoever lives in the loft stays unseen.
  - **The Bell Yard and Ashlane** (7 Hollows): a lad with a plank, a carter leading a horse that is not there, a man greasing a hub, a woman shaking a clean rug, a man driving a hoop, a woman with an empty basket going to market, and a young man knocking twice at the midwife's door. At six they walk out through the archway into the Sunken Court ("the way leaves do", as wave 2), and at five they come back.
  - **The Hollow** (7): a woman carrying water from the well-head in her own pail, a woman airing blankets against the damp, a man with a barrow of dry turves from the tannery side, two children playing Stumps without a sound, a woman keeping the crossing lamps lit, and wave 1's woman from the Hollow, who goes up to the town at ten and comes back at six. All in by half past six: at night the Hollow hums behind its barred doors.
  - **The clearing outside the Hedge** (8): three quarrymen of the day shift and two of the night shift, crossing on the track between the North Gate and the headframe at six in the morning and at half past five; wave 1's farmer's wife, in by the Greenroot road at first light and home again after one; a Hedge-mender pushing wadding into the thorn by the gate; and a woman who goes out to the stone ring at first light.
- **Wave 1's people are the same people.** The farmer's wife and the woman from the Hollow keep wave 1's names (and the farmer's wife her words, `tools/i18n/p60-life.tsv`), so they are not listed again below.
- **Night.** At the dead hour all five places are empty of them.
- **Stand-downs.** The Hollow's people go in at their own doors while the Grafters' wagon is in on Rootday morning (`HOLLOW30.grafting()`), while the Grafters' round is being walked (`js/grafters67.js`), and from the Rite on. From the Rite on the clearing is empty of them (both shifts were "kept on" at the quarry). The engine gained the hook (`opts.down`) and lets a "home" stop name its own door (the gate into town, the headframe, the archway), so one person is never in two places.
- **The Greening** empties the Landing, the Low Rings, the Hollow and the clearing of them. The Bell Yard's Hollows stay.

## Choices marked [PROPOSED]

1. Every person and every line (roles only).
2. The clearing's shifts change at six in the morning and half past five at night, and the gate's hours (open six to seven at night) are wave 1's.
3. The farmer's wife from wave 1 comes and goes by the Greenroot road's gap in the east hedge.
4. The woman going out to the ring follows `js/stones47.js`'s [PROPOSED] custom of the tongue-stones.
5. The Hollow has no night-hummer: its houses hum, every one (`js/hollow30.js`).
6. The book puts the lamplighter on Bell Yard (ch. 15); the game has him in the Sunken Court with his quest (`js/grove.js`), so he is not doubled here.

## Questions for sleeves

1. The thirty-one people and their lines: keep, change or cut any?
2. Tobit's buyers at his porch: is it all right that three of the six he names come by?

## Every line

Source: `tools/i18n/p74-smallplaces.tsv` (80 lines).

| # | English | French |
|---|---|---|
| 1 | A wharf hand | Un docker |
| 2 | "Hoops new, lids nailed, and nobody asks what sloshes. That's the whole trade of the wharf, and I'm the half of it that carries." | « Cercles neufs, couvercles cloués, et personne ne demande ce qui clapote. C'est tout le commerce du quai, et j'en suis la moitié qui porte. » |
| 3 | A wharf hand, under a barrel: "Mind your feet. Mind the edge." | Un docker, sous un tonneau : « Attention à vos pieds. Attention au bord. » |
| 4 | "Every lashing on this wharf is oiled, so nothing creaks. A creak carries over the basin like a shout." | « Chaque amarre de ce quai est huilée, pour que rien ne grince. Un grincement porte sur le bassin comme un cri. » |
| 5 | "Coiling, splicing, oiling. Every rope on this wharf, every day, whether anything moves on the water or not." | « Lover, épisser, huiler. Chaque cordage de ce quai, chaque jour, que quelque chose bouge sur l'eau ou non. » |
| 6 | A wharf hand, low: "Oil it, and it keeps its mouth shut." | Un docker, à voix basse : « Huile-la, et elle tient sa langue. » |
| 7 | An eel-catcher | Une pêcheuse d'anguilles |
| 8 | "Run-eels. You take them alive and quiet, a hand under the belly, and you never let one knock the pail. The Boar pays for a quiet eel." | « Des anguilles de la course. On les prend vivantes et sans bruit, une main sous le ventre, et on ne les laisse jamais cogner le seau. Le Sanglier paie pour une anguille silencieuse. » |
| 9 | An eel-catcher, to the water: "Come on. Quiet, now. Quiet." | Une pêcheuse d'anguilles, à l'eau : « Allez. Doucement, maintenant. Doucement. » |
| 10 | A woman with a very small hat | Une femme au tout petit chapeau |
| 11 | "I write for a broadsheet in Cantabile. I buy his news every week, and then I buy it again, to see whether he has changed it." | « J'écris pour une gazette de Cantabile. Je lui achète ses nouvelles chaque semaine, puis je les lui rachète, pour voir s'il les a changées. » |
| 12 | A woman with a very small hat, writing: "...the same news... to six parties..." | Une femme au tout petit chapeau, qui écrit : « ... les mêmes nouvelles... à six parties... » |
| 13 | The Reeve's clerk | Le clerc du Prévôt |
| 14 | "The Reeve-Moot likes to know what goes through the lock. So does everyone. I am the only buyer on this wharf who writes it in a ledger." | « Le Moot des Prévôts aime savoir ce qui passe par l'écluse. Comme tout le monde. Je suis le seul acheteur de ce quai à l'écrire dans un registre. » |
| 15 | The Reeve's clerk, writing: "Received of the lockkeeper... one item of news..." | Le clerc du Prévôt, qui écrit : « Reçu de l'éclusier... une nouvelle... » |
| 16 | A boy who does not say who he works for | Un garçon qui ne dit pas pour qui il travaille |
| 17 | "Who wants to know?" He looks at you. "No. Who wants to know?" | « Qui veut savoir ? » Il vous regarde. « Non. Qui veut savoir ? » |
| 18 | A boy, to the lockkeeper, very low: "Same as Massday. And the bit you didn't tell her." | Un garçon, à l'éclusier, très bas : « Comme Massedi. Et le morceau que vous ne lui avez pas dit. » |
| 19 | A wharf hand with a taper | Un docker avec un cierge |
| 20 | "Lamps lit before the light goes. Out here past the Hedge you want to see a thing coming, and you want it not to hear you." | « Les lampes allumées avant que le jour tombe. Ici, de l'autre côté de la Haie, on veut voir venir les choses, et on veut qu'elles ne vous entendent pas. » |
| 21 | A wharf hand with a taper: "There. And the next." | Un docker avec un cierge : « Voilà. Et la suivante. » |
| 22 | A salvager | Un récupérateur |
| 23 | "Hooking what floats up. The Low Rings give a little back every time the Flume over-pumps: a spoon, a shoe, once a clock. Mind the brown lumps in the lanes. They aren't lumps." | « J'accroche ce qui remonte. Les Anneaux bas rendent un peu chaque fois que le Flume pompe trop : une cuillère, une chaussure, une fois une horloge. Méfiez-vous des bosses brunes dans les ruelles. Ce ne sont pas des bosses. » |
| 24 | A salvager, low, to the water: "Come on. Come up." | Un récupérateur, à voix basse, à l'eau : « Allez. Remonte. » |
| 25 | A woman on the boards | Une femme sur les planches |
| 26 | "I lived on this lane. I come and look at it. The boards were my husband's doing, the winter it flooded. We went roof to roof for a month before we gave up." | « J'habitais cette ruelle. Je viens la regarder. Les planches, c'est mon mari qui les a posées, l'hiver de l'inondation. Nous sommes allés de toit en toit pendant un mois avant d'abandonner. » |
| 27 | A woman on the boards, to herself: "That was ours. The one with the shutter." | Une femme sur les planches, pour elle-même : « C'était la nôtre. Celle avec le volet. » |
| 28 | A Hollow | Un Creux |
| 29 | A young man carries a plank on his shoulder from the joiner's door to the far end of the Yard, turns, careful of a corner that is not there, and carries it back. | Un jeune homme porte une planche sur l'épaule, de la porte du menuisier jusqu'au bout de la Cour, se retourne en prenant garde à un angle qui n'existe pas, et la rapporte. |
| 30 | A Hollow with a plank: "...mind your backs... mind your backs..." | Un Creux avec une planche : « ... attention derrière... attention derrière... » |
| 31 | A carter walks a horse round the yard by its halter. The halter is in his hand. There is no horse. At the turn he clicks his tongue at it, softly. | Un charretier fait le tour de la cour en menant un cheval par le licol. Le licol est dans sa main. Il n'y a pas de cheval. Au tournant, il lui claque doucement la langue. |
| 32 | A Hollow in the carters' yard: "...walk on... walk on, girl..." | Un Creux dans la cour des charretiers : « ... avance... avance, ma belle... » |
| 33 | A man greasing the hub of a cart with its shafts up, working it in with his thumb. His thumb is clean. There has been no grease for three years. | Un homme graisse le moyeu d'une charrette aux brancards levés, en faisant pénétrer la graisse du pouce. Son pouce est propre. Il n'y a plus de graisse depuis trois ans. |
| 34 | A woman at an open door shaking out a rug, and shaking it, and shaking it. Nothing comes out of it. It has been clean for three years. | Une femme à une porte ouverte secoue un tapis, et le secoue, et le secoue. Rien n'en sort. Il est propre depuis trois ans. |
| 35 | A Hollow with a rug: "...before he's home... before he's home..." | Un Creux avec un tapis : « ... avant qu'il rentre... avant qu'il rentre... » |
| 36 | A man driving a hoop down onto a barrel that is not there: three blows and a turn, three blows and a turn. | Un homme enfonce un cercle sur un tonneau qui n'existe pas : trois coups et un tour, trois coups et un tour. |
| 37 | A woman with an empty basket on her arm walks the length of Ashlane towards the market, turns at the end of the lane, and walks back towards it. | Une femme, un panier vide au bras, remonte Ashlane vers le marché, se retourne au bout de la ruelle, et repart vers lui. |
| 38 | A Hollow with a basket: "...eggs, and the thread, and something for his chest..." | Un Creux avec un panier : « ... des œufs, et le fil, et quelque chose pour sa poitrine... » |
| 39 | A young man at the midwife's door. He knocks twice, and waits, and knocks twice, and waits. Whatever he came to fetch her for was three years ago. | Un jeune homme à la porte de la sage-femme. Il frappe deux fois, et attend, et frappe deux fois, et attend. Ce pour quoi il venait la chercher remonte à trois ans. |
| 40 | A Hollow at the midwife's door, knocking twice: "...she said knock twice... she said wait..." | Un Creux à la porte de la sage-femme, qui frappe deux fois : « ... elle a dit de frapper deux fois... elle a dit d'attendre... » |
| 41 | A woman with a pail | Une femme avec un seau |
| 42 | "Bring your own cup, if you're thirsty. Nobody drinks after anybody down here. It isn't catching. Everybody knows it isn't. We bring our own." | « Apportez votre tasse, si vous avez soif. Ici, personne ne boit après personne. Ce n'est pas contagieux. Tout le monde le sait. On apporte la nôtre. » |
| 43 | A woman at the well-head, low: "Fill it, and the next, and the next." | Une femme à la margelle, à voix basse : « Le remplir, et le suivant, et le suivant. » |
| 44 | A woman airing blankets | Une femme qui aère des couvertures |
| 45 | "Out of the damp, Rooke says. So the blankets come out every morning the sun shows, and every evening they go in as damp as they came out. Water finds the Hollow. It always has." | « À l'abri de l'humidité, dit Rooke. Alors les couvertures sortent chaque matin où le soleil se montre, et chaque soir elles rentrent aussi humides qu'elles sont sorties. L'eau trouve le Creux. Elle l'a toujours trouvé. » |
| 46 | A woman at a line of blankets, softly: "If it holds off. If it only holds off." | Une femme devant une corde de couvertures, doucement : « Pourvu que ça tienne. Pourvu seulement que ça tienne. » |
| 47 | A man with a barrow of turves | Un homme avec une brouette de mottes |
| 48 | "Dry turves for the hearths. A wet house is a growing house. You keep the fire in, and you keep still, and you hum." | « Des mottes sèches pour les âtres. Une maison mouillée est une maison qui pousse. On garde le feu, on se tient tranquille, et on fredonne. » |
| 49 | "Up to the tannery yard for the turves, down the lane with them, a barrow to every door that has nobody left to fetch its own. Most of them, now." | « Je monte à la cour de la tannerie pour les mottes, je redescends la ruelle avec, une brouette à chaque porte où il ne reste personne pour aller chercher la sienne. La plupart, maintenant. » |
| 50 | A man with a barrow, a breath: "Turves. Dry ones. Mind the wheel." | Un homme avec une brouette, dans un souffle : « Des mottes. Des sèches. Attention à la roue. » |
| 51 | A child of the Hollow | Un enfant du Creux |
| 52 | "We're playing Stumps. You stand like a stump and the other one has to make you laugh without a sound. I always win. I never laugh." | « On joue aux Souches. Tu te tiens comme une souche et l'autre doit te faire rire sans un bruit. Je gagne toujours. Je ne ris jamais. » |
| 53 | A child, in the Narrow, fierce: "You moved. You moved. You're it." | Un enfant, dans l'Étroit, farouche : « Tu as bougé. Tu as bougé. C'est toi. » |
| 54 | She sits down in front of you with her hands palm-up on her knees. "That's how you sit, so they don't touch anything. Everybody down here sits like that." | Elle s'assied devant vous, les mains posées paumes en l'air sur les genoux. « C'est comme ça qu'on s'assied, pour qu'elles ne touchent rien. Ici, tout le monde s'assied comme ça. » |
| 55 | A child, laughing without a sound, one hand over her mouth. | Une enfant qui rit sans un bruit, une main sur la bouche. |
| 56 | A woman who keeps the lamps | Une femme qui garde les lampes |
| 57 | "Every lamp in the Hollow burns all day and all night. Up in the town they wait for the lamplighter. Down here we don't wait for anybody." | « Chaque lampe du Creux brûle jour et nuit. En haut, dans la ville, on attend l'allumeur de lampes. Ici, on n'attend personne. » |
| 58 | A woman at a hush-lamp, trimming it: "Burn. Burn steady." | Une femme à une veilleuse, qui en mouche la mèche : « Brûle. Brûle bien droit. » |
| 59 | "Soft food, for him. Bettany has a way with a broth. I go up every day and bring back something he can manage, and every day he manages a little less of it." | « Quelque chose de mou, pour lui. Bettany a le tour pour les bouillons. Je monte tous les jours et je rapporte quelque chose qu'il arrive à manger, et chaque jour il en mange un peu moins. » |
| 60 | A woman from the Hollow, under her breath: "Up and back. Up and back." | Une femme du Creux, à mi-voix : « Monter et revenir. Monter et revenir. » |
| 61 | A quarryman, day shift | Un carrier, équipe de jour |
| 62 | "Day shift. Down at six, up at the Listening Hour, and nobody says a word on the track. Hounds." | « Équipe de jour. En bas à six heures, en haut à l'Heure d'écoute, et personne ne dit un mot sur le chemin. Les chiens. » |
| 63 | "The pumps, mostly. Twelve men on them and the bore in your teeth the whole nine hours. You get home and your supper tastes of glass." | « Les pompes, surtout. Douze hommes dessus, et le forage dans les dents pendant neuf heures. On rentre et le souper a le goût du verre. » |
| 64 | A quarryman, low: "Nine hours on the pumps." | Un carrier, à voix basse : « Neuf heures aux pompes. » |
| 65 | He looks at the Legion line at the headframe, then at you, and shakes his head very slightly, which is all the conversation the track allows. | Il regarde la file de la Légion au chevalement, puis vous, et secoue très légèrement la tête, ce qui est toute la conversation que permet le chemin. |
| 66 | A quarryman, a breath: "Feel it? Deeper than yesterday." | Un carrier, dans un souffle : « Vous le sentez ? Plus profond qu'hier. » |
| 67 | "Don't look at the glass man's hut. Nobody does. The hounds won't go near him. The Grafters say it's the glass." | « Ne regardez pas la cabane de l'homme de verre. Personne ne la regarde. Les chiens ne s'approchent pas de lui. Les Greffeurs disent que c'est le verre. » |
| 68 | A quarryman, very low: "Walk. Don't talk. Walk." | Un carrier, très bas : « Marchez. Ne parlez pas. Marchez. » |
| 69 | A quarryman, night shift | Un carrier, équipe de nuit |
| 70 | "Night shift. The quarry's lit all night, green-gold, so it's never dark down there. You come up in the morning and the sun looks wrong." | « Équipe de nuit. La carrière est éclairée toute la nuit, vert et or, alors il ne fait jamais noir en bas. On remonte le matin et le soleil a l'air faux. » |
| 71 | A quarryman of the night shift, low: "There's the day lot. Poor sods." | Un carrier de l'équipe de nuit, à voix basse : « Voilà ceux de jour. Pauvres bougres. » |
| 72 | "Out before the gate's barred, in after it opens. Twelve hours past the Hedge, and every one of them listening." | « Dehors avant qu'on barre la porte, dedans après qu'on l'ouvre. Douze heures de l'autre côté de la Haie, et toutes à écouter. » |
| 73 | A quarryman of the night shift: "Gate's open. In we go." | Un carrier de l'équipe de nuit : « La porte est ouverte. On rentre. » |
| 74 | A Hedge-mender | Un ravaudeur de la Haie |
| 75 | "Wadding. Wool and moss, packed into the thorn so it eats the sound. A wet spring rots it. You find the thin places before something else does." | « Du bourrage. De la laine et de la mousse, tassées dans l'épine pour qu'elle mange le son. Un printemps humide le pourrit. Il faut trouver les endroits minces avant que quelque chose d'autre les trouve. » |
| 76 | "I go along the outside of the Hedge with a sack and a stick and push it in where it's gone thin. Inside, they never see it done. That's the idea." | « Je longe l'extérieur de la Haie avec un sac et un bâton, et je bourre là où elle s'est amincie. De l'intérieur, on ne le voit jamais faire. C'est le principe. » |
| 77 | A Hedge-mender, pushing wadding into the thorn: "There. Eat that." | Un ravaudeur de la Haie, qui bourre l'épine : « Voilà. Mange ça. » |
| 78 | A woman going out to the ring | Une femme qui va au cercle de pierres |
| 79 | "My mother's stone is out at the ring, at the foot of the Root. I go out every morning the gate is open and see that it's still there. It always is." | « La pierre de ma mère est là-bas, au cercle, au pied de la Racine. J'y vais chaque matin où la porte est ouverte, pour voir si elle y est toujours. Elle y est toujours. » |
| 80 | A woman on the path to the ring, softly: "Still there. Still there." | Une femme sur le chemin du cercle, doucement : « Toujours là. Toujours là. » |
