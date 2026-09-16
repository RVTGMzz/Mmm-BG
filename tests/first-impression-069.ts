import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const main = readFileSync('src/main.ts', 'utf8');
const splash = readFileSync('src/scenes/SplashScene069.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const setup = readFileSync('src/scenes/SetupScene.ts', 'utf8');
const css = readFileSync('src/firstImpression069.css', 'utf8');
const rules = readFileSync('docs/CANONICAL_UI_UX_RULES.md', 'utf8');

assert.equal(MEMEME_BUILD.version, '0.1.69');
assert.equal(MEMEME_BUILD.phase, 'FIRST IMPRESSION POLISH');
assert.match(main, /SplashScene069,[\s\S]*LocalLobbyScene,[\s\S]*SetupScene,[\s\S]*TurnOrderScene,[\s\S]*ActiveBoardScene/);
assert.match(main, /CareerMinigameBoardScene069 as ActiveBoardScene/);
assert(!splash.includes('assets/mememe-logo.webp'), 'splash must not render the known-corrupt black bitmap');
assert.match(splash, /'Me³'/);
assert.match(splash, /'MeMeMe'/);
assert.match(splash, /CHẠM ĐỂ BẮT ĐẦU/);
assert.match(splash, /this\.scene\.start\('LocalLobbyScene'\)/);
assert(!splash.includes('Math.random'));

assert.match(board, /extends CareerMinigameBoardScene0682/);
assert.match(board, /ui\.meta\.setText\(''\)\.setVisible\(false\)/);
assert.match(board, /ownedJobLabels069/);
assert.match(board, /JOB_LABEL_WIDTH_069 = 184/);
assert.match(board, /fitJobLabel069/);
assert.match(board, /setMaxLines\(1\)/);
assert.match(board, /ACTIVE_SCALE_069 = 1\.14/);
assert.match(board, /🎲\$\{roll \? ` \$\{roll\}` : ''\} → NHẬN VIỆC/);
assert.match(board, /copy\.includes\('trúng'\)/);
assert(!board.includes('Math.random'));
assert(!board.includes('submitIntent('));

assert.match(lobby, /CHỌN CÁCH CHƠI/);
assert.match(lobby, /CHƠI NHANH/);
assert(!lobby.includes('Vertical Slice đang khóa flow'));
assert.match(setup, /MEMEME_BUILD\.setupHeader/);
assert.match(MEMEME_BUILD.setupHeader, /TẠO NGƯỜI CHƠI/);
assert.match(setup, /Chạm ảnh để chọn mặt • Có thể bỏ qua/);
assert.match(setup, /CHỌN ĐỘ DÀI/);
assert(!setup.includes('Ảnh gốc chỉ tồn tại trong trình duyệt'));
assert(!setup.includes('Chọn độ dài trận. Mỗi người phải hoàn thành'));

assert.match(css, /border-radius:28px/);
assert.match(css, /border-radius:34px/);
assert.match(rules, /Soft rounded surfaces are the default shape language/);
console.log('[first-impression-069] PASS stable vector splash + bounded HUD career labels + concise first-run UI + soft-corner contract');
