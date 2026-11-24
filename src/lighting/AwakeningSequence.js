import gsap from 'gsap';

/**
 * AwakeningSequence (Synchronized Milestone 1 Engine)
 * Synchronizes multi-system environmental awakening:
 * 1. Ground energy conduit surge propagating from plaza to spire
 * 2. Landmark Spire core ignition, rotating ring acceleration, hydraulic piston stroke
 * 3. Sequential streetlight circuit activation
 * 4. Architectural window grids & vertical neon strips illumination
 * 5. Elevated Maglev train speed and headlight radiance
 * 6. Atmospheric fog and ambient bounce elevation
 */
export class AwakeningSequence {
  constructor({
    landmarkTower,
    streetInfrastructure,
    groundEnvironment,
    distantDistricts,
    materials,
    lightingManager,
    atmosphere,
    audioManager
  }) {
    this.landmarkTower = landmarkTower;
    this.streetInfrastructure = streetInfrastructure;
    this.groundEnvironment = groundEnvironment;
    this.distantDistricts = distantDistricts;
    this.materials = materials;
    this.lightingManager = lightingManager;
    this.atmosphere = atmosphere;
    this.audioManager = audioManager;

    this.isAwakened = false;
    this.progress = 0.0;
    this.timeline = null;
  }

  toggle() {
    if (this.isAwakened) {
      this.powerDown();
    } else {
      this.awaken();
    }
  }

  awaken() {
    this.isAwakened = true;
    if (this.timeline) this.timeline.kill();

    if (this.audioManager) {
      this.audioManager.playAwakeningSurge();
    }

    this.timeline = gsap.timeline({
      onUpdate: () => {
        this.applyProgress(this.progress);
      }
    });

    // Stage 1: Ground energy conduits illuminate and surge toward the Spire
    this.timeline.to(this, {
      progress: 0.35,
      duration: 2.0,
      ease: 'power2.inOut'
    });

    // Stage 2: Central Tower reactor core ignites; rings accelerate; energy climbs to spire apex
    this.timeline.to(this, {
      progress: 0.72,
      duration: 2.2,
      ease: 'power2.out'
    });

    // Stage 3: Streetlamps and building window grids cascade across all sectors
    this.timeline.to(this, {
      progress: 1.0,
      duration: 2.4,
      ease: 'power1.inOut'
    });
  }

  powerDown() {
    this.isAwakened = false;
    if (this.timeline) this.timeline.kill();

    this.timeline = gsap.timeline({
      onUpdate: () => {
        this.applyProgress(this.progress);
      }
    });

    this.timeline.to(this, {
      progress: 0.0,
      duration: 2.8,
      ease: 'power3.inOut'
    });
  }

  applyProgress(val) {
    // 1. Spire mechanical rotation & core intensity
    if (this.landmarkTower) {
      this.landmarkTower.setAwakenedLevel(val);
    }

    // 2. Streetlight circuits
    if (this.streetInfrastructure) {
      const streetLightVal = Math.max(0, Math.min(1, (val - 0.2) / 0.7));
      this.streetInfrastructure.setStreetLightIntensity(streetLightVal);
    }

    // 3. Materials, windows & neon strips
    if (this.materials) {
      this.materials.setAwakenedState(val);
    }

    // 4. Atmosphere and Scene lighting
    if (this.lightingManager) {
      this.lightingManager.setAwakenedLighting(val);
    }
    if (this.atmosphere) {
      this.atmosphere.setAwakenedFog(val);
    }
  }
}
