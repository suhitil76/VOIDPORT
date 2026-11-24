import fs from 'fs';
import path from 'path';

const candidateFiles = [
  'city_pack/Apartment building.glb',
  'city_kit/Large Building-h7Jaq7bqMq.glb',
  'city_kit/Large Building-ppwtREejXg.glb',
  'city_pack/Hotel Building.glb',
  'city_pack/Bar.glb',
  'city_pack/Skyscraper.glb',
  'city_pack/Nissan GTR.glb',
  'city_pack/Police Car.glb',
  'city_pack/2015 Dodge Challenger.glb',
  'city_pack/Billboard.glb',
  'city_pack/Traffic light.glb',
  'city_pack/Bus stop sign.glb',
  'kenney_city_kit_roads/construction-barrier.glb',
  'kenney_city_kit_roads/electricity-pole-wide.glb',
  'kenney_city_kit_roads/electricity-wires-wide.glb',
  'kenney_city_kit_roads/dumpster.glb',
  'city_builder_bits/Watertower.glb'
];

const results = [];

for (const rel of candidateFiles) {
  const full = path.resolve('assets_library', rel);
  if (!fs.existsSync(full)) {
    console.error('File missing:', full);
    continue;
  }
  const buf = fs.readFileSync(full);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());

  // Assess materials
  const mats = (json.materials || []).map(m => {
    const pbr = m.pbrMetallicRoughness || {};
    return {
      name: m.name || 'unnamed',
      hasTexture: !!(pbr.baseColorTexture || m.emissiveTexture || pbr.metallicRoughnessTexture),
      baseColorFactor: pbr.baseColorFactor,
      roughness: pbr.roughnessFactor,
      metallic: pbr.metallicFactor,
      emissive: m.emissiveFactor
    };
  });

  // Calculate dimensions
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  if (json.accessors) {
    for (const acc of json.accessors) {
      if (acc.min && acc.max && acc.type === 'VEC3') {
        min[0] = Math.min(min[0], acc.min[0]);
        min[1] = Math.min(min[1], acc.min[1]);
        min[2] = Math.min(min[2], acc.min[2]);
        max[0] = Math.max(max[0], acc.max[0]);
        max[1] = Math.max(max[1], acc.max[1]);
        max[2] = Math.max(max[2], acc.max[2]);
      }
    }
  }

  const dims = {
    x: parseFloat((max[0] - min[0]).toFixed(2)),
    y: parseFloat((max[1] - min[1]).toFixed(2)),
    z: parseFloat((max[2] - min[2]).toFixed(2))
  };

  results.push({
    file: path.basename(rel),
    pkg: path.dirname(rel),
    sizeKB: parseFloat((buf.length / 1024).toFixed(1)),
    meshes: json.meshes ? json.meshes.length : 0,
    materialsCount: mats.length,
    materialsSample: mats.slice(0, 4),
    dims,
    texturesCount: json.textures ? json.textures.length : 0,
    imagesCount: json.images ? json.images.length : 0
  });
}

console.log(JSON.stringify(results, null, 2));
