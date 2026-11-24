import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('assets_library');

function parseGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  const fileSize = buf.length;
  
  if (buf.length < 20) return { error: 'File too small' };
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) return { error: 'Not a valid GLB (magic mismatch)' };
  
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  
  const chunkLength = buf.readUInt32LE(12);
  const chunkType = buf.readUInt32LE(16);
  if (chunkType !== 0x4e4f534a) return { error: 'First chunk is not JSON' };
  
  const jsonBuf = buf.subarray(20, 20 + chunkLength);
  let gltf;
  try {
    gltf = JSON.parse(jsonBuf.toString('utf8'));
  } catch (e) {
    return { error: 'Failed to parse JSON chunk: ' + e.message };
  }
  
  let triangleCount = 0;
  let vertexCount = 0;
  let hasMissingTextures = false;
  let missingTexturesList = [];
  
  // Calculate vertices and triangles
  if (gltf.meshes) {
    for (const mesh of gltf.meshes) {
      if (!mesh.primitives) continue;
      for (const prim of mesh.primitives) {
        if (prim.indices !== undefined && gltf.accessors && gltf.accessors[prim.indices]) {
          const acc = gltf.accessors[prim.indices];
          triangleCount += Math.floor(acc.count / 3);
        } else if (prim.attributes && prim.attributes.POSITION !== undefined && gltf.accessors && gltf.accessors[prim.attributes.POSITION]) {
          const acc = gltf.accessors[prim.attributes.POSITION];
          triangleCount += Math.floor(acc.count / 3);
        }
        if (prim.attributes && prim.attributes.POSITION !== undefined && gltf.accessors && gltf.accessors[prim.attributes.POSITION]) {
          vertexCount += gltf.accessors[prim.attributes.POSITION].count;
        }
      }
    }
  }
  
  // Check for external image dependencies
  if (gltf.images) {
    for (const img of gltf.images) {
      if (img.uri && !img.uri.startsWith('data:')) {
        const imgPath = path.resolve(path.dirname(filePath), img.uri);
        if (!fs.existsSync(imgPath)) {
          hasMissingTextures = true;
          missingTexturesList.push(img.uri);
        }
      }
    }
  }

  // Get approximate bounding box dimensions from root position accessors
  let dims = { x: 0, y: 0, z: 0 };
  if (gltf.accessors) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let foundPos = false;
    for (const acc of gltf.accessors) {
      if (acc.min && acc.max && acc.type === 'VEC3') {
        minX = Math.min(minX, acc.min[0]);
        minY = Math.min(minY, acc.min[1]);
        minZ = Math.min(minZ, acc.min[2]);
        maxX = Math.max(maxX, acc.max[0]);
        maxY = Math.max(maxY, acc.max[1]);
        maxZ = Math.max(maxZ, acc.max[2]);
        foundPos = true;
      }
    }
    if (foundPos) {
      dims = {
        x: parseFloat((maxX - minX).toFixed(2)),
        y: parseFloat((maxY - minY).toFixed(2)),
        z: parseFloat((maxZ - minZ).toFixed(2))
      };
    }
  }
  
  return {
    fileSize,
    version,
    meshCount: gltf.meshes ? gltf.meshes.length : 0,
    materialCount: gltf.materials ? gltf.materials.length : 0,
    textureCount: gltf.textures ? gltf.textures.length : 0,
    vertexCount,
    triangleCount,
    dimensions: dims,
    hasMissingTextures,
    missingTexturesList
  };
}

function categorize(filename, pkg) {
  const name = filename.toLowerCase();
  
  if (name.includes('building') || name.includes('house') || name.includes('apart') || name.includes('bar') || name.includes('garage') || name.includes('mall') || name.includes('tower') || name.includes('shop') || name.includes('structure') || name.includes('church') || name.includes('inn') || name.includes('cottage') || name.includes('shack')) {
    return 'Buildings & Architecture';
  }
  if (name.includes('road') || name.includes('street') || name.includes('pavement') || name.includes('curb') || name.includes('sidewalk') || name.includes('crossing') || name.includes('driveway') || name.includes('overpass') || name.includes('bridge') || name.includes('intersection') || name.includes('highway') || name.includes('asphalt')) {
    return 'Roads & Infrastructure';
  }
  if (name.includes('sign') || name.includes('light') || name.includes('lamp') || name.includes('hydrant') || name.includes('bollard') || name.includes('barrier') || name.includes('bench') || name.includes('trash') || name.includes('bin') || name.includes('fence') || name.includes('gate') || name.includes('barrel') || name.includes('crate') || name.includes('box') || name.includes('cone') || name.includes('camera') || name.includes('billboard') || name.includes('bus stop') || name.includes('mailbox') || name.includes('phone') || name.includes('booth') || name.includes('traffic')) {
    return 'Street Props & Furniture';
  }
  if (name.includes('car') || name.includes('truck') || name.includes('van') || name.includes('vehicle') || name.includes('nissan') || name.includes('dodge') || name.includes('ambulance') || name.includes('police') || name.includes('taxi') || name.includes('bus') || name.includes('train') || name.includes('metro') || name.includes('bike') || name.includes('bicycle')) {
    return 'Vehicles & Transport';
  }
  if (name.includes('tree') || name.includes('bush') || name.includes('plant') || name.includes('flower') || name.includes('grass') || name.includes('pumpkin') || name.includes('hay') || name.includes('corn') || name.includes('wood') || name.includes('log')) {
    return 'Vegetation & Environmental';
  }
  if (name.includes('pipe') || name.includes('tank') || name.includes('turbine') || name.includes('machine') || name.includes('generator') || name.includes('crane') || name.includes('factory') || name.includes('chimney') || name.includes('vent') || name.includes('silo') || name.includes('scaffold')) {
    return 'Industrial Machinery';
  }
  if (name.includes('man') || name.includes('woman') || name.includes('character') || name.includes('zombie') || name.includes('ghost') || name.includes('skeleton') || name.includes('creature') || name.includes('bat') || name.includes('spider')) {
    return 'Characters & Creatures';
  }
  return 'Miscellaneous & Props';
}

function scanDir(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanDir(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) {
      const relPath = path.relative(assetsDir, full).replace(/\\/g, '/');
      const pkg = relPath.split('/')[0];
      const parsed = parseGLB(full);
      const category = categorize(entry.name, pkg);
      
      results.push({
        filename: entry.name,
        package: pkg,
        relativePath: relPath,
        fullPath: full,
        category,
        ...parsed
      });
    }
  }
  return results;
}

const allModels = scanDir(assetsDir);
console.log(`Scanned ${allModels.length} GLB models total.`);

// Summarize by category
const catSummary = {};
let totalPolys = 0;
let totalBytes = 0;
let missingTexCount = 0;

for (const m of allModels) {
  catSummary[m.category] = (catSummary[m.category] || 0) + 1;
  totalPolys += m.triangleCount || 0;
  totalBytes += m.fileSize || 0;
  if (m.hasMissingTextures) missingTexCount++;
}

console.log('Category breakdown:', catSummary);
console.log(`Total triangles: ${totalPolys.toLocaleString()}`);
console.log(`Total file size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`Missing texture models: ${missingTexCount}`);

fs.writeFileSync('assets_manifest.json', JSON.stringify({
  summary: {
    totalModels: allModels.length,
    totalPolygons: totalPolys,
    totalSizeBytes: totalBytes,
    totalSizeMB: parseFloat((totalBytes / 1024 / 1024).toFixed(2)),
    categoryBreakdown: catSummary,
    missingTextureCount: missingTexCount
  },
  models: allModels
}, null, 2));

console.log('Manifest written to assets_manifest.json');
