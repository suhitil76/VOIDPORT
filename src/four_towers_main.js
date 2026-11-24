/**
 * VOIDPORT — Four Towers, Four Puzzles, One Central Core
 * Main Entry & Simulation Coordinator
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CharacterPhysics } from './core/CharacterPhysics.js';
import { FourTowersCity } from './world/FourTowersCity.js';
import { PuzzleSystem } from './puzzles/PuzzleSystem.js';
import { soundSystem } from './audio/FuturisticSoundSystem.js';
import { narrator } from './audio/CityNarrator.js';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — VOIDPORT PURPLE NEON NIGHT CITY
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  fog: {
    color: 0x08030f,  // Deep indigo-black (matches reference images)
    near: 60,
    far: 420
  },
  ambient: {
    skyColor: 0x3d1a5c,  // Purple sky tint
    groundColor: 0x0a0415, // Near-black purple ground
    intensity: 2.2
  },
  moon: {
    color: 0xd0c0ff,   // Cool lavender moonlight
    intensity: 2.8,
    position: new THREE.Vector3(90, 140, -60)
  },
  bounceFill: {
    color: 0x8020c0,   // Purple bounce fill from city glow
    intensity: 1.4,
    position: new THREE.Vector3(-90, 60, 80)
  },
  purpleFill: {
    color: 0x5010a0,
    intensity: 1.0,
    position: new THREE.Vector3(0, 40, 90)
  },
  bloom: {
    strength: 0.72,   // Stronger bloom for neon glow effect
    radius: 0.65,
    threshold: 0.55   // Lower threshold so more surfaces bloom
  },
  cameraBounds: {
    minDistance: 5.0,
    maxDistance: 190.0,
    minY: 1.2
  }
};

const CAMERA_PRESETS = {
  overview: { pos: [0, 80, 150], target: [0, 10, 0], mode: 'orbit' },
  core:     { pos: [0, 12, 38], target: [0, 4, 0], mode: 'orbit' },
  signal:   { pos: [0, 42, -25], target: [0, 60, -118], mode: 'orbit' },
  reactor:  { pos: [25, 42, 0], target: [118, 55, 0], mode: 'orbit' },
  archive:  { pos: [0, 42, 25], target: [0, 55, 118], mode: 'orbit' },
  nexus:    { pos: [-25, 42, 0], target: [-118, 55, 0], mode: 'orbit' },
  walk:     { pos: [0, 1.66, 18], target: [0, 3.5, -30], mode: 'fps' }
};

// ═══════════════════════════════════════════════════════════════
// STATE & SCENE GLOBALS
// ═══════════════════════════════════════════════════════════════

let scene, camera, renderer, composer, orbitControls;
let physics, city, puzzleSystem;
let controlMode = 'orbit'; // 'orbit' or 'fps'
let clock;

// Input Keys
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  jump: false
};

let mousePitch = 0.05;
let mouseYaw = Math.PI;
let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

let nearbyTerminal = null;
let isOpeningNarrativeActive = false;
let isFinaleActive = false;
let visitedTowers = {
  signal: false,
  reactor: false,
  archive: false,
  nexus: false
};

// Serial task progression order: 01 Signal -> 02 Reactor -> 03 Archive -> 04 Nexus
const SERIAL_TASKS = [
  { id: 'signal', name: '01 SIGNAL TOWER', pos: CAMERA_PRESETS.signal.pos, target: CAMERA_PRESETS.signal.target },
  { id: 'reactor', name: '02 THE REACTOR', pos: CAMERA_PRESETS.reactor.pos, target: CAMERA_PRESETS.reactor.target },
  { id: 'archive', name: '03 THE ARCHIVE', pos: CAMERA_PRESETS.archive.pos, target: CAMERA_PRESETS.archive.target },
  { id: 'nexus', name: '04 THE NEXUS', pos: CAMERA_PRESETS.nexus.pos, target: CAMERA_PRESETS.nexus.target }
];
let currentTaskIndex = 0;

// ═══════════════════════════════════════════════════════════════
// RENDERER & SCENE SETUP
// ═══════════════════════════════════════════════════════════════

function initRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;  // Slightly reduced to keep purple richness
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.fog.color);
  scene.fog = new THREE.Fog(CONFIG.fog.color, CONFIG.fog.near, CONFIG.fog.far);

  camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 750);
  camera.position.set(...CAMERA_PRESETS.overview.pos);
  camera.lookAt(...CAMERA_PRESETS.overview.target);

  // Orbit controls with strict zoom bounds and ground protection
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.target.set(...CAMERA_PRESETS.overview.target);
  orbitControls.minDistance = CONFIG.cameraBounds.minDistance;
  orbitControls.maxDistance = CONFIG.cameraBounds.maxDistance;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.04;

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
  );
  composer.addPass(bloomPass);

  clock = new THREE.Clock();
  physics = new CharacterPhysics();
  physics.position.set(0, 1.66, 18);

  window.addEventListener('resize', onResize);
  setupInputHandlers();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING — CINEMATIC SLATE-BLUE & SHADOW FILL
// ═══════════════════════════════════════════════════════════════

function createLighting() {
  const hemi = new THREE.HemisphereLight(
    CONFIG.ambient.skyColor,
    CONFIG.ambient.groundColor,
    CONFIG.ambient.intensity
  );
  scene.add(hemi);

  const moon = new THREE.DirectionalLight(CONFIG.moon.color, CONFIG.moon.intensity);
  moon.position.copy(CONFIG.moon.position);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  moon.shadow.camera.near = 10;
  moon.shadow.camera.far = 400;
  moon.shadow.camera.left = -140;
  moon.shadow.camera.right = 140;
  moon.shadow.camera.top = 140;
  moon.shadow.camera.bottom = -140;
  moon.shadow.bias = -0.0006;
  scene.add(moon);
  scene.add(moon.target);

  // Purple bounce fill — simulates neon city glow from below
  const bounce = new THREE.DirectionalLight(CONFIG.bounceFill.color, CONFIG.bounceFill.intensity);
  bounce.position.copy(CONFIG.bounceFill.position);
  scene.add(bounce);

  // Magenta/pink neon street-level fill (from behind camera — simulates neon signs)
  const purpleFill = new THREE.DirectionalLight(CONFIG.purpleFill.color, CONFIG.purpleFill.intensity);
  purpleFill.position.copy(CONFIG.purpleFill.position);
  scene.add(purpleFill);

  // Warm distant city glow — rises from horizon
  const cityGlow = new THREE.PointLight(0x9020d0, 3.5, 320, 1.4);
  cityGlow.position.set(0, 15, 0);
  scene.add(cityGlow);
}

function createSkyDome() {
  // Deep indigo-to-black gradient sky
  const skyGeo = new THREE.SphereGeometry(320, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor:    { value: new THREE.Color(0x02000a) },   // Near-black at zenith
      midColor:    { value: new THREE.Color(0x180530) },   // Deep purple band
      bottomColor: { value: new THREE.Color(0x2a0545) },   // Warm purple horizon glow
      offset:      { value: 14 },
      exponent:    { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        h = clamp(h, 0.0, 1.0);
        vec3 col = mix(bottomColor, midColor, pow(h, 0.3));
        col = mix(col, topColor, pow(h, exponent));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // ── STARFIELD ──────────────────────────────────────────────
  const starCount = 2800;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Random position on upper hemisphere sphere (radius 310m)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random()); // 0..PI/2 (upper hemisphere only)
    const r = 300 + Math.random() * 10;
    starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi);
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // Stars: mostly white/blue-white with some purple/lavender tints
    const colorRoll = Math.random();
    if (colorRoll < 0.6) {
      // White/blue-white
      starColors[i * 3]     = 0.85 + Math.random() * 0.15;
      starColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      starColors[i * 3 + 2] = 1.0;
    } else if (colorRoll < 0.8) {
      // Lavender/purple tinted
      starColors[i * 3]     = 0.7 + Math.random() * 0.2;
      starColors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
      starColors[i * 3 + 2] = 1.0;
    } else {
      // Warm/gold stars
      starColors[i * 3]     = 1.0;
      starColors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      starColors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
    }
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── PURPLE HORIZON ATMOSPHERE GLOW (billboard ring) ───────
  const hazGeo = new THREE.RingGeometry(260, 320, 64);
  const hazMat = new THREE.ShaderMaterial({
    uniforms: {
      innerColor: { value: new THREE.Color(0x5c0a99) },
      outerColor: { value: new THREE.Color(0x08030f) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      uniform vec3 innerColor;
      uniform vec3 outerColor;
      varying vec2 vUv;
      void main() {
        float t = vUv.x;
        vec3 c = mix(innerColor, outerColor, smoothstep(0.0, 1.0, t));
        float alpha = (1.0 - t) * 0.35;
        gl_FragColor = vec4(c, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const haz = new THREE.Mesh(hazGeo, hazMat);
  haz.rotation.x = -Math.PI / 2;
  haz.position.y = -6;
  scene.add(haz);
}

// ═══════════════════════════════════════════════════════════════
// INPUT & INTERACTION
// ═══════════════════════════════════════════════════════════════

function setupInputHandlers() {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.sprint = true;
    if (e.code === 'Space') keys.jump = true;

    // Interaction key [E]
    if (e.code === 'KeyE') {
      if (nearbyTerminal) {
        puzzleSystem.open(nearbyTerminal);
      }
    }

    // Auto-enter Walk Mode on WASD
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) && controlMode !== 'fps') {
      setControlMode('fps');
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.sprint = false;
    if (e.code === 'Space') keys.jump = false;
  });

  const canvas = renderer.domElement;
  canvas.addEventListener('mousedown', (e) => {
    if (controlMode === 'fps') {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });

  window.addEventListener('mouseup', () => { isMouseDown = false; });

  window.addEventListener('mousemove', (e) => {
    if (controlMode === 'fps' && isMouseDown) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      mouseYaw -= deltaX * 0.003;
      mousePitch -= deltaY * 0.003;
      mousePitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, mousePitch));
    }
  });

  // Click on interactive prompt
  document.getElementById('interact-prompt').addEventListener('click', () => {
    if (nearbyTerminal) {
      puzzleSystem.open(nearbyTerminal);
    }
  });
}

function setControlMode(mode, targetPos) {
  controlMode = mode;
  const badge = document.getElementById('mode-indicator');

  if (mode === 'fps') {
    orbitControls.enabled = false;
    if (targetPos) {
      physics.position.set(targetPos[0], targetPos[1], targetPos[2]);
    }
    badge.textContent = 'WALK MODE (WASD)';
    badge.style.borderColor = '#00e5ff';
    badge.style.color = '#00e5ff';
  } else {
    orbitControls.enabled = true;
    badge.textContent = 'ORBIT OVERVIEW';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    badge.style.color = '#94a3b8';
  }
}

// ═══════════════════════════════════════════════════════════════
// CAMERA PRESETS & HUD BUTTONS
// ═══════════════════════════════════════════════════════════════

function setupHUDControls() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      const cfg = CAMERA_PRESETS[key];
      if (!cfg) return;

      soundSystem.playClick();
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...cfg.pos);
      const startTarget = orbitControls.target.clone();
      const endTarget = new THREE.Vector3(...cfg.target);

      const duration = 1200;
      const startTime = performance.now();

      function animateCam(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        camera.position.lerpVectors(startPos, endPos, ease);
        orbitControls.target.lerpVectors(startTarget, endTarget, ease);
        orbitControls.update();

        if (t < 1) {
          requestAnimationFrame(animateCam);
        } else {
          setControlMode(cfg.mode, cfg.mode === 'fps' ? cfg.pos : null);
        }
      }

      requestAnimationFrame(animateCam);
    });
  });

  // Voice Narration mute button
  const voiceBtn = document.getElementById('voice-toggle-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const isMuted = narrator.toggleMute();
      voiceBtn.textContent = isMuted ? '🎙️ MUTED' : '🎙️ VOICE';
      voiceBtn.style.color = isMuted ? '#f87171' : '#00f5d4';
    });
  }

  // Audio mute button
  const muteBtn = document.getElementById('audio-toggle-btn');
  muteBtn.addEventListener('click', () => {
    const isMuted = soundSystem.toggleMute();
    muteBtn.textContent = isMuted ? '🔇 MUTED' : '🔊 MUSIC';
    muteBtn.style.color = isMuted ? '#f87171' : '#d946ef';
  });

  // Enter City Button on splash screen — initiates cinematic narrative
  document.getElementById('enter-btn').addEventListener('click', () => {
    soundSystem.init();
    soundSystem.playClick();
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    setTimeout(() => { 
      splash.style.display = 'none';
      startNarrativeOpening();
    }, 800);
  });

  // Skip Intro Button
  const skipBtn = document.getElementById('skip-intro-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      skipNarrativeOpening();
    });
  }

  // Escape key skips opening narrative if active
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && isOpeningNarrativeActive) {
      skipNarrativeOpening();
    }
  });

  // Mission Briefing button
  const startExploreBtn = document.getElementById('start-explore-btn');
  if (startExploreBtn) {
    startExploreBtn.addEventListener('click', () => {
      soundSystem.playClick();
      const modal = document.getElementById('mission-briefing');
      modal.style.display = 'none';

      // 1. Move camera smoothly to the Central Energy Core first
      glideToCenter(() => {
        // 2. Prompt user: "Should we begin with the tasks?"
        promptTaskConfirmation('READY TO BEGIN?', 'Should we begin with the tasks?');
      });
    });
  }

  // Task Warp Button on HUD
  const taskWarpBtn = document.getElementById('task-warp-btn');
  if (taskWarpBtn) {
    taskWarpBtn.addEventListener('click', () => {
      soundSystem.playClick();
      if (currentTaskIndex < SERIAL_TASKS.length) {
        const task = SERIAL_TASKS[currentTaskIndex];
        promptTaskConfirmation(`BEGIN ${task.name}?`, `Proceed along the road to ${task.name}?`);
      }
    });
  }

  // Task Confirmation Modal buttons
  const confirmYes = document.getElementById('task-confirm-yes');
  if (confirmYes) {
    confirmYes.addEventListener('click', () => {
      soundSystem.playClick();
      const modal = document.getElementById('task-confirm-modal');
      modal.style.display = 'none';
      walkFromCenterToTask(currentTaskIndex);
    });
  }

  const confirmNo = document.getElementById('task-confirm-no');
  if (confirmNo) {
    confirmNo.addEventListener('click', () => {
      soundSystem.playClick();
      const modal = document.getElementById('task-confirm-modal');
      modal.style.display = 'none';
      setControlMode('orbit');
      updateSerialTaskHUD();
    });
  }
}

function promptTaskConfirmation(title, desc) {
  const modal = document.getElementById('task-confirm-modal');
  const titleEl = document.getElementById('task-confirm-title');
  const descEl = document.getElementById('task-confirm-desc');
  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;
  modal.style.display = 'flex';
}

function updateSerialTaskHUD() {
  const directiveBar = document.getElementById('task-directive-bar');
  const directiveText = document.getElementById('task-directive-text');
  if (!directiveBar || !directiveText) return;

  if (currentTaskIndex < SERIAL_TASKS.length) {
    const activeTask = SERIAL_TASKS[currentTaskIndex];
    directiveText.textContent = `ACTIVE OBJECTIVE: ${activeTask.name}`;
    directiveBar.style.display = 'flex';
  } else {
    directiveBar.style.display = 'none';
  }
}

/**
 * Glide smoothly to the central intersection / central energy core
 */
function glideToCenter(onComplete) {
  setControlMode('orbit');
  orbitControls.enabled = false;

  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(0, 10, 24);
  const startTarget = orbitControls.target.clone();
  const endTarget = new THREE.Vector3(0, 3.5, 0);

  const duration = 2200;
  const startTime = performance.now();

  function animateCenter(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    camera.position.lerpVectors(startPos, endPos, ease);
    orbitControls.target.lerpVectors(startTarget, endTarget, ease);
    orbitControls.update();

    if (t < 1) {
      requestAnimationFrame(animateCenter);
    } else {
      orbitControls.enabled = true;
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(animateCenter);
}

/**
 * Perform realistic ground-level walking motion from central intersection
 * along the connecting road directly towards the target building terminal
 */
function walkFromCenterToTask(taskIdx) {
  if (taskIdx >= SERIAL_TASKS.length) return;
  const task = SERIAL_TASKS[taskIdx];

  setControlMode('orbit');
  orbitControls.enabled = false;

  // Road start at edge of central plaza
  const centerPlazaPos = {
    signal:  new THREE.Vector3(0, 1.66, -18),
    reactor: new THREE.Vector3(18, 1.66, 0),
    archive: new THREE.Vector3(0, 1.66, 18),
    nexus:   new THREE.Vector3(-18, 1.66, 0)
  }[task.id] || new THREE.Vector3(0, 1.66, 18);

  const terminalPodPos = {
    signal:  new THREE.Vector3(0, 1.66, -88),
    reactor: new THREE.Vector3(88, 1.66, 0),
    archive: new THREE.Vector3(0, 1.66, 88),
    nexus:   new THREE.Vector3(-88, 1.66, 0)
  }[task.id];

  const lookAheadTarget = {
    signal:  new THREE.Vector3(0, 18, -125),
    reactor: new THREE.Vector3(125, 18, 0),
    archive: new THREE.Vector3(0, 18, 125),
    nexus:   new THREE.Vector3(-125, 18, 0)
  }[task.id];

  camera.position.copy(centerPlazaPos);
  orbitControls.target.copy(lookAheadTarget);
  orbitControls.update();

  const duration = 3800; // 3.8s brisk, realistic walking advance along the road
  const startTime = performance.now();

  function animateWalk(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Ground position interpolation along the road surface (y remains ground height ~1.66m)
    camera.position.lerpVectors(centerPlazaPos, terminalPodPos, ease);

    // Subtle natural head-bob rhythm while walking
    const headBob = Math.sin(elapsed * 0.014) * 0.045;
    camera.position.y = 1.66 + headBob;

    orbitControls.target.copy(lookAheadTarget);
    orbitControls.update();

    if (t < 1) {
      requestAnimationFrame(animateWalk);
    } else {
      orbitControls.enabled = true;
      updateSerialTaskHUD();
      // Automatically open the puzzle calibration terminal upon arrival
      setTimeout(() => {
        puzzleSystem.open(task.id);
      }, 400);
    }
  }

  requestAnimationFrame(animateWalk);
}

/**
 * Return from a completed tower back to the central intersection along the road
 */
function walkBackToCenter(onArrivedAtCenter) {
  setControlMode('orbit');
  orbitControls.enabled = false;

  const startPos = camera.position.clone();
  startPos.y = 1.66; // Ground height
  const endPos = new THREE.Vector3(0, 1.66, 18);
  const centerTarget = new THREE.Vector3(0, 3.5, 0);

  const duration = 3200;
  const startTime = performance.now();

  function animateReturn(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    camera.position.lerpVectors(startPos, endPos, ease);
    const headBob = Math.sin(elapsed * 0.014) * 0.04;
    camera.position.y = 1.66 + headBob;

    orbitControls.target.copy(centerTarget);
    orbitControls.update();

    if (t < 1) {
      requestAnimationFrame(animateReturn);
    } else {
      orbitControls.enabled = true;
      if (onArrivedAtCenter) onArrivedAtCenter();
    }
  }

  requestAnimationFrame(animateReturn);
}

// ═══════════════════════════════════════════════════════════════
// NARRATIVE OPENING SEQUENCE & MISSION BRIEFING
// ═══════════════════════════════════════════════════════════════

async function startNarrativeOpening() {
  isOpeningNarrativeActive = true;
  const skipBtn = document.getElementById('skip-intro-btn');
  if (skipBtn) skipBtn.style.display = 'block';

  // Slow, cinematic diagonal swoop: starts far out along the open SE corridor (between East Reactor and South Archive)
  // Glides gracefully in between the two towers directly towards the Central Energy Core without crossing any structures
  const startPos = new THREE.Vector3(145, 95, 145);
  const endPos = new THREE.Vector3(...CAMERA_PRESETS.overview.pos);
  const startTarget = new THREE.Vector3(0, 8, 0);
  const endTarget = new THREE.Vector3(...CAMERA_PRESETS.overview.target);

  camera.position.copy(startPos);
  orbitControls.target.copy(startTarget);
  orbitControls.update();

  const animDuration = 22000; // 22 seconds majestic opening glide
  const animStart = performance.now();

  function glideCamera(now) {
    if (!isOpeningNarrativeActive) return;
    const t = Math.min((now - animStart) / animDuration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(startPos, endPos, ease);
    orbitControls.target.lerpVectors(startTarget, endTarget, ease);
    orbitControls.update();
    if (t < 1) requestAnimationFrame(glideCamera);
  }
  requestAnimationFrame(glideCamera);

  const openingScript = [
    "Welcome to VOIDPORT.",
    "You are entering a city that was once powered by four independent systems.",
    "Something happened. The systems went offline... and the city fell silent.",
    "Its energy core is waiting to be restored.",
    "Four towers. Four challenges. One mission.",
    "Explore the city. Complete each task. Awaken the systems.",
    "Your journey begins now."
  ];

  await narrator.speakSequence(openingScript, 550, () => !isOpeningNarrativeActive);

  if (isOpeningNarrativeActive) {
    finishOpeningAndShowBriefing();
  }
}

function skipNarrativeOpening() {
  isOpeningNarrativeActive = false;
  narrator.stop();
  camera.position.set(...CAMERA_PRESETS.overview.pos);
  orbitControls.target.set(...CAMERA_PRESETS.overview.target);
  orbitControls.update();
  finishOpeningAndShowBriefing();
}

async function finishOpeningAndShowBriefing() {
  isOpeningNarrativeActive = false;
  const skipBtn = document.getElementById('skip-intro-btn');
  if (skipBtn) skipBtn.style.display = 'none';

  // Display Mission Briefing modal
  const modal = document.getElementById('mission-briefing');
  if (modal) {
    modal.style.display = 'flex';
  }

  const briefingScript = [
    "There are four towers connected to the central energy core.",
    "Each tower contains a challenge that must be completed.",
    "Follow the roads to reach each building.",
    "Approach an entrance to begin its task.",
    "You may restore the towers in any order.",
    "Keep an eye on your progress. The central core will awaken when all four systems are restored."
  ];

  await narrator.speakSequence(briefingScript, 450);
}

// ═══════════════════════════════════════════════════════════════
// GAMEPLAY PROGRESSION & FINAL CINEMATIC SEQUENCE
// ═══════════════════════════════════════════════════════════════

async function handlePuzzleComplete(buildingId, completedCount) {
  // Unlock building and road conduits in 3D scene
  city.unlockTower(buildingId);

  // Update HUD Tracker Pill
  const trackerEl = document.getElementById(`track-${buildingId}`);
  if (trackerEl) {
    trackerEl.style.borderColor = '#00f5d4';
    trackerEl.style.color = '#00f5d4';
    trackerEl.style.background = 'rgba(0, 245, 212, 0.18)';
    trackerEl.textContent = `✓ ${trackerEl.dataset.name}`;
  }

  // Update Progress Count
  document.getElementById('progress-counter').textContent = `${completedCount}/4 TOWERS RESTORED`;

  // Advance serial progression to next objective
  currentTaskIndex++;
  updateSerialTaskHUD();

  // Contextual voice line per restored tower
  const restoreVoiceLines = {
    signal: "Signal restored. One system is back online.",
    reactor: "Reactor operational. Energy levels stabilised.",
    archive: "Archive restored. Data network recovered.",
    nexus: "Nexus connected. All network links are active."
  };

  if (restoreVoiceLines[buildingId]) {
    await narrator.speakLine(restoreVoiceLines[buildingId]);
  }

  // If there are more tasks, smoothly walk back to the central intersection first,
  // then prompt: "Let's move to next task?"
  if (currentTaskIndex < SERIAL_TASKS.length) {
    const nextTask = SERIAL_TASKS[currentTaskIndex];
    setTimeout(() => {
      walkBackToCenter(() => {
        promptTaskConfirmation(
          'OBJECTIVE RESTORED',
          `Let's move to the next task: ${nextTask.name}?`
        );
      });
    }, 1200);
  }

  // Check if all 4 completed!
  if (completedCount === 4) {
    setTimeout(triggerGrandFinale, 1500);
  }
}

async function triggerGrandFinale() {
  if (isFinaleActive) return;
  isFinaleActive = true;

  // Phase 1: Disable player movement & switch to aerial mode
  setControlMode('orbit');
  orbitControls.enabled = false;

  // Sound buildup
  soundSystem.setClimaxMode();
  soundSystem.playBeamEruption();

  // Phase 2: Automatically move camera to high-altitude overview framing all 4 towers
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(0, 85, 145);
  const startTarget = orbitControls.target.clone();
  const endTarget = new THREE.Vector3(0, 16, 0);

  const duration = 3200;
  const startTime = performance.now();

  function animateFinaleCam(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.lerpVectors(startPos, endPos, ease);
    orbitControls.target.lerpVectors(startTarget, endTarget, ease);
    orbitControls.update();
    if (t < 1) requestAnimationFrame(animateFinaleCam);
  }
  requestAnimationFrame(animateFinaleCam);

  // Phase 3: Energy core activation narration
  const coreActivationScript = [
    "All four systems are online.",
    "Restoration sequence initiated.",
    "Energy levels rising.",
    "Central core synchronization... complete.",
    "Power is returning to VOIDPORT."
  ];

  await narrator.speakSequence(coreActivationScript, 400);

  // Phase 4 & 5: Trigger 3D world activation: vertical beam, road conduits, tower floodlights, fireworks
  city.triggerFinalActivation();

  // Play celebratory firework audio bursts sequentially
  for (let i = 0; i < 14; i++) {
    setTimeout(() => soundSystem.playFirework(), i * 420 + 400);
  }

  // Phase 6: Final Congratulations
  await new Promise(r => setTimeout(r, 1800));

  const congratulationsScript = [
    "You did it.",
    "The city is alive again.",
    "Every light. Every connection. Every system... restored.",
    "Congratulations, explorer.",
    "Welcome to the new VOIDPORT."
  ];

  await narrator.speakSequence(congratulationsScript, 500);

  // Show Restoration Banner
  const banner = document.getElementById('final-banner');
  if (banner) {
    banner.style.display = 'flex';
    setTimeout(() => { banner.style.opacity = '1'; }, 50);
  }

  // Re-enable smooth orbit controls so player can inspect the fully restored city
  orbitControls.enabled = true;
}

// ═══════════════════════════════════════════════════════════════
// PROXIMITY CHECK (FOR ENTRANCE TERMINALS)
// ═══════════════════════════════════════════════════════════════

function checkTerminalProximity() {
  if (isOpeningNarrativeActive || isFinaleActive) return;

  const terminalPositions = {
    signal:  new THREE.Vector3(0, 0.25, -92),
    reactor: new THREE.Vector3(92, 0.25, 0),
    archive: new THREE.Vector3(0, 0.25, 92),
    nexus:   new THREE.Vector3(-92, 0.25, 0)
  };

  const currentPos = controlMode === 'fps' ? physics.position : camera.position;
  let closest = null;
  let minDist = 8.5; // Trigger range in meters

  for (const [id, pos] of Object.entries(terminalPositions)) {
    const dist = currentPos.distanceTo(pos);
    if (dist < minDist) {
      minDist = dist;
      closest = id;
    }
  }

  nearbyTerminal = closest;
  const promptEl = document.getElementById('interact-prompt');

  if (closest && !city.towerStates[closest]) {
    const names = {
      signal: 'THE SIGNAL TOWER',
      reactor: 'THE REACTOR',
      archive: 'THE ARCHIVE',
      nexus: 'THE NEXUS'
    };
    promptEl.innerHTML = `[E] ACCESS ${names[closest]} TERMINAL`;
    promptEl.style.display = 'block';

    // First time approaching this tower — trigger contextual narration
    if (!visitedTowers[closest]) {
      visitedTowers[closest] = true;
      triggerTowerIntroduction(closest);
    }
  } else {
    promptEl.style.display = 'none';
  }
}

async function triggerTowerIntroduction(towerId) {
  const introScripts = {
    signal: [
      "You have reached the Signal Tower.",
      "Its communication system is offline.",
      "Reconstruct the signal sequence to restore it."
    ],
    reactor: [
      "You have reached the Reactor.",
      "Its energy circuit is disconnected.",
      "Align the energy rings and reconnect the power flow."
    ],
    archive: [
      "You have reached the Archive.",
      "Its information network has been fragmented.",
      "Arrange the missing data fragments to reconstruct the system."
    ],
    nexus: [
      "You have reached the Nexus.",
      "Its network connections are incomplete.",
      "Connect the nodes and restore the final link."
    ]
  };

  if (introScripts[towerId]) {
    await narrator.speakSequence(introScripts[towerId], 450);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (controlMode === 'fps') {
    // First-person kinematic movement
    const inputVector = new THREE.Vector3();
    if (keys.forward) inputVector.z -= 1;
    if (keys.backward) inputVector.z += 1;
    if (keys.left) inputVector.x -= 1;
    if (keys.right) inputVector.x += 1;

    if (inputVector.lengthSq() > 0.01) {
      inputVector.normalize();
    }

    physics.update(delta, inputVector, keys.sprint, keys.jump, mouseYaw);

    // Keep player inside playable city bounds
    physics.position.x = Math.max(-125, Math.min(125, physics.position.x));
    physics.position.z = Math.max(-125, Math.min(125, physics.position.z));

    const horizSpeed = Math.hypot(physics.velocity.x, physics.velocity.z);
    let bobY = 0;
    if (physics.isGrounded && horizSpeed > 0.4) {
      bobY = Math.sin(performance.now() * 0.012) * 0.035;
    }

    camera.position.set(
      physics.position.x,
      physics.position.y + bobY,
      physics.position.z
    );

    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = mousePitch;
    euler.y = mouseYaw;
    camera.quaternion.setFromEuler(euler);

  } else {
    // Bounded Orbit Controls
    orbitControls.update();
    if (camera.position.y < CONFIG.cameraBounds.minY) {
      camera.position.y = CONFIG.cameraBounds.minY;
    }
  }

  // Update animated city elements (energy rings, conduits, fireworks)
  if (city) {
    city.update(delta);
  }

  // Check terminal proximity
  checkTerminalProximity();

  composer.render();
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════

async function init() {
  initRenderer();
  createLighting();
  createSkyDome();

  // Initialize City Architecture
  city = new FourTowersCity(scene, physics);
  await city.build();

  // Initialize Puzzles
  puzzleSystem = new PuzzleSystem((buildingId, count) => {
    handlePuzzleComplete(buildingId, count);
  });

  setupHUDControls();
  animate();
}

init();
