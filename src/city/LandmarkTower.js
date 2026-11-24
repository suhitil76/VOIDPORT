import * as THREE from 'three';

/**
 * LandmarkTower
 * The iconic central megastructure of VOIDPORT.
 * Features:
 * - Multi-tiered architectural profile rising to 155m.
 * - Massive foundation buttresses with power conduits.
 * - Cantilevered mid-level observation ring.
 * - Exposed central energy core chamber with visible pulsing reactor column.
 * - Structural exterior arching ribs and stabilization trusses.
 * - Upper technical deck, satellite array, and spire communications mast.
 * - Dedicated spatial core point light and upward atmospheric spotlight.
 */
export class LandmarkTower {
  constructor(materials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'LandmarkTower';

    // Animated lighting components references
    this.coreRings = [];
    this.strobeMeshes = [];
    this.coreLight = null;
    this.skyBeam = null;
    this.awakenedLevel = 0.0; // 0 = dormant, 1 = fully awakened

    this.buildFoundation();
    this.buildLowerAtrium();
    this.buildExposedCoreChamber();
    this.buildUpperMechanicalBlock();
    this.buildCrownSpire();
    this.buildLightingComponents();
  }

  buildFoundation() {
    // 1. Massive hexagonal base podium
    const baseGeo = new THREE.CylinderGeometry(14, 16, 8, 6);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.brutalistConcrete);
    baseMesh.position.y = 4;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // 2. Heavy diagonal foundation buttresses (6 radial pylons)
    const buttressGeo = new THREE.BoxGeometry(2.4, 10, 8);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bMesh = new THREE.Mesh(buttressGeo, this.materials.darkMetal);
      bMesh.position.set(Math.cos(angle) * 14.5, 5, Math.sin(angle) * 14.5);
      bMesh.rotation.y = -angle;
      bMesh.rotation.x = 0.15; // Inward lean
      bMesh.castShadow = true;
      this.group.add(bMesh);
    }

    // 3. Thick power conduit pipes wrapping into the underground grid
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const pipeGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 12);
      const pipeMesh = new THREE.Mesh(pipeGeo, this.materials.darkMetal);
      pipeMesh.position.set(Math.cos(angle) * 12, 4, Math.sin(angle) * 12);
      pipeMesh.rotation.z = Math.PI / 10;
      pipeMesh.rotation.y = angle;
      this.group.add(pipeMesh);
    }
  }

  buildLowerAtrium() {
    // Height: 8m - 38m
    // Stepped faceted lower tower body
    const lowerBodyGeo = new THREE.CylinderGeometry(10.5, 13.5, 26, 8);
    const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, this.materials.darkMetal);
    lowerBodyMesh.position.y = 21;
    lowerBodyMesh.castShadow = true;
    lowerBodyMesh.receiveShadow = true;
    this.group.add(lowerBodyMesh);

    // Inset tinted glass vertical windows
    const glassStripGeo = new THREE.CylinderGeometry(10.6, 13.6, 22, 16, 1, true);
    const glassStripMesh = new THREE.Mesh(glassStripGeo, this.materials.glassFacade);
    glassStripMesh.position.y = 21;
    this.group.add(glassStripMesh);

    // Cantilevered Observation Ring Platform (at 34m height)
    const ringGeo = new THREE.CylinderGeometry(15.5, 14, 2.5, 12);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.brutalistConcrete);
    ringMesh.position.y = 35;
    ringMesh.castShadow = true;
    this.group.add(ringMesh);

    // Perimeter catwalk railing on observation ring
    const railGeo = new THREE.TorusGeometry(15.3, 0.15, 8, 32);
    railGeo.rotateX(Math.PI / 2);
    const railMesh = new THREE.Mesh(railGeo, this.materials.darkMetal);
    railMesh.position.y = 36.8;
    this.group.add(railMesh);
  }

  buildExposedCoreChamber() {
    // Height: 38m - 92m (54 meters of vertical open core chamber!)
    const coreHeight = 54;
    const coreCenterY = 38 + coreHeight / 2; // 65m

    // 1. Four massive arching structural exterior ribs framing the open cavity
    const ribGeo = new THREE.BoxGeometry(1.8, coreHeight + 4, 3.2);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const ribMesh = new THREE.Mesh(ribGeo, this.materials.darkMetal);
      ribMesh.position.set(Math.cos(angle) * 9.5, coreCenterY, Math.sin(angle) * 9.5);
      ribMesh.rotation.y = -angle;
      ribMesh.castShadow = true;
      ribMesh.receiveShadow = true;
      this.group.add(ribMesh);

      // Horizontal stabilization trusses connecting ribs at 3 levels
      for (let lvl = 0; lvl < 3; lvl++) {
        const trussY = 48 + lvl * 16;
        const trussGeo = new THREE.BoxGeometry(11, 0.6, 0.6);
        const trussMesh = new THREE.Mesh(trussGeo, this.materials.darkMetal);
        trussMesh.position.set(0, trussY, 0);
        trussMesh.rotation.y = angle + Math.PI / 4;
        this.group.add(trussMesh);
      }
    }

    // 2. The Central Vertical Energy Reactor Column
    // Central energy conduit shaft
    const conduitGeo = new THREE.CylinderGeometry(2.0, 2.0, coreHeight, 16);
    const conduitMesh = new THREE.Mesh(conduitGeo, this.materials.darkMetal);
    conduitMesh.position.y = coreCenterY;
    conduitMesh.castShadow = true;
    this.group.add(conduitMesh);

    // Pulsing inner reactor core cylinder (visible through gaps)
    const reactorGeo = new THREE.CylinderGeometry(1.6, 1.6, coreHeight - 2, 16);
    this.reactorMesh = new THREE.Mesh(reactorGeo, this.materials.reactorCore);
    this.reactorMesh.position.y = coreCenterY;
    this.group.add(this.reactorMesh);

    // Interlocking electromagnetic energy containment rings (10 stacked rings)
    const ringGeo = new THREE.TorusGeometry(3.6, 0.45, 12, 24);
    ringGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 10; i++) {
      const yPos = 42 + i * 5.2;
      const ringMesh = new THREE.Mesh(ringGeo, this.materials.spineRing);
      ringMesh.position.y = yPos;
      this.group.add(ringMesh);
      this.coreRings.push(ringMesh);
    }
  }

  buildUpperMechanicalBlock() {
    // Height: 92m - 124m
    // Stepped technological crown housing
    const techBaseGeo = new THREE.CylinderGeometry(8.5, 10.5, 16, 8);
    const techBaseMesh = new THREE.Mesh(techBaseGeo, this.materials.brutalistConcrete);
    techBaseMesh.position.y = 100;
    techBaseMesh.castShadow = true;
    techBaseMesh.receiveShadow = true;
    this.group.add(techBaseMesh);

    // Heat dissipation fins / louvers
    const finGeo = new THREE.BoxGeometry(0.2, 12, 2.2);
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const finMesh = new THREE.Mesh(finGeo, this.materials.darkMetal);
      finMesh.position.set(Math.cos(angle) * 8.8, 100, Math.sin(angle) * 8.8);
      finMesh.rotation.y = -angle;
      this.group.add(finMesh);
    }

    // Upper platform deck (at 108m)
    const upperDeckGeo = new THREE.CylinderGeometry(11, 9, 2.0, 8);
    const upperDeckMesh = new THREE.Mesh(upperDeckGeo, this.materials.darkMetal);
    upperDeckMesh.position.y = 109;
    upperDeckMesh.castShadow = true;
    this.group.add(upperDeckMesh);

    // Satellite communications dish outriggers
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dishGroup = new THREE.Group();

      // Bracket arm
      const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.5, 8);
      armGeo.rotateZ(Math.PI / 3);
      const armMesh = new THREE.Mesh(armGeo, this.materials.darkMetal);
      dishGroup.add(armMesh);

      // Parabolic dish
      const dishGeo = new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.5);
      dishGeo.rotateX(-Math.PI / 3);
      const dishMesh = new THREE.Mesh(dishGeo, this.materials.rooftopProps);
      dishMesh.position.set(2.4, 1.8, 0);
      dishGroup.add(dishMesh);

      dishGroup.position.set(Math.cos(angle) * 9.5, 109, Math.sin(angle) * 9.5);
      dishGroup.rotation.y = angle;
      this.group.add(dishGroup);
    }

    // High technical tier (110m - 124m)
    const highTierGeo = new THREE.CylinderGeometry(5.0, 7.5, 14, 6);
    const highTierMesh = new THREE.Mesh(highTierGeo, this.materials.darkMetal);
    highTierMesh.position.y = 117;
    highTierMesh.castShadow = true;
    this.group.add(highTierMesh);
  }

  buildCrownSpire() {
    // Height: 124m - 158m (Apex spire needle)
    const spireMastGeo = new THREE.CylinderGeometry(0.3, 2.2, 34, 8);
    spireMastGeo.translate(0, 17, 0);
    const spireMesh = new THREE.Mesh(spireMastGeo, this.materials.darkMetal);
    spireMesh.position.y = 124;
    spireMesh.castShadow = true;
    this.group.add(spireMesh);

    // Spire cross-trusses and stabilization stays
    const stayGeo = new THREE.CylinderGeometry(0.08, 0.08, 16, 6);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const stayMesh = new THREE.Mesh(stayGeo, this.materials.darkMetal);
      stayMesh.position.set(Math.cos(angle) * 2.2, 132, Math.sin(angle) * 2.2);
      stayMesh.rotation.z = Math.PI / 16;
      stayMesh.rotation.y = angle;
      this.group.add(stayMesh);
    }

    // Aviation hazard warning beacons (red/amber strobes)
    const strobeGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const strobeMeshApex = new THREE.Mesh(strobeGeo, this.materials.amberBeacon);
    strobeMeshApex.position.set(0, 158, 0);
    this.group.add(strobeMeshApex);
    this.strobeMeshes.push(strobeMeshApex);

    // Mid-level obstruction markers
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const midStrobe = new THREE.Mesh(strobeGeo, this.materials.amberBeacon);
      midStrobe.position.set(Math.cos(angle) * 10, 36.5, Math.sin(angle) * 10);
      this.group.add(midStrobe);
      this.strobeMeshes.push(midStrobe);
    }
  }

  buildLightingComponents() {
    // 1. Spatial Core Point Light inside the exposed reactor chamber (65m)
    // Illuminates the surrounding structural ribs, upper mechanical blocks, and ground plaza
    this.coreLight = new THREE.PointLight(0x00f0ff, 0.4, 95, 1.8);
    this.coreLight.position.set(0, 65, 0);
    this.coreLight.castShadow = false;
    this.group.add(this.coreLight);

    // 2. Apex Sky-Beam Spotlight shooting up into the atmospheric overcast fog
    this.skyBeam = new THREE.SpotLight(0x38bdf8, 0.0, 220, Math.PI / 10, 0.8, 1.2);
    this.skyBeam.position.set(0, 158, 0);
    this.skyBeam.target.position.set(0, 350, 0);
    this.group.add(this.skyBeam);
    this.group.add(this.skyBeam.target);

    // 3. Volumetric light shaft cylinder representing the apex energy beam
    const beamGeo = new THREE.CylinderGeometry(0.8, 8.0, 140, 16, 1, true);
    beamGeo.translate(0, 70, 0);
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.beamMesh = new THREE.Mesh(beamGeo, this.beamMaterial);
    this.beamMesh.position.set(0, 158, 0);
    this.group.add(this.beamMesh);
  }

  /**
   * Per-frame animation tick
   */
  update(time) {
    // 1. Dynamic pulse of the central energy core
    const pulseSpeed = 1.5 + this.awakenedLevel * 3.5;
    const basePulse = Math.sin(time * pulseSpeed) * 0.5 + 0.5;

    // Modulate core emissive intensity
    const coreIntensity = 0.3 + this.awakenedLevel * 2.8 + basePulse * 0.6;
    this.materials.reactorCore.emissiveIntensity = coreIntensity;

    if (this.coreLight) {
      this.coreLight.intensity = (0.2 + this.awakenedLevel * 3.5 + basePulse * 0.8) * 14.0;
    }

    // 2. Progressive traveling energy wave along the 10 spine rings
    this.coreRings.forEach((ring, idx) => {
      const offset = idx * 0.4;
      const wave = Math.sin(time * (2.0 + this.awakenedLevel * 4.0) - offset);
      if (wave > 0.4) {
        ring.scale.set(1.0 + wave * 0.04, 1.0 + wave * 0.04, 1.0);
      } else {
        ring.scale.set(1.0, 1.0, 1.0);
      }
    });

    // 3. Strobe aviation hazard flash (1.0 Hz sharp flash)
    const strobeFlash = Math.sin(time * 6.28) > 0.85 ? 1.0 : 0.08;
    this.materials.amberBeacon.emissiveIntensity = strobeFlash * (1.2 + this.awakenedLevel * 1.5);

    // 4. Sky beam opacity in awakened state
    if (this.beamMaterial) {
      this.beamMaterial.opacity = this.awakenedLevel * (0.35 + Math.sin(time * 3.0) * 0.08);
      if (this.skyBeam) {
        this.skyBeam.intensity = this.awakenedLevel * 35.0;
      }
    }
  }

  /**
   * Controls the awakened progress level (0.0 = dormant, 1.0 = fully awakened)
   */
  setAwakenedLevel(level) {
    this.awakenedLevel = level;
    this.materials.spineRing.emissiveIntensity = 0.2 + level * 2.2;
  }
}
