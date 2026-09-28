import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NEWS_SHEET_VF05, newsSheetBoundsVf05, newsSheetFitsVf05 } from '../src/ui/visualFoundationNewsVf05';
import { PRESENTATION_LANES_070422, reactionPlacement070422 } from '../src/ui/presentationLanes070422';

assert.equal(NEWS_SHEET_VF05.width, 720);
assert.equal(NEWS_SHEET_VF05.height, 300);
assert.ok(newsSheetFitsVf05());
const bounds = newsSheetBoundsVf05();
assert.deepEqual(bounds, { left:280,right:1000,top:180,bottom:480 });
assert.ok(bounds.left >= PRESENTATION_LANES_070422.modalLeft);
assert.ok(bounds.right <= PRESENTATION_LANES_070422.modalRight);
for (let playerId=0; playerId<4; playerId+=1) {
  const bubble=reactionPlacement070422(playerId,0);
  assert.ok(bubble, `P${playerId+1} reaction must be supported`);
  const left=bubble.x-bubble.width/2, right=bubble.x+bubble.width/2;
  const top=bubble.y-bubble.height/2, bottom=bubble.y+bubble.height/2;
  assert.ok(right + PRESENTATION_LANES_070422.modalGap <= bounds.left
     || left - PRESENTATION_LANES_070422.modalGap >= bounds.right,
    `P${playerId+1} reaction must clear the news paper by 20px`);
  assert.ok(top >= PRESENTATION_LANES_070422.hudTopBottom
    && bottom <= PRESENTATION_LANES_070422.hudBottomTop);
}
const painter=readFileSync('src/ui/visualFoundationNewsVf05.ts','utf8');
const scene=readFileSync('src/scenes/CareerMinigameBoardScene07044.ts','utf8');
assert.match(painter,/paintVisualFoundationNewsVf05/);
assert.match(painter,/n\.mint/);
assert.match(painter,/n\.cream/);
assert.match(painter,/n\.cocoa/);
assert.match(scene,/if \(isNews\) paintVisualFoundationNewsVf05\(shadow, panel, bodyViewport.height, footerHeight\)/);
assert.match(scene,/createScrollableTextViewport070429\(this, root/);
assert.match(scene,/fontSize: 21/);
assert.match(scene,/name: isNews \? 'news-scroll-body-070429' : 'card-scroll-body-070429'/);
assert.match(scene,/presentation\.setCinematicRenderer070427/);
assert.match(scene,/const root = this\.add\.container\(640, 330\)/);
assert.match(scene,/minAutoCloseMs: built\.scrollable \? 6000 : undefined/);
assert.match(scene,/readonly canonicalUiOwner071 = true/);
const updateStart = scene.indexOf('  update(): void {');
const runtimeStart = scene.indexOf('  private runtime07044()', updateStart);
assert.doesNotMatch(scene.slice(updateStart, runtimeStart), /syncCanonicalCinematicOwnership070417/);
assert.match(scene,/root\.add\(\[shadow, panel, kicker, title, impact, source\]\)/);
assert.doesNotMatch(painter,/Math\.random|submitIntent\s*\(|MatchState|browserSession/);
console.log('[visual-foundation-news-vf05] PASS warm news-only sample + direct canonical owner + .22 reaction lanes + fixed scrollable type');
