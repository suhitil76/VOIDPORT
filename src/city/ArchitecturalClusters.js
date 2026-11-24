import * as THREE from 'three';

/**
 * ArchitecturalClusters
 * Constructs four architecturally distinct building clusters around the Core plaza:
 * 1. Cyber-Brutalist Monolith with 14m Cantilever & Structural Buttresses (NW)
 * 2. High-Tech Curved Diagrid Spire with Recessed Sky-Garden (NE)
 * 3. Twin Towers with Elevated Traversable Glass Skybridge & Helipad (SE)
 * 4. Modular Industrial Habitation with External Fire Escapes & Air Ducts (SW)
 *
 * Includes rooftop machinery and physics collision hulls.
 */
export class ArchitecturalClusters {
  constructor(materials, physics) {
    this.materials = materials;
    this.physics = physics;
    this.group = new THREE.Group();
    this.group.name = 'ArchitecturalClusters';

    this.buildBrutalistCantilever();
    this.buildHighTechDiagrid();
    this.buildSkybridgeTwinTowers();
    this.buildModularHabitation();
  }

  // =========================================================================
  // 1. CYBER-BRUTALIST MONOLITH (North-West: X: -58, Z: -58)
  // =========================================================================
  buildBrutalistCantilever() {
    const bGroup = new THREE.Group();
    bGroup.position.set(-58, 0, -58);

    // Lower Main Body (0 - 52m)
    const lowerGeo = new THREE.BoxGeometry(28, 52, 28);
    const lowerMesh = new THREE.Mesh(lowerGeo, this.materials.brutalistConcrete);
    lowerMesh.position.y = 26;
    lowerMesh.castShadow = true;
    lowerMesh.receiveShadow = true;
    bGroup.add(lowerMesh);

    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(-58 - 14, 0, -58 - 14),
        new THREE.Vector3(-58 + 14, 52, -58 + 14)
      )
    );

    // Recessed vertical slit windows
    const slitGeo = new THREE.BoxGeometry(24, 44, 26);
    const slitMesh = new THREE.Mesh(slitGeo, this.materials.glassFacade);
    slitMesh.position.y = 26;
    bGroup.add(slitMesh);

    // Asymmetric Massive Cantilever Block (52m - 98m, jutting 14m forward toward the avenue)
    const cantGeo = new THREE.BoxGeometry(32, 46, 42);
    const cantMesh = new THREE.Mesh(cantGeo, this.materials.brutalistConcrete);
    cantMesh.position.set(0, 75, 7.0); // 14m forward cantilever offset
    cantMesh.castShadow = true;
    cantMesh.receiveShadow = true;
    bGroup.add(cantMesh);

    // Heavy diagonal exposed steel buttresses supporting the cantilever underside
    const buttressGeo = new THREE.CylinderGeometry(0.85, 0.85, 22, 8);
    for (let xOff of [-12, 12]) {
      const truss = new THREE.Mesh(buttressGeo, this.materials.darkMetal);
      truss.position.set(xOff, 46, 17);
      truss.rotation.x = -Math.PI / 4.2;
      truss.castShadow = true;
      bGroup.add(truss);
    }

    // Horizontal visor glass strips on the cantilever facade
    for (let i = 0; i < 5; i++) {
      const visorGeo = new THREE.BoxGeometry(28, 2.6, 0.8);
      const visorMesh = new THREE.Mesh(visorGeo, this.materials.glassFacade);
      visorMesh.position.set(0, 62 + i * 7.5, 28.1);
      bGroup.add(visorMesh);
    }

    // Rooftop Machinery
    this.addCoolingPlant(bGroup, 0, 98, 7.0);
    this.addWaterTower(bGroup, -10, 98, 0);
    this.addCommMast(bGroup, 10, 98, 14, 20);

    this.group.add(bGroup);
  }

  // =========================================================================
  // 2. HIGH-TECH CURVED DIAGRID SPIRE (North-East: X: 58, Z: -58)
  // =========================================================================
  buildHighTechDiagrid() {
    const bGroup = new THREE.Group();
    bGroup.position.set(58, 0, -58);
    const towerH = 112;

    // Curved Aerodynamic Main Body
    const bodyGeo = new THREE.CylinderGeometry(15.5, 17.5, towerH, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.glassFacade);
    bodyMesh.position.y = towerH / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bGroup.add(bodyMesh);

    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(58 - 16, 0, -58 - 16),
        new THREE.Vector3(58 + 16, towerH, -58 + 16)
      )
    );

    // External Diagrid Exoskeleton Trusses
    const diagridGeo = new THREE.CylinderGeometry(15.8, 17.8, towerH, 16, 14, true);
    const diagridMat = new THREE.MeshStandardMaterial({
      color: 0x161c24,
      roughness: 0.35,
      metalness: 0.9,
      wireframe: true
    });
    const diagridMesh = new THREE.Mesh(diagridGeo, diagridMat);
    diagridMesh.position.y = towerH / 2;
    bGroup.add(diagridMesh);

    // Recessed Sky-Garden Terrace cutout at 54m - 66m
    const terraceFloorGeo = new THREE.CylinderGeometry(17, 17, 1.4, 16);
    const terraceFloor = new THREE.Mesh(terraceFloorGeo, this.materials.darkMetal);
    terraceFloor.position.y = 54;
    terraceFloor.castShadow = true;
    bGroup.add(terraceFloor);

    const terraceRoof = terraceFloor.clone();
    terraceRoof.position.y = 66;
    bGroup.add(terraceRoof);

    // Internal structural support columns inside the open sky-garden
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const colGeo = new THREE.CylinderGeometry(0.7, 0.7, 11, 8);
      const col = new THREE.Mesh(colGeo, this.materials.darkMetal);
      col.position.set(Math.cos(angle) * 12, 60, Math.sin(angle) * 12);
      bGroup.add(col);
    }

    // Slanted Photovoltaic / Louver Crown
    const crownGeo = new THREE.CylinderGeometry(7.5, 15.5, 14, 16);
    const crownMesh = new THREE.Mesh(crownGeo, this.materials.darkMetal);
    crownMesh.position.y = towerH + 7;
    crownMesh.castShadow = true;
    bGroup.add(crownMesh);

    this.addCommMast(bGroup, 0, towerH + 14, 0, 24);

    this.group.add(bGroup);
  }

  // =========================================================================
  // 3. TWIN TOWERS WITH ELEVATED SKYBRIDGE (South-East: X: 48, Z: 58 & X: 78, Z: 58)
  // =========================================================================
  buildSkybridgeTwinTowers() {
    const bGroup = new THREE.Group();

    // --- Tower A (West Tower: X: 48, Z: 58, Height: 88m) ---
    const towerAGeo = new THREE.BoxGeometry(20, 88, 24);
    const towerAMesh = new THREE.Mesh(towerAGeo, this.materials.industrialFacade);
    towerAMesh.position.set(48, 44, 58);
    towerAMesh.castShadow = true;
    towerAMesh.receiveShadow = true;
    bGroup.add(towerAMesh);

    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(48 - 10, 0, 58 - 12),
        new THREE.Vector3(48 + 10, 88, 58 + 12)
      )
    );

    // External Glass Elevator Hoistway on Tower A
    const hoistGeo = new THREE.BoxGeometry(4.0, 88, 4.5);
    const hoistMesh = new THREE.Mesh(hoistGeo, this.materials.glassFacade);
    hoistMesh.position.set(37.5, 44, 58);
    bGroup.add(hoistMesh);

    // Rooftop Helipad on Tower A
    const padBaseGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.8, 16);
    const padBase = new THREE.Mesh(padBaseGeo, this.materials.brutalistConcrete);
    padBase.position.set(48, 88.4, 58);
    bGroup.add(padBase);

    const padRingGeo = new THREE.RingGeometry(5.8, 6.5, 16);
    padRingGeo.rotateX(-Math.PI / 2);
    const padRing = new THREE.Mesh(padRingGeo, this.materials.roadMarking);
    padRing.position.set(48, 88.85, 58);
    bGroup.add(padRing);

    // Perimeter helipad safety lights
    for (let h = 0; h < 8; h++) {
      const hAngle = (h / 8) * Math.PI * 2;
      const hLight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), this.materials.amberBeacon);
      hLight.position.set(48 + Math.cos(hAngle) * 8.2, 88.9, 58 + Math.sin(hAngle) * 8.2);
      bGroup.add(hLight);
    }

    // --- Tower B (East Tower: X: 78, Z: 58, Height: 72m) ---
    const towerBGeo = new THREE.BoxGeometry(18, 72, 22);
    const towerBMesh = new THREE.Mesh(towerBGeo, this.materials.glassFacade);
    towerBMesh.position.set(78, 36, 58);
    towerBMesh.castShadow = true;
    towerBMesh.receiveShadow = true;
    bGroup.add(towerBMesh);

    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(78 - 9, 0, 58 - 11),
        new THREE.Vector3(78 + 9, 72, 58 + 11)
      )
    );

    this.addCoolingPlant(bGroup, 78, 72, 58);

    // --- ELEVATED SUSPENDED SKYBRIDGE (Spanning 30m across at 48m height) ---
    const bridgeSpan = 30;
    const bridgeCenterX = 63;
    const bridgeY = 48;
    const bridgeZ = 58;

    // Bridge enclosure body
    const bridgeBodyGeo = new THREE.BoxGeometry(bridgeSpan, 5.8, 6.5);
    const bridgeBody = new THREE.Mesh(bridgeBodyGeo, this.materials.darkMetal);
    bridgeBody.position.set(bridgeCenterX, bridgeY, bridgeZ);
    bridgeBody.castShadow = true;
    bridgeBody.receiveShadow = true;
    bGroup.add(bridgeBody);

    // Continuous glass observation strip
    const winStripGeo = new THREE.BoxGeometry(bridgeSpan - 2, 3.2, 6.6);
    const winStrip = new THREE.Mesh(winStripGeo, this.materials.glassFacade);
    winStrip.position.set(bridgeCenterX, bridgeY, bridgeZ);
    bGroup.add(winStrip);

    // Diagonal suspension arch trusses underneath
    const underArchGeo = new THREE.CylinderGeometry(0.4, 0.4, 20, 8);
    for (let zOff of [-2.8, 2.8]) {
      const leftStay = new THREE.Mesh(underArchGeo, this.materials.darkMetal);
      leftStay.position.set(53, bridgeY - 3.4, bridgeZ + zOff);
      leftStay.rotation.z = Math.PI / 4;
      bGroup.add(leftStay);

      const rightStay = new THREE.Mesh(underArchGeo, this.materials.darkMetal);
      rightStay.position.set(73, bridgeY - 3.4, bridgeZ + zOff);
      rightStay.rotation.z = -Math.PI / 4;
      bGroup.add(rightStay);
    }

    this.group.add(bGroup);
  }

  // =========================================================================
  // 4. MODULAR INDUSTRIAL HABITATION (South-West: X: -60, Z: 55)
  // =========================================================================
  buildModularHabitation() {
    const bGroup = new THREE.Group();
    bGroup.position.set(-60, 0, 55);

    // Staggered interlocking cubic residential modules (68m height)
    const modules = [
      { w: 26, h: 24, d: 26, x: 0, y: 12, z: 0 },
      { w: 22, h: 22, d: 28, x: 2, y: 35, z: 1 },
      { w: 20, h: 22, d: 22, x: -2, y: 57, z: -2 }
    ];

    modules.forEach((cfg) => {
      const modGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const modMesh = new THREE.Mesh(modGeo, this.materials.industrialFacade);
      modMesh.position.set(cfg.x, cfg.y, cfg.z);
      modMesh.castShadow = true;
      modMesh.receiveShadow = true;
      bGroup.add(modMesh);

      // Recessed balcony alcoves
      const alcoveGeo = new THREE.BoxGeometry(cfg.w - 6, 2.6, 2.2);
      const alcoveMesh = new THREE.Mesh(alcoveGeo, this.materials.darkMetal);
      alcoveMesh.position.set(cfg.x, cfg.y, cfg.z + cfg.d / 2 - 0.2);
      bGroup.add(alcoveMesh);
    });

    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(-60 - 13, 0, 55 - 13),
        new THREE.Vector3(-60 + 13, 68, 55 + 13)
      )
    );

    // External heavy air-handling ventilation ductwork rising up exterior wall
    const ductGeo = new THREE.CylinderGeometry(0.75, 0.75, 62, 8);
    const duct = new THREE.Mesh(ductGeo, this.materials.rooftopProps);
    duct.position.set(12.5, 31, -4);
    duct.castShadow = true;
    bGroup.add(duct);

    // Zigzagging external steel fire-escape stairs
    for (let f = 0; f < 6; f++) {
      const gantryY = 12 + f * 9;
      const platformGeo = new THREE.BoxGeometry(2.8, 0.4, 6.5);
      const platform = new THREE.Mesh(platformGeo, this.materials.darkMetal);
      platform.position.set(-14, gantryY, 0);
      bGroup.add(platform);

      const stairGeo = new THREE.CylinderGeometry(0.12, 0.12, 10.2, 6);
      stairGeo.rotateZ(Math.PI / 4.8);
      const stair = new THREE.Mesh(stairGeo, this.materials.darkMetal);
      stair.position.set(-14, gantryY + 4.8, 0);
      bGroup.add(stair);
    }

    this.addWaterTower(bGroup, 0, 68, 0);
    this.addCoolingPlant(bGroup, -4, 68, -4);

    this.group.add(bGroup);
  }

  // =========================================================================
  // ROOFTOP MACHINERY
  // =========================================================================
  addCoolingPlant(parent, x, y, z) {
    const unitGroup = new THREE.Group();
    unitGroup.position.set(x, y, z);

    // Chiller enclosure
    const boxGeo = new THREE.BoxGeometry(7.5, 2.8, 3.8);
    const box = new THREE.Mesh(boxGeo, this.materials.rooftopProps);
    box.position.y = 1.4;
    box.castShadow = true;
    unitGroup.add(box);

    // Two top exhaust fan cowls
    for (let fx of [-2.0, 2.0]) {
      const fanGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.5, 12);
      const fan = new THREE.Mesh(fanGeo, this.materials.darkMetal);
      fan.position.set(fx, 3.0, 0);
      unitGroup.add(fan);
    }

    parent.add(unitGroup);
  }

  addWaterTower(parent, x, y, z) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(x, y, z);

    // Steel support legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.2, 6);
    for (let dx of [-1.4, 1.4]) {
      for (let dz of [-1.4, 1.4]) {
        const leg = new THREE.Mesh(legGeo, this.materials.darkMetal);
        leg.position.set(dx, 2.1, dz);
        towerGroup.add(leg);
      }
    }

    // Cylindrical reservoir tank
    const tankGeo = new THREE.CylinderGeometry(2.0, 2.0, 3.2, 12);
    const tank = new THREE.Mesh(tankGeo, this.materials.rooftopProps);
    tank.position.y = 5.2;
    tank.castShadow = true;
    towerGroup.add(tank);

    // Conical roof
    const roofGeo = new THREE.ConeGeometry(2.2, 1.2, 12);
    const roof = new THREE.Mesh(roofGeo, this.materials.darkMetal);
    roof.position.y = 7.3;
    towerGroup.add(roof);

    parent.add(towerGroup);
  }

  addCommMast(parent, x, y, z, height = 18) {
    const mastGeo = new THREE.CylinderGeometry(0.15, 0.5, height, 8);
    mastGeo.translate(0, height / 2, 0);
    const mast = new THREE.Mesh(mastGeo, this.materials.darkMetal);
    mast.position.set(x, y, z);
    mast.castShadow = true;
    parent.add(mast);

    // Warning tip beacon
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this.materials.amberBeacon);
    beacon.position.set(x, y + height, z);
    parent.add(beacon);
  }
}
