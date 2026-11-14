// Draws the Phase 81 world plan as one chart: what is in the game, what is built, what is proposed.
// PLAYWRIGHT_MODULE=/path/to/playwright node tools/worldplan81.js <out.png>   (screenshots/world81/world-plan.jpg is this, saved as a JPEG)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const INK = '#2b2118', GREEN = '#2f6b3a', OCHRE = '#b8661c', RED = '#9c2b23', WATER = '#3f8f7a', PAPER = '#efe3c6';
const out = [];
const T = (x, y, s, o = {}) => out.push(`<text x="${x}" y="${y}" font-size="${o.size || 15}" fill="${o.fill || INK}" text-anchor="${o.anchor || 'start'}" font-style="${o.it ? 'italic' : 'normal'}" font-weight="${o.b ? 700 : 400}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${s}</text>`);
const dot = (x, y, r = 6) => out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`);
const ring = (x, y, r = 6) => out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${PAPER}" stroke="${OCHRE}" stroke-width="3"/>`);
const dia = (x, y, r = 11) => out.push(`<path d="M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z" fill="${RED}" stroke="${INK}" stroke-width="1.5"/>`);
const path = (d, col, w, dash) => out.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`);
const built = (d) => { path(d, PAPER, 9); path(d, GREEN, 5.5); };
const prop = (d) => { path(d, PAPER, 9); path(d, OCHRE, 5, '13 9'); };
const link = (d) => path(d, INK, 1.8);
const hop = (d) => path(d, INK, 1.6, '2 7');
const panel = (x, y, w, h, title, sub) => {
  out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.4"/>`);
  out.push(`<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="${INK}" stroke-width="0.6"/>`);
  T(x + 22, y + 36, title, { size: 24, b: 1, ls: 2 }); if (sub) T(x + 22, y + 57, sub, { size: 13.5, it: 1 });
};
const peak = (x, y, s) => out.push(`<path d="M${x - s} ${y} L${x - s * 0.25} ${y - s * 1.25} L${x + s * 0.1} ${y - s * 0.7} L${x + s * 0.45} ${y - s * 1.05} L${x + s} ${y}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`);
const tree = (x, y, s = 7) => out.push(`<path d="M${x} ${y + s} L${x} ${y}" stroke="${INK}" stroke-width="1.2"/><circle cx="${x}" cy="${y - s * 0.3}" r="${s * 0.7}" fill="none" stroke="${INK}" stroke-width="1.1"/>`);
const wave = (x, y, n = 3) => { let d = `M${x} ${y}`; for (let i = 0; i < n; i++) d += ` q6 -6 12 0 q6 6 12 0`; path(d, WATER, 1.3); };

// ---------------------------------------------------------------- the Reach
panel(30, 96, 1030, 874, 'THE REACH', 'outside the Hedge: walked in Parts One and Two, shut by the Greening');
for (let i = 0; i < 8; i++) peak(580 + i * 54 + (i % 2) * 6, 178 + (i % 3) * 4, 22 + (i * 7) % 9);
T(770, 138, 'the Grey Teeth', { it: 1, size: 14, anchor: 'middle' });
// the Flume: from the basin at Stillwater up through the town and over the ridge to the quarry
path('M905 812 C 880 740, 850 700, 810 640 S 720 560, 660 532 S 570 470, 548 400 S 536 300, 528 262', WATER, 3.2);
T(597, 440, 'the Flume', { it: 1, size: 13, fill: WATER });
// Oakhaven and its Hedge
out.push(`<circle cx="545" cy="512" r="64" fill="none" stroke="${GREEN}" stroke-width="7" stroke-dasharray="3 3"/>`);
out.push(`<circle cx="545" cy="512" r="64" fill="none" stroke="${INK}" stroke-width="1"/>`);
dot(545, 512, 9); T(545, 500, 'OAKHAVEN', { anchor: 'middle', b: 1, size: 16, ls: 1 }); T(545, 536, 'inside the Hedge', { anchor: 'middle', it: 1, size: 12 });
// north: the clearing, the quarry
link('M545 448 L528 345'); dot(528, 338); T(516, 366, 'the clearing', { anchor: 'end', size: 14 });
link('M528 338 L528 268'); dot(528, 262, 5); T(540, 256, 'the quarry', { size: 13 });
link('M528 338 Q 590 318 640 322'); dot(640, 322, 5); T(628, 304, 'the standing-stones', { size: 13 });
// the Greenroot road (built)
built('M532 342 C 585 372, 630 395, 690 372 S 760 318, 808 352 S 870 408, 925 368 S 975 332, 1000 350');
dot(1000, 350, 7); T(1000, 334, 'Greenroot', { anchor: 'middle', b: 1, size: 15 });
T(668, 408, 'the Long Common', { size: 13, fill: GREEN }); T(772, 318, 'the Leap', { size: 13, fill: GREEN, anchor: 'middle' }); T(870, 428, 'Greenroot Wood', { size: 13, fill: GREEN });
dot(918, 396, 4.5); T(900, 452, "Singers' Howe", { size: 12.5, it: 1 }); link('M918 396 L922 372');
T(850, 486, 'THE GREENROOT ROAD: built, about 900 steps', { size: 12.5, fill: GREEN, b: 1, anchor: 'middle' });
// the Deep Grove (lost place)
for (const [x, y] of [[880, 232], [902, 218], [926, 230], [948, 216], [912, 244], [938, 246], [866, 250]]) tree(x, y, 8);
prop('M905 368 C 890 330, 925 300, 910 262'); dia(910, 262); T(962, 268, 'the Deep Grove', { b: 1, size: 15, fill: RED }); T(962, 286, 'the lost place', { it: 1, size: 12.5 });
// west: the Downs, the drove road, Wethercombe, the Hanger
link('M522 338 Q 440 318 372 338'); dot(372, 338, 7); T(386, 318, 'the Watch Downs', { anchor: 'end', b: 1, size: 15 });
prop('M366 346 C 300 372, 250 396, 262 440 S 318 470, 286 512 S 300 548, 334 556');
T(238, 416, 'the Grey Wethers', { size: 13, fill: OCHRE, anchor: 'end' }); T(258, 534, 'the Hundred Hollows', { size: 13, fill: OCHRE, anchor: 'end' });
dia(212, 470); T(196, 462, 'the Antler', { b: 1, size: 14, fill: RED, anchor: 'end' }); T(196, 479, 'Galleries', { b: 1, size: 14, fill: RED, anchor: 'end' }); T(196, 496, 'the mine', { it: 1, size: 12.5, anchor: 'end' }); link('M222 470 L268 478');
T(60, 356, 'THE DROVE ROAD', { size: 12.5, fill: OCHRE, b: 1 }); T(60, 372, 'proposed, about 600 steps', { size: 12.5, fill: OCHRE });
dot(340, 560, 7); T(352, 584, 'Wethercombe', { b: 1, size: 15 }); T(352, 601, 'Pylon Hill, Ewe Barrow', { size: 12, it: 1 });
link('M338 566 Q 318 630 300 668'); dot(298, 672, 6); T(312, 690, 'the Hanger', { size: 14 });
for (const [x, y] of [[262, 660], [276, 690], [250, 684], [270, 712], [292, 708]]) tree(x, y, 6);
// the water-meadow
link('M528 574 L522 606'); dot(522, 609, 4.5); T(532, 628, 'the water-meadow', { size: 12.5 });
// east: the Flume road (in the game), then down to Stillwater (proposed)
link('M606 524 L668 536'); dot(672, 537, 6); T(688, 522, 'the Flume Road', { size: 14 }); T(808, 522, '(the Wash)', { size: 12, it: 1 });
prop('M680 540 C 730 560, 770 580, 790 622 S 870 650, 850 700 S 800 740, 846 770 S 880 790, 896 806');
T(866, 610, 'the Stride', { size: 13, fill: OCHRE }); T(880, 706, 'the Pound Stair', { size: 13, fill: OCHRE });
dia(742, 640); T(742, 676, 'the Dry Flume', { b: 1, size: 14, fill: RED, anchor: 'middle' }); T(742, 693, 'the dungeon', { it: 1, size: 12.5, anchor: 'middle' }); link('M752 636 L786 622');
T(930, 640, 'THE FLUME, DOWN', { size: 12.5, fill: OCHRE, b: 1 }); T(930, 656, 'TO STILLWATER', { size: 12.5, fill: OCHRE, b: 1 }); T(930, 672, 'proposed, about', { size: 12.5, fill: OCHRE }); T(930, 688, '600 steps', { size: 12.5, fill: OCHRE });
dot(900, 812, 7); T(922, 836, 'Stillwater', { b: 1, size: 15 }); T(922, 854, 'Landing', { b: 1, size: 15 }); wave(930, 800, 2);
// the Sunk Lanes and the Low Rings (old town)
prop('M890 818 C 840 850, 790 800, 740 830 S 680 800, 640 760 S 630 690, 618 660');
T(748, 868, 'the Sunk Lanes', { size: 13, fill: OCHRE, anchor: 'middle' }); T(748, 884, 'proposed, about 250 steps', { size: 12.5, fill: OCHRE, anchor: 'middle' });
dia(614, 650); T(596, 668, 'the Low Rings', { b: 1, size: 15, fill: RED, anchor: 'end' }); T(596, 685, 'the old town, drowned', { it: 1, size: 12.5, anchor: 'end' });
wave(640, 700, 2); wave(700, 790, 2); wave(790, 840, 2);

T(60, 906, 'Every proposed road keeps the three road rules: never a straight line; room to breathe;', { it: 1, size: 13 });
T(60, 925, 'a real country with one wonder added. On each: something to find, someone to meet', { it: 1, size: 13 });
T(60, 944, 'with a small task, and something that only happens at night or in bad weather.', { it: 1, size: 13 });
// ---------------------------------------------------------------- the Woods
panel(1080, 96, 490, 424, 'THE WOODS', 'Parts Three and Four');
out.push(`<path d="M1490 250 L1500 150 L1510 250" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M1478 250 Q1500 236 1522 250" fill="none" stroke="${INK}" stroke-width="1.2"/>`);
T(1500, 140, 'the Weeping Canopy', { it: 1, size: 12.5, anchor: 'middle' });
dot(1190, 318, 8); T(1184, 286, 'Whisper-Grove', { b: 1, size: 15, anchor: 'end' }); T(1184, 303, 'the Sunken Court', { size: 12.5, it: 1, anchor: 'end' });
link('M1184 322 L1140 388'); dot(1138, 392, 4.5); T(1128, 412, 'the Malting', { size: 12.5, anchor: 'middle' });
link('M1196 322 L1244 388'); dot(1246, 392, 4.5); T(1250, 412, 'the Bell Yard', { size: 12.5, anchor: 'middle' });
prop('M1198 312 C 1240 290, 1260 240, 1300 250 S 1350 220, 1372 228');
ring(1376, 228, 7); T(1376, 208, 'the Plaza of the Willows', { b: 1, size: 14, anchor: 'middle' }); T(1296, 280, 'the Willow Walks', { size: 13, fill: OCHRE });
hop('M1200 326 C 1280 372, 1360 380, 1438 396');
T(1345, 350, 'the Kestrel, four hours', { it: 1, size: 12, anchor: 'middle' });
dot(1444, 398, 7); T(1444, 424, 'the Deep Woods', { b: 1, size: 15, anchor: 'middle' }); T(1444, 440, 'the camp, the Mausoleum', { size: 12, it: 1, anchor: 'middle' });
prop('M1450 392 C 1480 372, 1500 350, 1524 338'); ring(1528, 336, 7); T(1528, 318, 'the Stump', { b: 1, size: 14, anchor: 'end' });
for (const [x, y] of [[1110, 250], [1132, 236], [1118, 470], [1160, 478], [1540, 470], [1510, 482], [1400, 480], [1440, 300]]) tree(x, y, 7);

// ---------------------------------------------------------------- the Coast
panel(1080, 546, 490, 424, 'THE COAST', 'the trip to Port Cantabile');
out.push(`<path d="M1100 746 C 1160 730, 1200 720, 1260 690 S 1380 670, 1440 640 S 1520 620, 1560 626" fill="none" stroke="${INK}" stroke-width="2.2"/>`);
for (let i = 0; i < 12; i++) { const x = 1112 + i * 38, y = 748 - i * 10.4 + (i > 3 ? -6 : 0); out.push(`<path d="M${x} ${y} l-3 12" stroke="${INK}" stroke-width="1"/>`); }
T(1524, 652, 'the cliff', { it: 1, size: 12, anchor: 'middle' });
dot(1204, 760, 8); T(1190, 782, 'Port Cantabile', { b: 1, size: 15, anchor: 'end' }); T(1190, 799, 'the harbour', { size: 12, it: 1, anchor: 'end' });
link('M1204 752 L1218 684'); dot(1220, 678, 5); T(1208, 656, 'the Salt Stair,', { size: 12.5, anchor: 'end' }); T(1208, 672, 'the counting-house', { size: 12.5, anchor: 'end' });
prop('M1226 676 C 1270 640, 1310 660, 1350 632 S 1410 600, 1436 606'); ring(1440, 606, 7); T(1446, 588, 'Harp Head', { b: 1, size: 14, anchor: 'middle' }); T(1238, 632, 'the Cliff Walk', { size: 13, fill: OCHRE });
hop('M1214 766 C 1270 800, 1320 840, 1366 870'); dot(1372, 874, 6); T(1372, 900, 'Driftwood Cay', { size: 14, anchor: 'middle' }); T(1290, 846, "Quain's boat", { it: 1, size: 12, anchor: 'end' });
wave(1110, 860, 3); wave(1440, 800, 3); wave(1180, 920, 3); wave(1470, 920, 2); wave(1300, 760, 2);

// ---------------------------------------------------------------- title and key
T(30, 46, 'ECHOES OF THE SHATTERED OCTAVE', { size: 30, b: 1, ls: 3 }); T(30, 76, 'The world plan, 13 November 2026: what is walked today, what is built, and what is proposed for the owner to rule on', { size: 16, it: 1 });
let kx = 1080, ky = 30;
built(`M${kx} ${ky + 10} l46 0`); T(kx + 56, ky + 15, 'road built', { size: 13.5 });
prop(`M${kx + 150} ${ky + 10} l46 0`); T(kx + 206, ky + 15, 'road proposed', { size: 13.5 });
link(`M${kx + 322} ${ky + 10} l40 0`); T(kx + 370, ky + 15, 'a gate or stile today', { size: 13.5 });
dot(kx + 8, ky + 44, 6); T(kx + 22, ky + 49, 'in the game now', { size: 13.5 });
dia(kx + 160, ky + 44, 9); T(kx + 176, ky + 49, 'big place proposed', { size: 13.5 });
ring(kx + 330, ky + 44, 6); T(kx + 344, ky + 49, 'new place proposed', { size: 13.5 });
T(1325, 536, 'Between the three countries there is no road. The Kestrel carries you, as in the books.', { size: 12.5, it: 1, anchor: 'middle' });

const html = `<!doctype html><html><body style="margin:0;background:${PAPER}"><svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" font-family="'Noto Serif','DejaVu Serif',serif">
<defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.12  0 0 0 0.10 0"/></filter>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#3a2408" stop-opacity="0.28"/></radialGradient></defs>
<rect width="1600" height="1000" fill="${PAPER}"/><rect width="1600" height="1000" filter="url(#grain)"/><rect width="1600" height="1000" fill="url(#vig)"/>
${out.join('\n')}</svg></body></html>`;
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await p.setContent(html); await p.waitForTimeout(400); await p.screenshot({ path: process.argv[2] }); await b.close();
})();
