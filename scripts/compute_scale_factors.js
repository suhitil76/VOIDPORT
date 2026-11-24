import fs from 'fs';
import path from 'path';

// Target real-world specifications (in meters)
const ASSET_TARGET_SPECS = {
  // Buildings
  'Apartment building (city_pack)': { targetHeight: 38.0, surface: 0.0, category: 'Building' },
  'Town House (city_pack)': { targetHeight: 16.0, surface: 0.0, category: 'Building' },
  'Large Building-h7Jaq7bqMq (city_kit)': { targetHeight: 28.0, surface: 0.0, category: 'Building' },
  'Hospital (city_pack)': { targetHeight: 32.0, surface: 0.0, category: 'Building' },
  'Hotel Building (city_pack)': { targetHeight: 26.0, surface: 0.0, category: 'Building' },
  'Building (city_pack)': { targetHeight: 22.0, surface: 0.0, category: 'Building' },
  'Skyscraper (city_pack)': { targetHeight: 110.0, surface: 0.0, category: 'Skyscraper' },
  'Skyscraper by Poly by Google (ref_images)': { targetHeight: 115.0, surface: 0.0, category: 'Skyscraper' },

  // Vehicles (length ~4.5 - 5.0m, height ~1.4 - 1.8m)
  'Nissan GTR (city_pack)': { targetLength: 4.68, surface: 0.01, category: 'Vehicle' }, // Real GTR length 4.69m
  'Police Car (city_pack)': { targetLength: 4.85, surface: 0.01, category: 'Vehicle' },
  'SUV (city_pack)': { targetLength: 4.95, surface: 0.01, category: 'Vehicle' },
  'Convertible (city_pack)': { targetLength: 4.55, surface: 0.01, category: 'Vehicle' },

  // Street Props (Pedestrian & Street furniture)
  'Bar (city_pack)': { targetHeight: 5.2, surface: 0.12, category: 'Storefront' },
  'Billboard (city_pack)': { targetHeight: 12.0, surface: 0.12, category: 'Billboard' },
  'Traffic light (city_pack)': { targetHeight: 5.2, surface: 0.12, category: 'Traffic Light' },
  'Bus stop sign (city_pack)': { targetHeight: 2.5, surface: 0.12, category: 'Sign' },
  'Stop sign (city_pack)': { targetHeight: 2.35, surface: 0.12, category: 'Sign' },
  'Vending Machine (props)': { targetHeight: 2.05, surface: 0.12, category: 'Street Prop' },
  'Barricade (props/Concert Pack)': { targetHeight: 1.05, surface: 0.01, category: 'Barricade' },
  'Store (props)': { targetHeight: 6.5, surface: 0.12, category: 'Storefront' },

  // Cyberpunk & Industrial Props
  'Cyberpunk Signs (props/Cyberpunk Game Kit)': { targetHeight: 3.5, surface: 4.0, category: 'Wall Sign' },
  'TV Tower (props/Cyberpunk Game Kit)': { targetHeight: 22.0, surface: 0.0, category: 'Antenna Tower' },
  'Cyberpunk Platform (props/Cyberpunk Game Kit)': { targetHeight: 4.5, surface: 14.0, category: 'Platform' },
  'Ac Stacked (props/Cyberpunk Game Kit)': { targetHeight: 2.2, surface: 20.0, category: 'Rooftop HVAC' },
  'Antenna (props/Cyberpunk Game Kit)': { targetHeight: 5.0, surface: 25.0, category: 'Antenna' },
  'Pipe (props/Cyberpunk Game Kit)': { targetHeight: 6.0, surface: 4.0, category: 'Conduit' },
  'TV (props/Cyberpunk Game Kit)': { targetHeight: 1.8, surface: 3.0, category: 'Wall Display' },

  // City Builder Bits
  'Dumpster (city_builder_bits)': { targetHeight: 1.45, surface: 0.12, category: 'Dumpster' },
  'Fire Hydrant (city_builder_bits)': { targetHeight: 0.85, surface: 0.12, category: 'Fire Hydrant' },
  'Watertower (city_builder_bits)': { targetHeight: 8.5, surface: 16.0, category: 'Rooftop Water Tower' }
};

// Calculate exact scale factor for each asset based on raw geometry bounds
const files = [
  { name: 'Apartment building (city_pack)', file: 'public/assets_library/city_pack/Apartment building.glb' },
  { name: 'Town House (city_pack)', file: 'public/assets_library/city_pack/Town House.glb' },
  { name: 'Large Building-h7Jaq7bqMq (city_kit)', file: 'public/assets_library/city_kit/Large Building-h7Jaq7bqMq.glb' },
  { name: 'Hospital (city_pack)', file: 'public/assets_library/city_pack/Hospital.glb' },
  { name: 'Hotel Building (city_pack)', file: 'public/assets_library/city_pack/Hotel Building.glb' },
  { name: 'Building (city_pack)', file: 'public/assets_library/city_pack/Building.glb' },
  { name: 'Skyscraper (city_pack)', file: 'public/assets_library/city_pack/Skyscraper.glb' },
  { name: 'Skyscraper by Poly by Google (ref_images)', file: 'public/ref_images/Skyscraper by Poly by Google - dIsZyy2FUY-.glb' },
  { name: 'Nissan GTR (city_pack)', file: 'public/assets_library/city_pack/Nissan GTR.glb' },
  { name: 'Police Car (city_pack)', file: 'public/assets_library/city_pack/Police Car.glb' },
  { name: 'SUV (city_pack)', file: 'public/assets_library/city_pack/SUV.glb' },
  { name: 'Convertible (city_pack)', file: 'public/assets_library/city_pack/Convertible.glb' },
  { name: 'Bar (city_pack)', file: 'public/assets_library/city_pack/Bar.glb' },
  { name: 'Billboard (city_pack)', file: 'public/assets_library/city_pack/Billboard.glb' },
  { name: 'Traffic light (city_pack)', file: 'public/assets_library/city_pack/Traffic light.glb' },
  { name: 'Bus stop sign (city_pack)', file: 'public/assets_library/city_pack/Bus stop sign.glb' },
  { name: 'Stop sign (city_pack)', file: 'public/assets_library/city_pack/Stop sign.glb' },
  { name: 'Vending Machine (props)', file: 'public/props/Vending Machine by Don Carson - 0CX6wj64Swu.glb' },
  { name: 'Barricade (props/Concert Pack)', file: 'public/props/Concert Pack-glb/Barricade.glb' },
  { name: 'Store (props)', file: 'public/props/Store by Mrhadley - yzNqr0VvSP.glb' },
  { name: 'Cyberpunk Signs (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/Cyberpunk Signs.glb' },
  { name: 'TV Tower (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/TV Tower.glb' },
  { name: 'Cyberpunk Platform (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/Cyberpunk Platform-ctQ5CDmraQ.glb' },
  { name: 'Ac Stacked (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/Ac Stacked.glb' },
  { name: 'Antenna (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/Antenna.glb' },
  { name: 'Pipe (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/Pipe.glb' },
  { name: 'TV (props/Cyberpunk Game Kit)', file: 'public/props/Cyberpunk Game Kit-glb/TV.glb' },
  { name: 'Dumpster (city_builder_bits)', file: 'public/assets_library/city_builder_bits/Dumpster.glb' },
  { name: 'Fire Hydrant (city_builder_bits)', file: 'public/assets_library/city_builder_bits/Fire Hydrant.glb' },
  { name: 'Watertower (city_builder_bits)', file: 'public/assets_library/city_builder_bits/Watertower.glb' }
];

const auditResults = [];

for (const it of files) {
  const fullPath = path.resolve(it.file);
  const spec = ASSET_TARGET_SPECS[it.name];
  if (!fs.existsSync(fullPath) || !spec) continue;

  const buf = fs.readFileSync(fullPath);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());

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

  const rawW = max[0] - min[0];
  const rawH = max[1] - min[1];
  const rawD = max[2] - min[2];

  let scale = 1.0;
  if (spec.targetLength) {
    // For vehicles, determine which axis is the length axis (usually Z or Y or X)
    const maxHoriz = Math.max(rawW, rawD);
    scale = spec.targetLength / maxHoriz;
  } else if (spec.targetHeight) {
    scale = spec.targetHeight / rawH;
  }

  const newW = rawW * scale;
  const newH = rawH * scale;
  const newD = rawD * scale;
  const bottomOffset = min[1] * scale; // Amount below model origin

  auditResults.push({
    name: it.name,
    category: spec.category,
    rawDimensions: `${rawW.toFixed(2)}m × ${rawH.toFixed(2)}m × ${rawD.toFixed(2)}m`,
    calculatedScale: scale,
    targetDimensions: `${newW.toFixed(2)}m × ${newH.toFixed(2)}m × ${newD.toFixed(2)}m`,
    rawMinY: min[1].toFixed(2),
    bottomOffset: bottomOffset.toFixed(2),
    targetSurfaceY: spec.surface
  });
}

console.log('COMPUTED SCALE FACTORS AND OFFSETS:');
console.table(auditResults);
