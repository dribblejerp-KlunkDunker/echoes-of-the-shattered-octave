# Rulings of 26 November 2026

## 6:45 am: Phase 126 merged

Told that pull request #167 (Phase 126, the callings, part one) had three checks green and all 229 suites run on Claude's side, but that the security scan had again run out of its thirty minutes ("Scan inconclusive", 35% through 42 files, nothing found in that part), he answered:

> "merge and proceed"

| Ruling | What follows |
| --- | --- |
| **#167 is merged as it stood**, without the scan's verdict and without a Codex review (his limit was still used up). | Merged at 6:46 am (main `a3f1e98d`). |
| **Proceed.** | Phase 127's design was started the same morning; the faces wait on the Hugging Face allowance. |

## 6:53 am: the security scan when it times out

Asked for a standing word on the scan, which had timed out on both large phases:

> "let me know if there is a timeout but I want it tried twice before you merge anyway"

| Ruling | What follows |
| --- | --- |
| **When the security scan times out, it is tried a second time. If the second try also times out, Claude merges anyway, and tells him there was a timeout.** | A second try needs a new run of the scan. Claude cannot press "re-run" from here (GitHub refuses it), so the second try comes with the next real commit pushed to the branch (the record of integration is kept back for this). Never an empty commit. |
| **A finding is not a timeout.** | If the scan ever reports a finding, the merge stops and the finding is put to him. |

## Found the same morning: the two-player suite on this machine

`test/net19` (one check: the guest coming back after a dropped link) times out on this machine since the environment restarted on the evening of 25 Nov. Run against the code from before Phase 125b (`b5cf4b21`), which passed on 24 Nov, it fails the same way. So it is the machine, not anything merged since. Whether "Play together" itself is affected cannot be told from here; the test is two phones.

## 7:22 am: the headframe's wheel

Asked, with the Phase 127 design, whether the wheel on the quarry's headframe should turn at the shift change.

> "decision 1 yes."

| Ruling | What follows |
| --- | --- |
| **The headframe's wheel turns at the shift change.** | A later piece, after Phase 127b; in the 3D view only (the classic view's headframe is a flat picture). It is on the ROADMAP. |

## 7:28 and 7:31 am: cheap wins, and who does what

> "when this phase is done what do we have next. I'm going to install it on my phone this morning and want some cheap wins that I can look at and test"

> "take care of the cheap wins yourself and 5, 6 and 7"

| Ruling | What follows |
| --- | --- |
| **Claude does the cheap wins itself, and the roadmap's items 5, 6 and 7** (Phase 128; Phases 129 to 131; Phases 115, 117, 119 and 120). | The one Opus builder keeps to the callings (127, 127b, the wheel, 126b) and then 114. The cheap wins are in `Cheap wins of 26 Nov 2026.md`; Phase 128's findings and 128a's record are beside it. |

## 9:26 am: everything merged

> "commit push and merge everything"

| Ruling | What follows |
| --- | --- |
| **Everything finished is committed, pushed and merged.** | Pull requests #168 to #173 were already merged that morning. Phase 127 was still being built: the builder was told to finish the part in hand and stop, its own test passed 92 of 92, main was merged into it, every suite was run, and it was merged (#174). The third pump man's change of place was left as owed. |

## 9:45 am: Phase 128's five decisions

Asked, with the findings of Phase 128 (`Phase 128 - The roads filled (findings and options, for ruling).md`, section 4) and Claude's recommendation on each:

> "I apporve of your recommendations"

| Decision | Ruling (the recommendation, approved) |
| --- | --- |
| **1. Greenroot: empty, or four hundred souls?** | **Between, now:** the hamlet is shut up and frightened, not empty; a few faces at windows, one door that opens; the lines that say "nobody" are reworded. **Peopled in full** (the mill, the chapel with a silent reed, the overgrowth cases) as a phase of its own, later. |
| **2. The toll board on the Greenroot road** | It stays, as the game's own. |
| **3. "The road to the Redoubt with its ninety posts"** | Reworded to "the road to the Redoubt", with its French. |
| **4. "The Hundred Hollows"** | The name stays. |
| **5. The drove road's emptiness** | Left as it is. |

Also approved with them: tonight's faces are the crowds' first (townsmen and townswomen), since one crowd's face changes many people. Still the owner's, and not ruled: whether the sights are too faint on a phone, whether "Cass Yelland" suits, "Play together", Hugging Face PRO.
