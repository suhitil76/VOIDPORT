import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { CharacterPhysics } from './core/CharacterPhysics.js';
import { ExplorationController } from './controllers/ExplorationController.js';
import { MaterialLibrary } from './materials/MaterialLibrary.js';
import { GroundLevelEnvironment } from './city/GroundLevelEnvironment.js';
import { HeroLandmarkSpire } from './city/HeroLandmarkSpire.js';
import { ArchitecturalClusters } from './city/ArchitecturalClusters.js';
import { DistantDistricts } from './city/DistantDistricts.js';
import { StreetInfrastructure } from './city/StreetInfrastructure.js';
import { Atmosphere } from './environment/Atmosphere.js';
import { Rain } from './environment/Rain.js';
import { AudioManager } from './environment/AudioManager.js';
import { LightingManager } from './lighting/LightingManager.js';
import { AwakeningSequence } from './lighting/AwakeningSequence.js';
import { InteractionManager } from './interactions/InteractionManager.js';

/**
 * VOIDPORT — Sector 01: The Core
 * Master Application Bootstrap
 */
class VoidportApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.init();
  }

  init() {
    // 1. Core Engine & Scene
    this.engine = new Engine(this.canvas);
    this.scene = new THREE.Scene();
    this.engine.setScene(this.scene);

    // 2. Physics & Character Controller
    this.physics = new CharacterPhysics();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.4, 900);
    this.engine.setCamera(this.camera);

    this.controller = new ExplorationController(this.camera, this.canvas, this.physics);

    // 3. Central PBR Material Library
    this.materials = new MaterialLibrary();

    // 4. Atmosphere, Weather & 3D Audio
    this.atmosphere = new Atmosphere(this.scene);
    this.rain = new Rain(this.scene);
    this.audioManager = new AudioManager();

    // 5. Lighting System
    this.lightingManager = new LightingManager(this.scene);

    // 6. City Infrastructure & Architecture
    this.groundEnv = new GroundLevelEnvironment(this.materials, this.physics);
    this.scene.add(this.groundEnv.group);

    this.streetInfrastructure = new StreetInfrastructure(this.materials);
    this.scene.add(this.streetInfrastructure.group);

    this.landmarkTower = new HeroLandmarkSpire(this.materials, this.physics);
    this.scene.add(this.landmarkTower.group);

    this.clusters = new ArchitecturalClusters(this.materials, this.physics);
    this.scene.add(this.clusters.group);

    this.distantDistricts = new DistantDistricts(this.materials);
    this.scene.add(this.distantDistricts.group);

    // 7. Awakening Sequence Orchestrator
    this.awakeningSequence = new AwakeningSequence({
      landmarkTower: this.landmarkTower,
      streetInfrastructure: this.streetInfrastructure,
      groundEnvironment: this.groundEnv,
      distantDistricts: this.distantDistricts,
      materials: this.materials,
      lightingManager: this.lightingManager,
      atmosphere: this.atmosphere,
      audioManager: this.audioManager
    });

    // 8. Environmental Interaction System
    this.interactionManager = new InteractionManager(
      this.scene,
      this.materials,
      this.physics,
      this.audioManager,
      () => {
        this.awakeningSequence.awaken();
        this.updateHUDState(true);
      }
    );

    // 9. Register Simulation Loop Ticks
    this.engine.addUpdateCallback((delta, time) => {
      this.controller.update(delta);
      this.atmosphere.update(time);
      this.rain.update(delta);
      this.landmarkTower.update(delta, time);
      this.groundEnv.update(time, this.awakeningSequence.progress);
      this.distantDistricts.update(delta, time);
      this.interactionManager.update(this.physics.position, time);
    });

    // 10. Bind UI Buttons & View Controls
    this.bindUI();

    // 11. Start Rendering
    this.engine.start();
    console.log('[VOIDPORT] Milestone 1: The Core initialized.');
  }

  bindUI() {
    // View Buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        viewButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const viewName = btn.dataset.view;
        this.controller.setCinematicView(viewName);
      });
    });

    // Awaken / Dormant Master Button
    const awakenBtn = document.getElementById('awaken-btn');
    awakenBtn.addEventListener('click', () => {
      this.awakeningSequence.toggle();
      this.updateHUDState(this.awakeningSequence.isAwakened);
    });

    // Number keys for rapid inspection views
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') this.triggerView('ground');
      if (e.key === '2') this.triggerView('tower');
      if (e.key === '3') this.triggerView('architecture');
      if (e.key === '4') this.triggerView('aerial');
    });
  }

  triggerView(viewName) {
    const btn = document.querySelector(`[data-view="${viewName}"]`);
    if (btn) btn.click();
  }

  updateHUDState(isAwakened) {
    const awakenBtn = document.getElementById('awaken-btn');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');

    if (isAwakened) {
      awakenBtn.textContent = 'POWER DOWN';
      awakenBtn.classList.add('awakened');
      statusText.textContent = 'CORE ENERGIZED';
      statusDot.classList.add('active');
    } else {
      awakenBtn.textContent = 'INITIALIZE SUBSTATION';
      awakenBtn.classList.remove('awakened');
      statusText.textContent = 'CITY DORMANT';
      statusDot.classList.remove('active');
    }
  }
}

// Bootstrap on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new VoidportApp();
});
