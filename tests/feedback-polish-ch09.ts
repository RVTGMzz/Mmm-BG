import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { diceSettleFeedbackCh09, landingFeedbackCh09 } from '../src/ui/presentationFeedbackCh09';
import type { PresentationEventModel } from '../src/ui/presentationModel';

const base:PresentationEventModel={
  eventSeq:1,kind:'tile_land',actorId:0,actorName:'P1',eyebrow:'TEST',title:'TEST',
  description:'',summary:'',impact:'✨',rarity:'',reactions:[],holdMs:1000,tileType:'normal'
};

const passive=landingFeedbackCh09({...base,tileType:'character_passive',amount:10});
assert.equal(passive.cue,'character_passive');
assert.equal(passive.burstCount,16);
assert.equal(passive.floatingMoney,true);
assert(passive.cameraShake && passive.cameraShake.intensity>0 && passive.cameraShake.intensity<0.001);

const passiveZero=landingFeedbackCh09({...base,tileType:'character_passive',amount:0});
assert.equal(passiveZero.floatingMoney,false);

const gain=landingFeedbackCh09({...base,tileType:'money',amount:20});
const loss=landingFeedbackCh09({...base,tileType:'money',amount:-20});
assert.equal(gain.cue,'coin_gain');
assert.equal(loss.cue,'coin_loss');
assert.equal(gain.floatingMoney,true);
assert.equal(loss.floatingMoney,true);

const ready=landingFeedbackCh09({...base,kind:'ready_bonus',tileType:'ready',amount:20});
assert.equal(ready.cue,'ready');
assert.equal(ready.burstCount,14);
assert.equal(ready.floatingMoney,true);

const plain=landingFeedbackCh09(base);
assert.deepEqual(plain,{cue:'land',burstCount:8,floatingMoney:false});

const six=diceSettleFeedbackCh09(6);
const three=diceSettleFeedbackCh09(3);
assert(six.burstCount>three.burstCount,'natural 6 should get a slightly stronger settle punch');
assert(six.cameraShake.intensity>three.cameraShake.intensity);
assert(three.cameraShake.intensity<0.001,'dice settle camera feedback must remain subtle');

const layer=readFileSync('src/ui/MatchPresentationLayer.ts','utf8');
const sfx=readFileSync('src/audio/sfxController.ts','utf8');
assert.match(layer,/landingFeedbackCh09\(model\)/);
assert.match(layer,/diceSettleFeedbackCh09\(result\)/);
assert.match(layer,/showFloatingMoney\(model\.amount \?\? 0, model\.actorId\)/);
assert.match(sfx,/case 'character_passive'/);
assert.doesNotMatch(sfx,/Math\.random\s*\(/);

console.log('[feedback-polish-ch09] PASS passive SFX + stronger burst + floating B$ + subtle dice settle punch');
