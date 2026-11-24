import * as THREE from 'three';

/**
 * Atmosphere
 * Nocturnal violet-indigo atmospheric depth matching reference images:
 * - Exponential fog tuned to preserve foreground clarity and skyline depth
 * - Deep indigo overcast skydome
 * - Low-level ground haze
 */
export class Atmosphere {
  constructor(scene) {
    this.scene = scene;
    this.fogColor = new THREE.Color(0x130d24);

    // Tuned fog density (0.0038) allows magnificent skyline depth without pitch-black clipping
    this.scene.fog = new THREE.FogExp2(this.fogColor, 0.0038);
    this.scene.background = this.fogColor;

    this.createSkyDome();
    this.createGroundHaze();
  }

  createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(450, 24, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x0c0818,
      side: THREE.BackSide
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  }

  createGroundHaze() {
    const hazeGeo = new THREE.RingGeometry(8, 120, 32);
    hazeGeo.rotateX(-Math.PI / 2);

    const hazeMat = new THREE.MeshBasicMaterial({
      color: 0x221338,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.hazeMesh = new THREE.Mesh(hazeGeo, hazeMat);
    this.hazeMesh.position.y = 0.8;
    this.scene.add(this.hazeMesh);
  }

  update(time) {
    if (this.hazeMesh) {
      this.hazeMesh.rotation.y = time * 0.02;
    }
  }

  setAwakenedFog(progress) {
    const dormant = new THREE.Color(0x130d24);
    const awakened = new THREE.Color(0x1a1233);
    this.scene.fog.color.lerpColors(dormant, awakened, progress);
    this.scene.background.copy(this.scene.fog.color);
  }
}
