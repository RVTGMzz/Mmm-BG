import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await access('dist/index.html', constants.R_OK);
await access('dist/PLAYTEST.txt', constants.R_OK);

const html = await readFile('dist/index.html', 'utf8');
const files = await readdir('dist/assets');

assert(files.some((file) => file.endsWith('.js')), 'Playtest package has no JS bundle.');
assert(files.some((file) => file.endsWith('.css')), 'Playtest package has no CSS bundle.');
assert(!html.includes('src="/assets/'), 'index.html still has absolute /assets JS path.');
assert(!html.includes('href="/assets/'), 'index.html still has absolute /assets CSS path.');
assert(
  html.includes('./assets/') || html.includes('assets/'),
  'index.html does not reference relative assets for portable static hosting.',
);

console.log(`[playtest-package-ci] PASS assets=${files.length} quickstart=PLAYTEST.txt relativePaths=PASS`);
