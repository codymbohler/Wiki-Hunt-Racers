import { HuntPair } from '../types/game';

export interface SixDegreesPair extends HuntPair {
  estimatedDegrees: number;
  funFact: string;
}

export const CURATED_SIX_DEGREES_PAIRS: SixDegreesPair[] = [
  {
    startTitle: 'Snoop Dogg',
    targetTitle: 'Quantum mechanics',
    category: 'Music ➔ Physics',
    description: 'Can you bridge the West Coast rap icon to theoretical atomic physics in 6 clicks?',
    estimatedDegrees: 4,
    funFact: 'Via California Institute of Technology or Sound recording.',
  },
  {
    startTitle: 'Croissant',
    targetTitle: 'Black hole',
    category: 'Food ➔ Astrophysics',
    description: 'Connect flaky French breakfast pastry to the fabric of spacetime curvature.',
    estimatedDegrees: 4,
    funFact: 'Via France, Astronomy, or Physics.',
  },
  {
    startTitle: 'Minecraft',
    targetTitle: 'Renaissance',
    category: 'Gaming ➔ History',
    description: 'From 3D voxel sandbox building to 14th-century cultural rebirth.',
    estimatedDegrees: 3,
    funFact: 'Via Architecture or Sweden to European history.',
  },
  {
    startTitle: 'Barbie',
    targetTitle: 'Apollo 11',
    category: 'Toys ➔ Space',
    description: 'Bridge the world-famous fashion doll to humanity’s first moonwalk.',
    estimatedDegrees: 3,
    funFact: 'Via Astronaut Barbie, NASA, or United States.',
  },
  {
    startTitle: 'The Beatles',
    targetTitle: 'Plate tectonics',
    category: 'Music ➔ Geology',
    description: 'Connect the Fab Four from Liverpool to continental drift and magma plates.',
    estimatedDegrees: 4,
    funFact: 'Via England, Royal Society, or Earth science.',
  },
  {
    startTitle: 'Sushi',
    targetTitle: 'Internet',
    category: 'Cuisine ➔ Technology',
    description: 'Go from vinegared rice and raw fish to the global computer network.',
    estimatedDegrees: 3,
    funFact: 'Via Japan, Telecommunications, or Technology.',
  },
  {
    startTitle: 'Ancient Egypt',
    targetTitle: 'Artificial intelligence',
    category: 'Antiquity ➔ Future Tech',
    description: 'From the pharaohs and pyramids of 3000 BC to neural networks and machine learning.',
    estimatedDegrees: 4,
    funFact: 'Via Mathematics, Philosophy, or Logic.',
  },
  {
    startTitle: 'Espresso',
    targetTitle: 'International Space Station',
    category: 'Beverage ➔ Space Exploration',
    description: 'Can you route dark Italian coffee straight to low Earth orbit?',
    estimatedDegrees: 3,
    funFact: 'Via Italy, European Space Agency, or NASA astronauts.',
  },
  {
    startTitle: 'Taylor Swift',
    targetTitle: 'Philosophy',
    category: 'Pop Culture ➔ Humanities',
    description: 'Connect modern pop royalty to the fundamental nature of knowledge and reality.',
    estimatedDegrees: 3,
    funFact: 'Via Literature, Ethics, or Ancient Greece.',
  },
  {
    startTitle: 'Velociraptor',
    targetTitle: 'Silicon Valley',
    category: 'Paleontology ➔ Tech Industry',
    description: 'From Cretaceous theropod dinosaurs to the global epicenter of microchips.',
    estimatedDegrees: 4,
    funFact: 'Via Jurassic Park, Hollywood, or California.',
  },
  {
    startTitle: 'Origami',
    targetTitle: 'Supernova',
    category: 'Art ➔ Astronomy',
    description: 'Connect traditional Japanese paper folding to catastrophic stellar explosions.',
    estimatedDegrees: 4,
    funFact: 'Via Mathematics, Geometry, or Solar System.',
  },
  {
    startTitle: 'Skateboard',
    targetTitle: 'Thermodynamics',
    category: 'Sports ➔ Physics',
    description: 'From concrete bowl kickflips to laws of heat and entropy.',
    estimatedDegrees: 3,
    funFact: 'Via Physics of skateboarding, Friction, or Energy.',
  },
];

export const getRandomSixDegreesPair = (excludeTitle?: string): SixDegreesPair => {
  const eligible = excludeTitle
    ? CURATED_SIX_DEGREES_PAIRS.filter((p) => p.startTitle !== excludeTitle)
    : CURATED_SIX_DEGREES_PAIRS;
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex] || CURATED_SIX_DEGREES_PAIRS[0];
};
