/**
 * VOIDPORT — AssetLoader
 * Loads and normalizes GLB/GLTF 3D models with scale corrections,
 * material overrides for cyberpunk aesthetic, and error handling.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { ASSET_SCALE_MANIFEST, getAssetConfig } from '../city/AssetScaleManifest.js';

let gltfLoader = null;

function getLoader() {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  return gltfLoader;
}

/**
 * Determine scale factor for a model using central AssetScaleManifest first,
 * then falling back to options.scale or 1.0.
 */
function getScaleFactor(path, overrideScale) {
  if (overrideScale !== undefined && overrideScale !== null) {
    return overrideScale;
  }
  
  const manifest = getAssetConfig(path);
  if (manifest && manifest.scale !== undefined) {
    return manifest.scale;
  }
  
  return 1.0;
}

/**
 * Load a GLB/GLTF model with scale normalization, precise ground snapping,
 * and optional collision box registration.
 * @param {string} path - URL path to the model (relative to public/)
 * @param {Object} options
 * @param {number} [options.scale] - Override scale factor
 * @param {THREE.Vector3} [options.position] - World position
 * @param {number} [options.rotationY] - Y-axis rotation in radians
 * @param {number} [options.surfaceY] - Supporting surface height to snap bottom to
 * @param {boolean} [options.snapToGround=true] - Whether to snap bottom Y to surface
 * @param {boolean} [options.cyberpunkOverride] - Apply dark cyberpunk materials
 * @param {number} [options.emissiveIntensity] - Emissive intensity for windows
 * @param {THREE.Color} [options.emissiveColor] - Emissive color
 * @param {boolean} [options.castShadow] - Enable shadow casting
 * @param {boolean} [options.receiveShadow] - Enable shadow receiving
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<THREE.Group>}
 */
export function loadModel(path, options = {}) {
  const loader = getLoader();
  const manifest = getAssetConfig(path);
  
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        
        // 1. Apply verified scale factor
        const scaleFactor = getScaleFactor(path, options.scale);
        model.scale.setScalar(scaleFactor);
        
        // 2. Apply rotation before computing bounding box
        if (options.rotationY !== undefined) {
          model.rotation.y = options.rotationY;
        }
        
        // 3. Apply position (horizontal)
        if (options.position) {
          model.position.x = options.position.x;
          model.position.z = options.position.z;
          model.position.y = options.position.y || 0;
        }

        // Force matrix update so bounding box can be accurately measured in world space
        model.updateMatrixWorld(true);
        
        // 4. Ground Snapping: Align bottom bounding box to intended supporting surface
        if (options.snapToGround !== false) {
          const targetSurfaceY = options.surfaceY !== undefined 
            ? options.surfaceY 
            : (manifest?.surfaceY !== undefined ? manifest.surfaceY : 0.0);
          
          const box = new THREE.Box3().setFromObject(model);
          const currentBottomY = box.min.y;
          const verticalOffset = targetSurfaceY - currentBottomY;
          model.position.y += verticalOffset;
          model.updateMatrixWorld(true);
        }
        
        // 5. Apply shadows and material enhancements
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = options.castShadow !== false;
            child.receiveShadow = options.receiveShadow !== false;
            
            if (options.cyberpunkOverride) {
              applyCyberpunkMaterials(child, options);
            }
          }
        });
        
        // 6. Compute final accurate world bounding box for physics collision
        const finalWorldBox = new THREE.Box3().setFromObject(model);
        model.userData.sourcePath = path;
        model.userData.originalScale = scaleFactor;
        model.userData.worldBox = finalWorldBox;
        model.userData.hasCollision = manifest?.hasCollision ?? (options.hasCollision || false);
        model.userData.category = manifest?.category || 'Prop';
        
        resolve(model);
      },
      options.onProgress || undefined,
      (error) => {
        console.error(`Failed to load model: ${path}`, error);
        reject(error);
      }
    );
  });
}

/**
 * Apply cool slate/navy cinematic material tone without crushing blacks or losing textures
 */
function applyCyberpunkMaterials(mesh, options = {}) {
  if (!mesh.material) return;
  
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  
  materials.forEach((mat) => {
    if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) return;
    
    // If the material has a diffuse texture map (e.g. Apartment building, detailed facades),
    // preserve full texture readability with a very subtle cool tone
    if (mat.map) {
      if (mat.color) {
        // Keep texture light and readable, subtle cool tint
        mat.color.setRGB(0.85, 0.88, 0.95);
      }
      mat.roughness = Math.min(mat.roughness || 0.8, 0.75);
      mat.metalness = Math.max(mat.metalness || 0, 0.1);
    } else if (mat.color) {
      // Untextured materials: tone into cool slate-charcoal without crushing blacks
      const hsl = {};
      mat.color.getHSL(hsl);
      // Soften saturation, maintain healthy lightness (0.32 - 0.55) for clear visibility
      const targetL = Math.max(hsl.l * 0.75, 0.32);
      // Shift towards cool slate/blue-grey if too warm
      const targetH = hsl.s > 0.3 && (hsl.h < 0.4 || hsl.h > 0.85) ? 0.6 : hsl.h;
      mat.color.setHSL(targetH, hsl.s * 0.5, Math.min(targetL, 0.55));
      mat.roughness = Math.min(mat.roughness || 0.8, 0.7);
      mat.metalness = Math.max(mat.metalness || 0, 0.2);
    }
    
    // Add subtle emissive for window-like materials
    if (options.emissiveIntensity && mat.name && 
        (mat.name.toLowerCase().includes('window') || 
         mat.name.toLowerCase().includes('glass') ||
         mat.name.toLowerCase().includes('light') ||
         mat.name.toLowerCase().includes('screen'))) {
      mat.emissive = options.emissiveColor || new THREE.Color(0x334466);
      mat.emissiveIntensity = options.emissiveIntensity;
    }
    
    mat.needsUpdate = true;
  });
}

/**
 * Load multiple models in parallel with a progress tracker
 * @param {Array<{path: string, options: Object}>} modelConfigs
 * @param {Function} [onProgress] - Called with (loaded, total)
 * @returns {Promise<THREE.Group[]>}
 */
export async function loadModels(modelConfigs, onProgress) {
  let loaded = 0;
  const total = modelConfigs.length;
  
  const promises = modelConfigs.map(({ path, options }) => {
    return loadModel(path, options).then((model) => {
      loaded++;
      if (onProgress) onProgress(loaded, total);
      return model;
    }).catch((err) => {
      loaded++;
      if (onProgress) onProgress(loaded, total);
      console.warn(`Skipping failed model: ${path}`);
      return null; // Don't fail the entire batch
    });
  });
  
  const results = await Promise.all(promises);
  return results.filter(Boolean); // Remove nulls from failed loads
}

export default { loadModel, loadModels };
