# Working tools (for whoever builds the next phase)

These are the scripts the build sessions use to look at the game. They are not part of the game and are not shipped.

Start the game locally first, from the repository root:

    python3 -m http.server 4175 --bind 127.0.0.1

Playwright is expected at `/opt/npm-tools/node_modules/playwright` (the path is written into the `.js` tools; change it there if yours differs). Pictures go to an `out/` folder beside the scripts.

| Tool | What it does |
|---|---|
| `shot.js` | `node shot.js <name> <map> <x> <y> <dir> <tod> [...]`. Pictures of a place. `dir` is in half-turns (0 east, 0.5 south, -0.5 north). `R3D=1` for the 3D renderer, `SCALE=2`, `PATHS='[[name,map,x0,y0,d0,x1,y1,d1,tod,frames]]'` to film a walk. **Take one place per run:** the second place in a run can carry a pale rectangle in the middle of the view. |
| `mkgif.py` | `python3 mkgif.py <out.gif> <width> <colours> <ms> <label> <frames dir>`. A GIF from a filmed walk. |
| `dbg.js` | `node dbg.js "<expression>"`. Runs an expression inside a started game and prints the answer. |
| `dbg3d.js` | The same, with the 3D renderer on. |
| `walk.js` | `node walk.js <name> <tod> <step> [from to]`. Films a walk along the Greenroot road. |
| `roadplan.js` | `node roadplan.js <map> <out.png>`. A plan of a road map, with what can be reached on foot. |
| `rerun.sh` | `bash rerun.sh <suite> <suite> ...`. Runs the named test suites one after another and prints pass and fail counts. Logs go to `$OCTAVE_OUT/out/rerun` (default `/tmp/octave-dev`). |
| `fullrun2.sh` | `bash fullrun2.sh <shard> <count>`. One shard of a full run of every suite. |

A single suite: `PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/<name>.test.js`.

Suites that compare frames or time the renderer (`r3d21`, `light21`, `gpu18`) fail if anything else heavy is running. Run them alone.
