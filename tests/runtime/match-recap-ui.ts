import Phaser from 'phaser';
import { appendMatchEvent, createInitialMatchState } from '../../src/core/matchState';
import { showMatchRecapCh14 } from '../../src/ui/matchRecapOverlayCh14';

class MatchRecapFixtureCh14 extends Phaser.Scene {
  create(): void {
    const match=createInitialMatchState({
      boardId:'city',startNodeId:0,playerNames:['An Nhiên','Bình Drama','Chi Xui','Duy Lucky'],seed:140034,
      characterIds:['starter-crybaby','starter-grumpy','starter-anxious','starter-hyper'],
    });
    Object.assign(match.players[0]!,{money:385,jobId:'JOB_DOCTOR',jobLevel:2,jobStatus:'employed'});
    Object.assign(match.players[1]!,{money:260,jobId:'JOB_IDOL',jobLevel:1,jobStatus:'employed'});
    Object.assign(match.players[2]!,{money:145,jobStatus:'unemployed'});
    Object.assign(match.players[3]!,{money:230,jobId:'JOB_BARISTA',jobLevel:1,jobStatus:'employed'});
    appendMatchEvent(match,'job_selected',{jobTitle:'Bác sĩ',affectedPlayerIds:'0'},0);
    appendMatchEvent(match,'minigame_tile',{title:'MINI GAME • BA CỬA',contentId:'MINIGAME_SLOT_02',affectedPlayerIds:'0,1,2,3'},0);
    appendMatchEvent(match,'minigame_reward',{sourceEventSeq:2,rank:1,amount:35},0);
    appendMatchEvent(match,'card_play',{title:'Ví Ai Nấy Lo',targetId:2,affectedPlayerIds:'2'},1);
    appendMatchEvent(match,'news',{title:'Phí Thành Phố Đồng Loạt',affectedPlayerIds:'0,1,2,3'},2);
    appendMatchEvent(match,'special_hold',{location:'hospital',affectedPlayerIds:'2'},2);
    appendMatchEvent(match,'lottery',{amount:80,affectedPlayerIds:'3'},3);
    appendMatchEvent(match,'character_passive',{title:'ĐƯỢC DỖ',affectedPlayerIds:'0'},0);
    appendMatchEvent(match,'board_shuffle',{lap:1},0);
    appendMatchEvent(match,'ready_pass',{salaryAmount:110,resultMoney:385,finishLocked:true},0);
    const overlay=showMatchRecapCh14(this,match);
    (window as any).matchRecapCh14={
      overlay,
      select:(id:number)=>overlay.selectPlayer(id),
      inspect:(name:string)=>{
        const find=(objects:readonly Phaser.GameObjects.GameObject[]):Phaser.GameObjects.GameObject|undefined=>{
          for(const object of objects){
            if(object.name===name) return object;
            if(object instanceof Phaser.GameObjects.Container){
              const nested=find(object.list);
              if(nested) return nested;
            }
          }
          return undefined;
        };
        const object=find(this.children.list);
        if(!object) return undefined;
        const text=object instanceof Phaser.GameObjects.Text ? object : undefined;
        const bounds=(object as any).getBounds?.();
        return {visible:(object as any).visible,active:(object as any).active,text:text?.text??'',fontSize:text?Number.parseFloat(String(text.style.fontSize)):undefined,bounds};
      },
    };
  }
}
new Phaser.Game({type:Phaser.WEBGL,parent:'app',width:1280,height:720,backgroundColor:'#e8dcc5',
  scene:MatchRecapFixtureCh14,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  render:{antialias:true,preserveDrawingBuffer:true}});
