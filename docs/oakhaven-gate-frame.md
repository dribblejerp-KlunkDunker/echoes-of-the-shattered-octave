# North Gate rendering pilot

Branch: graphics/oakhaven-benchmark. Technical frame-only pass, OFF by default. Does not replace the rising lattice, import GLBs, or change gameplay, maps, entities, collision, saves or transfer behavior. No benchmark-quality claim.

Open dev/oakhaven-gate.html through the existing static server. Begin a fresh game, visit Oakhaven, then select Enable frame. This launcher injects the module without changing index.html. Use a disposable development origin; existing game code can retain its normal browser-storage behavior. This is not a deployed branch preview.

The frame is at the inside mouth (23.5,2.02), not the portal plane. It preserves opening x=23..24, reads adjacent tops/ground, and converts height using R3D.ZK once. It is excluded during Greening and later flags or when the expected passage is changed. Its simple flat-color shader does not integrate LIGHT21 local lights/shadows; this must be checked before promotion.

Run: node test/oakhaven-gate-frame.unit.test.cjs

Prepared validation: Node syntax and pure-function tests; standalone headless WebGL2 shader/draw/resource smoke test. These are not full-game acceptance. No actual Oakhaven captures, walking clearance, portal/save regression, real context-loss or hardware performance results exist yet. Test resource disposal/reinitialization is not actual context loss.

Next: in-game baseline/frame captures in daylight and dusk; passage walk; gate lock/transfer/save tests; complete map overlay inspection. Only then add explicit ownership of the old gate presentation and animated timber leaves. No normal entry-page, precache, deployment workflow or main-branch modifications are included.
