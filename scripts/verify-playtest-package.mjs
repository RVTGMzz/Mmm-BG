import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await access('dist/index.html', constants.R_OK);
await access('dist/PLAYTEST.txt', constants.R_OK);
await access('dist/START_PLAYTEST.bat', constants.R_OK);
await access('dist/serve-playtest.ps1', constants.R_OK);

const html = await readFile('dist/index.html', 'utf8');
const quickstart = await readFile('dist/PLAYTEST.txt', 'utf8');
const launcher = await readFile('dist/START_PLAYTEST.bat', 'utf8');
const server = await readFile('dist/serve-playtest.ps1', 'utf8');
const files = await readdir('dist/assets');

assert(files.some((file) => file.endsWith('.js')), 'Playtest package has no JS bundle.');
assert(files.some((file) => file.endsWith('.css')), 'Playtest package has no CSS bundle.');
assert(!html.includes('src="/assets/'), 'index.html still has absolute /assets JS path.');
assert(!html.includes('href="/assets/'), 'index.html still has absolute /assets CSS path.');
assert(
  html.includes('./assets/') || html.includes('assets/'),
  'index.html does not reference relative assets for portable static hosting.',
);
assert(quickstart.includes('START_PLAYTEST.bat'), 'Quickstart does not point Windows testers to launcher.');
assert(quickstart.toLowerCase().includes('file:///'), 'Quickstart does not warn about direct file:// launch.');
assert(launcher.includes('serve-playtest.ps1'), 'Windows launcher does not call PowerShell server.');
assert(server.includes('TcpListener'), 'PowerShell launcher server is missing TcpListener implementation.');
assert(server.includes('Start-Process $url'), 'PowerShell launcher does not open browser URL.');

console.log(
  `[playtest-package-ci] PASS assets=${files.length} quickstart=PLAYTEST.txt launcher=START_PLAYTEST.bat relativePaths=PASS`,
);
