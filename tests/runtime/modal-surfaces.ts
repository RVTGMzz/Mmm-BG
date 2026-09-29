import Phaser from 'phaser';
import { CareerMinigameBoardScene07044 } from '../../src/scenes/CareerMinigameBoardScene07044';
import { TurnOrderScene07044 } from '../../src/scenes/TurnOrderScene07044';
import { startMiniGameOverlay } from '../../src/ui/MiniGameOverlay';
import { createJobRollPicker } from '../../src/ui/JobChoicePicker';
import jobsJson from '../../src/content/core/jobs_mvp.json';
import type { JobDefinition } from '../../src/core/jobs';
import { gameSession } from '../../src/core/session';
import { browserSession } from '../../src/core/browserSession';

const mode = new URLSearchParams(location.search).get('surface') ?? 'card';
browserSession.configureSolo(
  mode === 'choice' || mode === 'doors' || mode === 'buoys' ? [1, 2, 3] : [0, 1, 2, 3],
);
gameSession.reset();
gameSession.players.forEach(p => gameSession.setCharacter(p.id, 'starter-crybaby'));
const fixtures: Record<string, any> = {
  card: {kind:'card_play', title:'Ví Ai Nấy Lo', description:'Mỗi người tự giữ tiền của mình. Chặn tác động chuyển tiền trong lượt này.', summary:'CPU 4 giữ lại 20 B$.', targetId:1, targetName:'CPU 2', actorName:'CPU 4', cardEffectType:'steal_money', amount:20, impact:'👛', eyebrow:'LÁ BÀI'},
  news: {kind:'news', title:'Phí Thành Phố Đồng Loạt', description:'Thành phố thu phí bảo trì. Mỗi người đóng 20 B$ để sửa những con đường vừa đi qua.', summary:'Tất cả người chơi mất 20 B$.', impact:'📰', eyebrow:'TIN TỨC'},
  job: {kind:'job', title:'ĐÃ NHẬN VIỆC', description:'Ca sĩ • Lương mỗi vòng: 70 B$', summary:'Đã nhận nghề Ca sĩ.', impact:'🎤', eyebrow:'CPU 4 • NHẬN VIỆC'},
  long: {kind:'card_play', title:'Nội dung dài cần cuộn', description:Array.from({length:12},(_,i)=>`Dòng ${i+1}: Nội dung tiếng Việt có dấu cần được giữ đủ và không tràn khỏi khung.`).join('\n'), summary:'Đã hoàn thành.', impact:'🃏', eyebrow:'LÁ BÀI'},
};
class SurfaceScene extends CareerMinigameBoardScene07044 {
  create() {
    const self=this as any;
    this.cameras.main.setBackgroundColor('#8cac97');
    const model={eventSeq:100,holdMs:60000, ...fixtures[mode]};
    if(mode==='choice' || mode==='doors' || mode==='buoys') {
      this.time.timeScale=20;
      this.tweens.timeScale=20;
      startMiniGameOverlay(
        this,
        gameSession.players as any,
        100,
        mode === 'doors'
          ? 'MINIGAME_SLOT_02'
          : mode === 'buoys'
            ? 'MINIGAME_SLOT_03'
            : undefined,
      );
      this.events.on('postupdate',()=>{
        const root=this.children.getByName('minigame-modal') as Phaser.GameObjects.Container;
        const stage=root?.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container;
        const expectedChoices = mode === 'doors' || mode === 'buoys' ? 3 : 2;
        const choiceBoxes = stage?.list.filter((entry: Phaser.GameObjects.GameObject) =>
          entry.name?.startsWith('vf07-minigame-choice-box-'),
        ) ?? [];
        if(stage?.getByName('vf07-minigame-choice-prompt') && choiceBoxes.length === expectedChoices) {
          this.time.timeScale=0;
          this.tweens.timeScale=0;
          (window as any).surfaceReady=true;
        }
      });
    } else if(mode==='topdice') {
      this.time.timeScale=20;
      this.tweens.timeScale=20;
      const run=startMiniGameOverlay(this, gameSession.players as any, 100, 'MINIGAME_SLOT_04');
      this.events.on('postupdate',()=>{
        const stage=run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container;
        const heading=stage?.getByName('vf07-minigame-result-heading') as Phaser.GameObjects.Text;
        const scrollRoot=stage?.getByName('vf07-minigame-result-scroll') as Phaser.GameObjects.Container;
        const body=scrollRoot?.getByName('vf07-minigame-result-body') as Phaser.GameObjects.Text;
        const rollCount=(String(body?.text ?? '').match(/🎲 [1-6]/g) ?? []).length;
        if(
          heading
          && !heading.text.includes('LUẬT')
          && (heading.text.includes('CẮT TOP') || heading.text.includes('HÒA Ở RANH TOP'))
          && rollCount >= 3
        ) {
          this.time.timeScale=0;
          this.tweens.timeScale=0;
          (window as any).surfaceReady=true;
        }
      });
    } else if(mode==='ranking') {
      this.time.timeScale=25;
      const run=startMiniGameOverlay(this, gameSession.players as any, 100);
      this.events.on('postupdate',()=>{
        const stage=run.root.getByName('vf07-minigame-stage') as Phaser.GameObjects.Container;
        if(stage?.getByName('vf07-minigame-ranking-rows') || (stage?.getByName('vf07-minigame-ranking-scroll'))) {
          this.time.timeScale=0;
          this.tweens.timeScale=10;
          (window as any).surfaceReady=true;
        }
      });
    } else if(mode==='jobdetail') {
      createJobRollPicker(this,'Player 1',(jobsJson as JobDefinition[]).slice(0,3),{canRoll:true});
      this.time.delayedCall(80,()=>{
        this.input.keyboard?.emit('keydown', new KeyboardEvent('keydown',{key:'1',code:'Digit1'}));
      });
      this.events.on('postupdate',()=>{
        if(this.children.getByName('job-detail-modal')) (window as any).surfaceReady=true;
      });
    } else if(mode==='jobhub') {
      createJobRollPicker(this,'Player 1',(jobsJson as JobDefinition[]).slice(0,3),{canRoll:true});
      (window as any).surfaceReady=true;
    } else if(mode==='job') {
      self.showCanonicalJobLanding070411({currentModel:model,finishCurrent(){}},model);
      (window as any).surfaceReady=true;
    } else {
      self.rebuildCanonicalCinematicText070414(this.add.container(640,330),model);
      (window as any).surfaceReady=true;
    }
    (window as any).surfaceScene=this;
  }
  update() {} // Fixture invokes real producers without unrelated board authority.
}
class OrderScene extends TurnOrderScene07044 {
  create(){super.create();(window as any).surfaceReady=true;(window as any).surfaceScene=this;}
}
new Phaser.Game({type:Phaser.WEBGL,width:1280,height:720,render:{preserveDrawingBuffer:true},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:mode==='order'?OrderScene:SurfaceScene});
