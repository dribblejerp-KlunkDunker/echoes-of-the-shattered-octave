#!/bin/bash
# rerun.sh <suite...>: the named suites one after another, alone, against the working copy
S=${OCTAVE_OUT:-/tmp/octave-dev}; cd "$(dirname "$0")/../.."; mkdir -p $S/out/rerun
for t in "$@"; do PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright timeout 2400 node test/$t.test.js > $S/out/rerun/$t.log 2>&1; e=$?; echo "$t exit $e pass $(grep -c '^PASS' $S/out/rerun/$t.log) fail $(grep -c '^FAIL' $S/out/rerun/$t.log)"; done; echo rerun done
