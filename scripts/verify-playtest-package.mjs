import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function sha256(path) {
  const data = await readFile(path);
  return createHash('sha256').update(data).digest('hex');
}

const bgmTracks = [
  ['01_Menu_MeMeMe.ogg', 'df2a94fcd34c016ada23481c8f027d8088b608e1d9ebd46dcd2b5986fe41e36e'],
  ['02_City_Bubble.ogg', 'c7b94b5bc698d1a86f1ffb4ba3504841167700734dcdb1d346be9fa0a352b6e5'],
  ['03_City_Silly.ogg', '53c00c6d5a5d199555522e99f1ba17f6e978c092b3ea9988734e35b3f52a1b0d'],
  ['04_Final_Round.ogg', '3e11e5292d38485d8e8c299a54c3582a2b3c6f11b622edc15af3cd66d26e4e83'],
];

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

for (const [file, expectedSha] of bgmTracks) {
  const path = `dist/audio/bgm/${file}`;
  await access(path, constants.R_OK);
  const actualSha = await sha256(path);
  assert(
    actualSha === expectedSha,
    `BGM checksum mismatch for ${file}. Expected ${expectedSha} but got ${actualSha}`,
  );
}

console.log(
  `[playtest-package-ci] PASS assets=${files.length} bgm=${bgmTracks.length}/4 checksums=PASS quickstart=PLAYTEST.txt launcher=START_PLAYTEST.bat relativePaths=PASS`,
);
