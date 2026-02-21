export const TRAITS = [
  { code: 'GEDR', label: 'Reasoning', min: 1, max: 6 },
  { code: 'GEDM', label: 'Math', min: 1, max: 6 },
  { code: 'GEDL', label: 'Language', min: 1, max: 6 },
  { code: 'APTS', label: 'Spatial Perception', min: 1, max: 5 },
  { code: 'APTP', label: 'Form Perception', min: 1, max: 5 },
  { code: 'APTQ', label: 'Clerical Perception', min: 1, max: 5 },
  { code: 'APTK', label: 'Motor Coordination', min: 1, max: 5 },
  { code: 'APTF', label: 'Finger Dexterity', min: 1, max: 5 },
  { code: 'APTM', label: 'Manual Dexterity', min: 1, max: 5 },
  { code: 'APTE', label: 'Eye-Hand-Foot', min: 1, max: 5 },
  { code: 'APTC', label: 'Color Discrimination', min: 1, max: 5 },
  { code: 'PD1', label: 'Strength', min: 1, max: 5 },
  { code: 'PD2', label: 'Climb/Balance', min: 0, max: 1 },
  { code: 'PD3', label: 'Stoop/Kneel/Crouch', min: 0, max: 1 },
  { code: 'PD4', label: 'Reach/Handle/Finger/Feel', min: 0, max: 1 },
  { code: 'PD5', label: 'Talk/Hear', min: 0, max: 1 },
  { code: 'PD6', label: 'See', min: 0, max: 1 },
  { code: 'EC1', label: 'Weather Exposure', min: 1, max: 3 },
  { code: 'EC2', label: 'Extreme Cold', min: 0, max: 1 },
  { code: 'EC3', label: 'Extreme Heat', min: 0, max: 1 },
  { code: 'EC4', label: 'Damp/Wet/Humid', min: 0, max: 1 },
  { code: 'EC5', label: 'Noise/Vibration', min: 0, max: 1 },
  { code: 'EC6', label: 'Hazards', min: 0, max: 1 },
  { code: 'EC7', label: 'Dust/Fumes/Odors', min: 0, max: 1 }
];

export const DEFAULT_PROFILE = [3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 0, 0, 1, 0, 1, 2, 0, 0, 0, 1, 0, 0];

export const TRAIT_MAX_DEFICIT = TRAITS.reduce((sum, trait) => sum + trait.max, 0);
