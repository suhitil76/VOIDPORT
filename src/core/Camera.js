import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

/**
 * CameraManager
 * Controls perspective camera, OrbitControls damping, and smooth transitions
 * between cinematic viewpoints (Aerial, Landmark Tower, Architecture, Wet Road).
 */
export class CameraManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.5, 900);

    // Initial position: Aerial vista
    this.camera.position.set(120, 95, 130);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent camera from dropping below ground
    this.controls.minDistance = 5;
    this.controls.maxDistance = 380;
    this.controls.target.set(0, 32, 0);

    // Define cinematic inspection viewpoints
    this.views = {
      aerial: {
        position: new THREE.Vector3(120, 90, 135),
        target: new THREE.Vector3(0, 32, 0),
        duration: 2.2
      },
      tower: {
        position: new THREE.Vector3(38, 55, 48),
        target: new THREE.Vector3(0, 72, 0),
        duration: 2.0
      },
      architecture: {
        position: new THREE.Vector3(-85, 45, 75),
        target: new THREE.Vector3(-10, 36, 0),
        duration: 2.2
      },
      street: {
        position: new THREE.Vector3(16, 2.4, 46),
        target: new THREE.Vector3(0, 18, 0),
        duration: 2.0
      },
      orbit: null
    };

    this.currentView = 'aerial';
    this.isTransitioning = false;
  }

  update() {
    this.controls.update();

    // Subtle gentle camera breathing drift when in aerial view and not manually interacting
    if (!this.controls.state === -1 && this.currentView === 'aerial' && !this.isTransitioning) {
      const time = performance.now() * 0.0003;
      this.camera.position.x += Math.sin(time) * 0.015;
    }
  }

  setView(viewName) {
    const config = this.views[viewName];
    if (!config) {
      this.currentView = 'orbit';
      return;
    }

    this.currentView = viewName;
    this.isTransitioning = true;

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    // Animate camera position
    gsap.to(this.camera.position, {
      x: config.position.x,
      y: config.position.y,
      z: config.position.z,
      duration: config.duration,
      ease: 'power3.inOut',
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    // Animate controls focus target
    gsap.to(this.controls.target, {
      x: config.target.x,
      y: config.target.y,
      z: config.target.z,
      duration: config.duration,
      ease: 'power3.inOut'
    });
  }
}
