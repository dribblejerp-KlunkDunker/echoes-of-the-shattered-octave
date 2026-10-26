// ============================================================
//  people25 — hand-built four-side views for the people the player sees most (Phase 25)
//
//  The owner, October 2026: painted side views for the main species. The bestiary already had them
//  (js/bestiary20a.js, js/bestiary20b.js: every enemy's own painting cut, turned on a rig and re-lit);
//  the Catalogue Proctor (kept on its pilot stand-ins), the companions and the townsfolk did not. This
//  file rigs them the same way, with js/bestiary20b.js's humanoid kit: the body and head as stacks of
//  sections whose width is the painted silhouette and whose depth is authored per band, the arms,
//  staff, jug and boots cut out of the painting and re-hung in 3D, the back painted from the figure's
//  own cloth. js/pixel3d.js asks BEASTB.view(name, 2 or 4, pose) for these names and shows the result
//  for the entity's side or back; the front stays the painting. Nothing here draws per frame, nothing
//  is saved; the Proctor's own stand-in chain (js/anim.js) is untouched for the painted-art-off case.
// ============================================================
'use strict';

(() => {
  if (typeof BEASTB === 'undefined' || !BEASTB.rig) return;
  const L = BEASTB.lib, SP = BEASTB.SPECIES, { humanoid, arm, stride, hangArm } = BEASTB.rig;
  const { paintOut, drawAlong, drawCut, mul } = L;

  // ---------------------------------------------------------------- Catalogue Proctor
  // A grey robe to the ground, a deep hood with the face in its dark, a tall iron staff in the right
  // hand, a stylus in the left. Attack (the painted frames): the staff raised overhead in both hands (a1)
  // and brought down (a2).
  SP.proctor = humanoid({
    W: 108, axT: 52, knee: 112, hip: 96,
    patches: { cloth: [24, 100, 16, 30], hood: [24, 18, 10, 12], sleeve: [10, 62, 8, 16] },
    sil: [[[22, 2], [42, 2], [49, 40], [55, 60], [57, 100], [59, 148], [6, 148], [8, 100], [10, 60], [15, 40]]],
    lift: [
      { poly: [[[0, 0], [21, 0], [21, 148], [0, 148]]], axis: 21.5 },
      { poly: [[[50, 28], [63, 28], [63, 72], [50, 72]]], axis: 49.5 },
    ],
    body: { mask: [[[0, 44], [63, 44], [63, 150], [0, 150]]], depth: (y, al) => (y < 70 ? al * 0.64 : al * 0.72), fwd: y => (y > 120 ? 1 : 0) },
    head: { mask: [[[12, 0], [52, 0], [54, 44], [10, 44]]], depth: (y, al) => al * 1.0, fwd: y => (y < 10 ? -3 : 0) },
    cuts: {
      staff: [[[[8, 0], [23, 0], [23, 150], [8, 150]]], [15, 62], null, [0, -60]],
      hand: [[[[11, 52], [27, 52], [27, 72], [11, 72]]], [19, 62]],
      armL: [[[[48, 28], [63, 28], [63, 74], [48, 74]]], [54, 34]],
      bootR: [[[[8, 146], [32, 146], [32, 160], [8, 160]]], [20, 147]],
      bootL: [[[[34, 146], [57, 146], [57, 160], [34, 160]]], [45, 147]],
    },
    legs(x) { stride(x, x.S.cut.bootR, x.S.cut.bootL, -11, 11, 147); },
    back(B, S) {
      paintOut(B, [[[22, 6], [44, 6], [47, 44], [19, 44]]], S.pt.hood, { grain: 0.15, smooth: 60 });
      paintOut(B, [[[26, 60], [40, 60], [40, 110], [26, 110]]], S.pt.cloth, { vertical: true, like: S.pt.cloth.mean, tol: 60, grain: 0.5 });
      const ax = Math.round(S.ax);
      for (let y = 4; y < 44; y++) { const i = y * B.w + ax; if (L.solidPx ? L.solidPx(B.data[i]) : (B.data[i] >>> 24) > 100) B.data[i] = mul(B.data[i], 0.8); }   // the hood's back seam
    },
    dress(x) {
      const { C, S, th, axT, P, v } = x, shY = x.row(48), sw = (P.swing || 0) * 6;
      if (!x.atk) {
        const hand = { f: 18, l: -20, y: x.row(62) };   // held a little ahead, so the staff shows beside the robe in profile
        arm(x, { f: 4, l: -17, y: shY }, hand, { pt: 'sleeve', w0: 12, w1: 10, w2: 9, bend: -2, id: 30, hand: S.cut.hand });
        drawAlong(C, S.cut.staff, th, axT, hand, { f: 0.04 * (P.swing || 0), l: 0, up: 1 }, { dz: x.front + 12, id: 40 });
        hangArm(C, S.cut.armL, th, axT, P, v, 19, x.row(34), -sw, 22);
        return;
      }
      // both hands on the staff: raised overhead (a1), brought down and forward (a2)
      const up = x.atk === 1;
      const hand = up ? { f: 8, l: -4, y: x.row(22) } : { f: 24, l: 0, y: x.row(76) };
      for (const l of [-17, 17]) arm(x, { f: 0, l, y: shY }, hand, { pt: 'sleeve', w0: 12, w1: 10, w2: 9, bend: up ? 2 : -3, id: l < 0 ? 30 : 34, hand: l < 0 ? S.cut.hand : null });
      drawAlong(C, S.cut.staff, th, axT, hand, up ? { f: 0.65, l: 0, up: 0.75 } : { f: 0.95, l: 0, up: -0.3 }, { dz: x.front + 12, id: 40 });
    },
  });
  // ---------------------------------------------------------------- Kaelen
  // The companion: a long dark coat, dark hair, the right arm of living glass that glows cyan. Attack:
  // the glass arm drawn back (a1) and driven forward (a2).
  SP.kaelen = humanoid({
    W: 104, axT: 50, knee: 112, hip: 96,
    patches: { cloth: [22, 100, 12, 24], sleeve: [8, 56, 8, 20], hair: [24, 4, 10, 10], glass: [45, 52, 8, 16] },
    sil: [[[22, 0], [40, 0], [48, 30], [50, 60], [50, 130], [12, 130], [10, 60], [12, 30]]],
    lift: [
      { poly: [[[0, 36], [19, 36], [19, 104], [0, 104]]], axis: 19.5 },
      { poly: [[[42, 28], [60, 28], [60, 104], [42, 104]]], axis: 41.5 },
    ],
    body: { mask: [[[0, 28], [60, 28], [60, 148], [0, 148]]], smooth: 1, depth: (y, al) => (y < 60 ? al * 0.62 : al * 0.64), fwd: y => (y > 128 ? 1 : 0) },
    head: { mask: [[[14, 0], [48, 0], [48, 28], [14, 28]]], depth: (y, al) => al * 1.0, fwd: y => (y < 8 ? -2 : 0) },
    cuts: {
      armR: [[[[0, 36], [19, 36], [19, 104], [0, 104]]], [10, 42]],
      armL: [[[[42, 28], [60, 28], [60, 104], [42, 104]]], [50, 34]],
      bootR: [[[[12, 146], [31, 146], [31, 160], [12, 160]]], [21, 147]],
      bootL: [[[[31, 146], [50, 146], [50, 160], [31, 160]]], [40, 147]],
    },
    legs(x) { stride(x, x.S.cut.bootR, x.S.cut.bootL, -9, 9, 147); },
    back(B, S) {
      paintOut(B, [[[18, 0], [44, 0], [46, 28], [16, 28]]], S.pt.hair, { grain: 0.3, smooth: 40 });
      paintOut(B, [[[22, 30], [40, 30], [40, 124], [22, 124]]], S.pt.cloth, { vertical: true, like: S.pt.cloth.mean, tol: 60, grain: 0.5 });
    },
    dress(x) {
      const { C, S, th, axT, P, v } = x, shY = x.row(40), sw = (P.swing || 0) * 7;
      hangArm(C, S.cut.armR, th, axT, P, v, -19, shY, sw, 21);
      if (!x.atk) { hangArm(C, S.cut.armL, th, axT, P, v, 19, shY, -sw, 22); return; }
      hangArm(C, S.cut.armL, th, axT, P, v, 19, shY, x.atk === 1 ? -24 : 30, 22);
    },
  });

  // ---------------------------------------------------------------- Lyra
  // The companion: red hair in a braid, a green shawl over a brown dress, the hands clasped at the
  // waist. Attack (she has the frames): the hands raised (a1) and thrown forward (a2).
  SP.lyra = humanoid({
    W: 100, axT: 48, knee: 112, hip: 96,
    patches: { cloth: [20, 110, 12, 24], shawl: [10, 46, 8, 14], hair: [15, 8, 6, 12], sleeve: [8, 60, 8, 14] },
    sil: [[[18, 0], [36, 0], [44, 30], [50, 60], [48, 100], [52, 150], [4, 150], [6, 100], [4, 60], [10, 30]]],
    lift: [{ poly: [[[22, 46], [34, 46], [34, 60], [22, 60]]], pt: 'shawl', tol: 70 }],
    body: { mask: [[[0, 30], [53, 30], [53, 150], [0, 150]]], depth: (y, al) => (y < 80 ? al * 0.66 : al * 0.62), fwd: y => (y > 120 ? 1 : 0) },
    head: { mask: [[[10, 0], [44, 0], [44, 30], [10, 30]]], depth: (y, al) => al * 1.0, fwd: y => (y < 10 ? -2 : 0) },
    cuts: {
      hands: [[[[22, 46], [34, 46], [34, 60], [22, 60]]], [28, 48]],
      bootR: [[[[12, 150], [27, 150], [27, 160], [12, 160]]], [19, 151]],
      bootL: [[[[27, 150], [42, 150], [42, 160], [27, 160]]], [34, 151]],
    },
    legs(x) { stride(x, x.S.cut.bootR, x.S.cut.bootL, -7, 7, 151, 5); },
    back(B, S) {
      paintOut(B, [[[14, 2], [40, 2], [40, 30], [14, 30]]], S.pt.hair, { grain: 0.3, smooth: 40 });
      paintOut(B, [[[18, 32], [36, 32], [36, 80], [18, 80]]], S.pt.shawl, { grain: 0.4, smooth: 60 });
    },
    dress(x) {
      const { C, S, th, axT } = x;
      const at = !x.atk ? { f: 8, l: 0, y: x.row(46) } : x.atk === 1 ? { f: 6, l: 0, y: x.row(34) } : { f: 20, l: 0, y: x.row(50) };
      drawCut(C, S.cut.hands, th, axT, at.f, at.l, at.y, 0, { dz: x.front + 2, mirror: x.back, shade: x.back ? 0.85 : 1, id: 30 });
    },
  });

  // ---------------------------------------------------------------- townsman
  // A working man of Oakhaven: a cap, a pale shirt with the sleeves rolled, a leather apron, boots.
  SP.townsman = humanoid({
    W: 104, axT: 50, knee: 112, hip: 100,
    patches: { cloth: [22, 80, 14, 24], shirt: [20, 36, 10, 10], sleeve: [6, 50, 8, 18], cap: [26, 4, 8, 8] },
    sil: [[[20, 0], [42, 0], [48, 30], [46, 110], [48, 146], [12, 146], [14, 110], [14, 30]]],
    lift: [
      { poly: [[[0, 36], [16, 36], [16, 104], [0, 104]]], axis: 16.5 },
      { poly: [[[44, 36], [60, 36], [60, 104], [44, 104]]], axis: 43.5 },
    ],
    body: { mask: [[[0, 30], [60, 30], [60, 112], [0, 112]]], depth: (y, al) => al * 0.6, fwd: () => 0 },
    head: { mask: [[[14, 0], [46, 0], [48, 30], [12, 30]]], depth: (y, al) => al * 1.0, fwd: y => (y < 8 ? -2 : 0) },
    cuts: {
      armR: [[[[0, 36], [16, 36], [16, 104], [0, 104]]], [8, 40]],
      armL: [[[[44, 36], [60, 36], [60, 104], [44, 104]]], [52, 40]],
      legR: [[[[10, 110], [30, 110], [30, 160], [10, 160]]], [20, 112]],
      legL: [[[[30, 110], [52, 110], [52, 160], [30, 160]]], [41, 112]],
    },
    legs(x) { stride(x, x.S.cut.legR, x.S.cut.legL, -9, 9, 112, 7); },
    back(B, S) {
      paintOut(B, [[[16, 0], [44, 0], [46, 30], [14, 30]]], S.pt.cap, { grain: 0.3, smooth: 40 });
      paintOut(B, [[[20, 32], [42, 32], [42, 72], [20, 72]]], S.pt.shirt, { grain: 0.4, smooth: 60 });
    },
    dress(x) {
      const { C, S, th, axT, P, v } = x, shY = x.row(40), sw = (P.swing || 0) * 7;
      hangArm(C, S.cut.armR, th, axT, P, v, -19, shY, sw, 21);
      hangArm(C, S.cut.armL, th, axT, P, v, 19, shY, -sw, 22);
    },
  });

  // ---------------------------------------------------------------- townswoman
  // A woman of Oakhaven: a white headscarf, a dark dress with an apron, a clay jug held on the hip.
  SP.townswoman = humanoid({
    W: 100, axT: 48, knee: 112, hip: 100,
    patches: { cloth: [10, 60, 8, 14], apron: [20, 100, 12, 24], scarf: [24, 6, 8, 8], sleeve: [6, 50, 6, 16] },
    sil: [[[16, 0], [40, 0], [46, 32], [48, 100], [50, 150], [6, 150], [8, 100], [10, 32]]],
    lift: [
      { poly: [[[0, 36], [14, 36], [14, 104], [0, 104]]], axis: 14.5 },
      { poly: [[[30, 34], [55, 34], [55, 74], [30, 74]]], axis: 29.5 },
    ],
    body: { mask: [[[0, 32], [55, 32], [55, 150], [0, 150]]], depth: (y, al) => al * 0.62, fwd: y => (y > 120 ? 1 : 0) },
    head: { mask: [[[10, 0], [46, 0], [46, 32], [10, 32]]], depth: (y, al) => al * 1.0, fwd: y => (y < 8 ? -2 : 0) },
    cuts: {
      armL: [[[[0, 36], [14, 36], [14, 104], [0, 104]]], [7, 40]],
      jug: [[[[30, 34], [55, 34], [55, 74], [30, 74]]], [36, 40]],
      bootR: [[[[10, 150], [27, 150], [27, 160], [10, 160]]], [18, 151]],
      bootL: [[[[27, 150], [44, 150], [44, 160], [27, 160]]], [36, 151]],
    },
    legs(x) { stride(x, x.S.cut.bootR, x.S.cut.bootL, -7, 7, 151, 5); },
    back(B, S) {
      paintOut(B, [[[12, 0], [44, 0], [46, 32], [10, 32]]], S.pt.scarf, { grain: 0.3, smooth: 40 });
      paintOut(B, [[[14, 76], [44, 76], [46, 150], [12, 150]]], S.pt.cloth, { grain: 0.25, smooth: 90 });   // the apron is front only: the dress's own cloth behind
    },
    dress(x) {
      const { C, S, th, axT, P, v } = x, shY = x.row(40), sw = (P.swing || 0) * 6;
      hangArm(C, S.cut.armL, th, axT, P, v, -18, shY, sw, 21);
      drawCut(C, S.cut.jug, th, axT, 10, 14, x.row(40), 0, { dz: x.front + 3, mirror: x.back, shade: x.back ? 0.85 : 1, id: 32 });
    },
  });
})();
