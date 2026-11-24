import * as THREE from 'three';

/**
 * StreetNetwork
 * Generates the connected multi-lane road network, elevated sidewalks, curbs,
 * pedestrian crossings, and central plaza foundation.
 */
export class StreetNetwork {
  constructor(materials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'StreetNetwork';

    this.blockSize = 260; // 260m x 260m
    this.roadWidth = 24;  // 4-lane avenue width
    this.sidewalkWidth = 5;
    this.curbHeight = 0.25;

    this.createGround();
    this.createRoadGeometry();
    this.createSidewalks();
    this.createRoadMarkings();
    this.createCentralPlaza();
  }

  createGround() {
    // Deep base foundation plane
    const baseGeo = new THREE.PlaneGeometry(this.blockSize * 1.5, this.blockSize * 1.5);
    const baseMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = -0.05;
    this.group.add(baseMesh);
  }

  createRoadGeometry() {
    // Wet asphalt main road surface plane
    const roadGeo = new THREE.PlaneGeometry(this.blockSize, this.blockSize, 32, 32);
    const roadMesh = new THREE.Mesh(roadGeo, this.materials.wetRoad);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.0;
    roadMesh.receiveShadow = true;
    this.group.add(roadMesh);
  }

  createSidewalks() {
    const swMat = this.materials.sidewalk;
    const halfBlock = this.blockSize / 2;
    const halfRoad = this.roadWidth / 2;

    // We have 4 major building quadrants divided by the central crossroads (X=0 and Z=0).
    // In each quadrant, elevated sidewalks form a perimeter around the building plots.
    const quadrants = [
      { minX: halfRoad, maxX: halfBlock, minZ: halfRoad, maxZ: halfBlock },
      { minX: -halfBlock, maxX: -halfRoad, minZ: halfRoad, maxZ: halfBlock },
      { minX: -halfBlock, maxX: -halfRoad, minZ: -halfBlock, maxZ: -halfRoad },
      { minX: halfRoad, maxX: halfBlock, minZ: -halfBlock, maxZ: -halfRoad }
    ];

    quadrants.forEach((q) => {
      const qWidth = Math.abs(q.maxX - q.minX);
      const qDepth = Math.abs(q.maxZ - q.minZ);
      const centerX = (q.minX + q.maxX) / 2;
      const centerZ = (q.minZ + q.maxZ) / 2;

      // Elevated sidewalk block platform
      const sidewalkGeo = new THREE.BoxGeometry(qWidth, this.curbHeight, qDepth);
      const sidewalkMesh = new THREE.Mesh(sidewalkGeo, swMat);
      sidewalkMesh.position.set(centerX, this.curbHeight / 2, centerZ);
      sidewalkMesh.receiveShadow = true;
      sidewalkMesh.castShadow = true;
      this.group.add(sidewalkMesh);

      // Add beveled curb edge border
      this.createCurbs(centerX, centerZ, qWidth, qDepth);
    });
  }

  createCurbs(cx, cz, w, d) {
    const curbMat = this.materials.sidewalk;
    const curbThick = 0.4;
    const curbH = this.curbHeight + 0.04;

    // Outer curb strips
    const curbNorthGeo = new THREE.BoxGeometry(w, curbH, curbThick);
    const curbNorth = new THREE.Mesh(curbNorthGeo, curbMat);
    curbNorth.position.set(cx, curbH / 2, cz - d / 2 + curbThick / 2);
    curbNorth.receiveShadow = true;
    this.group.add(curbNorth);

    const curbSouth = curbNorth.clone();
    curbSouth.position.z = cz + d / 2 - curbThick / 2;
    this.group.add(curbSouth);

    const curbWestGeo = new THREE.BoxGeometry(curbThick, curbH, d);
    const curbWest = new THREE.Mesh(curbWestGeo, curbMat);
    curbWest.position.set(cx - w / 2 + curbThick / 2, curbH / 2, cz);
    curbWest.receiveShadow = true;
    this.group.add(curbWest);

    const curbEast = curbWest.clone();
    curbEast.position.x = cx + w / 2 - curbThick / 2;
    this.group.add(curbEast);
  }

  createRoadMarkings() {
    const markMat = this.materials.roadMarking;
    const markingsGroup = new THREE.Group();
    const halfRoad = this.roadWidth / 2;
    const yOffset = 0.02; // Sits right on top of asphalt

    // 1. Crosswalks at the central intersection
    const makeCrosswalk = (x, z, rotY) => {
      const cwGroup = new THREE.Group();
      const numStripes = 8;
      const stripeW = 0.8;
      const stripeL = 4.5;
      const stripeSpacing = 1.6;

      for (let i = 0; i < numStripes; i++) {
        const stripeGeo = new THREE.PlaneGeometry(stripeW, stripeL);
        const stripeMesh = new THREE.Mesh(stripeGeo, markMat);
        stripeMesh.rotation.x = -Math.PI / 2;
        stripeMesh.position.set((i - (numStripes - 1) / 2) * stripeSpacing, yOffset, 0);
        stripeMesh.receiveShadow = true;
        cwGroup.add(stripeMesh);
      }
      cwGroup.position.set(x, 0, z);
      cwGroup.rotation.y = rotY;
      return cwGroup;
    };

    // Place crosswalks at four branches of the central crossroads
    markingsGroup.add(makeCrosswalk(0, halfRoad + 4, 0));
    markingsGroup.add(makeCrosswalk(0, -(halfRoad + 4), 0));
    markingsGroup.add(makeCrosswalk(halfRoad + 4, 0, Math.PI / 2));
    markingsGroup.add(makeCrosswalk(-(halfRoad + 4), 0, Math.PI / 2));

    // 2. Dashed lane dividers along avenues
    const makeDashedLine = (startX, startZ, endX, endZ) => {
      const lineLen = Math.hypot(endX - startX, endZ - startZ);
      const dashLen = 3.0;
      const gapLen = 3.5;
      const totalPeriod = dashLen + gapLen;
      const count = Math.floor(lineLen / totalPeriod);
      const angle = Math.atan2(endZ - startZ, endX - startX);

      for (let i = 0; i < count; i++) {
        const dist = (i + 0.5) * totalPeriod;
        const px = startX + Math.cos(angle) * dist;
        const pz = startZ + Math.sin(angle) * dist;

        const dashGeo = new THREE.PlaneGeometry(0.35, dashLen);
        const dashMesh = new THREE.Mesh(dashGeo, markMat);
        dashMesh.rotation.x = -Math.PI / 2;
        dashMesh.rotation.z = -angle + Math.PI / 2;
        dashMesh.position.set(px, yOffset, pz);
        dashMesh.receiveShadow = true;
        markingsGroup.add(dashMesh);
      }
    };

    // Avenues extending outward from crosswalks to block perimeter
    makeDashedLine(0, halfRoad + 9, 0, this.blockSize / 2);
    makeDashedLine(0, -(halfRoad + 9), 0, -this.blockSize / 2);
    makeDashedLine(halfRoad + 9, 0, this.blockSize / 2, 0);
    makeDashedLine(-(halfRoad + 9), 0, -this.blockSize / 2, 0);

    this.group.add(markingsGroup);
  }

  createCentralPlaza() {
    // Stepped hexagonal plaza podium for the Landmark Tower
    const plazaGeo = new THREE.CylinderGeometry(18, 20, 0.6, 6);
    const plazaMesh = new THREE.Mesh(plazaGeo, this.materials.sidewalk);
    plazaMesh.position.set(0, 0.3, 0);
    plazaMesh.receiveShadow = true;
    plazaMesh.castShadow = true;
    this.group.add(plazaMesh);

    // Inner dark titanium ring inset
    const innerRingGeo = new THREE.RingGeometry(11, 15, 32);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, this.materials.darkMetal);
    innerRingMesh.rotation.x = -Math.PI / 2;
    innerRingMesh.position.set(0, 0.61, 0);
    innerRingMesh.receiveShadow = true;
    this.group.add(innerRingMesh);
  }
}
