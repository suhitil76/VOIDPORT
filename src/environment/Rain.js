import * as THREE from 'three';

/**
 * Rain
 * High-performance, pixel-sharp rain streak system and ground splash ripples.
 * Uses LineSegments with dynamic buffer attribute cycling to produce fast,
 * directional rain streaks with realistic terminal velocity and wind angle.
 */
export class Rain {
  constructor(scene) {
    this.scene = scene;
    this.dropCount = 3000;
    this.splashCount = 80;

    this.bounds = {
      minX: -120, maxX: 120,
      minZ: -120, maxZ: 120,
      minY: 0, maxY: 140
    };

    this.wind = new THREE.Vector3(-0.15, -1.8, -0.08); // Wind drift
    this.streakLength = 2.4;

    this.createRainStreaks();
    this.createSplashes();
  }

  createRainStreaks() {
    this.positions = new Float32Array(this.dropCount * 6); // 2 vertices per line (x1, y1, z1, x2, y2, z2)
    this.velocities = new Float32Array(this.dropCount);

    for (let i = 0; i < this.dropCount; i++) {
      const x = THREE.MathUtils.randFloat(this.bounds.minX, this.bounds.maxX);
      const y = THREE.MathUtils.randFloat(this.bounds.minY, this.bounds.maxY);
      const z = THREE.MathUtils.randFloat(this.bounds.minZ, this.bounds.maxZ);
      const speed = THREE.MathUtils.randFloat(48, 72);

      const i6 = i * 6;
      this.positions[i6] = x;
      this.positions[i6 + 1] = y;
      this.positions[i6 + 2] = z;

      this.positions[i6 + 3] = x + this.wind.x * this.streakLength;
      this.positions[i6 + 4] = y + this.wind.y * this.streakLength;
      this.positions[i6 + 5] = z + this.wind.z * this.streakLength;

      this.velocities[i] = speed;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.rainLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.rainLines);
  }

  createSplashes() {
    // Ring splash particles hitting wet asphalt
    const splashGeo = new THREE.RingGeometry(0.1, 0.4, 12);
    splashGeo.rotateX(-Math.PI / 2);

    this.splashMaterial = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.splashes = new THREE.InstancedMesh(splashGeo, this.splashMaterial, this.splashCount);
    this.splashData = [];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.splashCount; i++) {
      const data = {
        x: THREE.MathUtils.randFloat(this.bounds.minX * 0.7, this.bounds.maxX * 0.7),
        z: THREE.MathUtils.randFloat(this.bounds.minZ * 0.7, this.bounds.maxZ * 0.7),
        scale: Math.random(),
        life: Math.random(),
        speed: 1.5 + Math.random() * 2.0
      };
      this.splashData.push(data);

      dummy.position.set(data.x, 0.05, data.z);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.updateMatrix();
      this.splashes.setMatrixAt(i, dummy.matrix);
    }

    this.splashes.instanceMatrix.needsUpdate = true;
    this.scene.add(this.splashes);
  }

  update(delta) {
    // 1. Update rain streak positions
    const posAttr = this.rainLines.geometry.attributes.position;
    const pos = posAttr.array;

    for (let i = 0; i < this.dropCount; i++) {
      const i6 = i * 6;
      const dropSpeed = this.velocities[i] * delta;

      pos[i6] += this.wind.x * dropSpeed;
      pos[i6 + 1] += this.wind.y * dropSpeed;
      pos[i6 + 2] += this.wind.z * dropSpeed;

      pos[i6 + 3] = pos[i6] + this.wind.x * this.streakLength;
      pos[i6 + 4] = pos[i6 + 1] + this.wind.y * this.streakLength;
      pos[i6 + 5] = pos[i6 + 2] + this.wind.z * this.streakLength;

      // Reset drop when hitting ground level
      if (pos[i6 + 1] <= this.bounds.minY) {
        pos[i6] = THREE.MathUtils.randFloat(this.bounds.minX, this.bounds.maxX);
        pos[i6 + 1] = this.bounds.maxY;
        pos[i6 + 2] = THREE.MathUtils.randFloat(this.bounds.minZ, this.bounds.maxZ);

        pos[i6 + 3] = pos[i6] + this.wind.x * this.streakLength;
        pos[i6 + 4] = pos[i6 + 1] + this.wind.y * this.streakLength;
        pos[i6 + 5] = pos[i6 + 2] + this.wind.z * this.streakLength;
      }
    }
    posAttr.needsUpdate = true;

    // 2. Animate ground splashes
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.splashCount; i++) {
      const data = this.splashData[i];
      data.life += delta * data.speed;

      if (data.life > 1.0) {
        data.life = 0.0;
        data.x = THREE.MathUtils.randFloat(this.bounds.minX * 0.7, this.bounds.maxX * 0.7);
        data.z = THREE.MathUtils.randFloat(this.bounds.minZ * 0.7, this.bounds.maxZ * 0.7);
      }

      const currentScale = data.life * 1.8;
      dummy.position.set(data.x, 0.05, data.z);
      dummy.scale.set(currentScale, currentScale, currentScale);
      dummy.updateMatrix();
      this.splashes.setMatrixAt(i, dummy.matrix);
    }
    this.splashes.instanceMatrix.needsUpdate = true;
  }
}
