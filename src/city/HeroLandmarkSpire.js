import * as THREE from 'three';

/**
 * HeroLandmarkSpire
 * The architectural centerpiece of VOIDPORT:
 * - 185-meter towering neofuturistic spire
 * - Heavy titanium foundation with power intake conduits climbing the exterior
 * - 63-meter open reactor cage framed by curved structural composite ribs
 * - Active mechanical movement: 10 rotating electromagnetic energy containment rings
 * - 4 vertical hydraulic stabilizer pistons that oscillate with reactor power
 * - Upper technological deck, articulating satellite array, and crown communications mast
 * - Core spatial PointLight and atmospheric apex sky-beam spotlight
 * - Collision registration for the foundation and perimeter columns
 */
export class HeroLandmarkSpire {
  constructor(materials, physics) {
    this.materials = materials;
    this.physics = physics;
    this.group = new THREE.Group();
    this.group.name = 'HeroLandmarkSpire';

    this.rotatingRings = [];
    this.hydraulicPistons = [];
    this.strobeMeshes = [];
    this.conduitMaterials = [];
    this.awakenedLevel = 0.0;

    this.buildFoundation();
    this.buildLowerAtrium();
    this.buildExposedCoreCage();
    this.buildUpperMechanicalBlock();
    this.buildCrownSpire();
    this.buildLighting();
  }

  buildFoundation() {
    // 1. Monumental faceted foundation podium (0 - 16m)
    const baseGeo = new THREE.CylinderGeometry(15, 17.5, 12, 6);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.brutalistConcrete);
    baseMesh.position.y = 6;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Register foundation collider to prevent player walking through spire base
    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(-15, 0, -15),
        new THREE.Vector3(15, 14, 15)
      )
    );

    // 2. Six heavy radial hydraulic support footings
    const footingGeo = new THREE.BoxGeometry(2.6, 12, 7.5);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const footing = new THREE.Mesh(footingGeo, this.materials.darkMetal);
      footing.position.set(Math.cos(angle) * 16, 6, Math.sin(angle) * 16);
      footing.rotation.y = -angle;
      footing.rotation.x = 0.12;
      footing.castShadow = true;
      this.group.add(footing);

      this.physics.addCollider(
        new THREE.Box3(
          new THREE.Vector3(footing.position.x - 2, 0, footing.position.z - 2),
          new THREE.Vector3(footing.position.x + 2, 12, footing.position.z + 2)
        )
      );
    }

    // 3. Four vertical power conduit trunks climbing from the plaza into the core
    const conduitGeo = new THREE.CylinderGeometry(0.55, 0.55, 38, 12);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const conduitMat = new THREE.MeshStandardMaterial({
        color: 0x081522,
        emissive: new THREE.Color(0x00f0ff),
        emissiveIntensity: 0.3,
        roughness: 0.3,
        metalness: 0.8
      });
      this.conduitMaterials.push(conduitMat);

      const conduit = new THREE.Mesh(conduitGeo, conduitMat);
      conduit.position.set(Math.cos(angle) * 12.5, 19, Math.sin(angle) * 12.5);
      conduit.castShadow = true;
      this.group.add(conduit);
    }
  }

  buildLowerAtrium() {
    // Height: 12m - 42m
    const bodyGeo = new THREE.CylinderGeometry(11, 14, 28, 8);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.darkMetal);
    bodyMesh.position.y = 26;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.group.add(bodyMesh);

    // Cantilevered Observation Gallery Platform at 38m
    const galleryGeo = new THREE.CylinderGeometry(16.5, 15, 2.8, 12);
    const galleryMesh = new THREE.Mesh(galleryGeo, this.materials.brutalistConcrete);
    galleryMesh.position.y = 39.4;
    galleryMesh.castShadow = true;
    this.group.add(galleryMesh);

    // Perimeter protective glass balustrade
    const balustradeGeo = new THREE.CylinderGeometry(16.4, 16.4, 1.4, 24, 1, true);
    const balustradeMesh = new THREE.Mesh(balustradeGeo, this.materials.glassFacade);
    balustradeMesh.position.y = 41.5;
    this.group.add(balustradeMesh);
  }

  buildExposedCoreCage() {
    // Height: 42m - 105m (63-meter open vertical void)
    const cageHeight = 63;
    const centerY = 42 + cageHeight / 2; // 73.5m

    // 1. Four massive arching structural exterior ribs
    const ribGeo = new THREE.BoxGeometry(2.0, cageHeight + 6, 3.6);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const rib = new THREE.Mesh(ribGeo, this.materials.darkMetal);
      rib.position.set(Math.cos(angle) * 10.5, centerY, Math.sin(angle) * 10.5);
      rib.rotation.y = -angle;
      rib.castShadow = true;
      rib.receiveShadow = true;
      this.group.add(rib);

      // Horizontal stabilization trusses connecting ribs at 4 heights
      for (let lvl = 0; lvl < 4; lvl++) {
        const trussY = 52 + lvl * 14;
        const trussGeo = new THREE.BoxGeometry(13.2, 0.7, 0.7);
        const truss = new THREE.Mesh(trussGeo, this.materials.darkMetal);
        truss.position.set(0, trussY, 0);
        truss.rotation.y = angle + Math.PI / 4;
        this.group.add(truss);
      }
    }

    // 2. Central Vertical Reactor Conduit Shaft
    const reactorColGeo = new THREE.CylinderGeometry(2.2, 2.2, cageHeight, 16);
    const reactorCol = new THREE.Mesh(reactorColGeo, this.materials.darkMetal);
    reactorCol.position.y = centerY;
    reactorCol.castShadow = true;
    this.group.add(reactorCol);

    // Glowing inner energy plasma cylinder (visible through mechanical gaps)
    const plasmaGeo = new THREE.CylinderGeometry(1.75, 1.75, cageHeight - 2, 16);
    this.plasmaMesh = new THREE.Mesh(plasmaGeo, this.materials.reactorCore);
    this.plasmaMesh.position.y = centerY;
    this.group.add(this.plasmaMesh);

    // 3. Mechanical Energy Containment Rings (10 rotating rings)
    const ringGeo = new THREE.TorusGeometry(4.0, 0.45, 12, 24);
    ringGeo.rotateX(Math.PI / 2);

    for (let i = 0; i < 10; i++) {
      const ringGroup = new THREE.Group();
      ringGroup.position.y = 48 + i * 5.6;

      const ringMesh = new THREE.Mesh(ringGeo, this.materials.spineRing);
      ringGroup.add(ringMesh);

      // Add 3 mechanical electromagnetic emitter teeth to each ring
      for (let t = 0; t < 3; t++) {
        const toothAngle = (t / 3) * Math.PI * 2;
        const toothGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
        const tooth = new THREE.Mesh(toothGeo, this.materials.darkMetal);
        tooth.position.set(Math.cos(toothAngle) * 4.2, 0, Math.sin(toothAngle) * 4.2);
        tooth.rotation.y = -toothAngle;
        ringGroup.add(tooth);
      }

      this.group.add(ringGroup);
      this.rotatingRings.push({
        group: ringGroup,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 0.8 + (i % 3) * 0.3
      });
    }

    // 4. Four Vertical Hydraulic Stabilizer Pistons
    for (let p = 0; p < 4; p++) {
      const angle = (p / 4) * Math.PI * 2 + Math.PI / 4;
      const pistonPylon = new THREE.Group();
      pistonPylon.position.set(Math.cos(angle) * 7.5, centerY, Math.sin(angle) * 7.5);

      // Outer sleeve
      const sleeveGeo = new THREE.CylinderGeometry(0.4, 0.4, 28, 8);
      const sleeve = new THREE.Mesh(sleeveGeo, this.materials.darkMetal);
      pistonPylon.add(sleeve);

      // Inner piston rod
      const rodGeo = new THREE.CylinderGeometry(0.24, 0.24, 28, 8);
      const rod = new THREE.Mesh(rodGeo, this.materials.darkMetal);
      rod.position.y = 6;
      pistonPylon.add(rod);

      this.group.add(pistonPylon);
      this.hydraulicPistons.push({ pylon: pistonPylon, rod: rod, phase: p * Math.PI * 0.5 });
    }
  }

  buildUpperMechanicalBlock() {
    // Height: 105m - 146m
    const techBaseGeo = new THREE.CylinderGeometry(9.0, 11.5, 20, 8);
    const techBaseMesh = new THREE.Mesh(techBaseGeo, this.materials.brutalistConcrete);
    techBaseMesh.position.y = 115;
    techBaseMesh.castShadow = true;
    techBaseMesh.receiveShadow = true;
    this.group.add(techBaseMesh);

    // Heat dissipation radiator fins
    const finGeo = new THREE.BoxGeometry(0.25, 14, 2.5);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeo, this.materials.darkMetal);
      fin.position.set(Math.cos(angle) * 9.6, 115, Math.sin(angle) * 9.6);
      fin.rotation.y = -angle;
      this.group.add(fin);
    }

    // Upper Technical Gantry Deck at 126m
    const deckGeo = new THREE.CylinderGeometry(12, 10, 2.2, 8);
    const deck = new THREE.Mesh(deckGeo, this.materials.darkMetal);
    deck.position.y = 127;
    deck.castShadow = true;
    this.group.add(deck);

    // Dual High-Gain Articulating Parabolic Dish Arrays
    for (let d = 0; d < 2; d++) {
      const angle = d * Math.PI;
      const dishRig = new THREE.Group();

      const boomGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.5, 8);
      boomGeo.rotateZ(Math.PI / 3);
      const boom = new THREE.Mesh(boomGeo, this.materials.darkMetal);
      dishRig.add(boom);

      const dishGeo = new THREE.SphereGeometry(2.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.3);
      dishGeo.rotateX(-Math.PI / 2.8);
      const dish = new THREE.Mesh(dishGeo, this.materials.rooftopProps);
      dish.position.set(3.2, 2.5, 0);
      dishRig.add(dish);

      dishRig.position.set(Math.cos(angle) * 10, 127, Math.sin(angle) * 10);
      dishRig.rotation.y = angle + Math.PI / 4;
      this.group.add(dishRig);
    }

    // High Stepped Crown Podium (128m - 146m)
    const upperPodiumGeo = new THREE.CylinderGeometry(5.5, 8.5, 18, 6);
    const upperPodium = new THREE.Mesh(upperPodiumGeo, this.materials.darkMetal);
    upperPodium.position.y = 137;
    upperPodium.castShadow = true;
    this.group.add(upperPodium);
  }

  buildCrownSpire() {
    // Height: 146m - 185m (39-meter telecommunications mast)
    const mastGeo = new THREE.CylinderGeometry(0.35, 2.5, 39, 8);
    mastGeo.translate(0, 19.5, 0);
    const mast = new THREE.Mesh(mastGeo, this.materials.darkMetal);
    mast.position.y = 146;
    mast.castShadow = true;
    this.group.add(mast);

    // Mast structural outrigger cross-arms
    for (let c = 0; c < 4; c++) {
      const crossGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.2 - c * 0.8, 6);
      crossGeo.rotateZ(Math.PI / 2);
      const cross = new THREE.Mesh(crossGeo, this.materials.darkMetal);
      cross.position.set(0, 155 + c * 7.5, 0);
      this.group.add(cross);
    }

    // Aviation Warning Strobe Beacon at the Apex (185m)
    const strobeGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const apexStrobe = new THREE.Mesh(strobeGeo, this.materials.amberBeacon);
    apexStrobe.position.set(0, 185, 0);
    this.group.add(apexStrobe);
    this.strobeMeshes.push(apexStrobe);
  }

  buildLighting() {
    // 1. Spatial Core Point Light inside the exposed reactor void (73.5m)
    this.coreLight = new THREE.PointLight(0x00f0ff, 0.4, 110, 1.8);
    this.coreLight.position.set(0, 73.5, 0);
    this.group.add(this.coreLight);

    // 2. High-energy atmospheric apex beam spotlight pointing into the sky
    this.skyBeam = new THREE.SpotLight(0x38bdf8, 0.0, 260, Math.PI / 9, 0.85, 1.2);
    this.skyBeam.position.set(0, 185, 0);
    this.skyBeam.target.position.set(0, 420, 0);
    this.group.add(this.skyBeam);
    this.group.add(this.skyBeam.target);

    // Volumetric beam cylinder
    const beamGeo = new THREE.CylinderGeometry(1.0, 10.0, 180, 16, 1, true);
    beamGeo.translate(0, 90, 0);
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.beamMesh = new THREE.Mesh(beamGeo, this.beamMaterial);
    this.beamMesh.position.set(0, 185, 0);
    this.group.add(this.beamMesh);
  }

  update(delta, time) {
    // 1. Active mechanical ring rotation
    const rotMult = 1.0 + this.awakenedLevel * 3.5;
    this.rotatingRings.forEach((item) => {
      item.group.rotation.y += delta * item.speed * item.direction * rotMult;
    });

    // 2. Oscillate hydraulic pistons
    this.hydraulicPistons.forEach((item) => {
      const stroke = Math.sin(time * (1.2 + this.awakenedLevel * 3.0) + item.phase) * 1.5;
      item.rod.position.y = 6 + stroke;
    });

    // 3. Pulse core plasma emission
    const pulseSpeed = 1.6 + this.awakenedLevel * 4.0;
    const basePulse = Math.sin(time * pulseSpeed) * 0.5 + 0.5;
    const coreIntensity = 0.35 + this.awakenedLevel * 3.2 + basePulse * 0.8;
    this.materials.reactorCore.emissiveIntensity = coreIntensity;

    if (this.coreLight) {
      this.coreLight.intensity = (0.25 + this.awakenedLevel * 3.6 + basePulse * 0.8) * 18.0;
    }

    // 4. Pulse rising power conduits
    const conduitWave = Math.sin(time * (2.2 + this.awakenedLevel * 4.0)) * 0.5 + 0.5;
    const conduitIntensity = 0.3 + this.awakenedLevel * 2.8 + conduitWave * 0.4;
    this.conduitMaterials.forEach((mat) => {
      mat.emissiveIntensity = conduitIntensity;
    });

    // 5. Strobe flash
    const strobe = Math.sin(time * 6.28) > 0.85 ? 1.0 : 0.06;
    this.materials.amberBeacon.emissiveIntensity = strobe * (1.2 + this.awakenedLevel * 1.8);

    // 6. Sky beam
    if (this.beamMaterial) {
      this.beamMaterial.opacity = this.awakenedLevel * (0.38 + Math.sin(time * 2.5) * 0.08);
      if (this.skyBeam) {
        this.skyBeam.intensity = this.awakenedLevel * 45.0;
      }
    }
  }

  setAwakenedLevel(level) {
    this.awakenedLevel = level;
    this.materials.spineRing.emissiveIntensity = 0.2 + level * 2.6;
  }
}
