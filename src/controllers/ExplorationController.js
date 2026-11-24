import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

/**
 * ExplorationController
 * Unified hybrid exploration system:
 * - First-Person Walking (WASD + Mouse Look + Jump + Sprint + Collisions)
 * - Aerial Overview Camera with Orbit Controls
 * - Calibrated Cinematic Viewpoints
 */
export class ExplorationController {
  constructor(camera, canvas, physics) {
    this.camera = camera;
    this.canvas = canvas;
    this.physics = physics;

    this.mode = 'fps';
    this.isLocked = false;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    this.yaw = Math.PI; // Look towards Z: 0 (the Spire)
    this.pitch = 0.28;  // Look slightly upward towards the Spire and skyscrapers
    this.headBobTime = 0.0;

    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.orbitControls.minDistance = 15;
    this.orbitControls.maxDistance = 450;
    this.orbitControls.enabled = false;

    this.bindEvents();
    this.setMode('fps');
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.sprint = true;
      if (e.code === 'Space') this.keys.jump = true;

      if (e.code === 'KeyM' || e.code === 'Tab') {
        e.preventDefault();
        this.toggleMode();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.keys.sprint = false;
      if (e.code === 'Space') this.keys.jump = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.mode !== 'fps') return;
      if (!this.isLocked && document.pointerLockElement !== this.canvas) return;

      const sensitivity = 0.0022;
      this.yaw -= e.movementX * sensitivity;
      this.pitch -= e.movementY * sensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    this.canvas.addEventListener('click', () => {
      if (this.mode === 'fps' && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.canvas;
    });
  }

  setMode(mode) {
    this.mode = mode;

    if (mode === 'fps') {
      this.orbitControls.enabled = false;
      this.camera.position.copy(this.physics.position);
      this.yaw = Math.PI;
      this.pitch = 0.28;
    } else if (mode === 'aerial') {
      if (document.exitPointerLock) document.exitPointerLock();
      this.orbitControls.enabled = true;
      this.orbitControls.target.set(0, 30, 0);

      gsap.to(this.camera.position, {
        x: 130,
        y: 110,
        z: 140,
        duration: 1.8,
        ease: 'power3.inOut'
      });
    }
  }

  toggleMode() {
    this.setMode(this.mode === 'fps' ? 'aerial' : 'fps');
  }

  setCinematicView(viewName) {
    if (this.mode === 'fps' && viewName !== 'ground') {
      if (document.exitPointerLock) document.exitPointerLock();
      this.orbitControls.enabled = true;
      this.mode = 'aerial';
    }

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.orbitControls.target);

    const views = {
      ground: {
        pos: new THREE.Vector3(0, 1.65, 26),
        target: new THREE.Vector3(0, 35, -5),
        duration: 1.5,
        onComplete: () => this.setMode('fps')
      },
      tower: {
        pos: new THREE.Vector3(45, 65, 55),
        target: new THREE.Vector3(0, 80, 0),
        duration: 2.0
      },
      architecture: {
        pos: new THREE.Vector3(25, 38, 105),
        target: new THREE.Vector3(55, 48, 58),
        duration: 2.0
      },
      aerial: {
        pos: new THREE.Vector3(135, 115, 145),
        target: new THREE.Vector3(0, 25, 0),
        duration: 2.2
      }
    };

    const cfg = views[viewName];
    if (!cfg) return;

    gsap.to(this.camera.position, {
      x: cfg.pos.x,
      y: cfg.pos.y,
      z: cfg.pos.z,
      duration: cfg.duration,
      ease: 'power3.inOut',
      onComplete: cfg.onComplete
    });

    gsap.to(this.orbitControls.target, {
      x: cfg.target.x,
      y: cfg.target.y,
      z: cfg.target.z,
      duration: cfg.duration,
      ease: 'power3.inOut'
    });
  }

  update(delta) {
    if (this.mode === 'fps') {
      const inputVector = new THREE.Vector3();
      if (this.keys.forward) inputVector.z -= 1;
      if (this.keys.backward) inputVector.z += 1;
      if (this.keys.left) inputVector.x -= 1;
      if (this.keys.right) inputVector.x += 1;

      this.physics.update(
        delta,
        inputVector,
        this.keys.sprint,
        this.keys.jump,
        this.yaw
      );

      const speed = this.physics.velocity.length();
      if (this.physics.isGrounded && speed > 0.5) {
        this.headBobTime += delta * speed * 2.4;
      } else {
        this.headBobTime = 0;
      }
      const bobY = Math.sin(this.headBobTime) * 0.04;

      this.camera.position.set(
        this.physics.position.x,
        this.physics.position.y + bobY,
        this.physics.position.z
      );

      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.x = this.pitch;
      euler.y = this.yaw;
      this.camera.quaternion.setFromEuler(euler);
    } else {
      this.orbitControls.update();
    }
  }
}
