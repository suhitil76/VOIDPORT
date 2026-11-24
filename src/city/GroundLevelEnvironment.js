import * as THREE from 'three';

/**
 * GroundLevelEnvironment
 * High-density ground-level infrastructure for first-person exploration:
 * - Multi-lane asphalt avenues with curbs, drainage grates, and crosswalks
 * - Long-exposure neon light trail ribbons down the avenue (matching Reference Image 1)
 * - Physical energy conduit trunks embedded in the ground connecting the Substation to the Spire
 * - Street furniture: bollards, crash barriers, pedestrian signal masts, transformer cabinets
 * - Detailed street-level building entrance lobbies with canopies
 * - Collision registration for the physics character controller
 */
export class GroundLevelEnvironment {
  constructor(materials, physics) {
    this.materials = materials;
    this.physics = physics;
    this.group = new THREE.Group();
    this.group.name = 'GroundLevelEnvironment';

    this.conduitMaterials = [];
    this.lightTrails = [];

    this.buildRoadsAndSidewalks();
    this.buildNeonLightTrails();
    this.buildEnergyConduits();
    this.buildStreetFurniture();
    this.buildBuildingEntrances();
  }

  buildRoadsAndSidewalks() {
    const swMat = this.materials.sidewalk;
    const roadMat = this.materials.wetRoad;
    const curbHeight = 0.28;

    // 1. Base Road Surface (280m x 280m)
    const roadGeo = new THREE.PlaneGeometry(280, 280, 32, 32);
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.0;
    roadMesh.receiveShadow = true;
    this.group.add(roadMesh);

    // 2. Central Plaza Hexagonal Island (elevated curb platform)
    const plazaGeo = new THREE.CylinderGeometry(24, 25, curbHeight, 8);
    const plazaMesh = new THREE.Mesh(plazaGeo, swMat);
    plazaMesh.position.set(0, curbHeight / 2, 0);
    plazaMesh.receiveShadow = true;
    plazaMesh.castShadow = true;
    this.group.add(plazaMesh);

    // Register plaza as walkable collider
    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(-24, 0, -24),
        new THREE.Vector3(24, curbHeight, 24)
      )
    );

    // Inner decorative titanium ground ring
    const ringGeo = new THREE.RingGeometry(14, 18, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.darkMetal);
    ringMesh.position.set(0, curbHeight + 0.01, 0);
    ringMesh.receiveShadow = true;
    this.group.add(ringMesh);

    // 3. Elevated Sidewalk Blocks in 4 Quadrants
    const sidewalkThickness = curbHeight;
    const quadrants = [
      { minX: 16, maxX: 120, minZ: 16, maxZ: 120 },
      { minX: -120, maxX: -16, minZ: 16, maxZ: 120 },
      { minX: -120, maxX: -16, minZ: -120, maxZ: -16 },
      { minX: 16, maxX: 120, minZ: -120, maxZ: -16 }
    ];

    quadrants.forEach((q) => {
      const w = q.maxX - q.minX;
      const d = q.maxZ - q.minZ;
      const cx = (q.minX + q.maxX) / 2;
      const cz = (q.minZ + q.maxZ) / 2;

      const swGeo = new THREE.BoxGeometry(w, sidewalkThickness, d);
      const swMesh = new THREE.Mesh(swGeo, swMat);
      swMesh.position.set(cx, sidewalkThickness / 2, cz);
      swMesh.receiveShadow = true;
      swMesh.castShadow = true;
      this.group.add(swMesh);

      // Register physics collider
      this.physics.addCollider(
        new THREE.Box3(
          new THREE.Vector3(q.minX, 0, q.minZ),
          new THREE.Vector3(q.maxX, sidewalkThickness, q.maxZ)
        )
      );

      this.addCurbs(cx, cz, w, d, sidewalkThickness);
    });

    this.buildCrosswalks();
  }

  addCurbs(cx, cz, w, d, h) {
    const curbMat = this.materials.sidewalk;
    const curbT = 0.45;
    const curbH = h + 0.05;

    for (let xPos of [cx - w / 2 + curbT / 2, cx + w / 2 - curbT / 2]) {
      const curbGeo = new THREE.BoxGeometry(curbT, curbH, d);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(xPos, curbH / 2, cz);
      curb.receiveShadow = true;
      this.group.add(curb);
    }
    for (let zPos of [cz - d / 2 + curbT / 2, cz + d / 2 - curbT / 2]) {
      const curbGeo = new THREE.BoxGeometry(w, curbH, curbT);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(cx, curbH / 2, zPos);
      curb.receiveShadow = true;
      this.group.add(curb);
    }
  }

  buildCrosswalks() {
    const markMat = this.materials.roadMarking;
    const y = 0.02;

    const createCrosswalkStripes = (cx, cz, rotY) => {
      const g = new THREE.Group();
      const count = 9;
      const stripeW = 0.85;
      const stripeL = 5.0;
      const spacing = 1.6;

      for (let i = 0; i < count; i++) {
        const geo = new THREE.PlaneGeometry(stripeW, stripeL);
        const mesh = new THREE.Mesh(geo, markMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set((i - (count - 1) / 2) * spacing, y, 0);
        mesh.receiveShadow = true;
        g.add(mesh);
      }
      g.position.set(cx, 0, cz);
      g.rotation.y = rotY;
      return g;
    };

    this.group.add(createCrosswalkStripes(0, 20, 0));
    this.group.add(createCrosswalkStripes(0, -20, 0));
    this.group.add(createCrosswalkStripes(20, 0, Math.PI / 2));
    this.group.add(createCrosswalkStripes(-20, 0, Math.PI / 2));
  }

  buildNeonLightTrails() {
    // Glowing neon street light streaks directly inspired by Reference Image 1
    // Long-exposure electric magenta and cyan light trails running along the road lanes
    const trailConfigs = [
      { x: -4.5, startZ: 24, endZ: 130, color: 0xff007f },
      { x: -3.5, startZ: 24, endZ: 130, color: 0xd946ef },
      { x: 3.5, startZ: 24, endZ: 130, color: 0x00f0ff },
      { x: 4.5, startZ: 24, endZ: 130, color: 0x38bdf8 },
      // East-West avenues
      { z: 4.5, startX: 24, endX: 130, color: 0xff007f, isEW: true },
      { z: -4.5, startX: -130, endX: -24, color: 0x00f0ff, isEW: true }
    ];

    trailConfigs.forEach((cfg) => {
      const length = Math.abs((cfg.isEW ? cfg.endX - cfg.startX : cfg.endZ - cfg.startZ));
      const trailGeo = new THREE.PlaneGeometry(0.35, length);
      trailGeo.rotateX(-Math.PI / 2);

      if (cfg.isEW) {
        trailGeo.rotateY(Math.PI / 2);
      }

      const trailMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const trailMesh = new THREE.Mesh(trailGeo, trailMat);
      if (cfg.isEW) {
        trailMesh.position.set((cfg.startX + cfg.endX) / 2, 0.04, cfg.z);
      } else {
        trailMesh.position.set(cfg.x, 0.04, (cfg.startZ + cfg.endZ) / 2);
      }
      this.group.add(trailMesh);
      this.lightTrails.push(trailMat);
    });
  }

  buildEnergyConduits() {
    // Physical energy conduits running from Substation (X: 0, Z: 18) to Landmark Spire (X: 0, Z: 0)
    const conduitCount = 4;
    const spacing = 1.2;

    for (let i = 0; i < conduitCount; i++) {
      const xOffset = (i - (conduitCount - 1) / 2) * spacing;

      const trenchGeo = new THREE.BoxGeometry(0.8, 0.15, 20);
      const trenchMesh = new THREE.Mesh(trenchGeo, this.materials.darkMetal);
      trenchMesh.position.set(xOffset, 0.28, 9);
      this.group.add(trenchMesh);

      const cableGeo = new THREE.CylinderGeometry(0.2, 0.2, 19.8, 12);
      cableGeo.rotateX(Math.PI / 2);

      const cableMat = new THREE.MeshStandardMaterial({
        color: 0x0a1c28,
        emissive: new THREE.Color(0x00f0ff),
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.8
      });
      this.conduitMaterials.push(cableMat);

      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      cableMesh.position.set(xOffset, 0.35, 9);
      this.group.add(cableMesh);
    }
  }

  buildStreetFurniture() {
    // 1. Heavy Industrial Transformer Units along sidewalk perimeters
    const transformerGeo = new THREE.BoxGeometry(2.4, 2.8, 1.8);
    const transformerPositions = [
      { x: 18, z: 22 },
      { x: -18, z: 22 },
      { x: 18, z: -22 },
      { x: -18, z: -22 }
    ];

    transformerPositions.forEach((pos) => {
      const trMesh = new THREE.Mesh(transformerGeo, this.materials.darkMetal);
      trMesh.position.set(pos.x, 1.4 + 0.28, pos.z);
      trMesh.castShadow = true;
      trMesh.receiveShadow = true;
      this.group.add(trMesh);

      const stripGeo = new THREE.PlaneGeometry(1.6, 0.4);
      const stripMesh = new THREE.Mesh(stripGeo, this.materials.amberBeacon);
      stripMesh.position.set(pos.x, 2.2 + 0.28, pos.z + 0.91);
      this.group.add(stripMesh);

      this.physics.addCollider(
        new THREE.Box3(
          new THREE.Vector3(pos.x - 1.3, 0, pos.z - 1.0),
          new THREE.Vector3(pos.x + 1.3, 3.2, pos.z + 1.0)
        )
      );
    });

    // 2. Pedestrian Traffic Signal Masts
    const mastPositions = [
      { x: 15, z: 18, rot: 0 },
      { x: -15, z: 18, rot: 0 },
      { x: 15, z: -18, rot: Math.PI },
      { x: -15, z: -18, rot: Math.PI }
    ];

    mastPositions.forEach((pos) => {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 4.5, 8);
      const pole = new THREE.Mesh(poleGeo, this.materials.darkMetal);
      pole.position.set(pos.x, 2.25 + 0.28, pos.z);
      pole.castShadow = true;
      this.group.add(pole);

      const headGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
      const head = new THREE.Mesh(headGeo, this.materials.darkMetal);
      head.position.set(pos.x, 3.8 + 0.28, pos.z);
      this.group.add(head);

      const signalLens = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), this.materials.amberBeacon);
      signalLens.position.set(pos.x, 3.8 + 0.28, pos.z + (pos.rot === 0 ? -0.19 : 0.19));
      signalLens.rotation.y = pos.rot;
      this.group.add(signalLens);
    });

    // 3. Security Bollards along Plaza boundary
    const bollardGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.95, 8);
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      if (Math.abs(Math.sin(angle)) < 0.22 || Math.abs(Math.cos(angle)) < 0.22) continue;

      const bx = Math.cos(angle) * 23;
      const bz = Math.sin(angle) * 23;

      const bollard = new THREE.Mesh(bollardGeo, this.materials.darkMetal);
      bollard.position.set(bx, 0.47 + 0.28, bz);
      bollard.castShadow = true;
      this.group.add(bollard);

      this.physics.addCollider(
        new THREE.Box3(
          new THREE.Vector3(bx - 0.2, 0, bz - 0.2),
          new THREE.Vector3(bx + 0.2, 1.4, bz + 0.2)
        )
      );
    }
  }

  buildBuildingEntrances() {
    const buildEntrance = (x, z, rotY) => {
      const g = new THREE.Group();

      const frameGeo = new THREE.BoxGeometry(9.0, 5.5, 3.5);
      const frameMesh = new THREE.Mesh(frameGeo, this.materials.darkMetal);
      frameMesh.position.set(0, 2.75 + 0.28, 0);
      frameMesh.castShadow = true;
      g.add(frameMesh);

      const doorGeo = new THREE.PlaneGeometry(6.0, 4.0);
      const doorMesh = new THREE.Mesh(doorGeo, this.materials.glassFacade);
      doorMesh.position.set(0, 2.0 + 0.28, 1.76);
      g.add(doorMesh);

      // Cantilevered Entrance Canopy with illuminated underside
      const canopyGeo = new THREE.BoxGeometry(8.5, 0.35, 4.2);
      const canopyMesh = new THREE.Mesh(canopyGeo, this.materials.darkMetal);
      canopyMesh.position.set(0, 5.2 + 0.28, 3.2);
      canopyMesh.castShadow = true;
      g.add(canopyMesh);

      const downlightGeo = new THREE.PlaneGeometry(7.0, 3.0);
      downlightGeo.rotateX(Math.PI / 2);
      const downlightMesh = new THREE.Mesh(downlightGeo, this.materials.neonCyan);
      downlightMesh.position.set(0, 5.0 + 0.28, 3.2);
      g.add(downlightMesh);

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      return g;
    };

    this.group.add(buildEntrance(-45, 18, Math.PI / 2));
    this.group.add(buildEntrance(45, 18, -Math.PI / 2));
  }

  update(time, awakenedProgress) {
    const pulseSpeed = 2.0 + awakenedProgress * 4.0;
    const wave = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
    const intensity = 0.45 + awakenedProgress * 2.8 + wave * 0.4;

    this.conduitMaterials.forEach((mat) => {
      mat.emissiveIntensity = intensity;
    });

    // Animate light trails brightness
    this.lightTrails.forEach((mat) => {
      mat.opacity = 0.75 + awakenedProgress * 0.25 + Math.sin(time * 3.0) * 0.1;
    });
  }
}
