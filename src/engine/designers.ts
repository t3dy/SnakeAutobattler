export interface Designer {
    id: string;
    name: string;
    role: string;
    emoji: string;
    purview: string;
    description: string;
    technology: string;
    quote: string;
}

export const DESIGNERS: Designer[] = [
    {
        id: 'ball-python',
        name: 'Ball Python',
        role: 'Traits Curator',
        emoji: '⚪',
        purview: 'traits.ts schemas',
        description: 'Oversees the formal definition of snake lineages, instincts, and quirks. Ensures every trait has a unique footprint.',
        technology: 'TypeScript Interfaces & Literal Types',
        quote: 'A snake without a schema is just a wiggly string.'
    },
    {
        id: 'sidewinder',
        name: 'Sidewinder',
        role: 'Draft Navigator',
        emoji: '🏂',
        purview: 'Drafting & UI Flow',
        description: 'Enforces the directional flow of the draft. Moves laterally through complex decisions with precision.',
        technology: 'React State Machines & Hooks',
        quote: 'We don\'t follow the path; we create the friction.'
    },
    {
        id: 'gaboon-viper',
        name: 'Gaboon Viper',
        role: 'Outcome Harbinger',
        emoji: '💀',
        purview: 'Trait -> Outcome Mapping',
        description: 'Calculates the lethal (and non-lethal) consequences of trait interactions during encounters.',
        technology: 'Probability Matrices & Weights',
        quote: 'Patience is just a long calculation before the strike.'
    },
    {
        id: 'rat-snake',
        name: 'Rat Snake',
        role: 'State Herald',
        emoji: '📢',
        purview: 'Player Status Narrative',
        description: 'Bridges the gap between mechanical state and player awareness. Updates you on your brood\'s health and spirit.',
        technology: 'Template Literals & Interpolation',
        quote: 'If they don\'t know they\'re bleeding, are they really hurt?'
    },
    {
        id: 'boomslang',
        name: 'Boomslang',
        role: 'Outcome Skald',
        emoji: '🎭',
        purview: 'Encounter Narration',
        description: 'The poet of victory and defeat. Narrates the resulting saga of every bite and evade.',
        technology: 'Generative Grammar & Markov Chains',
        quote: 'Every fight is a verse; every death is a period.'
    },
    {
        id: 'python-retic',
        name: 'Python Reticulatus',
        role: 'Video Architect',
        emoji: '📽️',
        purview: 'Narrative -> Video',
        description: 'Translates the abstract prose of the Skald into the shifting visual archive of the Multi-Verse.',
        technology: 'WebGL Frame Buffers & Canvas API',
        quote: 'Light is just another field to be sampled.'
    },
    {
        id: 'sunbeam-snake',
        name: 'Sunbeam Snake',
        role: 'VFX Supervisor',
        emoji: '✨',
        purview: 'Visual & SFX Overlays',
        description: 'Adds the iridescence to the world. Manages particles, glows, and the static of the Glitch.',
        technology: 'GLSL Pixel Shaders & CSS Filters',
        quote: 'Consistency is beautiful, but the flash makes it real.'
    },
    {
        id: 'green-python',
        name: 'Green Python',
        role: 'Field Harvester',
        emoji: '🌿',
        purview: 'Scalar Field Generation',
        description: 'Grows the environmental fields (Moisture, Elevation, Heat) from the raw soil of noise.',
        technology: 'Simplex Noise & Biome Layering',
        quote: 'The world is a garden of gradients.'
    },
    {
        id: 'king-cobra',
        name: 'King Cobra',
        role: 'Treasure Mapper',
        emoji: '👑',
        purview: 'Loot & Item Distribution',
        description: 'Decides where the relics of the old world are buried. Guards the balance of power.',
        technology: 'Spatial Hash Maps & KD-Trees',
        quote: 'A king is known by what he buries, not what he wears.'
    },
    {
        id: 'blue-racer',
        name: 'Blue Racer',
        role: 'Storm Meteorologist',
        emoji: '🌀',
        purview: 'Hazard & Storm Logic',
        description: 'Drives the Storm forward. Calculates its pressure and the lethality of its debris.',
        technology: 'Cellular Automata (Game of Life Variant)',
        quote: 'Speed is the only shield against the atmosphere.'
    },
    {
        id: 'corn-snake',
        name: 'Corn Snake',
        role: 'Genre Architect',
        emoji: '🌽',
        purview: 'Multi-Verse Rule Registry',
        description: 'Flips the switch between Noir and Slapstick. Wraps the engine in new tonal realities.',
        technology: 'Higher Order Components & Context',
        quote: 'Reality is a wrapper function away.'
    },
    {
        id: 'black-mamba',
        name: 'Black Mamba',
        role: 'Combat Choreographer',
        emoji: '⚔️',
        purview: 'Fight Resolution Logic',
        description: 'Fine-tunes the speed and damage of combat exchanges. Ensures the strike is always decisive.',
        technology: 'Deterministic Physics & Euler Integration',
        quote: 'There is no luck, only faster math.'
    },
    {
        id: 'indian-python',
        name: 'Indian Python',
        role: 'Skill Chronicler',
        emoji: '📜',
        purview: 'Brave Deed Acquisition',
        description: 'Records the legendary feats of your snakes and unlocks their hidden potential.',
        technology: 'Observer Pattern & Event Bus',
        quote: 'Greatness is just a series of observed events.'
    },
    {
        id: 'taipan',
        name: 'Taipan',
        role: 'Status Alchemist',
        emoji: '🧪',
        purview: 'Condition & Buff Management',
        description: 'Mixes the chemical cocktails that power statuses. Manages toxins and antidotes.',
        technology: 'Bitmasking & Buffer Overlays',
        quote: 'One drop changes the entire simulation.'
    },
    {
        id: 'rattlesnake',
        name: 'Rattlesnake',
        role: 'AI Psychologist',
        emoji: '🧠',
        purview: 'Agent Decision Logic',
        description: 'Constructs the mental models of the snakes. Balances hunger against self-preservation.',
        technology: 'Utility AI & Behavior Trees',
        quote: 'Instinct is just hardcoded survival.'
    },
    {
        id: 'emerald-boa',
        name: 'Emerald Boa',
        role: 'Radiance Auditor',
        emoji: '👁️',
        purview: 'System Consistency Sync',
        description: 'The final judge of Radiance. Checks if the narrative and simulation are lying to each other.',
        technology: 'Checksum Audits & Entropy Checks',
        quote: 'I see the gap where the story fails the math.'
    },
    {
        id: 'garter-snake',
        name: 'Garter Snake',
        role: 'Archive Librarian',
        emoji: '📚',
        purview: 'Version History & Persistence',
        description: 'Maintains the memory of past v-versions. Ensures the archive never truly dies.',
        technology: 'IndexedDB & Persistent Context',
        quote: 'History is the only thing we can\'t refactor.'
    },
    {
        id: 'sea-krait',
        name: 'Sea Krait',
        role: 'Network Weaver',
        emoji: '🌐',
        purview: 'Data Flow & Synchronization',
        description: 'Connects the various modules through the fluid currents of the engine.',
        technology: 'WebSockets & Async Data Streams',
        quote: 'Communication is the medium, the message is the coil.'
    },
    {
        id: 'emerald-tree-boa',
        name: 'Emerald Tree Boa',
        role: 'Branch Manager',
        emoji: '🌳',
        purview: 'Loop Failure & Narrative Fakes',
        description: 'Monitors the game loop for stalls. Provides narrative bridges and "fakes" to ensure progress when mechanics lag.',
        technology: 'Fallback Recovery & State Patching',
        quote: 'If the floor breaks, we\'ll slither through the canopy.'
    }
];
