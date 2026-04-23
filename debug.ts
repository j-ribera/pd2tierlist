import fs from 'fs';
import path from 'path';

const builds = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'builds.json'), 'utf8'));

const wwBuilds = builds.filter(b => b.buildName.toLowerCase().includes('whirlwind'));
console.log(wwBuilds);
