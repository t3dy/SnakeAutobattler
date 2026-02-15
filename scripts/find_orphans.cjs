const fs = require('fs');
const path = require('path');

const root = process.cwd();
const traitsPath = path.resolve(root, 'src/engine/traits.ts');
const simPath = path.resolve(root, 'src/engine/sim.ts');
const narratePath = path.resolve(root, 'src/engine/narrate.ts');

console.log('--- RADIANT AUDIT: ORPHAN TRAIT DASHBOARD ---');
console.log(`Working Directory: ${root}`);

try {
    const traitsContent = fs.readFileSync(traitsPath, 'utf8');
    const simContent = fs.readFileSync(simPath, 'utf8');
    const narrateContent = fs.readFileSync(narratePath, 'utf8');

    // Regex to find trait IDs in traits.ts (looks for 'Trait Name':)
    const traitKeys = traitsContent.match(/'[^']+'\s*:/g)?.map(k => k.replace(/[':]/g, '').trim()) || [];

    // Filter out internal keys like 'BODIES', 'INSTINCTS', etc. if they match the pattern
    const validTraits = traitKeys.filter(k => k !== 'BODIES' && k !== 'INSTINCTS' && k !== 'AFFINITIES' && k !== 'QUIRKS');

    console.log(`Found ${validTraits.length} candidate traits in traits.ts\n`);

    const orphans = [];

    validTraits.forEach(trait => {
        const inSim = simContent.includes(trait);
        const inNarratively = narrateContent.includes(trait);

        if (!inSim || !inNarratively) {
            orphans.push({ trait, inSim, inNarratively });
        }
    });

    if (orphans.length === 0) {
        console.log('✅ All traits have implementation hooks! Your design is Radiant.');
    } else {
        console.log('⚠️  THE FOLLOWING TRAITS ARE ORPHANS (Missing hooks):');
        orphans.forEach(o => {
            const status = [];
            if (!o.inSim) status.push('MISSING IN SIM');
            if (!o.inNarratively) status.push('MISSING IN NARRATE');
            console.log(`- [${o.trait}]: ${status.join(' | ')}`);
        });
    }
} catch (err) {
    console.error('Audit Failure:', err.message);
}
console.log('\n--------------------------------------------');
