import * as THREE from 'three';

/**
 * Procedural PBR Texture Generator
 * Generates realistic architectural facade maps, wet asphalt normal/roughness,
 * and clean office/residential window grids matching the reference images.
 */
export class TextureGenerator {
  static createAsphaltDiffuse(width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c202a';
    ctx.fillRect(0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      data[i] = Math.max(18, Math.min(55, 28 + n));
      data[i + 1] = Math.max(20, Math.min(60, 32 + n));
      data[i + 2] = Math.max(26, Math.min(70, 40 + n));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createAsphaltNormal(width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const nx = 128 + (Math.random() - 0.5) * 28;
      const ny = 128 + (Math.random() - 0.5) * 28;
      data[i] = Math.min(255, Math.max(0, nx));
      data[i + 1] = Math.min(255, Math.max(0, ny));
      data[i + 2] = 245;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createWetRoadRoughness(width = 1024, height = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Smooth wet sheen base (roughness ~0.35)
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, width, height);

    // Deep mirror puddles (roughness ~0.04)
    const numPuddles = 28;
    for (let i = 0; i < numPuddles; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const rad = 45 + Math.random() * 85;

      const grad = ctx.createRadialGradient(px, py, 10, px, py, rad);
      grad.addColorStop(0, '#050505');
      grad.addColorStop(0.5, '#151515');
      grad.addColorStop(1, '#444444');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createConcreteTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22252e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#14161c';
    ctx.lineWidth = 2;
    for (let y = 0; y <= height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates crisp, realistic architectural window grids:
   * Dark sleek glass facade with defined floor plates, mullions,
   * and selectively lit rooms (matching Reference Image 1).
   */
  static createWindowGridTexture(width = 1024, height = 1024, dormant = true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Pure pitch black background (unlit glass & dark spandrels)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const floors = 24;
    const bays = 12;
    const floorH = height / floors;
    const bayW = width / bays;

    for (let f = 0; f < floors; f++) {
      const y = f * floorH;

      for (let b = 0; b < bays; b++) {
        const x = b * bayW;
        const winW = bayW - 8;
        const winH = floorH - 10;

        const rand = Math.random();

        if (dormant) {
          // Dormant: 95% dark, occasional isolated emergency room
          if (rand < 0.05) {
            ctx.fillStyle = rand < 0.02 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(217, 70, 239, 0.5)';
            ctx.fillRect(x + 4, y + 6, winW, winH);
          }
        } else {
          // Awakened: ~32% of windows selectively lit in clusters (like real city towers)
          if (rand < 0.32) {
            if (rand < 0.12) {
              // Electric violet/magenta (from reference 1)
              ctx.fillStyle = `rgba(217, 70, 239, ${0.8 + Math.random() * 0.2})`;
            } else if (rand < 0.22) {
              // Electric cyan (from reference 1 & 3)
              ctx.fillStyle = `rgba(56, 189, 248, ${0.75 + Math.random() * 0.25})`;
            } else {
              // Clean warm white / tungsten
              ctx.fillStyle = `rgba(254, 243, 199, ${0.7 + Math.random() * 0.3})`;
            }
            ctx.fillRect(x + 4, y + 6, winW, winH);
          }
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }
}
