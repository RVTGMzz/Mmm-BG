import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const overlay = fs.readFileSync(path.join(root, 'src/ui/MiniGameOverlay.ts'), 'utf8');
const vf = fs.readFileSync(path.join(root, 'src/ui/visualFoundationMiniGameVf07.ts'), 'utf8');

function expect(value: boolean, message: string): void {
  if (!value) throw new Error(message);
}

expect(vf.includes("id: 'VF-07-mini-game-foundation-review'"), 'VF-07 identity missing');
expect(vf.includes('width: 900') && vf.includes('height: 540'), 'VF-07 must retain canonical Mini Game owner geometry');
expect(overlay.includes("MINI_GAME_VISUAL_VF07"), 'Mini Game overlay must consume VF-07 visual tokens');
expect(overlay.includes('root = scene.add.container(640, 360).setDepth(1500)'), 'Mini Game modal depth/owner changed');
expect(overlay.includes("submitSystemIntent('resolve_minigame'"), 'authoritative Mini Game payout path must remain intact');
expect(overlay.includes("MINI_GAME_DUEL_LAYOUT_070423"), 'retained RPS safe layout must remain wired');
expect(overlay.includes("D-PAD + A"), 'Steam Deck choice path must remain visible');
expect(overlay.includes('resultPaper') && overlay.includes('resultBadge'), 'VF-07 result surface must use owned paper + badge hierarchy');
expect(overlay.includes('podiumPaper') && overlay.includes('podiumRibbon'), 'VF-07 ranking must use the canonical result presentation');
expect(overlay.includes('revealPaper') && overlay.includes('revealRows'), 'VF-07 majority/minority round must use one simultaneous owned reveal surface');
expect(overlay.includes('VÒNG ${round} • CÙNG LẬT!'), 'VF-07 majority/minority reveal must clearly communicate the shared flip beat');
expect(overlay.includes('duration: 190') && overlay.includes('duration: 210'), 'VF-07 motion must remain short and non-blocking');
expect(!vf.includes('Math.random'), 'VF-07 visual helper must not introduce RNG');

console.log('VF-07 Mini Game foundation review gate: PASS');
