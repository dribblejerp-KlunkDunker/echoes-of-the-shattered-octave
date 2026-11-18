// Phase 97: "Read everything aloud" (js/reader97.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/reader97.test.js
// The browser's speech is replaced by a recorder, so the test hears exactly what a player would be told.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'reader97.js'), 'utf8');
  check(!/Math\.random/.test(src) && !/G\.flags\s*[\[.][^=]*=[^=]/.test(src), 'the reader draws nothing from Math.random and writes no flag');
  const R = require('../js/reader97.js');
  const long = 'One short line. ' + 'This is a much longer sentence that goes on, and on, with commas, so that it must be cut somewhere sensible. '.repeat(6);
  check(R.chunks(long).every((c) => c.length <= 230) && R.chunks(long).join(' ').replace(/\s+/g, ' ') === long.trim().replace(/\s+/g, ' '), 'a long passage is spoken sentence by sentence, nothing lost (' + R.chunks(long).length + ' pieces)');
  check(R.clean('<b>Old Harrow</b> · gate-warden — at the gate') === 'Old Harrow, gate-warden, at the gate', 'marks a voice cannot say are turned into pauses');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    try { localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ }
    window.__said = []; const fake = { speaking: false, cancel() { window.__said.push('<<stop>>'); }, speak(u) { window.__said.push({ t: u.text, pitch: u.pitch, lang: u.lang }); }, getVoices() { return []; }, addEventListener() {} };
    try { Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true }); } catch (e) { window.speechSynthesis = fake; }
    if (typeof window.SpeechSynthesisUtterance === 'undefined') window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  const heard = async (ms) => { await page.waitForTimeout(ms == null ? 600 : ms); return page.evaluate(() => { const o = window.__said.slice(); window.__said.length = 0; return o.map((x) => typeof x === 'string' ? x : x.t); }); };
  const has = (list, re) => list.some((t) => re.test(t));

  // off by default: nothing is said, however much happens
  await hit('#btn-help'); let h = await heard();
  check(h.length === 0 && await page.evaluate(() => READER97.on() === false && !!document.getElementById('btn-read')), 'off until asked for: the title screen has its switch, and nothing is spoken');
  await page.evaluate(() => { closeModal(); });
  // F2 turns it on from anywhere, says so, and reads the screen that is up
  await page.keyboard.press('F2'); h = await heard(900);
  check(has(h, /Reading aloud is on/) && has(h, /Echoes of the Shattered Octave/) && has(h, /Begin/) && has(h, /Load a saved game/), 'F2 turns it on, says so, and reads the title screen and its buttons (' + h.length + ' lines)');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('octave.reader.v1')).on === true && /On$/.test(document.getElementById('btn-read').textContent)), 'the choice is kept for next time, and the switch shows it');
  // making a character
  await hit('#btn-new'); h = await heard();
  check(has(h, /Who are you/), 'making a character: the question is read');
  await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await heard();
  await page.locator('.classlist button').first().hover(); h = await heard();
  check(h.length >= 2 && h[0] === '<<stop>>' && h[1].length > 8, 'whatever the pointer is on is read: a calling (' + (h[1] || '').slice(0, 40) + ')');
  await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await heard(); await hit('#c-go'); h = await heard(900);
  check(has(h, /four hundred and nineteenth year/) && has(h, /Keep your voice in your chest/), 'the opening scroll is read, every paragraph (' + h.filter((t) => t !== '<<stop>>').length + ' lines)');
  await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play'); await heard(900);

  // messages: every one, in order
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; msg('The latch is stiff.'); msg('You hear a bell.'); msg('Somebody shuts a door softly.'); });
  h = await heard();
  check(h.join('|') === 'The latch is stiff.|You hear a bell.|Somebody shuts a door softly.', 'messages are read in order, none dropped and none stopping another');
  // what you face
  await page.evaluate(() => { document.getElementById('hint').textContent = 'A worn stone step'; }); h = await heard(900);
  check(h.join('|') === 'A worn stone step', 'the line under the crosshair is read once it has stood a moment');
  await page.evaluate(() => { document.getElementById('hint').textContent = 'A worn stone step'; }); h = await heard(900);
  check(h.length === 0, 'and not read again while it has not changed');
  // a conversation: their words, their name, a pitch of their own; a second person sounds different
  const talkTo = (id) => page.evaluate((id) => { closeModal(); G.state = 'play'; window.__said.length = 0; const e = G.ents.find((x) => x.kind === 'npc' && x.id === id) || G.ents.find((x) => x.kind === 'npc'); talk(e); return { name: String(DLG.npc.name).split(',')[0], line: DLG.log.filter((l) => l.who === 'them').map((l) => String(l.t).replace(/<[^>]+>/g, ''))[0] }; }, id);
  const a = await talkTo('harrow'); await page.waitForTimeout(600);
  const saidA = await page.evaluate(() => { const o = window.__said.filter((x) => typeof x !== 'string'); window.__said.length = 0; return o; });
  const lineA = saidA.find((x) => x.t.indexOf(a.name + ' says:') === 0);
  check(!!lineA && saidA.map((x) => x.t).join(' ').replace(/\s+/g, ' ').indexOf(a.line.replace(/\s+/g, ' ').slice(0, 60)) >= 0, 'a conversation: "' + a.name + ' says:" and then what they say, whole (' + saidA.length + ' pieces)');
  await page.evaluate(() => { askTopic(TOPIC_KEYS[0]); renderDialogue('tell'); }); h = await heard();
  check(h.filter((t) => t !== '<<stop>>').length >= 1 && !has(h, /says: You're the one|says:.*says:/), 'their answer to a subject is read, and what they said before is not read again');
  const pitches = await page.evaluate(() => { const ps = []; for (const e of G.ents.filter((x) => x.kind === 'npc').slice(0, 6)) { closeModal(); G.state = 'play'; window.__said.length = 0; talk(e); READER97.scan(); const u = window.__said.find((x) => typeof x !== 'string'); if (u) ps.push(u.pitch); } closeModal(); G.state = 'play'; return ps; });
  check(new Set(pitches.map((p) => p.toFixed(3))).size >= 3 && pitches.every((p) => p >= 0.75 && p <= 1.3), 'people speak in pitches of their own (' + pitches.map((p) => p.toFixed(2)).join(', ') + ')');
  await heard();
  // an event: title, text, each choice numbered
  await page.evaluate(() => showEvent('A fork in the path', 'Two ways go on from here.', [{ t: 'Left, under the oaks' }, { t: 'Right, along the wall' }])); h = await heard();
  check(h.join('|') === '<<stop>>|A fork in the path|Two ways go on from here.|You can choose:|1: Left, under the oaks|2: Right, along the wall', 'an event: its title, its text, and each choice by number');
  await page.evaluate(() => { hide('#event'); G.state = 'play'; }); await heard();
  // a card laid over the view by a later phase is read without that phase knowing of the reader
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'pxx-card'; d.innerHTML = '<h3>The dusk bell</h3><p>Twelve strokes. Be up before the last.</p><button>Close</button>'; document.getElementById('game').appendChild(d); }); h = await heard();
  check(has(h, /^The dusk bell$/) && has(h, /Twelve strokes/) && has(h, /Close/), 'a card any module lays over the view is read, with its button');
  await page.evaluate(() => document.getElementById('pxx-card').remove()); await heard();
  // the keys
  await page.evaluate(() => msg('A lamp is lit across the square.')); await heard();
  await page.keyboard.press('F3'); h = await heard();
  check(h.join('|') === '<<stop>>|A lamp is lit across the square.', 'F3 says the last thing again');
  await page.keyboard.press('BracketLeft'); h = await heard();
  check(h.join('|') === '<<stop>>|A lamp is lit across the square.', 'and so does [');
  await page.keyboard.press('F4'); h = await heard();
  check(h.length === 2 && /^You are in Oakhaven\. Health \d+ of \d+\. It is .+\. You are facing (north|south|east|west|north-east|north-west|south-east|south-west)\./.test(h[1]), 'F4 in play says where you are, your health, the hour and the way you face: ' + (h[1] || '').slice(0, 90));
  await page.evaluate(() => renderLog()); await heard();
  await page.keyboard.press('BracketRight'); h = await heard();
  const panelText = await page.evaluate(() => document.getElementById('modal-panel').innerText.replace(/\s+/g, ' ').trim());
  check(h.length >= 2 && panelText.length > 20 && h.slice(1).join(' ').replace(/\s+/g, ' ').slice(0, 30) === panelText.replace(/\s*[·—–|]\s*/g, ', ').slice(0, 30), '] with a panel open reads the whole panel, top to bottom');
  // Options has its row
  await page.evaluate(() => renderAccessibilityMenu()); await page.waitForTimeout(300);
  check(await page.evaluate(() => { const b = document.getElementById('ac-read'); return !!b && b.textContent === 'On' && /Read everything aloud/.test(b.previousElementSibling.textContent); }), 'Options has the switch too, at the top of the accessibility list');
  // nothing chatters: a minute of ordinary play with nothing new on the page says nothing
  await page.evaluate(() => { closeModal(); G.state = 'play'; document.getElementById('hint').textContent = ''; }); await heard(900);
  await page.evaluate(() => { for (let i = 0; i < 600; i++) window.advanceTime(100); const m = document.getElementById('msgs'); window.__msgsDuring = m.children.length; }); h = await heard(900);
  const quiet = await page.evaluate(() => window.__msgsDuring);
  check(h.filter((t) => t !== '<<stop>>').length <= quiet + 2, 'a minute of play adds no chatter of its own (' + h.filter((t) => t !== '<<stop>>').length + ' lines for ' + quiet + ' messages on screen)');
  // Esc stops it; F2 turns it off and it stays silent
  await page.evaluate(() => msg('One more line.')); await heard();
  await page.keyboard.press('F2'); h = await heard();
  check(has(h, /Reading aloud is off/), 'F2 turns it off, and says so');
  await page.evaluate(() => { msg('Not read.'); showEvent('Quiet', 'Nothing is said.', [{ t: 'Good' }]); }); h = await heard();
  check(h.length === 0, 'off: nothing more is spoken');
  await page.evaluate(() => { hide('#event'); G.state = 'play'; });
  // French: the page is read in French, in a French voice
  const fr = await page.evaluate(async () => { READER97.setOn(true, true); window.__said.length = 0; try { if (typeof ACCESS !== 'undefined' && ACCESS.setLocale) await ACCESS.setLocale('fr'); else if (STORY_I18N.setLocale) await STORY_I18N.setLocale('fr'); } catch (e) { return { err: String(e) }; } return { loc: String(STORY_I18N.locale) }; });
  await page.evaluate(() => { window.__said.length = 0; READER97.readAll(); }); await page.waitForTimeout(400);
  const frSaid = await page.evaluate(() => window.__said.filter((x) => typeof x !== 'string'));
  check(fr.loc === 'fr' && frSaid.length >= 1 && /^fr/.test(frSaid[0].lang) && /Vous êtes|Santé/.test(frSaid.map((x) => x.t).join(' ')), 'in French the reader speaks French (' + (frSaid[0] ? frSaid[0].lang + ': ' + frSaid[0].t.slice(0, 60) : JSON.stringify(fr)) + ')');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
