#!/bin/bash
# fullrun.sh <shard index> <shard count>: every suite of the frozen copy, one after another
S=${OCTAVE_OUT:-/tmp/octave-dev}; cd $S/wt2; mkdir -p $S/out/full2
i=0; for f in $(ls test/*.test.js | sort); do i=$((i+1)); [ $((i % $2)) -eq $1 ] || continue; t=$(basename $f .test.js)
  PREVIEW_URL=http://127.0.0.1:4179 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright timeout 1800 node $f > $S/out/full2/$t.log 2>&1; e=$?
  echo "$t exit $e pass $(grep -c '^PASS' $S/out/full2/$t.log) fail $(grep -c '^FAIL' $S/out/full2/$t.log)"; done
echo "shard $1 done"
