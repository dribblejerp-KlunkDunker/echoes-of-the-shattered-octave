/* North Gate frame-only rendering pilot. No gate-leaf replacement or gameplay writes. */
(function(root){
'use strict';
const finite=(v,d)=>Number.isFinite(v)?v:d;
function inspect(m,f={}){
 if(!m||m.id!=='oakhaven'||m.w!==70||m.h!==64||!Array.isArray(m.cells))return null;
 if(f.greening||f.escaped||f.part3||f.part4)return null;
 const c=m.cells[23],l=m.cells[92],r=m.cells[94];
 if(!c||!c.door||c.label!=='The North Gate'||!c.portal||c.portal.map!=='clearing'||m.cells[93]||m.cells[163]||!l||!r||l.door||r.door)return null;
 let z;try{z=typeof m.groundAt==='function'?m.groundAt(23.5,1.5):0;}catch(e){return null;}
 if(!Number.isFinite(z))return null;
 const h=Math.max(z+1.05,finite(l.top,z+1),finite(r.top,z+1))-z;
 return h<=4?{origin:[23.5,2.02,z],height:h,opening:[23,24]}:null;
}
function geometry(h){
 if(!Number.isFinite(h)||h<.8||h>4)throw new RangeError('Invalid frame height');
 const v=[];
 function box(c,s,color){
 const [a,b,d]=s.map(x=>x/2),p=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(q=>q.map((x,i)=>x+c[i]));
 for(const [face,n]of [[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,1,5,4],[0,-1,0]],[[1,2,6,5],[1,0,0]],[[2,3,7,6],[0,1,0]],[[3,0,4,7],[-1,0,0]]])for(const k of [0,1,2,0,2,3])v.push(...p[face[k]],...n,...color);
 }
 for(const s of [-1,1]){box([s*.575,0,h/2],[.15,.2,h],[.37,.30,.21]);box([s*.575,0,.055],[.15,.24,.11],[.34,.34,.29]);for(const z of [h*.23,h*.77])box([s*.575,.107,z],[.15,.025,.045],[.18,.19,.17]);}
 box([0,0,h+.065],[1.3,.23,.13],[.37,.30,.21]);return new Float32Array(v);
}
const VS=`#version 300 es
precision highp float;
layout(location=0)in vec3 p;layout(location=1)in vec3 n;layout(location=2)in vec3 c;
uniform mat4 vp;uniform vec3 origin;uniform float zk;
out vec3 world;out vec3 normal;out vec3 color;
void main(){world=vec3(p.xy+origin.xy,(p.z+origin.z)*zk);normal=normalize(vec3(n.xy,n.z/zk));color=c;gl_Position=vp*vec4(world,1.);}`;
const FS=`#version 300 es
precision highp float;
in vec3 world;in vec3 normal;in vec3 color;
uniform vec3 eye;uniform vec3 fogColor;uniform vec2 forward;uniform float fogDist;uniform float light;
layout(location=0)out vec4 outColor;layout(location=1)out vec4 outAux;
void main(){float shade=.76+.24*max(0.,dot(normalize(normal),normalize(vec3(-.4,-.5,.8))));float f=clamp(dot(world.xy-eye.xy,forward)/max(fogDist,.01),0.,1.);outColor=vec4(mix(color*shade,fogColor,f)*max(light,0.),1.);outAux=vec4(4./255.,0.,0.,1.);}`;
function create(R,flags=()=>({})){
 let on=false,fault=false,gpu=null,lastHeight=null,installed=false;
 const stats={draws:0,uploads:0,errors:0};
 function release(del){if(gpu&&del){gpu.g.deleteVertexArray(gpu.vao);gpu.g.deleteBuffer(gpu.b);gpu.g.deleteProgram(gpu.p);}gpu=null;lastHeight=null;}
 function allocate(g){
 let p=null,vao=null,b=null;const shaders=[];const oldV=g.getParameter(g.VERTEX_ARRAY_BINDING),oldB=g.getParameter(g.ARRAY_BUFFER_BINDING);
 try{
 p=g.createProgram();for(const [type,src]of [[g.VERTEX_SHADER,VS],[g.FRAGMENT_SHADER,FS]]){const s=g.createShader(type);shaders.push(s);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw Error(g.getShaderInfoLog(s));g.attachShader(p,s);}
 g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw Error(g.getProgramInfoLog(p));
 vao=g.createVertexArray();b=g.createBuffer();g.bindVertexArray(vao);g.bindBuffer(g.ARRAY_BUFFER,b);for(let i=0;i<3;i++){g.enableVertexAttribArray(i);g.vertexAttribPointer(i,3,g.FLOAT,false,36,i*12);}
 const u={};for(const n of ['vp','origin','zk','eye','fogColor','forward','fogDist','light'])u[n]=g.getUniformLocation(p,n);return {g,p,vao,b,u,count:0};
 }catch(e){if(vao)g.deleteVertexArray(vao);if(b)g.deleteBuffer(b);if(p)g.deleteProgram(p);throw e;}
 finally{shaders.forEach(s=>g.deleteShader(s));g.bindVertexArray(oldV);g.bindBuffer(g.ARRAY_BUFFER,oldB);}
 }
 function eligible(F){if(!on||fault)return null;if(typeof GFX!=='undefined'&&['plain','original'].includes(GFX.preset))return null;return inspect(F&&F.map,flags());}
 function draw(g,F){const at=eligible(F);if(!at)return;
 const old={p:g.getParameter(g.CURRENT_PROGRAM),v:g.getParameter(g.VERTEX_ARRAY_BINDING),b:g.getParameter(g.ARRAY_BUFFER_BINDING),mask:g.getParameter(g.DEPTH_WRITEMASK),caps:[g.DEPTH_TEST,g.BLEND,g.CULL_FACE].map(x=>[x,g.isEnabled(x)])};
 try{
 if(!gpu||gpu.g!==g){release(false);gpu=allocate(g);}const q=gpu,e=F.env||{};
 g.bindVertexArray(q.vao);g.bindBuffer(g.ARRAY_BUFFER,q.b);if(lastHeight!==at.height){const v=geometry(at.height);g.bufferData(g.ARRAY_BUFFER,v,g.STATIC_DRAW);q.count=v.length/9;lastHeight=at.height;stats.uploads++;}
 g.useProgram(q.p);g.enable(g.DEPTH_TEST);g.disable(g.BLEND);g.disable(g.CULL_FACE);g.depthMask(true);
 g.uniformMatrix4fv(q.u.vp,false,F.viewProj);g.uniform3fv(q.u.origin,at.origin);g.uniform1f(q.u.zk,finite(F.ZK,.61875));g.uniform3fv(q.u.eye,F.eye);g.uniform2fv(q.u.forward,F.fwdH);g.uniform3f(q.u.fogColor,finite(e.fogR,70)/255,finite(e.fogG,72)/255,finite(e.fogB,80)/255);g.uniform1f(q.u.fogDist,finite(e.fogDist,22));g.uniform1f(q.u.light,finite(e.light,1));g.drawArrays(g.TRIANGLES,0,q.count);stats.draws++;
 }catch(e){fault=true;stats.errors++;console.warn('oakhaven-gate-frame disabled',e);}
 finally{g.useProgram(old.p);g.bindVertexArray(old.v);g.bindBuffer(g.ARRAY_BUFFER,old.b);g.depthMask(old.mask);for(const [cap,value]of old.caps)value?g.enable(cap):g.disable(cap);}
 }
 const pass={name:'oakhaven-gate-frame',order:25,enabled:F=>!!eligible(F),init:()=>release(false),dispose:()=>release(true),draw};
 function install(){if(!installed&&R&&typeof R.addPass==='function'){R.addPass(pass);if(R.on)R.on('lost',()=>release(false));installed=true;}return installed;}
 install();return {inspect,geometry,pass,stats,install,setEnabled(v){on=!!v;return on;},retry(){fault=false;},dispose(){on=false;release(true);},status(){return {enabled:on,fault,installed,presentation:'frame-only; legacy gate unchanged'};}};
}
if(typeof module!=='undefined'&&module.exports)module.exports={inspect,geometry,create,VS,FS};
if(root&&typeof R3D!=='undefined')root.OAK_GATE_FRAME=create(R3D,()=>typeof G!=='undefined'?G.flags||{}:{});
})(typeof window!=='undefined'?window:null);
