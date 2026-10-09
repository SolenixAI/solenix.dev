// The space: one three.js world that any page can host. createSpace(env) draws the sky, the three suns on the
// figure-eight, the wells that bend the grid, the dust, the trails and the wires, and it steers the suns from the
// scroll. The page keeps everything of its own: the DOM, the story values, the tool worlds' places and the labels.
// The page sees each frame through env.onFrame and writes its own DOM there.
//
// Served to raw pages as /vendor/space/engine.js (scripts/vendor.ts) and imported by page code as 'solenix-space'
// (the page's importmap; tsconfig paths for tsc). This folder is the only place that imports three:
// scripts/check.sh enforces it. Everything here is a browser module with no page globals: the page is injected.
import { INK0, INK_SPAN } from "./orbit";
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ── Interface ──────────────────────────────────────────────────────────────────────────────────────────

export interface Vec3 { x: number; y: number; z: number }

/** The scroll-driven values a page sets each frame. Each field is read by the engine or by the page's onFrame. */
export interface SpaceParams {
  k: number; free: number; order: number; ink: number; third: number
  el: number; az: number; dist: number; ox: number; oy: number; poy: number
  calm: number; dim: number; labels: number; conn: number; agent: number; stops: number
  tx: number; tz: number; fly: number; wsel: number; hero: number; lens: number
  rf: number; rs: number; sp: number; rw: number; shl: number
}

/** The camera distance and height a reduced-motion station is shown from. */
export interface SpaceStation { el: number; dist: number }

/** A body on the plane that dips its own well. `az` is the camera azimuth (degrees) for its reduced-motion station. */
export interface SpaceWell { x: number; z: number; mass: number; az: number }

/** What the page tells the engine about the story. Every getter is read each frame, so the page may change it. */
export interface SpaceStory {
  params: () => SpaceParams
  hero: { el: number; dist: number; lens: number }
  stations: readonly SpaceStation[]
  /** Reduced motion: the camera [elevation, distance] held while the scroll is in a section, by its selector. */
  views: Readonly<Record<string, readonly number[]>>
  /** The selector of the section the scroll is in. */
  section: () => string
  /** A count the page raises to make the grid ring out (for example each new promise). */
  pings: () => number
}

/** One frame, as the page sees it after the render. Read it inside onFrame; do not keep it. */
export interface SpaceFrame {
  /** Seconds since the last frame (real time, at most 0.1). */
  dt: number
  /** The stage size in CSS pixels. */
  width: number
  height: number
  /** A narrow (portrait) stage. */
  portrait: boolean
  params: SpaceParams
  /** How far the hero is up, 0 to 1. */
  hero: number
  /** How far the camera is in a tool world's flyby, 0 to 1, and the world it is beside (a fraction). */
  fly: number
  wsel: number
  /** The orbit holds with no steering: the payoff. */
  locked: boolean
  /** Projects a world point to normalised device coordinates (x, y in -1..1; z below 1 is in front of the camera). */
  project: (x: number, y: number, z: number) => Vec3
  /** A tool world's position in the world. */
  well: (i: number) => Vec3
  /** A sun's position in the world (it moves). */
  sun: (i: number) => Vec3
  /** The AI at the centre. */
  hub: () => Vec3
  /** A point on the figure-eight, at parameter u (one loop is u in 0..1). */
  orbit: (u: number) => Vec3
  /** A sun's on-screen radius in CSS pixels. */
  sunRadiusPx: (i: number) => number
  /** How far sun i is from its place on the exact figure-eight (world units; 0 once it holds). */
  offOrbit: (i: number) => number
}

export interface SpaceEnv {
  canvas: HTMLCanvasElement
  /** The element the canvas fills: its clientWidth and clientHeight are the stage size. */
  stage: HTMLElement
  /** The resolved CSS colour of a token, as the browser reports it (for example "rgb(10, 20, 30)"). */
  token: (name: string) => string
  /** True when motion is allowed (false under prefers-reduced-motion). */
  motion: () => boolean
  story: SpaceStory
  /** The bodies that dip a well. At most MAX_WELLS. */
  wells: readonly SpaceWell[]
  /** The open band of a section, measured from the page: y0 and y1 in CSS pixels, stacked 1 when lanes are stacked. */
  openBand?: (section: string) => { y0: number; y1: number; stacked: number } | null
  /** After the render, each frame: the page writes its labels and markers here. */
  onFrame?: (frame: SpaceFrame) => void
  /** Once the first frame is on screen. */
  onReady?: () => void
  /** When WebGL cannot start. The engine then throws 'WebGL unavailable'. */
  onNoWebGL?: () => void
  /** When the orbit starts to hold (true) or stops (false). */
  onLock?: (holding: boolean) => void
  /** The moment the orbit locks, with full motion only. */
  onPayoff?: () => void
  /** After the stage is measured or resized. */
  onResize?: () => void
}

export interface Space {
  /** Starts the loop while a page shows the space, stops it while none does. The canvas and renderer stay. */
  setActive: (on: boolean) => void
  /** Removes every listener, stops the loop and frees the renderer. The canvas is left as it was found. */
  dispose: () => void
}

/** The wells the engine can hold. Shaders are built for the wells given, up to this many. */
export const MAX_WELLS = 12

/** Where stop k of n sits along the figure-eight, as a parameter u (the stops on the orbit read in order). */
export { orbitStop } from "./orbit";

// ── Constants: the physics and the figure-eight (pure; shared by every space) ──────────────────────────

const DT = 0.004, T8 = 6.32591398, SC = 2.1, SUN_Y = 0.15;
const TOOL_G = 10;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const D2R = THREE.MathUtils.degToRad;

type Sys = { p: Float64Array; v: Float64Array; a: Float64Array; t: number };
function makeSys(p: ArrayLike<number>, v: ArrayLike<number>): Sys { return { p: Float64Array.from(p), v: Float64Array.from(v), a: new Float64Array(6), t: 0 }; }
// Softened Newton gravity between the three suns, plus the soft bound that keeps them in frame.
function gravity(s: Sys, soft2: number, conf: number) {
  const p = s.p, a = s.a; a.fill(0);
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    const dx = p[j * 2] - p[i * 2], dy = p[j * 2 + 1] - p[i * 2 + 1], r2 = dx * dx + dy * dy + soft2, inv = 1 / (r2 * Math.sqrt(r2));
    a[i * 2] += dx * inv; a[i * 2 + 1] += dy * inv; a[j * 2] -= dx * inv; a[j * 2 + 1] -= dy * inv;
  }
  if (conf > 0) for (let i = 0; i < 3; i++) { const x = p[i * 2], y = p[i * 2 + 1], r = Math.hypot(x, y); if (r > 1.05) { const k = 5 * conf * (r - 1.05) / r; a[i * 2] -= k * x; a[i * 2 + 1] -= k * y; } }
}
// The Chenciner–Montgomery figure-eight (unsoftened), and a chaotic start that is steered onto it.
const X1 = [-0.97000436, 0.24308753], V3 = [-0.93240737, -0.86473146];
const P8 = [X1[0], X1[1], -X1[0], -X1[1], 0, 0], V8 = [-V3[0] / 2, -V3[1] / 2, -V3[0] / 2, -V3[1] / 2, V3[0], V3[1]];
const cv = [0.1, 0.45, -0.35, -0.2, 0.25, -0.25].map(x => x * 2.6), cp = [0.9, 0.3, -0.7, 0.6, -0.2, -0.9];
for (const arr of [cv, cp]) { const mx = (arr[0] + arr[2] + arr[4]) / 3, my = (arr[1] + arr[3] + arr[5]) / 3; for (let i = 0; i < 3; i++) { arr[i * 2] -= mx; arr[i * 2 + 1] -= my; } }
// The figure-eight curve itself, sampled by time from a separate run: body three's path.
const LUT_N = 1024, LUT = new Float32Array(LUT_N * 2);
{ const s = makeSys(P8, V8), per = Math.round(T8 / DT); gravity(s, 0, 0);
  for (let i = 0; i < per; i++) { const k = Math.floor(i / per * LUT_N); LUT[k * 2] = s.p[4]; LUT[k * 2 + 1] = s.p[5];
    for (let q = 0; q < 6; q++) { s.v[q] += 0.5 * DT * s.a[q]; s.p[q] += DT * s.v[q]; } gravity(s, 0, 0); for (let q = 0; q < 6; q++) s.v[q] += 0.5 * DT * s.a[q]; } }
function curve(u: number, out: number[]) { u = ((u % 1) + 1) % 1; const f = u * LUT_N, i = Math.floor(f), j = (i + 1) % LUT_N, t = f - i; out[0] = LUT[i * 2] + (LUT[j * 2] - LUT[i * 2]) * t; out[1] = LUT[i * 2 + 1] + (LUT[j * 2 + 1] - LUT[i * 2 + 1]) * t; return out; }
function gauss() { return Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(Math.random() * 6.2832); }

// The shaders. Plain GLSL strings: the noise, the lens and the sun, grid, dust, ribbon and arc materials.
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);} vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<4;i++){f+=a*snoise(p);p*=2.03;a*=.5;}return f;}`;
// Lensing: each sun bends the light behind it. Vertices are moved to where a point lens puts
// the primary image, r' = (r + sqrt(r² + 4θE²)) / 2, so stars and grid pile up around each sun.
const LENS = `uniform vec3 uLens[3]; uniform float uAsp;
vec4 lens(vec4 cp){ if(cp.w<=0.) return cp; vec2 n=cp.xy/cp.w;
  for(int i=0;i<3;i++){ vec2 d=n-uLens[i].xy; d.x*=uAsp; float r=length(d)+1e-4, te=uLens[i].z; float r2=.5*(r+sqrt(r*r+4.*te*te)); d*=r2/r; d.x/=uAsp; n=uLens[i].xy+d; }
  cp.xy=n*cp.w; return cp; }`;
const ARC_FRAG = `uniform vec3 uCol,uHot; uniform float uAlpha,uTime,uPh; varying float vT,vS;
  void main(){ float edge=1.-abs(vS); edge=edge*edge*(3.-2.*edge);
    float ends=smoothstep(0.,.14,vT)*smoothstep(1.,.86,vT);
    float x=fract(vT-uTime*.38+uPh)-.5; float pulse=exp(-x*x*140.);
    vec3 c=mix(uCol,uHot,pulse)*(edge*.75+pulse*edge*2.2);
    gl_FragColor=vec4(c*ends*uAlpha,1.); }`;

/** Builds the space on the page's canvas. Throws 'WebGL unavailable' when the browser cannot draw it. */
export function createSpace(env: SpaceEnv): Space {
  const { canvas, stage, story } = env;
  const WN = env.wells.length;
  if (WN > MAX_WELLS) throw new Error(`createSpace: ${WN} wells, at most ${MAX_WELLS}`);
  const TOOL_M = env.wells.map(w => w.mass);
  const WPOS = env.wells.map(w => new THREE.Vector3(w.x, SUN_Y, w.z));
  const WELL_R = 2;

  // Colours come from the page's tokens: each one is read as a resolved colour, then as a linear THREE.Color.
  const colorOf = (css: string) => { const m = css.match(/[\d.]+/g) || [1, 1, 1], f = css.startsWith('color(') ? 1 : 255; return new THREE.Color().setRGB(Number(m[0]) / f, Number(m[1]) / f, Number(m[2]) / f, THREE.SRGBColorSpace); };
  const tok = (n: string) => colorOf(env.token(n));
  const WHITE = new THREE.Color(1, 1, 1);
  const C = { bg: tok('--bg'), sun1: tok('--sun1'), sun2: tok('--sun2'), ring: tok('--ring'), text: tok('--text'), sky: tok('--chart-5') };

  // ── Physics ──
  // One system you watch, and one exact figure-eight it can be steered toward.
  // Steering is a real control force, a = gravity + kp(x* − x) + kd(v* − v); scroll sets its strength.
  // Near the end steering drops to zero and the orbit holds on its own, which the figure-eight does.
  const ctl = { k: 0, soft: 0.35, conf: 1 };
  // Roaming. The physics runs in its own small frame; `roam` says where in the world each body's frame sits
  // (o: an x,z offset per body) and how far the three are spread. Until the plan these keep moving, so the
  // bodies really cross the plane. At the plan they come home: offsets go to zero and the spread to one.
  const roam = { o: new Float64Array(6), sp: 1, mx: 0, mz: 0, r: 0, q: 1, ax: 0, az: -1 };
  // Simulation frame to world. `q` flattens the three along the line of sight (ax, az), so beside a tool
  // they spread wide across the open sky without dropping into the rows of text. q is 1 everywhere else.
  const wv = [0, 0];
  function toWorld(px: number, py: number, k: number) { const d = (px * roam.ax + py * roam.az) * (1 - roam.q), K = SC * roam.sp; wv[0] = (px - d * roam.ax) * K + roam.o[k]; wv[1] = (py - d * roam.az) * K + roam.o[k + 1]; return wv; }
  const eight = makeSys(P8, V8);   // the exact orbit, never touched
  const sys = makeSys(cp, cv);     // what you see
  const W8 = 4;                    // steering stiffness, in sim time
  const ctrlA = new Float64Array(6), toolA = new Float64Array(6);
  // The pointer is a faint fourth mass on the plane. It tugs the suns and the dust.
  const cur = { x: 0, y: 0, m: 0 };
  function accelSys() {
    gravity(sys, ctl.soft * ctl.soft, ctl.conf);
    if (cur.m > 0.001) for (let i = 0; i < 3; i++) { const dx = cur.x - sys.p[i * 2], dy = cur.y - sys.p[i * 2 + 1], r2 = dx * dx + dy * dy + 0.09, f = cur.m * 0.05 / (r2 * Math.sqrt(r2)); sys.a[i * 2] += dx * f; sys.a[i * 2 + 1] += dy * f; }
    // Most of the pull the three share is taken up by where they roam; what is left drags and stretches them toward the tool.
    if (ctl.conf > 0.001) { const K = SC * roam.sp; let mx = 0, mz = 0; toolA.fill(0);
      for (let i = 0; i < 3; i++) { toWorld(sys.p[i * 2], sys.p[i * 2 + 1], i * 2); const wx = wv[0], wz = wv[1];
        for (let j = 0; j < WN; j++) { const dx = WPOS[j].x - wx, dz = WPOS[j].z - wz, r2 = dx * dx + dz * dz + 1.2, f = TOOL_G * TOOL_M[j] * ctl.conf / (r2 * Math.sqrt(r2) * K); toolA[i * 2] += dx * f; toolA[i * 2 + 1] += dz * f; }
        mx += toolA[i * 2] / 3; mz += toolA[i * 2 + 1] / 3; }
      for (let i = 0; i < 3; i++) { sys.a[i * 2] += toolA[i * 2] - 0.7 * mx; sys.a[i * 2 + 1] += toolA[i * 2 + 1] - 0.7 * mz; } }
    const kp = ctl.k * W8 * W8, kd = ctl.k * 2 * W8;
    for (let k = 0; k < 6; k++) { ctrlA[k] = kp * (eight.p[k] - sys.p[k]) + kd * (eight.v[k] - sys.v[k]); sys.a[k] += ctrlA[k]; }
  }
  function step() {
    for (let k = 0; k < 6; k++) { sys.v[k] += 0.5 * DT * sys.a[k]; sys.p[k] += DT * sys.v[k]; eight.v[k] += 0.5 * DT * eight.a[k]; eight.p[k] += DT * eight.v[k]; }
    gravity(eight, 0, 0); accelSys();
    for (let k = 0; k < 6; k++) { sys.v[k] += 0.5 * DT * sys.a[k]; eight.v[k] += 0.5 * DT * eight.a[k]; }
    sys.t += DT; eight.t += DT;
  }
  gravity(eight, 0, 0); accelSys();
  function offOrbit() { let d = 0; for (let i = 0; i < 3; i++) d += (sys.p[i * 2] - eight.p[i * 2]) ** 2 + (sys.p[i * 2 + 1] - eight.p[i * 2 + 1]) ** 2; return Math.sqrt(d / 3); }

  // Trail history of what you see, pushed by simulation time so one full loop is exactly HN samples.
  const HN = 300, PUSH = T8 / HN;
  const hist = { p: new Float32Array(HN * 6), w: new Float32Array(HN * 6), head: 0, next: 0 };
  function push() { const i = hist.head = (hist.head + 1) % HN; for (let k = 0; k < 6; k++) hist.p[i * 6 + k] = sys.p[k]; for (let k = 0; k < 6; k += 2) { toWorld(sys.p[k], sys.p[k + 1], k); hist.w[i * 6 + k] = wv[0]; hist.w[i * 6 + k + 1] = wv[1]; } }
  function advance(simDt: number) {
    const n = Math.round(simDt / DT);
    for (let i = 0; i < n; i++) { step(); if (sys.t >= hist.next) { push(); hist.next += PUSH; } }
  }
  advance(24); // warm up: fills the trails and lands somewhere lively

  // ── Renderer ──
  const isSmall = Math.min(innerWidth, innerHeight) < 700;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
  catch (e) { env.onNoWebGL?.(); throw new Error('WebGL unavailable'); }
  let dprMax = Math.min(devicePixelRatio || 1, 2), dpr = dprMax;
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(C.bg, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);

  const additive = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };
  const bodyU = { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] };
  const lensU = { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] }, aspU = { value: 1 };
  const timeU = { value: 0 };

  // Starfield: shells at four depths. The near ones slide past the far ones as the camera moves.
  const starPx = { value: 1 };
  // `lat` gathers a shell into a band across the sky, tilted off the plane, so the dark has a far side.
  function stars(n: number, r0: number, r1: number, size: number, lat = 0, gain = 1.5) {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), seed = new Float32Array(n), ct = Math.cos(1.02), st = Math.sin(1.02);
    for (let i = 0; i < n; i++) { const u = lat ? Math.sin(gauss() * lat) : Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, r = r0 + Math.random() * (r1 - r0), s = Math.sqrt(Math.max(0, 1 - u * u));
      const x = r * s * Math.cos(t), y = r * u, z = r * s * Math.sin(t);
      pos[i * 3] = x; pos[i * 3 + 1] = lat ? y * ct - z * st : y; pos[i * 3 + 2] = lat ? y * st + z * ct : z; seed[i] = Math.random(); }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({ ...additive, uniforms: { uTime: timeU, uPx: { value: size }, uDpr: starPx, uGain: { value: gain }, uWarm: { value: C.sun1 }, uCool: { value: C.sky }, uLens: lensU, uAsp: aspU },
      vertexShader: LENS + `attribute float aSeed; uniform float uTime,uPx,uDpr; varying float vA; varying float vS;
        void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=lens(projectionMatrix*mv); vS=aSeed;
          vA=(0.4+0.6*pow(aSeed,3.))*(0.7+0.3*sin(uTime*(1.+aSeed*2.)+aSeed*40.)); gl_PointSize=uPx*uDpr*(0.6+pow(aSeed,4.)*2.2); }`,
      fragmentShader: `uniform vec3 uWarm,uCool; uniform float uGain; varying float vA; varying float vS;
        void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); a*=a; vec3 c=mix(vec3(.9),vS>.8?uWarm:uCool,.22); gl_FragColor=vec4(c*a*vA*uGain,1.); }` });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 0; return pts;
  }
  scene.add(stars(isSmall ? 22000 : 32000, 70, 140, 2.6), stars(isSmall ? 700 : 1100, 22, 40, 2.8), stars(isSmall ? 6000 : 9000, 40, 70, 2.2), stars(isSmall ? 9000 : 14000, 150, 210, 2, 0.2, 1.8));

  // Deep space behind everything: a warm galaxy band, with faint cloud across the rest of the sky. It is painted
  // once into a small texture at start-up, so each frame it costs one texture read per pixel. The sky rides with
  // the camera (it is infinitely far); the star shells do not, so they slide across it as the camera moves.
  const skyRT = new THREE.WebGLRenderTarget(isSmall ? 1024 : 2048, isSmall ? 512 : 1024, { type: THREE.HalfFloatType, depthBuffer: false });
  skyRT.texture.wrapS = THREE.RepeatWrapping;
  { const paint = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ depthTest: false, uniforms: { uEmber: { value: C.sun2 }, uGold: { value: C.sun1 }, uPaper: { value: C.text } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
      fragmentShader: NOISE + `uniform vec3 uEmber,uGold,uPaper; varying vec2 vUv;
        void main(){ float lon=(vUv.x-.5)*6.28318, lat=(vUv.y-.5)*3.14159;
          vec3 d=vec3(cos(lat)*cos(lon),sin(lat),cos(lat)*sin(lon));
          float n=fbm(d*1.6+7.3), n2=fbm(d*4.2+2.1), n3=fbm(d*9.+11.);
          float w=.2+.07*n, band=exp(-lat*lat/(2.*w*w));
          float bulge=exp(-(lat*lat*3.+(lon-.6)*(lon-.6))/1.1);
          float lane=smoothstep(.02,.34,abs(n2*.9+lat*3.2+.1));
          float core=band*(.24+.32*bulge+.24*n)*mix(.3,1.,lane)+bulge*.08;
          float mist=pow(clamp(n*.6+.48+.32*n2,0.,1.),3.2)*.75+.13*(n2*.5+.5);
          float I=max(0.,core)+mist*(1.+.3*n3); I=I/(1.+.6*I);
          vec3 c=mix(uEmber,uGold,smoothstep(.1,.7,I)); c=mix(c,uPaper,.12+.38*smoothstep(.3,.7,I));
          gl_FragColor=vec4(c*I,1.); }` }));
    paint.frustumCulled = false; const ps = new THREE.Scene(); ps.add(paint);
    renderer.setRenderTarget(skyRT); renderer.render(ps, camera); renderer.setRenderTarget(null); paint.geometry.dispose(); paint.material.dispose(); }
  const deepSky = new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), new THREE.ShaderMaterial({ ...additive, side: THREE.BackSide, uniforms: { uMap: { value: skyRT.texture }, uGain: { value: 0.17 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uGain; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(uMap,vUv).rgb*uGain,1.); }` }));
  deepSky.rotation.x = 1.02; deepSky.frustumCulled = false; deepSky.renderOrder = -1; scene.add(deepSky);

  // Spacetime: each of the three suns and each well body dips its own well. A well ends a short way out
  // (WELL_R), so nine bodies make nine wells, not one basin, and the lines show only where space is bent.
  const toolU = { value: env.wells.map((w, i) => new THREE.Vector3(w.x, w.z, TOOL_M[i])) };
  const gridU = { uB: bodyU, uT: toolU, uLens: lensU, uAsp: aspU, uC: { value: new THREE.Vector3() }, uLock: { value: 99 }, uTime: timeU, uDepth: { value: 0.95 }, uChaos: { value: 1 }, uBase: { value: -0.35 }, uSoft: { value: 0.3 }, uR: { value: 1 / Math.sqrt(WELL_R * WELL_R + 0.3) }, uCell: { value: 0.5 },
    uLine: { value: C.text.clone().multiplyScalar(0.34) }, uWarm: { value: C.sun2.clone() }, uAlpha: { value: 1 } };
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(48, 48, isSmall ? 150 : 240, isSmall ? 150 : 240).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ ...additive, uniforms: gridU,
    vertexShader: LENS + `uniform vec3 uB[3]; uniform vec3 uT[${WN}]; uniform vec3 uC; uniform float uTime,uDepth,uChaos,uBase,uSoft,uR,uLock; varying vec3 vW; varying float vPot; varying float vRing;
      void main(){ vec3 p=position; float s=0., rip=0.;
        for(int i=0;i<3;i++){ vec2 d=p.xz-uB[i].xz; float r2=dot(d,d); float w=max(0.,1./sqrt(r2+uSoft)-uR); s+=w*w/(w+.12); float r=sqrt(r2); rip+=sin(r*2.3-uTime*2.6+float(i)*2.1)*exp(-r*.32); }
        for(int i=0;i<${WN};i++){ vec2 d=p.xz-uT[i].xy; float w=max(0.,1./sqrt(dot(d,d)+.5)-.305); s+=uT[i].z*w*w/(w+.12); }
        vec2 dc=p.xz-uC.xy; s+=uC.z*.35/sqrt(dot(dc,dc)+.6);
        float rr=length(p.xz), ring=exp(-pow(rr-uLock*6.5,2.)*.9)*exp(-uLock*.55); vRing=ring;
        p.y=uBase-uDepth*s+rip*.07*uChaos-ring*.45; vPot=s; vW=p; gl_Position=lens(projectionMatrix*modelViewMatrix*vec4(p,1.)); }`,
    fragmentShader: `uniform vec3 uB[3]; uniform vec3 uLine,uWarm; uniform float uCell,uAlpha,uChaos; varying vec3 vW; varying float vPot; varying float vRing;
      float gl(vec2 c,float w){ vec2 f=fwidth(c); vec2 g=abs(fract(c-.5)-.5)/f; return (1.-min(min(g.x,g.y)/w,1.))*(1.-smoothstep(.22,.55,max(f.x,f.y))); }
      void main(){ vec2 c=vW.xz/uCell; float minor=gl(c,1.), major=gl(c/4.,1.3);
        float well=smoothstep(.35,1.5,vPot), bent=smoothstep(.0,.4,vPot); float fade=1.-smoothstep(14.,23.,length(vW.xz));
        float glow=0.; for(int i=0;i<3;i++){ vec2 d=vW.xz-uB[i].xz; glow+=exp(-dot(d,d)*.45); }
        vec3 col=mix(uLine,uWarm*1.25,well);
        float a=(minor*.32+major*.6)*(.27+.3*bent+1.7*well)*fade;
        gl_FragColor=vec4((col*a*(1.+vRing*2.5)+uWarm*glow*.035*fade+uWarm*vRing*.12*fade)*uAlpha,1.); }` }));
  grid.frustumCulled = false; grid.renderOrder = 1; scene.add(grid);
  function gridY(x: number, z: number) { let s = 0; for (const b of bodyU.value) { const dx = x - b.x, dz = z - b.z; const w = Math.max(0, 1 / Math.sqrt(dx * dx + dz * dz + 0.3) - gridU.uR.value); s += w * w / (w + 0.12); } return gridU.uBase.value - gridU.uDepth.value * s; }

  // Dust: test particles pulled by the same three suns.
  const DN = isSmall ? 3200 : 7000;
  const D = { x: new Float32Array(DN), y: new Float32Array(DN), vx: new Float32Array(DN), vy: new Float32Array(DN), ph: new Float32Array(DN), off: new Float32Array(DN), j: new Float32Array(DN) };
  const dPos = new Float32Array(DN * 3), dSeed = new Float32Array(DN);
  const disp = new Float64Array(6), dispV = new Float64Array(6);
  function spawn(i: number) {
    const u = Math.random(), t = Math.random() * Math.PI * 2;
    if (u < 0.8) { const k = i % 3, r = 0.16 + Math.pow(Math.random(), 1.7) * 1.1, sp = Math.sqrt(1 / r) * (0.92 + Math.random() * 0.22);
      D.x[i] = disp[k * 2] + r * Math.cos(t); D.y[i] = disp[k * 2 + 1] + r * Math.sin(t); D.vx[i] = -Math.sin(t) * sp + dispV[k * 2]; D.vy[i] = Math.cos(t) * sp + dispV[k * 2 + 1]; }
    else { const r = 1.3 + Math.random() * 2.4, sp = Math.sqrt(3 / r) * (0.85 + Math.random() * 0.2);
      D.x[i] = r * Math.cos(t); D.y[i] = r * Math.sin(t); D.vx[i] = -Math.sin(t) * sp; D.vy[i] = Math.cos(t) * sp; }
  }
  // Reduced motion blends what you see toward the exact orbit as the story settles, so the eight forms
  // by crossfade rather than by a fast pull. Full motion shows the steered system as it is.
  let shownBlend = 0;
  function updateDisplay() {
    const b = shownBlend, a = 1 - b;
    for (let k = 0; k < 6; k++) { disp[k] = sys.p[k] * a + eight.p[k] * b; dispV[k] = sys.v[k] * a + eight.v[k] * b; }
    for (let i = 0; i < 3; i++) { toWorld(disp[i * 2], disp[i * 2 + 1], i * 2); bodyU.value[i].set(wv[0], SUN_Y, wv[1]); }
  }
  updateDisplay();
  for (let i = 0; i < DN; i++) { spawn(i); D.ph[i] = Math.random(); D.off[i] = gauss() * (Math.random() < 0.85 ? 0.035 : 0.12); D.j[i] = gauss(); dSeed[i] = Math.random(); }
  function stepDust(h: number) {
    for (let i = 0; i < DN; i++) {
      let ax = 0, ay = 0, dead = false; const x = D.x[i], y = D.y[i];
      for (let k = 0; k < 3; k++) { const dx = disp[k * 2] - x, dy = disp[k * 2 + 1] - y, r2 = dx * dx + dy * dy; if (r2 < 0.006) dead = true; const q = r2 + 0.004, inv = 1 / (q * Math.sqrt(q)); ax += dx * inv; ay += dy * inv; }
      if (cur.m > 0.001) { const dx = cur.x - x, dy = cur.y - y, q = dx * dx + dy * dy + 0.02, inv = cur.m * 0.35 / (q * Math.sqrt(q)); ax += dx * inv; ay += dy * inv; }
      D.vx[i] += ax * h; D.vy[i] += ay * h; D.x[i] += D.vx[i] * h; D.y[i] += D.vy[i] * h;
      if (dead || D.x[i] * D.x[i] + D.y[i] * D.y[i] > 28) spawn(i);
    }
  }
  for (let i = 0; i < 120; i++) stepDust(0.008);
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3).setUsage(THREE.DynamicDrawUsage));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dSeed, 1));
  const dustU = { uB: bodyU, uTime: timeU, uPx: { value: 1 }, uOrder: { value: 0 }, uWarm: { value: C.sun1.clone().lerp(WHITE, 0.25) }, uCool: { value: C.text.clone() } };
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({ ...additive, uniforms: dustU,
    vertexShader: `attribute float aSeed; uniform vec3 uB[3]; uniform float uTime,uPx,uOrder; varying float vA; varying float vN;
      void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
        float n=0.; for(int i=0;i<3;i++){ vec3 d=position-uB[i]; n+=1./(1.+dot(d.xz,d.xz)*3.); }
        vN=clamp(n,0.,1.); float tw=.7+.3*sin(uTime*2.+aSeed*60.);
        vA=(.12+vN*.32*(1.-uOrder*.6)+uOrder*.1)*tw; gl_PointSize=uPx*(.8+aSeed*aSeed*2.2)*(14./-mv.z); }`,
    fragmentShader: `uniform vec3 uWarm,uCool; varying float vA; varying float vN;
      void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.05,d); gl_FragColor=vec4(mix(uCool*.6,uWarm*1.1,vN)*a*vA,1.); }` }));
  dust.frustumCulled = false; dust.renderOrder = 2; scene.add(dust);

  // Ribbons: thick, tapered, camera-facing.
  function ribbon(n: number, col: THREE.Color, width: number, frag?: string, taper = true) {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 6), t = new Float32Array(n * 2), sd = new Float32Array(n * 2), idx: number[] = [];
    for (let i = 0; i < n; i++) { t[i * 2] = t[i * 2 + 1] = i / (n - 1); sd[i * 2] = -1; sd[i * 2 + 1] = 1; if (i < n - 1) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aT', new THREE.BufferAttribute(t, 1)); g.setAttribute('aS', new THREE.BufferAttribute(sd, 1)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({ ...additive, uniforms: { uCol: { value: col }, uHot: { value: col.clone().lerp(WHITE, 0.55) }, uAlpha: { value: 1 }, uTime: timeU, uPh: { value: Math.random() } },
      vertexShader: `attribute float aT,aS; varying float vT,vS; void main(){ vT=aT; vS=aS; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: frag || `uniform vec3 uCol,uHot; uniform float uAlpha; varying float vT,vS;
        void main(){ float edge=1.-abs(vS); edge=edge*edge*(3.-2.*edge); float core=pow(edge,6.);
          float a=pow(vT,1.4)*uAlpha; vec3 c=mix(uCol,uHot,core*.5)*(edge*.6+core*.85)*(1.+1.2*pow(vT,14.)); gl_FragColor=vec4(c*a,1.); }` });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 3; scene.add(mesh);
    return { mesh, pos, n, width, taper, pts: new Float32Array(n * 3) };
  }
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  type Ribbon = ReturnType<typeof ribbon>
  function layRibbon(r: Ribbon, widthScale = 1) {
    const { pts, pos, n } = r, cam = camera.position;
    for (let i = 0; i < n; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      _a.set(pts[i1 * 3] - pts[i0 * 3], pts[i1 * 3 + 1] - pts[i0 * 3 + 1], pts[i1 * 3 + 2] - pts[i0 * 3 + 2]);
      _b.set(cam.x - pts[i * 3], cam.y - pts[i * 3 + 1], cam.z - pts[i * 3 + 2]);
      _c.crossVectors(_a, _b).normalize();
      const t = i / (n - 1), w = r.width * widthScale * (r.taper ? 0.08 + 0.92 * Math.pow(t, 0.75) : 1);
      pos[i * 6] = pts[i * 3] - _c.x * w; pos[i * 6 + 1] = pts[i * 3 + 1] - _c.y * w; pos[i * 6 + 2] = pts[i * 3 + 2] - _c.z * w;
      pos[i * 6 + 3] = pts[i * 3] + _c.x * w; pos[i * 6 + 4] = pts[i * 3 + 1] + _c.y * w; pos[i * 6 + 5] = pts[i * 3 + 2] + _c.z * w;
    }
    r.mesh.geometry.attributes.position.needsUpdate = true;
  }
  const SUNCOL = [C.sun1.clone().lerp(C.sun2, 0.35), C.sun2.clone(), C.sun1.clone().lerp(WHITE, 0.2)];
  const trails = SUNCOL.map(c => ribbon(HN + 1, c, 0.07));
  const agentTrail = ribbon(110, C.ring.clone().lerp(WHITE, 0.15), 0.05);
  // The orbit itself, inked in by the scroll: a thin, even line under the three suns.
  const GUIDE_N = 360;
  const guide = ribbon(GUIDE_N, C.ring.clone().lerp(C.sun1, 0.5), 0.012, `uniform vec3 uCol,uHot; uniform float uAlpha; varying float vT,vS;
    void main(){ float edge=1.-abs(vS); edge=smoothstep(0.,1.,edge); float head=smoothstep(.9,1.,vT); gl_FragColor=vec4(mix(uCol,uHot,head)*edge*uAlpha*(.55+head*1.2),1.); }`, false);
  guide.mesh.renderOrder = 2;

  // Wires: arcs from each tool to the others, and up to AI above the centre. Pulses travel along them.
  const HUB = new THREE.Vector3(0, 0.95, 0);   // the AI: at the centre, above where the orbit crosses
  const arcs = Array.from({ length: 6 }, (_, i) => ribbon(40, (i < 3 ? C.sun1 : C.ring).clone(), i < 3 ? 0.034 : 0.028, ARC_FRAG, false));
  function layArc(r: Ribbon, a: THREE.Vector3, b: THREE.Vector3, lift: number) {
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, my = Math.max(a.y, b.y) + lift;
    for (let k = 0; k < r.n; k++) { const t = k / (r.n - 1), u = 1 - t;
      r.pts[k * 3] = u * u * a.x + 2 * u * t * mx + t * t * b.x; r.pts[k * 3 + 1] = u * u * a.y + 2 * u * t * my + t * t * b.y; r.pts[k * 3 + 2] = u * u * a.z + 2 * u * t * mz + t * t * b.z; }
    layRibbon(r);
  }

  // Suns: billboarded plasma, corona, anamorphic streak. HDR so bloom takes them.
  function sunMat(col: THREE.Color, seed: number, size: number, r: number) {
    return new THREE.ShaderMaterial({ ...additive, uniforms: { uTime: timeU, uSeed: { value: seed }, uSize: { value: size }, uR: { value: r }, uQ: { value: 2.8 },
        uEdge: { value: col.clone().multiplyScalar(0.8) }, uHot: { value: col.clone().lerp(WHITE, 0.12) }, uCore: { value: col.clone().lerp(WHITE, 0.6) }, uGain: { value: 1 }, uFlare: { value: 1 } },
      vertexShader: `uniform float uSize,uQ; varying vec2 vP; void main(){ vP=position.xy*vec2(uQ,1.); vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.); mv.xy+=vP*uSize; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: NOISE + `uniform float uTime,uSeed,uR,uQ,uGain,uFlare; uniform vec3 uEdge,uHot,uCore; varying vec2 vP;
        void main(){ vec2 p=vP; float r=length(p), d=r/uR, t=uTime*.1+uSeed*7.;
          vec3 col=vec3(0.);
          if(d<1.){ vec3 n=vec3(p/uR,sqrt(max(0.,1.-d*d))); float ca=cos(t*.9),sa=sin(t*.9); vec3 q=vec3(ca*n.x+sa*n.z,n.y,-sa*n.x+ca*n.z);
            float gran=1.-abs(snoise(q*7.+vec3(0.,0.,t*3.))); float flow=fbm(q*2.2+vec3(t*.6,0.,uSeed));
            float limb=pow(n.z,.55); float heat=clamp(.35+.35*gran*gran+.45*flow,0.,1.2);
            vec3 s=mix(uEdge,uHot,clamp(heat*limb*1.1,0.,1.)); s=mix(s,uCore,smoothstep(.5,1.,heat*limb));
            col=s*(.7+1.25*limb)*smoothstep(1.,.965,d); }
          float ang=atan(p.y,p.x);
          float rays=snoise(vec3(cos(ang)*1.8,sin(ang)*1.8,t*1.3-d*.06))*.5+.5;
          float out1=max(d-1.,0.);
          float cor=exp(-out1*(3.4-rays*1.8));
          float halo=.5/(1.+out1*out1*7.+out1*5.);
          float e=smoothstep(1.,.55,abs(p.y))*smoothstep(uQ,uQ*.4,abs(p.x));
          vec3 corona=mix(uEdge,uHot,exp(-out1*2.))*(cor*.55+halo*.06)*step(1.,d+.035)*e;
          float streak=exp(-abs(p.y)*80.)*exp(-abs(p.x)*1.5)*.85*uFlare + exp(-abs(p.y)*20.)*exp(-abs(p.x)*3.5)*.1*uFlare;
          float shimmer=.94+.06*sin(uTime*6.3+uSeed*11.)+.04*snoise(vec3(uTime*.8,uSeed,0.));
          col+=corona*shimmer+uHot*streak*e;
          gl_FragColor=vec4(col*uGain,1.); }` });
  }
  const quad = new THREE.PlaneGeometry(2, 2);
  const suns = SUNCOL.map((c, i) => { const m = new THREE.Mesh(quad, sunMat(c, i * 1.7 + 0.3, 2.2, 0.25 - i * 0.015)); m.frustumCulled = false; m.renderOrder = 5; scene.add(m); return m; });
  const agent = new THREE.Mesh(quad, sunMat(C.ring.clone(), 9.1, 0.9, 0.12)); agent.material.uniforms.uQ.value = 3.4; agent.frustumCulled = false; agent.renderOrder = 6; scene.add(agent);
  const hub = new THREE.Mesh(quad, sunMat(C.ring.clone().lerp(WHITE, 0.3), 4.2, 0.45, 0.16)); hub.frustumCulled = false; hub.renderOrder = 6; scene.add(hub);

  // ── The flybys: each well is a tool world set in a wide circle round the business. The camera travels the whole
  // way round, and each world is wired back to the AI at the centre as it passes. ──
  const worlds = WPOS.map((p, i) => { const m = new THREE.Mesh(quad, sunMat((i % 2 ? C.sun2 : C.sun1).clone().lerp(i % 3 ? C.ring : WHITE, 0.3), 31 + i * 1.9, 1.9, 0.24)); m.material.uniforms.uFlare.value = 0.3; m.position.copy(p); m.frustumCulled = false; m.renderOrder = 6; scene.add(m); return m; });
  const warcs = WPOS.map(() => { const r = ribbon(60, C.ring.clone(), 0.03, ARC_FRAG, false); r.mesh.visible = false; return r; });
  let pingT = -99, pingSeen = 0, stn = -1, stnBusy = false;

  // ── Post ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.42, 0.9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finalPass = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uCA: { value: 0.008 }, uGrain: { value: 0.045 }, uShade: { value: 0 }, uShadeL: { value: 0 }, uShadeB: { value: 0 }, uPort: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime,uCA,uGrain,uShade,uShadeL,uShadeB,uPort; uniform vec2 uRes; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec2 c=vUv-.5; float d=dot(c,c); vec2 o=c*d*uCA*4.;
        vec3 col=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
        col*=1.-smoothstep(.12,.62,d*1.15)*.6;
        col*=1.-uShade*.62*mix(smoothstep(.8,.14,vUv.x)*smoothstep(.9,.3,vUv.y),smoothstep(.66,.22,vUv.y),uPort);
        col*=1.-uShadeL*mix(.66*smoothstep(.74,.26,vUv.x),.42,uPort); col*=1.-uShadeB*.36;
        col+=(h(floor(vUv*uRes)+fract(uTime*7.)*97.)-.5)*uGrain;
        gl_FragColor=vec4(col,1.); }` });
  composer.addPass(finalPass);

  // ── Layout ──
  // A tall window keeps the wide window's lens and distance, so the bodies stay as large and as close. What changes
  // is sideways: the roam is squeezed to the share of the width it has (fitX), the view is centred, and the camera
  // backs off only as far as the subject needs to fit across (fit). The narrowest windows get a wider lens (lensK), so they stay close too.
  let W = 1, H = 1, portrait = false, fitX = 1, lensK = 1, heroK = 0.9;
  const fit = (d: number, need: number, fovS: number) => portrait ? Math.max(d, need / (Math.tan(D2R(fovS / 2)) * camera.aspect)) : d;
  let fov0 = 34;
  function resize() {
    // A hidden stage has no size: keep the last one; the page that shows the space measures it again.
    if (!stage.clientWidth || !stage.clientHeight) return;
    W = stage.clientWidth; H = stage.clientHeight; portrait = W / H < 0.85;
    const tall = portrait ? Math.max(0, Math.min(1, (0.8 - W / H) / 0.34)) : 0; fitX = portrait ? Math.min(1, W / H / 1.6) : 1; lensK = 1 - 0.4 * tall; heroK = 0.9 - 0.3 * tall;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    composer.setPixelRatio(dpr); composer.setSize(W, H);
    bloom.resolution.set(W / 2, H / 2);
    finalPass.uniforms.uRes.value.set(W * dpr, H * dpr);
    dustU.uPx.value = dpr * (portrait ? 1.2 : 1.35); starPx.value = dpr;
    camera.aspect = W / H; fov0 = camera.fov = portrait ? 34 + 10 * tall : (W / H > 2 ? 30 : 34); camera.updateProjectionMatrix(); aspU.value = W / H;
    env.onResize?.();
  }

  // ── Pointer ──
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -1, py: -1, lastMove: -99 };
  let clockT = 0, lastY = scrollY, scrollVel = 0, lockT = -99, armed = true, locked = false;
  const onPointerMove = (e: PointerEvent) => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; mouse.px = e.clientX; mouse.py = e.clientY; mouse.lastMove = clockT; };
  const onPointerDown = (e: PointerEvent) => { mouse.px = e.clientX; mouse.py = e.clientY; mouse.lastMove = clockT; };
  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerdown', onPointerDown, { passive: true });
  const tmp2 = [0, 0], tgt = new THREE.Vector3(), proj = new THREE.Vector3();
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SUN_Y), hit = new THREE.Vector3(), ndc = new THREE.Vector2();

  // ── Story: the camera, the roam and the stations ──
  const ZOOM = 2;
  const shown = { el: story.hero.el, az: 0, dist: story.hero.dist, ox: 0.1, oy: 0.05, tx: 0, tz: 0 };
  const ROAM_RATE = [2.1, 1.2, 0.75];
  // Tool sections: the bodies keep to the open sky. The tallest band of the screen with no small text in it is
  // measured from the page itself; the roam is aimed at that band and sized to fit inside it.
  const open = { y0: 0, y1: 0, at: -9, k: 0, x: 0, z: 0, sp: 1, size: 1, q: 1, side: 9, deep: 9, stacked: 0 };
  function measureOpen() {
    const band = env.openBand?.(story.section());
    if (!band) return;
    open.stacked = band.stacked;
    const y0 = Math.max(0, band.y0), y1 = Math.min(H, band.y1);
    if (y1 - y0 > 48) { open.y0 = y0; open.y1 = y1; }
  }
  let secR = '', heroR = 1, warp = 0;

  function frame(dtReal: number) {
    const R = !env.motion(), sc = story.params(), a = 1 - Math.exp(-dtReal * (R ? 1.4 : 5));
    shownBlend = R ? smooth(0, 1, sc.order * 0.7 + sc.ink * 0.3) : 0;
    // Physics comes straight from the scroll: how hard we steer, how free the suns are.
    ctl.k = sc.k; ctl.soft = lerp(0.35, 0, sc.free); ctl.conf = 1 - sc.free;
    const dNow = offOrbit();
    // Once the orbit has formed, steering lets go; if anything knocks it off, it comes back and the readout says so.
    if (sc.order > 0.9 && dNow > 0.006) ctl.k = Math.max(ctl.k, Math.min(1, 0.35 + dNow * 8));
    const pn = story.pings() | 0;
    if (pn !== pingSeen) { pingSeen = pn; pingT = clockT; }
    // Where the bodies roam: a place set by the section, ahead of or beside where the camera looks. Each body
    // heads there at its own pace and wanders round it, so between sections they string out across the plane.
    { const azr = D2R(shown.az), rs = sc.rs * fitX; let bx = shown.tx - Math.sin(azr) * sc.rf + Math.cos(azr) * rs, bz = shown.tz - Math.cos(azr) * sc.rf - Math.sin(azr) * rs;
      // Beside a tool: aim the roam at the open band, as it sweeps from one side to the other with the scroll.
      const inFly = R ? (stn > 0 ? 1 : 0) : sc.fly; open.k = inFly > 0.5 && open.y1 > open.y0 ? smooth(0.5, 1, inFly) : 0;
      if (inFly > 0.5 && clockT - open.at > 0.3) { open.at = clockT; measureOpen(); }
      if (open.k > 0) { const half = (open.y1 - open.y0) / 2, sway = Math.max(-1, Math.min(1, sc.rs / 3)) * (W < 900 ? 0.08 : 0.2);
        ndc.set(sway * 2, 1 - (open.y0 + half) / H * 2); ray.setFromCamera(ndc, camera);
        if (!ray.ray.intersectPlane(plane, hit)) hit.copy(ray.ray.direction).setY(0).normalize().multiplyScalar(9).add(camera.position).setY(SUN_Y);
        const dx = hit.x - shown.tx, dz = hit.z - shown.tz, far = Math.hypot(dx, dz); if (far > 7) { hit.x = shown.tx + dx * 7 / far; hit.z = shown.tz + dz * 7 / far; }
        const dc = Math.max(1, camera.position.distanceTo(hit)), ppu = H / (2 * Math.tan(D2R(camera.fov / 2)) * dc), tilt = Math.max(0.2, (camera.position.y - SUN_Y) / dc);
        // A body nearer than the band is tall is drawn smaller, so it still sits inside the band.
        open.size = Math.max(0.3, Math.min(1, 0.55 * half / (0.44 * ppu)));
        // Room in world units: across the band (less the sway), and through it along the line of sight.
        const disc = 0.44 * ppu * open.size; open.side = Math.max(0.3, (W * (W < 900 ? 0.42 : 0.3) - disc) / ppu); open.deep = Math.max(0.04, (half - disc) / (tilt * ppu));
        open.sp = Math.max(0.12, Math.min(1.6, 0.65 * open.side / (1.6 * SC))); open.q = Math.max(0.08, Math.min(1, 0.75 * open.deep / (1.6 * SC * open.sp)));
        open.x += (hit.x - open.x) * (1 - Math.exp(-dtReal * 3)); open.z += (hit.z - open.z) * (1 - Math.exp(-dtReal * 3));
        bx += (open.x - bx) * open.k; bz += (open.z - bz) * open.k; }
      let r = 0;
      for (let i = 0; i < 3; i++) { const g = 1 - Math.exp(-dtReal * ROAM_RATE[i] * (R ? 0.5 : 1));
        let wx = bx + sc.rw * Math.sin(clockT * (0.23 + i * 0.05) + i * 2.1), wz = bz + sc.rw * Math.cos(clockT * (0.19 + i * 0.04) + i * 1.3);
        if (fitX < 1) { const side = ((wx - bx) * Math.cos(azr) - (wz - bz) * Math.sin(azr)) * (1 - fitX); wx -= side * Math.cos(azr); wz += side * Math.sin(azr); }
        // In the open band the wander runs along the band, not across it into the rows.
        if (open.k > 0) { const amp = sc.rw + 1e-6, deep = (-(wx - bx) * Math.sin(azr) - (wz - bz) * Math.cos(azr)) * open.k * (1 - Math.min(1, 0.25 * open.deep / amp)), side = ((wx - bx) * Math.cos(azr) - (wz - bz) * Math.sin(azr)) * open.k * (1 - Math.min(1, 0.35 * open.side / (amp * fitX)));
          wx += deep * Math.sin(azr) - side * Math.cos(azr); wz += deep * Math.cos(azr) + side * Math.sin(azr); }
        roam.o[i * 2] += (wx - roam.o[i * 2]) * g; roam.o[i * 2 + 1] += (wz - roam.o[i * 2 + 1]) * g; r = Math.max(r, Math.abs(roam.o[i * 2]), Math.abs(roam.o[i * 2 + 1])); }
      const spT = fitX < 1 ? 1 + (sc.sp - 1) * fitX : sc.sp; roam.sp += ((open.k > 0 ? lerp(spT, Math.min(spT, open.sp), open.k) : spT) - roam.sp) * (1 - Math.exp(-dtReal * 1.4)); roam.r = r + Math.abs(roam.sp - 1) + Math.abs(roam.q - 1);
      roam.ax = -Math.sin(azr); roam.az = -Math.cos(azr); roam.q += ((open.k > 0 ? lerp(1, open.q, open.k) : 1) - roam.q) * (1 - Math.exp(-dtReal * 1.4)); if (Math.abs(roam.q - 1) < 1e-3) roam.q = 1;
      roam.mx = (roam.o[0] + roam.o[2] + roam.o[4]) / 3; roam.mz = (roam.o[1] + roam.o[3] + roam.o[5]) / 3; }
    updateDisplay();
    // The moment it locks: the camera eases in, the light swells once, then both let go. Full motion only.
    const sinceLock = clockT - lockT, live = !R && sinceLock >= 0;
    const swell = live ? (sinceLock / 0.55) * Math.exp(1 - sinceLock / 0.55) : 0;
    const easeIn = live ? smooth(0, 1.5, sinceLock) * Math.exp(-Math.max(0, sinceLock - 1.5) * 0.3) : 0;
    // Scrolling between sections is a move through the world: the lens widens a touch and the camera banks into the turn.
    warp = R ? 0 : lerp(warp, Math.min(1, scrollVel / 3.5), 1 - Math.exp(-dtReal * 6));
    const heroAmt = R ? heroR : sc.hero;
    const fovS = fov0 + (R ? story.hero.lens * heroR : sc.lens) * lensK, fov = fovS + 5 * warp - 1.5 * easeIn;
    if (Math.abs(fov - camera.fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    finalPass.uniforms.uCA.value = 0.008 + 0.02 * warp + 0.012 * swell;
    finalPass.uniforms.uShade.value = heroAmt; finalPass.uniforms.uShadeL.value = sc.shl; finalPass.uniforms.uShadeB.value = R ? (stn > 0 ? 1 : 0) : sc.fly; finalPass.uniforms.uPort.value = portrait ? 1 : 0;
    gridU.uChaos.value = 1 - sc.free; gridU.uDepth.value = lerp(0.95, 0.6, sc.calm);

    // One continuous camera move, eased so a fast flick still glides.
    // Reduced motion: one fixed, calm viewpoint. No flying, zooming or spinning; the framing only drifts slowly sideways.
    const calmDist = fit(14, 3.1, fovS);
    const rv = story.views[secR], dist0 = R ? (stn > 0 ? Math.min(calmDist, fit(story.stations[stn - 1].dist * 1.05, 1.7, fovS)) : heroR ? fit(story.hero.dist, 3.1 * heroK, fovS) : rv ? fit(rv[1], 3.1, fovS) : calmDist) : fit(sc.dist, 3.1 * (1 - 0.45 * sc.fly) * lerp(1, heroK, sc.hero), fovS);
    shown.el = R ? (stn > 0 ? story.stations[stn - 1].el : heroR ? story.hero.el + 2 : rv ? rv[0] : 58) : lerp(shown.el, sc.el, a); shown.az = R ? (stn > 0 ? env.wells[stn - 1].az : 0) : lerp(shown.az, sc.az, a); shown.dist = R ? dist0 : lerp(shown.dist, dist0, a);
    // Reduced motion: no flight between worlds. The camera holds one station per scene and cuts to the next under a dip.
    if (R) { const want = sc.fly > 0.5 ? 1 + Math.max(0, Math.min(WN - 1, Math.round(sc.wsel))) : 0;
      const sec = story.section(), wantH = sc.hero > 0.5 ? 1 : 0, wantS = story.views[sec] ? sec : '';
      if ((want !== stn || wantH !== heroR || wantS !== secR) && !stnBusy) { stnBusy = true; canvas.classList.add('dip'); dipTimer = setTimeout(() => { dipTimer = 0; stn = want; heroR = wantH; secR = wantS; canvas.classList.remove('dip'); stnBusy = false; }, 210); }
      shown.tx = stn > 0 ? WPOS[stn - 1].x : 0; shown.tz = stn > 0 ? WPOS[stn - 1].z : 0;
    } else { stn = -1; shown.tx = lerp(shown.tx, sc.tx, a); shown.tz = lerp(shown.tz, sc.tz, a); }
    shown.ox = lerp(shown.ox, portrait ? 0 : sc.ox, a); shown.oy = lerp(shown.oy, portrait ? sc.poy : sc.oy, a);
    if (!R) { mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04; } else { mouse.x = mouse.y = 0; }
    const el = D2R(shown.el + mouse.y * 3 * (1 - sc.calm * 0.5));
    const az = D2R(shown.az) + (R ? 0 : Math.sin(clockT * 0.045) * 0.1 * (1 - sc.calm)) + mouse.x * 0.05;
    tgt.set(shown.tx, lerp(-0.6, SUN_Y, smooth(22, 62, shown.el)), shown.tz);
    // Pulled back through the whole space: every station sits twice as far out, so the system reads at a glance with room round it.
    const cd = shown.dist * ZOOM * (1 - (portrait ? 0.04 : 0.07) * easeIn);
    camera.position.set(tgt.x + cd * Math.cos(el) * Math.sin(az), tgt.y + cd * Math.sin(el), tgt.z + cd * Math.cos(el) * Math.cos(az));
    camera.lookAt(tgt);
    if (!R) camera.rotateZ(Math.max(-0.09, Math.min(0.09, (sc.az - shown.az) * 0.004)));
    camera.setViewOffset(W, H, -W * shown.ox, H * shown.oy, W, H);
    camera.updateMatrixWorld(); deepSky.position.copy(camera.position);

    // The fourth mass: wherever the pointer meets the plane. It fades in on move and out when idle.
    const idle = clockT - mouse.lastMove, want = env.motion() && mouse.px >= 0 && idle < 2.5 ? 1 : 0;
    cur.m = lerp(cur.m, want, 1 - Math.exp(-dtReal * (want ? 3 : 1.2)));
    if (mouse.px >= 0) { ndc.set(mouse.px / W * 2 - 1, -(mouse.py / H * 2 - 1)); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { cur.x = (hit.x - roam.mx) / (SC * roam.sp); cur.y = (hit.z - roam.mz) / (SC * roam.sp); } }
    gridU.uC.value.set(cur.x * SC * roam.sp + roam.mx, cur.y * SC * roam.sp + roam.mz, cur.m);

    // Trails: the real history. Long and tangled in chaos; a third of the loop each once settled,
    // so together they draw the eight once instead of stacking three bright copies.
    const L = lerp(1, 1 / 3, sc.third) * (HN - 1), tw = lerp(0.85, 0.5, sc.calm);
    for (let b = 0; b < 3; b++) {
      const pts = trails[b].pts;
      for (let k = 0; k < HN; k++) {
        const back = (1 - k / (HN - 1)) * L, f = (HN - 1) - back, j0 = Math.floor(f), j1 = Math.min(HN - 1, j0 + 1), fr = f - j0;
        const i0 = ((hist.head + 1 + j0) % HN) * 6 + b * 2, i1 = ((hist.head + 1 + j1) % HN) * 6 + b * 2;
        pts[k * 3] = hist.w[i0] + (hist.w[i1] - hist.w[i0]) * fr; pts[k * 3 + 1] = SUN_Y; pts[k * 3 + 2] = hist.w[i0 + 1] + (hist.w[i1 + 1] - hist.w[i0 + 1]) * fr;
      }
      const v = bodyU.value[b]; pts[HN * 3] = v.x; pts[HN * 3 + 1] = v.y; pts[HN * 3 + 2] = v.z;
      layRibbon(trails[b], tw);
      trails[b].mesh.material.uniforms.uAlpha.value = lerp(0.9, 0.85, sc.calm) * (R ? 1 - shownBlend * 0.8 : 1) * (1 - 0.5 * sc.fly);
      suns[b].position.copy(v);
      // Warm and dramatic, but never so bright it swallows the body, its trail or a label.
      const u = suns[b].material.uniforms;
      u.uSize.value = lerp(1.75, portrait ? 1.35 : 1.25, sc.calm) * lerp(1, open.size, open.k); u.uGain.value = (lerp(0.72, 0.62, sc.calm) + 0.3 * swell) * (1 - 0.45 * sc.fly); u.uFlare.value = lerp(0.45, 0.18, sc.calm);
      // Lens strength for this sun, in screen units, shrinking with distance.
      proj.copy(v).project(camera); lensU.value[b].set(proj.x, proj.y, proj.z < 1 ? 0.05 * 11 / (shown.dist * ZOOM) : 0);
    }
    bloom.strength = lerp(0.36, 0.24, sc.calm) + 0.5 * swell;
    gridU.uLock.value = R ? 99 : Math.min(sinceLock, clockT - pingT);

    // The orbit, inked in by the scroll from a fixed start, so the stops are reached in order.
    guide.mesh.visible = sc.ink > 0.002;
    if (guide.mesh.visible) {
      for (let k = 0; k < GUIDE_N; k++) { curve(INK0 + k / (GUIDE_N - 1) * sc.ink * INK_SPAN, tmp2); guide.pts[k * 3] = tmp2[0] * SC; guide.pts[k * 3 + 1] = SUN_Y - 0.01; guide.pts[k * 3 + 2] = tmp2[1] * SC; }
      layRibbon(guide); guide.mesh.material.uniforms.uAlpha.value = Math.min(1, sc.ink * 3) * (1 + 1.2 * Math.exp(-sinceLock * 1.2));
    }

    // Dust: gravity (the pointer included), then pulled into a fine filament on the loop.
    { const h = Math.min(dtReal, 1 / 30) * 0.55 / 2 * (R ? 0.35 : 1); stepDust(h); stepDust(h); }
    dustU.uOrder.value = sc.order;
    const phase = eight.t / T8;
    for (let i = 0; i < DN; i++) {
      toWorld(D.x[i], D.y[i], (i % 3) * 2); let x = wv[0], z = wv[1], y = gridY(x, z) * 0.7 + SUN_Y * 0.3 + D.j[i] * 0.06;
      if (sc.order > 0) {
        curve(D.ph[i] + phase, tmp2); const ax = tmp2[0], ay = tmp2[1];
        curve(D.ph[i] + phase + 0.002, tmp2); let nx = -(tmp2[1] - ay), ny = tmp2[0] - ax; const nl = Math.hypot(nx, ny) || 1;
        const off = D.off[i] * 0.7, tx = (ax + nx / nl * off) * SC, tz = (ay + ny / nl * off) * SC, ty = SUN_Y + D.j[i] * 0.02;
        const o = sc.order * sc.order * (3 - 2 * sc.order);
        x += (tx - x) * o; y += (ty - y) * o; z += (tz - z) * o;
      }
      dPos[i * 3] = x; dPos[i * 3 + 1] = y; dPos[i * 3 + 2] = z;
    }
    dustGeo.attributes.position.needsUpdate = true;

    // Wires and the AI hub: the connections that do the steering.
    const B = bodyU.value, pairs = [[B[0], B[1]], [B[1], B[2]], [B[2], B[0]], [B[0], HUB], [B[1], HUB], [B[2], HUB]];
    // Tool-to-tool wires show only while we connect; the wires to the AI at the centre stay once it holds the orbit.
    const aiA = Math.max(sc.conn, sc.free * 0.5);
    pairs.forEach(([p0, p1], i) => { const al = i < 3 ? sc.conn : aiA; arcs[i].mesh.visible = al > 0.002; if (al > 0.002) { layArc(arcs[i], p0, p1, i < 3 ? 0.25 + p0.distanceTo(p1) * 0.18 : 0.35); arcs[i].mesh.material.uniforms.uAlpha.value = al * 0.8; } });
    hub.position.copy(HUB); hub.material.uniforms.uGain.value = Math.max(sc.conn, sc.free * 0.75) * 0.9 + 1.1 * swell;

    // The agent dot rides the loop once it holds.
    const ap = phase * 2 + 0.17;
    curve(ap, tmp2); agent.position.set(tmp2[0] * SC, SUN_Y, tmp2[1] * SC); agent.material.uniforms.uGain.value = sc.agent * 1.2; agent.material.uniforms.uSize.value = 0.62;
    for (let k = 0; k < agentTrail.n; k++) { curve(ap - (agentTrail.n - 1 - k) * 0.0018, tmp2); agentTrail.pts[k * 3] = tmp2[0] * SC; agentTrail.pts[k * 3 + 1] = SUN_Y; agentTrail.pts[k * 3 + 2] = tmp2[1] * SC; }
    layRibbon(agentTrail, 0.7); agentTrail.mesh.material.uniforms.uAlpha.value = sc.agent;

    // The tool worlds. The one you are passing is lit and wired to the AI at the centre.
    const fl = R ? (stn > 0 ? 1 : 0) : sc.fly, wsel = R ? stn - 1 : sc.wsel;
    worlds.forEach((m, i) => { const on = fl > 0.01, near = fl * Math.max(0, 1 - Math.abs(wsel - i)); warcs[i].mesh.visible = on;
      toolU.value[i].z = TOOL_M[i] * (0.8 + 0.7 * near);
      // Stacked lanes leave the tool no clear sky of its own, so there it glows softer behind the rows.
      m.material.uniforms.uGain.value = (0.2 + 0.1 * fl + 0.28 * near) * (1 - 0.5 * open.stacked * near); m.material.uniforms.uSize.value = (1.5 + 0.5 * near) * (0.8 + 0.2 * TOOL_M[i]); if (!on) return;
      layArc(warcs[i], HUB, m.position, 2.2); warcs[i].mesh.material.uniforms.uAlpha.value = fl * (0.1 + 0.85 * near); });

    timeU.value = clockT; finalPass.uniforms.uTime.value = clockT;
    composer.render();

    // The page's own DOM: its labels and markers, placed from this frame. Read-only for the engine.
    env.onFrame?.({
      dt: dtReal, width: W, height: H, portrait, params: sc, hero: heroAmt, fly: fl, wsel, locked,
      project, well, sun, hub: hubPoint, orbit, sunRadiusPx, offOrbit: offOrbitAt,
    });

    // The payoff: the first moment it holds with no steering, the grid rings out and the labels settle.
    const d = offOrbit(), holding = ctl.k < 0.01 && d < 0.02 && sc.order > 0.9 && roam.r < 0.06;
    if (holding && armed) { armed = false; lockT = clockT; if (!R) env.onPayoff?.(); }
    if (d > 0.3 || sc.order < 0.5) armed = true;
    if (holding !== locked) { locked = holding; env.onLock?.(holding); }
  }

  // What the page reads from a frame. Each one reflects the scene as it was drawn.
  const project = (x: number, y: number, z: number): Vec3 => { const p = proj.set(x, y, z).project(camera); return { x: p.x, y: p.y, z: p.z }; };
  const well = (i: number): Vec3 => ({ x: WPOS[i].x, y: WPOS[i].y, z: WPOS[i].z });
  const sun = (i: number): Vec3 => ({ x: bodyU.value[i].x, y: bodyU.value[i].y, z: bodyU.value[i].z });
  const hubPoint = (): Vec3 => ({ x: HUB.x, y: HUB.y, z: HUB.z });
  const orbit = (u: number): Vec3 => { curve(u, tmp2); return { x: tmp2[0] * SC, y: SUN_Y, z: tmp2[1] * SC }; };
  const sunRadiusPx = (i: number): number => {
    const pxU = H / (2 * Math.tan(D2R(camera.fov / 2)));
    const u = suns[i].material.uniforms;
    return u.uR.value * u.uSize.value * pxU / Math.max(1, camera.position.distanceTo(bodyU.value[i]));
  };
  const offOrbitAt = (i: number): number => Math.hypot(disp[i * 2] - eight.p[i * 2], disp[i * 2 + 1] - eight.p[i * 2 + 1]);

  // ── Loop: runs whenever the tab is shown and motion is allowed. The space never switches off. ──
  let running = false, last = 0, raf = 0, slow = 0, fast = 0, dipTimer: ReturnType<typeof setTimeout> | 0 = 0, disposed = false, active = true;
  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000 || 0.016, 0.1); last = now;
    const R = !env.motion();
    clockT += dt * (R ? 0.4 : 1);
    scrollVel = lerp(scrollVel, Math.abs(scrollY - lastY) / innerHeight / Math.max(dt, 1e-3), 1 - Math.exp(-dt * 8)); lastY = scrollY;
    // Reduced motion: the suns keep a slow, steady drift, never sped up by scrolling.
    advance(Math.min(dt, 1 / 20) * (R ? 0.2 : 0.55 + Math.min(1.4, scrollVel * 1.2)));
    frame(dt);
    // Adaptive quality: drop resolution if frames run long, restore if they recover.
    if (dt > 0.024) { slow++; fast = 0; } else { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.35); resize(); slow = 0; }
    if (fast > 600 && dpr < dprMax) { dpr = Math.min(dprMax, dpr + 0.25); resize(); fast = 0; }
  }
  // The loop runs in both modes; reduced motion is handled inside frame() and tick(), so nothing ever snaps.
  function sync() {
    if (disposed) return;
    const want = !document.hidden && active;
    if (want && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); }
  }
  document.addEventListener('visibilitychange', sync);
  addEventListener('solenix:motion', sync);
  addEventListener('resize', resize);
  resize();
  frame(0.016);
  requestAnimationFrame(() => { if (!disposed) env.onReady?.(); }); // only once a real frame is on screen

  // Leaving (reload, link, close): some browsers drop a WebGL canvas's image while the page unloads and composite it
  // as white for a frame. Hiding the canvas then shows the poster beneath it (the world's own still) instead.
  const onPageHide = () => { canvas.style.visibility = 'hidden'; };
  const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) canvas.style.visibility = ''; };
  addEventListener('beforeunload', onPageHide);
  addEventListener('pagehide', onPageHide);
  addEventListener('pageshow', onPageShow);
  sync();

  return {
    setActive(on: boolean) {
      if (disposed) return;
      active = on;
      if (on) resize();
      sync();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      if (dipTimer) clearTimeout(dipTimer);
      removeEventListener('pointermove', onPointerMove);
      removeEventListener('pointerdown', onPointerDown);
      removeEventListener('solenix:motion', sync);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', sync);
      removeEventListener('beforeunload', onPageHide);
      removeEventListener('pagehide', onPageHide);
      removeEventListener('pageshow', onPageShow);
      canvas.style.visibility = '';
      canvas.classList.remove('dip');
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose()); else if (mat) mat.dispose();
      });
      skyRT.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
