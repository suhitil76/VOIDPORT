import * as THREE from 'three';

/**
 * SurroundingBuildings
 * Constructs 6 architecturally distinct buildings surrounding the central landmark:
 * 1. Cyber-Brutalist Monolith with massive asymmetric cantilever & corner buttresses.
 * 2. High-Tech Glass Diagrid Tower with curved corners & recessed sky-garden terrace.
 * 3 & 4. Twin Towers connected by an Elevated Architectural Skybridge (48m elevation).
 * 5. Modular Industrial Habitation Complex with external fire escapes & ventilation pipes.
 * 6. Stepped Terraced Mega-Block with ground-level elevated colonnade pylons.
 *
 * Includes rooftop infrastructure: HVAC chiller units, water tanks, satellite dishes, antennas.
 */
export class SurroundingBuildings {
  constructor(materials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'SurroundingBuildings';

    this.buildBrutalistCantilever();
    this.buildHighTechDiagrid();
    this.buildSkybridgeTwinTowers();
    this.buildModularHabitation();
    this.buildSteppedTerracedBlock();
  }

  // =========================================================================
  // 1. CYBER-BRUTALIST MONOLITH (North-West: X: -58, Z: -58)
  // =========================================================================
  buildBrutalistCantilever() {
    const bGroup = new THREE.Group();
    bGroup.position.set(-58, 0, -58);

    // Lower Main Body (0 - 58m)
    const lowerGeo = new THREE.BoxGeometry(26, 58, 26);
    const lowerMesh = new THREE.Mesh(lowerGeo, this.materials.brutalistConcrete);
    lowerMesh.position.y = 29;
    lowerMesh.castShadow = true;
    lowerMesh.receiveShadow = true;
    bGroup.add(lowerMesh);

    // Recessed vertical slit window embrasures
    const slitGeo = new THREE.BoxGeometry(22, 50, 24);
    const slitMesh = new THREE.Mesh(slitGeo, this.materials.glassFacade);
    slitMesh.position.y = 29;
    bGroup.add(slitMesh);

    // Asymmetric Massive Cantilever Block (58m - 94m, jutting 9m forward toward the avenue)
    const cantGeo = new THREE.BoxGeometry(28, 36, 35);
    const cantMesh = new THREE.Mesh(cantGeo, this.materials.brutalistConcrete);
    cantMesh.position.set(0, 76, 4.5); // Center offset creates 9m cantilever overhang
    cantMesh.castShadow = true;
    cantMesh.receiveShadow = true;
    bGroup.add(cantMesh);

    // Heavy diagonal exposed steel buttresses supporting the cantilever underside
    const buttressGeo = new THREE.CylinderGeometry(0.7, 0.7, 18, 8);
    for (let xOff of [-11, 11]) {
      const truss = new THREE.Mesh(buttressGeo, this.materials.darkMetal);
      truss.position.set(xOff, 51, 14);
      truss.rotation.x = -Math.PI / 4;
      truss.castShadow = true;
      bGroup.add(truss);
    }

    // Heavy horizontal visor slits on the cantilever face
    for (let i = 0; i < 4; i++) {
      const visorGeo = new THREE.BoxGeometry(24, 2.2, 0.6);
      const visorMesh = new THREE.Mesh(visorGeo, this.materials.glassFacade);
      visorMesh.position.set(0, 66 + i * 7, 22.2);
      bGroup.add(visorMesh);
    }

    // Rooftop Mechanical Infrastructure
    this.addRooftopHVAC(bGroup, 0, 94, 4.5, 3);
    this.addWaterTower(bGroup, -8, 94, 0);
    this.addCommMast(bGroup, 8, 94, 12, 16);

    this.group.add(bGroup);
  }

  // =========================================================================
  // 2. HIGH-TECH DIAGRID GLASS TOWER (North-East: X: 58, Z: -58)
  // =========================================================================
  buildHighTechDiagrid() {
    const bGroup = new THREE.Group();
    bGroup.position.set(58, 0, -58);
    const towerH = 106;

    // Curved Aerodynamic Main Body
    const bodyGeo = new THREE.CylinderGeometry(15, 16, towerH, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.glassFacade);
    bodyMesh.position.y = towerH / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bGroup.add(bodyMesh);

    // External Diagrid Exoskeleton Trusses
    const diagridGeo = new THREE.CylinderGeometry(15.2, 16.2, towerH, 16, 12, true);
    const diagridMat = new THREE.MeshStandardMaterial({
      color: 0x181e26,
      roughness: 0.35,
      metalness: 0.9,
      wireframe: true
    });
    const diagridMesh = new THREE.Mesh(diagridGeo, diagridMat);
    diagridMesh.position.y = towerH / 2;
    bGroup.add(diagridMesh);

    // Recessed Sky-Garden Terrace cutout at 52m - 62m
    const terraceFloorGeo = new THREE.CylinderGeometry(16, 16, 1.2, 16);
    const terraceFloor = new THREE.Mesh(terraceFloorGeo, this.materials.darkMetal);
    terraceFloor.position.y = 52;
    terraceFloor.castShadow = true;
    bGroup.add(terraceFloor);

    const terraceRoof = terraceFloor.clone();
    terraceRoof.position.y = 62;
    bGroup.add(terraceRoof);

    // Interior structural columns inside the open sky-garden
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const colGeo = new THREE.CylinderGeometry(0.6, 0.6, 9.6, 8);
      const colMesh = new THREE.Mesh(colGeo, this.materials.darkMetal);
      colMesh.position.set(Math.cos(angle) * 11, 57, Math.sin(angle) * 11);
      bGroup.add(colMesh);
    }

    // Slanted Solar / Glass Louver Crown
    const crownGeo = new THREE.CylinderGeometry(7, 14.8, 12, 16);
    const crownMesh = new THREE.Mesh(crownGeo, this.materials.darkMetal);
    crownMesh.position.y = towerH + 6;
    crownMesh.castShadow = true;
    bGroup.add(crownMesh);

    // Rooftop Antenna
    this.addCommMast(bGroup, 0, towerH + 12, 0, 22);

    this.group.add(bGroup);
  }

  // =========================================================================
  // 3 & 4. TWIN TOWERS WITH ELEVATED ARCHITECTURAL SKYBRIDGE (South-East: X: 48, Z: 58 & X: 78, Z: 58)
  // =========================================================================
  buildSkybridgeTwinTowers() {
    const bGroup = new THREE.Group();

    // --- Tower A (West Tower: X: 46, Z: 58, Height: 84m) ---
    const towerAGeo = new THREE.BoxGeometry(18, 84, 22);
    const towerAMesh = new THREE.Mesh(towerAGeo, this.materials.industrialFacade);
    towerAMesh.position.set(46, 42, 58);
    towerAMesh.castShadow = true;
    towerAMesh.receiveShadow = true;
    bGroup.add(towerAMesh);

    // Exterior vertical elevator shaft on Tower A
    const shaftGeo = new THREE.BoxGeometry(3.5, 84, 4.0);
    const shaftMesh = new THREE.Mesh(shaftGeo, this.materials.darkMetal);
    shaftMesh.position.set(36.5, 42, 58);
    shaftMesh.castShadow = true;
    bGroup.add(shaftMesh);

    // Rooftop Helipad on Tower A
    const padBaseGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.8, 16);
    const padBase = new THREE.Mesh(padBaseGeo, this.materials.brutalistConcrete);
    padBase.position.set(46, 84.4, 58);
    padBase.receiveShadow = true;
    bGroup.add(padBase);

    const padRingGeo = new THREE.RingGeometry(5.2, 5.8, 16);
    padRingGeo.rotateX(-Math.PI / 2);
    const padRing = new THREE.Mesh(padRingGeo, this.materials.roadMarking);
    padRing.position.set(46, 84.85, 58);
    bGroup.add(padRing);

    // --- Tower B (East Tower: X: 76, Z: 58, Height: 70m) ---
    const towerBGeo = new THREE.BoxGeometry(16, 70, 20);
    const towerBMesh = new THREE.Mesh(towerBGeo, this.materials.glassFacade);
    towerBMesh.position.set(76, 35, 58);
    towerBMesh.castShadow = true;
    towerBMesh.receiveShadow = true;
    bGroup.add(towerBMesh);

    this.addRooftopHVAC(bGroup, 76, 70, 58, 2);
    this.addWaterTower(bGroup, 78, 70, 63);

    // --- THE ELEVATED SKYBRIDGE (Spanning X: 46 to X: 76 at Y: 48m) ---
    const bridgeSpan = 30; // 30 meters clear span
    const bridgeCenterX = 61;
    const bridgeY = 48;
    const bridgeZ = 58;

    // 1. Enclosed bridge tube body (Glass & Metal)
    const bridgeBodyGeo = new THREE.BoxGeometry(bridgeSpan, 5.5, 6.0);
    const bridgeBodyMesh = new THREE.Mesh(bridgeBodyGeo, this.materials.darkMetal);
    bridgeBodyMesh.position.set(bridgeCenterX, bridgeY, bridgeZ);
    bridgeBodyMesh.castShadow = true;
    bridgeBodyMesh.receiveShadow = true;
    bGroup.add(bridgeBodyMesh);

    // 2. Continuous horizontal ribbon windows on both sides of skybridge
    const windowStripGeo = new THREE.BoxGeometry(bridgeSpan - 2, 2.8, 6.1);
    const windowStripMesh = new THREE.Mesh(windowStripGeo, this.materials.glassFacade);
    windowStripMesh.position.set(bridgeCenterX, bridgeY, bridgeZ);
    bGroup.add(windowStripMesh);

    // 3. Exposed structural under-slung diagonal truss support arches
    const underTrussGeo = new THREE.CylinderGeometry(0.35, 0.35, 18, 8);
    for (let zOff of [-2.6, 2.6]) {
      // Left diagonal stay
      const leftStay = new THREE.Mesh(underTrussGeo, this.materials.darkMetal);
      leftStay.position.set(51, bridgeY - 3.2, bridgeZ + zOff);
      leftStay.rotation.z = Math.PI / 4;
      bGroup.add(leftStay);

      // Right diagonal stay
      const rightStay = new THREE.Mesh(underTrussGeo, this.materials.darkMetal);
      rightStay.position.set(71, bridgeY - 3.2, bridgeZ + zOff);
      rightStay.rotation.z = -Math.PI / 4;
      bGroup.add(rightStay);
    }

    this.group.add(bGroup);
  }

  // =========================================================================
  // 5. MODULAR INDUSTRIAL HABITATION COMPLEX (South-West: X: -60, Z: 55)
  // =========================================================================
  buildModularHabitation() {
    const bGroup = new THREE.Group();
    bGroup.position.set(-60, 0, 55);

    // Staggered interlocking cubic residential modules (64m high total)
    const moduleConfigs = [
      { w: 24, h: 22, d: 24, x: 0, y: 11, z: 0 },
      { w: 20, h: 20, d: 26, x: 2, y: 32, z: 1 },
      { w: 18, h: 22, d: 20, x: -2, y: 53, z: -2 }
    ];

    moduleConfigs.forEach((cfg) => {
      const modGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const modMesh = new THREE.Mesh(modGeo, this.materials.industrialFacade);
      modMesh.position.set(cfg.x, cfg.y, cfg.z);
      modMesh.castShadow = true;
      modMesh.receiveShadow = true;
      bGroup.add(modMesh);

      // Recessed balcony alcoves on front facade
      const alcoveGeo = new THREE.BoxGeometry(cfg.w - 6, 2.4, 2.0);
      const alcoveMesh = new THREE.Mesh(alcoveGeo, this.materials.darkMetal);
      alcoveMesh.position.set(cfg.x, cfg.y, cfg.z + cfg.d / 2 - 0.2);
      bGroup.add(alcoveMesh);
    });

    // Prominent External Industrial Air-Handling Ventilation Ducts
    const ductGeo = new THREE.CylinderGeometry(0.65, 0.65, 58, 8);
    const ductMesh = new THREE.Mesh(ductGeo, this.materials.rooftopProps);
    ductMesh.position.set(11.5, 30, -5);
    ductMesh.castShadow = true;
    bGroup.add(ductMesh);

    // External zigzagging fire-escape gantry stairs on lateral wall
    for (let f = 0; f < 5; f++) {
      const gantryY = 12 + f * 9;
      const gantryGeo = new THREE.BoxGeometry(2.5, 0.4, 6.0);
      const gantryMesh = new THREE.Mesh(gantryGeo, this.materials.darkMetal);
      gantryMesh.position.set(-13, gantryY, 0);
      bGroup.add(gantryMesh);

      const stairGeo = new THREE.CylinderGeometry(0.12, 0.12, 9.8, 6);
      stairGeo.rotateZ(Math.PI / 5);
      const stairMesh = new THREE.Mesh(stairGeo, this.materials.darkMetal);
      stairMesh.position.set(-13, gantryY + 4.5, 0);
      bGroup.add(stairMesh);
    }

    // Rooftop water storage & ventilation
    this.addWaterTower(bGroup, 0, 64, 0);
    this.addRooftopHVAC(bGroup, -4, 64, -4, 2);

    this.group.add(bGroup);
  }

  // =========================================================================
  // 6. STEPPED TERRACED MEGA-BLOCK WITH COLONNADE (North-West flank: X: -60, Z: -15)
  // =========================================================================
  buildSteppedTerracedBlock() {
    const bGroup = new THREE.Group();
    bGroup.position.set(-60, 0, -15);

    // Ground Colonnade: Building elevated on 8m structural concrete pylons
    const pylonGeo = new THREE.BoxGeometry(1.6, 8, 1.6);
    const pylonPositions = [
      { x: -9, z: -9 }, { x: 9, z: -9 },
      { x: -9, z: 9 }, { x: 9, z: 9 },
      { x: 0, z: -9 }, { x: 0, z: 9 }
    ];
    pylonPositions.forEach((pos) => {
      const pylonMesh = new THREE.Mesh(pylonGeo, this.materials.brutalistConcrete);
      pylonMesh.position.set(pos.x, 4, pos.z);
      pylonMesh.castShadow = true;
      pylonMesh.receiveShadow = true;
      bGroup.add(pylonMesh);
    });

    // Tier 1 (8m - 32m)
    const t1Geo = new THREE.BoxGeometry(24, 24, 24);
    const t1Mesh = new THREE.Mesh(t1Geo, this.materials.brutalistConcrete);
    t1Mesh.position.y = 20;
    t1Mesh.castShadow = true;
    t1Mesh.receiveShadow = true;
    bGroup.add(t1Mesh);

    // Tier 2 Setback (32m - 54m)
    const t2Geo = new THREE.BoxGeometry(18, 22, 18);
    const t2Mesh = new THREE.Mesh(t2Geo, this.materials.glassFacade);
    t2Mesh.position.y = 43;
    t2Mesh.castShadow = true;
    t2Mesh.receiveShadow = true;
    bGroup.add(t2Mesh);

    // Tier 3 Setback (54m - 74m)
    const t3Geo = new THREE.BoxGeometry(12, 20, 12);
    const t3Mesh = new THREE.Mesh(t3Geo, this.materials.darkMetal);
    t3Mesh.position.y = 64;
    t3Mesh.castShadow = true;
    t3Mesh.receiveShadow = true;
    bGroup.add(t3Mesh);

    // Mechanical components on terrace steps
    this.addRooftopHVAC(bGroup, 8, 32, 0, 2);
    this.addCommMast(bGroup, 0, 74, 0, 14);

    this.group.add(bGroup);
  }

  // =========================================================================
  // ROOFTOP MECHANICAL INFRASTRUCTURE HELPERS
  // =========================================================================
  addRooftopHVAC(parent, x, y, z, count = 2) {
    const hvacGeo = new THREE.BoxGeometry(3.2, 2.2, 2.6);
    const fanGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 12);
    fanGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < count; i++) {
      const hvacMesh = new THREE.Mesh(hvacGeo, this.materials.rooftopProps);
      const fanMesh = new THREE.Mesh(fanGeo, this.materials.darkMetal);
      fanMesh.position.set(0, 1.2, 0);
      fanMesh.rotation.x = Math.PI / 2;

      const unit = new THREE.Group();
      unit.add(hvacMesh, fanMesh);
      unit.position.set(x + (i - (count - 1) / 2) * 4.2, y + 1.1, z);
      unit.castShadow = true;
      parent.add(unit);
    }
  }

  addWaterTower(parent, x, y, z) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(x, y, z);

    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 6);
    legGeo.rotateZ(0.1);
    for (let dx of [-1.2, 1.2]) {
      for (let dz of [-1.2, 1.2]) {
        const leg = new THREE.Mesh(legGeo, this.materials.darkMetal);
        leg.position.set(dx, 1.9, dz);
        towerGroup.add(leg);
      }
    }

    // Wooden / corrugated tank cylinder
    const tankGeo = new THREE.CylinderGeometry(1.8, 1.8, 2.8, 12);
    const tankMesh = new THREE.Mesh(tankGeo, this.materials.rooftopProps);
    tankMesh.position.y = 4.8;
    tankMesh.castShadow = true;
    towerGroup.add(tankMesh);

    // Conical cap
    const capGeo = new THREE.ConeGeometry(2.0, 1.0, 12);
    const capMesh = new THREE.Mesh(capGeo, this.materials.darkMetal);
    capMesh.position.y = 6.6;
    towerGroup.add(capMesh);

    parent.add(towerGroup);
  }

  addCommMast(parent, x, y, z, height = 15) {
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.45, height, 8);
    mastGeo.translate(0, height / 2, 0);
    const mastMesh = new THREE.Mesh(mastGeo, this.materials.darkMetal);
    mastMesh.position.set(x, y, z);
    mastMesh.castShadow = true;
    parent.add(mastMesh);

    // Cross bars
    for (let c = 0; c < 3; c++) {
      const barGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2 - c * 0.6, 6);
      barGeo.rotateZ(Math.PI / 2);
      const barMesh = new THREE.Mesh(barGeo, this.materials.darkMetal);
      barMesh.position.set(x, y + height * (0.45 + c * 0.2), z);
      parent.add(barMesh);
    }

    // Aviation red tip beacon
    const beaconGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const beaconMesh = new THREE.Mesh(beaconGeo, this.materials.amberBeacon);
    beaconMesh.position.set(x, y + height, z);
    parent.add(beaconMesh);
  }
}
