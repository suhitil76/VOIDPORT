/**
 * VOIDPORT — Test District Scene
 * Comprehensive Technical Correction Pass:
 * - Real-world object scale normalization via central AssetScaleManifest
 * - Ground alignment and bottom-bounding-box surface snapping
 * - Sensible camera zoom boundaries and anti-ground clipping
 * - Smooth, reliable kinematic player movement (WASD + mouse look)
 * - Ground raycasting and step-climbing (road to sidewalk)
 * - Solid obstacle collision blocking (buildings, vehicles, props)
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { loadModel, loadModels } from './utils/AssetLoader.js';
import { CharacterPhysics } from './core/CharacterPhysics.js';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — BALANCED FOR DORMANT VISIBILITY & ATMOSPHERE
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  fog: {
    color: 0x161c28,
    near: 35,
    far: 500
  },
  ambient: {
    skyColor: 0x3e4e6d,
    groundColor: 0x222a38,
    intensity: 2.8
  },
  moon: {
    color: 0xc4d8ff,
    intensity: 3.5,
    position: new THREE.Vector3(80, 130, -50)
  },
  bounceFill: {
    color: 0x485e82,
    intensity: 2.2,
    position: new THREE.Vector3(-80, 55, 75)
  },
  corridorFill: {
    color: 0x3d4e68,
    intensity: 1.5,
    position: new THREE.Vector3(0, 50, 85)
  },
  bloom: {
    strength: 0.35,
    radius: 0.5,
    threshold: 0.82
  },
  rain: {
    count: 3200,
    area: 160,
    speed: 28,
    length: 1.8
  },
  cameraBounds: {
    minDistance: 6.0,    // Prevents camera clipping through surfaces/entering buildings
    maxDistance: 160.0,  // Prevents zooming out so far that the city shrinks to a speck
    minY: 1.2            // Never permits camera dipping below street level
  }
};

// Calibrated Camera Presets
const CAMERA_PRESETS = {
  cinematic: { 
    pos: [14, 11, 42], 
    target: [-2, 9, -15],
    mode: 'orbit',
    desc: 'Corridor Three-Quarter Hero Angle'
  },
  street: { 
    pos: [0, 1.8, 36], 
    target: [0, 5, -40],
    mode: 'fps',
    playerPos: [0, 1.66, 36],
    desc: 'Avenue Center Walk Mode'
  },
  walking: { 
    pos: [-14.5, 1.9, 18], 
    target: [-14.5, 3.5, -25],
    mode: 'fps',
    playerPos: [-14.5, 1.9, 18],
    desc: 'Pedestrian Sidewalk Corridor'
  },
  detail: { 
    pos: [-16, 2.6, 5], 
    target: [-24, 4.5, -4],
    mode: 'orbit',
    desc: 'Storefront & Neon Sign Closeup'
  },
  aerial: { 
    pos: [42, 60, 48], 
    target: [0, 10, -10],
    mode: 'orbit',
    desc: 'High Altitude Isometric Overview'
  }
};

// ═══════════════════════════════════════════════════════════════
// SCENE & SYSTEM GLOBALS
// ═══════════════════════════════════════════════════════════════

let scene, camera, renderer, composer, orbitControls;
let physics;
let controlMode = 'orbit'; // 'orbit' or 'fps'
let rainMesh, clock;
let loadingDiv, loadingBar, loadingText, modeBadge, infoPanelText;

// Keyboard & Mouse State
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  jump: false
};

let mousePitch = 0.05;
let mouseYaw = Math.PI; // Look towards negative Z
let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

// ═══════════════════════════════════════════════════════════════
// RENDERER & ORBIT CONTROLS WITH BOUNDARIES
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
  renderer.toneMappingExposure = 1.32;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('canvas-container').appendChild(renderer.domElement);
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.fog.color);
  scene.fog = new THREE.Fog(CONFIG.fog.color, CONFIG.fog.near, CONFIG.fog.far);
  
  camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 700);
  camera.position.set(...CAMERA_PRESETS.cinematic.pos);
  camera.lookAt(...CAMERA_PRESETS.cinematic.target);
  
  // ── Orbit Controls with Strict Boundaries & Damping ──
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.target.set(...CAMERA_PRESETS.cinematic.target);
  
  // Enforce sensible zoom limits based on actual city bounds
  orbitControls.minDistance = CONFIG.cameraBounds.minDistance;
  orbitControls.maxDistance = CONFIG.cameraBounds.maxDistance;
  
  // Prevent camera from passing below ground surface
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
  
  // Post-processing
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
  
  // Initialize Kinematic Character Physics
  physics = new CharacterPhysics();
  physics.position.set(0, 1.66, 36);
  
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
// INPUT & INTERACTION HANDLING
// ═══════════════════════════════════════════════════════════════

function setupInputHandlers() {
  window.addEventListener('keydown', (e) => {
    // Avoid interfering if focused on an input element
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    let handled = false;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') { keys.forward = true; handled = true; }
    if (e.code === 'KeyS' || e.code === 'ArrowDown') { keys.backward = true; handled = true; }
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') { keys.left = true; handled = true; }
    if (e.code === 'KeyD' || e.code === 'ArrowRight') { keys.right = true; handled = true; }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') { keys.sprint = true; handled = true; }
    if (e.code === 'Space') { keys.jump = true; handled = true; }
    
    // Automatically switch to Walk Mode if movement key pressed
    if (handled && controlMode !== 'fps') {
      enableWalkMode();
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

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (controlMode === 'fps' && isMouseDown) {
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const sensitivity = 0.003;
      mouseYaw -= deltaX * sensitivity;
      mousePitch -= deltaY * sensitivity;
      // Clamp pitch to prevent camera flips
      mousePitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, mousePitch));
    }
  });
}

function enableWalkMode(initialPos) {
  controlMode = 'fps';
  orbitControls.enabled = false;
  
  if (initialPos) {
    physics.position.set(initialPos[0], initialPos[1], initialPos[2]);
    physics.velocity.set(0, 0, 0);
  } else {
    // Sync physics to ground beneath current camera X/Z
    const groundY = physics.findGroundY(camera.position.x, camera.position.y, camera.position.z);
    physics.position.set(camera.position.x, groundY + physics.eyeHeight, camera.position.z);
    physics.velocity.set(0, 0, 0);
  }
  
  updateModeUI('Walking Mode (WASD to walk | Drag to look | Shift to sprint)');
}

function enableOrbitMode() {
  controlMode = 'orbit';
  orbitControls.enabled = true;
  updateModeUI('Overview Orbit Mode (Left drag to rotate | Right drag to pan | Scroll to zoom)');
}

function updateModeUI(text) {
  if (modeBadge) {
    modeBadge.textContent = controlMode === 'fps' ? 'WALK MODE' : 'ORBIT MODE';
    modeBadge.style.borderColor = controlMode === 'fps' ? '#00e5ff' : 'rgba(255, 0, 102, 0.6)';
    modeBadge.style.color = controlMode === 'fps' ? '#00e5ff' : '#ff3377';
  }
  if (infoPanelText) {
    infoPanelText.textContent = text;
  }
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING
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
  moon.shadow.camera.far = 350;
  moon.shadow.camera.left = -100;
  moon.shadow.camera.right = 100;
  moon.shadow.camera.top = 100;
  moon.shadow.camera.bottom = -100;
  moon.shadow.bias = -0.0006;
  scene.add(moon);
  scene.add(moon.target);
  
  const fillLight = new THREE.DirectionalLight(CONFIG.bounceFill.color, CONFIG.bounceFill.intensity);
  fillLight.position.copy(CONFIG.bounceFill.position);
  scene.add(fillLight);
  
  const corridorLight = new THREE.DirectionalLight(CONFIG.corridorFill.color, CONFIG.corridorFill.intensity);
  corridorLight.position.copy(CONFIG.corridorFill.position);
  scene.add(corridorLight);

  const cornerFills = [
    [-18, 5, 0], [18, 5, -5], [0, 6, -20], [-18, 5, 25], [18, 5, 25]
  ];
  cornerFills.forEach(([x, y, z]) => {
    const pt = new THREE.PointLight(0x50688a, 4.2, 55, 1.8);
    pt.position.set(x, y, z);
    scene.add(pt);
  });
  
  const barAccent = new THREE.PointLight(0xd9446d, 5.0, 35, 1.8);
  barAccent.position.set(-19, 5, 2);
  scene.add(barAccent);
  
  const rightAccent = new THREE.PointLight(0x2d8fb8, 5.0, 35, 1.8);
  rightAccent.position.set(19, 5, -12);
  scene.add(rightAccent);

  const streetLightPositions = [
    [-15.5, 6.5, -28], [-15.5, 6.5, -8], [-15.5, 6.5, 12], [-15.5, 6.5, 32],
    [15.5, 6.5, -22], [15.5, 6.5, -2], [15.5, 6.5, 18], [15.5, 6.5, 38]
  ];
  streetLightPositions.forEach(([x, y, z]) => {
    const ptLight = new THREE.PointLight(0xffbe66, 3.4, 28, 2.0);
    ptLight.position.set(x + (x > 0 ? -1.8 : 1.8), y, z);
    scene.add(ptLight);
  });
}

// ═══════════════════════════════════════════════════════════════
// ROADS & SIDEWALKS WITH PHYSICAL COLLIDERS
// ═══════════════════════════════════════════════════════════════

function createGroundAndRoads() {
  const group = new THREE.Group();
  
  // Road plane at y = 0.01 (walkable base surface)
  const roadGeo = new THREE.PlaneGeometry(30, 240);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x242834,
    roughness: 0.26,
    metalness: 0.38,
    envMapIntensity: 1.5
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  road.receiveShadow = true;
  group.add(road);
  
  // Broken center road markings
  const lineGeo = new THREE.PlaneGeometry(0.18, 4.5);
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.35,
    emissive: 0x485568,
    emissiveIntensity: 0.28
  });
  for (let z = -110; z < 110; z += 9) {
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.025, z);
    line.receiveShadow = true;
    group.add(line);
  }
  
  // Continuous side markings
  const edgeGeo = new THREE.PlaneGeometry(0.14, 240);
  [-14.2, 14.2].forEach((x) => {
    const edge = new THREE.Mesh(edgeGeo, lineMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(x, 0.025, 0);
    edge.receiveShadow = true;
    group.add(edge);
  });
  
  // Raised Sidewalks (height: 0.25m) — registered as step-climbable physical colliders!
  const sidewalkGeo = new THREE.BoxGeometry(14, 0.25, 240);
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x3a4254,
    roughness: 0.58,
    metalness: 0.12
  });
  
  [-22, 22].forEach((x) => {
    const sw = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sw.position.set(x, 0.125, 0);
    sw.receiveShadow = true;
    sw.castShadow = true;
    group.add(sw);
    
    // Register physical ground collider for curb step climbing
    const swBox = new THREE.Box3(
      new THREE.Vector3(x - 7, 0, -120),
      new THREE.Vector3(x + 7, 0.25, 120)
    );
    physics.addCollider(swBox);
  });
  
  // Curbs
  const curbGeo = new THREE.BoxGeometry(0.35, 0.3, 240);
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x545d72,
    roughness: 0.48,
    metalness: 0.22
  });
  [-15.15, -28.85, 15.15, 28.85].forEach((x) => {
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.set(x, 0.15, 0);
    curb.castShadow = true;
    group.add(curb);
  });
  
  // Ground foundation beyond sidewalks
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x161a24,
    roughness: 0.45,
    metalness: 0.25
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  group.add(ground);
  
  // Pedestrian zebra crossings
  const crossGeo = new THREE.PlaneGeometry(1.6, 0.45);
  const crossMat = new THREE.MeshStandardMaterial({ color: 0xe2ebf5, roughness: 0.4 });
  for (let x = -13; x <= 13; x += 2.8) {
    const stripe = new THREE.Mesh(crossGeo, crossMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(x, 0.03, 20);
    stripe.receiveShadow = true;
    group.add(stripe);
  }
  
  // Drainage grates
  const drainGeo = new THREE.PlaneGeometry(0.9, 0.5);
  const drainMat = new THREE.MeshStandardMaterial({
    color: 0x1a202c, roughness: 0.75, metalness: 0.8
  });
  [[-14.5, -25], [-14.5, 5], [-14.5, 35], [14.5, -15], [14.5, 15], [14.5, 45]].forEach(([x, z]) => {
    const drain = new THREE.Mesh(drainGeo, drainMat);
    drain.rotation.x = -Math.PI / 2;
    drain.position.set(x, 0.025, z);
    group.add(drain);
  });
  
  scene.add(group);
}

// ═══════════════════════════════════════════════════════════════
// SUBTLE ROAD REFLECTIONS
// ═══════════════════════════════════════════════════════════════

function createNeonLightTrails() {
  const group = new THREE.Group();
  
  const trailGeo = new THREE.PlaneGeometry(3.2, 220);
  const blueTrail = new THREE.Mesh(trailGeo, new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x2266aa,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.18,
    roughness: 0.0,
    metalness: 1.0
  }));
  blueTrail.rotation.x = -Math.PI / 2;
  blueTrail.position.set(6, 0.035, 0);
  group.add(blueTrail);
  
  const roseTrail = new THREE.Mesh(trailGeo.clone(), new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x883355,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.16,
    roughness: 0.0,
    metalness: 1.0
  }));
  roseTrail.rotation.x = -Math.PI / 2;
  roseTrail.position.set(-6, 0.035, 0);
  group.add(roseTrail);
  
  scene.add(group);
}

// ═══════════════════════════════════════════════════════════════
// STREETLIGHT FIXTURES WITH COLLIDERS
// ═══════════════════════════════════════════════════════════════

function createStreetlights() {
  const group = new THREE.Group();
  
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x323a4a, metalness: 0.8, roughness: 0.3
  });
  
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffbe66,
    emissiveIntensity: 1.8
  });
  
  const positions = [
    { x: -15.5, z: -28 }, { x: -15.5, z: -8 }, { x: -15.5, z: 12 }, { x: -15.5, z: 32 },
    { x: 15.5, z: -22 }, { x: 15.5, z: -2 }, { x: 15.5, z: 18 }, { x: 15.5, z: 38 }
  ];
  
  positions.forEach(({ x, z }) => {
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.12, 7.5, 8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 3.75, z);
    pole.castShadow = true;
    group.add(pole);
    
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 6);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.z = x > 0 ? -Math.PI / 2.3 : Math.PI / 2.3;
    arm.position.set(x + (x > 0 ? -1.5 : 1.5), 7.2, z);
    group.add(arm);
    
    const lampGeo = new THREE.BoxGeometry(1.4, 0.18, 0.45);
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x + (x > 0 ? -2.6 : 2.6), 7.1, z);
    group.add(lamp);
    
    // Register pole obstacle collider
    const poleBox = new THREE.Box3(
      new THREE.Vector3(x - 0.2, 0.25, z - 0.2),
      new THREE.Vector3(x + 0.2, 7.5, z + 0.2)
    );
    physics.addCollider(poleBox);
  });
  
  scene.add(group);
}

// ═══════════════════════════════════════════════════════════════
// REAL GLB ASSET PLACEMENT & GROUND SNAPPING
// ═══════════════════════════════════════════════════════════════

async function loadCityAssets() {
  const buildingConfigs = [
    // Left Side 1: Apartment building (city_pack)
    {
      path: '/assets_library/city_pack/Apartment building.glb',
      options: {
        position: new THREE.Vector3(-27, 0, -12),
        rotationY: Math.PI / 2,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25,
        emissiveColor: new THREE.Color(0x334866)
      }
    },
    // Left Side 2: Second Apartment building angled
    {
      path: '/assets_library/city_pack/Apartment building.glb',
      options: {
        position: new THREE.Vector3(-28, 0, 18),
        rotationY: Math.PI * 0.55,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.22,
        emissiveColor: new THREE.Color(0x334466)
      }
    },
    // Left Side 3: Town House (city_pack)
    {
      path: '/assets_library/city_pack/Town House.glb',
      options: {
        position: new THREE.Vector3(-29, 0, -38),
        rotationY: Math.PI / 2,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.2
      }
    },
    // Left Side 4: City Kit Large Building
    {
      path: '/assets_library/city_kit/Large Building-h7Jaq7bqMq.glb',
      options: {
        position: new THREE.Vector3(-31, 0, 42),
        rotationY: Math.PI / 4,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25,
        emissiveColor: new THREE.Color(0x335577)
      }
    },

    // Right Side 1: Hospital building (city_pack)
    {
      path: '/assets_library/city_pack/Hospital.glb',
      options: {
        position: new THREE.Vector3(28, 0, -18),
        rotationY: -Math.PI / 2,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25,
        emissiveColor: new THREE.Color(0x225577)
      }
    },
    // Right Side 2: Hotel Building (city_pack)
    {
      path: '/assets_library/city_pack/Hotel Building.glb',
      options: {
        position: new THREE.Vector3(30, 0, 12),
        rotationY: -Math.PI / 2,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25,
        emissiveColor: new THREE.Color(0x444466)
      }
    },
    // Right Side 3: Commercial Building (city_pack)
    {
      path: '/assets_library/city_pack/Building.glb',
      options: {
        position: new THREE.Vector3(31, 0, 38),
        rotationY: -Math.PI / 2,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.2
      }
    },

    // Avenue Terminus Backdrop: Skyscraper (city_pack)
    {
      path: '/assets_library/city_pack/Skyscraper.glb',
      options: {
        position: new THREE.Vector3(0, 0, -68),
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.35,
        emissiveColor: new THREE.Color(0x334e77)
      }
    },
    // Distant Google Poly Skyscraper left
    {
      path: '/ref_images/Skyscraper by Poly by Google - dIsZyy2FUY-.glb',
      options: {
        position: new THREE.Vector3(-45, 0, -50),
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25
      }
    },
    // Distant Google Poly Skyscraper right
    {
      path: '/ref_images/Skyscraper by Poly by Google - dIsZyy2FUY-.glb',
      options: {
        position: new THREE.Vector3(45, 0, -48),
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25
      }
    }
  ];
  
  // === VEHICLES — Perfectly Ground-Aligned to Road Surface (y = 0.01) ===
  const vehicleConfigs = [
    // Nissan GTR — curb parked
    {
      path: '/assets_library/city_pack/Nissan GTR.glb',
      options: {
        position: new THREE.Vector3(-16.8, 0, 4),
        rotationY: Math.PI * 0.12,
        surfaceY: 0.01
      }
    },
    // Police Car — angled in roadway
    {
      path: '/assets_library/city_pack/Police Car.glb',
      options: {
        position: new THREE.Vector3(6.5, 0, -10),
        rotationY: Math.PI * 0.92,
        surfaceY: 0.01
      }
    },
    // SUV — parked on sidewalk edge
    {
      path: '/assets_library/city_pack/SUV.glb',
      options: {
        position: new THREE.Vector3(16.5, 0, 22),
        rotationY: Math.PI * 0.45,
        surfaceY: 0.25
      }
    },
    // Convertible — stopped near center
    {
      path: '/assets_library/city_pack/Convertible.glb',
      options: {
        position: new THREE.Vector3(-5.5, 0, -28),
        rotationY: Math.PI * 0.28,
        surfaceY: 0.01
      }
    }
  ];
  
  // === STREET-LEVEL PROPS & SIGNS ===
  const propConfigs = [
    // Bar
    {
      path: '/assets_library/city_pack/Bar.glb',
      options: {
        position: new THREE.Vector3(-21, 0, 1),
        rotationY: Math.PI / 2,
        surfaceY: 0.25,
        cyberpunkOverride: true,
        emissiveIntensity: 0.45,
        emissiveColor: new THREE.Color(0xaa3355)
      }
    },
    // Billboard
    {
      path: '/assets_library/city_pack/Billboard.glb',
      options: {
        position: new THREE.Vector3(17.5, 0, -14),
        rotationY: -Math.PI * 0.15,
        surfaceY: 0.25,
        cyberpunkOverride: true,
        emissiveIntensity: 0.45,
        emissiveColor: new THREE.Color(0x3377aa)
      }
    },
    // Traffic light intersection
    {
      path: '/assets_library/city_pack/Traffic light.glb',
      options: {
        position: new THREE.Vector3(-14.8, 0, 18),
        surfaceY: 0.25
      }
    },
    // Bus stop sign
    {
      path: '/assets_library/city_pack/Bus stop sign.glb',
      options: {
        position: new THREE.Vector3(15.8, 0, 10),
        surfaceY: 0.25
      }
    },
    // Stop sign
    {
      path: '/assets_library/city_pack/Stop sign.glb',
      options: {
        position: new THREE.Vector3(-15.2, 0, -18),
        surfaceY: 0.25
      }
    },
    // Vending Machine
    {
      path: '/props/Vending Machine by Don Carson - 0CX6wj64Swu.glb',
      options: {
        position: new THREE.Vector3(-16.5, 0, 11),
        rotationY: Math.PI / 2,
        surfaceY: 0.25,
        emissiveIntensity: 0.35,
        emissiveColor: new THREE.Color(0x3388bb)
      }
    },
    // Road barricade
    {
      path: '/props/Concert Pack-glb/Barricade.glb',
      options: {
        position: new THREE.Vector3(10.5, 0, 16),
        rotationY: Math.PI * 0.15,
        surfaceY: 0.01
      }
    },
    // Storefront asset
    {
      path: '/props/Store by Mrhadley - yzNqr0VvSP.glb',
      options: {
        position: new THREE.Vector3(22.5, 0, 28),
        rotationY: -Math.PI / 2,
        surfaceY: 0.25,
        cyberpunkOverride: true,
        emissiveIntensity: 0.25
      }
    }
  ];
  
  // === CYBERPUNK GAME KIT & ROOFTOP DETAILS ===
  const cyberpunkConfigs = [
    // Cyberpunk signs
    {
      path: '/props/Cyberpunk Game Kit-glb/Cyberpunk Signs.glb',
      options: {
        position: new THREE.Vector3(-23.5, 4.2, -4),
        snapToGround: false,
        emissiveIntensity: 0.65,
        emissiveColor: new THREE.Color(0xcc2255)
      }
    },
    // Industrial TV Tower rooftop beacon
    {
      path: '/props/Cyberpunk Game Kit-glb/TV Tower.glb',
      options: {
        position: new THREE.Vector3(-32, 0, -28),
        surfaceY: 0.0
      }
    },
    // Cyberpunk Platform structure
    {
      path: '/props/Cyberpunk Game Kit-glb/Cyberpunk Platform-ctQ5CDmraQ.glb',
      options: {
        position: new THREE.Vector3(34, 14, -32),
        snapToGround: false,
        cyberpunkOverride: true
      }
    },
    // Industrial Air conditioning stacks
    {
      path: '/props/Cyberpunk Game Kit-glb/Ac Stacked.glb',
      options: {
        position: new THREE.Vector3(-24, 38.0, -12),
        surfaceY: 38.0
      }
    },
    // Communication Antenna
    {
      path: '/props/Cyberpunk Game Kit-glb/Antenna.glb',
      options: {
        position: new THREE.Vector3(29, 32.0, -18),
        surfaceY: 32.0
      }
    },
    // Industrial Wall Pipe
    {
      path: '/props/Cyberpunk Game Kit-glb/Pipe.glb',
      options: {
        position: new THREE.Vector3(-27, 4.0, 8),
        rotationY: Math.PI / 2,
        snapToGround: false
      }
    },
    // Wall Monitor / TV Screen
    {
      path: '/props/Cyberpunk Game Kit-glb/TV.glb',
      options: {
        position: new THREE.Vector3(-22.8, 3.0, 3),
        rotationY: Math.PI / 2,
        snapToGround: false,
        emissiveIntensity: 0.45,
        emissiveColor: new THREE.Color(0x3377aa)
      }
    },
    // Dumpster
    {
      path: '/assets_library/city_builder_bits/Dumpster.glb',
      options: {
        position: new THREE.Vector3(16.5, 0, -4),
        surfaceY: 0.25
      }
    },
    // Fire Hydrant
    {
      path: '/assets_library/city_builder_bits/Fire Hydrant.glb',
      options: {
        position: new THREE.Vector3(-15.1, 0, 8),
        surfaceY: 0.25
      }
    },
    // Rooftop Watertower
    {
      path: '/assets_library/city_builder_bits/Watertower.glb',
      options: {
        position: new THREE.Vector3(30, 26.0, 12),
        surfaceY: 26.0
      }
    }
  ];
  
  const allConfigs = [
    ...buildingConfigs,
    ...vehicleConfigs,
    ...propConfigs,
    ...cyberpunkConfigs
  ];
  
  updateLoading('Normalizing Asset Scales & Ground Alignment...', 0);
  
  const loadedModels = await loadModels(allConfigs, (loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    updateLoading(`Aligning assets: ${loaded}/${total}`, pct);
  });
  
  loadedModels.forEach((model) => {
    scene.add(model);
    
    // Register physical collision box if asset is collidable
    if (model.userData.hasCollision && model.userData.worldBox) {
      physics.addCollider(model.userData.worldBox);
    }
  });
  
  return loadedModels;
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND SKYLINE SILHOUETTES
// ═══════════════════════════════════════════════════════════════

function createBackgroundSkyline() {
  const group = new THREE.Group();
  
  const bldgMat = new THREE.MeshStandardMaterial({
    color: 0x222a3a,
    roughness: 0.65,
    metalness: 0.3
  });
  
  const winMat = new THREE.MeshStandardMaterial({
    color: 0x141a26,
    emissive: 0x283850,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.7
  });

  const winMatCyan = new THREE.MeshStandardMaterial({
    color: 0x141a26,
    emissive: 0x1d3d52,
    emissiveIntensity: 0.35,
    roughness: 0.2,
    metalness: 0.7
  });
  
  const bgBuildings = [
    { pos: [-55, 0, -45], w: 20, h: 70, d: 20 },
    { pos: [-42, 0, -75], w: 16, h: 90, d: 16 },
    { pos: [-65, 0, -15], w: 18, h: 55, d: 22 },
    { pos: [-60, 0, 20],  w: 16, h: 65, d: 18 },
    { pos: [52, 0, -50],  w: 22, h: 60, d: 18 },
    { pos: [68, 0, -35],  w: 14, h: 95, d: 14 },
    { pos: [58, 0, 15],   w: 18, h: 75, d: 20 },
    { pos: [55, 0, -75],  w: 16, h: 80, d: 16 },
    { pos: [-18, 0, -95], w: 20, h: 85, d: 20 },
    { pos: [22, 0, -95],  w: 20, h: 90, d: 20 },
    { pos: [0, 0, -110],  w: 26, h: 120, d: 24 }
  ];
  
  bgBuildings.forEach(({ pos, w, h, d }, idx) => {
    const bGroup = new THREE.Group();
    
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const body = new THREE.Mesh(bodyGeo, bldgMat.clone());
    body.position.set(0, h / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    bGroup.add(body);
    
    const curWinMat = idx % 2 === 0 ? winMat : winMatCyan;
    const floors = Math.floor(h / 4.2);
    for (let f = 3; f < floors; f++) {
      if (Math.random() > 0.65) continue;
      const wGeo = new THREE.PlaneGeometry(w * 0.88, 1.3);
      const wMesh = new THREE.Mesh(wGeo, curWinMat);
      wMesh.position.set(0, f * 4.2, d / 2 + 0.05);
      bGroup.add(wMesh);
      
      const wBack = wMesh.clone();
      wBack.position.z = -d / 2 - 0.05;
      wBack.rotation.y = Math.PI;
      bGroup.add(wBack);
    }
    
    const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
    const beaconMat = new THREE.MeshStandardMaterial({
      emissive: idx % 2 === 0 ? 0xcc2244 : 0x2288bb,
      emissiveIntensity: 1.8,
      color: 0x000000
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, h + 1, 0);
    bGroup.add(beacon);
    
    bGroup.position.set(...pos);
    group.add(bGroup);
    
    // Register solid collider for background buildings
    const bgBox = new THREE.Box3(
      new THREE.Vector3(pos[0] - w / 2, 0, pos[2] - d / 2),
      new THREE.Vector3(pos[0] + w / 2, h, pos[2] + d / 2)
    );
    physics.addCollider(bgBox);
  });
  
  scene.add(group);
}

// ═══════════════════════════════════════════════════════════════
// OVERHEAD POWER LINES / CATENARY CABLES
// ═══════════════════════════════════════════════════════════════

function createOverheadCables() {
  const group = new THREE.Group();
  const cableMat = new THREE.LineBasicMaterial({
    color: 0x425068,
    transparent: true,
    opacity: 0.85
  });
  
  const cableSpans = [
    { from: [-26, 14, -15], to: [26, 16, -20], sag: 3.2 },
    { from: [-26, 18, 5],   to: [26, 20, 10],  sag: 3.8 },
    { from: [-26, 12, 22],  to: [26, 14, 25],  sag: 2.8 },
    { from: [-28, 22, -25], to: [-28, 18, 15], sag: 4.5 },
    { from: [28, 22, -30],  to: [28, 19, 10],  sag: 4.0 }
  ];
  
  cableSpans.forEach(({ from, to, sag }) => {
    const points = [];
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = from[0] + (to[0] - from[0]) * t;
      const baseY = from[1] + (to[1] - from[1]) * t;
      const sagAmount = Math.sin(t * Math.PI) * sag;
      const y = baseY - sagAmount;
      const z = from[2] + (to[2] - from[2]) * t;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
    const cable = new THREE.Line(geo, cableMat);
    group.add(cable);
  });
  
  scene.add(group);
}

// ═══════════════════════════════════════════════════════════════
// RAIN SYSTEM
// ═══════════════════════════════════════════════════════════════

function createRain() {
  const count = CONFIG.rain.count;
  const area = CONFIG.rain.area;
  const positions = new Float32Array(count * 6);
  
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * area * 2;
    const y = Math.random() * 85;
    const z = (Math.random() - 0.5) * area * 2;
    const idx = i * 6;
    positions[idx]     = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    positions[idx + 3] = x + (Math.random() - 0.5) * 0.12;
    positions[idx + 4] = y - CONFIG.rain.length;
    positions[idx + 5] = z + (Math.random() - 0.5) * 0.12;
  }
  
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const mat = new THREE.LineBasicMaterial({
    color: 0xa8c0e2,
    transparent: true,
    opacity: 0.32
  });
  
  rainMesh = new THREE.LineSegments(geo, mat);
  scene.add(rainMesh);
}

function updateRain(delta) {
  if (!rainMesh) return;
  const positions = rainMesh.geometry.attributes.position.array;
  const speed = CONFIG.rain.speed * delta;
  
  for (let i = 0; i < positions.length; i += 6) {
    positions[i + 1] -= speed;
    positions[i + 4] -= speed;
    if (positions[i + 4] < 0) {
      const y = 65 + Math.random() * 20;
      positions[i + 1] = y;
      positions[i + 4] = y - CONFIG.rain.length;
    }
  }
  rainMesh.geometry.attributes.position.needsUpdate = true;
}

// ═══════════════════════════════════════════════════════════════
// SKY DOME & GROUND HAZE
// ═══════════════════════════════════════════════════════════════

function createSkyDome() {
  const skyGeo = new THREE.SphereGeometry(280, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0a101c) },
      bottomColor: { value: new THREE.Color(0x1c283c) },
      offset: { value: 14 },
      exponent: { value: 0.65 }
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
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

function createGroundHaze() {
  const hazeGeo = new THREE.PlaneGeometry(380, 380);
  const hazeMat = new THREE.MeshBasicMaterial({
    color: 0x1c2638,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  [0.6, 2.0, 4.0].forEach((y, i) => {
    const haze = new THREE.Mesh(hazeGeo, hazeMat.clone());
    haze.rotation.x = -Math.PI / 2;
    haze.position.y = y;
    haze.material.opacity = 0.06 / (i + 1);
    scene.add(haze);
  });
}

function createReflectionProbe() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x141a26);
  
  const colors = [0x446688, 0x335577, 0x886644, 0x556677];
  const positions = [
    [-18, 12, -10], [18, 14, -15], [0, 8, -40], [-10, 6, 20]
  ];
  
  colors.forEach((col, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: col });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), mat);
    plane.position.set(...positions[i]);
    envScene.add(plane);
  });
  
  const cubeRenderTarget = pmremGenerator.fromScene(envScene, 0.04);
  scene.environment = cubeRenderTarget.texture;
  pmremGenerator.dispose();
}

// ═══════════════════════════════════════════════════════════════
// UI & CAMERA INTERACTION
// ═══════════════════════════════════════════════════════════════

function updateLoading(text, percent) {
  if (loadingText) loadingText.textContent = text;
  if (loadingBar) loadingBar.style.width = `${percent}%`;
}

function hideLoading() {
  if (loadingDiv) {
    loadingDiv.style.opacity = '0';
    loadingDiv.style.transition = 'opacity 0.8s ease';
    setTimeout(() => {
      loadingDiv.style.display = 'none';
    }, 800);
  }
}

function setupCameraButtons() {
  const buttons = document.querySelectorAll('.camera-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.view;
      const preset = CAMERA_PRESETS[presetKey];
      if (!preset) return;
      
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      const startPos = camera.position.clone();
      const endPos = new THREE.Vector3(...preset.pos);
      const startTarget = orbitControls.target.clone();
      const endTarget = new THREE.Vector3(...preset.target);
      
      const duration = 1200;
      const startTime = performance.now();
      
      function animateTransition(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        camera.position.lerpVectors(startPos, endPos, ease);
        orbitControls.target.lerpVectors(startTarget, endTarget, ease);
        orbitControls.update();
        
        if (t < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          // Preset complete: switch to appropriate mode
          if (preset.mode === 'fps') {
            enableWalkMode(preset.playerPos || preset.pos);
          } else {
            enableOrbitMode();
          }
        }
      }
      
      requestAnimationFrame(animateTransition);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION & PHYSICS TICK LOOP
// ═══════════════════════════════════════════════════════════════

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05); // Clamp max delta to prevent physics jumps
  
  if (controlMode === 'fps') {
    // ── KINEMATIC CHARACTER MOVEMENT UPDATE ──
    const inputVector = new THREE.Vector3();
    if (keys.forward) inputVector.z -= 1;
    if (keys.backward) inputVector.z += 1;
    if (keys.left) inputVector.x -= 1;
    if (keys.right) inputVector.x += 1;
    
    // Normalize diagonal movement speed
    if (inputVector.lengthSq() > 0.01) {
      inputVector.normalize();
    }
    
    physics.update(
      delta,
      inputVector,
      keys.sprint,
      keys.jump,
      mouseYaw
    );
    
    // Restrict player inside playable avenue corridor bounds
    physics.position.x = Math.max(-34, Math.min(34, physics.position.x));
    physics.position.z = Math.max(-105, Math.min(105, physics.position.z));
    
    // Natural subtle head bobbing when moving on ground
    const horizontalSpeed = Math.hypot(physics.velocity.x, physics.velocity.z);
    let bobY = 0;
    if (physics.isGrounded && horizontalSpeed > 0.4) {
      bobY = Math.sin(performance.now() * 0.012) * 0.035;
    }
    
    // Update camera position to player eye level
    camera.position.set(
      physics.position.x,
      physics.position.y + bobY,
      physics.position.z
    );
    
    // Update camera orientation from mouse look
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = mousePitch;
    euler.y = mouseYaw;
    camera.quaternion.setFromEuler(euler);
    
  } else {
    // ── ORBIT CONTROLS UPDATE & ANTI-GROUND CLAMPING ──
    orbitControls.update();
    
    // Strict ground protection: camera must never pass below ground
    if (camera.position.y < CONFIG.cameraBounds.minY) {
      camera.position.y = CONFIG.cameraBounds.minY;
    }
  }
  
  updateRain(delta);
  composer.render();
}

// ═══════════════════════════════════════════════════════════════
// BOOTSTRAP INITIALIZATION
// ═══════════════════════════════════════════════════════════════

async function init() {
  loadingDiv = document.getElementById('loading');
  loadingBar = document.getElementById('loading-bar');
  loadingText = document.getElementById('loading-text');
  modeBadge = document.getElementById('mode-badge');
  infoPanelText = document.getElementById('info-text');
  
  updateLoading('Initializing 3D Engine & Physics...', 5);
  initRenderer();
  
  updateLoading('Setting Up Atmospheric Depth...', 12);
  createLighting();
  createSkyDome();
  createGroundAndRoads();
  createNeonLightTrails();
  createStreetlights();
  createRain();
  createGroundHaze();
  createOverheadCables();
  createBackgroundSkyline();
  createReflectionProbe();
  
  updateLoading('Loading & Aligning Real GLB Models...', 25);
  try {
    await loadCityAssets();
    updateLoading('District Navigation & Scale Calibration Complete!', 100);
  } catch (err) {
    console.error('Error loading assets:', err);
    updateLoading('Scene Ready (Partial Assets)', 100);
  }
  
  setupCameraButtons();
  setTimeout(hideLoading, 400);
  animate();
}

init();
