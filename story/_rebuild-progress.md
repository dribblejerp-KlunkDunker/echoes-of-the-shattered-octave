# Bundle + GitHub rebuild progress (session of 19 Oct 2026)

Repo: dribblejerp-KlunkDunker/echoes-of-the-shattered-octave (public), branch main.
Books live under story/ in that repo. Markdown is source of truth.

DONE
- Salvaged Vite/TS scaffold from retired repo -> tooling/vite-scaffold/
- Pushed: Book One (full + 26 chapters), Book Two Part One Ch1-3, Series Bible,
  4 Source Material docs, story/README.md   [commit 979b0c6]

TO PULL from the claude.ai project into /mnt/user-data/outputs/projectdocs/
(subagents CANNOT read project docs - must be done by the main session)
- [ ] Book Two - Part Two Ch8-14.md
- [ ] Book Three - Part One Ch1-4.md
- [ ] Book Three - Part Two Ch5-8.md
- [ ] Book Three - Part Three Ch9-12.md
- [ ] Book Four - Part One Ch1-4.md
- [ ] Source - The Expanded World Bible.md
- [ ] Source - World Bible Vol II - Gazetteer and Bestiary.md
- [ ] Source - World Bible Vol III - Canon Reconciliation and the Road to Book Five.md
- [ ] World Bible Vol III - Errata and Rulings.md
- [ ] Source - World Bible Vol IV - The Hush, the Organum, the Rust Coast.md
- [ ] World Bible Vol V - The Winter Gazetteer.md
- [ ] World Bible Vol VI - The Rift, the Organum Revisited, and the Press.md
- [x] World Bible Vol VII - The Calendar of Aethelgard.md  (DONE, in repo)
- [ ] Game Design Document - Book One Prototype.md
- [ ] Game - Phase 6 New In-Game Text (for review).md
- [ ] Game - Phase 9 New In-Game Text (for review).md
- [ ] Book Two - Part One Ch4-7.md   (do LAST)

THEN
- python3 /mnt/user-data/outputs/build_bundle.py  (routes docs, builds PDFs, restructures bundle)
- zip the bundle, send to user
- copy docs into repo story/ and push
