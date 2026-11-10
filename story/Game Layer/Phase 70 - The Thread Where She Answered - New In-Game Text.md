# Phase 70 — Echo I, "The Thread Where She Answered", played as an extra (Book One, Echo I)

**Built 10 November 2026** (`js/thread70.js`; test `test/thread70.test.js`; ROADMAP R9 #24; the overnight plan's queue item 5). Every new line of in-game text, in English with its French. Status: **canon (book)** for every line of the scene: Echo I of the full manuscript (from "## ECHO I" to "— the Tide-Weaver"), quoted word for word in the cards and messages, cut only at paragraph breaks or, for the messages that walk the player through one long sentence, at its commas; **[PROPOSED]** for the play around them and for the buttons, hints, labels and HUD words (marked P in the table, and listed in `THREAD70.PROPOSED`; the test checks that every other line is in the manuscript).

**How it is reached.** Title screen, Extras, "The Thread Where She Answered". It runs in the extra's own session (EXTRAS17), so the Book One save is put aside untouched and no Book One flag is written. Its card and banner say "Echo I of Book One" (the `tag` option bell69 added to `js/extras17.js`; `extras17.js` itself is not changed here). Its unlock is the extras' own (Book One truly finished).

**How it is framed.** The book frames Echo I as a thread the Tide-Weaver shows the reader: "I am going to show you a thread that was not taken." So the whole extra is an Echo and is drawn grey, the way the game shows its Echoes: the world through a frame post-hook (a grey with the shadows lifted a little, gamma 0.8, so the dead hour reads), and the HUD with a grayscale filter for the frames this extra draws. Both end with the extra itself; RITE43.grey, a filter on the canvas, would outlive a "Leave the extra" from the menu, so it is used only for the "Another thread" cards. The Weaver's words are the cards.

**[PROPOSED] choices, for the owner:**
- **The player is Lyra Ashgrove, in that thread.** The book is told by the Weaver, who only watches; the one way to take part without changing anything is to be her. She goes out at the dead hour, sits on the stone, says no, goes through the drain. After the drain the player keeps the body: you walk what comes back up Cooper's Row in her boots, let it into her house and lie it down in her bed, and see Kaelen to the door. Nothing the player does changes what happens.
- **The noes.** The book gives the thing's first asking ("Come through ... I've been on my own two years.") and says "She says no eleven times over the next three hours". The game asks again in its own first words, "Come through." (recorded), and the player answers each time (E). The count is on the HUD ("NO · n"). The first no is the card's only choice.
- **Another thread.** Getting up from the stone while it asks, or going back up the Row before the drain, is a thread the Weaver is not showing: "Another thread", grey (RITE43.echo), and you are back where she is. Nothing can fail.
- **The drain.** Eleven seconds on her hands and knees: the view sinks (the eye from 0.88 to 0.33) and goes dark. Then the Weaver's card ("I am not going to describe what is waiting"), and four minutes of black, shortened to six seconds with "FOUR MINUTES" on the HUD.
- **The order of the forty-second night.** The book has her go out at the dead hour of the forty-second night, and Kaelen come to her door on the forty-second night with the thing already wearing her face; it does not say which came first in the hours, and "in the morning it gets up and goes to look at Pim Carder's hands" comes in between in the telling. The game plays the Weaver's telling in his order (the stone, the drain, her bed, "And it is very good.", then "Here is the rest of it, quickly" and Kaelen at her door) and puts no clock on that night. The calendar is the game's: the dead hour after Rootday (game day 2), the forty-second night as `js/lyra51.js` counts it, which the HUD names Hearthday's dead hour.
- **Kaelen at her door.** Played in three beats, in the book's sentence: at the door (the card, "Let him in."), at her table (he tells it everything), at the door again (he hums his note, and it does not recognize it). His hum is the low note bell69 gives the engineer (87 Hz); no words.
- **The rest** (Hearthday, the Hold, the Root lets go, the Greening of the whole Reach, Kaelen, Vane, Sable, the thing in the Greening, the margin, "One more thing", "— the Tide-Weaver") is the Weaver's cards, in his words, with no play.
- **The book's own counts** are kept as they are, though they do not add up: "in two hundred and six of those threads she stays on her side of the thorn. In a hundred and ninety-five she does not" makes 401, and the Weaver has watched it "four hundred and eleven times". Not changed; for the owner.
- **The places.** Two small maps built only while the extra runs: `t70_house`, Lyra's house as `js/maps.js` has it (the hearth, the bed, the shelf, the table, the lamp, the door to the street); `t70_row`, Cooper's Row from her door down to the old cooperage, and behind it the foot of the Hedge with the flat stone (lyra51's sprite) and "the cooperage drain, where the water goes under", with four lamps on the Row. The plan and distances are [PROPOSED].
- **Voices.** The Tide-Weaver is cast `weaver` (as in herald66 and rope45; note the cast entry in `voices/script.json` still describes the Phantom Weaver). The thing behind the thorn is `wearer` in Tobin's voice. Lyra is `lyra`. 19 new lines; the Weaver's two from herald66 ("I am going to show you a thread that was not taken." and "This did not happen. It also did not unhappen; nothing does.") are shared.
- **The Book One modules that stand down in extras** (cargo56, lyra51, grafters67, boar48, meadow49, days35, church55, tamsin52, audit54, manifest53) all check `EXTRAS17.inExtra()` first, which is this extra while it runs; their map-id fallbacks (`cantabile|p17|b69_`) are not widened, since they only matter if EXTRAS17 is missing.

## The lines

| # | English | French | |
|---|---|---|---|
| 1 | The Thread Where She Answered | Le Fil où elle a répondu |  |
| 2 | Echo I of Book One | Écho I du Livre Un | P |
| 3 | The Tide-Weaver shows you a thread that was not taken: the forty-second night, when Lyra Ashgrove went out to the stone behind the cooperage after all. Echo I of Book One, in its own words, and grey, as an Echo is. | Le Tisseur des Marées vous montre un fil qui n'a pas été pris : la quarante-deuxième nuit, où Lyra Ashgrove est sortie malgré tout jusqu'à la pierre derrière la tonnellerie. L'Écho I du Livre Un, dans ses propres mots, et en gris, comme l'est un Écho. | P |
| 4 | Lyra Ashgrove's house | La maison de Lyra Ashgrove |  |
| 5 | Cooper's Row | La rue des Tonneliers |  |
| 6 | Echo I: the thread where she answered. The Tide-Weaver is showing it to me. | Écho I : le fil où elle a répondu. Le Tisseur des Marées me le montre. | P |
| 7 | Echo I · The Thread Where She Answered | Écho I · Le Fil où elle a répondu | P |
| 8 | <i>A loom has no opinion about the cloth. That is the first thing they teach you at the Sandglass, and it is a lie told to children, and they know it is a lie, and they teach it anyway, because the alternative is to tell a nineteen-year-old that he is going to spend his life watching.</i><br>— Ilias Marren, exile of the Loom-Wardens | <i>Un métier à tisser n'a pas d'opinion sur l'étoffe. C'est la première chose qu'on vous apprend au Sablier, et c'est un mensonge qu'on fait aux enfants, et ils savent que c'est un mensonge, et ils l'enseignent quand même, parce que l'autre choix serait de dire à un garçon de dix-neuf ans qu'il va passer sa vie à regarder.</i><br>— Ilias Marren, exilé des Gardiens du Métier |  |
| 9 | You will want to know who is talking. | Vous allez vouloir savoir qui parle. |  |
| 10 | My name is Ilias Marren and I was a Warden of the Loom at the Sandglass Bazaar until they put me out of it, and I am not in this story yet. I will come into it in the second book, in a glass city that is living the same twenty-four seconds over and over, and you will like me, I think, for a while. | Je m'appelle Ilias Marren, et j'étais Gardien du Métier au Bazar du Sablier jusqu'à ce qu'on m'en chasse, et je ne suis pas encore dans cette histoire. J'y entrerai dans le deuxième livre, dans une ville de verre qui vit les mêmes vingt-quatre secondes encore et encore, et vous m'aimerez bien, je crois, pendant un temps. |  |
| 11 | Listen. | Écoutez. | P |
| 12 | A thread that was not taken | Un fil qui n'a pas été pris | P |
| 13 | I am going to show you a thread that was not taken. | Je vais vous montrer un fil qui n'a pas été pris. |  |
| 14 | This did not happen | Cela n'est pas arrivé |  |
| 15 | Understand what that means before you go any further. | Comprenez bien ce que cela veut dire avant d'aller plus loin. |  |
| 16 | This did not happen. It also did not <i>un</i>happen; nothing does. | Cela n'est pas arrivé. Cela n'est pas non plus <i>dés</i>arrivé ; rien ne l'est. |  |
| 17 | Every road not taken is still standing out there in the dark with the lamps lit and people walking up and down it, and the only difference between that road and this one is that you are on this one, and the thing that decides which road you are on is almost always small, and almost always a Hearthday. | Chaque route qu'on n'a pas prise est toujours là, dehors, dans le noir, les lampes allumées et des gens qui la montent et la descendent, et la seule différence entre cette route-là et celle-ci, c'est que vous êtes sur celle-ci, et ce qui décide de la route où vous êtes est presque toujours petit, et presque toujours un Âtredi. |  |
| 18 | One night | Une nuit | P |
| 19 | In the thread you have just read, Lyra Ashgrove went out to the cooperage wall on the forty-first night, and sat on her stone, and told a monster about a child's hands. | Dans le fil que vous venez de lire, Lyra Ashgrove est sortie jusqu'au mur de la tonnellerie la quarante et unième nuit, s'est assise sur sa pierre, et a parlé à un monstre des mains d'un enfant. |  |
| 20 | On the forty-second night — the night Kaelen Vance came to her door and hummed his note in her kitchen and she recognized it — she did not go. | La quarante-deuxième nuit — la nuit où Kaelen Vance est venu à sa porte et a fredonné sa note dans sa cuisine, et où elle l'a reconnue — elle n'y est pas allée. |  |
| 21 | That is the whole of the difference. One night. | C'est là toute la différence. Une nuit. |  |
| 22 | Here is the thread where she went. | Voici le fil où elle y est allée. |  |
| 23 | Go out. | Sortir. | P |
| 24 | Down Cooper's Row to the old cooperage, and the flat stone behind it at the foot of the Hedge. | Descendez la rue des Tonneliers jusqu'à la vieille tonnellerie, et la pierre plate derrière elle, au pied de la Haie. | P |
| 25 | She goes out at the dead hour, because she always does, | Elle sort à l'heure morte, parce qu'elle le fait toujours, |  |
| 26 | and she sits down with her back to the thorn, | et elle s'assoit, le dos contre l'épine, |  |
| 27 | and it says <i>there's my lark</i>, | et ça dit <i>voilà mon alouette</i>, |  |
| 28 | and she says <i>hello, Da</i>, | et elle dit <i>bonsoir, Papa</i>, |  |
| 29 | and it asks about her day. | et ça lui demande comment s'est passée sa journée. |  |
| 30 | One night further along | Une nuit plus loin | P |
| 31 | And on this night — because the difference between the threads is one night, and this thread is one night further along than the one you know — it asks her something it has not asked before. | Et cette nuit-là — parce que la différence entre les fils est d'une nuit, et que ce fil-ci a une nuit d'avance sur celui que vous connaissez — ça lui demande une chose que ça ne lui a jamais demandée. |  |
| 32 | <i>Come through,</i> it says. <i>Lark. There's a gap down by the cooperage drain, where the water goes under. It's not even a squeeze. Come through and sit with me a bit. It's cold out here and I've been on my own two years.</i> | <i>Passe de ce côté,</i> dit-ça. <i>Alouette. Il y a un trou en bas, près de la rigole de la tonnellerie, là où l'eau passe dessous. Ce n'est même pas étroit. Passe et viens t'asseoir un peu avec moi. Il fait froid, ici, et ça fait deux ans que je suis tout seul.</i> |  |
| 33 | And she says no. | Et elle dit non. |  |
| 34 | No. | Non. | P |
| 35 | <i>Come through.</i> | <i>Passe de ce côté.</i> | P |
| 36 | It asks again. Answer it (E), and stay on the stone with your back to the thorn. | Ça redemande. Répondez-lui (E), et restez sur la pierre, le dos contre l'épine. | P |
| 37 | NO | NON | P |
| 38 | Eleven times | Onze fois | P |
| 39 | She says no eleven times over the next three hours, which I want you to know, because it matters later and nobody in that thread ever finds out. She is not weak and she is not a fool; she is a thirty-three-year-old woman who has been doing triage for two years with nothing in the account, and the thing on the other side of the thorn has her father's voice and has been practising for seven hundred and thirty nights. | Elle dit non onze fois au cours des trois heures qui suivent, et je veux que vous le sachiez, parce que cela compte plus tard et que personne, dans ce fil, ne l'apprend jamais. Elle n'est pas faible et elle n'est pas sotte ; c'est une femme de trente-trois ans qui fait le tri des malades depuis deux ans sans plus rien sur le compte, et la chose de l'autre côté de l'épine a la voix de son père et s'exerce depuis sept cent trente nuits. |  |
| 40 | The twelfth time | La douzième fois | P |
| 41 | On the twelfth time, it says: <i>All right, lark. Then I'll come through to you.</i> | À la douzième fois, ça dit : <i>D'accord, alouette. Alors c'est moi qui viens de ton côté.</i> |  |
| 42 | And she hears the thorn move. | Et elle entend l'épine bouger. |  |
| 43 | And she is so frightened — not of dying; of <i>that</i>, of the shape of it coming through the hedge into Oakhaven where the Carders are, where Bettany is, where ninety-one children are asleep — that she stands up and says the only thing she can think of that will keep it out there. | Et elle a si peur — pas de mourir ; de <i>ça</i>, de la forme de ça qui passe la haie et entre dans Oakhaven, là où sont les Cardeur, là où est Bettany, là où dorment quatre-vingt-onze enfants — qu'elle se lève et dit la seule chose qui lui vienne et qui puisse le garder dehors. |  |
| 44 | <i>Don't. I'm coming.</i> | <i>Non. J'arrive.</i> |  |
| 45 | Four hundred and eleven times | Quatre cent onze fois |  |
| 46 | I have watched that moment four hundred and eleven times. | J'ai regardé ce moment-là quatre cent onze fois. |  |
| 47 | I want to be precise with you, because precision is the only decency available to me: in two hundred and six of those threads she stays on her side of the thorn. In a hundred and ninety-five she does not. The variable is not courage. It is whether she slept the night before, and whether the Carder boy's roots came back that afternoon, and whether old Tam was humming at the Weavers' Cross as she passed, which is a thing that depends on the state of his knees, which depends on the weather in a week that is now three years gone. | Je veux être précis avec vous, parce que la précision est la seule décence qui me soit permise : dans deux cent six de ces fils, elle reste de son côté de l'épine. Dans cent quatre-vingt-quinze, non. Ce qui change n'est pas le courage. C'est de savoir si elle a dormi la nuit d'avant, et si les racines du petit Cardeur sont revenues cet après-midi-là, et si le vieux Tam fredonnait à la Croix des Tisserands quand elle est passée, chose qui dépend de l'état de ses genoux, qui dépend du temps qu'il a fait pendant une semaine vieille maintenant de trois ans. |  |
| 48 | That is what a thread is. You are a soup, and a thing in the dark is patient, and some nights you have had enough sleep. | Voilà ce qu'est un fil. Vous êtes une soupe, et une chose dans le noir est patiente, et certaines nuits vous avez assez dormi. |  |
| 49 | Go on. | Continuer. | P |
| 50 | The cooperage drain, where the water goes under the Hedge, along the thorn from the stone. | La rigole de la tonnellerie, là où l'eau passe sous la Haie, le long de l'épine depuis la pierre. | P |
| 51 | She goes through the drain on her hands and knees. | Elle passe par la rigole à quatre pattes. |  |
| 52 | Eleven seconds | Onze secondes | P |
| 53 | It takes eleven seconds. I am not going to describe what is waiting, because you have met it now, and because there is a difference between dread and cruelty and I am trying to stay on the right side of it. | Cela prend onze secondes. Je ne vais pas décrire ce qui attend, parce que vous l'avez rencontré, maintenant, et parce qu'il y a une différence entre l'effroi et la cruauté et que j'essaie de rester du bon côté. |  |
| 54 | I will tell you the part that matters. | Je vais vous dire la partie qui compte. |  |
| 55 | FOUR MINUTES | QUATRE MINUTES | P |
| 56 | What comes back | Ce qui revient | P |
| 57 | It does not kill her. It does not, in any sense you would recognize, <i>hurt</i> her. It takes four minutes, and what comes back through the drain into Oakhaven at the end of those four minutes walks up Cooper's Row in Lyra Ashgrove's boots and lets itself into Lyra Ashgrove's house and lies down in her bed, and in the morning it gets up and goes to look at Pim Carder's hands. | Ça ne la tue pas. Ça ne lui fait pas, en aucun sens que vous reconnaîtriez, de <i>mal</i>. Cela prend quatre minutes, et ce qui revient par la rigole dans Oakhaven au bout de ces quatre minutes remonte la rue des Tonneliers dans les bottes de Lyra Ashgrove, et entre dans la maison de Lyra Ashgrove, et se couche dans son lit, et le matin ça se lève et va regarder les mains de Pim Cardeur. |  |
| 58 | Walk up Cooper's Row. | Remonter la rue des Tonneliers. | P |
| 59 | walks up Cooper's Row in Lyra Ashgrove's boots | remonte la rue des Tonneliers dans les bottes de Lyra Ashgrove |  |
| 60 | and lets itself into Lyra Ashgrove's house | et entre dans la maison de Lyra Ashgrove |  |
| 61 | and lies down in her bed, | et se couche dans son lit, |  |
| 62 | Her house is at the top of the row, and her bed is inside it. | Sa maison est en haut de la rue, et son lit est dedans. | P |
| 63 | And it is very good | Et c'est très réussi |  |
| 64 | And it is very good. | Et c'est très réussi. |  |
| 65 | That is the thing nobody in that thread ever works out, and I have watched them not work it out four hundred and eleven times. It has her whole voice. It has two years of her nights — every patient, every fear, every small stupid thing she told it on a stone behind a cooperage. It knows the falling fifth. It knows that Nell Carder takes two sugars and that Bettany's hip hurts in the wet and that the Tanner cousins are not speaking. It is kind, because kindness is a sound and it has heard a great deal of it. | C'est la chose que personne, dans ce fil, ne comprend jamais, et je les ai regardés ne pas la comprendre quatre cent onze fois. Ça a sa voix entière. Ça a deux ans de ses nuits — chaque malade, chaque peur, chaque petite chose idiote qu'elle lui a dite sur une pierre derrière une tonnellerie. Ça connaît la quinte descendante. Ça sait que Nell Cardeur prend deux sucres, que la hanche de Bettany lui fait mal par temps humide et que les cousins Tanneur ne se parlent plus. Ça est gentil, parce que la gentillesse est un son et que ça en a beaucoup entendu. |  |
| 66 | It cannot sing the Root note into a clay jar and make a baby breathe. But in a town where the Cantor has been running on empty for two years, nobody notices for nine days that the mending has stopped working, and by then it does not matter. | Ça ne peut pas chanter la Note-racine dans une jarre d'argile et faire respirer un bébé. Mais dans une ville où la Chantre tourne à vide depuis deux ans, personne ne remarque pendant neuf jours que les soins ne marchent plus, et après, cela n'a plus d'importance. |  |
| 67 | The forty-second night | La quarante-deuxième nuit | P |
| 68 | Here is the rest of it, quickly, because you have a book to finish. | Voici le reste, vite, parce que vous avez un livre à finir. |  |
| 69 | Kaelen Vance comes to her door on the forty-second night with a bore plan under his arm and a Stage Nine to tell her about, and the thing wearing her face lets him in, | Kaelen Vance vient à sa porte la quarante-deuxième nuit avec un plan de forage sous le bras et un Stade neuf à lui raconter, et la chose qui porte son visage le fait entrer, |  |
| 70 | Let him in. | Le faire entrer. | P |
| 71 | and he sits at her table and tells it everything — the Sequence, the coil, the phase port, the eight bolts, the forty seconds — and it listens with her eyes, and asks the questions she would have asked, | et il s'assoit à sa table et lui dit tout — la Séquence, la bobine, le port de phase, les huit boulons, les quarante secondes — et ça écoute avec ses yeux à elle, et pose les questions qu'elle aurait posées, |  |
| 72 | See him to the door. | Raccompagnez-le à la porte. | P |
| 73 | and at the door he hums his note and it does not recognize it, because there is nothing in there that was ever eight years old on a stile. | et à la porte il fredonne sa note et ça ne la reconnaît pas, parce qu'il n'y a rien là-dedans qui ait jamais eu huit ans sur un échalier. |  |
| 74 | He goes away believing he has a plan and an ally. | Il s'en va en croyant avoir un plan et une alliée. |  |
| 75 | Hearthday | Âtredi |  |
| 76 | On Hearthday they take her down four hundred feet in a white shift and put a brass collar round her throat, and Kaelen Vance kneels in front of her and threads a wire through a fold of skin instead of the fold of her voice, and his hands do not shake at all, because the woman on the stool is perfectly calm and that steadies him. | À l'Âtredi on la descend à quatre cents pieds en chemise blanche et on lui met un collier de laiton autour du cou, et Kaelen Vance s'agenouille devant elle et passe un fil dans un pli de peau au lieu du pli de sa voix, et ses mains ne tremblent pas du tout, parce que la femme sur le tabouret est parfaitement calme et que cela le raffermit. |  |
| 77 | Then the Hold begins, and the thing in the stone draws in and listens. | Puis la Tenue commence, et la chose dans la pierre se resserre et écoute. |  |
| 78 | It holds the note | Ça tient la note | P |
| 79 | And the thing on the stool, which eats voices and has never in its existence had the slightest reason to care what a dying god does with its law, holds the note. | Et la chose sur le tabouret, qui mange les voix et n'a jamais eu de toute son existence la moindre raison de se soucier de ce qu'un dieu mourant fait de sa loi, tient la note. |  |
| 80 | It holds it beautifully. It holds it for four hours and nineteen minutes with blood on its collar, and nobody shouts <i>sing it down</i>, because the engineer at the collar walk is waiting for a signal from an ally who is not there, and when he finally understands — at four hours and eleven minutes, by her face, by something behind her eyes that is not fear — he goes for the drum anyway, and gets five bolts out of eight before Factor Vosk's Legionnaires put him on the boards. | Ça la tient magnifiquement. Ça la tient quatre heures et dix-neuf minutes avec du sang sur son collier, et personne ne crie <i>chante-la plus bas</i>, parce que l'ingénieur sur la passerelle du collier attend le signal d'une alliée qui n'est pas là, et quand il comprend enfin — à quatre heures et onze minutes, à son visage, à quelque chose derrière ses yeux qui n'est pas de la peur — il va au tambour quand même, et retire cinq boulons sur huit avant que les Légionnaires du Facteur Vosk ne le plaquent sur les planches. |  |
| 81 | It lets go | Ça lâche |  |
| 82 | The Root is relieved. | La Racine est soulagée. |  |
| 83 | It has been singing a five-note lullaby for ten thousand years and a voice outside it holds its note steady for four hours and nineteen minutes, and it believes — the way the Light believed — that the thing it was promised has come. | Elle chante une berceuse de cinq notes depuis dix mille ans, et une voix au-dehors tient sa note sans un tremblement pendant quatre heures et dix-neuf minutes, et elle croit — comme la Lumière l'a cru — que la chose qu'on lui avait promise est venue. |  |
| 84 | It lets go. | Elle lâche. |  |
| 85 | The Greening in that thread | Le Verdissement dans ce fil-là |  |
| 86 | The Greening in that thread is not four miles across. It is the whole Resonant Reach, from the Flume to the Greenroot road to the edge of the Shifting Dunes, in eleven days: the second Fracture, Growth following Light, and the Arbiterium's grey folder vindicated at a scale that makes a Supreme Arbiter weep with relief in a locked room at the Organum, which I have also watched, and which I would not have believed if I had only heard about it. | Le Verdissement, dans ce fil-là, ne fait pas quatre milles de large. Il couvre tous les Confins résonnants, du Flume à la route de Greenroot jusqu'au bord des Dunes mouvantes, en onze jours : la deuxième Fracture, la Croissance suivant la Lumière, et le dossier gris de l'Arbiterium justifié à une échelle qui fait pleurer de soulagement un Arbitre suprême dans une pièce fermée à clé de l'Organum, ce que j'ai regardé aussi, et que je n'aurais pas cru si je l'avais seulement entendu raconter. |  |
| 87 | And the thing wearing Lyra Ashgrove | Et la chose qui porte Lyra Ashgrove |  |
| 88 | Kaelen Vance dies under the purge, in the vault, with his father's voice coming out of the speaking-tube counting down from sixty. | Kaelen Vance meurt sous la purge, dans le caveau, avec la voix de son père qui sort du tube acoustique en comptant à rebours depuis soixante. |  |
| 89 | Vane cuts the mast-line at the quarry and runs, because there is nobody at the North Gate worth going back for, and lives another nine years, and drinks, and dies on the Rust Coast of something ordinary. | Vane coupe la ligne du mât à la carrière et s'enfuit, parce qu'il n'y a personne à la porte Nord qui vaille qu'on revienne, et vit encore neuf ans, et boit, et meurt sur la Côte de Rouille de quelque chose d'ordinaire. |  |
| 90 | Sable reads twenty names a night in a drowned plaza until the Office finds her in the spring. | Sable lit vingt noms par nuit sur une place noyée jusqu'à ce que l'Office la trouve, au printemps. |  |
| 91 | And the thing wearing Lyra Ashgrove goes on walking around inside the Greening, singing, for a very long time, because there is a great deal to eat. | Et la chose qui porte Lyra Ashgrove continue de se promener dans le Verdissement, en chantant, pendant très longtemps, parce qu'il y a beaucoup à manger. |  |
| 92 | Four hundred and eleven times. | Quatre cent onze fois. |  |
| 93 | I have a reason for showing you this one, and it is not the one you think. It is not <i>look how lucky they are</i>. Luck is not a thing I have ever been able to find in the cloth; I have looked. | J'ai une raison de vous montrer celui-ci, et ce n'est pas celle que vous croyez. Ce n'est pas <i>voyez comme ils ont de la chance</i>. La chance n'est pas une chose que j'aie jamais pu trouver dans l'étoffe ; j'ai cherché. |  |
| 94 | It is this. | C'est ceci. |  |
| 95 | In the thread you are reading — the one where she did not go out on the forty-second night — she is alive at the end of Book One, and so are four hundred and thirty-two people in a hold, and so is a child in a crate who is frightened of the dark. And every single one of those outcomes rests on a woman recognizing a low note with a ring in its heart, in her own kitchen, at the end of a day in which she had already spent everything she had. | Dans le fil que vous lisez — celui où elle n'est pas sortie la quarante-deuxième nuit — elle est vivante à la fin du Livre Un, et quatre cent trente-deux personnes dans une cale le sont aussi, et une enfant dans une caisse qui a peur du noir aussi. Et chacune de ces issues repose sur une femme qui a reconnu une note grave avec un tintement au cœur, dans sa propre cuisine, à la fin d'une journée où elle avait déjà dépensé tout ce qu'elle avait. |  |
| 96 | That is all. That is the whole margin. A tired woman heard something, and did not go out. | C'est tout. C'est toute la marge. Une femme fatiguée a entendu quelque chose, et n'est pas sortie. |  |
| 97 | I have watched a great many threads, and I can tell you with some authority that the world is never saved by the people who are fresh. | J'ai regardé beaucoup de fils, et je peux vous dire avec une certaine autorité que le monde n'est jamais sauvé par les gens frais et dispos. |  |
| 98 | One more thing | Encore une chose |  |
| 99 | One more thing, and then I will leave you to the second book. | Encore une chose, et puis je vous laisse au deuxième livre. |  |
| 100 | You should know that I am going to be in this story, and that I am going to be useful, and that I am going to like them — the Cantor especially, who reminds me of somebody, and the archivist, who does what I do and has not yet discovered what it costs. | Vous devez savoir que je vais être dans cette histoire, et que je vais être utile, et que je vais les aimer — la Chantre surtout, qui me rappelle quelqu'un, et l'archiviste, qui fait ce que je fais et n'a pas encore découvert ce que cela coûte. |  |
| 101 | And you should know that in every thread where I say nothing at the right moment, they reach the Organum together and all of them are taken into the Hush, and are a very long time being digested, and the world ends in the way that does not have a sound. | Et vous devez savoir que dans chaque fil où je ne dis rien au bon moment, ils arrivent ensemble à l'Organum et tous sont pris dans le Silence, et sont très longtemps à être digérés, et le monde finit de la façon qui n'a pas de son. |  |
| 102 | In one thread, somebody sells them at the gate. | Dans un fil, quelqu'un les vend à la porte. |  |
| 103 | Some of them live. | Certains d'entre eux vivent. |  |
| 104 | I have looked at four hundred and eleven of these, and I have not yet found a third option, and I am still looking, and I would like you to remember, when we get there, that I was looking. | J'en ai regardé quatre cent onze, et je n'ai pas encore trouvé de troisième voie, et je cherche encore, et j'aimerais que vous vous souveniez, quand nous y serons, que je cherchais. |  |
| 105 | <i>— the Tide-Weaver</i> | <i>— le Tisseur des Marées</i> |  |
| 106 | The end of Book One. | La fin du Livre Un. | P |
| 107 | She went out on the forty-second night. In the thread you read, a tired woman heard something, and did not go out. | Elle est sortie la quarante-deuxième nuit. Dans le fil que vous avez lu, une femme fatiguée a entendu quelque chose, et n'est pas sortie. | P |
| 108 | The flat stone at the foot of the Hedge | La pierre plate au pied de la Haie | P |
| 109 | The cooperage drain | La rigole de la tonnellerie | P |
| 110 | Her bed | Son lit | P |
| 111 | Her table | Sa table | P |
| 112 | Her hearth | Son âtre | P |
| 113 | Kaelen Vance, with a bore plan under his arm | Kaelen Vance, un plan de forage sous le bras | P |
| 114 | A lamp on Cooper's Row, lit | Une lampe de la rue des Tonneliers, allumée | P |
| 115 | The Hedge: thorn, and packed wool, and behind the cooperage the wadding gone rotten. | La Haie : de l'épine, de la laine tassée, et derrière la tonnellerie la bourre pourrie. | P |
| 116 | The old cooperage wall. | Le mur de la vieille tonnellerie. | P |
| 117 | A house on Cooper's Row, asleep. | Une maison de la rue des Tonneliers, endormie. | P |
| 118 | You do not sing here. This thread is only being shown to you. | Vous ne chantez pas ici. Ce fil, on ne fait que vous le montrer. | P |
| 119 | Not in this thread. | Pas dans ce fil. | P |
| 120 | This thread does not go further than Cooper's Row. | Ce fil ne va pas plus loin que la rue des Tonneliers. | P |
| 121 | Another thread | Un autre fil | P |
| 122 | Not this thread. In this one she stays on the stone with her back to the thorn for the whole three hours, and says no. You are on the stone again. | Pas ce fil-ci. Dans celui-ci, elle reste sur la pierre, le dos contre l'épine, pendant les trois heures entières, et dit non. Vous êtes de nouveau sur la pierre. | P |
| 123 | Not this thread. In this one she does not go back up Cooper's Row tonight. You are at the foot of the thorn again, behind the cooperage. | Pas ce fil-ci. Dans celui-ci, elle ne remonte pas la rue des Tonneliers cette nuit. Vous êtes de nouveau au pied de l'épine, derrière la tonnellerie. | P |
| 124 | Again | Encore | P |
| 125 | and it says there's my lark, | et ça dit voilà mon alouette, | P (plain form of a message) |
| 126 | and she says hello, Da, | et elle dit bonsoir, Papa, | P (plain form of a message) |
| 127 | Come through. | Passe de ce côté. | P (plain form of a message) |

## Recorded voices

| id | speaker | line |
|---|---|---|
| weaver.t70.who | weaver | You will want to know who is talking. |
| weaver.t70.night | weaver | That is the whole of the difference. One night. |
| weaver.t70.went | weaver | Here is the thread where she went. |
| wearer.t70.lark | wearer | There's my lark. |
| lyra.t70.hello | lyra | Hello, Da. |
| wearer.t70.come | wearer | Come through. Lark. There's a gap down by the cooperage drain, where the water goes under. It's not even a squeeze. Come through and sit with me a bit. It's cold out here and I've been on my own two years. |
| wearer.t70.again | wearer | Come through. |
| lyra.t70.no | lyra | No. |
| wearer.t70.twelfth | wearer | All right, lark. Then I'll come through to you. |
| lyra.t70.coming | lyra | Don't. I'm coming. |
| weaver.t70.watched | weaver | I have watched that moment four hundred and eleven times. |
| weaver.t70.soup | weaver | That is what a thread is. You are a soup, and a thing in the dark is patient, and some nights you have had enough sleep. |
| weaver.t70.matters | weaver | I will tell you the part that matters. |
| weaver.t70.good | weaver | And it is very good. |
| weaver.t70.quickly | weaver | Here is the rest of it, quickly, because you have a book to finish. |
| weaver.t70.times | weaver | Four hundred and eleven times. |
| weaver.t70.margin | weaver | That is all. That is the whole margin. A tired woman heard something, and did not go out. |
| weaver.t70.fresh | weaver | I have watched a great many threads, and I can tell you with some authority that the world is never saved by the people who are fresh. |
| weaver.t70.looking | weaver | I have looked at four hundred and eleven of these, and I have not yet found a third option, and I am still looking, and I would like you to remember, when we get there, that I was looking. |
| weaver.h66.thread | weaver | I am going to show you a thread that was not taken. (shared with herald66) |
| weaver.h66.unhappen | weaver | This did not happen. It also did not unhappen; nothing does. (shared with herald66) |
