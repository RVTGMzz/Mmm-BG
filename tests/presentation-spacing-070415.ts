import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const replay = readFileSync('src/core/replay.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Job source copy: no repeated offer sentence and no small icon beside job name.
assert.match(replay, /description: 'Đổ xúc xắc để nhận việc\.[^']*Mỗi nghề có lương riêng/);
assert.match(replay, /summary: ''/);
assert.match(replay, /description: `\$\{job\.title\} • \$\{jobSalary\(job, 1\)\} B\$\/cổng\.`/);
assert.doesNotMatch(replay, /description: `\$\{job\.icon\} \$\{job\.title\}/);

// Job result uses one centered card with a dedicated result title and body.
assert.match(active, /const isResult = model\.title\.includes\('NHẬN VIỆC'\)/);
assert.match(active, /const displayTitle = isResult \? 'ĐÃ NHẬN VIỆC' : '3 NGHỀ ĐANG CHỜ'/);
assert.match(active, /const title = this\.add\.text\(44, -18, displayTitle/);
assert.match(active, /const jobBodyViewport070429 = createScrollableTextViewport070429\(this, root/);
assert.match(active, /width: 560/);
assert.match(active, /fontSize: isResult \? 19 : 18/);

// Card/News removes every inherited child, including graphics/footer strips.
assert.match(active, /for \(const child of \[\.\.\.root\.list\]\)/);
assert.match(active, /child\.destroy\(\)/);
assert.match(active, /root\.add\(\[shadow, panel, kicker, title, impact, source\]\)/);
assert.match(active, /name: isNews \? 'news-scroll-body-070429' : 'card-scroll-body-070429'/);
assert.match(active, /const directMoneyTransfer/);
assert.match(active, /model\.cardEffectType === 'steal_money'/);

// Compact reaction label/body preserve separation inside a genuinely safe side rail.
assert.match(presentation, /const speaker = this\.scene\.add\.text\(/);
assert.match(presentation, /textX, -43/);
assert.match(presentation, /const quote = this\.scene\.add\.text\(textX, -13/);
assert.match(presentation, /fixedWidth: 144/);
assert.match(presentation, /reactionPlacement070422\(/);
assert.doesNotMatch(presentation, /fillRoundedRect\(-164, -62, 328/);

console.log('[presentation-spacing-070415] PASS Job source/centered card + Card/News full rebuild + reaction spacing');
