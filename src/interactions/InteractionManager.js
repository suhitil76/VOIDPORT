import * as THREE from 'three';
import gsap from 'gsap';

/**
 * InteractionManager
 * Manages proximity-based interactables in the 3D world:
 * 1. Primary Core Substation Terminal (at X: 0, Z: 20) -> Initiates City Awakening
 * 2. Abandoned Repair Droid Discovery (at X: -22, Z: 24) -> Unlocks Environmental Lore
 */
export class InteractionManager {
  constructor(scene, materials, physics, audioManager, awakeningCallback) {
    this.scene = scene;
    this.materials = materials;
    this.physics = physics;
    this.audioManager = audioManager;
    this.awakeningCallback = awakeningCallback;

    this.group = new THREE.Group();
    this.group.name = 'InteractionManager';
    this.scene.add(this.group);

    this.interactables = [];
    this.activeInteractable = null;

    this.buildSubstationTerminal();
    this.buildAbandonedDroneDiscovery();
    this.createHUDPrompts();
    this.bindEvents();
  }

  buildSubstationTerminal() {
    // Primary Substation Console on the Central Plaza at X: 0, Z: 18.5
    const termGroup = new THREE.Group();
    termGroup.position.set(0, 0.28, 18.5);

    // Heavy concrete/steel equipment plinth
    const plinthGeo = new THREE.BoxGeometry(2.2, 0.8, 1.8);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.darkMetal);
    plinth.position.y = 0.4;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    termGroup.add(plinth);

    // Terminal console housing
    const consoleGeo = new THREE.BoxGeometry(1.6, 1.2, 1.2);
    const consoleMesh = new THREE.Mesh(consoleGeo, this.materials.brutalistConcrete);
    consoleMesh.position.y = 1.4;
    consoleMesh.castShadow = true;
    termGroup.add(consoleMesh);

    // Slanted control faceplate with status screen
    const screenGeo = new THREE.PlaneGeometry(1.1, 0.7);
    this.terminalScreenMat = new THREE.MeshStandardMaterial({
      color: 0x02111a,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const screenMesh = new THREE.Mesh(screenGeo, this.terminalScreenMat);
    screenMesh.position.set(0, 1.55, 0.61);
    termGroup.add(screenMesh);

    // High-voltage manual breaker switch lever
    const leverBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    leverBaseGeo.rotateZ(Math.PI / 2);
    this.leverMesh = new THREE.Mesh(leverBaseGeo, this.materials.amberBeacon);
    this.leverMesh.position.set(0, 1.25, 0.62);
    termGroup.add(this.leverMesh);

    // Register physics collider
    this.physics.addCollider(
      new THREE.Box3(
        new THREE.Vector3(-1.2, 0, 17.5),
        new THREE.Vector3(1.2, 2.2, 19.5)
      )
    );

    this.group.add(termGroup);

    // Register interactable
    this.interactables.push({
      id: 'core_terminal',
      position: new THREE.Vector3(0, 1.5, 18.5),
      promptText: '[E] INITIALIZE PRIMARY SUBSTATION',
      radius: 3.8,
      onInteract: () => this.triggerCoreAwakening()
    });
  }

  buildAbandonedDroneDiscovery() {
    // Environmental Discovery: Decommissioned maintenance droid in alley at X: -20, Z: 24
    const droidGroup = new THREE.Group();
    droidGroup.position.set(-20, 0.28, 24);

    // Torso chassis
    const torsoGeo = new THREE.BoxGeometry(0.9, 0.8, 0.7);
    const torso = new THREE.Mesh(torsoGeo, this.materials.darkMetal);
    torso.position.y = 0.45;
    torso.rotation.y = 0.4;
    torso.castShadow = true;
    droidGroup.add(torso);

    // Articulated sensor dome head
    const headGeo = new THREE.SphereGeometry(0.35, 12, 10);
    const head = new THREE.Mesh(headGeo, this.materials.rooftopProps);
    head.position.set(0, 0.95, 0);
    droidGroup.add(head);

    // Optical sensor eye (flickering amber)
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    this.droidEyeMat = new THREE.MeshStandardMaterial({
      color: 0x110800,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.8
    });
    const eye = new THREE.Mesh(eyeGeo, this.droidEyeMat);
    eye.position.set(0.15, 0.98, 0.28);
    droidGroup.add(eye);

    // Emitting datapad unit lying beside it
    const padGeo = new THREE.BoxGeometry(0.4, 0.05, 0.3);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x051522,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.8
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0.8, 0.04, 0.4);
    pad.rotation.y = 0.6;
    droidGroup.add(pad);

    this.group.add(droidGroup);

    this.interactables.push({
      id: 'maintenance_drone',
      position: new THREE.Vector3(-20, 0.8, 24),
      promptText: '[E] ACCESS DROID TRANSMISSION LOG',
      radius: 3.2,
      onInteract: () => this.showLoreTransmission()
    });
  }

  createHUDPrompts() {
    // Dynamic screen-space prompt container
    this.promptEl = document.createElement('div');
    this.promptEl.id = 'interaction-prompt';
    this.promptEl.style.cssText = `
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10, 17, 28, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.6);
      color: #38bdf8;
      font-size: 0.85rem;
      letter-spacing: 0.14em;
      padding: 10px 22px;
      border-radius: 6px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
      pointer-events: none;
      display: none;
      z-index: 50;
      text-transform: uppercase;
      font-weight: 600;
      transition: opacity 0.2s ease;
    `;
    document.body.appendChild(this.promptEl);

    // Lore Transmission dialogue box
    this.loreEl = document.createElement('div');
    this.loreEl.id = 'lore-modal';
    this.loreEl.style.cssText = `
      position: absolute;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 620px;
      background: rgba(8, 12, 20, 0.94);
      border: 1px solid rgba(245, 158, 11, 0.6);
      color: #f1f5f9;
      font-size: 0.82rem;
      line-height: 1.6;
      padding: 18px 24px;
      border-radius: 8px;
      backdrop-filter: blur(16px);
      box-shadow: 0 0 35px rgba(245, 158, 11, 0.2);
      display: none;
      z-index: 60;
    `;
    document.body.appendChild(this.loreEl);
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (this.activeInteractable) {
          this.activeInteractable.onInteract();
        }
      }
      if (e.code === 'Escape') {
        if (this.loreEl.style.display !== 'none') {
          this.loreEl.style.display = 'none';
        }
      }
    });
  }

  triggerCoreAwakening() {
    this.audioManager.playTerminalSwitch();
    this.audioManager.playAwakeningSurge();

    // Pull lever down animation
    gsap.to(this.leverMesh.rotation, {
      x: Math.PI / 3,
      duration: 0.35,
      ease: 'power2.in'
    });

    // Screen flashes cyan
    this.terminalScreenMat.emissive.setHex(0x00f0ff);
    this.terminalScreenMat.emissiveIntensity = 2.5;

    // Trigger awakening sequence callback
    if (this.awakeningCallback) {
      this.awakeningCallback();
    }

    // Hide prompt temporarily
    this.promptEl.style.display = 'none';
  }

  showLoreTransmission() {
    this.audioManager.playTerminalSwitch();
    this.loreEl.innerHTML = `
      <div style="color: #f59e0b; font-weight: 700; letter-spacing: 0.15em; margin-bottom: 6px;">
        // TRANSMISSION LOG: SECTOR 01 [MAINTENANCE DRONE #408]
      </div>
      <div style="color: #cbd5e1; font-family: monospace;">
        "GRID DISCONNECT DETECTED AT 03:14:22. CENTRAL REACTOR DUMPED CHARGE INTO GROUND CONDUITS TO PREVENT SPHERICAL CONTAINMENT BREACH. DORMANT RELAYS REQUIRE MANUAL BREAKER TRIP AT THE CIVIC PLAZA TO RESUME METROPOLITAN COMMERCE AND MAGLEV TRANSIT..."
      </div>
      <div style="margin-top: 10px; color: #64748b; font-size: 0.72rem; letter-spacing: 0.1em;">
        [PRESS ESC OR MOVE AWAY TO DISMISS]
      </div>
    `;
    this.loreEl.style.display = 'block';
  }

  update(playerPosition, time) {
    let nearest = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.interactables.length; i++) {
      const item = this.interactables[i];
      const dist = playerPosition.distanceTo(item.position);
      if (dist < item.radius && dist < minDistance) {
        minDistance = dist;
        nearest = item;
      }
    }

    this.activeInteractable = nearest;

    if (this.activeInteractable) {
      this.promptEl.textContent = this.activeInteractable.promptText;
      this.promptEl.style.display = 'block';
    } else {
      this.promptEl.style.display = 'none';
      if (this.loreEl.style.display !== 'none' && playerPosition.distanceTo(new THREE.Vector3(-20, 0.8, 24)) > 5.0) {
        this.loreEl.style.display = 'none';
      }
    }

    // Flicker droid eye
    if (this.droidEyeMat) {
      const eyeFlicker = Math.sin(time * 12.0) > 0.4 ? 1.0 : 0.2;
      this.droidEyeMat.emissiveIntensity = 0.8 * eyeFlicker;
    }
  }
}
