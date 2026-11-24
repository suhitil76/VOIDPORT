/**
 * VOIDPORT â€” Four Towers, Four Puzzles, One Central Core
 * Clean, organized architectural layout:
 * - 1 Central Intersection & Interactive Energy Core
 * - 4 Directional Roads (North, East, South, West)
 * - 4 Iconic Skyscraper Landmarks:
 *    â€¢ North: The Signal Tower
 *    â€¢ East: The Reactor
 *    â€¢ South: The Archive
 *    â€¢ West: The Nexus
 * - Zero rain, zero clutter, zero residential houses.
 */
import * as THREE from 'three';
import { loadModel } from '../utils/AssetLoader.js';

export class FourTowersCity {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Dynamic objects for animation
    this.coreRings = [];
    this.conduitMaterials = {};
    this.roadEnergyPulses = [];
    this.terminalMeshes = {};
    this.towerMaterials = {};
    this.verticalBeam = null;
    this.fireworks = [];

    // State tracking
    this.towerStates = {
      signal: false,
      reactor: false,
      archive: false,
      nexus: false
    };

    this.isFullyActivated = false;
    this.train = null;
    this.trainTrackRadius = 160;
    this.trainAngle = 0;
    this.trainSpeed = 0.22; // Radians per sec
  }

  async build() {
    this.createCentralIntersection();
    this.createFourRoads();
    this.createSecondaryUrbanElements();
    this.createElevatedMetroSystem();
    this.createCentralEnergyCore();
    this.createEntranceTerminals();
    await this.createFourSkyscrapers();
    this.createMinimalSkylineBackdrop();
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 1. CENTRAL INTERSECTION & ROADS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  createCentralIntersection() {
    // Central circular plaza foundation (radius 24m)
    const plazaGeo = new THREE.CylinderGeometry(24, 24, 0.25, 48);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x1e2433,
      roughness: 0.35,
      metalness: 0.3
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.125, 0);
    plaza.receiveShadow = true;
    this.group.add(plaza);

    // Outer Plaza Curb Ring
    const curbGeo = new THREE.RingGeometry(23.5, 24.2, 48);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x48556e,
      roughness: 0.45,
      side: THREE.DoubleSide
    });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = -Math.PI / 2;
    curb.position.y = 0.26;
    this.group.add(curb);

    // Register plaza physical ground
    const plazaBox = new THREE.Box3(
      new THREE.Vector3(-24, 0, -24),
      new THREE.Vector3(24, 0.25, 24)
    );
    this.physics.addCollider(plazaBox);

    // Ground plane â€” wet reflective dark asphalt with purple-tinted metalness
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x06040e,       // Near-black with slight purple tint
      roughness: 0.08,       // Very smooth for reflections
      metalness: 0.72,       // High metalness = wet asphalt look
      envMapIntensity: 1.4
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.group.add(ground);
  }

  createFourRoads() {
    // 4 cardinal roads extending outward from central plaza to towers
    // Road width: 14m, Length: 85m (from 12m to 97m)
    const roadConfigs = [
      { id: 'signal',  rotY: 0,           center: [0, 0.01, -55],  w: 14, l: 82 }, // North
      { id: 'reactor', rotY: Math.PI / 2, center: [55, 0.01, 0],   w: 14, l: 82 }, // East
      { id: 'archive', rotY: Math.PI,     center: [0, 0.01, 55],   w: 14, l: 82 }, // South
      { id: 'nexus',   rotY: -Math.PI / 2,center: [-55, 0.01, 0],  w: 14, l: 82 }  // West
    ];

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0a0618,       // Deep purple-black asphalt
      roughness: 0.12,       // Low roughness = wet reflective look
      metalness: 0.65        // High metalness = mirror-like under neon
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x1a0e30,       // Dark purple concrete sidewalk
      roughness: 0.5,
      metalness: 0.1
    });

    roadConfigs.forEach(cfg => {
      const roadGroup = new THREE.Group();

      // Main Road Surface
      const rGeo = new THREE.PlaneGeometry(cfg.w, cfg.l);
      const rMesh = new THREE.Mesh(rGeo, roadMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.receiveShadow = true;
      roadGroup.add(rMesh);

      // Sidewalks on left and right (width 3.5m, height 0.25m)
      [-8.75, 8.75].forEach(xOff => {
        const swGeo = new THREE.BoxGeometry(3.5, 0.25, cfg.l);
        const swMesh = new THREE.Mesh(swGeo, sidewalkMat);
        swMesh.position.set(xOff, 0.125, 0);
        swMesh.receiveShadow = true;
        swMesh.castShadow = true;
        roadGroup.add(swMesh);
      });

      // Central Energy Conduit Strip (embedded in center of road)
      const conduitGeo = new THREE.PlaneGeometry(0.8, cfg.l);
      const conduitMat = new THREE.MeshStandardMaterial({
        color: 0x1a0033,
        emissive: 0x8800cc,   // Purple conduit glow
        emissiveIntensity: 0.6,
        roughness: 0.08
      });
      this.conduitMaterials[cfg.id] = conduitMat;

      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.rotation.x = -Math.PI / 2;
      conduit.position.y = 0.02;
      roadGroup.add(conduit);

      // â”€â”€ MAGENTA LIGHT TRAIL STREAKS on road surface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // These simulate long-exposure car trail photographs
      const trailColors = [0xff00aa, 0xcc0088, 0xee0099, 0xff3399];
      const laneOffsets = [-2.5, -0.5, 1.5, 3.5];
      laneOffsets.forEach((laneX, li) => {
        const trailLen = 20 + Math.random() * 50;
        const trailZ = -cfg.l / 2 + Math.random() * (cfg.l - trailLen);
        const trailGeo = new THREE.PlaneGeometry(0.18, trailLen);
        const trailMat = new THREE.MeshBasicMaterial({
          color: trailColors[li % trailColors.length],
          transparent: true,
          opacity: 0.55 + Math.random() * 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const trail = new THREE.Mesh(trailGeo, trailMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.set(laneX, 0.015, trailZ);
        roadGroup.add(trail);
      });

      // â”€â”€ BLUE OPPOSING LANE TRAILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      [-2.0, 0.0].forEach((laneX) => {
        const trailLen = 15 + Math.random() * 45;
        const trailZ = -cfg.l / 2 + Math.random() * (cfg.l - trailLen);
        const trailGeo = new THREE.PlaneGeometry(0.15, trailLen);
        const trailMat = new THREE.MeshBasicMaterial({
          color: 0x0088ff,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const trail = new THREE.Mesh(trailGeo, trailMat);
        trail.rotation.x = -Math.PI / 2;
        trail.position.set(laneX, 0.015, trailZ);
        roadGroup.add(trail);
      });

      // Clean futuristic street lighting fixtures along sidewalks
      for (let z = -cfg.l / 2 + 10; z < cfg.l / 2; z += 24) {
        [-8.0, 8.0].forEach(x => {
          const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 6.5, 6);
          const poleMat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, metalness: 0.85 });
          const pole = new THREE.Mesh(poleGeo, poleMat);
          pole.position.set(x, 3.25, z);
          roadGroup.add(pole);

          // Lamp head â€” purple-tinted
          const headGeo = new THREE.BoxGeometry(1.0, 0.15, 0.35);
          const headMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xcc44ff,   // Purple-magenta neon lamp
            emissiveIntensity: 2.2
          });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.set(x + (x > 0 ? -0.8 : 0.8), 6.4, z);
          roadGroup.add(head);

          // Purple point light from streetlamp
          const pt = new THREE.PointLight(0xaa44ff, 2.5, 20, 1.8);
          pt.position.set(x + (x > 0 ? -0.8 : 0.8), 5.8, z);
          roadGroup.add(pt);
        });
      }

      roadGroup.position.set(...cfg.center);
      roadGroup.rotation.y = cfg.rotY;
      this.group.add(roadGroup);

      // Register road collider in physics
      const box = new THREE.Box3(
        new THREE.Vector3(
          cfg.center[0] - (cfg.rotY === 0 || cfg.rotY === Math.PI ? cfg.w : cfg.l) / 2,
          0,
          cfg.center[2] - (cfg.rotY === 0 || cfg.rotY === Math.PI ? cfg.l : cfg.w) / 2
        ),
        new THREE.Vector3(
          cfg.center[0] + (cfg.rotY === 0 || cfg.rotY === Math.PI ? cfg.w : cfg.l) / 2,
          0.25,
          cfg.center[2] + (cfg.rotY === 0 || cfg.rotY === Math.PI ? cfg.l : cfg.w) / 2
        )
      );
      this.physics.addCollider(box);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 1B. SECONDARY URBAN ELEMENTS (Sparse, Non-Cluttered Realism)
  // ═══════════════════════════════════════════════════════════════

  createSecondaryUrbanElements() {
    const urbanGroup = new THREE.Group();

    // 1. Four Secondary Cross Connector Roads (forming a subtle inner perimeter ring)
    // Connecting diagonal quadrants between cardinal roads at ~45m offset
    const secRoadMat = new THREE.MeshStandardMaterial({
      color: 0x090514,
      roughness: 0.18,
      metalness: 0.55
    });

    const crossLinks = [
      { start: [38, 0.015, -38], rot: Math.PI / 4, len: 44 },   // NE quadrant
      { start: [38, 0.015, 38], rot: -Math.PI / 4, len: 44 },   // SE quadrant
      { start: [-38, 0.015, 38], rot: Math.PI / 4, len: 44 },   // SW quadrant
      { start: [-38, 0.015, -38], rot: -Math.PI / 4, len: 44 }  // NW quadrant
    ];

    crossLinks.forEach(cl => {
      const linkGeo = new THREE.PlaneGeometry(8, cl.len);
      const link = new THREE.Mesh(linkGeo, secRoadMat);
      link.rotation.x = -Math.PI / 2;
      link.rotation.z = cl.rot;
      link.position.set(...cl.start);
      link.receiveShadow = true;
      urbanGroup.add(link);

      // Faint cyan road markings
      const dashGeo = new THREE.PlaneGeometry(0.2, cl.len * 0.7);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.35 });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = cl.rot;
      dash.position.set(cl.start[0], 0.02, cl.start[2]);
      urbanGroup.add(dash);
    });

    // 2. Futuristic Low-Rise Storefronts / Outposts (spaced generously in the 4 quadrants)
    const storefrontConfigs = [
      { pos: [38, 0, -22], rot: Math.PI / 4, name: 'CYBER-DEPOT 01', neon: 0x00f5d4 },
      { pos: [22, 0, 38], rot: -Math.PI / 3, name: 'SYNTH-BAR EX', neon: 0xd946ef },
      { pos: [-38, 0, 24], rot: Math.PI / 6, name: 'NEXUS TERMINAL STORE', neon: 0x38bdf8 },
      { pos: [-24, 0, -38], rot: -Math.PI / 4, name: 'SIGNAL RELAY HUB', neon: 0xffb703 }
    ];

    storefrontConfigs.forEach(sf => {
      const shop = new THREE.Group();
      shop.position.set(...sf.pos);
      shop.rotation.y = sf.rot;

      // Base Structure (6m wide, 4.5m tall, 5m deep)
      const bodyGeo = new THREE.BoxGeometry(6.5, 4.5, 5.2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x141226,
        roughness: 0.3,
        metalness: 0.8
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 2.25;
      body.castShadow = true;
      body.receiveShadow = true;
      shop.add(body);

      // Glass Display Window
      const glassGeo = new THREE.PlaneGeometry(4.8, 2.4);
      const glassMat = new THREE.MeshStandardMaterial({
        color: sf.neon,
        emissive: new THREE.Color(sf.neon),
        emissiveIntensity: 1.6,
        transparent: true,
        opacity: 0.85
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 1.8, 2.65);
      shop.add(glass);

      // Roof Neon Header Sign
      const signGeo = new THREE.BoxGeometry(5.2, 0.6, 0.2);
      const signMat = new THREE.MeshStandardMaterial({
        color: sf.neon,
        emissive: new THREE.Color(sf.neon),
        emissiveIntensity: 2.2
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 4.8, 2.4);
      shop.add(sign);

      // Storefront Ambient Glow
      const shopLight = new THREE.PointLight(sf.neon, 3.5, 12, 1.8);
      shopLight.position.set(0, 3.0, 3.6);
      shop.add(shopLight);

      urbanGroup.add(shop);

      // Solid physics collider for storefront
      const shopCollider = new THREE.Box3(
        new THREE.Vector3(sf.pos[0] - 3.5, 0, sf.pos[2] - 3.5),
        new THREE.Vector3(sf.pos[0] + 3.5, 5.0, sf.pos[2] + 3.5)
      );
      this.physics.addCollider(shopCollider);
    });

    // 3. Parked Futuristic Aerocars along sidewalks (3 sparse, high-detail vehicles)
    const parkedCars = [
      { pos: [9.5, 0.15, -42], rot: 0, color: 0x00f5d4 },
      { pos: [-9.5, 0.15, 48], rot: Math.PI, color: 0xf43f5e },
      { pos: [52, 0.15, 9.5], rot: Math.PI / 2, color: 0xa855f7 }
    ];

    parkedCars.forEach(pc => {
      const carGroup = new THREE.Group();
      carGroup.position.set(...pc.pos);
      carGroup.rotation.y = pc.rot;

      // Chassis
      const chassisGeo = new THREE.BoxGeometry(2.1, 0.65, 4.6);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.15
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.45;
      carGroup.add(chassis);

      // Aerodynamic Cabin Roof
      const cabinGeo = new THREE.BoxGeometry(1.65, 0.55, 2.5);
      const cabinMat = new THREE.MeshStandardMaterial({
        color: pc.color,
        emissive: new THREE.Color(pc.color),
        emissiveIntensity: 0.6,
        roughness: 0.1,
        transparent: true,
        opacity: 0.75
      });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 0.95, -0.3);
      carGroup.add(cabin);

      // Tail & Headlight neon strips
      const headGeo = new THREE.PlaneGeometry(1.6, 0.12);
      const headMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 0.5, -2.31);
      head.rotation.y = Math.PI;
      carGroup.add(head);

      const tailGeo = new THREE.PlaneGeometry(1.6, 0.12);
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.position.set(0, 0.5, 2.31);
      carGroup.add(tail);

      urbanGroup.add(carGroup);

      // Car collider
      const carCollider = new THREE.Box3(
        new THREE.Vector3(pc.pos[0] - 1.2, 0, pc.pos[2] - 2.4),
        new THREE.Vector3(pc.pos[0] + 1.2, 1.6, pc.pos[2] + 2.4)
      );
      this.physics.addCollider(carCollider);
    });

    // 4. Urban Foliage Planters (Glowing cyber-foliage in geometric plazas)
    const planterSpots = [
      [12, 0, -18], [-12, 0, -18], [12, 0, 18], [-12, 0, 18],
      [18, 0, -12], [-18, 0, -12], [18, 0, 12], [-18, 0, 12]
    ];

    const planterGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.7, 8);
    const planterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const cyberFoliageGeo = new THREE.ConeGeometry(1.1, 2.4, 6);
    const cyberFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.7,
      roughness: 0.4
    });

    planterSpots.forEach(pt => {
      const pMesh = new THREE.Mesh(planterGeo, planterMat);
      pMesh.position.set(pt[0], 0.35, pt[2]);
      urbanGroup.add(pMesh);

      const fMesh = new THREE.Mesh(cyberFoliageGeo, cyberFoliageMat);
      fMesh.position.set(pt[0], 1.6, pt[2]);
      urbanGroup.add(fMesh);
    });

    this.group.add(urbanGroup);
  }

  // ═══════════════════════════════════════════════════════════════
  // 1C. ELEVATED FUTURISTIC METRO SYSTEM (Looping around 4 towers)
  // ═══════════════════════════════════════════════════════════════

  createElevatedMetroSystem() {
    const metroGroup = new THREE.Group();
    const trackRadius = this.trainTrackRadius; // 160m
    const trackHeight = 18.5; // Elevated above street structures

    // 1. Elevated Continuous Ring Track (Twin floating rails)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x222634,
      metalness: 0.85,
      roughness: 0.2
    });

    const railGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00b4d8,
      emissiveIntensity: 1.5
    });

    // Outer & Inner Rail Tubes
    [-1.2, 1.2].forEach(offset => {
      const railGeo = new THREE.TorusGeometry(trackRadius + offset, 0.28, 12, 128);
      const railMesh = new THREE.Mesh(railGeo, railMat);
      railMesh.rotation.x = Math.PI / 2;
      railMesh.position.y = trackHeight;
      metroGroup.add(railMesh);
    });

    // Central Maglev Power Strip
    const maglevGeo = new THREE.TorusGeometry(trackRadius, 0.16, 8, 128);
    const maglevMesh = new THREE.Mesh(maglevGeo, railGlowMat);
    maglevMesh.rotation.x = Math.PI / 2;
    maglevMesh.position.y = trackHeight + 0.1;
    metroGroup.add(maglevMesh);

    // 2. Track Support Pylons (every 22.5 degrees = 16 pylons)
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x161a29,
      metalness: 0.7,
      roughness: 0.35
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const px = Math.cos(angle) * trackRadius;
      const pz = Math.sin(angle) * trackRadius;

      // Vertical T-Pylon
      const colGeo = new THREE.CylinderGeometry(0.8, 1.2, trackHeight, 8);
      const col = new THREE.Mesh(colGeo, pylonMat);
      col.position.set(px, trackHeight / 2, pz);
      metroGroup.add(col);

      // T-Arm Crossbeam
      const armGeo = new THREE.BoxGeometry(4.2, 0.8, 1.4);
      const arm = new THREE.Mesh(armGeo, pylonMat);
      arm.position.set(px, trackHeight - 0.4, pz);
      arm.rotation.y = angle;
      metroGroup.add(arm);

      // Pylon Warning Strobe Light
      const strobeGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const strobeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
      const strobe = new THREE.Mesh(strobeGeo, strobeMat);
      strobe.position.set(px, trackHeight + 0.3, pz);
      metroGroup.add(strobe);
    }

    // 3. Futuristic 3-Car Streamlined Maglev Train
    this.train = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      metalness: 0.9,
      roughness: 0.1
    });

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 2.2
    });

    // Build 3 linked train cars
    const carOffsets = [-9.5, 0, 9.5];
    carOffsets.forEach((zOffset, index) => {
      const carGroup = new THREE.Group();
      carGroup.position.z = zOffset;

      // Streamlined Bullet Body
      const carBodyGeo = new THREE.BoxGeometry(3.2, 2.2, 8.5);
      const carBody = new THREE.Mesh(carBodyGeo, trainMat);
      carBody.position.y = 1.35;
      carGroup.add(carBody);

      // Illuminated Window Strips on both sides
      [-1.62, 1.62].forEach(xSide => {
        const winGeo = new THREE.PlaneGeometry(7.2, 0.65);
        const win = new THREE.Mesh(winGeo, windowMat);
        win.position.set(xSide, 1.5, 0);
        win.rotation.y = xSide > 0 ? Math.PI / 2 : -Math.PI / 2;
        carGroup.add(win);
      });

      // Front Headlights on lead car
      if (index === 2) {
        const headGeo = new THREE.ConeGeometry(0.6, 1.5, 12);
        const headLightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const hl = new THREE.Mesh(headGeo, headLightMat);
        hl.rotation.x = Math.PI / 2;
        hl.position.set(0, 1.1, 4.3);
        carGroup.add(hl);

        const pointHl = new THREE.PointLight(0x38bdf8, 4.5, 25, 2);
        pointHl.position.set(0, 1.2, 5.0);
        carGroup.add(pointHl);
      }

      this.train.add(carGroup);
    });

    // Position initial train on track
    this.train.position.set(trackRadius, trackHeight + 0.3, 0);
    metroGroup.add(this.train);

    this.group.add(metroGroup);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 2. CENTRAL ENERGY CORE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  createCentralEnergyCore() {
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.25, 0);

    // Elevated Core Dais
    const daisGeo = new THREE.CylinderGeometry(8.5, 9.2, 0.8, 32);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.6,
      roughness: 0.3
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = 0.4;
    coreGroup.add(dais);

    // Steps leading up to dais
    const stepGeo = new THREE.CylinderGeometry(10.5, 11.2, 0.4, 32);
    const step = new THREE.Mesh(stepGeo, daisMat);
    step.position.y = 0.2;
    coreGroup.add(step);

    // Glowing Central Reactor Sphere / Crystal â€” PURPLE NEON
    const coreCrystalGeo = new THREE.IcosahedronGeometry(2.4, 2);
    this.coreCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xaa00ff,
      emissive: 0x8800cc,
      emissiveIntensity: 1.2,
      roughness: 0.05,
      metalness: 0.95,
      wireframe: false
    });
    this.coreCrystal = new THREE.Mesh(coreCrystalGeo, this.coreCrystalMat);
    this.coreCrystal.position.y = 3.6;
    coreGroup.add(this.coreCrystal);

    // 3 Concentric Floating Energy Rings â€” purple/magenta
    const ringRadii = [3.8, 5.0, 6.2];
    ringRadii.forEach((rad, idx) => {
      const ringGeo = new THREE.TorusGeometry(rad, 0.12, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xcc44ff,
        emissive: 0x9900dd,
        emissiveIntensity: 1.0,
        metalness: 0.8,
        roughness: 0.15
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 3.6;
      ringMesh.rotation.x = Math.PI / (idx + 2);
      ringMesh.rotation.y = (idx * Math.PI) / 3;
      coreGroup.add(ringMesh);
      this.coreRings.push(ringMesh);
    });

    // Core Point Light â€” purple
    this.coreLight = new THREE.PointLight(0xcc44ff, 8.0, 55, 1.6);
    this.coreLight.position.y = 4.0;
    coreGroup.add(this.coreLight);

    // Vertical Beam (initially hidden/scale 0) - Neon Magenta/Violet Pillar
    const beamGeo = new THREE.CylinderGeometry(1.5, 3.2, 450, 24, 1, true);
    this.beamMat = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.verticalBeam = new THREE.Mesh(beamGeo, this.beamMat);
    this.verticalBeam.position.y = 225;
    coreGroup.add(this.verticalBeam);

    this.group.add(coreGroup);

    // Register dais obstacle collider
    const coreBox = new THREE.Box3(
      new THREE.Vector3(-9.5, 0, -9.5),
      new THREE.Vector3(9.5, 1.2, 9.5)
    );
    this.physics.addCollider(coreBox);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 3. ENTRANCE TERMINAL PODS (At End of Each Road)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  createEntranceTerminals() {
    const terminals = [
      { id: 'signal',  pos: [0, 0.25, -92],   label: 'SIGNAL TOWER TERMINAL', rotY: 0 },
      { id: 'reactor', pos: [92, 0.25, 0],    label: 'REACTOR TERMINAL',      rotY: -Math.PI / 2 },
      { id: 'archive', pos: [0, 0.25, 92],    label: 'ARCHIVE TERMINAL',      rotY: Math.PI },
      { id: 'nexus',   pos: [-92, 0.25, 0],   label: 'NEXUS TERMINAL',        rotY: Math.PI / 2 }
    ];

    terminals.forEach(t => {
      const termGroup = new THREE.Group();
      termGroup.position.set(...t.pos);
      termGroup.rotation.y = t.rotY;

      // Pedestal base
      const baseGeo = new THREE.CylinderGeometry(0.9, 1.2, 1.1, 8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e2638,
        metalness: 0.7,
        roughness: 0.3
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.55;
      base.castShadow = true;
      termGroup.add(base);

      // Angled Holographic Terminal Screen
      const screenGeo = new THREE.BoxGeometry(1.2, 0.7, 0.1);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x050a14,
        emissive: 0x00aacc,
        emissiveIntensity: 0.9,
        roughness: 0.1
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 1.25, 0.15);
      screen.rotation.x = -Math.PI / 4;
      termGroup.add(screen);

      // Status Beacon on top
      const beaconGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x00ccff,
        emissive: 0x0088cc,
        emissiveIntensity: 1.5
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 1.7, 0);
      termGroup.add(beacon);

      // Localized terminal light
      const termLight = new THREE.PointLight(0x00ccff, 3.5, 12, 1.8);
      termLight.position.set(0, 1.8, 0.4);
      termGroup.add(termLight);

      termGroup.userData = { id: t.id, isTerminal: true, label: t.label };
      this.terminalMeshes[t.id] = { group: termGroup, beaconMat, screenMat, termLight };
      this.group.add(termGroup);

      // Register collider for terminal pod
      const podBox = new THREE.Box3(
        new THREE.Vector3(t.pos[0] - 1.2, 0, t.pos[2] - 1.2),
        new THREE.Vector3(t.pos[0] + 1.2, 2.0, t.pos[2] + 1.2)
      );
      this.physics.addCollider(podBox);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER: Procedural Window Grid
  // ═══════════════════════════════════════════════════════════════

  createWindowGrid(parent, opts) {
    const { width, height, startY = 0, faceDepth = 0, cols, rows, axis = 'z', side = 1,
      colors = [0x9933ff, 0xcc44ff, 0xff66cc, 0x6633ff, 0x44aaff, 0xee22ff],
      density = 0.65, emissiveIntensity = 2.0 } = opts;
    const cellW = width / cols;
    const cellH = height / rows;
    const winW = cellW * 0.52;
    const winH = cellH * 0.48;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (Math.random() > density) continue;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const geo = new THREE.PlaneGeometry(winW, winH);
        const mat = new THREE.MeshStandardMaterial({
          color, emissive: new THREE.Color(color),
          emissiveIntensity: emissiveIntensity * (0.5 + Math.random() * 0.9),
          roughness: 0.0, transparent: true, opacity: 0.9
        });
        const mesh = new THREE.Mesh(geo, mat);
        const localX = -width / 2 + cellW * (c + 0.5);
        const localY = startY + cellH * (r + 0.5);
        if (axis === 'z') {
          mesh.position.set(localX, localY, side * (faceDepth + 0.06));
          if (side < 0) mesh.rotation.y = Math.PI;
        } else {
          mesh.position.set(side * (faceDepth + 0.06), localY, localX);
          mesh.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        parent.add(mesh);
      }
    }
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 4. THE FOUR SKYSCRAPERS (Iconic & Visually Distinct)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  async createFourSkyscrapers() {
    // â”€â”€ TOWER 01: THE SIGNAL TOWER (North: [0, 0, -115]) â”€â”€
    await this.buildSignalTower();

    // â”€â”€ TOWER 02: THE REACTOR (East: [115, 0, 0]) â”€â”€
    await this.buildReactorTower();

    // â”€â”€ TOWER 03: THE ARCHIVE (South: [0, 0, 115]) â”€â”€
    await this.buildArchiveTower();

    // â”€â”€ TOWER 04: THE NEXUS (West: [-115, 0, 0]) â”€â”€
    await this.buildNexusTower();
  }

  async buildSignalTower() {
    const pos = new THREE.Vector3(0, 0, -118);
    const towerGroup = new THREE.Group();
    towerGroup.position.copy(pos);

    // Primary Skyscraper Model (tall, sleek, vertical communications landmark)
    try {
      const model = await loadModel('/assets_library/city_pack/Skyscraper.glb', {
        position: new THREE.Vector3(0, 0, 0),
        scale: 3.8,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.35,
        emissiveColor: new THREE.Color(0x0077aa)
      });
      towerGroup.add(model);
    } catch (e) {
      console.warn('Fallback Signal tower body', e);
    }

    // Bespoke Architectural Spire & Antenna Disks Crown (Height up to 148m)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      metalness: 0.8,
      roughness: 0.25
    });

    const signalGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x0066cc,
      emissiveIntensity: 1.2
    });
    this.towerMaterials['signal'] = signalGlowMat;

    // Transmission Lattice Spire
    const mastGeo = new THREE.CylinderGeometry(0.4, 1.8, 38, 8);
    const mast = new THREE.Mesh(mastGeo, crownMat);
    mast.position.y = 125;
    towerGroup.add(mast);

    // 3 Floating Signal Rings on Spire
    [118, 126, 134].forEach((y, i) => {
      const diskGeo = new THREE.TorusGeometry(3.5 - i * 0.8, 0.25, 8, 32);
      const disk = new THREE.Mesh(diskGeo, signalGlowMat);
      disk.rotation.x = Math.PI / 2;
      disk.position.y = y;
      towerGroup.add(disk);
    });

    // Top Pulsing Beacon
    const beaconGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const beacon = new THREE.Mesh(beaconGeo, signalGlowMat);
    beacon.position.y = 145;
    towerGroup.add(beacon);


    // ── WINDOW GRIDS — purple/cyan neon lit windows ──────────
    // These simulate the window light pattern seen in reference images
    // The Signal Tower (cyan/blue windows on front/back faces)
    const signalWinColors = [0x00eeee, 0x0088ff, 0x4499ff, 0x0055cc, 0x00ccff];
    // Front/back face windows (z-axis): width ~28m, height ~100m from y=5 to y=105
    this.createWindowGrid(towerGroup, { width: 28, height: 95, startY: 5, faceDepth: 14, cols: 8, rows: 24, axis: 'z', side: 1,  colors: signalWinColors, density: 0.68 });
    this.createWindowGrid(towerGroup, { width: 28, height: 95, startY: 5, faceDepth: 14, cols: 8, rows: 24, axis: 'z', side: -1, colors: signalWinColors, density: 0.55 });
    // Side face windows (x-axis)
    this.createWindowGrid(towerGroup, { width: 28, height: 95, startY: 5, faceDepth: 14, cols: 6, rows: 24, axis: 'x', side: 1,  colors: signalWinColors, density: 0.5 });
    this.createWindowGrid(towerGroup, { width: 28, height: 95, startY: 5, faceDepth: 14, cols: 6, rows: 24, axis: 'x', side: -1, colors: signalWinColors, density: 0.5 });

    this.group.add(towerGroup);

    // Register solid obstacle collider
    const box = new THREE.Box3(
      new THREE.Vector3(-14, 0, -132),
      new THREE.Vector3(14, 150, -104)
    );
    this.physics.addCollider(box);
  }

  async buildReactorTower() {
    const pos = new THREE.Vector3(118, 0, 0);
    const towerGroup = new THREE.Group();
    towerGroup.position.copy(pos);

    // Heavy Industrial Dual-Column Reactor Structure - Illuminated Turquoise & Steel
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x1a3848,
      metalness: 0.8,
      roughness: 0.25
    });

    const reactorGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00b4d8,
      emissiveIntensity: 1.2
    });
    this.towerMaterials['reactor'] = reactorGlowMat;

    // Twin Reactor Cylinders (Height 120m, Radius 9m)
    [-11, 11].forEach(zOff => {
      const colGeo = new THREE.CylinderGeometry(8.5, 9.5, 110, 32);
      const col = new THREE.Mesh(colGeo, columnMat);
      col.position.set(0, 55, zOff);
      col.castShadow = true;
      col.receiveShadow = true;
      towerGroup.add(col);

      // Glowing Magnetic Ring Braces (Cyan/Teal with Amber Accents)
      [20, 40, 60, 80, 100].forEach((y, idx) => {
        const ringColor = idx % 2 === 0 ? 0x00f5d4 : 0xffb703;
        const braceGeo = new THREE.TorusGeometry(9.6, 0.4, 12, 32);
        const braceMat = new THREE.MeshStandardMaterial({
          color: ringColor,
          emissive: new THREE.Color(ringColor),
          emissiveIntensity: 1.4
        });
        const brace = new THREE.Mesh(braceGeo, braceMat);
        brace.rotation.x = Math.PI / 2;
        brace.position.set(0, y, zOff);
        towerGroup.add(brace);
      });

      // Vertical illuminated conduits along reactor cylinders
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        const condGeo = new THREE.BoxGeometry(0.3, 108, 0.3);
        const condMat = new THREE.MeshStandardMaterial({
          color: 0x00b4d8,
          emissive: 0x0077b6,
          emissiveIntensity: 1.5
        });
        const cond = new THREE.Mesh(condGeo, condMat);
        cond.position.set(Math.cos(a) * 9.2, 55, zOff + Math.sin(a) * 9.2);
        towerGroup.add(cond);
      }
    });

    // Central Energy Transfer Hub between twin cylinders
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x0e2433,
      metalness: 0.85,
      roughness: 0.2
    });
    const hubGeo = new THREE.BoxGeometry(16, 80, 16);
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 48, 0);
    towerGroup.add(hub);

    // Glowing vertical core strip along transfer hub
    const stripGeo = new THREE.PlaneGeometry(2.5, 78);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      emissive: 0x00f5d4,
      emissiveIntensity: 2.2,
      side: THREE.DoubleSide
    });
    [-8.05, 8.05].forEach(x => {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(x, 48, 0);
      strip.rotation.y = Math.PI / 2;
      towerGroup.add(strip);
    });

    // Giant Exposed Reactor Turbine Core (Rotating turbine visual)
    const turbineGeo = new THREE.CylinderGeometry(6, 6, 18, 16);
    const turbine = new THREE.Mesh(turbineGeo, reactorGlowMat);
    turbine.rotation.z = Math.PI / 2;
    turbine.position.set(0, 95, 0);
    towerGroup.add(turbine);

    // ── REACTOR TOWER WINDOW GRIDS — Electric Blue, Cyan, Teal, Turquoise, and controlled Amber ───────
    const reactorWinColors = [0x00f5d4, 0x00b4d8, 0x90e0ef, 0x48cae4, 0xffb703, 0xfb8500];
    // Twin cylinder front faces
    this.createWindowGrid(towerGroup, { width: 17, height: 90, startY: 2, faceDepth: 11, cols: 5, rows: 22, axis: 'z', side: 1,  colors: reactorWinColors, density: 0.75, emissiveIntensity: 2.4 });
    this.createWindowGrid(towerGroup, { width: 17, height: 90, startY: 2, faceDepth: 11, cols: 5, rows: 22, axis: 'z', side: -1, colors: reactorWinColors, density: 0.65, emissiveIntensity: 2.4 });
    this.createWindowGrid(towerGroup, { width: 17, height: 70, startY: 2, faceDepth: 11, cols: 4, rows: 18, axis: 'x', side: 1,  colors: reactorWinColors, density: 0.6, emissiveIntensity: 2.4 });
    this.createWindowGrid(towerGroup, { width: 17, height: 70, startY: 2, faceDepth: 11, cols: 4, rows: 18, axis: 'x', side: -1, colors: reactorWinColors, density: 0.6, emissiveIntensity: 2.4 });

    this.group.add(towerGroup);

    // Solid Collider
    const box = new THREE.Box3(
      new THREE.Vector3(104, 0, -22),
      new THREE.Vector3(132, 130, 22)
    );
    this.physics.addCollider(box);
  }

  async buildArchiveTower() {
    const pos = new THREE.Vector3(0, 0, 118);
    const towerGroup = new THREE.Group();
    towerGroup.position.copy(pos);

    // Monolithic Data-Vault Skyscraper
    try {
      const model = await loadModel('/ref_images/Skyscraper by Poly by Google - dIsZyy2FUY-.glb', {
        position: new THREE.Vector3(0, 0, 0),
        scale: 3.6,
        surfaceY: 0.0,
        cyberpunkOverride: true,
        emissiveIntensity: 0.35,
        emissiveColor: new THREE.Color(0x0055aa)
      });
      towerGroup.add(model);
    } catch (e) {
      console.warn('Fallback Archive tower body', e);
    }

    // Monolithic Vault Parapet & Server Data Streams
    const archiveGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    });
    this.towerMaterials['archive'] = archiveGlowMat;

    // Vertical Fiber-Optic Server Traces
    const traceGeo = new THREE.BoxGeometry(0.35, 105, 0.35);
    [-8, -4, 0, 4, 8].forEach(x => {
      const trace = new THREE.Mesh(traceGeo, archiveGlowMat);
      trace.position.set(x, 55, -11.5);
      towerGroup.add(trace);
    });

    // Vault Data Crown
    const crownGeo = new THREE.BoxGeometry(22, 12, 22);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x1a2233, metalness: 0.8 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 115, 0);
    towerGroup.add(crown);


    // ── ARCHIVE TOWER WINDOW GRIDS — blue/cyan neon ──────────
    const archiveWinColors = [0x0088ff, 0x0044cc, 0x44aaff, 0x0066ff, 0x2255dd];
    this.createWindowGrid(towerGroup, { width: 24, height: 100, startY: 2, faceDepth: 11, cols: 7, rows: 26, axis: 'z', side: 1,  colors: archiveWinColors, density: 0.70 });
    this.createWindowGrid(towerGroup, { width: 24, height: 100, startY: 2, faceDepth: 11, cols: 7, rows: 26, axis: 'z', side: -1, colors: archiveWinColors, density: 0.60 });
    this.createWindowGrid(towerGroup, { width: 24, height: 100, startY: 2, faceDepth: 11, cols: 5, rows: 26, axis: 'x', side: 1,  colors: archiveWinColors, density: 0.5 });
    this.createWindowGrid(towerGroup, { width: 24, height: 100, startY: 2, faceDepth: 11, cols: 5, rows: 26, axis: 'x', side: -1, colors: archiveWinColors, density: 0.5 });

    this.group.add(towerGroup);

    // Collider
    const box = new THREE.Box3(
      new THREE.Vector3(-14, 0, 104),
      new THREE.Vector3(14, 140, 132)
    );
    this.physics.addCollider(box);
  }

  async buildNexusTower() {
    const pos = new THREE.Vector3(-118, 0, 0);
    const towerGroup = new THREE.Group();
    towerGroup.position.copy(pos);

    // Multi-Tiered Geometric Hub Tower - Indigo, Turquoise, Cool White & Restrained Magenta
    const nexusMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b, // Deep indigo base
      metalness: 0.8,
      roughness: 0.25
    });

    const nexusGlowMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf, // Vibrant turquoise
      emissive: 0x0f766e,
      emissiveIntensity: 1.2
    });
    this.towerMaterials['nexus'] = nexusGlowMat;

    // Tier 1 Base (40m)
    const t1Geo = new THREE.BoxGeometry(26, 40, 26);
    const t1 = new THREE.Mesh(t1Geo, nexusMat);
    t1.position.y = 20;
    t1.castShadow = true;
    towerGroup.add(t1);

    // Tier 2 Mid (45m)
    const t2Geo = new THREE.BoxGeometry(19, 45, 19);
    const t2 = new THREE.Mesh(t2Geo, nexusMat);
    t2.position.y = 62.5;
    t2.castShadow = true;
    towerGroup.add(t2);

    // Tier 3 High Spire (50m)
    const t3Geo = new THREE.BoxGeometry(12, 50, 12);
    const t3 = new THREE.Mesh(t3Geo, nexusMat);
    t3.position.y = 110;
    t3.castShadow = true;
    towerGroup.add(t3);

    // Structural Accent Frames (Cool White & Turquoise)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
      metalness: 0.9,
      roughness: 0.15
    });
    [20, 62.5, 110].forEach((y, i) => {
      const edgeBoxGeo = new THREE.BoxGeometry(26 - i * 7 + 0.6, 1.2, 26 - i * 7 + 0.6);
      const edgeMesh = new THREE.Mesh(edgeBoxGeo, frameMat);
      edgeMesh.position.y = y;
      towerGroup.add(edgeMesh);
    });

    // Cantilevered Hub Rings & Skybridge Nodes (Turquoise, Cool White, and Subtle Magenta)
    const ringColors = [0x2dd4bf, 0xe0f2fe, 0xf43f5e];
    [38, 82, 128].forEach((y, i) => {
      const ringGeo = new THREE.TorusGeometry(15 - i * 3, 0.45, 12, 32);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: ringColors[i % ringColors.length],
        emissive: new THREE.Color(ringColors[i % ringColors.length]),
        emissiveIntensity: 1.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      towerGroup.add(ring);
    });

    // ── NEXUS TOWER WINDOW GRIDS — Indigo, Turquoise, Cool White & Restrained Magenta ───────
    const nexusWinColors = [0x2dd4bf, 0x14b8a6, 0x38bdf8, 0xf8fafc, 0xe879f9];
    // Tier 1 windows (26m wide box, 40m tall)
    this.createWindowGrid(towerGroup, { width: 26, height: 36, startY: 1, faceDepth: 13, cols: 7, rows: 10, axis: 'z', side: 1,  colors: nexusWinColors, density: 0.72, emissiveIntensity: 2.3 });
    this.createWindowGrid(towerGroup, { width: 26, height: 36, startY: 1, faceDepth: 13, cols: 7, rows: 10, axis: 'z', side: -1, colors: nexusWinColors, density: 0.62, emissiveIntensity: 2.3 });
    this.createWindowGrid(towerGroup, { width: 26, height: 36, startY: 1, faceDepth: 13, cols: 5, rows: 10, axis: 'x', side: 1,  colors: nexusWinColors, density: 0.58, emissiveIntensity: 2.3 });
    this.createWindowGrid(towerGroup, { width: 26, height: 36, startY: 1, faceDepth: 13, cols: 5, rows: 10, axis: 'x', side: -1, colors: nexusWinColors, density: 0.58, emissiveIntensity: 2.3 });
    // Tier 2 windows (19m wide, 45m, starts at y=40)
    this.createWindowGrid(towerGroup, { width: 19, height: 42, startY: 41, faceDepth: 9.5, cols: 5, rows: 11, axis: 'z', side: 1,  colors: nexusWinColors, density: 0.68, emissiveIntensity: 2.3 });
    this.createWindowGrid(towerGroup, { width: 19, height: 42, startY: 41, faceDepth: 9.5, cols: 5, rows: 11, axis: 'z', side: -1, colors: nexusWinColors, density: 0.58, emissiveIntensity: 2.3 });
    // Tier 3 (12m wide, 50m, starts at y=85)
    this.createWindowGrid(towerGroup, { width: 12, height: 48, startY: 85, faceDepth: 6, cols: 3, rows: 13, axis: 'z', side: 1,  colors: nexusWinColors, density: 0.62, emissiveIntensity: 2.3 });
    this.createWindowGrid(towerGroup, { width: 12, height: 48, startY: 85, faceDepth: 6, cols: 3, rows: 13, axis: 'z', side: -1, colors: nexusWinColors, density: 0.55, emissiveIntensity: 2.3 });

    this.group.add(towerGroup);

    // Collider
    const box = new THREE.Box3(
      new THREE.Vector3(-132, 0, -15),
      new THREE.Vector3(-104, 145, 15)
    );
    this.physics.addCollider(box);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 5. MINIMAL DISTANT SKYLINE BACKDROP
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  createMinimalSkylineBackdrop() {
    // Distant futuristic skyline with illuminated purple/cyan/magenta windows
    const backdropGroup = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({
      color: 0x090514,
      roughness: 0.6,
      metalness: 0.4
    });

    const backdropColors = [0xa855f7, 0xd946ef, 0x06b6d4, 0x3b82f6, 0xec4899];

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 270 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const h = 60 + Math.random() * 110;
      const w = 16 + Math.random() * 16;
      const d = 16 + Math.random() * 16;

      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, bldgMat);
      mesh.position.set(x, h / 2, z);
      backdropGroup.add(mesh);

      // Add a billboard/roof antenna beacon to some distant towers
      if (Math.random() > 0.4) {
        const beaconGeo = new THREE.SphereGeometry(1.2, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: backdropColors[i % backdropColors.length]
        });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x, h + 2, z);
        backdropGroup.add(beacon);
      }

      // Distant window panels (low detail planes)
      if (Math.random() > 0.3) {
        const winGeo = new THREE.PlaneGeometry(w * 0.7, h * 0.6);
        const winMat = new THREE.MeshBasicMaterial({
          color: backdropColors[i % backdropColors.length],
          transparent: true,
          opacity: 0.35 + Math.random() * 0.35
        });
        const winMesh = new THREE.Mesh(winGeo, winMat);
        // Face toward center
        winMesh.position.set(x, h * 0.45, z);
        winMesh.lookAt(0, h * 0.45, 0);
        winMesh.translateZ(d * 0.5 + 0.1);
        backdropGroup.add(winMesh);
      }
    }

    this.group.add(backdropGroup);
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PROGRESSION & PUZZLE COMPLETION HOOKS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  unlockTower(buildingId) {
    this.towerStates[buildingId] = true;

    // 1. Illuminate road energy conduit
    if (this.conduitMaterials[buildingId]) {
      const mat = this.conduitMaterials[buildingId];
      mat.emissive.setHex(0xd946ef); // Radiant magenta-purple
      mat.emissiveIntensity = 2.8;
    }

    // 2. Illuminate terminal beacon to electric violet/emerald success
    if (this.terminalMeshes[buildingId]) {
      const t = this.terminalMeshes[buildingId];
      t.beaconMat.emissive.setHex(0xa855f7);
      t.beaconMat.emissiveIntensity = 3.0;
      t.screenMat.emissive.setHex(0xa855f7);
      t.termLight.color.setHex(0xc084fc);
      t.termLight.intensity = 5.5;
    }

    // 3. Brighten Tower architectural lights
    if (this.towerMaterials[buildingId]) {
      this.towerMaterials[buildingId].emissiveIntensity = 2.5;
    }

    // 4. Increase central crystal energy intensity
    const completedCount = Object.values(this.towerStates).filter(Boolean).length;
    this.coreCrystalMat.emissiveIntensity = 0.8 + completedCount * 0.6;
    this.coreLight.intensity = 6.0 + completedCount * 3.0;

    // Spawn animated traveling energy pulse along road
    this.spawnRoadPulse(buildingId);
  }

  spawnRoadPulse(buildingId) {
    const pulseGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.95
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.set(0, 0.4, 0);
    this.scene.add(pulse);

    const targetPos = {
      signal: new THREE.Vector3(0, 0.4, -95),
      reactor: new THREE.Vector3(95, 0.4, 0),
      archive: new THREE.Vector3(0, 0.4, 95),
      nexus: new THREE.Vector3(-95, 0.4, 0)
    }[buildingId];

    this.roadEnergyPulses.push({
      mesh: pulse,
      start: new THREE.Vector3(0, 0.4, 0),
      target: targetPos,
      progress: 0,
      speed: 0.8
    });
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // 6. FINAL CITY ACTIVATION SEQUENCE
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

  triggerFinalActivation() {
    this.isFullyActivated = true;

    // Erupt vertical central beam
    if (this.beamMat) {
      this.beamMat.opacity = 0.85;
    }

    // Boost core light
    if (this.coreLight) {
      this.coreLight.intensity = 35.0;
      this.coreLight.distance = 180;
    }

    // Elevate all tower lights to blazing futuristic glory
    Object.values(this.towerMaterials).forEach(mat => {
      mat.emissiveIntensity = 4.0;
    });

    // Launch celebratory 3D fireworks above the 4 towers!
    this.launchFireworks();
  }

  launchFireworks() {
    const towerPositions = [
      new THREE.Vector3(0, 140, -118),
      new THREE.Vector3(118, 120, 0),
      new THREE.Vector3(0, 130, 118),
      new THREE.Vector3(-118, 135, 0)
    ];

    const colors = [0x00ffff, 0xffaa00, 0x34d399, 0xa855f7, 0xff0066];

    // Create 12 bursting fireworks
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const origin = towerPositions[i % towerPositions.length].clone();
        origin.x += (Math.random() - 0.5) * 30;
        origin.z += (Math.random() - 0.5) * 30;
        origin.y += Math.random() * 20;

        const pCount = 180;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let j = 0; j < pCount; j++) {
          positions[j * 3]     = origin.x;
          positions[j * 3 + 1] = origin.y;
          positions[j * 3 + 2] = origin.z;

          // Spherical velocity burst
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = 15 + Math.random() * 25;

          velocities.push(new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.sin(phi) * Math.sin(theta) * speed,
            Math.cos(phi) * speed
          ));
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
          color: colors[i % colors.length],
          size: 1.8,
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending
        });

        const points = new THREE.Points(geo, mat);
        this.scene.add(points);

        this.fireworks.push({ points, velocities, life: 1.0 });
      }, i * 400);
    }
  }

  update(delta) {
    // 1. Rotate floating core rings
    const ringSpeed = this.isFullyActivated ? 4.5 : 0.8;
    this.coreRings.forEach((ring, i) => {
      ring.rotation.z += (i % 2 === 0 ? 1 : -1) * ringSpeed * delta * (1 + i * 0.4);
    });

    // 1B. Animate Elevated Maglev Train along circular perimeter track
    if (this.train) {
      this.trainAngle += this.trainSpeed * delta;
      if (this.trainAngle > Math.PI * 2) this.trainAngle -= Math.PI * 2;

      const tx = Math.cos(this.trainAngle) * this.trainTrackRadius;
      const tz = Math.sin(this.trainAngle) * this.trainTrackRadius;
      this.train.position.x = tx;
      this.train.position.z = tz;
      // Rotate train tangent to track circle
      this.train.rotation.y = -this.trainAngle + Math.PI / 2;
    }

    if (this.coreCrystal) {
      this.coreCrystal.rotation.y += (this.isFullyActivated ? 3.0 : 0.5) * delta;
      this.coreCrystal.rotation.x += (this.isFullyActivated ? 1.5 : 0.2) * delta;
    }

    // 2. Pulse beam in final activation
    if (this.isFullyActivated && this.verticalBeam) {
      this.verticalBeam.rotation.y += 0.4 * delta;
      const pulse = 0.75 + Math.sin(performance.now() * 0.006) * 0.15;
      this.beamMat.opacity = pulse;
    }

    // 3. Update traveling energy pulses
    for (let i = this.roadEnergyPulses.length - 1; i >= 0; i--) {
      const p = this.roadEnergyPulses[i];
      p.progress += p.speed * delta;
      p.mesh.position.lerpVectors(p.start, p.target, Math.min(p.progress, 1.0));

      if (p.progress >= 1.0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.roadEnergyPulses.splice(i, 1);
      }
    }

    // 4. Update fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.life -= delta * 0.65;
      fw.points.material.opacity = Math.max(0, fw.life);

      const pos = fw.points.geometry.attributes.position.array;
      for (let j = 0; j < fw.velocities.length; j++) {
        const vel = fw.velocities[j];
        pos[j * 3]     += vel.x * delta;
        pos[j * 3 + 1] += vel.y * delta - 9.8 * delta * delta; // Gravity
        pos[j * 3 + 2] += vel.z * delta;
      }
      fw.points.geometry.attributes.position.needsUpdate = true;

      if (fw.life <= 0) {
        this.scene.remove(fw.points);
        fw.points.geometry.dispose();
        fw.points.material.dispose();
        this.fireworks.splice(i, 1);
      }
    }
  }
}

