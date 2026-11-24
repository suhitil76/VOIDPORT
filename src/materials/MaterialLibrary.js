import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

/**
 * MaterialLibrary
 * Realistic architectural PBR materials matching the reference images:
 * - Obsidian smoked glass with crisp, selectively illuminated window arrays
 * - Wet asphalt with high specular response catching neon street trails
 * - Electric magenta and cyan architectural edge lighting
 */
export class MaterialLibrary {
  constructor() {
    this.initTextures();
    this.initMaterials();
  }

  initTextures() {
    this.asphaltDiffuse = TextureGenerator.createAsphaltDiffuse();
    this.asphaltNormal = TextureGenerator.createAsphaltNormal();
    this.asphaltRoughness = TextureGenerator.createWetRoadRoughness();
    this.concreteDiffuse = TextureGenerator.createConcreteTexture();

    this.windowDormant = TextureGenerator.createWindowGridTexture(1024, 1024, true);
    this.windowAwakened = TextureGenerator.createWindowGridTexture(1024, 1024, false);

    this.asphaltDiffuse.repeat.set(12, 12);
    this.asphaltNormal.repeat.set(12, 12);
    this.asphaltRoughness.repeat.set(12, 12);

    this.concreteDiffuse.repeat.set(4, 8);
    // Realistic window proportion repeat: 3 bays wide, 7 floors high per UV unit
    this.windowDormant.repeat.set(3, 7);
    this.windowAwakened.repeat.set(3, 7);
  }

  initMaterials() {
    // 1. Wet Asphalt Road
    this.wetRoad = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      map: this.asphaltDiffuse,
      normalMap: this.asphaltNormal,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: this.asphaltRoughness,
      roughness: 0.45,
      metalness: 0.35,
      envMapIntensity: 2.5
    });

    // 2. Concrete Sidewalk & Curbs
    this.sidewalk = new THREE.MeshStandardMaterial({
      color: 0x282d3b,
      map: this.concreteDiffuse,
      roughness: 0.72,
      metalness: 0.15
    });

    // 3. Cyber-Brutalist Weathered Concrete
    this.brutalistConcrete = new THREE.MeshStandardMaterial({
      color: 0x1c202a,
      map: this.concreteDiffuse,
      roughness: 0.82,
      metalness: 0.15
    });

    // 4. Dark Structural Anodized Metal / Trusses
    this.darkMetal = new THREE.MeshStandardMaterial({
      color: 0x0a0e16,
      roughness: 0.3,
      metalness: 0.94
    });

    // 5. High-Tech Glass Curtain Facade
    this.glassFacade = new THREE.MeshStandardMaterial({
      color: 0x060810,
      roughness: 0.12,
      metalness: 0.92,
      emissiveMap: this.windowDormant,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1.0
    });

    // 6. Secondary Modular Facade (Industrial Habitation)
    this.industrialFacade = new THREE.MeshStandardMaterial({
      color: 0x10141e,
      roughness: 0.45,
      metalness: 0.65,
      emissiveMap: this.windowDormant,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.85
    });

    // 7. Landmark Central Reactor Core
    this.reactorCore = new THREE.MeshStandardMaterial({
      color: 0x021526,
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.85
    });

    // 8. Tower Spine Energy Ring Material
    this.spineRing = new THREE.MeshStandardMaterial({
      color: 0x081524,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.9
    });

    // 9. Neon Magenta Light Strip
    this.neonMagenta = new THREE.MeshStandardMaterial({
      color: 0x18001a,
      emissive: new THREE.Color(0xff007f),
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5
    });

    // 10. Neon Cyan Light Strip
    this.neonCyan = new THREE.MeshStandardMaterial({
      color: 0x00151a,
      emissive: new THREE.Color(0x00f0ff),
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5
    });

    // 11. Amber Hazard Beacon
    this.amberBeacon = new THREE.MeshStandardMaterial({
      color: 0x1a0a00,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.5
    });

    // 12. Street Luminaire
    this.streetLuminaire = new THREE.MeshStandardMaterial({
      color: 0x181208,
      emissive: new THREE.Color(0x7dd3fc),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5
    });

    // 13. Road Markings
    this.roadMarking = new THREE.MeshStandardMaterial({
      color: 0xd1dbe8,
      roughness: 0.5,
      metalness: 0.1
    });

    // 14. Rooftop Infrastructure
    this.rooftopProps = new THREE.MeshStandardMaterial({
      color: 0x222834,
      roughness: 0.4,
      metalness: 0.78
    });
  }

  setAwakenedState(progress) {
    if (progress > 0.4) {
      this.glassFacade.emissiveMap = this.windowAwakened;
      this.industrialFacade.emissiveMap = this.windowAwakened;
      this.glassFacade.emissiveIntensity = 1.0 + progress * 0.8;
      this.industrialFacade.emissiveIntensity = 0.85 + progress * 0.7;
      this.neonMagenta.emissiveIntensity = 2.2 + progress * 2.5;
      this.neonCyan.emissiveIntensity = 2.2 + progress * 2.5;
    } else {
      this.glassFacade.emissiveMap = this.windowDormant;
      this.industrialFacade.emissiveMap = this.windowDormant;
      this.glassFacade.emissiveIntensity = 1.0;
      this.industrialFacade.emissiveIntensity = 0.85;
      this.neonMagenta.emissiveIntensity = 2.2;
      this.neonCyan.emissiveIntensity = 2.2;
    }
    this.glassFacade.needsUpdate = true;
    this.industrialFacade.needsUpdate = true;
  }
}
