# Phase 91: the Souls rules, in the Reach (text for review)

*Written 14 Nov 2026. Built under the owner's approval of Phase 89 and of Phase 90's six numbers ("you have my approval for all now you may proceed"). Code: `js/souls91.js`. Every line below is new and [PROPOSED]; the French is in `tools/i18n/p91-souls.tsv`.*

## What was built

- **Lamps.** A hush-lamp on an iron post, as the Reach's lamps are (Phase 89: "a hush-lamp in a niche (as now)"). Five: the Antler Galleries' shaft foot and floorstone seam (the last light before the den); the Dry Flume's adit foot and stair foot; the Deep Grove's gap, outside in Greenroot (the Grove itself has none: nothing opens there). Standing by one lights it. Using a lit one rests: full health, voice and breath; one hour passes; the place's ordinary foes get up where they first stood; its keeper only once it has been down a week (eight days); the game is saved to the autosave slot (not in a hardcore run). In the Galleries it fills your own lamp as well. You cannot rest with something hunting you.
- **Waking.** Die in a place that has a lit lamp and you wake by the last of its lamps you lit, at six-tenths health, as the game always woke you. Die anywhere else and you wake where you always did. [PROPOSED: the plan says "the last lamp lit"; until every realm has lamps, a lamp only takes you back inside its own place, so a death in Oakhaven never drags you into a mine.]
- **The Piece.** On waking, the coin you carried and the experience you had toward your next level (never a level) stay where you fell. It hums the Reach's note (174 Hz) from up to fourteen steps away, panned to where it lies, and shows only within four steps, as a lilac wisp. Stand where you fell and it comes home. Die again first and it is gone, and nothing says where. Gear is never lost.
- **The hour-bead.** 120 sovereigns, one carried at a time. If you carry one, the death screen offers to swallow it: the death is undone where it happened, at six-tenths health, and no Piece is left. Nobody sells it yet: the hour-merchants are Veridia's, and come with the Dunes.
- **Shortcuts.** A chimney from the Flint-Back's den straight up to the shaft's foot, its rope tied off at the bottom until you climb it from the den. An iron door between the sump passage and the pump-hall, barred on the hall side; once unbarred nobody has to time the sump again. The grating to the Pound Stair (Phase 85) stays the Flume's other way out.
- **Options:** "Souls rules", On by default. Off is the old cost exactly (wake by the map's lamp, lose five coins, no Piece), and the lamps go dark and cannot be used. The two shortcut doors stay either way.

## For the owner

1. The Piece sounds 174 Hz, the Reach's note, as "your note". Should it be the player's own note (if the game ever gives the player one), or the note of the realm where they fell? *Recommend: the realm's note, so the Heights' Pieces ring at 528.*
2. Resting at a lamp passes one hour. *Recommend: keep; a full sleep is still the inn's.*
3. Waking only by a lamp of the place you died in (see above). *Recommend: keep until every realm has its lamps, then make it the last lamp lit anywhere.*
4. The Reach's keepers (the Flint-Back, the Standing Note) do not yet drop a trophy and a piece of realm gear (rule 5); their gear lies in their places as before. *Recommend: add the trophies when the Heights' keepers are built, all at once.*

## The new lines

| English | French |
|---|---|
| A hush-lamp on an iron post, unlit. Its reed-whistle is stopped with wax. [PROPOSED] | Une veilleuse sur un poteau de fer, éteinte. Son sifflet de roseau est bouché à la cire. |
| A hush-lamp on an iron post, burning. Use it to rest. [PROPOSED] | Une veilleuse sur un poteau de fer, allumée. Utilisez-la pour vous reposer. |
| You light the lamp. Its reed-whistle takes up its thin note. It will be here when you need it. [PROPOSED] | Vous allumez la lampe. Son sifflet de roseau reprend sa note mince. Elle sera là quand vous en aurez besoin. |
| You sit by the lamp a while. Your wounds close, and your breath comes back. Behind you, in the dark, the place fills up again. [PROPOSED] | Vous restez un moment assis près de la lampe. Vos blessures se referment, votre souffle revient. Derrière vous, dans le noir, l'endroit se remplit de nouveau. |
| You fill your own lamp from it. [PROPOSED] | Vous y remplissez votre propre lampe. |
| The game is saved. [PROPOSED] | La partie est sauvegardée. |
| Somewhere below, something that lay a long time in the dark has got up again. [PROPOSED] | Quelque part en dessous, une chose longtemps couchée dans le noir s'est relevée. |
| Not with something hunting you. [PROPOSED] | Pas avec quelque chose à vos trousses. |
| You wake by the last lamp you lit. What you carried is where you fell. [PROPOSED] | Vous vous réveillez près de la dernière lampe que vous avez allumée. Ce que vous portiez est resté là où vous êtes tombé. |
| What you carried is where you fell. [PROPOSED] | Ce que vous portiez est resté là où vous êtes tombé. |
| What you carried will wait where you fell, sounding your note. [PROPOSED] | Ce que vous portiez attendra là où vous êtes tombé, en sonnant votre note. |
| A lilac shimmer, low down, humming your note. [PROPOSED] | Un miroitement lilas, au ras du sol, qui fredonne votre note. |
| You stand where you fell, and your Piece comes home. [PROPOSED] | Vous vous tenez là où vous êtes tombé, et votre Fragment rentre au foyer. |
| You stand where you fell, and your Piece comes home, with {0} sovereigns. [PROPOSED] | Vous vous tenez là où vous êtes tombé, et votre Fragment rentre au foyer, avec {0} souverains. |
| Load the save from the lamp [PROPOSED] | Charger la sauvegarde de la lampe |
| Swallow the hour-bead [PROPOSED] | Avaler la perle d'heure |
| You swallow the hour-bead. The last few heartbeats come undone, and you are standing where you fell, with everything you carried. [PROPOSED] | Vous avalez la perle d'heure. Les derniers battements de cœur se défont, et vous voilà debout là où vous êtes tombé, avec tout ce que vous portiez. |
| Hour-bead [PROPOSED] | Perle d'heure |
| A sealed glass bead with an hour of somebody's life in it, certified by the Collegium. Swallowed, it undoes one death on the spot. Keep it until you need it. [PROPOSED] | Une perle de verre scellée qui contient une heure de la vie de quelqu'un, certifiée par le Collegium. Avalée, elle défait une mort sur-le-champ. Gardez-la jusqu'à ce que vous en ayez besoin. |
| Keep it until you need it. It undoes a death, and nothing else. [PROPOSED] | Gardez-la jusqu'à ce que vous en ayez besoin. Elle défait une mort, et rien d'autre. |
| You can only carry one hour-bead. [PROPOSED] | Vous ne pouvez porter qu'une seule perle d'heure. |
| An hour-bead costs 120 sovereigns. [PROPOSED] | Une perle d'heure coûte 120 souverains. |
| You buy an hour-bead. [PROPOSED] | Vous achetez une perle d'heure. |
| A chimney in the chalk, going down. A rope hangs in it, tied off far below, out of reach. [PROPOSED] | Une cheminée dans la craie, qui descend. Une corde y pend, attachée tout en bas, hors de portée. |
| Down the chimney on the rope, to the deepest gallery [PROPOSED] | Descendre la cheminée par la corde, jusqu'à la galerie la plus profonde |
| A chimney in the chalk, going up, and a rope down it. Climb it [PROPOSED] | Une cheminée dans la craie, qui monte, et une corde qui y pend. Grimper |
| You climb the chimney on the rope and come out at the shaft's foot. You tie the rope off at the top: it is a way down now, too. [PROPOSED] | Vous grimpez la cheminée par la corde et ressortez au pied du puits. Vous attachez la corde en haut : c'est désormais aussi un chemin pour descendre. |
| An iron door in the gallery wall. It does not move: it is barred on the far side. [PROPOSED] | Une porte de fer dans le mur de la galerie. Elle ne bouge pas : elle est barrée de l'autre côté. |
| The iron door between the sump passage and the pump-hall [PROPOSED] | La porte de fer entre le passage du puisard et la salle des pompes |
| An iron bar across the door, in two brackets. Use it to lift it out. [PROPOSED] | Une barre de fer en travers de la porte, posée dans deux crochets. Utilisez-la pour la soulever. |
| The bar is on the other side. [PROPOSED] | La barre est de l'autre côté. |
| You lift the bar out of its brackets and set it against the wall. The door swings. Nobody has to time the sump again. [PROPOSED] | Vous sortez la barre de ses crochets et l'appuyez contre le mur. La porte pivote. Plus personne n'aura à guetter le puisard. |
| The bar, set against the wall where you left it. [PROPOSED] | La barre, appuyée contre le mur où vous l'avez laissée. |
| The shaft's foot [PROPOSED] | Le pied du puits |
| The floorstone seam [PROPOSED] | La veine de la pierre de fond |
| The adit's foot [PROPOSED] | Le pied de la galerie d'accès |
| The foot of the stair [PROPOSED] | Le pied de l'escalier |
| The Deep Grove's gap [PROPOSED] | La trouée du Bosquet profond |
| Souls rules [PROPOSED] | Règles des Âmes |
| lamps to rest at, and the Piece: what you carried waits where you fell (Off: wake by the lamp and lose five coins, as before) [PROPOSED] | des lampes où se reposer, et le Fragment : ce que vous portiez attend là où vous êtes tombé (désactivé : réveil près de la lampe et perte de cinq pièces, comme avant) |
