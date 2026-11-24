# Phase 124: the portrait prompts, one for each face still to paint

24 November 2026. Made from `Phase 124 - the looks of everyone who borrows a face (a reader's brief).md` by a reader, then checked by the Commander: every book quotation in the brief was looked up in the books (63 quotations; the eleven the check could not match by machine were read by eye and are the bibles' own lines with their italics, or lines quoted from the game's code); every word in a prompt that its entry in the brief does not contain was listed and read. Two things were struck as inventions this world does not have: a wooden cross on Abbess Coriel and a rosary on Sister Clemence. Pennick is set to about twenty-two ("the boy" in Book One, manuscript l. 1657; twenty-four at his death, Book Three Part One l. 557).

The machine-readable list is `tools/faces/PROMPTS.tsv` (id, name, the brief's line, the true age, whether the books describe the person, the subject, and what was left out and why). Those already painted are in `tools/faces/MANIFEST.tsv` with their seeds.

## How to use a prompt in any picture tool

Ask for a square picture. The whole prompt is the fixed opening, the person's subject, and the fixed closing:

> Close-up head-and-shoulders bust portrait, a muted realistic oil painting for a grim low-fantasy role-playing game. The face fills the upper two thirds of the picture, cropped at the upper chest. Subject: **<the subject below>** Facing the viewer, centred. Plain, nearly black, dark warm brown background with nothing in it. Soft light from the upper left, earthy muted colours, soft painterly brushwork. No text, no lettering, no border, no frame.

- **Ages are worded older than they are meant**, because the tool that was used paints people young. The true age is given beside each person. In a tool that paints ages truly, use the true age.
- A bust this size cannot show what is held in the hands, so hand-held things were left out; the TSV says what, for each.
- The picture is brought down to 96 by 96 and saved as `img/p_own_<name>.jpg`, with one row in `FACES124.OWN` (`js/faces124.js`); `test/own124.test.js` checks it.
- Before a person is painted, their entry is read once more against the code and, where the books describe them, the book.

## The named people (93)

### Garrow Finch, quarry hauler (`p11_dicer`)
True age: 38. In the books: no.

Subject: a thick-necked quarry hauler in his early forties, shoulders hunched into a canvas collar. Cropped black hair with fine grey quarry dust still in it. A flattened nose broken once, black stubble, quick dark eyes that watch the hand rather than the face, and a half-grin that never reaches the eyes. A loose canvas coat with a bulging lapel.

### Nessa Tolliver, ferrywoman (`rounds`)
True age: 36. In the books: no.

Subject: a weathered river ferrywoman in her early forties, one eyebrow raised. Dark black-brown hair in one thick, wet-looking braid over her left shoulder. Sun-and-wind-reddened cheeks, light hazel eyes narrowed as if reading a hand across a table. A stiff oilskin collar turned up over a salt-stained shirt.

### Bethan Marl, neighbour to the Tarrows (`p13h_wenna`)
True age: 55. In the books: no.

Subject: a stooped, guarded neighbour woman in her early sixties, lined and weary. Grey-brown hair in two thin plaits pinned flat over a dark kerchief. Heavy-lidded eyes shadowed by sleepless nights, a downturned mouth, a long chin. A faded blue shawl drawn shut at the neck, and a small iron door-key hanging on a cord round her neck.

### Agnes Tull, the baker's wife (`p29_agnes`)
True age: 45. In the books: yes.

Subject: a worn-out baker's wife in her early fifties, lined and tired. Dishwater-blonde hair in a loose knot, half undone, grey at the roots. Reddened, puffed eyes with purple shadows, a smile put on out of habit, wet tracks cut through the flour on her cheeks, and a faint streak of flour on her forehead.

### Ambrose Vettle, chandler (`p29_ambrose`)
True age: 55. In the books: no.

Subject: a narrow, tight-lipped village chandler in his early sixties, lined and pinched. Sparse grey hair combed in thin strands across a freckled scalp. A long nose, pinched cheeks, sharp light eyes. A tallow-stained brown apron over a collarless shirt, and a stub of unlit candle tucked behind one ear.

### Sim Fletch, tannery hand (`p29_sim`)
True age: 25. In the books: no.

Subject: a lanky young tannery hand of twenty-five, shoulders drawn up as if against a noise. Sandy hair cropped short and uneven, flecked with lime dust. A long freckled face, anxious pale-green eyes, a tuft of grey wool pushed into one ear. A bleached canvas smock with the neck stained green-brown.

### Moll Fletch, tannery hand (`p29_moll`)
True age: about 30. In the books: no.

Subject: a solid, stern tannery woman of about thirty-five, her head tilted slightly as if hearing something through a wall. Black hair cropped to the jaw and tied back in a stained rag. Strong dark brows, steady brown eyes that are unsurprised, a straight mouth, a square set to the shoulders in a plain work shirt.

### Anselm Fenn, Consortium clerk (`p15l_clerk`)
True age: about 40. In the books: no.

Subject: a neat, bloodless clerk of about forty-five. Fair, thinning hair combed flat with oil. Clean-shaven, with a long upper lip and a pale, narrow face, round steel spectacles that make his pale eyes smaller. A high-collared grey coat with a stock tied tight at the throat.

### Dessa Quill, letter-writer (`p16h_dessa`)
True age: about 35. In the books: no.

Subject: a thin, wide-awake letter-writer of about forty, with violet shadows under her eyes. Very dark hair pulled back hard and pinned, a quill tucked behind one ear. A sharp nose, a determined thin mouth, steady grey eyes. A black wool shawl over a plain grey bodice.

### Reeve Alder Mossbrook (`p16h_mossbrook`)
True age: 66. In the books: yes.

Subject: a heavy, careful old reeve in his mid-seventies, wrinkled and tired. Thick white hair brushed back from a high forehead, with wide white side-whiskers. Heavy, drooping lids over tired brown eyes, a slow mouth, loose jowls. A dark broadcloth coat with a plain pewter chain of office across the chest.

### Ines Tarn, night clerk (`p16h_ines`)
True age: about 28. In the books: no.

Subject: a gaunt young night clerk of twenty-eight, eyes ringed with fatigue, glancing sideways toward a door. Mouse-brown hair tied low at the nape, strands escaping. A small, pale, pointed face, chapped lips. A thin grey bodice, and a green eyeshade pushed up on her forehead.

### Steward Merrin Oake, Timber Compact (`p16h_steward`)
True age: about 50. In the books: no.

Subject: a weather-cured timber steward in his late fifties, lined and weathered, with a short square grey-brown beard cut straight across. Grizzled, clipped hair. Dark, level eyes under heavy brows, a thin clenched mouth. A worn wool coat with a leather yoke at the shoulders, sawdust at the collar, a ribbon of green on the lapel.

### Reeds-Miner Tomas, timber-cutter (`p9_tomas`)
True age: 45. In the books: yes.

Subject: a blunt, kind-faced timber-cutter in his early fifties, weathered, with sawdust in his eyebrows. Dark brown hair going grey under a shapeless wool cap. A broken-veined nose, a short bristled beard, brown eyes that look straight at you without a flicker. A coarse canvas coat.

### Ilse Brennan, Cantor-Master (`lib_ilse`)
True age: 78. In the books: yes.

Subject: a small, bent old choir-master of eighty-six, wrinkled, her face worn thin as paper. Thin white hair drawn back under a plain linen cap. Long lines run down from the nose, with sharp, patient grey-blue eyes and a mouth closed for good. A dark gown with a plain white collar.

### Lissa Merrow (`p30_lissa`)
True age: child, 11. In the books: yes.

Subject: a child of about eleven, a thin girl, very still. Straw-fair hair in a single plait over one shoulder. A serious face, unafraid grey eyes, and an expression of perfect, terrible calm, the mouth quiet and level. A faded blue pinafore over a plain shirt, the collar neat.

### Hob Wendle, field-hand (`p30_hob`)
True age: 40. In the books: yes.

Subject: a big-shouldered field-hand in his mid-forties, sheepish, looking down and slightly away. Thick, sun-bleached brown hair in need of a cut. A broad, open, freckled face, soft hazel eyes, an embarrassed half-smile. A rough shirt open at the neck with a few fine white root-threads showing at the collar, a blanket pulled up around the shoulders.

### Umber, a runaway of the Veil (`umber`)
True age: about 25. In the books: no.

Subject: a young record-keeper in a dark robe, a woman of twenty-five, pale, careful, a little hunted. Ash-brown hair in a straight chin-length bob with a ruler-straight fringe, damp with mist. Ink-dark eyes, a precise thin mouth. The robe cowl pushed back, loose pages showing under her coat at the breast.

### Godwin Pettigrew, lamplighter (`n28_lamplighter`)
True age: about 60. In the books: role only.

Subject: a spare, hurrying lamplighter in his late sixties, wrinkled, glancing aside at the dusk. Short white stubble under a flat cap with the ear-flaps tied up. A narrow sunken face, deep creases at the eyes, small bright eyes. A soot-grey coat with a brass-buttoned collar.

### Bastien Corvo, pedlar of Cantabile broadsheets (`moor_bookseller`)
True age: about 40. In the books: no.

Subject: a lean, ink-stained pedlar in his mid-forties with a ready mouth. Oiled black hair combed back, a narrow pencil moustache, a pencil stub in his hat-band. Quick dark eyes, one brow permanently up. A moss-green river coat with a loose collar and a cravat tied carelessly.

### Abel Sedge, turf-cutter (`p29_abel`)
True age: about 60. In the books: no.

Subject: a sun-cured turf-cutter in his late sixties whose lined face is the colour of old turf. Iron-grey hair flattened by a hat he has just taken off. Sunken cheeks, grey stubble, narrowed eyes that have looked at distance all his life. A neckerchief knotted over a coarse shirt, a few blades of cut turf stuck to the shoulder of his coat.

### Mother Hurst (`p29_hurst`)
True age: about 75. In the books: no.

Subject: a tiny, sharp old woman in her early eighties, her face folded in a thousand creases. Thin white hair like thistledown under a faded blue mob-cap. Bright black eyes, a toothless pursed mouth, a small pointed chin. A dark shawl crossed over the chest of a hearth-warmed gown.

### Jem Cotter, shearer (`p29_jem`)
True age: about 45. In the books: no.

Subject: a wary, thick-necked shearer in his early fifties, lined, with his eyes cast sideways as if watching a door. Sandy-red curling hair with grey wool-fluff snagged in it. A broad red face, rust-red stubble, pale blue eyes ringed white with watchfulness. A greasy leather jerkin over a shirt.

### Tamar Farrant, shepherd (`p22_tamar`)
True age: about 45. In the books: no.

Subject: a hard, weathered shepherd woman in her early fifties who has made a decision and stopped discussing it. Brown-grey hair, wind-whipped, tied under a faded straw-yellow kerchief with flecks of white wool in it. A square jaw, a sunburnt nose, tired pale-green eyes. A wool-oiled jacket in ochre-tan.

### Gideon Thrale of the Bellwether (`p22_gideon`)
True age: about 50. In the books: no.

Subject: a rueful, stocky innkeeper in his late fifties, lined, with a faint smoke-smudge on one cheek. Thinning auburn hair with ginger-and-grey sideburns. A crooked half-smile, droll brown eyes that agree with whatever criticism you have not yet made. A russet waistcoat over a shirt with the neck open, a bar-cloth over one shoulder.

### Ennis Crowle, beekeeper (`p29_ennis`)
True age: 55. In the books: yes.

Subject: a calm, quiet-voiced beekeeper woman in her early sixties, her whole lined face gentle with listening. Pale grey-white hair in a low braid under a wide straw hat with its veil pushed back over the brim. Soft brown eyes lowered and half shut, a faint private smile. A cream linen smock.

### Tobit Dree, lockkeeper (`p16f_pellam`)
True age: about 50. In the books: no.

Subject: a heavy-lidded lockkeeper in his late fifties, lined, with a shaven, shining head and a sly half-smile. Thick neck, big stubbled jaw, pale eyes that seem to be weighing your purse. A slate-blue shirt open at the collar, a heavy iron key on a leather thong against his chest.

### Madge Tallow, fence (`p16f_madge`)
True age: about 55. In the books: no.

Subject: a shrewd, stout woman in her early sixties who has already priced your coat, lined. Black hair with one broad white streak at the left temple, bundled under a plum-coloured headcloth. A heavy chin, small hard black eyes, pursed lips. A plum bodice with a brass-buttoned collar, a jeweller's loupe on a cord against her chest.

### Barnaby Haft, Timber Compact cutter (`p16f_orrin`)
True age: about 35. In the books: no.

Subject: a worried, broad-backed timber cutter of about forty. Cropped reddish-blond hair with a pale scar through one eyebrow, and a wage-ticket pinned in his cap-band. A short ginger beard, rough pink cheeks, worried blue eyes. A green-tinged canvas jacket with sawdust on the shoulders. A plain, honest, sunburnt face.

### The wharf hand (`p16f_hand`)
True age: about 30. In the books: no.

Subject: a lean wharf labourer of about thirty-five, face sun-dark and squinting. Black hair tied back with a twist of tarred cord. A short black beard, a missing front tooth showing in a lazy half-smile. A grey-green shirt stained dark at the collar with river water, a splinter of plank held between his teeth.

### The raft-wife (`p16f_wife`)
True age: about 40. In the books: no.

Subject: a thin, cold, unbeaten woman of about forty-five. Dark brown hair streaked with early grey, tied in a knot under a blue-grey shawl pulled over her head. Chapped red cheeks, sharp grey eyes under a creased frown, a tight mouth. A grey blanket clutched round her shoulders.

### Gil Wade, punt-poler (`p29_gil`)
True age: about 45. In the books: no.

Subject: a tall, rangy punt-poler in his early fifties, rawboned, who reads the water like a page. Thin grey-blond hair, wet through, plastered flat. A long weathered face, a drooping grey moustache, calm pale eyes. A sodden grey-green shirt, the collar dark with water, a dark tide-mark rising up the coat.

### Ysolde Marrow, salvager (`p29_ysolde`)
True age: about 40. In the books: no.

Subject: a tough, damp-haired salvager woman of about forty-five with an eye for brass. Russet hair cropped ragged at the jaw. A freckled snub-nosed face with a dry mouth, grey-green eyes that say she has already been upstairs. A plum bodice, black with wet to the collarbone.

### Corvin Ash, smuggler (`p29_corvin`)
True age: about 35. In the books: no.

Subject: a narrow, cat-footed smuggler of about forty with his eyes slid to the side. Oily black hair beneath a low grey hood pushed half back. A hawk nose, a thin dark moustache, a thin lipless smile, a short pale scar across the chin. A grey-green coat buttoned to the chin.

### Prue Lettice, broadsheet-seller (`p29_prue`)
True age: about 32. In the books: no.

Subject: a bright, sardonic broadsheet-seller of about thirty-seven with a half-smile saying she knows what you will not believe. Dark blonde hair in a short blunt cut under a plum cap. A narrow clever face, hazel eyes, ink at the corner of her mouth and a pinch of black type-ink on the tip of her nose. A plum bodice.

### Odile Quayle, book-runner (`lib_odile`)
True age: about 38. In the books: no.

Subject: a brisk, amused book-runner of about forty-three, composed to the edge of laughter. Thick dark curls pinned up under a flat linen cap. Broad cheekbones, sly dark eyes, a long smile. A tight mouse-grey bodice, a pair of thin reading-spectacles on a cord at her chest.

### Marl Dunning, bass (`p17n_marl`)
True age: about 55. In the books: no.

Subject: a big-chested bass singer in his early sixties, sitting very upright with his eyes open. Close-cropped head, grey at the sides, a heavy brow, a broad, calm nose. A slack, patient mouth, deep lines at the throat. A cool slate-blue wool smock, a tuning-fork shining at his belt.

### Tansy Quill, apprentice (`p17n_tansy`)
True age: about 17. In the books: no.

Subject: a thin, round-eyed girl of seventeen, shivering. Chestnut hair, chin-length and tousled, tucked into a hooded blue-grey cowl, a ring of frost along the hairline. Frost on her lashes, a red chilled nose, a small anxious mouth. A wool scarf wound up to her chin.

### Jory Fenn, lamplighter (`p17n_jory`)
True age: about 45. In the books: no.

Subject: a lined, practical lamplighter in his early fifties with a smear of soot on his forehead. Short ginger hair gone dusty under a rust-brown cap. A weathered jaw, kind grey eyes, a dry half-smile of someone who finally has a reason. A rust waistcoat over a plain shirt.

### Oswin Marl, Veil ledger-keeper (`p15l_veil`)
True age: about 60. In the books: no.

Subject: a dry, neat old clerk in his late sixties. Snow-white hair in a monk's fringe round a bald crown. A long, folded face like a closed ledger, small black eyes, bloodless lips, wire-rimmed half-spectacles low on the nose. A black coat buttoned to a white neckband.

### Amos Fell, the Hollow sexton (`sexton`)
True age: about 65. In the books: no.

Subject: a stooped old gravedigger in his early seventies, eyes open on nothing, a smear of fresh black soil across the forehead. Grey hair, matted and clay-streaked, a few strands under a ragged hood. A heavy jaw with grey stubble, dull sunken brown eyes. A torn smock stiff with grave-earth.

### The lamplighter, a Hollow (`lamplighter`)
True age: about 70. In the books: yes.

Subject: an old lamplighter of about seventy-eight with a gentle, lowered, hopeful face. A thin white halo of hair around a bare, age-spotted crown. Pale slack lips parted as if saying the lamps are late, wet eyes that keep waiting. Faded grey-blue cloth, wrinkled and thin.

### Bettis Renn, "A Hollow with a basket" (`bettis`)
True age: about 30. In the books: role only.

Subject: a woman of about thirty-five with a face scrubbed raw by weeping and then emptied. Flax-fair hair chopped short and uneven, as if cut for her. Open grey eyes fixed forward, a mouth set to say second and not saying it. A grey-blue ragged cloth round the shoulders.

### A stray cat of Whisper-Grove (`cat`)
True age: not stated. In the books: no.

Subject: a lean grey female cat, slightly damp, seated in green-white water-light with her chin lifted and one ear turned. Smoke-grey fur with paler grey ruffs, a tufted, torn left ear, wide amber eyes with narrow pupils that judge, and a bead of water on one whisker.

### A man against the wall, the twice-taken man (`p31_twice`)
True age: about 45. In the books: yes.

Subject: a man in his early fifties with his head tipped back against stone, a slack, unshaven face, the lower lip hanging. Dark brown hair going grey, uncombed. Eyes wide open, wet and bright and following you, with nothing behind them. A grey-olive coat with the collar sagging.

### The Hollow with a broom (`p31_sweeper`)
True age: about 60. In the books: role only.

Subject: a bent old woman in her late sixties, a quiet sweeper with the light gone from her face. Grey hair in a long dry plait coiled flat on her head. A mild, pale, soft-chinned face, eyes lowered, lips slack. A faded blue-grey sacking apron, fine dust on the sleeve.

### The Hollow at a window (`p31_jugs`)
True age: about 40. In the books: no.

Subject: a woman of about forty-five with a pleasant plain face smoothed to calm, hollow cheeks and wet grey eyes that are open and empty. Dull auburn hair, unpinned, falling in front of one shoulder. A faded green blouse with a soft collar, the neck bare and pale.

### The Hollow at the shutters (`p31_shutters`)
True age: about 50. In the books: no.

Subject: a heavy-shouldered man in his late fifties with a square, slack face and thick brows. Sparse rust-grey hair cut square across the neck. Grey eyes that look and look again, a loose, heavy mouth, grey stubble. A pale blue-grey shirt, open at the collar, the shoulders thick.

### The Hollow among the shelves (`lib_shelver`)
True age: about 45. In the books: no.

Subject: a slight, bookish man in his early fifties with a narrow intelligent face and ink-stained skin. Neat brown hair, thinning but still parted. Wide wet brown eyes that are open and empty, soft lips moving on a counted word. A faded blue-grey waistcoat over a collared shirt.

### Oona Salt, the Harbour-Queen (`p17c_oona`)
True age: 56. In the books: yes.

Subject: a thick-necked harbour-queen in her mid-sixties, built like a capstan, with wide squared shoulders, weathered and lined. Iron-grey hair cropped short and wind-flattened. A face like a closed fist: heavy jaw, deep creases beside the mouth, small pale sea-grey eyes. An old blue admiral's coat with tarnished brass buttons and a high stiff collar.

### Auld Bessa, the last Reef-Reader (`p17c_bessa`)
True age: 84. In the books: yes.

Subject: a tiny, ancient reef-reader in her early nineties, her face tipped a little to one side as if listening to a far sound. Sparse white hair flying loose from under a faded blue-grey headscarf, sea-spray drying on it. Fine deep wrinkles, a thin mouth that has just remembered a joke, eyes closed, lids thin and veined. A faded grey shawl.

### Marrin Tace, widow (`p17c_tace`)
True age: about 50. In the books: no.

Subject: a neat, restrained widow in her late fifties, lined. Brown-grey hair, smooth, parted in the middle and pinned in a low knot with salt-pale strands at the temples. A long, thin, patient face, brown eyes that look slightly to one side, lips pressed together. A dusty blue-grey bodice, a spotless white collar, a worn tin whistle on a cord at her breast.

### Hesper, of the four houses (`p17c_hesper,p17c_hesper2`)
True age: about 60. In the books: yes.

Subject: a big, slow, soft-faced orphanage keeper in her late sixties, wrinkled, with rounded shoulders. Thick pewter-grey hair in a heavy bun with a stray lock across her cheek. A broad kind face, a double chin, small deep-set brown eyes that have stopped expecting thanks. A dusky rose dress with an apron, flour on the sleeve.

### Mags Tennant (`p17c_mags`)
True age: about 35. In the books: yes.

Subject: a very tall, powerful woman of about forty whose head almost fills the frame, jaw set, with a face like a closed door. Dark brown hair cropped to the collar, wind-cut, no grey. Steady grey eyes, a wide plain mouth. A salt-stiffened blue bosun's coat open over a rough shirt.

### A net-wife on the fifth landing (`p17c_wife`)
True age: about 45. In the books: no.

Subject: a weathered net-mender woman in her early fifties, lined. Fair hair sun-bleached to straw, in a braid pinned up under a sea-green kerchief. A sharp tanned nose, light blue eyes squinting against wind, a dry humorous mouth. A sea-green smock tied at the neck, a netting-needle held between her teeth.

### A child on the Cay (`p17c_child`)
True age: child, 8. In the books: no.

Subject: a child of about eight, small and serious, with a solemn face. Cropped, sandy, ragged hair, as if cut with a knife. A scab on the chin, wide pale eyes, a faint stubborn mouth. A cream smock far too big, the collar loose and the shoulders drooping.

### Kerrow, Harbour office (`p17c_teague`)
True age: about 50. In the books: no.

Subject: a pale, tired harbour official in his late fifties, lined. Iron-grey hair, thin, combed over a spotted dome. Tired, pouched grey eyes that read without blinking, a thin, unhurried mouth. A colourless grey-blue coat buttoned to a flat collar, a faded dues-chit pinned to the lapel.

### Hollis Teel, Free Captain (`p17c_teel`)
True age: about 55. In the books: no.

Subject: a leathery, amused sea-captain in his early sixties, weathered and lined. Black hair going silver at the temples, unruly, under a faded red bandana. A full black-and-silver beard, a broken-veined nose, bright black eyes that laugh at the sea, the mouth open on a half-sung note. A rust-coloured coat with tarnished brass.

### Fenwick Sloe, chandler (`p17c_sloe`)
True age: about 50. In the books: no.

Subject: a round-headed, bald chandler in his late fifties with a trader's sceptical squint. A shaven, shiny skull, a short grey bristle on the jaw, one eyebrow lifted. Small, quick, guarded eyes, a mouth ready to say mostly. A sage-grey apron over a dark shirt, the neck thick.

### Mr. Dunmore, Receiving Clerk (`p17c_dunmore`)
True age: about 45. In the books: no.

Subject: a bland, civil clerk in his early fifties. Mouse-grey hair parted exactly on the left, oiled flat. A smooth, regular, forgettable face, mild light eyes that look kindly at a point just past you, a small perfectly polite smile. A flat grey coat with a plain stand collar, not a hair out of place.

### Marlow Quain, pilot (`p17c_quain,p17c_quain2`)
True age: about 45. In the books: no.

Subject: a lank, sun-browned boatman in his early fifties tipping a wide, battered old hat back off his eyes. Sandy hair bleached by sea-glare. A long amused face with a pale line where the hat-brim sits, narrowed pale blue eyes, a whistling mouth caught on a note. A sea-blue shirt open at the throat.

### A deck-hand of the Yard (`p17c_hand`)
True age: about 35. In the books: no.

Subject: a hard, wiry deck-hand of about forty with an ex-thief's easy, unlit eyes. Black hair shaved at the sides and short on top, a nick through one ear. Weather-tanned skin, a crooked broken nose, a half-smile that is mostly teeth. A sandy tar-stained shirt with the collar open.

### Pennick, the Kestrel's engineer (`p16k_pennick`)
True age: about 22 (the boy in Book One l. 1657; twenty-four at his death, Book Three Part One l. 557). In the books: yes.

Subject: a thin, earnest, boyish young engineer of about twenty-two. Untidy ink-black hair flattened under a battered blue-grey cap with two brass-rimmed goggle lenses pushed up above his brow. A narrow face, big dark eyes, a streak of oil across one cheek, a worried half-smile. A blue-grey engineer's coat with the collar up.

### Winchmaster Bardo (`p94_bardo`)
True age: about 55. In the books: yes.

Subject: a broad, heavy man in his early sixties, bare-headed, his iron-grey hair cropped like a brush, weathered and lined. A square face, a short grey beard, a flat unimpressed stare, a mouth set to swear. A black work coat with crossed brown harness straps over the chest, a notched steel link on a thong at his collar.

### The treble (`p96c_treble`)
True age: child, 10. In the books: role only.

Subject: a child of about ten, a thin girl with dark brown hair cut straight at the jaw. Huge dark eyes lifted a little, the mouth round and open on one held note, a small pale face. A white surplice with wide sleeves over a black cassock collar.

### The Cantor (`p96c_cantor`)
True age: about 60. In the books: role only.

Subject: an old choir-master in his early seventies, in white, his head tilted to one side, the ear turned to the room. Thin grey hair combed back, a long gentle face with deep creases from nose to mouth, eyes half shut in listening, a faint patient smile.

### Abbess Coriel (`p96v_coriel`)
True age: about 85. In the books: yes.

Subject: a very old, very upright abbess in her early nineties. Fine white hair under a plain veil of undyed wool. A narrow face cut with age, pale eyes sunken but clear, a mouth with a patient, unbending line. A plain oatmeal wool habit, high at the throat.

### Brother Fabian (`p96v_fabian`)
True age: about 50. In the books: no.

Subject: a heavy, round-faced monk in his late fifties, bald but for a ring of grey, with cold-red weather cheeks and small kind eyes. A cold-chapped lower lip, frost in his eyebrows. An oatmeal habit, a rope belt, a brass bell-pull key on a string at his chest.

### Sister Ottavia (`p96v_ottavia`)
True age: about 40. In the books: no.

Subject: a strong, square-shouldered nun of about forty-five, a grey veil pushed back, brown hair in a plait over one shoulder. A firm jaw, a steady, wary look, ears red from the wind. A grey habit with a plain white collar, the sleeves tied up. The skin is weathered and the expression plain and alert.

### Sister Domitia (`p96v_domitia`)
True age: about 55. In the books: no.

Subject: a soft-bodied nun in her early sixties, a plump, tired face with a frown line between her brown eyes, a wisp of brown hair escaping the grey veil. A scolding mouth that is also kind, a chilblained pink nose. A grey habit with a white apron over it.

### Brother Albinus (`p96v_albinus`)
True age: about 70. In the books: no.

Subject: a very thin old monk in his late seventies with a long nose, a bald head freckled with age, wispy white brows and wet blue eyes. A gentle half-smile, a trembling chin, cracked round spectacles tied with thread. An oatmeal habit, a knitted grey scarf.

### Sister Honoria (`p96v_honoria`)
True age: about 30. In the books: no.

Subject: a narrow young nun of thirty-five, pale and black-browed, with a long thin nose and a clear, direct look, one eyebrow slightly raised. A grey veil pulled tight, a pen behind it, a smudge of black ink on her chin. A grey habit with a high neck.

### Brother Marcellin (`p96v_marcellin`)
True age: about 40. In the books: no.

Subject: a thickset monk of about forty-five with a heavy brow and a shadow of black beard on a wide jaw. Deep-set suspicious dark eyes that slide away, a broken nose set slightly crooked. An oatmeal habit with the hood half up over dark hair. The skin is weathered and the expression plain and wary.

### Sister Prisca (`p96v_prisca`)
True age: about 60. In the books: no.

Subject: a small, brisk nun in her late sixties with a seamed brown face like a walnut and bright black eyes. A tight bun under the grey veil, a mouth always about to give an order, one front tooth missing. A grey habit, a ring of three large iron keys at her chest.

### Brother Quintin (`p96v_quintin`)
True age: about 35. In the books: no.

Subject: a lean, windburned monk of about forty with sandy hair blown flat and narrow squinting blue eyes lined from looking at weather. A long chin, sunburn peeling on his nose. An oatmeal habit with a wool cap under the hood. The skin is brown and weathered, the expression plain and alert. A thin, lean neck.

### Sister Liviana (`p96v_liviana`)
True age: about 22. In the books: no.

Subject: a girl of twenty-two with a round freckled face, big pale-green eyes always a little widened and a nervous smile with the only visible dimple. Honey hair in two thin braids under the grey veil. A grey habit, a scarf up over her chin. The skin is fair and plain and the expression young and shy.

### Sister Clemence (`p96v_clemence`)
True age: about 75. In the books: no.

Subject: a bent, birdlike elderly sister of a mountain religious house, in her early eighties, her face lined like folded paper, with hooded pale-grey eyes and almost no lips. A thin white wisp of hair under the grey veil, a grey wool shawl. The skin is pale and papery, the expression gentle and plain.

### Brother Galen (`p96v_galen`)
True age: about 50. In the books: no.

Subject: a long, stooped monk in his late fifties, with an upturned face, a high forehead and pale far-looking eyes gazing a little above and to one side. Wiry black hair going grey at the temples, a loose-lipped, absent smile. An oatmeal habit with a loose hood.

### Mother Ysolde Carrow, the harbourmaster (`p92_ysolde`)
True age: not stated. In the books: yes.

Subject: a narrow, very still harbourmaster, a woman in a black net veil, the face behind it only a pale oval with a straight mouth, nothing else readable, a faint silver curl at the temple. A black hat, a black coat with a high collar, black gloves hidden below.

### The woman under the black canvas (`p92_canvas`)
True age: about 45. In the books: no.

Subject: a sharp, quick woman in her early fifties with a pointed face, a dark shawl over her hair, hooded black eyes and a thin smile showing a gold tooth. A small black beauty-mark at the corner of her mouth. A black coat with a high collar.

### Joss Feveril, of the seventh chain (`p92_joss`)
True age: about 30. In the books: no.

Subject: a wiry chain-crew man of about thirty-five, black hair cropped, with a dark chin and alert brown eyes. A wry crooked grin with a gap between the two front teeth. A black work coat with a leather belt strap over the shoulder, the collar open.

### The Scavenger of the line (`p97_scav`)
True age: about 30. In the books: no.

Subject: a scavenger woman of about thirty-five swathed in black cloth to the eyes, only a band of brown skin showing, with two steady light-brown eyes and dark sooty lashes. A thread of white frost in the wrap at her mouth, a coil of black drop-line over one shoulder.

### General Theresa Ward (`p100_ward`)
True age: about 65. In the books: yes.

Subject: a hard, grey general in her early seventies, wrinkled, her iron-grey hair cut short, her lined face set and very still, mouth shut, pale eyes that wait. A dented lead breastplate over a lead-plated coat, a faded rose sash across the chest, a scar-pale line round the throat.

### Ninety-Four, the General's voice (`p100_94`)
True age: about 40. In the books: yes.

Subject: a mild, tired trooper in his mid-forties with thinning brown hair, a worn chin and an anxious, ready look turned to the side, his mouth open mid-sentence. A smear of lamp-soot on one cheek. A grey lead-plated coat with the collar up. The skin is fair and the expression plain and weary.

### Nineteen (`p100_19`)
True age: about 60. In the books: no.

Subject: a leathery trooper in his late sixties with hair cropped to grey stubble, a pale scar through the left eyebrow giving a mild surprise, a farmer's wide, patient face, mouth open mid-story. A grey coat with a single brown hen feather stuck in the collar.

### Eighty-Eight (`p100_88`)
True age: about 25. In the books: no.

Subject: a young trooper of twenty-five with auburn hair, an eager, listening face, his gaze going past the viewer, his mouth open mid-word. A long thin nose, light freckles, a grey lead-plated coat with the collar turned up. The skin is fair and healthy, the shoulders squared. A plain, young, eager face.

### Trooper A, Fifty-Seven (`p100_tr_a`)
True age: about 45. In the books: yes.

Subject: a stocky trooper in his early fifties with thick brown hair going grey over the ears, a round red face and a cook's authority, mouth open mid-recipe. A single onion-tear on one cheek. A lead-plated grey coat with a thick collar. The skin is weathered and the expression plain and confident.

### Trooper C, Two-Oh-Eight (`p100_tr_c`)
True age: about 35. In the books: role only.

Subject: a trooper woman of about forty with dark-blond hair pinned in a tight bun, a long patient face, one eyebrow lifted, mouth open mid-story. A slightly bluish lead-plated coat, a little green thread-end hanging from the collar. The skin is fair and the expression plain, patient and a little amused. A pale, long neck.

### Trooper D, Nine (`p100_tr_d`)
True age: about 70. In the books: yes.

Subject: a cropped, silver-headed trooper in his late seventies with a lean pale face, a drooping white moustache and rheumy pale eyes still alert, mouth open on a day's name with a missing tooth. A grey coat, and a cord of nine knots at his neck.

### The roster-corporal (`p100_roster`)
True age: about 40. In the books: no.

Subject: a narrow, harassed clerk-corporal of about forty-five, his black hair slicked flat, his pinched face dusted with chalk, his eyes hooded and irritated. A pencil-thin black moustache, a thin mouth. A grey coat with a stiff collar, the cuff white with chalk. The skin is pale and the expression plain and impatient.

### One-Oh-Six, at the issue-hatch (`p100_issue`)
True age: about 50. In the books: no.

Subject: a flat-faced quartermaster in his late fifties with cropped brown-grey hair, a heavy brow, tiny deadpan eyes and a downturned mouth with no patience in it. A pencil stub behind a notched ear. A grey coat with a heavy collar. The skin is fair and the expression plain and unmoved.

### Corporal One-Forty-Two (`p100_corp`)
True age: about 45. In the books: no.

Subject: a stern, square corporal in his early fifties with black hair cropped close, a stiff jaw, a flat, authoritative stare and a straight mouth, the lips shut then a half-word. A grey coat with two bars on the sleeve at the shoulder. The skin is weathered and the expression plain and severe.

### Fifty-One (`p100_51`)
True age: about 30. In the books: no.

Subject: a freckled trooper woman of about thirty-five with copper hair tied back with a bootlace, a pointed, soft face, hazel eyes lowered and one lid lowered further as if listening to a tune, her mouth parted on a song. A grey coat. The skin is fair and the expression plain and dreamy.

### Two-Oh-Seven (`p100_207`)
True age: about 35. In the books: no.

Subject: a lean trooper of about forty with brown skin, black hair curling at the collar, kind dark eyes and a worried brow, mouth open mid-count. A neat, thin line of beard along the jaw only. A grey coat with a plain collar. The skin is warm brown and the expression plain and gentle.

## The pools (48 rows), held for now

A pool is many people who share one figure (the Oakhaven townsfolk, the road-walkers, the Hollow loops, the mourners, the night-hummers, the Umbral folk, the mast-crew, the watchers, the Flambeaux of the winch). The reader wrote several faces for each pool, and the variety in them is the reader's own [PROPOSED], not the brief's. The game can show one face per figure today, so a pool needs a small change first (each person in a pool picking one of its faces by a fixed rule, never by chance). That is a later step; the rows are kept here for it.

- **The night-hummers** (`n28_hummer#1`; true age about 70 (proposed)): an old townswoman in her late seventies, wrinkled and frail. White hair under a grey shawl, lips parted on a low hum, soft pale eyes half lowered, the head tilted a little as if listening to the street. A plain dark dress with the grey shawl drawn round her shoulders.
- **The night-hummers** (`n28_hummer#2`; true age about 65 (proposed)): an old townsman in his early seventies with a walnut-brown, deeply lined face and a bald crown, his eyes closed, his mouth shut on a low hum. Heavy brows, loose cheeks, a few white bristles on the chin. A plain brown coat with a worn collar and a knitted neckcloth.
- **The night-hummers** (`n28_hummer#3`; true age about 50 (proposed)): a stout woman in her late fifties, wrinkled and sturdy, with a knitted scarf pulled up over her chin, humming through the wool. Grey-streaked hair tucked back, round weathered cheeks, kind, tired eyes. A plain wool bodice with the sleeves pushed up above the elbow.
- **The night-hummers** (`n28_hummer#4`; true age about 50 (proposed)): a gaunt man in his late fifties, lined and weathered, with a stiff, tired jaw and hollow cheeks. Grey stubble, thin dark hair going grey, watchful eyes ringed with fatigue, a long thin nose. A plain dark coat buttoned to a worn collar, the shoulders narrow and drawn.
- **The Hollow mourners** (`mourner#1`; true age about 50 (proposed)): a veiled mourning woman in her late fifties, a black veil lifted in a net across fair-grey hair. Her face is grey as ash, still and slack, the eyes open, wet and fixed ahead, the lips pale. A dark, faded dress with a high collar, the shoulders worn and drooping.
- **The Hollow mourners** (`mourner#2`; true age about 80 (proposed)): a very old, tiny mourning woman in her late eighties, deeply wrinkled, a black veil hanging crooked over her head. A toothless, slack mouth, pale watery eyes that look at nothing, thin white wisps of hair at the temples. A dark, ragged dress with a high collar and thin, bent shoulders.
- **The Hollow mourners** (`mourner#3`; true age about 30 (proposed)): a mourning woman of about thirty-five with dark wet eyes and cheekbones sharp as a blade. A black veil over dark hair, a hollow, pale face, a tight, trembling mouth. A dark ragged dress with a high collar, the shoulders narrow and held tight. The face is gaunt and still.
- **The Hollow mourners** (`mourner#4`; true age about 55 (proposed)): a broad mourning woman in her early sixties, lined and heavy-featured. Plaits of iron-grey hair under a black veil, a bruised, patient tilt to her head, tired, wet eyes, a heavy jaw. A dark dress with a high collar and wide, rounded shoulders. The face is broad and heavy-lidded.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#1`; true age about 50 (proposed)): an orchardman in his late fifties with apple-red cheeks, lined and weathered, in a sun-bleached straw hat. Kind, squinting eyes, a broad nose, grey stubble on a strong chin. A pale shirt with a rolled collar and a leather strap over one shoulder. A plain, honest, sunburnt face.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#2`; true age about 40 (proposed)): a broad carter in his mid-forties with a flattened ear and a leather cap. A thick neck, a heavy jaw, steady small eyes, short brown stubble, a nose broken once. A coarse brown coat, a coil of whip lying over his shoulder. The face is broad, scarred by weather and plain.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#3`; true age about 65 (proposed)): a gnarled old townsman in his early seventies, nearly toothless, deeply wrinkled, a wool muffler wound up to his chin. Thin white hair, sunken cheeks, watery pale eyes under bushy white brows, a stooped neck. A worn brown coat with a patched collar. The skin is cracked and leathery with age.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#4`; true age about 30 (proposed)): a lean carpenter of about thirty-five in a plain linen shirt, sawdust in his hair and a carpenter's pencil behind his ear. A long, serious face, light stubble, grey-blue eyes, a thin mouth. A leather strap over one shoulder, the collar open. The face is plain, honest and watchful.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#5`; true age about 55 (proposed)): a heavy night-watchman in his early sixties with grey side-whiskers under a flat black hat. A broad, tired face, heavy-lidded eyes, a thick neck, a slow mouth. A dark coat with a turned-up collar, thick through the shoulders. Deep lines run from nose to mouth, and the skin is grey with night air. The whole look is patient, heavy and watchful.
- **Oakhaven orchardman, and the town's townsmen** (`townsman#6`; true age about 35 (proposed)): a clean-shaven constable of about forty in a stiff dark coat, a tin whistle on a cord at his throat and a tight mouth. A pale, square face, short dark hair, wary eyes under straight brows, a firm jaw. A high, stiff collar. The expression is plain, stiff and watchful.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#1`; true age about 45 (proposed)): a rosy market-woman in her early fifties, lined, in a red-checked kerchief. Round, weathered cheeks, bright brown eyes, a wide friendly mouth, a few grey strands escaping the kerchief. A plain dark bodice with a white collar. The skin is warm and sun-reddened, the expression cheerful and open. A plain, honest face.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#2`; true age about 19): a freckled girl of nineteen with a copper plait over one shoulder. A shy mouth, wide hazel eyes, a round face with a small chin, a scattering of freckles across the nose. A plain brown dress with a white collar. The skin is fair and the expression soft and bashful.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#3`; true age about 50 (proposed)): a stout washerwoman in her late fifties with red cheeks, wrinkled, her sleeves pushed up and wet hair stuck to her temple. A broad, worn face, tired kind eyes, a damp brow. A plain bodice, dark with damp at the collar. The skin is red and chapped from hot water, the look plain and strong.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#4`; true age about 65 (proposed)): a thin, severe woman in her early seventies, deeply wrinkled, in a black shawl and a white cap, lips pursed against a draught. A narrow face, a sharp nose, pale hard eyes, a thin neck. The shawl pinned tight under the chin. The expression is cold, disapproving and plain.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#5`; true age about 40 (proposed)): a tall night-watchwoman of about forty-five in a man's wool greatcoat, the collar turned up. A long face, level grey eyes, brown hair pinned flat under a plain cap, a firm mouth. Broad shoulders in coarse grey wool. The skin is weathered and the expression calm, plain and alert. Deep lines frame the mouth.
- **Oakhaven goodwife, and the town's townswomen** (`townswoman#6`; true age about 28): a young mother of twenty-eight with a sleeping baby resting on her shoulder and a tired smile. Light brown hair pinned back, dark circles under her eyes, a soft, pale face. A plain dark dress with a shawl, the neck bare. The expression is gentle, plain and weary.
- **The road-walkers: the men of the life60 places** (`p60_man_a,p60_man_b,p60_man_c#1`; true age about 30 (proposed)): a wharf hand of about thirty-five in a slate-blue coat, with black stubble and an old rope scar across one cheek. A weathered face, dark, squinting eyes, short black hair under a plain cap. The coat collar turned up against the damp. The expression is plain and wary.
- **The road-walkers: the men of the life60 places** (`p60_man_a,p60_man_b,p60_man_c#2`; true age about 50 (proposed)): a ferryman in his late fifties, lined and weathered, in a moss-green jerkin, with a grey beard braided to a point. Pale squinting eyes, a creased brow, grey hair under a plain cap, a broad nose. The jerkin laced to the throat. The skin is cracked and brown, the expression patient.
- **The road-walkers: the men of the life60 places** (`p60_man_a,p60_man_b,p60_man_c#3`; true age about 16): a carter's boy of sixteen in a russet leather cap, his cheeks smudged, his eyes wide. A thin face, a snub nose, a nervous half-open mouth, a few strands of brown hair at his ears. A rough russet jerkin with a loose collar. The skin is young and the expression plain and startled.
- **The road-walkers: the men of the life60 places** (`p60_man_a,p60_man_b,p60_man_c#4`; true age about 60 (proposed)): a tinker in his late sixties, wrinkled, in a russet leather hood, with one gold earring, a lazy eye and a lopsided grin. Stubbled cheeks, a crooked nose, grey brows. A battered pan hung at his shoulder on a cord. The skin is brown and cracked, the expression sly and good-humoured. A plain, lined face.
- **The road-walkers: the women and children of the life60 places** (`p60_wom_a,p60_wom_b,p60_wom_c,p17c_child#1`; true age about 35 (proposed)): an eel-catcher woman of about forty in an ochre apron, her hair tied up in a wet rag. A sharp, freckled face, quick pale eyes, a wry mouth, damp strands at her temples. A rough wool bodice, dark with damp at the shoulders. The skin is brown from weather, the expression plain and shrewd.
- **The road-walkers: the women and children of the life60 places** (`p60_wom_a,p60_wom_b,p60_wom_c,p17c_child#2`; true age about 40 (proposed)): a woman of about forty-five in a heather-purple shawl and round spectacles, with a neat brown bun, wearing a very small hat perched on top. A narrow, composed face, dry grey eyes, a prim mouth. The shawl pinned neatly at the throat. The expression is plain, polite and quietly self-assured.
- **The road-walkers: the women and children of the life60 places** (`p60_wom_a,p60_wom_b,p60_wom_c,p17c_child#3`; true age child, 10): a child of about ten, a girl in a madder-red cap, with a round, scrubbed face and a direct, curious gaze. Wisps of brown hair escaping the cap, a gap-toothed mouth, a small nose. A madder-red smock with a worn collar. The skin is clear and the expression plain and serious. A small, sturdy neck.
- **The road-walkers: the women and children of the life60 places** (`p60_wom_a,p60_wom_b,p60_wom_c,p17c_child#4`; true age about 55 (proposed)): a laundress in her early sixties, lined and heavy-armed, in madder red, her grey hair steam-curled round a flushed face. A strong jaw, sharp little eyes, a no-nonsense mouth, damp brow. A red bodice with the collar open. The skin is red and wrinkled from steam, the expression plain and stern. Broad, heavy shoulders, thick neck.
- **The road-walkers: the women and children of the life60 places** (`p60_wom_a,p60_wom_b,p60_wom_c,p17c_child#5`; true age about 15): a girl of fifteen in an ochre apron, with a pencil-thin gold hoop in one ear. A long, earnest face, dark hair pinned up, bright eyes, a quick shy smile. A plain bodice with a neat collar under the apron straps. The skin is clear and the expression plain and serious.
- **The Hollow loops of Whisper-Grove** (`p62_hollow_a,p62_hollow_b,p62_hollow_c,hollow#1`; true age about 50 (proposed)): a woman in her late fifties in a good brown coat, her hair neat, her face smooth and empty, the eyes open, wet and level, nothing behind them. Pale cheeks, a slack mouth, the coat buttoned high at the throat, the shoulders held straight. The skin is grey-blue, the light gone out of the face.
- **The Hollow loops of Whisper-Grove** (`p62_hollow_a,p62_hollow_b,p62_hollow_c,hollow#2`; true age about 30 (proposed)): a woman of about thirty-five with a smooth, empty face and wet, level eyes with nothing behind them, a faint line of grey cloth over one shoulder. Dull hair parted flat, a pale slack mouth, a faded dark dress with a plain collar. The skin is grey-blue and the face quite calm.
- **The Hollow loops of Whisper-Grove** (`p62_hollow_a,p62_hollow_b,p62_hollow_c,hollow#3`; true age about 50 (proposed)): a stout baker in his late fifties with brows lifted in a patient look, his broad face smooth and emptied of light, the eyes wet and level. Thinning hair, a thick neck, heavy cheeks. A flour-dusted linen shirt open at the collar. The skin is grey-blue and the face peaceful.
- **The Hollow loops of Whisper-Grove** (`p62_hollow_a,p62_hollow_b,p62_hollow_c,hollow#4`; true age about 70 (proposed)): a very old woman in her late seventies, wrinkled, her white hair scraped back, her lips moving as if counting, her eyes open, wet and level with nothing behind them. A thin faded shawl round narrow, bent shoulders, a pale throat. The skin is grey-blue and the face peaceful.
- **A Flambeau of the winch** (`p95_warden#1`; true age about 22): a lanky young fire-priest of twenty-two, red hair cropped under a crimson hood, freckled, with a nervous jaw. Pale eyes, thin lips, a faint warm glow from below on his chin. A crimson robe with the hood framing a narrow face. The skin is fair and the expression plain and anxious.
- **A Flambeau of the winch** (`p95_warden#2`; true age about 45): a stolid fire-priest in his early fifties, shaved, bull-necked, with a long white scar from ear to lip and eyes that do not move. A crimson hood framing a heavy jaw, a faint warm glow on his chin, a crimson robe. The skin is weathered and the expression unmoved and plain.
- **The Umbral folk** (`p92_folk#1`; true age about 40 (proposed)): a woman of about forty-five in a black shawl, pale and quiet, her eyes downcast. Dark hair pulled back, a thin worried mouth, shadows under the eyes, a narrow chin. A plain black dress with a high collar under the shawl. The skin is pale and the expression is plain and quiet.
- **The Umbral folk** (`p92_folk#2`; true age about 70 (proposed)): an old man in his late seventies, toothless, deeply wrinkled, in a black hood with a white thread of hair escaping it. Sunken cheeks, pale tired eyes lowered, a thin, caved mouth. A black coat with a high collar and bowed shoulders. The skin is pale and papery, the expression gentle and plain.
- **The Umbral folk** (`p92_folk#3`; true age about 14): a boy of fourteen with dark circles under his eyes, a black cap too large for him pulled low. A thin pale face, a nervous mouth, eyes cast down, big ears. A black coat with a high collar, the shoulders too wide for him. The skin is pale and the expression is plain and quiet.
- **The Umbral folk** (`p92_folk#4`; true age about 50 (proposed)): a stout woman in her late fifties, lined, in a black shawl, with a small baby's hand just visible at her collar. A broad, tired face, dark hair under a black kerchief, eyes lowered, a heavy chin. A black dress under the shawl. The skin is pale and the expression is plain and quiet.
- **The Umbral folk** (`p92_folk#5`; true age about 50 (proposed)): a one-eyed man in his late fifties, weathered, with a black eye-patch. Grey stubble, a hooded dark coat, a pale face with the other eye cast down, a long, worn jaw. A black coat with a high collar and a dark leather strap at the shoulder.
- **One of the mast-crew** (`p100_mastcrew#1`; true age about 30 (proposed)): a rope-handed rigger of about thirty-five in a dark knit cap with a salt-white beard. A weathered, squinting face, grey eyes, a wide mouth open mid-shout, a sunburnt nose. A thick bluish coat with the collar up. The skin is brown and cracked from salt wind. A plain, strong face.
- **One of the mast-crew** (`p100_mastcrew#2`; true age about 45 (proposed)): a broad rigger woman in her early fifties, lined, in a red scarf, a rigger's marlinspike thrust through her collar. A wide, windburned face, small bright eyes, mouth open mid-shout, grey strands at the temples. A bluish coat. The skin is red and cracked from salt wind. A plain, strong face.
- **One of the mast-crew** (`p100_mastcrew#3`; true age about 50 (proposed)): a tall, thin rigger in his late fifties with an eyepatch and a weather-dark scalp, deeply lined. A narrow jaw, a hooked nose, one pale eye, mouth open mid-shout, a long neck. A thick bluish coat with the collar up. The skin is brown and cracked from salt wind. A plain, strong face.
- **One of the mast-crew** (`p100_mastcrew#4`; true age about 23): a short young rigger woman of twenty-three with her hair cropped short and an iron ring in one ear. A round freckled face, bright dark eyes, mouth open mid-shout, a stubborn chin. A bluish coat with the collar up. The skin is brown from salt wind. A plain, strong young face with a small scar-free chin.
- **A watcher by the bunks** (`p100_watcher#1`; true age about 50 (proposed)): a heavy-lidded watcher woman in her late fifties, lined, with a long grey plait over one shoulder. A tired, kind face, a soft mouth, patient eyes, a broad brow. A plain grey coat with the collar turned up. The skin is lined and the expression plain and patient. A heavy, tired face with dark pouches under the eyes.
- **A watcher by the bunks** (`p100_watcher#2`; true age about 20): a young watcher of twenty with chapped lips, a tousled brown head, tired eyes and a wry half-smile. A thin, pale face, a few spots of stubble on the chin. A grey coat with a loose collar, the shoulders slumped. The skin is fair and the expression plain and tired. A young, lean face.
- **A watcher by the bunks** (`p100_watcher#3`; true age about 60 (proposed)): a sour old watcher in his late sixties with an unlit pipe in his teeth, a deeply lined face, sunken cheeks and heavy brows. Grey stubble, thin grey hair, small hard eyes. A grey coat with the collar up. The skin is weathered and the expression plain and unfriendly. Deep lines frame the mouth.
- **A watcher by the bunks** (`p100_watcher#4`; true age about 35 (proposed)): a gentle watcher woman of about forty with a baby's blanket over her shoulder. A soft, tired face, light brown hair pinned loosely back, kind grey eyes, a small, patient smile. A plain grey coat. The skin is fair and the expression plain and tender. A soft, young neck with a small crease, and gentle shoulders.
