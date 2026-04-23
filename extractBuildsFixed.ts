import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const csv = fs.readFileSync(path.join(process.cwd(), 'public', 'data.csv'), 'utf8');

interface Build {
  className: string;
  buildName: string;
  tier: string;
  fortify: string;
  budget: string;
  hc: string;
  t1t2: string;
}

const builds: Build[] = [];

Papa.parse(csv, {
  complete: function(results) {
    const data = results.data as string[][];

    const classHeaders = [
      { name: 'Sorceress', col: 1, startRow: 3, endRow: 27 },
      { name: 'Amazon', col: 7, startRow: 3, endRow: 24 },
      { name: 'Necromancer', col: 7, startRow: 26, endRow: 48 },
      { name: 'Druid', col: 1, startRow: 29, endRow: 47 },
      { name: 'Assassin', col: 1, startRow: 49, endRow: 72 },
      { name: 'Paladin', col: 7, startRow: 50, endRow: 100 },
      { name: 'Barbarian', col: 1, startRow: 74, endRow: 150 }
    ];

    for (const ch of classHeaders) {
      for (let r = ch.startRow; r <= ch.endRow && r < data.length; r++) {
        const buildName = data[r][ch.col];
        if (!buildName || buildName.includes('Builds') || buildName.includes('Tree') || buildName === 'Other' || buildName === '---') {
            continue;
        }
        
        let tier = data[r][ch.col + 1];
        let fortify = data[r][ch.col + 2];
        let budget = data[r][ch.col + 3];
        let hc = data[r][ch.col + 4];
        let t1t2 = data[r][ch.col + 5];

        if (buildName && (!tier || tier.trim() === '')) {
            continue;
        }

        if (buildName && tier && tier !== 'Tier' && !buildName.includes('Tier Key') && !buildName.includes('Sub Tiers') && !buildName.includes('Criterion') && !buildName.includes('Monsters Per Minute')) {
          
            // check for weird artifact strings based on the column 0 being caught in
            if (buildName.includes('Fortified Maps') || buildName.includes('Early Game') || buildName.includes('Trifecta') || buildName.includes('Big AoE')) continue;

            builds.push({
            className: ch.name,
            buildName: buildName.trim(),
            tier: tier.trim(),
            fortify: fortify ? fortify.trim() : '',
            budget: budget ? budget.trim() : '',
            hc: hc ? hc.trim() : '',
            t1t2: t1t2 ? t1t2.trim() : ''
          });
        }
      }
    }
    
    // De-duplicate just in case
    const uniqueBuilds = builds.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.buildName === value.buildName && t.className === value.className
      ))
    );

    fs.writeFileSync(path.join(process.cwd(), 'src', 'builds.json'), JSON.stringify(uniqueBuilds, null, 2));
    console.log(`Extracted ${uniqueBuilds.length} builds.`);
  }
});
