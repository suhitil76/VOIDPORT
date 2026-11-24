import * as THREE from 'three';

/**
 * LightingManager
 * Balanced nocturnal cinematic lighting matching the reference images:
 * - Luminous violet/indigo ambient skylight
 * - Directional moonlight casting crisp soft contact shadows
 * - Dynamic scene illumination scaling during city awakening
 */
export class LightingManager {
  constructor(scene) {
    this.scene = scene;

    this.createAmbientLight();
    this.createDirectionalMoonlight();
  }

  createAmbientLight() {
    // Rich violet/indigo nocturnal sky ambient & cool asphalt bounce
    this.hemiLight = new THREE.HemisphereLight(0x312052, 0x111827, 1.25);
    this.scene.add(this.hemiLight);
  }

  createDirectionalMoonlight() {
    // High-altitude directional moonlight
    this.moonLight = new THREE.DirectionalLight(0xb4c6fc, 1.4);
    this.moonLight.position.set(65, 150, 75);
    this.moonLight.castShadow = true;

    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 10;
    this.moonLight.shadow.camera.far = 320;

    const d = 110;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0003;
    this.moonLight.shadow.radius = 2.0;

    this.scene.add(this.moonLight);
  }

  setAwakenedLighting(progress) {
    this.hemiLight.intensity = 1.25 + progress * 0.65;
    this.moonLight.intensity = 1.4 + progress * 0.4;
  }
}
