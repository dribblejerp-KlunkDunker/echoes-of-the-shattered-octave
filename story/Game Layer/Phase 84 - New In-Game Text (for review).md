# Phase 84: New In-Game Text (for review)

Mounts and fast travel, built from the design the owner approved on 14 Nov ("I approve of phase 84"); the design is in `story/Game Layer/Phase 84 - Mounts and fast travel (design, for ruling).md`. Code: `js/mounts84.js`. Test: `test/mounts84.test.js` (22 checks). French: `tools/i18n/p84-mounts.tsv`.

Every line below is new and **[PROPOSED]**, except the three names ruled in the design's question 7 ("the roan mare", "the dun", "the grey").

## What was built

- **The pony, ridden.** Hire one at any of three stables: the North Gate (Oakhaven), the Bellwether's yard (Wethercombe) and the drovers' pen on the Long Common (the Greenroot road's far end). Same terms everywhere (25 sovereigns a day, 10 back if returned early). Stand by her and press **X** to get up or down. Riding, you go 1.75 times as fast as walking and sit a little higher. You can fight from the saddle with a sword or staff, but not with a bow. The third hard blow in a fight throws you off.
- **Nine ponies, three to a stable** (added on the owner's word the same night). Each wears a real horse's coat, painted in code with fixed patterns: the roan mare, the bay mare and the black mare at the North Gate; the dun, the chestnut with the blaze and the palomino at the Bellwether; the grey (dapple grey), the skewbald and the spotted mare (leopard-spotted) at the drovers' pen. Choose one by her portrait or with the left and right arrows. The one you hire is the one you see waiting, the one named in every line, and the one whose neck and ears you look down at while riding. On the travel picture the little rider's pony is her colour.
- **Where she will not go:** onto planks, down the Pound Stair, into the Deep Grove, or indoors. She stops there, you get down, and she waits.
- **Left alone,** she waits six hours where you got off, then walks home to her own stable. If you leave her on dangerous ground at night, hounds frighten her home, and that stable's ostler wants 5 sovereigns for the fright. Nothing kills her. When the day's hire is up, you get down and she turns for home.
- **Milestones** stand beside every finger-post: a short dressed stone with the stretch's name cut in it. Walking past one puts it on your map. The world map sends you to the milestones you have touched (and to places as before), and the journey goes **along the roads**, gate to gate, never across country. It takes about half as long riding.
- **Night halts.** A journey that would run past dusk stops the night about halfway: at the Three Pines on the drove road, or at the halt on whatever stretch the middle falls on. You can choose to press on in the dark.
- **Ambushes on the stretch where they happen.** Each stretch rolls for itself, by its own danger, hour and weather. If one comes up, you arrive on that stretch, mid-road, with what was waiting.
- **The punt** is not built yet. It comes with the Sunk Lanes in Phase 85, as ruled.

## Where it differs from the design (readings for the owner)

1. **The key is X, not M.** M already opens the map. *Recommend: keep X.*
2. **No controller binding yet** for getting up and down. On a pad there is no button for it yet, so pad players need the keyboard X. A pad binding can come with the next controls pass. *Recommend: add it in Phase 86's polish.*
3. **She is seen side-on.** She is one picture that always faces you, not four views with walking and trotting. *Recommend: four views later, if you want them.*
4. **Hounds charging her** is the night fright only (she bolts home). There is no hound on screen chasing her. *Recommend: keep.*
5. **Coat names and the pattern list** (which coats, which stable) are **[PROPOSED]**: change any.
6. **The map still lists every place you have found,** as before, with the touched milestones added. It does not narrow to milestones only, and there are no extra milestones in the towns, since each town is already on the list. Every journey now goes along the roads. *Recommend: keep; it takes nothing away from an old save.*
7. **She stands still when left.** She does not graze or swish her tail yet. *Recommend: add it with the four views, if you want those.*

## The lines

| English | French |
|---|---|
| the roan mare | la jument rouanne |
| the dun | l'isabelle |
| the grey | la grise |
| Which of them? | Laquelle ? |
| Left and right arrows choose between them. | Les flèches gauche et droite permettent de choisir. |
| Hired: {0} | Louée : {0} |
| You hire {0} for {1} sovereigns. The ostler ties a green ribbon to the bridle: she is yours until this time tomorrow. | Vous louez {0} pour {1} souverains. Le palefrenier noue un ruban vert à la bride : elle est à vous jusqu'à demain à la même heure. |
| You hand {0} back. The ostler counts {1} sovereigns into your palm and hangs the green ribbon on its nail. | Vous rendez {0}. Le palefrenier vous compte {1} souverains dans la paume et raccroche le ruban vert à son clou. |
| {0}, saddled and waiting. X to get up. | {0}, sellée, qui attend. X pour monter. |
| You get up on {0}. | Vous montez sur {0}. |
| You get down. {0} waits where you leave her. | Vous mettez pied à terre. {0} attend là où vous la laissez. |
| She will not go onto the planks. Get down and go on foot; she will wait. | Elle ne veut pas aller sur les planches. Descendez et continuez à pied ; elle attendra. |
| She will not go down the Pound Stair. You leave her at the top, and she waits. | Elle ne veut pas descendre l'Escalier des Biefs. Vous la laissez en haut, et elle attend. |
| She will not go in among those trees. You leave her at the edge, and she waits. | Elle ne veut pas entrer sous ces arbres. Vous la laissez à la lisière, et elle attend. |
| You leave {0} at the door. She waits. | Vous laissez {0} à la porte. Elle attend. |
| You cannot shoot from the saddle. | Vous ne pouvez pas tirer depuis la selle. |
| {0} shies at the blow and you come off. | {0} fait un écart sous le coup et vous tombez. |
| She is too far off. Go to her first. | Elle est trop loin. Allez d'abord jusqu'à elle. |
| {0} has gone home to her stable. | {0} est rentrée à son écurie. |
| The day's hire is up. You get down, and {0} turns for home. | La journée de location est finie. Vous descendez, et {0} reprend le chemin de l'écurie. |
| Hounds came for {0} in the night. She bolted home, and the ostler wants 5 sovereigns for the fright. | Les chiens sont venus pour {0} dans la nuit. Elle s'est enfuie jusqu'à l'écurie, et le palefrenier veut 5 souverains pour la frayeur. |
| You pay the ostler 5 sovereigns for the fright. | Vous payez 5 souverains au palefrenier pour la frayeur. |
| The Bellwether's yard | La cour du Bellwether |
| Three stalls behind the Bellwether. The dun has been down the drove road more times than you have. Absalom Rudd's girl does the hiring, and asks nothing. | Trois stalles derrière le Bellwether. L'isabelle a descendu le chemin des troupeaux plus souvent que vous. C'est la fille d'Absalom Rudd qui s'occupe de la location, et elle ne pose pas de questions. |
| The drovers' pen on the Long Common | L'enclos des bouviers sur la Longue Commune |
| A hurdle pen by the road, a lean-to for the tack, and three ponies with burrs in their manes. The man who keeps them lives in the lean-to. | Un enclos de claies au bord de la route, un appentis pour le harnachement, et trois poneys avec des bardanes dans la crinière. L'homme qui les garde vit dans l'appentis. |
| A stable: a pony to hire for a day, or to give back | Une écurie : un poney à louer pour la journée, ou à rendre |
| A milestone. Cut in it: {0}. | Une borne. Gravé dessus : {0}. |
| You lay a hand on the milestone. {0} is on your map now. | Vous posez la main sur la borne. {0} figure maintenant sur votre carte. |
| {0}, towards {1} | {0}, vers {1} |
| By the roads, through {0}. | Par les routes, en passant par {0}. |
| The road runs past dusk. | La route court au-delà du crépuscule. |
| Stop the night at {0} | Faire halte pour la nuit à {0} |
| Press on in the dark | Continuer dans le noir |
| You stop the night at {0}. {1} is still ahead. | Vous faites halte pour la nuit à {0}. {1} est encore devant vous. |
| On {0}, mid-road, something has been waiting. | Sur {0}, au milieu de la route, quelque chose attendait. |
| the halt | la halte |
| the Three Pines | les Trois Pins |
| A red roan: chestnut flecked all over with white, darker on the head and legs. | Une rouanne : alezane piquetée de blanc partout, plus sombre à la tête et aux jambes. |
| the bay mare | la jument baie |
| A bay: a red-brown coat with a black mane and tail and black legs, a white star on her brow. | Une baie : robe brun-rouge, crinière, queue et jambes noires, une étoile blanche au front. |
| the black mare | la jument noire |
| Black from ears to hooves, with a star and one white hind sock. | Noire des oreilles aux sabots, avec une étoile et une balzane blanche à un postérieur. |
| A dun: sandy, with a dark stripe down her back, dark points and faint bars on her legs. | Une isabelle : couleur sable, une raie de mulet sombre sur le dos, les extrémités sombres et de légères zébrures aux jambes. |
| the chestnut with the blaze | l'alezane à la liste |
| A chestnut: copper all over, mane and tail too, with a white blaze and two white socks. | Une alezane : cuivrée de partout, crinière et queue comprises, avec une liste blanche et deux balzanes. |
| the palomino | la jument palomino |
| A palomino: a gold coat with a cream mane and tail, a blaze down her face. | Une palomino : robe dorée, crinière et queue crème, une liste sur le chanfrein. |
| A dapple grey: iron-grey rings on a pale coat, a white mane, dark knees. | Une gris pommelé : des anneaux gris fer sur une robe pâle, une crinière blanche, les genoux sombres. |
| the skewbald | la jument pie |
| A skewbald: big white patches on a brown coat, white legs, a white face. | Une pie : de grandes taches blanches sur une robe brune, les jambes blanches, la tête blanche. |
| the spotted mare | la jument léopard |
| Leopard-spotted: a white coat scattered with dark spots, a thin dark mane and tail. | Tachetée léopard : une robe blanche semée de taches sombres, une crinière et une queue sombres et clairsemées. |
