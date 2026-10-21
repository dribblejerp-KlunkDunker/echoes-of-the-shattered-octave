// ============================================================
//  light21 — Phase 21 "Wow", team LIGHT: the look of the true 3D renderer (R3D, js/r3d21.js).
//
//  Written against the R3D CONTRACT at the top of js/r3d21.js. Nothing here runs unless R3D draws the frame: the CPU
//  raycaster (the fallback, Original, no WebGL2) is untouched, and so is every saved, gameplay or story value.
//  Art direction (the brief, the research doc's "HD-2D in first person"): keep the pixel art (textures nearest, the sky
//  and its painted country drawn at the game's own logical pixel), but light it like a modern game: warm lamp pools,
//  long soft sun shadows at dusk, light shafts, depth fog that is the colour of the sky behind it, bloom only on what
//  glows, layered clouds, a sun, a moon with its phase, stars, and the Octave lights. No heavy blur, no heavy particles.
//
//  WHAT IT REPLACES (R3D.setChunk / R3D.addPass, so CORE's pieces stay the fallback if a shader fails to compile):
//    chunk 'shade' (every lit surface: world kind 0, sprites kind 1, the body kind 2):
//       - outdoors: a hemisphere ambient (sky above, ground bounce below) by the hour and the weather, the sun by day and
//         the moon by night as a directional light with N.L, and SHADOWS: the sun ray is marched through the map's cell
//         heights (a heightfield of wall tops and ground, uploaded per map; exact for the grid world, no shadow-map
//         resolution), with a penumbra that widens with distance and with a low sun (long soft shadows at dusk).
//         Lighting positions are snapped to the texel grid, so light and shadow edges stay pixel art.
//       - the game's point lights (lamps, torches, braziers, fires, Light-glass, the player's lantern) per pixel, with
//         their wall masks (CORE's per-cell bits), a lamp height and N.L, so lamps make pools on the ground and light
//         the faces turned to them.
//       - indoors: the raycaster's own distance-to-dark base light (readability is kept), with the lamps on top.
//       - depth fog to the colour of the sky toward that direction (the horizon, warm toward a low sun); a height fog
//         that hugs the ground for mist and the Cinematic ground fog; distances follow the game's view distance exactly.
//       - water: a reflection of the sky (and the sun's glitter) through rippled normals, with Fresnel.
//       - emissive pixels (glow masks, Light-glass, lit windows) go above 1.0, which is what the bloom keys on.
//    pass 'sky' (order 0): the sky dome, rendered at the game's logical resolution (320 x 150, or twice that on High and
//       above) and laid in nearest, so it is pixel art like the panoramas: a gradient by hour, a sun glow, two layers of
//       drifting cloud from the weather (pixel-quantised with an ordered dither), stars, the moon with the calendar's
//       phase, the sun's disc, the Octave lights on the nights js/skies14.js picks, lightning in the clouds, and the
//       Phase 20 pixel-art panoramas (js/sky.js, with the LANDMARKS ridges baked in) as distant layers mixed into the air;
//       with panoramas off, CORE's 'landmarks' ridges.
//    pass 'post' (order 90): bloom on emissives and HDR highlights only (aux target g / material 8, plus what is above
//       1.0), light shafts from the sun through the sky mask, a soft shoulder tone curve (mid-tones stay as the CPU drew
//       them), the per-area, per-hour colour grade of js/post.js (the same table), Cinematic's grade (js/cinema14.js
//       numbers), a subtle vignette, the Deep's underwater tint, ordered dither against banding.
//
//  CPU post hooks (FI.fb passes) under R3D: ported here — post.js grade and bloom, cinema14 grade/vignette/light/fog,
//  sky.js stars/panoramas, skies14 aurora, calendar11 moon phase, engine sky/sun/moon/clouds, deep16 underwater tint (a
//  tint, not its full view). Left CPU-only (not drawn under R3D): sky.js Kestrel flyover, synod15 eclipse disc (its
//  darkening still arrives through the weather light), skies14 caustics, air11 heat haze/glare/breath, post.js mist
//  bands and reflections (replaced by the height fog and the water shader), festivals12 lantern glows, winter17 frost,
//  flume16/heist16 overlays, look10 marks (SPRITES), ghost18 (SPRITES/CARD). See LIGHT21.ported.
//
//  Switches (existing GFX flags, so the Options rows and presets keep meaning): bloom or cineLight -> bloom;
//  sunShafts or cineLight -> shafts; grade -> the area grade; cineGrade -> Cinematic grade and vignette; mist, softFog,
//  cineFog -> height fog; reflections -> water reflection; stars, panoramas, aurora, moonPhase as named. New:
//  GFX.p21_shadows (sun/moon shadows) and GFX.p21_clouds (cloud layers), on in every preset but Original.
//  Loaded after js/r3d21.js (its own script tag). No assets: everything is drawn here or comes from the game.
// ============================================================
'use strict';

for (const k of ['p21_shadows', 'p21_clouds']) {
  if (typeof GFX !== 'undefined') { if (GFX[k] === undefined) GFX[k] = true; if (GFX.FX && !GFX.FX.includes(k)) GFX.FX.push(k); }
}

const LIGHT21 = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('light21 ' + k, e); } };
  const flag = (k) => typeof GFX !== 'undefined' && GFX[k] === true;
  const stats = { frames: 0, ms: 0, sky: 0, post: 0, shadows: false, clouds: 0, panoLayers: 0, bloom: false, shafts: false, grade: false, installed: false, failed: '' };
  const ported = {
    ported: ['post.js grade', 'post.js bloom', 'cinema14 grade + vignette', 'cinema14 light (bloom, rays)', 'cinema14 ground fog', 'sky.js stars', 'sky.js panoramas (+ LANDMARKS ridges)', 'skies14 aurora', 'calendar11 moon phase', 'engine sky, clouds, sun and moon', 'deep16 underwater (tint)', 'water (reflections)'],
    cpuOnly: ['sky.js Kestrel flyover', 'synod15 eclipse disc (the dimming still comes through the weather light)', 'skies14 caustics', 'air11 heat haze, glare, breath', 'post.js mist bands', 'festivals12 lantern glows', 'extras17 winter17 frost', 'flume16 / heist16 overlays'],
  };
  if (typeof R3D === 'undefined' || !R3D.setChunk || !R3D.addPass) return { stats, ported, available: false };

  const ZK = R3D.ZK, FX = R3D.FX;

  // ------------------------------------------------------------------------------------------------ the hour's light
  // Colour keys by time of day (0 midnight, 0.25 dawn, 0.5 noon, 0.75 dusk): the Reach's pale, fading Light by day,
  // ember dusks, deep indigo nights. Linear interpolation between keys, wrapping.
  const KEYS = [
    // tod   zenith            horizon           glow (sun halo)    ambient sky        sun colour
    [0.00, [6, 8, 22], [22, 26, 46], [40, 50, 90], [26, 30, 52], [0, 0, 0]],
    [0.20, [10, 12, 32], [44, 40, 66], [120, 90, 110], [30, 32, 56], [0, 0, 0]],
    [0.25, [44, 56, 104], [214, 136, 104], [255, 170, 120], [86, 76, 96], [255, 150, 90]],
    [0.31, [84, 120, 172], [196, 188, 180], [255, 220, 170], [118, 120, 128], [255, 222, 170]],
    [0.50, [86, 126, 184], [194, 202, 210], [255, 244, 214], [128, 132, 140], [255, 246, 226]],
    [0.66, [84, 116, 170], [206, 192, 164], [255, 226, 170], [124, 122, 124], [255, 228, 180]],
    [0.72, [58, 66, 124], [214, 140, 96], [255, 168, 96], [118, 100, 112], [255, 166, 100]],
    [0.76, [34, 32, 76], [160, 86, 80], [230, 110, 70], [86, 70, 92], [240, 116, 70]],
    [0.80, [16, 16, 44], [64, 44, 70], [110, 70, 100], [36, 34, 60], [0, 0, 0]],
    [0.88, [7, 9, 26], [26, 28, 50], [44, 52, 92], [26, 30, 52], [0, 0, 0]],
    [1.00, [6, 8, 22], [22, 26, 46], [40, 50, 90], [26, 30, 52], [0, 0, 0]],
  ];
  function keyAt(tod, slot) {
    tod = ((tod % 1) + 1) % 1;
    let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= tod) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = (tod - a[0]) / Math.max(1e-6, b[0] - a[0]);
    return [mix(a[slot][0], b[slot][0], t) / 255, mix(a[slot][1], b[slot][1], t) / 255, mix(a[slot][2], b[slot][2], t) / 255];
  }

  // per-frame parameters, worked out on the CPU once (the shaders only read them)
  const P = {
    sun: [0, 0, 1], sunC: [0, 0, 0], soft: 0.06, sunD: [0, 0, 1], sunVis: 0, moonD: [0, 0, 1], moonIll: 1, moonVis: 0,
    zen: [0, 0, 0], hor: [0, 0, 0], glow: [0, 0, 0], ambS: [0, 0, 0], ambG: [0, 0, 0],
    fog: [1, 0, 0.4, 2], pt: [1.25, 0.6, 0, 1], t: [0, 0, 0, 1], shadowOn: false, maxH: 1, night: 0,
    cl: [0.2, 0, 0, 0], sky2: [0, 0, 0, 1], aur: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], panoAir: [0, 0, 0, 1], panoGlow: 0, panoOn: false,
    flash: 0, wet: 0, snow: 0, underwater: 0,
  };
  const WX = () => { try { return typeof Weather !== 'undefined' && Weather ? Weather.state : 'clear'; } catch (e) { return 'clear'; } };
  function dir3(az, el) { const c = Math.cos(el); return [Math.cos(az) * c, Math.sin(az) * c, Math.sin(el)]; }
  function frameParams(F) {
    const env = F.env || {}, wx = env.wx || { haze: 0, dark: 0, cloud: 0, flash: 0 };
    const tod = F.tod == null ? 0.5 : F.tod;
    // the engine's sun and moon geometry (render(): sunA, elev); elevations as the angle the disc is drawn at
    const sunA = (tod - 0.25) * TAU, elev = Math.cos((tod - 0.5) * TAU);
    const sunEl = elev * 1.05;                              // radians: noon about 60 degrees, dusk a few degrees
    P.sunD = dir3(sunA, sunEl);
    const moonEl = Math.max(0.18, Math.min(0.8, -elev)) * 1.05;
    P.moonD = dir3(sunA + Math.PI, elev < 0.02 ? moonEl : -0.3);
    const day = smooth(-0.06, 0.2, elev), night = 1 - smooth(-0.2, 0.05, elev);
    P.night = night;
    const cloud = clamp(wx.cloud || 0, 0, 1), dark = clamp(wx.dark || 0, 0, 1), haze = clamp(wx.haze || 0, 0, 1);
    // the moon's phase (js/calendar11.js: one phase a day, day 0 waxing gibbous, idx 4 full)
    const idx = (((typeof G !== 'undefined' && G ? G.day | 0 : 0) + 3) % 8 + 8) % 8;
    P.moonIll = flag('moonPhase') || (typeof GFX !== 'undefined' && GFX.moonPhase === undefined) ? (1 - Math.cos(idx * Math.PI / 4)) / 2 : 1;
    P.moonWax = idx < 4 ? 1 : -1;
    // direct light: the sun by day, the moon by night
    const sunCol = keyAt(tod, 5), direct = (1 - cloud * 0.78) * (1 - dark * 0.7);
    if (day > 0.02) {
      P.sun = dir3(sunA, Math.max(0.035, sunEl));
      const k = day * 0.78 * direct;
      P.sunC = [sunCol[0] * k, sunCol[1] * k, sunCol[2] * k];
    } else {
      P.sun = dir3(sunA + Math.PI, moonEl);
      const k = night * 0.2 * (0.3 + 0.7 * P.moonIll) * direct;
      P.sunC = [0.55 * k, 0.64 * k, 0.9 * k];
    }
    // long soft shadows at dusk: the penumbra widens as the light drops; overcast nearly removes them (the light is spread)
    P.soft = mix(0.03, 0.12, 1 - smooth(0.05, 0.6, Math.abs(elev))) + cloud * 0.25;
    P.sunVis = day * (1 - cloud * 0.85) * (1 - dark * 0.6);
    P.moonVis = night * (1 - cloud * 0.9);
    // the sky's colours, then the weather: cloud greys it toward the weather's tint, haze thickens it, dark presses it down
    let zen = keyAt(tod, 1), hor = keyAt(tod, 2), glow = keyAt(tod, 3), amb = keyAt(tod, 4);
    const tint = [(wx.tr || 196) / 255, (wx.tg || 200) / 255, (wx.tb || 214) / 255];
    const grey = clamp(cloud * 0.7 + haze * 1.6, 0, 0.92), lum = (c) => c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    const toward = (c, k) => { const l = lum(c), g = [tint[0] * (0.25 + l), tint[1] * (0.25 + l), tint[2] * (0.25 + l)]; return [mix(c[0], g[0] * 0.8, k), mix(c[1], g[1] * 0.8, k), mix(c[2], g[2] * 0.8, k)]; };
    zen = toward(zen, grey); hor = toward(hor, grey * 0.85);
    const dk = (1 - dark * 0.62);
    const fl = clamp(wx.flash || 0, 0, 1);
    P.flash = fl;
    for (const c of [zen, hor]) { c[0] = c[0] * dk + fl * 0.5; c[1] = c[1] * dk + fl * 0.5; c[2] = c[2] * (1 - dark * 0.45) + fl * 0.55; }
    P.zen = zen; P.hor = hor;
    P.glow = [glow[0] * P.sunVis, glow[1] * P.sunVis, glow[2] * P.sunVis];
    // ambient: the sky's light from above and a warmer, darker bounce from the ground; overcast spreads the sun into it
    const spread = 1 + cloud * 0.45 + haze * 0.3;
    P.ambS = [amb[0] * spread * dk + fl * 0.4, amb[1] * spread * dk + fl * 0.4, amb[2] * spread * (1 - dark * 0.45) + fl * 0.45];
    P.ambG = [P.ambS[0] * 0.62 + sunCol[0] * day * 0.06, P.ambS[1] * 0.55 + sunCol[1] * day * 0.05, P.ambS[2] * 0.48];
    // the scale of everything: the engine's own light level keeps the two renderers equally bright on average
    // fog: the height fog (mist, Cinematic ground fog, soft fog) and its height above the feet
    const hf = (flag('mist') || flag('softFog') ? 0.16 : 0) + (flag('cineFog') ? 0.22 : 0) + (WX() === 'mist' ? 0.35 : 0) + haze * 0.6;
    P.fog = [1, F.outdoor ? hf : hf * 0.4, 0.22 * ZK, P.maxH];
    P.shadowOn = !!(F.outdoor && flag('p21_shadows') && hgt.ok && (P.sunC[0] + P.sunC[1] + P.sunC[2]) > 0.01);
    P.pt = [1.35, 0.62 * ZK, 1, flag('reflections') ? 1 : 0];
    P.t = [F.now || 0, F.time || 0, 0, 1];
    // clouds: cover from the weather; wind from Weather.wind
    const wind = typeof Weather !== 'undefined' ? (Weather.wind || 0.2) : 0.2;
    P.cl = [clamp(0.18 + cloud * 0.95, 0, 1), wind, dark, flag('p21_clouds') ? 1 : 0];
    // stars: night, thinned by cloud and haze; aurora from js/skies14.js's plan for tonight
    P.sky2 = [flag('stars') || (typeof GFX !== 'undefined' && GFX.stars === undefined) ? night * clamp(1 - cloud * 1.3, 0, 1) * clamp(1 - haze * 3, 0, 1) * (1 - fl) : 0, 0, fl, F.pxK || 1];
    try {
      if (night > 0.3 && flag('aurora') && typeof SKIES14 !== 'undefined' && SKIES14.aurora && SKIES14.aurora.plan && typeof G !== 'undefined' && F.outdoor) {
        const plan = SKIES14.aurora.plan(G.day | 0, G.tod, G.flags || {});
        if (plan && plan.notes) {
          const N = SKIES14.aurora.NOTES || [];
          for (let i = 0; i < 3; i++) { const n = N[plan.notes[i % plan.notes.length]]; P.aur[i] = n ? n.rgb.map(v => v / 255) : [0.3, 0.6, 0.4]; }
          P.sky2[1] = (plan.amp || 0.6) * night * clamp(1 - cloud * 1.4, 0, 1);
        }
      }
    } catch (e) { warnOnce('aurora', e); }
    // the panoramas' air: the horizon colour half and the map's fog half, as js/sky.js mixes it
    const fp = (env.fogPx >>> 0) || 0;
    P.panoAir = [(hor[0] + ((fp & 255) / 255)) * 0.5, (hor[1] + (((fp >>> 8) & 255) / 255)) * 0.5, (hor[2] + (((fp >>> 16) & 255) / 255)) * 0.5, (0.34 + 0.66 * (env.skyDay == null ? 1 : env.skyDay)) * (1 - dark * 0.45)];
    P.panoGlow = night > 0.25 && haze < 0.25 ? night * (1 - haze * 3) * 0.85 : 0;
    P.panoHaze = haze * 0.7;
    P.panoOn = flag('panoramas') && pano.ok && pano.n > 0;
    P.wet = WX() === 'rain' || WX() === 'storm' ? 1 : 0;
    P.snow = WX() === 'snow' ? 1 : 0;
    try { P.underwater = typeof DEEP16 !== 'undefined' && DEEP16.underwater && DEEP16.underwater() ? 1 : 0; } catch (e) { P.underwater = 0; }
  }

  // ------------------------------------------------------------------------------------------------ the shade chunk
  const SHADE = `
uniform highp usampler2D uLVis;
uniform highp sampler2D uL21H;
uniform vec4 uL21Sun; uniform vec4 uL21SunC; uniform vec4 uL21SunD; uniform vec4 uL21MoonD;
uniform vec3 uL21Zen; uniform vec3 uL21Hor; uniform vec3 uL21Glow; uniform vec3 uL21AmbS; uniform vec3 uL21AmbG;
uniform vec4 uL21Fog; uniform vec4 uL21P; uniform vec4 uL21T;
// CORE's lamp sum, kept under its own name for any program that calls it
vec3 r3dPointLight(vec2 p) {
  int n = int(uView2.w); if (n <= 0) return vec3(0.0);
  ivec2 c = ivec2(floor(p)); uint bits = 0u;
  if (c.x >= 0 && c.y >= 0 && float(c.x) < uMap.x && float(c.y) < uMap.y) bits = texelFetch(uLVis, c, 0).r;
  if (bits == 0u) return vec3(0.0);
  vec3 s = vec3(0.0);
  for (int i = 0; i < 32; i++) {
    if (i >= n) break;
    if ((bits & (1u << uint(i))) == 0u) continue;
    vec2 d = p - uLP[i].xy; float d2 = dot(d, d);
    if (d2 < uLP[i].z) { float k = 1.0 - d2 / uLP[i].z; s += uLC[i].rgb * (k * k); }
  }
  return min(s, vec3(90.0 / 255.0));
}
// the sky's colour toward a direction (gradient and the sun's halo; no clouds): the fog and the reflections use it
vec3 l21SkyCol(vec3 d) {
  d = normalize(d);
  float e = d.z;
  float t = pow(1.0 - clamp(e, 0.0, 1.0), 4.5);
  vec3 c = mix(uL21Zen, uL21Hor, t);
  if (e < 0.0) c = mix(uL21Hor, uL21Hor * 0.82, clamp(-e * 3.0, 0.0, 1.0));
  float sd = max(0.0, dot(d, uL21SunD.xyz));
  c += uL21Glow * (pow(sd, 5.0) * 0.32 + pow(sd, 40.0) * 0.5) * (1.0 - clamp(e, 0.0, 1.0) * 0.6);
  return c;
}
// the sun's ray marched through the map's cell heights: 1 lit, 0 in shadow, a penumbra by how narrowly it clears
float l21Shadow(vec3 p, vec3 L) {
  if (uL21Sun.w < 0.5 || L.z <= 0.0) return 1.0;
  float lxy = length(L.xy); if (lxy < 1e-4) return 1.0;
  vec2 d = L.xy / lxy; float rise = L.z / lxy;
  ivec2 c = ivec2(floor(p.xy));
  vec2 st = vec2(d.x >= 0.0 ? 1.0 : -1.0, d.y >= 0.0 ? 1.0 : -1.0);
  vec2 inv = vec2(abs(d.x) > 1e-5 ? 1.0 / abs(d.x) : 1e9, abs(d.y) > 1e-5 ? 1.0 / abs(d.y) : 1e9);
  vec2 tMax = vec2(d.x >= 0.0 ? (float(c.x) + 1.0 - p.x) : (p.x - float(c.x)), d.y >= 0.0 ? (float(c.y) + 1.0 - p.y) : (p.y - float(c.y))) * inv;
  float sh = 1.0, t = 0.0;
  for (int i = 0; i < 40; i++) {
    if (tMax.x < tMax.y) { t = tMax.x; tMax.x += inv.x; c.x += int(st.x); } else { t = tMax.y; tMax.y += inv.y; c.y += int(st.y); }
    if (c.x < 0 || c.y < 0 || float(c.x) >= uMap.x || float(c.y) >= uMap.y) break;
    float z = p.z + rise * t;
    if (z > uL21Fog.w) break;
    float h = texelFetch(uL21H, c, 0).r;
    float clear = z - h;
    if (clear < 0.0) return 0.0;
    sh = min(sh, clear / (t * uL21SunC.w + 0.02));
  }
  return clamp(sh, 0.0, 1.0);
}
// the game's point lights per pixel: each at a lamp's height, its reach and colour as the engine has them, N.L
vec3 l21Points(vec3 p, vec3 n, float wrap) {
  int cnt = int(uView2.w); if (cnt <= 0) return vec3(0.0);
  ivec2 c = ivec2(floor(p.xy)); uint bits = 0u;
  if (c.x >= 0 && c.y >= 0 && float(c.x) < uMap.x && float(c.y) < uMap.y) bits = texelFetch(uLVis, c, 0).r;
  if (bits == 0u) return vec3(0.0);
  vec3 s = vec3(0.0);
  for (int i = 0; i < 32; i++) {
    if (i >= cnt) break;
    if ((bits & (1u << uint(i))) == 0u) continue;
    vec3 lp = vec3(uLP[i].xy, uL21P.y);
    vec3 dv = lp - p; float d2 = dot(dv.xy, dv.xy);
    if (d2 >= uLP[i].z) continue;
    float k = 1.0 - d2 / uLP[i].z; k = k * k;
    float ndl = dot(n, normalize(dv));
    float lam = wrap + (1.0 - wrap) * max(0.0, ndl);
    s += uLC[i].rgb * k * lam * (1.0 + 0.6 * k);   // a brighter heart near the flame: warm pools
  }
  return s;
}
vec3 r3dShade(R3DSurf s) {
  vec3 eye = uEye.xyz;
  float dist = max(0.0, dot(s.pos.xy - eye.xy, uFwdH.xy));
  vec3 V = s.pos - eye; float vl = max(length(V), 1e-4); vec3 vd = V / vl;
  bool outdoor = uLit.w > 0.5;
  bool body = s.kind == 2, spr = s.kind == 1;
  vec3 n = s.kind == 0 ? normalize(s.nrm) : normalize(vec3(-uFwdH.xy, 0.15));
  // light and shadow on the texel grid (1/32 of a cell): edges stay pixel art
  vec3 lp = s.pos;
  if (s.kind == 0) { vec3 g = vec3(32.0, 32.0, 32.0 / uRight.w); lp = (floor(s.pos * g + n * 0.5) + 0.5) / g; }
  bool water = s.kind == 0 && (s.mat == 2.0 || s.mat == 3.0);
  if (water) {
    // ripples: two drifting sines in world space, quantised to the texel grid
    vec2 q = floor(s.pos.xy * 32.0) / 32.0; float tt = uL21T.x;
    float a = sin(q.x * 9.0 + tt * 1.7) + sin(q.y * 11.0 - tt * 1.3) + 0.6 * sin((q.x + q.y) * 17.0 + tt * 2.3);
    float b = cos(q.y * 8.0 + tt * 1.5) + cos(q.x * 13.0 - tt * 1.1);
    n = normalize(vec3(a * 0.035, b * 0.035, 1.0));
  }
  vec3 c;
  float fogK;
  if (outdoor) {
    vec3 amb = mix(uL21AmbG, uL21AmbS, n.z * 0.5 + 0.5);
    float ndl = dot(n, uL21Sun.xyz);
    if (s.kind != 0) ndl = 0.35 + 0.65 * max(ndl, dot(normalize(vec3(-uFwdH.xy, 0.4)), uL21Sun.xyz));
    vec3 direct = vec3(0.0);
    if (ndl > 0.0 && uL21SunC.r + uL21SunC.g + uL21SunC.b > 0.003) {
      float sh = l21Shadow(lp + n * 0.035 + vec3(0.0, 0.0, body ? 0.0 : 0.002), uL21Sun.xyz);
      direct = uL21SunC.rgb * ndl * sh;
    }
    vec3 pts = l21Points(lp + n * 0.02, n, s.kind == 0 ? 0.15 : 0.6) * uL21P.x;
    if (spr) pts = max(pts, s.ladd);
    vec3 light = amb + direct + pts;
    c = s.albedo * light;
    // wet ground after rain: a faint sheen toward the light
    if (uL21T.z > 0.5 && s.kind == 0 && n.z > 0.7) { vec3 r = reflect(vd, n); c += uL21SunC.rgb * pow(max(0.0, dot(r, uL21Sun.xyz)), 24.0) * 0.35; }
    // the raycaster's visibility (view distance, ambient floor), as fog toward the sky behind
    float f = clamp(1.0 - dist * uFog.w, 0.0, 1.0); f = uLit.y + (1.0 - uLit.y) * f;
    fogK = 1.0 - f;
  } else {
    // indoors: the raycaster's distance-to-dark (readability), the lamps on top
    float f = s.kind == 1 ? s.fi : clamp(1.0 - dist * uFog.w, 0.0, 1.0);
    if (s.kind != 1) { f = uLit.y + (1.0 - uLit.y) * f; f *= s.side; f *= uLit.z; }
    vec3 pts = l21Points(lp + n * 0.02, n, s.kind == 0 ? 0.2 : 0.6) * uL21P.x;
    if (spr) pts = max(pts, s.ladd);
    c = s.albedo * (f * 0.86 + pts * 1.15) + pts * 0.06;
    fogK = 0.0;
  }
  if (water && uL21P.w > 0.5) {
    vec3 r = reflect(vd, n); r.z = abs(r.z);
    float fr = 0.18 + 0.7 * pow(1.0 - max(0.0, dot(-vd, n)), 4.0);
    vec3 refl = outdoor ? l21SkyCol(r) * (0.65 + 0.35 * uLit.x) : uFog.rgb * 0.6 + l21Points(lp, vec3(0, 0, 1), 0.5) * 0.6;
    float k = (s.mat == 2.0 ? 0.62 : 0.4) * fr;
    c = mix(c, refl, k);
    if (outdoor) c += uL21SunC.rgb * pow(max(0.0, dot(r, uL21Sun.xyz)), 160.0) * 3.0;   // the sun's glitter (blooms)
  }
  if (s.emissive > 0.5) c = max(c, s.albedo * 1.45);
  if (outdoor) {
    // the air toward that direction: the sky just above the horizon there, held toward the map's own haze colour
    vec3 fc = mix(uFogPx.rgb, l21SkyCol(vec3(vd.xy, 0.05)), 0.6) * mix(1.0, uLit.x, 0.25);
    fogK = pow(fogK, 1.35);
    // height fog: thick near the ground, thin above the eye; grows with distance
    float hz = s.pos.z - (eye.z - 0.5 * uRight.w);
    float hfog = uL21Fog.y * exp(-max(0.0, hz) / max(0.01, uL21Fog.z)) * (1.0 - exp(-dist * 0.12));
    float k = clamp(fogK + hfog * (1.0 - fogK), 0.0, 1.0);
    if (body) k = 0.0;
    c = mix(c, fc, k);
  } else if (uL21Fog.y > 0.0) {
    float hz = s.pos.z - (eye.z - 0.5 * uRight.w);
    float hfog = uL21Fog.y * exp(-max(0.0, hz) / max(0.01, uL21Fog.z)) * (1.0 - exp(-dist * 0.12));
    c = mix(c, uFog.rgb, clamp(hfog, 0.0, 0.6));
  }
  return max(c, vec3(0.0));
}
`;
  function v3(g, loc, a) { if (loc) g.uniform3f(loc, a[0], a[1], a[2]); }
  function v4(g, loc, a, b, c, d) { if (loc) g.uniform4f(loc, a, b, c, d); }
  function shadeUniforms(g, pr) {
    const u = pr.u;
    if (u.uL21H) { g.activeTexture(g.TEXTURE15); g.bindTexture(g.TEXTURE_2D, hgt.tex); g.uniform1i(u.uL21H, 15); }   // unit 15: clear of CORE (0-5) and SPRITES (6, 7)
    v4(g, u.uL21Sun, P.sun[0], P.sun[1], P.sun[2], P.shadowOn ? 1 : 0);
    v4(g, u.uL21SunC, P.sunC[0], P.sunC[1], P.sunC[2], P.soft);
    v4(g, u.uL21SunD, P.sunD[0], P.sunD[1], P.sunD[2], P.sunVis);
    v4(g, u.uL21MoonD, P.moonD[0], P.moonD[1], P.moonD[2], P.moonIll);
    v3(g, u.uL21Zen, P.zen); v3(g, u.uL21Hor, P.hor); v3(g, u.uL21Glow, P.glow); v3(g, u.uL21AmbS, P.ambS); v3(g, u.uL21AmbG, P.ambG);
    v4(g, u.uL21Fog, P.fog[0], P.fog[1], P.fog[2], P.maxH);
    v4(g, u.uL21P, P.pt[0], P.pt[1], P.pt[2], P.pt[3]);
    v4(g, u.uL21T, P.t[0], P.t[1], P.wet, P.t[3]);
  }

  // ------------------------------------------------------------------------------------------------ the map's heights
  // R32F, one texel per cell: a block's top, an open cell's ground (its centre on a slope), in GL units. Rebuilt per map.
  const hgt = { tex: null, map: null, sig: '', w: 0, h: 0, ok: false };
  function buildHeights(gl, m) {
    if (!gl || !m) return;
    const W = m.w, H = m.h, relief = !!m.relief, grid = m.cells, wTop0 = m.ceil ? (m.ceilZ || 1) : 0;
    const d = new Float32Array(W * H);
    let maxH = 0;
    const groundC = (cx, cy) => {
      const i = cy * W + cx;
      if (relief && m.smooth && m.smooth[i] && m.verts) { const W1 = W + 1, v = cy * W1 + cx, V = m.verts; return (V[v] + V[v + 1] + V[v + W1] + V[v + W1 + 1]) / 4; }
      return relief && m.lvls ? m.lvls[i] : 0;
    };
    for (let cy = 0; cy < H; cy++) for (let cx = 0; cx < W; cx++) {
      const i = cy * W + cx, c = grid[i];
      let z;
      if (c && !c.door) z = relief ? (c.top != null ? c.top : Math.max(groundC(cx, cy) + 1, wTop0)) : (c.top != null ? c.top : 1);
      else z = groundC(cx, cy);
      d[i] = z * ZK; if (d[i] > maxH) maxH = d[i];
    }
    if (!hgt.tex || hgt.w !== W || hgt.h !== H) {
      if (hgt.tex) gl.deleteTexture(hgt.tex);
      hgt.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, hgt.tex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32F, W, H);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      hgt.w = W; hgt.h = H;
    }
    gl.bindTexture(gl.TEXTURE_2D, hgt.tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.RED, gl.FLOAT, d);
    hgt.map = m; hgt.ok = true; P.maxH = maxH + 0.01;
  }
  // cheap signature of what the heights depend on (cells that open or close, a level that changes)
  function heightSig(m) {
    let h = m.w * 131 + m.h, n = 0;
    for (let i = 0; i < m.cells.length; i += 1) { const c = m.cells[i]; if (c && !c.door) { h = (h * 31 + i + (c.top != null ? (c.top * 64) | 0 : 7)) | 0; n++; } }
    return h + ':' + n + ':' + (m.lvls ? m.lvls.length : 0);
  }

  // ------------------------------------------------------------------------------------------------ the panoramas
  // js/sky.js's layers for the map (its LANDMARKS ridges baked in), farthest first: art slots in an R8UI array texture
  // (1536 columns round, 56 rows up), palettes in a small RGBA8 texture (12 slots x layers).
  const pano = { tex: null, pal: null, key: '', n: 0, ok: false, AW: 1536, AH: 56, mix: new Float32Array(64) };
  function buildPano(gl, m) {
    pano.ok = false; pano.n = 0;
    if (!m || !m.outdoor || typeof SKY === 'undefined' || !SKY.panorama) return;
    let layers;
    try { layers = SKY.panorama(m.id); } catch (e) { warnOnce('panorama', e); return; }
    if (!layers || !layers.length) return;
    const NL = Math.min(16, layers.length), AW = layers[0].art.length / pano.AH | 0, AH = pano.AH;
    pano.AW = AW;
    const art = new Uint8Array(AW * AH * NL), pal = new Uint8Array(12 * 16 * 4);
    for (let l = 0; l < NL; l++) {
      const L = layers[l];
      art.set(L.art.subarray ? L.art.subarray(0, AW * AH) : L.art, l * AW * AH);
      for (let s = 0; s < 12; s++) { const c = L.pal[s]; const o = (l * 12 + s) * 4; if (c) { pal[o] = c[0]; pal[o + 1] = c[1]; pal[o + 2] = c[2]; pal[o + 3] = 255; } }
      pano.mix[l * 4] = L.mix; pano.mix[l * 4 + 1] = 0; pano.mix[l * 4 + 2] = 0; pano.mix[l * 4 + 3] = 0;
    }
    if (pano.tex) gl.deleteTexture(pano.tex);
    pano.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, pano.tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.R8UI, AW, AH, NL);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, AW, AH, NL, gl.RED_INTEGER, gl.UNSIGNED_BYTE, art);
    if (!pano.pal) { pano.pal = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, pano.pal); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 12, 16); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); }
    gl.bindTexture(gl.TEXTURE_2D, pano.pal); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 12, 16, gl.RGBA, gl.UNSIGNED_BYTE, pal);
    pano.n = NL; pano.ok = true;
  }

  // ------------------------------------------------------------------------------------------------ shaders
  const TRI = `
out vec2 vNdc;
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)) * 2.0 - 1.0; vNdc = p; gl_Position = vec4(p, 0.0, 1.0); }`;
  // the sky at logical resolution
  const SKY_FS = `
precision highp usampler2DArray;
uniform highp usampler2DArray uL21Pano; uniform sampler2D uL21Pal;
uniform vec4 uL21PanoK[16]; uniform int uL21PanoN; uniform vec4 uL21PanoAir; uniform vec4 uL21PanoG; uniform int uL21PanoAW;
uniform vec4 uL21Cl; uniform vec4 uL21Sky2; uniform vec3 uL21Aur[3]; uniform vec2 uL21Size; uniform int uL21LmOn;
in vec2 vNdc;
layout(location=0) out vec4 oSky;
float h21(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
float n21(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n21(p); p = p * 2.03 + vec2(17.1, 9.3); a *= 0.5; } return s; }
float bay(ivec2 p) { return (float(r3dBayer(p)) + 0.5) / 16.0; }
void main() {
  ivec2 pix = ivec2(gl_FragCoord.xy);
  vec4 a = uInvViewProj * vec4(vNdc, 1.0, 1.0); vec4 b = uInvViewProj * vec4(vNdc, -1.0, 1.0);
  vec3 dir = normalize(a.xyz / a.w - b.xyz / b.w);
  float glowFlag = 0.0;
  float lxy = max(1e-4, length(dir.xy));
  float te = dir.z / lxy, az = atan(dir.y, dir.x);
  vec3 c = l21SkyCol(dir);
  float up = clamp(dir.z, 0.0, 1.0);
  // stars: one logical pixel each on an angle grid, twinkling, faint toward the horizon
  if (uL21Sky2.x > 0.01 && dir.z > 0.02) {
    vec2 cell = floor(vec2(az * ${FX.toFixed(3)} / max(0.2, sqrt(1.0 - dir.z * dir.z)) * 0.5, asin(dir.z) * ${FX.toFixed(3)}));
    float h = h21(cell * 0.137 + 3.7);
    if (h > 0.9935) {
      float m = (h - 0.9935) / 0.0065; m = 0.25 + 0.75 * m * m * m;
      float tw = 0.75 + 0.25 * sin(uL21T.x * (1.3 + 3.0 * h21(cell + 1.3)) + h * 40.0);
      vec3 sc = h21(cell + 7.7) < 0.6 ? vec3(0.92, 0.95, 1.0) : h21(cell + 2.1) < 0.6 ? vec3(0.68, 0.78, 1.0) : vec3(1.0, 0.85, 0.65);
      float allow = clamp(1.0 - (dot(c, vec3(0.33)) - 0.08) / 0.35, 0.0, 1.0);
      c += sc * m * tw * uL21Sky2.x * allow * clamp(dir.z * 8.0, 0.0, 1.0) * 1.1;
    }
  }
  // the Octave lights: thin ribbons high in the night sky, one hue per note along each ribbon, rays, a soft lower fringe
  if (uL21Sky2.y > 0.01 && te > 0.25) {
    for (int k = 0; k < 2; k++) {
      float fk = float(k);
      float base = 0.62 + 0.22 * fk + 0.12 * sin(az * (2.0 + fk) + uL21T.x * 0.05 + fk * 2.0) + 0.06 * n21(vec2(az * 6.0 + uL21T.x * 0.08, fk * 5.0));
      float s = (te - base) / 0.35;
      float prof = s < 0.0 ? exp(-pow(s * 3.1, 2.0)) : exp(-s * 1.7);
      float rays = 0.65 + 0.35 * n21(vec2(az * 60.0 + fk * 13.0, uL21T.x * 0.3));
      float u = fract(az / 6.2831853 * 3.0 + fk * 0.37 + uL21T.x * 0.004) * 3.0;
      vec3 hue = u < 1.0 ? mix(uL21Aur[0], uL21Aur[1], u) : u < 2.0 ? mix(uL21Aur[1], uL21Aur[2], u - 1.0) : mix(uL21Aur[2], uL21Aur[0], u - 2.0);
      float al = prof * rays * uL21Sky2.y * 0.55 * smoothstep(0.25, 0.5, te);
      al = floor(al * 6.0 + bay(pix)) / 6.0;
      c += hue * al * (1.0 - clamp(dot(c, vec3(0.33)) * 1.5, 0.0, 0.8));
    }
  }
  // the moon: a crisp disc with the calendar's phase, a few grey seas, a halo
  float occl = 1.0;
  vec3 md = normalize(uL21MoonD.xyz);
  if (md.z > -0.05) {
    float dm = acos(clamp(dot(dir, md), -1.0, 1.0));
    float R = 0.04;
    float halo = exp(-pow(dm / 0.18, 2.0)) * 0.12 * (0.4 + 0.6 * uL21MoonD.w);
    c += vec3(0.55, 0.6, 0.78) * halo * smoothstep(-0.02, 0.1, md.z) * (1.0 - uL21Sky2.z);
    if (dm < R) {
      vec3 rt = normalize(cross(md, vec3(0.0, 0.0, 1.0))); vec3 upv = cross(rt, md);
      vec2 q = vec2(dot(dir - md, rt), dot(dir - md, upv)) / R;   // -1..1 across the disc
      q = floor(q * 9.0) / 9.0;                                     // pixel art: the disc is drawn on a coarse grid
      float lit = 1.0;
      float ill = uL21MoonD.w;
      // the terminator: an ellipse across the disc; the lit side faces the sun's side of the sky
      float xt = (1.0 - 2.0 * ill);
      float x = q.x * sign(dot(uL21SunD.xyz - md, rt) + 1e-4);
      float edge = xt * sqrt(max(0.0, 1.0 - q.y * q.y));
      lit = x > edge ? 1.0 : 0.08;
      float sea = n21(q * 2.3 + 4.0) > 0.62 ? 0.78 : 1.0;
      vec3 mc = vec3(0.95, 0.94, 0.86) * sea * lit;
      c = mix(c, mc * 1.25, smoothstep(1.0, 0.96, length(q)) * smoothstep(-0.03, 0.05, md.z));
      glowFlag = max(glowFlag, lit > 0.5 ? 0.5 : 0.0);
    }
  }
  // the sun's disc (HDR: it blooms and casts the shafts)
  vec3 sd = normalize(uL21SunD.xyz);
  float ds = acos(clamp(dot(dir, sd), -1.0, 1.0));
  float sunDisc = 0.0;
  if (sd.z > -0.05 && ds < 0.032) { sunDisc = 1.0; c = mix(c, vec3(1.0, 0.97, 0.9) * (1.4 + 3.0 * uL21SunD.w), smoothstep(0.032, 0.026, ds)); glowFlag = 1.0; }
  // clouds: a low layer of heaps and a high layer of streaks on a plane overhead, drifting with the wind
  if (uL21Cl.w > 0.5 && dir.z > 0.0) {
    float cov = uL21Cl.x, tt = uL21T.x;
    vec2 wnd = vec2(cos(0.6), sin(0.6)) * (0.004 + 0.02 * uL21Cl.y) * tt;
    vec2 p = dir.xy / (dir.z + 0.08);
    // high streaks
    float hi = fbm(vec2(p.x * 0.35, p.y * 1.2) + wnd * 0.6 + 31.0);
    float hd = smoothstep(1.02 - cov * 0.55, 1.22 - cov * 0.55, hi) * 0.55;
    // low heaps (two samples: the second toward the sun gives their lit side)
    vec2 lp2 = p * 0.75 + wnd;
    float lo = fbm(lp2), lo2 = fbm(lp2 + sd.xy * 0.18);
    float ld = smoothstep(1.0 - cov * 0.82, 1.15 - cov * 0.6, lo + 0.25 * cov);
    float lit2 = clamp(0.6 + (lo - lo2) * 4.0, 0.0, 1.0);
    float horizonFade = smoothstep(0.0, 0.12, dir.z);
    float dsun = max(0.0, dot(dir, sd));
    vec3 shadeC = mix(uL21Hor, uL21Zen, 0.5) * mix(0.62, 0.35, uL21Cl.z);
    vec3 litC = mix(uL21Hor * 1.08, uL21Glow * 0.9 + uL21Hor * 0.4, clamp(dot(uL21Glow, vec3(0.4)), 0.0, 1.0));
    vec3 cc = mix(shadeC, litC, lit2) + uL21Glow * pow(dsun, 8.0) * 0.6 * (1.0 - ld);   // silver lining toward the sun
    cc += vec3(0.85, 0.88, 1.0) * uL21Sky2.z * 0.9;                                       // lightning inside the cloud
    float al = clamp(ld + hd * (1.0 - ld), 0.0, 1.0) * horizonFade;
    al = floor(al * 5.0 + bay(pix)) / 5.0;                                                 // pixel-art steps, dithered
    c = mix(c, cc, al);
    occl = 1.0 - al;
    glowFlag *= occl;
  }
  // the painted country (js/sky.js) in front of the sky; farthest layer first, each mixed into the air
  if (uL21PanoN > 0 && te >= 0.0) {
    int row = int(floor(te * ${FX.toFixed(3)}));
    if (row < 56) {
      int col = int(floor((az / 6.2831853 + 0.5) * float(uL21PanoAW))) % uL21PanoAW;
      for (int l = 0; l < 16; l++) {
        if (l >= uL21PanoN) break;
        uint slot = texelFetch(uL21Pano, ivec3(col, row, l), 0).r;
        if (slot == 0u) continue;
        vec4 pc = texelFetch(uL21Pal, ivec2(int(slot), l), 0);
        if (pc.a < 0.5) continue;
        float v = (float(row) + 0.5) / 18.0;
        float mx = clamp(uL21PanoK[l].x + uL21PanoG.y + max(0.0, 1.0 - v) * 0.2 - min(1.0, v) * 0.04, 0.0, 0.96);
        vec3 col3 = pc.rgb * uL21PanoAir.w;
        float glow = 0.0;
        if (slot == 8u && uL21PanoG.x > 0.0) { col3 = mix(col3, vec3(1.0, 0.7, 0.28) * 1.6, uL21PanoG.x); mx *= 1.0 - uL21PanoG.x * 0.8; glow = uL21PanoG.x; }
        c = mix(col3, uL21PanoAir.rgb, mx);
        glowFlag = glow;
      }
    }
  } else if (uL21LmOn == 1 && te >= 0.0) {
    vec4 lm = r3dLandmarks(az, te); if (lm.a > 0.5) { c = lm.rgb; glowFlag = 0.0; }
  }
  oSky = vec4(max(c, vec3(0.0)), glowFlag);
}`;
  // the low-resolution sky laid into the scene target, nearest; the material is sky, the alpha is the glow flag
  const SKYBLIT_FS = `
uniform sampler2D uL21SkyTex;
in vec2 vNdc;
layout(location=0) out vec4 oColor; layout(location=1) out vec4 oAux;
void main() {
  vec4 s = texture(uL21SkyTex, vNdc * 0.5 + 0.5);
  if (uLit.w < 0.5) { oColor = vec4(uFog.rgb, 1.0); oAux = vec4(0.0, 0.0, 0.0, 1.0); return; }
  oColor = vec4(s.rgb, 1.0); oAux = vec4(1.0 / 255.0, s.a, 0.0, 1.0);
}`;
  // post: bright pass (emissives and HDR highlights), the downsample/upsample chain, the shafts, the composite
  const BRIGHT_FS = `
uniform sampler2D uSrc; uniform sampler2D uAux; uniform vec2 uTexel; uniform vec4 uK;   // uK: x threshold, y emissive gain, z hdr gain
in vec2 vNdc; out vec4 oOut;
void main() {
  vec2 uv = vNdc * 0.5 + 0.5;
  vec3 s = vec3(0.0);
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec2 q = uv + (vec2(float(i), float(j)) - 0.5) * uTexel;
    vec3 c = texture(uSrc, q).rgb; vec4 a = texture(uAux, q);
    float m = floor(a.r * 255.0 + 0.5);
    float em = max(a.g, m == 8.0 ? 1.0 : 0.0);
    vec3 e = max(c - vec3(uK.x), vec3(0.0)) * uK.z;                 // what is above 1.0 (the sun, glitter, glows)
    s += e + c * em * uK.y * smoothstep(0.35, 0.9, dot(c, vec3(0.33)));
  }
  oOut = vec4(s * 0.25, 1.0);
}`;
  const DOWN_FS = `
uniform sampler2D uSrc; uniform vec2 uTexel;
in vec2 vNdc; out vec4 oOut;
void main() { vec2 uv = vNdc * 0.5 + 0.5;
  vec3 s = texture(uSrc, uv).rgb * 4.0 + texture(uSrc, uv + uTexel * vec2(-1, -1)).rgb + texture(uSrc, uv + uTexel * vec2(1, -1)).rgb + texture(uSrc, uv + uTexel * vec2(-1, 1)).rgb + texture(uSrc, uv + uTexel * vec2(1, 1)).rgb;
  oOut = vec4(s / 8.0, 1.0); }`;
  const UP_FS = `
uniform sampler2D uSrc; uniform sampler2D uAdd; uniform vec2 uTexel; uniform float uMix;
in vec2 vNdc; out vec4 oOut;
void main() { vec2 uv = vNdc * 0.5 + 0.5; vec2 t = uTexel;
  vec3 s = texture(uSrc, uv + vec2(-t.x * 2.0, 0.0)).rgb + texture(uSrc, uv + vec2(t.x * 2.0, 0.0)).rgb + texture(uSrc, uv + vec2(0.0, -t.y * 2.0)).rgb + texture(uSrc, uv + vec2(0.0, t.y * 2.0)).rgb
    + (texture(uSrc, uv + vec2(-t.x, t.y)).rgb + texture(uSrc, uv + vec2(t.x, t.y)).rgb + texture(uSrc, uv + vec2(-t.x, -t.y)).rgb + texture(uSrc, uv + vec2(t.x, -t.y)).rgb) * 2.0;
  oOut = vec4(s / 12.0 + texture(uAdd, uv).rgb * uMix, 1.0); }`;
  // shafts: the sky's brightness near the sun, smeared toward the sun's place on screen (occluded where geometry stands)
  const SHAFT_MASK_FS = `
uniform sampler2D uSrc; uniform sampler2D uDepth; uniform vec2 uSun;   // sun in uv
in vec2 vNdc; out vec4 oOut;
void main() { vec2 uv = vNdc * 0.5 + 0.5;
  float d = texture(uDepth, uv).r;
  vec3 c = texture(uSrc, uv).rgb;
  float sky = d >= 0.99999 ? 1.0 : 0.0;
  float near = exp(-pow(length((uv - uSun) * vec2(1.6, 1.0)) / 0.35, 2.0));
  oOut = vec4(max(c - vec3(0.55), vec3(0.0)) * sky * (0.3 + near), 1.0); }`;
  const SHAFT_FS = `
uniform sampler2D uSrc; uniform vec2 uSun; uniform float uStep; uniform float uDecay;
in vec2 vNdc; out vec4 oOut;
void main() { vec2 uv = vNdc * 0.5 + 0.5; vec2 dl = (uSun - uv) * uStep; vec3 s = vec3(0.0); float w = 1.0; vec2 p = uv;
  for (int i = 0; i < 20; i++) { s += texture(uSrc, p).rgb * w; w *= uDecay; p += dl; }
  oOut = vec4(s / 20.0 * 2.2, 1.0); }`;
  const COMP_FS = `
uniform sampler2D uScene; uniform sampler2D uBloom; uniform sampler2D uShaft; uniform sampler2D uLut; uniform sampler2D uAux;
uniform vec4 uC1;   // x bloom gain, y shaft gain, z grade on, w saturation (area grade)
uniform vec4 uC2;   // x cinematic grade on, y contrast, z saturation, w vignette
uniform vec4 uC3;   // x underwater, y exposure, z bloom on, w shafts on
uniform vec3 uShaftC;
in vec2 vNdc; out vec4 oOut;
vec3 shoulder(vec3 c) { vec3 k = vec3(0.78); vec3 over = max(c - k, vec3(0.0)); return min(c, k) + (1.0 - exp(-over / (1.0 - k) * 1.0)) * (1.0 - k); }
void main() {
  vec2 uv = vNdc * 0.5 + 0.5;
  vec3 c = texture(uScene, uv).rgb * uC3.y;
  if (uC3.z > 0.5) c += texture(uBloom, uv).rgb * uC1.x;
  if (uC3.w > 0.5) c += texture(uShaft, uv).rgb * uShaftC * uC1.y;
  if (uC3.x > 0.5) { float l = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(c, vec3(0.1, 0.32, 0.36) * (0.4 + l * 1.4), 0.55); }
  c = shoulder(c);
  if (uC1.z > 0.5) {
    ivec3 q = ivec3(clamp(c, 0.0, 1.0) * 255.0 + 0.5);
    c = vec3(texelFetch(uLut, ivec2(q.r, 0), 0).r, texelFetch(uLut, ivec2(q.g, 0), 0).g, texelFetch(uLut, ivec2(q.b, 0), 0).b);
    float l = dot(c, vec3(0.30, 0.59, 0.11)); c = mix(vec3(l), c, uC1.w);
  }
  if (uC2.x > 0.5) { c = (c - 0.5) * uC2.y + 0.5; float l = dot(c, vec3(0.30, 0.59, 0.11)); c = mix(vec3(l), c, uC2.z); }
  vec2 dv = uv - 0.5; float r = dot(dv, dv) / 0.5;
  c *= 1.0 - uC2.w * pow(r, 1.1);
  c += (float(r3dBayer(ivec2(gl_FragCoord.xy))) / 16.0 - 0.47) / 255.0;
  oOut = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

  // ------------------------------------------------------------------------------------------------ GL state
  const S = { progs: null, vao: null, skyTex: null, skyFb: null, skyW: 0, skyH: 0, rt: {}, lutTex: null, w: 0, h: 0, gl: null };
  function mkTex(gl, w, h, hdr, filter) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    const fl = R3D.st.floatRT && hdr;
    gl.texStorage2D(gl.TEXTURE_2D, 1, fl ? gl.RGBA16F : gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter || gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter || gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function mkTarget(gl, w, h, hdr, filter) {
    const tex = mkTex(gl, w, h, hdr, filter), fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb, w, h };
  }
  function freeTarget(gl, t) { if (t) { try { gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); } catch (e) { /* lost */ } } }
  function programs() {
    if (S.progs) return S.progs;
    const pr = {};
    pr.sky = R3D.program(TRI, SKY_FS, { chunks: ['common', 'shade', 'landmarks'] });
    pr.blit = R3D.program(TRI, SKYBLIT_FS, { chunks: ['common'] });
    pr.bright = R3D.program(TRI, BRIGHT_FS, { chunks: ['common'] });
    pr.down = R3D.program(TRI, DOWN_FS, { chunks: ['common'] });
    pr.up = R3D.program(TRI, UP_FS, { chunks: ['common'] });
    pr.mask = R3D.program(TRI, SHAFT_MASK_FS, { chunks: ['common'] });
    pr.shaft = R3D.program(TRI, SHAFT_FS, { chunks: ['common'] });
    pr.comp = R3D.program(TRI, COMP_FS, { chunks: ['common'] });
    S.progs = pr;
    return pr;
  }
  function initGL(gl) {
    S.gl = gl;
    S.vao = gl.createVertexArray();
    S.skyTex = null; S.skyFb = null; S.skyW = S.skyH = 0; S.rt = {}; S.lutTex = null; S.w = S.h = 0;
    hgt.tex = null; hgt.map = null; hgt.sig = ''; hgt.ok = false; hgt.w = hgt.h = 0;
    pano.tex = null; pano.pal = null; pano.key = ''; pano.ok = false; pano.n = 0;
    programs();
  }
  function tri(gl) { gl.bindVertexArray(S.vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindVertexArray(null); }
  function tex(gl, unit, t, pr, name) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); if (pr.u[name]) gl.uniform1i(pr.u[name], unit); }

  // per-map resources, checked each frame (cheap: a signature every half second)
  let sigT = 0;
  function mapResources(gl, F) {
    const m = F.map; if (!m) return;
    if (hgt.map !== m || !hgt.ok) { buildHeights(gl, m); hgt.sig = heightSig(m); sigT = F.now; }
    else if (F.now - sigT > 0.5) { sigT = F.now; const s = heightSig(m); if (s !== hgt.sig) { hgt.sig = s; buildHeights(gl, m); } }
    const key = m.outdoor ? m.id + '|' + (typeof GFX !== 'undefined' && GFX.panoramas ? 1 : 0) : '';
    if (key !== pano.key) { pano.key = key; if (m.outdoor) buildPano(gl, m); else { pano.ok = false; pano.n = 0; } }
  }

  // ------------------------------------------------------------------------------------------------ the sky pass
  const skyPass = {
    name: 'sky', order: 0,
    init(gl) { initGL(gl); },
    draw(gl, F) {
      const t0 = now();
      mapResources(gl, F);
      const pr = programs();
      // the logical-resolution target: 320 x 150 (2x on High and above)
      const k = (typeof GFX !== 'undefined' && GFX.scale === 2) ? 2 : 1;
      const sw = 320 * k, sh = Math.max(16, Math.round(150 * k * (F.h / Math.max(1, F.w)) * (320 / 150)));
      if (!S.skyFb || S.skyW !== sw || S.skyH !== sh) {
        if (S.skyFb) freeTarget(gl, { fb: S.skyFb, tex: S.skyTex });
        const t = mkTarget(gl, sw, sh, true, gl.NEAREST); S.skyTex = t.tex; S.skyFb = t.fb; S.skyW = sw; S.skyH = sh;
      }
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
      if (F.outdoor) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, S.skyFb); gl.viewport(0, 0, sw, sh);
        const p = R3D.use(pr.sky);
        const u = p.u;
        if (u.uL21Pano) { gl.activeTexture(gl.TEXTURE8); gl.bindTexture(gl.TEXTURE_2D_ARRAY, P.panoOn ? pano.tex : null); gl.uniform1i(u.uL21Pano, 8); }
        if (u.uL21Pal) { gl.activeTexture(gl.TEXTURE9); gl.bindTexture(gl.TEXTURE_2D, P.panoOn ? pano.pal : null); gl.uniform1i(u.uL21Pal, 9); }
        if (u.uL21PanoN) gl.uniform1i(u.uL21PanoN, P.panoOn ? pano.n : 0);
        if (u.uL21PanoAW) gl.uniform1i(u.uL21PanoAW, pano.AW);
        if (u.uL21PanoK) gl.uniform4fv(u.uL21PanoK, pano.mix);
        v4(gl, u.uL21PanoAir, P.panoAir[0], P.panoAir[1], P.panoAir[2], P.panoAir[3]);
        v4(gl, u.uL21PanoG, P.panoGlow, P.panoHaze, 0, 0);
        v4(gl, u.uL21Cl, P.cl[0], P.cl[1], P.cl[2], P.cl[3]);
        v4(gl, u.uL21Sky2, P.sky2[0], P.sky2[1], P.sky2[2], P.sky2[3]);
        if (u.uL21Aur) gl.uniform3fv(u.uL21Aur, new Float32Array([].concat(P.aur[0], P.aur[1], P.aur[2])));
        if (u.uL21Size) gl.uniform2f(u.uL21Size, sw, sh);
        if (u.uL21LmOn) gl.uniform1i(u.uL21LmOn, !P.panoOn ? 1 : 0);
        tri(gl);
      }
      R3D.bindScene(gl, F);
      const b = R3D.use(pr.blit);
      tex(gl, 6, S.skyTex, b, 'uL21SkyTex');
      tri(gl);
      stats.sky = now() - t0;
    },
  };

  // ------------------------------------------------------------------------------------------------ the post pass
  // js/post.js's grade, rebuilt exactly as js/gpu18.js does it (the same table), into a 256 x 1 RGBA8 texture
  const lutBuf = new Uint8Array(256 * 4);
  let gradeSat = 1, lutKey = '';
  function buildGrade(F) {
    if (typeof POST === 'undefined' || !POST.config) return false;
    const C = POST.config, g = C.gradePresets, map = F.map, env = F.env || {};
    const name = (map && C.grade[map.id]) || (F.outdoor ? C.grade._outdoor : C.grade._indoor);
    const p = g[name] || g.candle; if (!p) return false;
    const dk = F.outdoor ? clamp(env.skyDay == null ? 1 : env.skyDay, 0, 1) : 1, q = (dk * 32) | 0;
    const tod = F.tod == null ? 0.5 : F.tod;
    const warm = F.outdoor ? Math.exp(-Math.pow(tod - 0.76, 2) / 0.006) + Math.exp(-Math.pow(tod - 0.26, 2) / 0.006) : 0;
    const wq = (clamp(warm, 0, 1) * 8) | 0, kk = F.outdoor ? q / 32 : 1, wk = wq / 8;
    const key = name + '|' + q + '|' + wq;
    const mx = (a, b) => b + (a - b) * kk;
    gradeSat = mx(p.day.sat, p.night.sat) + 0.16 * wk;
    if (key === lutKey) return true;
    lutKey = key;
    const con = mx(p.day.con, p.night.con), dusk = C.dusk, sm = (x) => x * x * (3 - 2 * x);
    for (let ch = 0; ch < 3; ch++) {
      const gain = mx(p.day.gain[ch], p.night.gain[ch]) * (1 + (dusk[ch] - 1) * wk), lift = mx(p.day.lift[ch], p.night.lift[ch]), keep = p.keep || 0;
      for (let v = 0; v < 256; v++) {
        let u = v / 255; u = u * (1 - con) + sm(u) * con;
        const ge = keep && gain < 1 ? gain + (1 - gain) * keep * u * u * u : gain;
        lutBuf[v * 4 + ch] = clamp(u * ge * 255 + lift * (1 - u), 0, 255) | 0;
      }
    }
    for (let v = 0; v < 256; v++) lutBuf[v * 4 + 3] = 255;
    S.lutDirty = true;
    return true;
  }
  const sunUV = [0.5, 0.5];
  function sunOnScreen(F) {
    const d = P.sunD, m = F.viewProj; if (!m) return false;
    const x = d[0] * 1000, y = d[1] * 1000, z = d[2] * 1000;   // a point far along the sun's direction (w=0 is fine: direction)
    const cx = m[0] * x + m[4] * y + m[8] * z, cy = m[1] * x + m[5] * y + m[9] * z, cw = m[3] * x + m[7] * y + m[11] * z;
    if (cw <= 0.0001) return false;
    sunUV[0] = (cx / cw) * 0.5 + 0.5; sunUV[1] = (cy / cw) * 0.5 + 0.5;
    return sunUV[0] > -0.6 && sunUV[0] < 1.6 && sunUV[1] > -0.6 && sunUV[1] < 1.6;
  }
  function ensurePost(gl, w, h) {
    if (S.w === w && S.h === h && S.rt.h1) return;
    for (const k in S.rt) freeTarget(gl, S.rt[k]);
    S.rt = {};
    const W = (d) => Math.max(1, Math.round(w / d)), H = (d) => Math.max(1, Math.round(h / d));
    S.rt.h1 = mkTarget(gl, W(2), H(2), true); S.rt.q1 = mkTarget(gl, W(4), H(4), true); S.rt.e1 = mkTarget(gl, W(8), H(8), true); S.rt.x1 = mkTarget(gl, W(16), H(16), true);
    S.rt.e2 = mkTarget(gl, W(8), H(8), true); S.rt.q2 = mkTarget(gl, W(4), H(4), true); S.rt.h2 = mkTarget(gl, W(2), H(2), true);
    S.rt.sm = mkTarget(gl, W(4), H(4), true); S.rt.s1 = mkTarget(gl, W(4), H(4), true); S.rt.s2 = mkTarget(gl, W(4), H(4), true);
    S.w = w; S.h = h;
  }
  function into(gl, t) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb); gl.viewport(0, 0, t.w, t.h); }
  const postPass = {
    name: 'post', order: 90,
    init(gl) { if (S.gl !== gl) initGL(gl); },
    resize(w, h) { /* targets follow the scene's size in draw */ },
    draw(gl, F) {
      const t0 = now();
      const pr = programs(), sc = F.targets.scene;
      ensurePost(gl, sc.w, sc.h);
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
      const bloomOn = flag('bloom') || flag('cineLight');
      const shaftOn = F.outdoor && (flag('sunShafts') || flag('cineLight')) && P.sunVis > 0.05 && sunOnScreen(F);
      stats.bloom = bloomOn; stats.shafts = shaftOn;
      if (bloomOn) {
        let p = R3D.use(pr.bright);
        into(gl, S.rt.h1); tex(gl, 6, sc.color, p, 'uSrc'); tex(gl, 7, sc.aux, p, 'uAux');
        gl.uniform2f(p.u.uTexel, 1 / sc.w, 1 / sc.h); gl.uniform4f(p.u.uK, 1.0, flag('cineLight') ? 0.9 : 0.7, 0.8, 0);
        tri(gl);
        p = R3D.use(pr.down);
        for (const [a, b] of [['h1', 'q1'], ['q1', 'e1'], ['e1', 'x1']]) { into(gl, S.rt[b]); tex(gl, 6, S.rt[a].tex, p, 'uSrc'); gl.uniform2f(p.u.uTexel, 1 / S.rt[a].w, 1 / S.rt[a].h); tri(gl); }
        p = R3D.use(pr.up);
        for (const [src, add, dst] of [['x1', 'e1', 'e2'], ['e2', 'q1', 'q2'], ['q2', 'h1', 'h2']]) {
          into(gl, S.rt[dst]); tex(gl, 6, S.rt[src].tex, p, 'uSrc'); tex(gl, 7, S.rt[add].tex, p, 'uAdd');
          gl.uniform2f(p.u.uTexel, 1 / S.rt[src].w, 1 / S.rt[src].h); gl.uniform1f(p.u.uMix, 1.0); tri(gl);
        }
      }
      if (shaftOn) {
        let p = R3D.use(pr.mask);
        into(gl, S.rt.sm); tex(gl, 6, sc.color, p, 'uSrc'); tex(gl, 7, sc.depthTex, p, 'uDepth'); gl.uniform2f(p.u.uSun, sunUV[0], sunUV[1]); tri(gl);
        p = R3D.use(pr.shaft);
        into(gl, S.rt.s1); tex(gl, 6, S.rt.sm.tex, p, 'uSrc'); gl.uniform2f(p.u.uSun, sunUV[0], sunUV[1]); gl.uniform1f(p.u.uStep, 0.045); gl.uniform1f(p.u.uDecay, 0.93); tri(gl);
        into(gl, S.rt.s2); tex(gl, 6, S.rt.s1.tex, p, 'uSrc'); gl.uniform1f(p.u.uStep, 0.018); gl.uniform1f(p.u.uDecay, 0.96); tri(gl);
      }
      // the grade table
      const gradeOn = flag('grade') && buildGrade(F);
      stats.grade = gradeOn;
      if (!S.lutTex) { S.lutTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, S.lutTex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 256, 1); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); S.lutDirty = true; }
      if (S.lutDirty) { gl.bindTexture(gl.TEXTURE_2D, S.lutTex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, lutBuf); S.lutDirty = false; }
      R3D.bindOutput(gl, F);
      const p = R3D.use(pr.comp);
      tex(gl, 6, sc.color, p, 'uScene'); tex(gl, 7, bloomOn ? S.rt.h2.tex : S.rt.h1.tex, p, 'uBloom'); tex(gl, 8, S.rt.s2.tex, p, 'uShaft'); tex(gl, 9, S.lutTex, p, 'uLut');
      const cine = flag('cineGrade') && !(typeof document !== 'undefined' && document.documentElement.classList.contains('ac-hc'));
      const CG = typeof CINEMA14 !== 'undefined' && CINEMA14.T && CINEMA14.T.grade ? CINEMA14.T.grade : { sat: 1.12, con: 1.08 };
      gl.uniform4f(p.u.uC1, flag('cineLight') ? 0.85 : 0.6, 0.55 * P.sunVis, gradeOn ? 1 : 0, gradeSat);
      gl.uniform4f(p.u.uC2, cine ? 1 : 0, CG.con, CG.sat, cine ? 0.2 : 0.08);
      gl.uniform4f(p.u.uC3, P.underwater, 1.0, bloomOn ? 1 : 0, shaftOn ? 1 : 0);
      gl.uniform3f(p.u.uShaftC, 1.0 * P.glow[0] + 0.3, 0.92 * P.glow[1] + 0.25, 0.8 * P.glow[2] + 0.2);
      tri(gl);
      stats.post = now() - t0;
    },
  };

  // ------------------------------------------------------------------------------------------------ install
  function install() {
    try {
      R3D.setChunk('shade', SHADE, { uniforms: (g, pr) => shadeUniforms(g, pr) });
    } catch (e) { stats.failed = 'shade: ' + (e && e.message); warnOnce('shade chunk (CORE shading stays)', e); return false; }
    try { R3D.addPass(skyPass); } catch (e) { stats.failed = 'sky: ' + (e && e.message); warnOnce('sky pass', e); }
    try { R3D.addPass(postPass); } catch (e) { stats.failed = 'post: ' + (e && e.message); warnOnce('post pass', e); }
    R3D.on('frame', (F) => { const t0 = now(); try { frameParams(F); } catch (e) { warnOnce('frame', e); } stats.frames++; stats.ms = now() - t0; stats.shadows = P.shadowOn; stats.clouds = P.cl[0]; stats.panoLayers = P.panoOn ? pano.n : 0; });
    R3D.on('restored', (gl) => { if (gl) initGL(gl); });
    stats.installed = true;
    return true;
  }
  install();

  return { stats, ported, P, available: true, keyAt, frameParams, heights: () => hgt, pano: () => pano, shaderSource: () => ({ SHADE, SKY_FS, COMP_FS }) };
})();
if (typeof window !== 'undefined') window.LIGHT21 = LIGHT21;
