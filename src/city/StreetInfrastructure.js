import * as THREE from 'three';

/**
 * StreetInfrastructure
 * Instanced street furniture: streetlamps with spatial point lights,
 * safety bollards, crash barriers, and drainage grates.
 */
export class StreetInfrastructure {
  constructor(materials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = 'StreetInfrastructure';

    this.streetLights = [];
    this.pointLights = [];

    this.createStreetLamps();
    this.createBollards();
    this.createBarriers();
    this.createDrainGrates();
  }

  createStreetLamps() {
    const poleHeight = 7.5;

    // Vertical mast
    const mastGeo = new THREE.CylinderGeometry(0.12, 0.18, poleHeight, 8);
    mastGeo.translate(0, poleHeight / 2, 0);

    // Overhanging angled arm
    const armGeo = new THREE.BoxGeometry(0.12, 0.15, 2.8);
    armGeo.rotateX(Math.PI / 14);
    armGeo.translate(0, poleHeight, 1.2);

    // Luminaire head
    const headGeo = new THREE.BoxGeometry(0.35, 0.12, 1.0);
    headGeo.translate(0, poleHeight + 0.1, 2.2);

    const lampPositions = [
      // North Avenue
      { x: 14.5, z: 25, rot: -Math.PI / 2 },
      { x: -14.5, z: 25, rot: Math.PI / 2 },
      { x: 14.5, z: 55, rot: -Math.PI / 2 },
      { x: -14.5, z: 55, rot: Math.PI / 2 },
      { x: 14.5, z: 85, rot: -Math.PI / 2 },
      { x: -14.5, z: 85, rot: Math.PI / 2 },

      // South Avenue
      { x: 14.5, z: -25, rot: -Math.PI / 2 },
      { x: -14.5, z: -25, rot: Math.PI / 2 },
      { x: 14.5, z: -55, rot: -Math.PI / 2 },
      { x: -14.5, z: -55, rot: Math.PI / 2 },

      // East Avenue
      { x: 25, z: 14.5, rot: 0 },
      { x: 25, z: -14.5, rot: Math.PI },
      { x: 55, z: 14.5, rot: 0 },
      { x: 55, z: -14.5, rot: Math.PI },

      // West Avenue
      { x: -25, z: 14.5, rot: 0 },
      { x: -25, z: -14.5, rot: Math.PI },
      { x: -55, z: 14.5, rot: 0 },
      { x: -55, z: -14.5, rot: Math.PI }
    ];

    const poleMesh = new THREE.Mesh(mastGeo, this.materials.darkMetal);
    const armMesh = new THREE.Mesh(armGeo, this.materials.darkMetal);
    const headMesh = new THREE.Mesh(headGeo, this.materials.darkMetal);

    const lensGeo = new THREE.PlaneGeometry(0.3, 0.9);
    lensGeo.rotateX(Math.PI / 2);
    lensGeo.translate(0, poleHeight + 0.03, 2.2);
    const lensMesh = new THREE.Mesh(lensGeo, this.materials.streetLuminaire);

    const singleLamp = new THREE.Group();
    singleLamp.add(poleMesh, armMesh, headMesh, lensMesh);

    lampPositions.forEach((pos, idx) => {
      const lampInstance = singleLamp.clone();
      lampInstance.position.set(pos.x, 0.28, pos.z);
      lampInstance.rotation.y = pos.rot;
      lampInstance.castShadow = true;
      this.group.add(lampInstance);

      // Localized PointLights for street illumination
      if (idx % 2 === 0) {
        const light = new THREE.PointLight(0x7dd3fc, 8.0, 26, 1.8);
        light.position.set(pos.x, poleHeight - 0.2, pos.z);
        this.group.add(light);
        this.pointLights.push(light);
      }
    });
  }

  createBollards() {
    const bollardGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 10);
    bollardGeo.translate(0, 0.5, 0);

    const count = 36;
    const instancedBollards = new THREE.InstancedMesh(bollardGeo, this.materials.darkMetal, count);
    instancedBollards.castShadow = true;
    instancedBollards.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const radius = 22;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      if (Math.abs(Math.sin(angle)) < 0.15 || Math.abs(Math.cos(angle)) < 0.15) {
        dummy.position.set(0, -100, 0);
      } else {
        dummy.position.set(Math.cos(angle) * radius, 0.28, Math.sin(angle) * radius);
      }
      dummy.updateMatrix();
      instancedBollards.setMatrixAt(i, dummy.matrix);
    }
    instancedBollards.instanceMatrix.needsUpdate = true;
    this.group.add(instancedBollards);
  }

  createBarriers() {
    const railGeo = new THREE.BoxGeometry(0.12, 0.7, 4.0);
    railGeo.translate(0, 0.45, 0);

    const barrierPositions = [
      { x: 13.5, z: 35, rot: 0 },
      { x: 13.5, z: 40, rot: 0 },
      { x: 13.5, z: 65, rot: 0 },
      { x: 13.5, z: 70, rot: 0 },
      { x: -13.5, z: 35, rot: 0 },
      { x: -13.5, z: 40, rot: 0 },
      { x: -13.5, z: 65, rot: 0 },
      { x: -13.5, z: 70, rot: 0 }
    ];

    const instancedBarriers = new THREE.InstancedMesh(
      railGeo,
      this.materials.darkMetal,
      barrierPositions.length
    );
    instancedBarriers.castShadow = true;

    const dummy = new THREE.Object3D();
    barrierPositions.forEach((pos, i) => {
      dummy.position.set(pos.x, 0.28, pos.z);
      dummy.rotation.y = pos.rot;
      dummy.updateMatrix();
      instancedBarriers.setMatrixAt(i, dummy.matrix);
    });
    instancedBarriers.instanceMatrix.needsUpdate = true;
    this.group.add(instancedBarriers);
  }

  createDrainGrates() {
    const grateGeo = new THREE.PlaneGeometry(1.2, 0.6);
    grateGeo.rotateX(-Math.PI / 2);

    const gratePositions = [
      { x: 11.5, z: 18 }, { x: 11.5, z: 45 }, { x: 11.5, z: 75 },
      { x: -11.5, z: 18 }, { x: -11.5, z: 45 }, { x: -11.5, z: 75 }
    ];

    const grateMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.9,
      metalness: 0.8
    });

    const instancedGrates = new THREE.InstancedMesh(grateGeo, grateMat, gratePositions.length);
    const dummy = new THREE.Object3D();
    gratePositions.forEach((pos, i) => {
      dummy.position.set(pos.x, 0.015, pos.z);
      dummy.updateMatrix();
      instancedGrates.setMatrixAt(i, dummy.matrix);
    });
    instancedGrates.instanceMatrix.needsUpdate = true;
    instancedGrates.receiveShadow = true;
    this.group.add(instancedGrates);
  }

  setStreetLightIntensity(intensity) {
    this.materials.streetLuminaire.emissiveIntensity = 0.2 + intensity * 2.8;
    this.pointLights.forEach((light) => {
      light.intensity = 8.0 + intensity * 26.0;
    });
  }
}
