 'use strict';
const a=require('node:assert/strict'),M=require('../js/oakhaven-gate-frame.js');let checks=0;const ok=(v)=>{a.ok(v);checks++;};
function map(){const m={id:'oakhaven',w:70,h:64,cells:Array(4480).fill(null),groundAt:()=>0};m.cells[23]={door:true,label:'The North Gate',portal:{map:'clearing'}};m.cells[92]={top:1.8};m.cells[94]={top:1.8};return m;}
const m=map(),before=JSON.stringify(m);ok(M.inspect(m).height===1.8);ok(M.inspect(m).origin[1]===2.02);
for(const k of ['greening','escaped','part3','part4'])ok(M.inspect(m,{[k]:true})===null);
ok(!M.inspect({...m,id:'clearing'}));const b=map();b.cells[93]={};ok(!M.inspect(b));
const bad=map();bad.groundAt=()=>NaN;ok(!M.inspect(bad));ok(JSON.stringify(m)===before);
const v=M.geometry(1.8);ok(v.length===324*9);ok([...v].every(Number.isFinite));a.throws(()=>M.geometry(NaN),RangeError);checks++;
for(let i=0;i<v.length;i+=9)ok(!(Math.abs(v[i])<.49999&&v[i+2]<1.79999));
const R={passes:[],addPass(p){this.passes.push(p);},on(){}};const api=M.create(R);ok(!api.pass.enabled({map:m}));api.setEnabled(true);ok(api.pass.enabled({map:m}));api.install();ok(R.passes.length===1);api.setEnabled(false);ok(!api.pass.enabled({map:m}));ok(api.pass.order===25);
console.log(JSON.stringify({checks,status:'passed'}));
