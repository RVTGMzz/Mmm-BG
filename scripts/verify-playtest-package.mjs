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

const eventSfx = [
  ['card.ogg', '0ecabbc019826d5556553bd1a21b7b1b4538eb2f62b35a68efdbf2b1f1ddb605'],
  ['choice.ogg', 'aa14cf68e00cc1accfe3aa4d009a7deeb906fc990cbaea7c7f9e48fbe69a9c30'],
  ['dice.ogg', '4ccf255e565acabed9d69bbb308ad27ef285df9a043a9b8b72355438bc39e7a5'],
  ['money_gain.ogg', '8a19c26ad01074fbabbb37dbfe8ebe38393a9bb06239c1c79780b66df0824ded'],
  ['money_loss.ogg', '200ded5f3dc4e55f8235d0800a72881335984f3cb0ddd437505152fff8c6d703'],
  ['news.ogg', 'a9901b41245a2a118c0a007af8b0fc35561939f673245a0ea728f0d4f406cd2e'],
  ['step.ogg', '4f10b73ea78c814afd107d31982ae6774daf526cca9590c7a1e3750920058445'],
  ['victory.ogg', '4be8669448d283a1747f32195da0235e6267100f9461d2d9093adedf25d9bd98'],
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
const rootFiles = await readdir('dist');
const launchers = rootFiles.filter((file) => /^START_.*\.bat$/i.test(file)).sort();

assert(files.some((file) => file.endsWith('.js')), 'Playtest package has no JS bundle.');
assert(files.some((file) => file.endsWith('.css')), 'Playtest package has no CSS bundle.');
assert(!html.includes('src="/assets/'), 'index.html still has absolute /assets JS path.');
assert(!html.includes('href="/assets/'), 'index.html still has absolute /assets CSS path.');
assert(html.includes('./assets/') || html.includes('assets/'), 'index.html does not reference relative assets for portable static hosting.');
assert(quickstart.includes('START_PLAYTEST.bat'), 'Quickstart does not point Windows testers to standard gameplay launcher.');
assert(quickstart.includes('1 / 2 / 3'), 'Quickstart does not explain the 0.1.66 match-length selector.');
assert(quickstart.toLowerCase().includes('file:///'), 'Quickstart does not warn about direct file:// launch.');
assert(launcher.includes('serve-playtest.ps1'), 'Windows gameplay launcher does not call PowerShell server.');
assert(server.includes('TcpListener'), 'PowerShell launcher server is missing TcpListener implementation.');
assert(server.includes('Start-Process $url'), 'PowerShell launcher does not open browser URL.');
assert(!rootFiles.includes('START_FINAL_MAP_PREVIEW.bat'), 'Legacy 0.1.50 launcher must not ship in tester package.');
assert(!rootFiles.includes('START_DRAFT_D_PREVIEW.bat'), 'Legacy Draft D preview launcher must not ship in 0.1.66.');
assert(!rootFiles.includes('START_DRAFT_D_FULL_MAP.bat'), 'Legacy Draft D full-map launcher must not ship in 0.1.66.');
assert(JSON.stringify(launchers) === JSON.stringify(['START_PLAYTEST.bat']), `Unexpected tester launcher set: ${launchers.join(', ')}`);

for (const [file, expectedSha] of bgmTracks) {
  const path = `dist/audio/bgm/${file}`;
  await access(path, constants.R_OK);
  const actualSha = await sha256(path);
  assert(actualSha === expectedSha, `BGM checksum mismatch for ${file}. Expected ${expectedSha} but got ${actualSha}`);
}

for (const [file, expectedSha] of eventSfx) {
  const path = `dist/audio/sfx/${file}`;
  await access(path, constants.R_OK);
  const actualSha = await sha256(path);
  assert(actualSha === expectedSha, `Event SFX checksum mismatch for ${file}. Expected ${expectedSha} but got ${actualSha}`);
}

console.log(
  `[playtest-package-ci] PASS assets=${files.length} launchers=${launchers.join('|')} bgm=${bgmTracks.length}/4 bgmChecksums=PASS ` +
    `sfx=${eventSfx.length}/8 sfxChecksums=PASS unified=START_PLAYTEST.bat relativePaths=PASS`,
);
