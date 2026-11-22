#!/bin/bash
# tools/dev/runsuites.sh OUTDIR suite [suite ...]
#   Runs test suites one after another against this working copy, served at $PORT (default 4176), each through
#   tools/dev/browser.sh (the two-slot browser lock). One log per suite in OUTDIR; one summary line per suite on stdout:
#   "<suite> exit <code> pass <n> fail <n>", then "done".
#   Start the server first:  (nohup python3 -m http.server 4176 --bind 127.0.0.1 > /tmp/http4176.log 2>&1 &)
#   Load-sensitive suites (r3d21, light21, gpu18, visual) are best run alone; r3d21 can take over ten minutes.
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; PORT="${PORT:-4176}"
O="$1"; shift; mkdir -p "$O"; cd "$ROOT" || exit 1
for t in "$@"; do
  PREVIEW_URL=http://127.0.0.1:$PORT PLAYWRIGHT_MODULE=${PLAYWRIGHT_MODULE:-/opt/npm-tools/node_modules/playwright} \
    timeout 2400 tools/dev/browser.sh node test/$t.test.js > "$O/$t.log" 2>&1; e=$?
  echo "$t exit $e pass $(grep -c '^PASS' "$O/$t.log") fail $(grep -c '^FAIL' "$O/$t.log")"
done; echo done
