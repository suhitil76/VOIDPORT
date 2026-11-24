import fs from 'fs';
import path from 'path';

// All models currently configured in test_district_main.js
const assetsInScene = [
  // Buildings
  { name: 'Apartment building (city_pack)', path: 'public/assets_library/city_pack/Apartment building.glb', currentScale: 2.4, targetType: 'Residential Building' },
  { name: 'Town House (city_pack)', path: 'public/assets_library/city_pack/Town House.glb', currentScale: 1.4, targetType: 'Town House Building' },
  { name: 'Large Building-h7Jaq7bqMq (city_kit)', path: 'public/assets_library/city_kit/Large Building-h7Jaq7bqMq.glb', currentScale: 8.5, targetType: 'Commercial Building' },
  { name: 'Hospital (city_pack)', path: 'public/assets_library/city_pack/Hospital.glb', currentScale: 1.85, targetType: 'Civic Hospital Building' },
  { name: 'Hotel Building (city_pack)', path: 'public/assets_library/city_pack/Hotel Building.glb', currentScale: 1.6, targetType: 'Hotel Highrise' },
  { name: 'Building (city_pack)', path: 'public/assets_library/city_pack/Building.glb', currentScale: 1.6, targetType: 'Office Building' },
  { name: 'Skyscraper (city_pack)', path: 'public/assets_library/city_pack/Skyscraper.glb', currentScale: 3.2, targetType: 'Skyscraper Landmark' },
  { name: 'Skyscraper by Poly by Google (ref_images)', path: 'public/ref_images/Skyscraper by Poly by Google - dIsZyy2FUY-.glb', currentScale: 3.5, targetType: 'Skyscraper Background' },
  
  // Vehicles
  { name: 'Nissan GTR (city_pack)', path: 'public/assets_library/city_pack/Nissan GTR.glb', currentScale: 1.15, targetType: 'Sports Car' },
  { name: 'Police Car (city_pack)', path: 'public/assets_library/city_pack/Police Car.glb', currentScale: 1.15, targetType: 'Police Patrol Vehicle' },
  { name: 'SUV (city_pack)', path: 'public/assets_library/city_pack/SUV.glb', currentScale: 1.15, targetType: 'Full-size SUV' },
  { name: 'Convertible (city_pack)', path: 'public/assets_library/city_pack/Convertible.glb', currentScale: 1.15, targetType: 'Roadster Vehicle' },
  
  // Props & Street Furniture
  { name: 'Bar (city_pack)', path: 'public/assets_library/city_pack/Bar.glb', currentScale: 0.013, targetType: 'Storefront Bar' },
  { name: 'Billboard (city_pack)', path: 'public/assets_library/city_pack/Billboard.glb', currentScale: 0.016, targetType: 'Highrise Billboard' },
  { name: 'Traffic light (city_pack)', path: 'public/assets_library/city_pack/Traffic light.glb', currentScale: 100, targetType: 'Roadside Traffic Light' },
  { name: 'Bus stop sign (city_pack)', path: 'public/assets_library/city_pack/Bus stop sign.glb', currentScale: 100, targetType: 'Bus Stop Sign Pole' },
  { name: 'Stop sign (city_pack)', path: 'public/assets_library/city_pack/Stop sign.glb', currentScale: 50, targetType: 'Street Stop Sign' },
  { name: 'Vending Machine (props)', path: 'public/props/Vending Machine by Don Carson - 0CX6wj64Swu.glb', currentScale: 2.2, targetType: 'Beverage Vending Machine' },
  { name: 'Barricade (props/Concert Pack)', path: 'public/props/Concert Pack-glb/Barricade.glb', currentScale: 2.2, targetType: 'Street Crowd Barricade' },
  { name: 'Store (props)', path: 'public/props/Store by Mrhadley - yzNqr0VvSP.glb', currentScale: 3.0, targetType: 'Street Retail Store' },
  
  // Cyberpunk Pack Props
  { name: 'Cyberpunk Signs (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/Cyberpunk Signs.glb', currentScale: 3.2, targetType: 'Wall Neon Signage' },
  { name: 'TV Tower (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/TV Tower.glb', currentScale: 5.5, targetType: 'Rooftop Antenna Tower' },
  { name: 'Cyberpunk Platform (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/Cyberpunk Platform-ctQ5CDmraQ.glb', currentScale: 4.2, targetType: 'Elevated Walkway/Platform' },
  { name: 'Ac Stacked (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/Ac Stacked.glb', currentScale: 3.5, targetType: 'Rooftop HVAC Unit' },
  { name: 'Antenna (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/Antenna.glb', currentScale: 4.5, targetType: 'Telecom Antenna' },
  { name: 'Pipe (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/Pipe.glb', currentScale: 4.0, targetType: 'Industrial Conduit Pipe' },
  { name: 'TV (props/Cyberpunk Game Kit)', path: 'public/props/Cyberpunk Game Kit-glb/TV.glb', currentScale: 3.2, targetType: 'Street Wall Display' },
  
  // City Builder Bits
  { name: 'Dumpster (city_builder_bits)', path: 'public/assets_library/city_builder_bits/Dumpster.glb', currentScale: 55, targetType: 'Alley Dumpster Bin' },
  { name: 'Fire Hydrant (city_builder_bits)', path: 'public/assets_library/city_builder_bits/Fire Hydrant.glb', currentScale: 50, targetType: 'Sidewalk Fire Hydrant' },
  { name: 'Watertower (city_builder_bits)', path: 'public/assets_library/city_builder_bits/Watertower.glb', currentScale: 65, targetType: 'Rooftop Water Tower' }
];

console.log('AUDITING ASSET DIMENSIONS & BOUNDING BOXES...\n');

const results = [];

for (const item of assetsInScene) {
  const fullPath = path.resolve(item.path);
  if (!fs.existsSync(fullPath)) {
    console.error('NOT FOUND:', fullPath);
    continue;
  }
  
  const buf = fs.readFileSync(fullPath);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString());
  
  let rawMin = [Infinity, Infinity, Infinity];
  let rawMax = [-Infinity, -Infinity, -Infinity];
  
  if (json.accessors) {
    for (const acc of json.accessors) {
      if (acc.min && acc.max && acc.type === 'VEC3') {
        rawMin[0] = Math.min(rawMin[0], acc.min[0]);
        rawMin[1] = Math.min(rawMin[1], acc.min[1]);
        rawMin[2] = Math.min(rawMin[2], acc.min[2]);
        rawMax[0] = Math.max(rawMax[0], acc.max[0]);
        rawMax[1] = Math.max(rawMax[1], acc.max[1]);
        rawMax[2] = Math.max(rawMax[2], acc.max[2]);
      }
    }
  }
  
  const rawW = rawMax[0] - rawMin[0];
  const rawH = rawMax[1] - rawMin[1];
  const rawD = rawMax[2] - rawMin[2];
  
  const curW = rawW * item.currentScale;
  const curH = rawH * item.currentScale;
  const curD = rawD * item.currentScale;
  const curBottomY = rawMin[1] * item.currentScale;
  
  results.push({
    name: item.name,
    targetType: item.targetType,
    rawSize: [round(rawW), round(rawH), round(rawD)],
    rawMinY: round(rawMin[1]),
    currentScale: item.currentScale,
    currentSize: [round(curW), round(curH), round(curD)],
    currentBottomY: round(curBottomY)
  });
}

function round(v) {
  return Math.round(v * 100) / 100;
}

console.log(JSON.stringify(results, null, 2));
