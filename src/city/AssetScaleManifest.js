/**
 * VOIDPORT — Asset Scale & Alignment Manifest
 * Central configuration providing exact real-world dimensions (in meters),
 * scale multipliers, and ground surface alignment rules for every asset.
 */

export const ASSET_SCALE_MANIFEST = {
  // ═══════════════════════════════════════════════════════════════
  // BUILDINGS & ARCHITECTURE
  // ═══════════════════════════════════════════════════════════════
  'Apartment building.glb': {
    category: 'Residential Building',
    targetDimensions: { width: 20.5, height: 38.0, depth: 11.5 },
    scale: 1.99,
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 20.0, height: 38.0, depth: 11.0 },
    reason: 'Multi-story apartment block: real-world 12-floor residential height (~38m).'
  },
  'Town House.glb': {
    category: 'Town House Building',
    targetDimensions: { width: 23.3, height: 16.0, depth: 13.6 },
    scale: 583.18, // Raw model was in tiny units (0.027m)
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 22.0, height: 16.0, depth: 13.0 },
    reason: 'Raw asset had 0.027m scale. Corrected to standard 4-story town house (16m tall).'
  },
  'Large Building-h7Jaq7bqMq.glb': {
    category: 'Commercial Building',
    targetDimensions: { width: 20.1, height: 28.0, depth: 16.1 },
    scale: 8.05, // Raw model was 3.48m
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 19.5, height: 28.0, depth: 15.5 },
    reason: 'City Kit modular block scaled from miniature unit (3.5m) to commercial highrise (28m).'
  },
  'Hospital.glb': {
    category: 'Civic Hospital Building',
    targetDimensions: { width: 32.5, height: 32.0, depth: 60.8 },
    scale: 0.0972, // Raw model was in centimeters (329m)
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 31.0, height: 32.0, depth: 59.0 },
    reason: 'Raw model was 625cm long. Corrected from 600m to 60.8m length, 32m height.'
  },
  'Hotel Building.glb': {
    category: 'Hotel Highrise',
    targetDimensions: { width: 37.1, height: 26.0, depth: 15.2 },
    scale: 10.68, // Raw model was 2.43m
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 36.0, height: 26.0, depth: 15.0 },
    reason: 'Low-poly modular hotel scaled from 2.4m to realistic 8-story commercial hotel (26m).'
  },
  'Building.glb': {
    category: 'Office Building',
    targetDimensions: { width: 26.5, height: 22.0, depth: 31.3 },
    scale: 570.57, // Raw model was in tiny units (0.038m)
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 25.0, height: 22.0, depth: 30.0 },
    reason: 'Raw miniature asset corrected to 6-story commercial office block (22m).'
  },
  'Skyscraper.glb': {
    category: 'Skyscraper Landmark',
    targetDimensions: { width: 22.3, height: 110.0, depth: 34.1 },
    scale: 3.325,
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 22.0, height: 110.0, depth: 34.0 },
    reason: 'Terminal avenue skyscraper: 35-story skyscraper tower (110m tall).'
  },
  'Skyscraper by Poly by Google - dIsZyy2FUY-.glb': {
    category: 'Skyscraper Background',
    targetDimensions: { width: 23.4, height: 115.0, depth: 35.7 },
    scale: 3.477,
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 23.0, height: 115.0, depth: 35.0 },
    reason: 'Flanking skyline skyscraper: 115m tall hero backdrop tower.'
  },

  // ═══════════════════════════════════════════════════════════════
  // VEHICLES
  // ═══════════════════════════════════════════════════════════════
  'Nissan GTR.glb': {
    category: 'Sports Car',
    targetDimensions: { width: 1.83, height: 1.52, depth: 4.68 },
    scale: 0.7588, // Raw length was 6.17m
    surfaceType: 'road',
    surfaceY: 0.01,
    hasCollision: true,
    colliderSize: { width: 1.9, height: 1.5, depth: 4.7 },
    reason: 'Raw asset was 6.17m long. Normalized to authentic Nissan R35 GT-R specs (4.68m length).'
  },
  'Police Car.glb': {
    category: 'Police Patrol Vehicle',
    targetDimensions: { width: 2.15, height: 1.75, depth: 4.85 },
    scale: 1.30, // Raw length was 3.73m
    surfaceType: 'road',
    surfaceY: 0.01,
    hasCollision: true,
    colliderSize: { width: 2.2, height: 1.8, depth: 4.9 },
    reason: 'Raw vehicle was shortened to 3.7m. Scaled to standard police cruiser length (4.85m).'
  },
  'SUV.glb': {
    category: 'Full-size SUV',
    targetDimensions: { width: 2.15, height: 1.82, depth: 4.95 },
    scale: 1.176, // Raw length was 4.21m
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 2.2, height: 1.9, depth: 5.0 },
    reason: 'Scaled to realistic full-size urban SUV dimensions (4.95m length, 1.82m height).'
  },
  'Convertible.glb': {
    category: 'Roadster Vehicle',
    targetDimensions: { width: 1.94, height: 1.45, depth: 4.55 },
    scale: 0.4486, // Raw model was 10.14m long (huge!)
    surfaceType: 'road',
    surfaceY: 0.01,
    hasCollision: true,
    colliderSize: { width: 2.0, height: 1.5, depth: 4.6 },
    reason: 'Raw model had 10.14m length (double car size). Normalized to 4.55m roadster length.'
  },

  // ═══════════════════════════════════════════════════════════════
  // STREET PROPS & STOREFRONTS
  // ═══════════════════════════════════════════════════════════════
  'Bar.glb': {
    category: 'Storefront Bar',
    targetDimensions: { width: 6.11, height: 5.20, depth: 6.37 },
    scale: 0.0225, // Raw model was 231 units tall
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 6.0, height: 5.2, depth: 6.2 },
    reason: 'Raw asset was 231m. Scaled to single-story street corner bar building (5.2m height).'
  },
  'Billboard.glb': {
    category: 'Highrise Billboard',
    targetDimensions: { width: 7.88, height: 12.0, depth: 11.08 },
    scale: 0.0179, // Raw was 670 units tall
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 2.0, height: 12.0, depth: 2.0 },
    reason: 'Elevated roadside commercial billboard (12m total pole + sign height).'
  },
  'Traffic light.glb': {
    category: 'Roadside Traffic Light',
    targetDimensions: { width: 1.45, height: 5.20, depth: 0.95 },
    scale: 536.37, // Raw model was 0.0097m (sub-centimeter)
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 0.5, height: 5.2, depth: 0.5 },
    reason: 'Raw millimeter model scaled to standard 5.2m intersection traffic signal pole.'
  },
  'Bus stop sign.glb': {
    category: 'Bus Stop Sign Pole',
    targetDimensions: { width: 0.65, height: 2.50, depth: 0.65 },
    scale: 268.0,
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: false,
    reason: 'Scaled to realistic 2.5m curbside bus stop transit marker.'
  },
  'Stop sign.glb': {
    category: 'Street Stop Sign',
    targetDimensions: { width: 0.75, height: 2.35, depth: 0.75 },
    scale: 0.01018, // Raw was 230m tall (11km with scale 50!)
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: false,
    reason: 'CRITICAL FIX: Raw model was 230m. Reduced from 11,543m to standard 2.35m pole height.'
  },
  'Vending Machine by Don Carson - 0CX6wj64Swu.glb': {
    category: 'Beverage Vending Machine',
    targetDimensions: { width: 1.15, height: 2.05, depth: 0.95 },
    scale: 0.729, // Raw model was 2.81m tall
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 1.15, height: 2.05, depth: 0.95 },
    reason: 'Normalized from 6.2m giant machine to standard 2.05m beverage dispenser.'
  },
  'Barricade.glb': {
    category: 'Street Crowd Barricade',
    targetDimensions: { width: 2.24, height: 1.05, depth: 0.62 },
    scale: 75.75, // Raw was 0.013m
    surfaceType: 'road',
    surfaceY: 0.01,
    hasCollision: true,
    colliderSize: { width: 2.2, height: 1.05, depth: 0.6 },
    reason: 'Scaled from 1cm miniature to standard 1.05m high metal police crowd barrier.'
  },
  'Store by Mrhadley - yzNqr0VvSP.glb': {
    category: 'Street Retail Store',
    targetDimensions: { width: 18.5, height: 6.5, depth: 12.0 },
    scale: 0.1916, // Raw was 33.9m tall
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 18.0, height: 6.5, depth: 11.5 },
    reason: 'Normalized from 102m high mega-cube to realistic 6.5m two-story retail shop.'
  },

  // ═══════════════════════════════════════════════════════════════
  // CYBERPUNK & INDUSTRIAL PROPS
  // ═══════════════════════════════════════════════════════════════
  'Cyberpunk Signs.glb': {
    category: 'Wall Neon Signage',
    targetDimensions: { width: 3.38, height: 3.50, depth: 2.52 },
    scale: 198.07,
    surfaceType: 'wall',
    surfaceY: 4.2,
    hasCollision: false,
    reason: 'Scaled to readable 3.5m wall-mounted storefront neon signage.'
  },
  'TV Tower.glb': {
    category: 'Antenna Tower',
    targetDimensions: { width: 4.5, height: 22.0, depth: 4.5 },
    scale: 1800.0,
    surfaceType: 'ground',
    surfaceY: 0.0,
    hasCollision: true,
    colliderSize: { width: 3.5, height: 22.0, depth: 3.5 },
    reason: 'Industrial rooftop/alley transmission lattice tower (22m tall).'
  },
  'Cyberpunk Platform-ctQ5CDmraQ.glb': {
    category: 'Elevated Platform',
    targetDimensions: { width: 8.5, height: 4.5, depth: 8.0 },
    scale: 115.28,
    surfaceType: 'elevated',
    surfaceY: 14.0,
    hasCollision: true,
    colliderSize: { width: 8.5, height: 4.5, depth: 8.0 },
    reason: 'Skybridge landing platform suspended between buildings at 14m elevation.'
  },
  'Ac Stacked.glb': {
    category: 'Rooftop HVAC',
    targetDimensions: { width: 2.4, height: 2.2, depth: 1.8 },
    scale: 430.14,
    surfaceType: 'rooftop',
    surfaceY: 38.0, // Roof of apartment building
    hasCollision: false,
    reason: 'Building ventilation chiller unit (2.2m tall) placed on roof parapet.'
  },
  'Antenna.glb': {
    category: 'Telecom Antenna',
    targetDimensions: { width: 1.5, height: 5.0, depth: 1.5 },
    scale: 2500.0,
    surfaceType: 'rooftop',
    surfaceY: 32.0,
    hasCollision: false,
    reason: 'Commercial rooftop 5m cellular mast.'
  },
  'Pipe.glb': {
    category: 'Industrial Conduit',
    targetDimensions: { width: 1.2, height: 6.0, depth: 0.8 },
    scale: 1078.39,
    surfaceType: 'wall',
    surfaceY: 4.0,
    hasCollision: false,
    reason: 'Vertical drainage and cooling pipe affixed to building exterior.'
  },
  'TV.glb': {
    category: 'Street Wall Display',
    targetDimensions: { width: 2.4, height: 1.8, depth: 0.6 },
    scale: 522.05,
    surfaceType: 'wall',
    surfaceY: 3.0,
    hasCollision: false,
    reason: 'Curbside digital advertising display (2.4m wide x 1.8m tall).'
  },

  // ═══════════════════════════════════════════════════════════════
  // CITY BUILDER BITS PROPS
  // ═══════════════════════════════════════════════════════════════
  'Dumpster.glb': {
    category: 'Alley Dumpster Bin',
    targetDimensions: { width: 2.1, height: 1.45, depth: 1.4 },
    scale: 457.01,
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 2.1, height: 1.45, depth: 1.4 },
    reason: 'Enlarged from 17cm miniature to realistic 1.45m high commercial steel dumpster.'
  },
  'Fire Hydrant.glb': {
    category: 'Sidewalk Fire Hydrant',
    targetDimensions: { width: 0.51, height: 0.85, depth: 0.50 },
    scale: 378.46,
    surfaceType: 'sidewalk',
    surfaceY: 0.25,
    hasCollision: true,
    colliderSize: { width: 0.5, height: 0.85, depth: 0.5 },
    reason: 'Enlarged from 11cm toy to standard 0.85m municipal cast-iron fire hydrant.'
  },
  'Watertower.glb': {
    category: 'Rooftop Water Tower',
    targetDimensions: { width: 6.33, height: 8.50, depth: 6.33 },
    scale: 1268.65,
    surfaceType: 'rooftop',
    surfaceY: 38.0,
    hasCollision: false,
    reason: 'Enlarged from 44cm model to full-scale 8.5m rooftop water cistern.'
  }
};

/**
 * Helper to get the manifest entry for a model by filename or path
 */
export function getAssetConfig(pathOrFilename) {
  const filename = pathOrFilename.split('/').pop();
  return ASSET_SCALE_MANIFEST[filename] || null;
}
