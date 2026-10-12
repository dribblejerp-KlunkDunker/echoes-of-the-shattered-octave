// ============================================================
//  DATA — canon drawn from the Echoes of the Shattered Octave bible
// ============================================================
'use strict';

const DAYS = ['Nullday', 'Rootday', 'Hearthday', 'Massday', 'Stasisday', 'Dawnday', 'Driftday', 'Memoryday'];

const ATTRS = ['Strength', 'Intelligence', 'Willpower', 'Agility', 'Endurance', 'Personality', 'Speed', 'Luck'];

const CLASSES = [
  {
    id: 'blade', name: 'Dissonant Blade', hz: '174 Hz',
    desc: 'A former bore-engineer whose left arm set to Aether-Glass in the Fracture. The glass drinks what it breaks, and the tideline climbs for it. Hounds will not touch you. Neither, for long, will anyone else.',
    attrs: { Strength: 60, Intelligence: 55, Willpower: 50, Agility: 45, Endurance: 60, Personality: 35, Speed: 45, Luck: 40 },
    hp: 30, voice: 10, glass: true, weapons: ['sword', 'glass'], songs: ['murmur'], pellets: 4,
    skills: 'Long Blade, Glasswork, Engineering',
  },
  {
    id: 'cantor', name: 'Cantor', hz: '174 Hz',
    desc: 'You sing the births, fevers and burials of orchard country, always inside the Narrow. Your tending notes are older than the Church knows. You have never picked up a sword and you will not start now.',
    attrs: { Strength: 35, Intelligence: 55, Willpower: 70, Agility: 45, Endurance: 45, Personality: 65, Speed: 45, Luck: 45 },
    hp: 20, voice: 40, glass: false, weapons: ['hands', 'pistol'], songs: ['murmur', 'tending', 'fifth', 'root'], pellets: 9,
    skills: 'Law-song, Mending, Etiquette',
  },
  {
    id: 'corsair', name: 'Corsair', hz: '639 Hz',
    desc: 'Rust Coast, by way of the air. You count, you judge rope and angles, and you carry glass shot that costs a sovereign a pellet. You laugh loudest when you are most afraid.',
    attrs: { Strength: 50, Intelligence: 45, Willpower: 40, Agility: 65, Endurance: 50, Personality: 55, Speed: 60, Luck: 55 },
    hp: 25, voice: 12, glass: false, weapons: ['sword', 'pistol'], songs: ['murmur'], pellets: 12,
    skills: 'Short Blade, Firearms, Streetwise',
  },
  {
    id: 'archivist', name: 'Archivist of the Veil', hz: '741 Hz',
    desc: 'A conscripted scribe of the Office of the Catalogue who walked into the mist with a Ledger. You know what the glass cores are. You can read a Legionnaire\'s name off its bell. Every name you keep costs you a little of yourself.',
    attrs: { Strength: 35, Intelligence: 75, Willpower: 60, Agility: 45, Endurance: 40, Personality: 50, Speed: 45, Luck: 50 },
    hp: 18, voice: 30, glass: false, weapons: ['hands', 'pistol'], songs: ['murmur', 'tending', 'name'], pellets: 7,
    skills: 'Ledger-craft, Lore, Resonance',
  },
  {
    id: 'penitent', name: 'Flambeau Penitent', hz: '285 Hz',
    desc: 'You carried a censer for the Church until the day the light turned. You still half-believe you were right. Your faith is fire, and both are guttering.',
    attrs: { Strength: 55, Intelligence: 50, Willpower: 65, Agility: 40, Endurance: 55, Personality: 45, Speed: 40, Luck: 35 },
    hp: 26, voice: 25, glass: false, weapons: ['sword', 'hands'], songs: ['murmur', 'fifth'], pellets: 3,
    skills: 'Blunt Weapon, Doctrine, Glass-fire',
  },
  {
    id: 'quarry', name: 'Quarry-Hand', hz: '396 Hz',
    desc: 'Night shift at the Oakhaven works. You have heard the Root breathe through the pump-house floor and you have seen what the Grafters bring up in sacks. Strong back, short list of friends.',
    attrs: { Strength: 70, Intelligence: 40, Willpower: 45, Agility: 50, Endurance: 70, Personality: 40, Speed: 50, Luck: 40 },
    hp: 36, voice: 8, glass: false, weapons: ['sword'], songs: ['murmur'], pellets: 2,
    skills: 'Axe, Climbing, Endurance',
  },
];

const BIOGRAPHY = [
  {
    q: 'Where were you on the morning the Light let go?',
    a: [
      { t: 'In the Reach, hearing the oaks ring like bronze.', mod: { Willpower: 5 }, flag: 'bio_reach' },
      { t: 'At the Dawning Spire. I was one of the forty who held the note.', mod: { Personality: -5, Intelligence: 5, Willpower: 5 }, flag: 'bio_rite' },
      { t: 'Drunk, somewhere on the Rust Coast, and I have never been so lucky.', mod: { Luck: 8, Endurance: -3 }, flag: 'bio_coast' },
    ],
  },
  {
    q: 'A voice you love calls to you from beyond the Hedge, at the dead hour. You...',
    a: [
      { t: 'Say nothing. Never answer a voice you cannot see.', mod: { Willpower: 5 }, flag: 'bio_silent' },
      { t: 'Answer. Just once. Just to hear it again.', mod: { Personality: 5, Willpower: -5 }, flag: 'bio_answered' },
      { t: 'Load the pistol.', mod: { Agility: 5 }, flag: 'bio_pistol' },
    ],
  },
  {
    q: 'What did the Synod take from you?',
    a: [
      { t: 'A brother, burned by the Flambeaux for singing off-pitch.', mod: { Strength: 5 }, flag: 'bio_brother' },
      { t: 'A name. I was pressed, and given back. I remember all of it.', mod: { Intelligence: 5, Endurance: -3 }, flag: 'bio_pressed' },
      { t: 'The bells. Every bell in the Reach went for bore-teeth.', mod: { Personality: 5 }, flag: 'bio_bells' },
    ],
  },
];

// ---- weapons & songs ---------------------------------------------------
const WEAPONS = {
  sword: { name: 'Short Sword', img: 'fp_sword', dmg: [4, 10], reach: 1.4, noise: 1.6, speed: 0.42, type: 'iron' },
  glass: { name: 'Glass Arm', img: 'fp_glass', dmg: [7, 16], reach: 1.3, noise: 1.2, speed: 0.55, type: 'glass' },
  pistol: { name: 'Glass-Shot Pistol', img: 'fp_pistol', dmg: [9, 18], reach: 9, noise: 4.5, speed: 0.9, type: 'shot', ammo: true },
  hands: { name: 'Bare Hands', img: 'fp_hands', dmg: [1, 3], reach: 1.1, noise: 1.0, speed: 0.4, type: 'iron' },
};

const SONGS = {
  murmur: { name: 'Murmur', hz: '—', cost: 0, noise: 0.9, desc: 'Keep the Hush off. Raises your sound a little without waking the hounds.' },
  tending: { name: 'Tending Note', hz: '174', cost: 8, noise: 1.8, desc: 'A Cantor\'s mending note. Heals 14. Sung low, inside the Narrow.' },
  fifth: { name: 'Falling Fifth', hz: '174→116', cost: 12, noise: 3.6, desc: 'The calling-song\'s turn. Every Cacophony within hearing stops for a breath. Loud. A trick works on a mimic once.' },
  root: { name: 'Root Note', hz: '174', cost: 10, noise: 2.6, desc: 'The note the Root is trying to remember. Hounds will not come to you for a time.' },
  name: { name: 'Read the Name', hz: '741', cost: 6, noise: 1.2, desc: 'Recite a Legionnaire or proctor its own surrendered name. It stops. Costs you a little of yourself.' },
};

// ---- enemies -----------------------------------------------------------
const ENEMIES = {
  hound: { name: 'Cacophony Hound', sprite: 'hound', hp: 18, dmg: [3, 7], speed: 2.3, reach: 1.0, cacophony: true, noiseLure: true, scale: 0.8, xp: 12,
    desc: 'Static with appetite. Up close you can hear screaming inside it.' },
  legionnaire: { name: 'Carillon Legionnaire', sprite: 'legionnaire', hp: 34, dmg: [4, 9], speed: 1.1, reach: 1.2, core: true, scale: 1.0, xp: 25,
    desc: 'A bell-shaped helm. Stand close and you can hear someone murmuring inside.' },
  golem: { name: 'Steam Golem', sprite: 'golem', hp: 52, dmg: [8, 16], speed: 0.9, reach: 1.4, scale: 1.15, xp: 60, armored: true,
    desc: 'A boiler on legs. It vents when it is about to swing.' },
  proctor: { name: 'Catalogue Proctor', sprite: 'proctor', hp: 22, dmg: [3, 6], speed: 1.5, reach: 1.1, press: true, core: true, scale: 1.0, xp: 20,
    desc: 'Grey oilcloth, silver mesh, a hand-press tuned to 741.' },
  mites: { name: 'Cacophony Swarm', sprite: 'mites', hp: 10, dmg: [1, 3], speed: 1.8, reach: 0.9, cacophony: true, scale: 0.55, yOff: -0.2, xp: 8,
    desc: 'Mites and leeches. They strip a room of sound.' },
  wearer: { name: 'The Wearer', sprite: 'wearer', hp: 90, dmg: [6, 14], speed: 1.6, reach: 1.3, cacophony: true, boss: true, scale: 1.1, xp: 150,
    desc: 'It wears Tobin Ashgrove. It has been practising your voice.' },
  quiet: { name: 'A Quiet', sprite: 'quiet', hp: 40, dmg: [4, 9], speed: 1.0, reach: 1.1, quiet: true, scale: 1.0, xp: 40,
    desc: 'A hole in the world. Glass shot cannot ring inside it. Iron can.' },
};

const NAMES_POOL = ['Tamsin Reed', 'Corwin Aye', 'Mirren Salk', 'Joss Carder', 'Emory Wain', 'Bettis Renn', 'Halder Wick', 'Wren Halloway', 'Annet Sowerby', 'Merret Salt',
  'Dunstan Pell', 'Ivo Marrick', 'Sefa Lund', 'Ottilie Crane', 'Benet Owler', 'Maud Tanner', 'Ro Fenwick', 'Caddoc Vey', 'Elin Thorsby', 'Perrin Lusk'];

// ---- items -------------------------------------------------------------
const ITEMS = {
  pellets: { name: 'Glass Shot (×3)', sprite: 'loot', desc: 'Pellets of Aether-Glass for an ordinary pistol. A sovereign each. They break the Cacophony.', use: 'ammo', n: 3 },
  tonic: { name: 'Bettany\'s Tonic', sprite: 'loot', desc: 'Honey, raw egg and willow-bark. Restores 12 health.', use: 'heal', n: 12 },
  honey: { name: 'Oiled Honey', sprite: 'loot', desc: 'For the throat. Restores 15 voice.', use: 'voice', n: 15 },
  sovereigns: { name: 'Sovereigns', sprite: 'loot', desc: 'Synod coin stamped with a dead queen.', use: 'gold' },
  coil: { name: 'Reverse-Phase Coil', sprite: 'coil', desc: 'A brass and copper coil wound around a green-gold Growth crystal. Seated in the bore\'s lock it will throw the bit a quarter-tone wrong and snap it.', key: true },
  charts: { name: 'Tobiah\'s Charts', sprite: 'loot', desc: 'The night-shift charts of the Oakhaven works, and the only copy of the Vance Sequence, Revision Seven, with the margin on it: on failure of the hold, slippage is to be absorbed by the source.', key: true },
  pass: { name: 'Consortium Pass', sprite: 'loot', desc: 'Factor Vosk\'s seal. It opens the quarry gate and the shaft to the Root-vault.', key: true },
  boots: { name: 'Davin\'s Boots', sprite: 'loot', desc: 'A dead boy\'s boots. Rooke asked that they go to his mother, Orla Hale.', key: true },
  core: { name: 'Cracked Lilac Core', sprite: 'coil', desc: 'A Legionnaire\'s glass core, cracked. It said a name three times before it stopped.', key: true },
  bottle: { name: 'Vox-Bottle', sprite: 'loot', desc: 'The last words of someone, stoppered. Opening it brings hounds. Do not.', key: false, use: 'bottle' },
  whistle: { name: 'Hush-Whistle', sprite: 'loot', desc: 'A reed-whistle from a hush-lamp. Blown, it keeps the Hush off for a little while without calling the hounds.', use: 'whistle' },
};

// ---- lore topics (Tell me about ...) -------------------------------------
// Each topic: generic answers by knowledge tier; NPC-specific overrides live in NPCS.
const TOPICS = {
  'Oakhaven': { low: 'Orchard town. Used to be. Now it\'s a town inside a hedge that eats its own noise.', high: 'Capital of the Resonant Reach, under the seal of a queen who has been dead a hundred and forty years. Since 417 the Consortium has milked the Growth Anchor\'s root from the quarry, and the law is going soft. Saplings split cobbles overnight.' },
  'The Hedge': { low: 'Three men deep of thorn and packed wool. It swallows our sounds so the hounds don\'t hear. Don\'t go near it after dark.', high: 'Planted in 417 after the first hounds came. It keeps the Narrow for us. But at the dead hour it has started to speak, in the voices of our dead. Never answer it. Answering tells it you are there.' },
  'The Narrow': { low: 'Too loud brings the hounds, too still brings the Hush. Every child knows the rhyme.', high: 'Mortals live in the band between two predators. Speak in a murmur. Keep a hush-lamp lit so no room ever goes silent. In siphoned country a person who falls truly silent begins to unwrite: warmth first, then name, then outline.' },
  'The Cacophony': { low: 'Static with teeth. They come to music. Hounds, mostly, round here.', high: 'What song becomes when the Hush bites it. They hunt voices because every voice is a small song, and they wear what they eat. Aether-Glass breaks them; glass shot from an ordinary pistol will do. They will not cross the glassed.' },
  'The Hush': { low: 'What\'s outside. The quiet. We don\'t talk about it, which I suppose is the point.', high: 'It is not empty. It is a silence that is alive, patient, and hungry, and it does not kill what it takes. It digests. Where a law thins, the Hush leans in. The Tongueless worship it as the Merciful Quiet. They are right that it is quiet.' },
  'The Root': { low: 'What\'s under the quarry. The Consortium drills it. Pays the town\'s bread, the Governor says.', high: 'The Root of the Growth Anchor, 174 Hz. The Spire is the tower you can see; the Anchor is what is inside it, and the Root is where it drinks. There is something singing down there, a lullaby, and it keeps losing the tune.' },
  'The Iron Synod': { low: 'One Note, One Law, One Hand. They took our bells for bore-teeth.', high: 'Five organs that need each other and hate each other: the Glass Court of dead kings, the Choir-Church, the Arbiterium, the Consortium of Bores and the Office of the Catalogue. And the Carillon Legions, every one of them running on a stolen name.' },
  'The Flume': { low: 'The green river. Aqueduct, really, from the Anchor country. You can drink it if you boil it twice. Old Tam sits at the crossing of a night and listens to it.', high: 'The Chlorophyll Flume carries Growth-water down from the Anchor\'s country to the orchards. It has been running sweeter and faster since 417, which is not good news. What it carries, it also carries voices in.' },
  'The Church': { low: 'The Choir-Church. They took the bells in 412. They are coming back up the road to sing over us, and that is supposed to be a blessing.', high: 'The Choir-Church of the Pure Note holds that the Light let go because one voice shouted at the Dawning Spire. Its Flambeau burn what sings off-key. Ignatius Crane leads the column coming to Oakhaven; his left hand was bleached white at the Dawning.' },
  'The Rite': { low: 'The Church is coming to hold the Pure Note over the town. On Hearthday. They say it is a blessing.', high: 'A four-hour unison hold at 174 Hz, sung at the casing with a collar and a wire. The Vance Sequence, Revision Seven, Stage Nine. Source: Cantor, local. They did the same thing at the Dawning Spire in 412 and the Light let go.' },
  'Kaelen Vance': { low: 'The Governor\'s son. Lives outside the Hedge in a charcoal-burner\'s hut. The hounds won\'t touch him. People say that tells you something.', high: 'Chief Resonant Engineer of the Consortium by twenty-seven. He calibrated the bore at the Dawning Spire. His left arm is Light-glass, Stage Three and spreading; anyone who knows glass can read his past off his skin.' },
  'Lyra Ashgrove': { low: 'Our Cantor. Sings the births and the burials. Her father was taken in 417.', high: 'Tobin Ashgrove raised his voice above the Narrow to call a fevered child back from the Hush. The child lived. Something wears his voice now, and it has been courting her at the Hedge.' },
  'Governor Vance': { low: 'He keeps us fed. That is what he says. He has not aired his room in two years.', high: 'He sold the Root during the Cascade famine to keep Oakhaven fed, and he has been bleeding the town slowly to save it ever since. There are roots under his sleeves.' },
  'Aether-Glass': { low: 'Fuel. Lamps, engines, the Legions. It comes out of the ground green here.', high: 'Crystallized song: a Chorister\'s voice bled out and set. Every tanker of fuel is part god. Glass remembers whatever is pressed into it, which is how the Catalogue stores stolen names. Raw glass crystallizes flesh in four stages: ringing, frost, set, heartglass.' },
  'The Catalogue': { low: 'The Office. They take names. Every name is a unit, they say.', high: 'Formerly the Silent Veil. Registrar-General Quist runs the harvest-houses where people are Unnamed: a hand-press tuned to 741, eight seconds of contact. What remains is a Hollow, repeating the last thing it did.' },
  'The Grafters': { low: 'Synod surgeons. They come for the burl-sick with saws.', high: 'Surgeon-Grafter Rooke does the cutting here. He has done every one with care. The sap-mark he chalks on a door means past cutting, and now it also means the Inquisitor\'s list.' },
  'The Flambeaux': { low: 'The Church\'s burners. They carry glass-fire the hounds will not cross.', high: 'Ignatius Crane is their brightest flame. He swung the censer through three hundred sunrises of the Rite of Pure Unison and ordered the choir burned when the light turned. He has spent seven years praying over the one voice that shouted.' },
  'The Drift-Kestrel': { low: 'A skyship at the mooring mast. Smuggler, by the look of her captain.', high: 'Captain Vane, late of the Wave-Cutter. Rust Coast. Twelve crates in his hold for the quarry garrison, and at the dead hour the crates say names.' },
  'The Quarry': { low: 'North of the Hedge. Headframe over a green-lit shaft. Hollows work the pumps.', high: 'At the bottom is a chamber grown out of the Root itself, veined with glass and breathing. Depot Three holds the engineers\' stores. The shaft to the Root-vault is sealed to anyone without a Consortium pass.' },
  'Hush-lamps': { low: 'The reed on the lantern. It whistles so the house never goes quiet.', high: 'A room that falls silent is a door left open. Every house keeps one burning. Night-hummers sit at the crossings till dawn. Tam does the Flume crossing, or did.' },
  'Vox-bottles': { low: 'Last words of the dead, stoppered. The Free Captains sell them. Don\'t open one indoors.', high: 'The grieving buy them. Opening one brings hounds, and worse: sailors say a quiet comes aboard through a bottle left too long unstoppered.' },
};
const TOPIC_KEYS = Object.keys(TOPICS);

const PLACES = {
  'The Boar & Dulcimer': 'tavern', 'Lyra\'s house': 'lyra_house', 'The Greenhall': 'greenhall', 'Rooke\'s surgery': 'surgery', 'The North Gate': 'gate', 'The mooring mast': 'mast', 'Orla Hale\'s house': 'orla_house',
  'The market': 'market', 'The Carders\' mill': 'mill', 'The Chapel of the Carillon': 'chapel', 'The Flume crossing': 'flume', 'Tannery Row': 'tannery', 'The tannery culvert': 'culvert',
};

// ---- rumours -----------------------------------------------------------
const RUMOURS = [
  'Pim Carder put out roots on Rootday. Bettany hummed him through it. The Grafters have not been told. Do not tell them.',
  'Old Harrow swears the Hedge whistled the falling fifth last night. Exactly right. Nobody taught it that.',
  'The baker says her bread rose until the oven split. Burl-sickness in the dough, she says, as if dough could sicken.',
  'A skyship came in off the Rust Coast with twelve crates for the garrison. The crew drink at the Boar and do not talk about the cargo.',
  'They say the Church is coming up the Greenroot road under glass-fire, singing. Hymns bring hounds. The Church does not care.',
  'My fingernails grew a quarter-inch between dusk and dawn. Nobody\'s remarked on it. Nobody remarks on anything.',
  'Davin Hale sang his mother\'s harvest song at the Boar. The hounds sang it back. That was the last anyone saw of Davin.',
  'The Governor took the Consortium\'s purse. Again. We eat, and the Root is bled, and the oaks ring like bronze when the wind moves.',
  'Keep your voice in your chest. Keep your lamp lit. Do not go to the Hedge at the dead hour, whatever it says, whoever it sounds like.',
  'Tam the night-hummer listens to his dead wife at the Flume crossing. We all know. None of us has the heart to tell him what she is.',
  'Bettany at the market stall takes coin for tonic but she would rather take eggs. Nobody has eggs. The hens went quiet first.',
  'The Tanner twins went down the culvert after their dog on Driftday last. Hob Wendle still sets a lamp in their window. He keeps the culvert key on a nail.',
  'Nell Carder has not let the boy out of the mill since the Grafters posted the inspection. She says he has a cough. It is not a cough.',
  'Red was redder when I was a girl. Summers were warmer. Everyone over thirty says so. The young ones think we are mad.',
  'The dead are buried with bound jaws and a stone on the tongue so they cannot ring. We have not rung a bell in this town since the Synod took them.',
];

// ---- NPC dialogue --------------------------------------------------------
// Each NPC: name, sprite, portrait, greet (by tone), knowledge tier, topic overrides, quest hooks.
const NPCS = {
  harrow: {
    name: 'Old Harrow, gate-warden', sprite: 'harrow', portrait: 'harrow', tier: 'low',
    greet: { polite: 'Keep your voice down, friend, and welcome to what\'s left of Oakhaven.', normal: 'Gate\'s shut after dusk. Keep it low.', blunt: 'You shout like that again and I\'ll put you out through the thorn myself.' },
    topics: { 'The Hedge': 'I\'ve stood this gate eleven years. Last night it whistled a tune only the Cantor and the Carder boy know. Whistled it exactly right.' },
    quest: (g) => {
      if (g.flags.need_gate && !g.flags.gate_open) { g.flags.gate_open = true; g.flags.met_harrow = true; return { text: 'Lyra\'s word, is it. Then it is on her head. Go on, through the gate, and go quick and quiet. His hut is north, past the hound-bed. You\'ll smell the charcoal before you see it. Do not sing out there.', journal: ['main', 'Harrow has unbarred the North Gate for me. Kaelen Vance\'s hut lies north of the Hedge, past the hound-bed.'] }; }
      if (!g.flags.met_harrow) { g.flags.met_harrow = true; return { text: 'You\'re the one the Cantor sent for? Then go and see her. Cooper\'s Row, the house with the green door, south side of the square. And friend, we keep the gate shut at night because of what is on the other side of it. Not to keep you in.', journal: ['main', 'Old Harrow at the North Gate says the Cantor, Lyra Ashgrove, is expecting me. Her house is on Cooper\'s Row, south of the square.'] }; }
      if (g.flags.need_gate && !g.flags.gate_open) { g.flags.gate_open = true; return { text: 'Lyra\'s word, is it. Then it is on her head. Go on, through the gate, and go quick and quiet. His hut is north, past the hound-bed. You\'ll smell the charcoal before you see it. Do not sing out there.', journal: ['main', 'Harrow has unbarred the North Gate for me. Kaelen Vance\'s hut lies north of the Hedge, past the hound-bed.'] }; }
      return null;
    },
  },
  lyra: {
    name: 'Lyra Ashgrove, Cantor of Oakhaven', sprite: 'lyra', portrait: 'lyra', tier: 'high',
    greet: { polite: 'You came. Sit, keep your voice in your chest. I\'ve a thing to ask that I should not ask anyone.', normal: 'Come in, close the door. The lamp\'s lit; we can talk.', blunt: 'Lower. Please. There are things in this town that learn from every sound.' },
    topics: {
      'Kaelen Vance': 'He was my shadow when we were children. He left at seventeen for the Conservatory of Bores and came back with an arm of glass and no words. He lives outside the Hedge because the hounds will not touch him, and because he has decided he does not deserve the inside.',
      'The Rite': 'Stage Nine: a four-hour unison hold at the casing. Source: Cantor, local. That is me. They will put a collar on my throat and a wire through my voice and I will sing the Root to sleep for them, and then they will drink it. Unless we break the bore first.',
      'Lyra Ashgrove': 'A martyr is just a musician who gave up before the coda. I would rather not be either.',
    },
    quest: (g) => {
      if (!g.flags.lyra_met) {
        g.flags.lyra_met = true; g.flags.need_gate = true;
        g.give('pellets'); g.give('tonic');
        return { text: 'The Consortium has set a Rite for Hearthday. Nine days. Stage Nine of a method called the Vance Sequence, and it needs a Cantor to hold the note at the casing. Kaelen wrote that method. I need him to tell me how to break it. Go north through the gate and find his hut. Harrow will open it on my word. Take these — glass shot, and a tonic of Bettany\'s. Do not sing beyond the Hedge, whatever you hear.', journal: ['main', 'Lyra asked me to carry word to Kaelen Vance, who lives outside the Hedge. The Church\'s Rite falls on Hearthday, nine days out. I must go north through the gate; Harrow will open it on her word.'] };
      }
      if (g.flags.kaelen_met && !g.flags.coil_done && !g.flags.lyra_coil_told) {
        g.flags.lyra_coil_told = true;
        return { text: 'A coil in the lock. Of course. He always did break things from the inside. Go carefully in the quarry. The Hollows at the pumps will not hurt you; the bells will. If you hear a voice you know down there, you do not know it.', journal: null };
      }
      if (g.flags.coil_done && !g.flags.rite_started) {
        return { text: 'Then it\'s Hearthday. They will walk me down in white and the town will hum the Root note under the Pure Note, too quietly to punish. When the lock throws, I will sing the falling fifth against the bore. You will need to be at the casing with him. Take the shaft from the quarry. Go now — I can hear the censers from here.', journal: null };
      }
      return null;
    },
  },
  kaelen: {
    name: 'Kaelen Vance, the Dissonant Blade', sprite: 'kaelen', portrait: 'kaelen', tier: 'high',
    greet: { polite: 'Mind the bed, twenty paces off the door. No sound carries over it for a day. Say what you came to say.', normal: 'The hounds let you past. That means you came quietly. Good.', blunt: 'I don\'t build things anymore. I just know how they break. What do you want broken?' },
    topics: {
      'The Rite': 'Revision Seven. My method, improved in an Arbiterium hand. Stage Nine is a four-hour hold at 174 with a collar and a wire. They did it at the Dawning Spire with forty singers for three hundred days. On the last morning the Light heard its own note held for it, and it asked a question, and it let go. I was there. I failed to stabilize it. That is the lie I tell.',
      'Aether-Glass': 'It drinks what it breaks. Every Legionnaire I put down, the ring gets fuller and the tideline climbs. Three fingers from the shoulder, this morning. When it reaches the heart they call it Heartglass, and you become a humming statue, alive and aware.',
      'Kaelen Vance': 'If I carry all of it, no one else has to. I know what that sounds like. I\'m an engineer; I know a bad load path when I draw one.',
      'The Root': 'I laid my hand on it once. The humming stopped and something turned toward me. It is tired. It has been holding a lullaby for ten thousand years and it keeps losing the tune.',
    },
    quest: (g) => {
      if (!g.flags.kaelen_met) {
        g.flags.kaelen_met = true;
        return { text: 'She sent you. Then listen, once. The bore has a lock at the casing. Seat a reverse-phase coil in it and the bit goes a quarter-tone wrong and snaps itself. There is a coil in Depot Three at the quarry, in the engineers\' stores, behind a Legionnaire that walked me across town last week. Bring it to me. And bring Tobiah Marsh\'s charts if you find them; a boy on the night shift keeps the only honest copy of my method. Go in at the headframe. Do not sing. Do not answer anything that sounds like me.', journal: ['main', 'Kaelen says a reverse-phase coil seated in the bore\'s lock will snap the bit. The coil is in Depot Three of the Quarry, guarded by a Carillon Legionnaire. He also wants Tobiah Marsh\'s charts. The quarry headframe is north of his hut.'] };
      }
      if (g.has('coil') && !g.flags.coil_done) {
        g.flags.coil_done = true; g.flags.rite_ready = true; g.give('pass');
        let t = 'You got it out past the bell. Good. Keep the coil; it goes down in your bag, not mine — the Factor searches me at the casing. Here: the Consortium\'s pass. It opens the shaft gate from the quarry to the Root-vault. On Hearthday, when the Church is holding its note, go down and seat it in the lock while they are all looking at Lyra. I will be the hand at the wire.';
        if (g.has('charts')) t += ' And the charts. Revision Seven, with the margin. On failure of the hold, slippage is to be absorbed by the source. You understand what that means? She is not the steadying hand. She is the fuse.';
        return { text: t, journal: ['main', 'Kaelen gave me the Consortium pass. On Hearthday I must take the shaft from the Quarry to the Root-vault and seat the coil in the bore\'s lock during the Rite. Lyra will sing against the bore; Kaelen will be the hand at the wire.'] };
      }
      if (g.flags.coil_done) return { text: 'Hearthday. Go down by the shaft; the pass opens it. I will be at the casing with the needle, and my hands will be shaking, and that is all right. Seat the coil. Then run.', journal: null };
      return null;
    },
  },
  hetty: {
    name: 'Hetty Bram of the Boar & Dulcimer', sprite: 'hetty', portrait: 'hetty', tier: 'low',
    greet: { polite: 'Sit anywhere that isn\'t broken. Small beer or smaller. We do not sing in here, not since Davin.', normal: 'Beer\'s a copper. Rooms are a sovereign. Singing is free and it will get you killed.', blunt: 'I\'ve put bigger men than you out of here for raising their voice. Sit.' },
    topics: { 'The Drift-Kestrel': 'Her captain drinks in the corner and laughs too loud at nothing. His crates for the garrison are in my cellar. Last night I went down for a cask and I swear to you one of them said a name.' },
    quest: (g) => {
      if (!g.flags.hetty_crates) { g.flags.hetty_crates = true; return { text: 'You look like you\'ve a steady head. Go down to my cellar and listen at the corsair\'s crates. Tell me I am an old woman hearing things. Please tell me that.', journal: ['side', 'Hetty Bram thinks the skyship captain\'s crates in her cellar are talking. She asked me to listen at them.'] }; }
      if (g.flags.crates_heard && !g.flags.hetty_paid) { g.flags.hetty_paid = true; g.gold(20); return { text: 'Names. Children\'s names. Gods. — Here. Twenty sovereigns, and it isn\'t for the listening, it\'s for the forgetting. Go and talk to the corsair. Make him hear them too.', journal: ['side', 'The crates in Hetty\'s cellar hold glass cores, and they say names. She paid me twenty sovereigns and wants the corsair to hear them.'] }; }
      return null;
    },
  },
  vane: {
    name: 'Captain Vane of the Drift-Kestrel', sprite: 'vane', portrait: 'vane', tier: 'high',
    greet: { polite: 'Every sailor dies, friend. The trick is to be somewhere else when it happens. Sit; I\'m buying, because I\'m frightened.', normal: 'Corsair, Rust Coast, retired from the sea on account of the sea. What\'ll you have?', blunt: 'Ha! You have the look of somebody about to tell me something I already know and have been drinking not to hear.' },
    topics: {
      'The Drift-Kestrel': 'Bought with money I\'d rather not discuss, from people I\'d rather not name. She holds eighteen if nobody\'s fat and she lifts with three tanks.',
      'Vox-bottles': 'I carry one. Labelled with a name I won\'t say. Almost certainly a fake. I have never unstopped it, and I think about it every night.',
      'The Catalogue': 'Twelve crates of replacement cores for the quarry garrison. I don\'t ask what\'s in them. I have been very carefully not asking for two years. It is a skill.',
    },
    quest: (g) => {
      if (g.flags.crates_heard && !g.flags.vane_told) { g.flags.vane_told = true; return { text: '...Annet Sowerby. Six years old. She asked the Carder boy his name through the side of a crate. — I know. I\'ve known since the first run. One thousand three hundred and forty-two, if anyone\'s counting, and someone is. Right. Right. We are not delivering. If this town comes apart on Hearthday — and towns do, I have seen it — the Kestrel is at the mooring mast, and she takes children first, four to a line. Tell the Cantor.', journal: ['side', 'Captain Vane admitted he has carried stolen glass cores for the Catalogue for two years. He will not deliver these. If Oakhaven falls on Hearthday the Drift-Kestrel will lift from the mooring mast, children first.'] }; }
      if (g.flags.vane_told) return { text: 'Children first, four to a line. I\'ll be at the mast. Go and do your clever thing in the ground, and when it goes wrong — it will go wrong — run toward the ship, not away from the trees.', journal: null };
      return null;
    },
  },
  rooke: {
    name: 'Surgeon-Grafter Anselm Rooke', sprite: 'rooke', portrait: 'rooke', tier: 'high',
    greet: { polite: 'I have cut more limbs than any butcher in the Reach and done every one with care. Sit. I will not chalk your door today.', normal: 'The sap-mark means past cutting. Now it also means the Inquisitor\'s list. Keep that to yourself.', blunt: 'Lower your voice in my surgery or I will lower it for you with a needle.' },
    topics: { 'The Grafters': 'The Synod sends the saws. I hold them. Somebody has to hold them who will stop when the patient asks. The Inquisitor has asked for my list of sap-marks. I have been slow to find it.' },
    quest: (g) => {
      if (!g.flags.rooke_boots) { g.flags.rooke_boots = true; g.give('boots'); return { text: 'A favour, and a quiet one. These were Davin Hale\'s boots. His mother is rooted into her chair on the lane behind the tannery and cannot come for them. Take them to her. Do not sing. She may ask you to. Do not.', journal: ['side', 'Surgeon-Grafter Rooke gave me Davin Hale\'s boots to carry to his mother Orla, who is rooted into her chair in the house behind the tannery.'] }; }
      if (g.flags.boots_delivered && !g.flags.rooke_thanks) { g.flags.rooke_thanks = true; g.give('tonic'); g.give('tonic'); return { text: 'She has them. Good. I could not cross her floor; I have tried. Take these; Bettany\'s, not mine. Mine are for cutting.', journal: null }; }
      return null;
    },
  },
  orla: {
    name: 'Orla Hale', sprite: 'orla', portrait: 'orla', tier: 'low', scale: 0.8,
    greet: { polite: 'Come closer, I cannot turn. Are you here about Davin?', normal: 'Mind the roots on the floor. They are mine.', blunt: 'I am a tree with a tongue; shout at me if you like, I cannot leave.' },
    topics: { 'Oakhaven': 'I heard my son sing my harvest song at the Boar. And then I heard it sung back by something with nobody inside it. All the lines. Even the fourth.' },
    quest: (g) => {
      if (g.has('boots') && !g.flags.boots_delivered) { g.flags.boots_delivered = true; g.take('boots'); return { text: 'His boots. He had big feet for a boy. — Will you sing it? The harvest song. Just the first line. I would like to hear it from a mouth that has somebody in it. ...No. No, you are right. Lyra promised she would sing me down proper, before the fire. That is enough. Thank you for the boots.', journal: ['side', 'I gave Davin\'s boots to Orla Hale. She asked me to sing, and I did not.'] }; }
      return null;
    },
  },
  pim: {
    name: 'Pim Carder', sprite: 'pim', portrait: 'pim', tier: 'low', scale: 0.75,
    greet: { polite: 'Shh. Mam says I\'m not to talk to anybody about my hands.', normal: 'I\'m not supposed to be out. Don\'t tell.', blunt: '...' },
    topics: { 'The Hedge': 'Something whistled my whistle from the culvert. Only me and Lyra know my whistle. I didn\'t go. I nearly went.' },
    quest: (g) => null,
  },
  vosk: {
    name: 'Factor Adela Vosk, Consortium of Bores', sprite: 'vosk', portrait: 'vosk', tier: 'high',
    greet: { polite: 'Pitch has a colour, through these lenses. Yours is an unremarkable brown. State your business.', normal: 'The Consortium pays this town\'s bread. Remember that before you speak.', blunt: 'I have Legionnaires. You have a voice. One of those is replaceable.' },
    topics: { 'The Rite': 'Stage Nine. Source: Cantor, local, one. Collar: standard. Wire: standard. It is a procedure, not a sacrifice. The Church likes the robes; we like the yield.', 'The Root': 'A resource. It will yield without limit if correctly relieved. That is the Arbiterium\'s phrasing, not mine, and I confess I do not entirely follow it.' },
    quest: (g) => null,
  },
  aldric: {
    name: 'Governor Aldric Vance', sprite: 'aldric', portrait: 'aldric', tier: 'high',
    greet: { polite: 'The seal of Queen Maelis bids you welcome. Her signature on the decrees is famously steady for a woman dead a hundred and forty years.', normal: 'Yes? Be brief. I have the Factor at one shoulder and the Church at the other.', blunt: 'You sold them, my son says. I fed them, I say. Which of us do you think is lying?' },
    topics: { 'Governor Vance': 'In the Cascade famine I had a town and no bread. The Consortium had bread and wanted a hole. I made the arithmetic. I have been making it ever since.', 'Kaelen Vance': 'My son thinks penance is a thing you do alone, in a hut, in the smoke. It is not. It is a thing you do in a room full of people who need feeding.' },
    quest: (g) => null,
  },
  tobiah: {
    name: 'Junior Engineer Tobiah Marsh', sprite: 'tobiah', portrait: 'tobiah', tier: 'high',
    greet: { polite: 'Night shift. Keep it under the pumps and the bells won\'t turn. Are you — are you with him? With Engineer Vance?', normal: 'Nobody comes down here who isn\'t on the roster. Which you aren\'t.', blunt: 'Quiet! The Legionnaire in Depot Three walks when it hears boots.' },
    topics: { 'The Quarry': 'I learned the Vance Sequence at fourteen. I asked its author to sign my copy. He did. Then he looked at it for a long time and told me to keep the charts somewhere the Factor would not look.' },
    quest: (g) => {
      if (!g.flags.tobiah_met) { g.flags.tobiah_met = true; g.give('charts'); return { text: 'Take them. The charts, and my copy, Revision Seven, with the margin he wrote in. If he wants them he can have them; I signed on to drill, not to — not to whatever Stage Nine is. The coil he wants is in Depot Three, past the pump-hall. The Legionnaire there murmurs about a blue jug. Don\'t listen to it long.', journal: ['main', 'Tobiah Marsh gave me his charts and the margin copy of Revision Seven. Depot Three lies past the pump-hall.'] }; }
      return null;
    },
  },
  bettany: {
    name: 'Bettany, midwife and tonic-maker', sprite: 'bettany', portrait: 'bettany', tier: 'low',
    greet: { polite: 'Softly, love. What ails? I have tonic, I have honey for the throat, and I have shot, which I do not approve of and sell anyway.', normal: 'Tonic\'s five. Honey\'s four. Shot\'s three the three. Keep your voice down while you count.', blunt: 'I hummed half this town into the world. I will not be barked at in my own stall.' },
    topics: { 'Oakhaven': 'I have hummed forty-one births through a clay jar so the hounds would not hear the mother. Forty-one. I keep the count on the stall-post, under the cloth.', 'The Rite': 'They walked her past my stall this morning in white. I put a jar of honey in her hand. The proctor took it off her before the corner.' },
    shop: [{ item: 'tonic', price: 5 }, { item: 'honey', price: 4 }, { item: 'pellets', price: 3 }],
    quest: () => null,
  },
  tam: {
    name: 'Old Tam, the night-hummer', sprite: 'tam', portrait: 'tam', tier: 'low',
    greet: { polite: 'Sit if you like. She comes on the water about this time. You will hear her if you keep still.', normal: 'Hm. You are standing where I listen.', blunt: 'Lower your voice. She will not come if you shout.' },
    topics: { 'The Flume': 'My Essa went in at the sluice in the Cascade year. The water took her the way it takes everything. Three nights ago it brought her voice back up the Flume, singing The Miller\'s Daughter, which is ours. Mine and hers.', 'The Hedge': 'Everyone says never answer it. I know what they say. I say she gets the second verse right, and the Hedge could not know the second verse.' },
    quest: (g) => {
      if (g.flags.tam_told || g.flags.tam_left) return null;
      if (!g.flags.tam_met) { g.flags.tam_met = true; return { text: 'You have a listening face. Good. Then listen, and tell me honest: when she sings up the Flume of a night, is it her? Rooke says it is not. Lyra will not say. You are a stranger; you have no reason to be kind to me. Is it her?', journal: ['side', 'Old Tam listens to his dead wife\'s voice on the Flume at the crossing. He asked me, a stranger, to tell him honestly whether it is her.'],
        choices: [
          { t: 'It is not her. It is something wearing her voice.', f: (g) => { g.flags.tam_told = true; return 'He is quiet for a long time. "The second verse," he says at last. "It learned the second verse off me. I sang it to the water the first night, to see." He stands up, old knees, and does not look at the Flume. "Thank you. I will not come down here again. If something has to go singing into the meadow some night, to pull the hounds, it had better be a man who knows the whole song."'; } },
          { t: 'If she gets the second verse right, who am I to say.', f: (g) => { g.flags.tam_left = true; return '"That is what I think," he says, and he settles back onto the stone, and turns his good ear to the water, and you leave him there. Behind you, very faintly, something on the Flume begins the second verse.'; } },
          { t: 'Say nothing, and sit with him a while.', f: (g) => { g.flags.tam_sat = true; g.flags.tam_told = true; return 'You sit. The water comes green and quick under the bridge. After a while a woman\'s voice comes with it, sweet and exactly right, and you feel the old man beside you go still, and then you feel him understand, because you have not moved, and a stranger who had heard his wife would have moved. "Ah," he says. "Ah. Well." He gets up and goes home.'; } },
        ] }; }
      return null;
    },
  },
  hob: {
    name: 'Hob Wendle, tanner', sprite: 'hob', portrait: 'hob', tier: 'low',
    greet: { polite: 'Evening. Mind the vats; the lime does not care who you are.', normal: 'Tannery\'s shut. Nobody wants leather off a town that is turning to wood.', blunt: 'I have buried two apprentices this year. Try me.' },
    topics: { 'The Hedge': 'The twins went down the culvert after their dog. Driftday last. I set a lamp in their window of a night. The key to the grate is on the nail inside; I have not had the stomach to turn it.', 'Oakhaven': 'A tannery is the one trade that gets quieter the harder you work it. Should have been safe. Should have been.' },
    quest: (g) => {
      if (g.flags.twins_found && !g.flags.hob_told) { g.flags.hob_told = true; g.gold(10); return { text: 'You went down. You — their coats. Folded. They folded their coats.' + (g.flags.twins_named ? ' And you wrote them in your book, Joss and Wyn, so they are somewhere. Here. It is all I have on me. Take it, and do not argue with a tanner.' : ' Take this. Take it. I cannot go down there, and now I do not have to.'), journal: ['side', 'I told Hob Wendle what I found under the culvert. He paid me, which I did not ask for, and put out the lamp in the twins\' window.'] }; }
      return null;
    },
  },
  nell: {
    name: 'Nell Carder', sprite: 'nell', portrait: 'nell', tier: 'low',
    greet: { polite: 'He is not to be looked at. Whoever you are. He has a cough.', normal: 'The mill is shut. Say what you want through the door next time.', blunt: 'Get out of my mill.' },
    topics: { 'Oakhaven': 'The Grafters posted the inspection on the Greenhall door. Every child under twelve, hands and feet, Rootday week. Rooke chalks the mark. After the mark they come for you with the saw, and they are kind about it.', 'The Rite': 'Lyra hummed him through the night it started. Spent her whole voice on his hands. She had nothing left for Orla Hale in the morning, and Orla put out roots in her chair while Lyra sat there with her mouth open and nothing coming out.' },
    quest: (g) => {
      if (g.flags.pim_safe) return null;
      if (!g.flags.nell_met) { g.flags.nell_met = true; return { text: 'You have seen his hands, then. Yes. Roots. Rootday. The inspection is the day after tomorrow and Lyra has no voice left to hum him through it a second time, and Bettany is out of honey for the throat. Oiled honey, a jar of it, and Lyra could do it. Or a Cantor could. You are not a Cantor.', journal: ['side', 'Pim Carder has put out roots in his hands. Nell needs oiled honey so Lyra can hum him through the Grafters\' inspection. Bettany\'s stall in the market may have some.'] }; }
      const choices = [];
      if (g.has('honey')) choices.push({ t: 'Give her the oiled honey.', f: (g) => { g.take('honey'); g.flags.pim_safe = true; g.gold(8); return '"Oh," she says, and sits down on the meal-sack. "Oh." She holds the jar in both hands like a warm egg. "Lyra will come tonight. He will pass. He will pass and we will be on the corsair\'s ship before the Rite and nobody will ever chalk his hands." She presses coin on you and will not hear no.'; } });
      if (g.player.songs.includes('tending') && g.player.voice >= 8) choices.push({ t: 'Hum the tending note over his hands yourself.', f: (g) => { g.player.voice -= 8; g.flags.pim_safe = true; g.flags.pim_tended = true; return 'You kneel and hum it low, inside the Narrow, the way the orchard-cantors did it, and the roots in the boy\'s palms draw back under the skin like worms from light. He watches your mouth the whole time. "You do it different from Lyra," he says. Nell does not say anything. She has her apron over her face.'; } });
      if (!choices.length) return { text: 'Honey. Oiled honey, a jar. Bettany at the market. Please.' };
      return { text: 'Well?', choices };
    },
  },
  ignatius: {
    name: 'Ignatius Crane, Flambeau of the Pure Note', sprite: 'flambeau', portrait: 'flambeau', tier: 'high',
    greet: { polite: 'The Note is held. You may speak under it. Quietly, and in tune.', normal: 'This chapel had bells once. The Synod took them for bore-teeth, and it was right to. A bell is a voice with nobody inside it.', blunt: 'I have burned men for less than that tone. I am tired, and the Note is long, and you will not try me again.' },
    topics: { 'The Church': 'Seven years I have held that it let go because one voice shouted. Vance\'s voice. The engineer says it let go because we held. I have thought about his answer every night since he gave it. I do not know yet which of us I would rather be right.', 'The Rite': 'The warrant is read. The Pure Note is held over Oakhaven day and night until the casing. The Hollow in the quarry is to be burned at the hour of the Rite. The Cantor is in the Church\'s protection, which is a phrase I chose myself, and I meant it, and it is a cell.', 'Kaelen Vance': 'He has a glass arm that sings with the Note whether he wills it or not. I envied him that, for a moment, before I remembered what it is doing to him.' },
    quest: (g) => {
      if (!g.flags.ignatius_met) { g.flags.ignatius_met = true; return { text: 'You are the one who goes in and out of the quarry with the engineer\'s charts in your shirt. Do not look at your shirt. I do not want the charts. I want you to know that I know, and that I have chosen, for reasons I will give to my god and not to you, to hold the Note and look at the ceiling.', journal: ['main', 'The Flambeau, Ignatius Crane, knows about the charts and has chosen not to act. The Church holds the Pure Note over the town until the Rite.'] }; }
      return null;
    },
  },
  townsman: {
    name: 'Oakhaven orchardman', sprite: 'townsman', portrait: 'townsman', tier: 'low',
    greet: { polite: 'Evening. Keep it low.', normal: 'Hm?', blunt: 'Lower your voice before something hears you.' },
    topics: {}, quest: () => null, rumour: true,
  },
  townswoman: {
    name: 'Oakhaven goodwife', sprite: 'townswoman', portrait: 'townswoman', tier: 'low',
    greet: { polite: 'Blessings of the Narrow on you. Softly, now.', normal: 'Yes? Quietly.', blunt: 'Hush! The children.' },
    topics: {}, quest: () => null, rumour: true,
  },
  sable: {
    name: 'Sable, Archivist of the Veil', sprite: 'sable', portrait: 'sable', tier: 'high',
    greet: { polite: 'Entry: a stranger, polite, at the wrong end of the continent. Sit.', normal: 'I am a list, not a cure. Say what you came to say.', blunt: 'Precision, please. I record everything.' },
    topics: { 'The Catalogue': 'I did not merely sign the catalogue. I designed the harvest schedule. I made it efficient. That is what I was good at.' },
    quest: () => null,
  },
};

// ---- intro & ending texts --------------------------------------------------
const INTRO = [
  'It is autumn, in the four hundred and nineteenth year of the Synod Reckoning. Seven years ago the Light let go.',
  'You have come up the Greenroot road to Oakhaven, capital of the Resonant Reach, a town that lives inside a hedge three men deep of thorn and packed wool, planted to swallow its own sounds.',
  'Too loud brings the hounds. Too still brings the Hush. Every child here can skip to the rhyme.',
  'The Church is coming up the road behind you, singing under glass-fire. In nine days it will hold its Pure Note over this town, and a Cantor will be walked down a shaft in white to sing a god to sleep.',
  'Nobody has rung a bell in Oakhaven since the Synod took them all for bore-teeth. Tonight is Nullday, the old rest-day, the day people fear.',
  'Keep your voice in your chest.',
];

const HELP_TEXT = `MOVE  W A S D / arrows · turn with mouse-drag or ← →
RUN   hold Shift (loud)
ATTACK  left-click, or click-and-drag to swing · 1-4 select weapon · Tab opens song-book
USE / TALK  E or Space · doors, people, levers, items
SONGS  F1-F5 cast the song in that slot · N to murmur (keeps the Hush off)
PANELS  I inventory · C character · L logbook · M map · R rest · K ledger · Esc closes
SAVE  Esc (or the SAVE button) opens Options: save to a session slot, or copy a save code to keep
THE NARROW  the amber bar — keep it between the two marks. Above: hounds. Below: the Hush.`;
