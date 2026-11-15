# Phase 88: New In-Game Text (for review)

Two things the owner asked for on 14 Nov, built together:

1. **Three rules,** after reading Phase 87's record: "blocking should cost fatigue, there needs to be fall damage, enemies should follow." (`js/rules88.js`)
2. **The first two Daggerfall Unity ideas,** as recommended ("I agree with your recommendation"): weapons with weight in the hand and a shield that shows its knocks; swings whose picture follows the line you drag. Ideas only, written in our own code. (`js/feel88.js`, with small hooks in `js/body21.js`, `js/fp87.js` and `js/flourish11.js`)

Every number and line is **[PROPOSED]**. Test: `test/rules88.test.js`. French: `tools/i18n/p88-rules.tsv`.

## The rules

- **Blocking costs fatigue.** A parry costs 1. A full block costs 3, plus a quarter of the blow. With no fatigue left you cannot raise your guard ("Too winded to raise your guard."). The Synod Arsenal in full: blocks with the kite shield cost nothing (that set's own bonus, back to its first wording).
- **Falls.** The game already hurt you for any drop over 0.9 (a sheer drop of 3 costs about 36; a tumble down a rock face less). That stays. The Free Captains in full: the first ship's height of any drop (2.5) costs nothing (back to its first wording).
- **Enemies follow you.** An enemy that is chasing you and within nine paces when you go through a door comes through after you a moment later, by the door you came in at. It keeps its name and its wounds, and it is still after you. At most four follow. Bosses, keepers and things that cannot walk do not. If you leave some other way (the travel map, a cutscene), they are left behind. The Barrow-Wardens in full: woolwights and the barrow's dead do not follow you past its door (back to its first wording).

## The feel

- **Weight.** The weapon in your hand lags a little behind when you turn and settles when you stop, and dips when you start or stop walking: more for a maul than a knife, more for a two-hander. Off with Reduce motion.
- **Knocks.** A blow you block jolts the shield. It keeps the marks: pale scratches first, then dents, up to twelve. A night's rest cleans and beats it out. The marks are only for show.
- **Arcs.** The swing you drag is the swing you see, whatever the weapon: a thrust is a thrust, a chop comes down, a cut comes up, a slash goes the way you dragged. (Before, the weapon chose: a mace always came overhead, a knife always thrust.) The trail behind the edge follows the painted blade's own tip; it had stopped showing, and now shows again.

## The lines

| English | French |
|---|---|
| Too winded to raise your guard. | Trop essoufflé pour lever votre garde. |
| The block takes it out of you. | La parade vous a vidé. |
| Something came through the door behind you. | Quelque chose a passé la porte derrière vous. |
| {0} of them came through the door behind you. | {0} d'entre eux ont passé la porte derrière vous. |
| blocks with the kite shield cost no fatigue | parer avec le bouclier en amande ne coûte aucune fatigue |
| ranged weapons reload a third faster; no fall damage from a ship's height | les armes à distance se rechargent un tiers plus vite ; pas de dégâts de chute de la hauteur d'un navire |
| woolwights and the barrow's dead do not follow you past its door | les Laineux et les morts du tertre ne vous suivent pas au-delà de sa porte |
