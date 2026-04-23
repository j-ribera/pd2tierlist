import fs from 'fs';
import path from 'path';

const csv = fs.readFileSync(path.join(process.cwd(), 'public', 'data.csv'), 'utf8');
const lines = csv.split('\n');

for (let i = 0; i < Math.min(100, lines.length); i++) {
   console.log(`Line ${i}:`, lines[i]);
}
