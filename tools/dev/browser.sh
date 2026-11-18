#!/usr/bin/env bash
# Run a browser job (a test, shot.js, dbg.js) with at most two running on this machine at once.
# Usage: tools/dev/browser.sh <command...>     e.g. tools/dev/browser.sh node test/foo.test.js
# Parallel teams share a 2-core machine; without this, page loads time out under load.
exec 8>/tmp/octave-browser-1.lock
if flock -n 8; then exec "$@"; fi
exec 9>/tmp/octave-browser-2.lock
flock 9
exec "$@"
