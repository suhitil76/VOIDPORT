import * as THREE from 'three';

/**
 * DistantDistricts
 * Connects the Core district to the wider megacity geography:
 * 1. Neon Market (East): Layered commercial towers with glowing magenta/cyan vertical light runners & billboards.
 * 2. Ironworks (North): Heavy industrial cooling towers, factory smokestacks, and gantry cranes.
 * 3. The Haven (South): Staggered residential towers with high skybridge links.
 * 4. The Transit (West/North): Elevated viaduct with an animated Maglev metro train gliding along the rail.
 */
export class DistantDistricts {
  constructor(materials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'DistantDistricts';

    this.neonSigns = [];
    this.train = null;
    this.trainX = -200;

    this.buildNeonMarketSkyline();
    this.buildIronworksSkyline();
    this.buildHavenSkyline();
    this.buildElevatedTransitSystem();
  }

  // =========================================================================
  // 1. NEON MARKET (East: X: +180 to +260)
  // =========================================================================
  buildNeonMarketSkyline() {
    const marketGroup = new THREE.Group();
    marketGroup.position.set(210, 0, 0);

    const towers = [
      { x: 0, z: -40, w: 26, h: 125, d: 26, neon: 'magenta' },
      { x: 25, z: 10, w: 22, h: 140, d: 22, neon: 'cyan' },
      { x: -15, z: 45, w: 28, h: 110, d: 24, neon: 'magenta' },
      { x: 35, z: -30, w: 20, h: 95, d: 20, neon: 'cyan' },
      { x: 10, z: 80, w: 24, h: 130, d: 24, neon: 'magenta' }
    ];

    towers.forEach((t) => {
      // Main tower body
      const geo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const mesh = new THREE.Mesh(geo, this.materials.glassFacade);
      mesh.position.set(t.x, t.h / 2, t.z);
      mesh.castShadow = true;
      marketGroup.add(mesh);

      // Vertical neon light strip running up the corner (inspired by reference image 1)
      const stripGeo = new THREE.BoxGeometry(0.3, t.h * 0.9, 0.3);
      const stripMat = t.neon === 'magenta' ? this.materials.neonMagenta : this.materials.neonCyan;
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(t.x + t.w / 2 + 0.15, t.h / 2, t.z + t.d / 2 + 0.15);
      marketGroup.add(strip);

      // Rooftop Holographic / Illuminated Billboard
      const signGeo = new THREE.BoxGeometry(t.w * 0.75, 5.0, 0.4);
      const sign = new THREE.Mesh(signGeo, stripMat);
      sign.position.set(t.x, t.h + 3.0, t.z);
      marketGroup.add(sign);
      this.neonSigns.push(sign);
    });

    this.group.add(marketGroup);
  }

  // =========================================================================
  // 2. THE IRONWORKS (North: Z: -220 to -300)
  // =========================================================================
  buildIronworksSkyline() {
    const ironGroup = new THREE.Group();
    ironGroup.position.set(0, 0, -230);

    // 1. Two Colossal Industrial Cooling Towers
    for (let cx of [-60, 60]) {
      const coolingGeo = new THREE.CylinderGeometry(14, 22, 65, 20, 1, true);
      const coolingMesh = new THREE.Mesh(coolingGeo, this.materials.brutalistConcrete);
      coolingMesh.position.set(cx, 32.5, -40);
      coolingMesh.castShadow = true;
      ironGroup.add(coolingMesh);

      // Throat reinforcement ring
      const ringGeo = new THREE.TorusGeometry(14.5, 0.8, 8, 24);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, this.materials.darkMetal);
      ring.position.set(cx, 48, -40);
      ironGroup.add(ring);
    }

    // 2. Heavy Factory Smokestacks
    for (let sx of [-110, -20, 110]) {
      const stackGeo = new THREE.CylinderGeometry(1.6, 2.8, 95, 12);
      const stack = new THREE.Mesh(stackGeo, this.materials.darkMetal);
      stack.position.set(sx, 47.5, -70);
      stack.castShadow = true;
      ironGroup.add(stack);

      // Red obstruction warning strobe
      const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), this.materials.amberBeacon);
      strobe.position.set(sx, 95.5, -70);
      ironGroup.add(strobe);
    }

    // 3. Overhead Gantry Crane Silhouettes
    const gantryGeo = new THREE.BoxGeometry(75, 4.0, 4.0);
    const gantry = new THREE.Mesh(gantryGeo, this.materials.darkMetal);
    gantry.position.set(0, 45, -20);
    ironGroup.add(gantry);

    // Support legs
    for (let lx of [-35, 35]) {
      const legGeo = new THREE.CylinderGeometry(0.8, 0.8, 45, 8);
      const leg = new THREE.Mesh(legGeo, this.materials.darkMetal);
      leg.position.set(lx, 22.5, -20);
      ironGroup.add(leg);
    }

    this.group.add(ironGroup);
  }

  // =========================================================================
  // 3. THE HAVEN RESIDENTIAL SKYLINE (South: Z: +230)
  // =========================================================================
  buildHavenSkyline() {
    const havenGroup = new THREE.Group();
    havenGroup.position.set(0, 0, 230);

    const resTowers = [
      { x: -50, z: 20, w: 26, h: 115, d: 24 },
      { x: -10, z: 45, w: 22, h: 135, d: 22 },
      { x: 45, z: 20, w: 28, h: 105, d: 26 },
      { x: 85, z: 50, w: 24, h: 120, d: 24 }
    ];

    resTowers.forEach((t) => {
      const geo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const mesh = new THREE.Mesh(geo, this.materials.industrialFacade);
      mesh.position.set(t.x, t.h / 2, t.z);
      mesh.castShadow = true;
      havenGroup.add(mesh);
    });

    // High Skybridge linking residential spires at 75m height
    const skybridgeGeo = new THREE.BoxGeometry(60, 4.5, 5.0);
    const skybridge = new THREE.Mesh(skybridgeGeo, this.materials.darkMetal);
    skybridge.position.set(-30, 75, 32);
    havenGroup.add(skybridge);

    this.group.add(havenGroup);
  }

  // =========================================================================
  // 4. THE TRANSIT: ELEVATED MAGLEV VIADUCT & ANIMATED TRAIN
  // =========================================================================
  buildElevatedTransitSystem() {
    const transitGroup = new THREE.Group();

    // 1. Viaduct Rail Track (runs along Z: -110 across the entire city width)
    const trackGeo = new THREE.BoxGeometry(420, 2.2, 5.5);
    const track = new THREE.Mesh(trackGeo, this.materials.darkMetal);
    track.position.set(0, 22, -110);
    track.castShadow = true;
    transitGroup.add(track);

    // Glowing track guide rail (electric cyan)
    const railGeo = new THREE.BoxGeometry(420, 0.3, 0.4);
    const rail = new THREE.Mesh(railGeo, this.materials.neonCyan);
    rail.position.set(0, 23.2, -110);
    transitGroup.add(rail);

    // Concrete support pylons every 45 meters
    const pylonGeo = new THREE.BoxGeometry(2.8, 22, 2.8);
    for (let x = -180; x <= 180; x += 45) {
      const pylon = new THREE.Mesh(pylonGeo, this.materials.brutalistConcrete);
      pylon.position.set(x, 11, -110);
      pylon.castShadow = true;
      transitGroup.add(pylon);
    }

    // 2. Animated Maglev Train Cars (3 connected streamlined cars)
    this.train = new THREE.Group();
    const carLength = 16;
    const carWidth = 4.2;
    const carHeight = 3.6;

    for (let c = 0; c < 3; c++) {
      const carGeo = new THREE.BoxGeometry(carLength, carHeight, carWidth);
      const carMesh = new THREE.Mesh(carGeo, this.materials.darkMetal);
      carMesh.position.set(c * (carLength + 0.8), carHeight / 2 + 0.6, 0);
      this.train.add(carMesh);

      // Illuminated passenger window ribbon (cyan)
      const winGeo = new THREE.BoxGeometry(carLength - 1.5, 1.0, carWidth + 0.1);
      const winMesh = new THREE.Mesh(winGeo, this.materials.neonCyan);
      winMesh.position.set(c * (carLength + 0.8), carHeight / 2 + 0.6, 0);
      this.train.add(winMesh);
    }

    // Train Headlamps
    const headlamp = new THREE.PointLight(0x7dd3fc, 1.5, 45, 2.0);
    headlamp.position.set(carLength * 1.5 + 2, 2, 0);
    this.train.add(headlamp);

    this.train.position.set(this.trainX, 22.5, -110);
    transitGroup.add(this.train);

    this.group.add(transitGroup);
  }

  update(delta, time) {
    // Animate Maglev train gliding along the elevated viaduct
    if (this.train) {
      this.trainX += delta * 42.0; // High-speed cruising
      if (this.trainX > 220) {
        this.trainX = -220; // Loop back
      }
      this.train.position.x = this.trainX;
    }

    // Subtle billboard flicker
    const flicker = Math.sin(time * 8.0) > 0.96 ? 0.4 : 1.0;
    this.neonSigns.forEach((sign) => {
      sign.material.emissiveIntensity = 2.0 * flicker;
    });
  }
}
