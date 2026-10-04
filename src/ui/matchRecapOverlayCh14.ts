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
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x4b302a, 0.72)
    .setInteractive().setName('match-recap-backdrop-ch14');

  const shadow = scene.add.graphics().setName('match-recap-shadow-ch175');
  shadow.fillStyle(0x4b302a, 0.28);
  shadow.fillRoundedRect(-574, -304, 1148, 632, 36);

  const panel = scene.add.graphics().setName('match-recap-panel-ch175');
  panel.fillStyle(0xfff7e8, 1);
  panel.fillRoundedRect(-568, -313, 1136, 626, 34);
  panel.lineStyle(5, 0x4b302a, 1);
  panel.strokeRoundedRect(-568, -313, 1136, 626, 34);

  const headerBand = scene.add.graphics().setName('match-recap-header-ch175');
  headerBand.fillStyle(0xffd76a, 1);
  headerBand.fillRoundedRect(-544, -294, 1088, 84, { tl: 24, tr: 24, bl: 13, br: 13 });
  headerBand.fillStyle(0xffffff, 0.48);
  headerBand.fillRoundedRect(-524, -285, 1048, 11, 5);
  headerBand.lineStyle(2, 0x4b302a, 0.28);
  headerBand.strokeRoundedRect(-544, -294, 1088, 84, { tl: 24, tr: 24, bl: 13, br: 13 });

  root.add([backdrop, shadow, panel, headerBand]);

  root.add([
    scene.add.text(0, -270, '✨ VÁN NÀY ĐÃ XẢY RA GÌ?', {
      fontFamily: FONT_CH14, fontSize:'31px', fontStyle:'bold', color:'#2b2522',
    }).setOrigin(0.5).setName('match-recap-title-ch14'),
    scene.add.text(0, -232, 'Tổng kết từ dữ liệu authoritative của chính ván đấu', {
      fontFamily: FONT_CH14, fontSize:'14px', fontStyle:'bold', color:'#75685f',
    }).setOrigin(0.5),
  ]);

  const tabs: Array<{
    playerId:number;
    hit:Phaser.GameObjects.Rectangle;
    skin:Phaser.GameObjects.Graphics;
    label:Phaser.GameObjects.Text;
  }> = [];
  const tabXs = [-405, -135, 135, 405];
  recap.players.slice(0, 4).forEach((player, index) => {
    const x = tabXs[index] ?? 0;
    const skin = scene.add.graphics().setName(`match-recap-tab-skin-${player.playerId}-ch175`);
    const hit = scene.add.rectangle(x, -178, 244, 66, 0xffffff, 0.001)
      .setInteractive({ useHandCursor:true })
      .setName(`match-recap-player-tab-${player.playerId}-ch14`);
    const label = scene.add.text(x, -178, `P${player.playerId + 1} • ${shortNameCh14(player.name)}\n${player.finalMoney} Bimport Phaser from 'phaser';
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
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x4b302a, 0.72)
    .setInteractive().setName('match-recap-backdrop-ch14');

  const shadow = scene.add.graphics().setName('match-recap-shadow-ch175');
  shadow.fillStyle(0x4b302a, 0.28);
  shadow.fillRoundedRect(-574, -304, 1148, 632, 36);

  const panel = scene.add.graphics().setName('match-recap-panel-ch175');
  panel.fillStyle(0xfff7e8, 1);
  panel.fillRoundedRect(-568, -313, 1136, 626, 34);
  panel.lineStyle(5, 0x4b302a, 1);
  panel.strokeRoundedRect(-568, -313, 1136, 626, 34);

  const headerBand = scene.add.graphics().setName('match-recap-header-ch175');
  headerBand.fillStyle(0xffd76a, 1);
  headerBand.fillRoundedRect(-544, -294, 1088, 84, { tl: 24, tr: 24, bl: 13, br: 13 });
  headerBand.fillStyle(0xffffff, 0.48);
  headerBand.fillRoundedRect(-524, -285, 1048, 11, 5);
  headerBand.lineStyle(2, 0x4b302a, 0.28);
  headerBand.strokeRoundedRect(-544, -294, 1088, 84, { tl: 24, tr: 24, bl: 13, br: 13 });

  root.add([backdrop, shadow, panel, headerBand]);

  root.add([
    scene.add.text(0, -270, '✨ VÁN NÀY ĐÃ XẢY RA GÌ?', {
      fontFamily: FONT_CH14, fontSize:'31px', fontStyle:'bold', color:'#2b2522',
    }).setOrigin(0.5).setName('match-recap-title-ch14'),
    scene.add.text(0, -232, 'Tổng kết từ dữ liệu authoritative của chính ván đấu', {
      fontFamily: FONT_CH14, fontSize:'14px', fontStyle:'bold', color:'#75685f',
    }).setOrigin(0.5),
  ]);

  const tabs: Array<{
    playerId:number;
    hit:Phaser.GameObjects.Rectangle;
    skin:Phaser.GameObjects.Graphics;
    label:Phaser.GameObjects.Text;
  }> = [];
  const tabXs = [-405, -135, 135, 405];
  recap.players.slice(0, 4).forEach((player, index) => {
, {
      fontFamily: FONT_CH14, fontSize:'15px', fontStyle:'bold', color:'#352b27',
      align:'center', lineSpacing:3, fixedWidth:224,
    }).setOrigin(0.5);
    root.add([skin, hit, label]);
    tabs.push({ playerId:player.playerId, hit, skin, label });
  });

  const detailPanel = scene.add.graphics().setName('match-recap-detail-panel-ch175');
  detailPanel.fillStyle(0xfffdf8, 0.98);
  detailPanel.fillRoundedRect(-535, -136, 550, 356, 24);
  detailPanel.lineStyle(3, 0xdecdb6, 1);
  detailPanel.strokeRoundedRect(-535, -136, 550, 356, 24);

  const momentPanel = scene.add.graphics().setName('match-recap-moment-panel-ch175');
  momentPanel.fillStyle(0xfff0bd, 0.86);
  momentPanel.fillRoundedRect(37, -136, 490, 356, 24);
  momentPanel.lineStyle(3, 0xd9ad45, 0.72);
  momentPanel.strokeRoundedRect(37, -136, 490, 356, 24);
  momentPanel.fillStyle(0xffffff, 0.34);
  momentPanel.fillRoundedRect(52, -124, 460, 9, 5);
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

  const hintPill = scene.add.graphics().setName('match-recap-hint-pill-ch175');
  hintPill.fillStyle(0xf2e2cf, 0.96);
  hintPill.fillRoundedRect(-528, 258, 430, 42, 16);
  hintPill.lineStyle(2, 0x4b302a, 0.18);
  hintPill.strokeRoundedRect(-528, 258, 430, 42, 16);
  const hint = scene.add.text(-512, 279, '🎮 D-pad: đổi người • A: xem • B: quay lại', {
    fontFamily: FONT_CH14, fontSize:'13px', fontStyle:'bold', color:'#6b5449',
  }).setOrigin(0, 0.5);

  const closeShadow = scene.add.graphics().setName('match-recap-close-shadow-ch175');
  closeShadow.fillStyle(0x8f74b7, 1);
  closeShadow.fillRoundedRect(378, 261, 138, 48, 17);
  const closeFace = scene.add.graphics().setName('match-recap-close-face-ch175');
  closeFace.fillStyle(0xf2e8ff, 1);
  closeFace.fillRoundedRect(378, 255, 138, 48, 17);
  closeFace.lineStyle(3, 0x4b302a, 0.92);
  closeFace.strokeRoundedRect(378, 255, 138, 48, 17);
  closeFace.fillStyle(0xffffff, 0.58);
  closeFace.fillRoundedRect(388, 262, 118, 9, 4);
  const close = scene.add.text(500, 279, 'ĐÓNG  B', {
    fontFamily: FONT_CH14, fontSize:'16px', fontStyle:'bold', color:'#4b302a',
    padding:{x:16,y:10},
  }).setOrigin(1,0.5).setInteractive({ useHandCursor:true }).setName('match-recap-close-ch14');
  root.add([hintPill, hint, closeShadow, closeFace, close]);

  let selectedId = recap.players[0]?.playerId ?? 0;
  const renderPlayer = (playerId:number): void => {
    const player = recap.players.find((entry) => entry.playerId === playerId) ?? recap.players[0];
    if (!player) return;
    selectedId = player.playerId;
    tabs.forEach((tab) => {
      const active = tab.playerId === selectedId;
      const accent = PLAYER_ACCENTS_CH14[tab.playerId] ?? 0xb8ada1;
      const x = tab.hit.x;
      tab.skin.clear();
      tab.skin.fillStyle(0x4b302a, active ? 0.20 : 0.13);
      tab.skin.fillRoundedRect(x - 122 + 3, -208 + 5, 244, 66, 18);
      tab.skin.fillStyle(active ? 0xffe5a0 : 0xfffdf8, 1);
      tab.skin.fillRoundedRect(x - 122, -208, 244, 66, 18);
      tab.skin.fillStyle(0xffffff, active ? 0.54 : 0.36);
      tab.skin.fillRoundedRect(x - 112, -201, 224, 9, 5);
      tab.skin.lineStyle(active ? 4 : 3, accent, 1);
      tab.skin.strokeRoundedRect(x - 122, -208, 244, 66, 18);
      tab.label.setColor(active ? '#3a2b24' : '#66544b');
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
