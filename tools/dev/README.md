# Working tools (for whoever builds the next phase)

These are the scripts the build sessions use to look at the game. They are not part of the game and are not shipped.

Start the game locally first, from the repository root:

    python3 -m http.server 4175 --bind 127.0.0.1

Playwright is expected at `/opt/npm-tools/node_modules/playwright` (the path is written into the `.js` tools; change it there if yours differs). Pictures go to an `out/` folder beside the scripts.

| Tool | What it does |
|---|---|
| `shot.js` | `node shot.js <name> <map> <x> <y> <dir> <tod> [...]`. Pictures of a place. `dir` is in half-turns (0 east, 0.5 south, -0.5 north). `R3D=1` for the 3D renderer, `SCALE=2`, `PATHS='[[name,map,x0,y0,d0,x1,y1,d1,tod,frames]]'` to film a walk. **Take one place per run:** the second place in a run can carry a pale rectangle in the middle of the view. |
| `sweep106.js` | `node sweep106.js <map> [<map> ...]`. Pictures of each place from its arrival point: ahead, behind and at night (`R3D=1` for the 3D view), into `out/sweep/r3d` or `out/sweep/classic`. `VIEWS=day,back,night`, `PITCH` (rows, up to 40), `OUTDIR`. Many places per run are fine. |
| `sheets106.py` | `python3 sheets106.py [out]`. Contact sheets from the sweep: six places a sheet, 3D ahead, behind, night and classic side by side, labelled. |
| `mkgif.py` | `python3 mkgif.py <out.gif> <width> <colours> <ms> <label> <frames dir>`. A GIF from a filmed walk. |
| `dbg.js` | `node dbg.js "<expression>"`. Runs an expression inside a started game and prints the answer. |
| `dbg3d.js` | The same, with the 3D renderer on. |
| `walk.js` | `node walk.js <name> <tod> <step> [from to]`. Films a walk along the Greenroot road. |
| `roadplan.js` | `node roadplan.js <map> <out.png>`. A plan of a road map, with what can be reached on foot. |
| `rerun.sh` | `bash rerun.sh <suite> <suite> ...`. Runs the named test suites one after another and prints pass and fail counts. Logs go to `$OCTAVE_OUT/out/rerun` (default `/tmp/octave-dev`). |
| `hands111.js` | `node hands111.js <outdir> <name>=<key:value,...> ...`. Your own hands as the game draws them (the 3D view; `R3D=0` the classic one): any weapon (`w:`), gloves (`h:`), shield (`s:`), hour (`tod:`), swing (`atk:`, `dir:`), lowering (`low:`), Song (`song:`, how far through it `cast:`), climb (`climb:`), place (`at:`). `CROP=1` writes only the view; `EVAL='...'` prints a value from the page after each scene. |
| `px111.js` | `node px111.js <out.png> <spec.js> [scale]`. The pixel hands alone on a blank page, no game loaded (a second or two a picture), for working on the model. |
| `sheets111.py` | `python3 sheets111.py <new> <old> screenshots/p109-options.jpg <outdir>`. Phase 111's review sheets from `hands111.js` pictures. |
| `shots112.sh` | `tools/dev/shots112.sh <out>`. Phase 112: every picture of the sculpted hands (`<out>/s`) and a slash, a thrust and a Song frame by frame (`<out>/clip`), taken by `hands111.js` with "Hands: Sculpted" chosen. |
| `sheets112.py` | `python3 sheets112.py <out>/s <pixel> <out>/clip screenshots/p109-options.jpg <outdir>`. Phase 112's review sheets and clip from those pictures (`<pixel>`: Phase 111's pictures of the pixel hands). |
| `fullrun2.sh` | `bash fullrun2.sh <shard> <count>`. One shard of a full run of every suite. |

A single suite: `PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/<name>.test.js`.

Suites that compare frames or time the renderer (`r3d21`, `light21`, `gpu18`) fail if anything else heavy is running. Run them alone.
