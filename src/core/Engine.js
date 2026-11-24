import * as THREE from 'three';

/**
 * Core WebGL Rendering Engine
 */
export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. Renderer Initialization
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // PBR Color Management & Film Tone Mapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Realistic Soft Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Timing and Callbacks
    this.clock = new THREE.Clock();
    this.updateCallbacks = [];

    // 3. Resize Listener
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
  }

  setCamera(camera) {
    this.camera = camera;
    this.onResize();
  }

  setScene(scene) {
    this.scene = scene;
  }

  addUpdateCallback(fn) {
    this.updateCallbacks.push(fn);
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // Execute registered animation ticks
      for (let i = 0; i < this.updateCallbacks.length; i++) {
        this.updateCallbacks[i](delta, time);
      }

      if (this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    });
  }
}
