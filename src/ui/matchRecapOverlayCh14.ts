import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import { buildMatchRecapCh14, type MatchRecapPlayerCh14 } from '../core/matchRecapCh14';

const FONT_CH14 = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
const PLAYER_ACCENTS_CH14 = [0xef4545, 0x5b8def, 0xf2b84b, 0x61b37b];

export interface MatchRecapOverlayCh14 {
  root: Phaser.GameObjects.Container;
  selectPlayer(playerId: number): void;
  destroy(): void;
}

function signedMoneyCh14(value: number): string {
  return `${value >= 0 ? '+' : ''}${value} B$`;
}

function shortNameCh14(name: string): string {
  return name.length <= 16 ? name : `${name.slice(0, 15)}…`;
}

export function showMatchRecapCh14(
  scene: Phaser.Scene,
  match: MatchState,
  onClose?: () => void,
): MatchRecapOverlayCh14 {
  const recap = buildMatchRecapCh14(match);
  const root = scene.add.container(640, 360).setDepth(1600).setName('match-recap-ch14');
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x171820, 0.93)
    .setInteractive().setName('match-recap-backdrop-ch14');
  const shadow = scene.add.rectangle(0, 9, 1136, 626, 0x000000, 0.25);
  const panel = scene.add.rectangle(0, 0, 1136, 626, 0xfff8e9, 1)
    .setStrokeStyle(5, 0x3b2a24, 1);
  root.add([backdrop, shadow, panel]);

  root.add([
    scene.add.text(0, -270, '✨ VÁN NÀY ĐÃ XẢY RA GÌ?', {
      fontFamily: FONT_CH14, fontSize:'31px', fontStyle:'bold', color:'#2b2522',
    }).setOrigin(0.5).setName('match-recap-title-ch14'),
    scene.add.text(0, -232, 'Tổng kết từ dữ liệu authoritative của chính ván đấu', {
      fontFamily: FONT_CH14, fontSize:'14px', fontStyle:'bold', color:'#75685f',
    }).setOrigin(0.5),
  ]);

  const tabs: Array<{ playerId:number; hit:Phaser.GameObjects.Rectangle; label:Phaser.GameObjects.Text }> = [];
  const tabXs = [-405, -135, 135, 405];
  recap.players.slice(0, 4).forEach((player, index) => {
    const accent = PLAYER_ACCENTS_CH14[player.playerId] ?? 0xb8ada1;
    const hit = scene.add.rectangle(tabXs[index] ?? 0, -178, 244, 66, 0xffffff, 1)
      .setStrokeStyle(3, accent, 1)
      .setInteractive({ useHandCursor:true })
      .setName(`match-recap-player-tab-${player.playerId}-ch14`);
    const label = scene.add.text(tabXs[index] ?? 0, -178, `P${player.playerId + 1} • ${shortNameCh14(player.name)}\n${player.finalMoney} B$`, {
      fontFamily: FONT_CH14, fontSize:'15px', fontStyle:'bold', color:'#352b27',
      align:'center', lineSpacing:3, fixedWidth:224,
    }).setOrigin(0.5);
    root.add([hit, label]);
    tabs.push({ playerId:player.playerId, hit, label });
  });

  const detailPanel = scene.add.rectangle(-260, 42, 550, 356, 0xffffff, 0.78)
    .setStrokeStyle(3, 0xd8c8ad, 1);
  const momentPanel = scene.add.rectangle(282, 42, 490, 356, 0xfff2c9, 0.72)
    .setStrokeStyle(3, 0xe3bd58, 1);
  root.add([detailPanel, momentPanel]);

  const award = scene.add.text(-505, -109, '', {
    fontFamily: FONT_CH14, fontSize:'18px', fontStyle:'bold', color:'#9a5b00',
    fixedWidth:490,
  }).setName('match-recap-award-ch14');
  const name = scene.add.text(-505, -72, '', {
    fontFamily: FONT_CH14, fontSize:'27px', fontStyle:'bold', color:'#2c2623',
    fixedWidth:490,
  }).setName('match-recap-player-name-ch14');
  const identity = scene.add.text(-505, -32, '', {
    fontFamily: FONT_CH14, fontSize:'15px', fontStyle:'bold', color:'#6f6259',
    fixedWidth:490,
  });
  const money = scene.add.text(-505, 9, '', {
    fontFamily: FONT_CH14, fontSize:'22px', fontStyle:'bold', color:'#4d7c3b',
    fixedWidth:490,
  });
  const stats = scene.add.text(-505, 51, '', {
    fontFamily: FONT_CH14, fontSize:'16px', color:'#3e3530',
    lineSpacing:8, fixedWidth:490,
  }).setName('match-recap-player-stats-ch14');

  root.add([award, name, identity, money, stats]);

  root.add(scene.add.text(62, -112, '🎬 KHOẢNH KHẮC CỦA VÁN', {
    fontFamily: FONT_CH14, fontSize:'19px', fontStyle:'bold', color:'#5b4313',
  }));

  const momentCopy = recap.moments.length > 0
    ? recap.moments.slice(0, 8).map((entry) => `${entry.icon} ${entry.text}`).join('\n')
    : '🌙 Ván này khá yên bình. Chưa có khoảnh khắc lớn để ghi lại.';
  const moments = scene.add.text(62, -72, momentCopy, {
    fontFamily: FONT_CH14, fontSize:'15px', color:'#433a32',
    lineSpacing:8, fixedWidth:438, wordWrap:{ width:438, useAdvancedWrap:true }, maxLines:16,
  }).setName('match-recap-moments-ch14');
  root.add(moments);

  const hint = scene.add.text(-520, 280, '🎮 D-pad: đổi người • A: xem • B: quay lại', {
    fontFamily: FONT_CH14, fontSize:'13px', fontStyle:'bold', color:'#77695e',
  }).setOrigin(0, 0.5);
  const close = scene.add.text(500, 278, 'ĐÓNG  B', {
    fontFamily: FONT_CH14, fontSize:'16px', fontStyle:'bold', color:'#ffffff',
    backgroundColor:'#5f514a', padding:{x:16,y:10},
  }).setOrigin(1,0.5).setInteractive({ useHandCursor:true }).setName('match-recap-close-ch14');
  root.add([hint, close]);

  let selectedId = recap.players[0]?.playerId ?? 0;
  const renderPlayer = (playerId:number): void => {
    const player = recap.players.find((entry) => entry.playerId === playerId) ?? recap.players[0];
    if (!player) return;
    selectedId = player.playerId;
    tabs.forEach((tab) => {
      const active = tab.playerId === selectedId;
      const accent = PLAYER_ACCENTS_CH14[tab.playerId] ?? 0xb8ada1;
      tab.hit.setFillStyle(active ? 0xffe7a1 : 0xffffff, 1)
        .setStrokeStyle(active ? 5 : 3, accent, 1);
      tab.label.setColor(active ? '#202020' : '#554943');
    });
    award.setText(player.award);
    name.setText(`P${player.playerId + 1} • ${player.name}`);
    identity.setText(`${player.characterLabel}  •  ${player.jobLabel}`);
    money.setText(`${player.finalMoney} B$   (${signedMoneyCh14(player.moneyDelta)})`);
    stats.setText([
      `🎮 Mini Game: ${player.miniGameWins} thắng / ${player.miniGamePlays} lần`,
      `🃏 Lá Bài: ${player.cardsUsed} dùng • ${player.cardsTargeted} lần bị nhắm`,
      `📰 Tin tức ảnh hưởng: ${player.newsAffected} lần`,
      `🚔 Đồn: ${player.jailEntries} • 🏥 Bệnh viện: ${player.hospitalEntries}`,
      `✨ Nội tại: ${player.passiveActivations} • 🎰 Xổ số: +${player.lotteryAmount} B$`,
      `💼 Lương qua cổng: +${player.salaryAmount} B$`,
    ].join('\n'));
  };

  tabs.forEach((tab) => tab.hit.on('pointerdown', () => renderPlayer(tab.playerId)));

  let destroyed = false;
  const keyboard = scene.input.keyboard;
  const closeOverlay = (): void => {
    if (destroyed) return;
    destroyed = true;
    keyboard?.off('keydown-ESC', closeOverlay);
    keyboard?.off('keydown-BACKSPACE', closeOverlay);
    keyboard?.off('keydown-LEFT', previousPlayer);
    keyboard?.off('keydown-RIGHT', nextPlayer);
    keyboard?.off('keydown-ENTER', confirmPlayer);
    if (root.active) root.destroy(true);
    onClose?.();
  };
  const cycle = (delta:number): void => {
    const currentIndex = Math.max(0, recap.players.findIndex((entry) => entry.playerId === selectedId));
    const next = recap.players[(currentIndex + delta + recap.players.length) % recap.players.length];
    if (next) renderPlayer(next.playerId);
  };
  function previousPlayer(): void { cycle(-1); }
  function nextPlayer(): void { cycle(1); }
  function confirmPlayer(): void { renderPlayer(selectedId); }

  close.on('pointerdown', closeOverlay);
  keyboard?.on('keydown-ESC', closeOverlay);
  keyboard?.on('keydown-BACKSPACE', closeOverlay);
  keyboard?.on('keydown-LEFT', previousPlayer);
  keyboard?.on('keydown-RIGHT', nextPlayer);
  keyboard?.on('keydown-ENTER', confirmPlayer);

  renderPlayer(selectedId);

  return {
    root,
    selectPlayer: renderPlayer,
    destroy: closeOverlay,
  };
}
