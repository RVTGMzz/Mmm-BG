import Phaser from 'phaser';
import { browserSession } from '../core/browserSession';
import {
  minigameModeForActivePlayers,
  resolveMajorityMinorityRound,
  resolveRpsRound,
  type PalmChoice,
  type RpsChoice,
} from '../core/minigames';
import type { PlayerState } from '../core/types';

export interface MiniGameOverlayRun {
  root: Phaser.GameObjects.Container;
  done: Promise<void>;
}

function deterministicBit(eventSeq: number, playerId: number, round: number): number {
  let value = (eventSeq * 1103515245 + (playerId + 1) * 12345 + round * 2654435761) >>> 0;
  value ^= value >>> 16;
  return value >>> 0;
}

function cpuPalm(eventSeq: number, playerId: number, round: number): PalmChoice {
  return deterministicBit(eventSeq, playerId, round) % 2 === 0 ? 'up' : 'down';
}

function cpuRps(eventSeq: number, playerId: number, round: number): RpsChoice {
  return (['rock', 'paper', 'scissors'] as const)[deterministicBit(eventSeq, playerId, round) % 3] ?? 'rock';
}

export function startMiniGameOverlay(
  scene: Phaser.Scene,
  players: readonly PlayerState[],
  eventSeq: number,
): MiniGameOverlayRun {
  const root = scene.add.container(640, 360).setDepth(990);
  const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x111111, 0.72).setInteractive();
  const panel = scene.add.rectangle(0, 0, 900, 520, 0xfffbf3, 1).setStrokeStyle(6, 0x242424, 1);
  const title = scene.add.text(0, -215, '🎮 MINI GAME', {
    fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '31px', fontStyle: 'bold', color: '#202020',
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, -174, '', {
    fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#6d655b', align: 'center', fixedWidth: 760,
  }).setOrigin(0.5);
  const stage = scene.add.container(0, 15);
  root.add([backdrop, panel, title, subtitle, stage]);

  const activeIds = players.map((player) => player.id);
  const playerById = (id: number) => players.find((player) => player.id === id);
  const isInteractiveHuman = (id: number) => {
    if (browserSession.current.mode !== 'solo') return false;
    return !browserSession.isCpuSeat(id);
  };

  const clearStage = () => stage.removeAll(true);
  const wait = (ms: number) => new Promise<void>((resolve) => scene.time.delayedCall(ms, resolve));

  const choiceButtons = <T extends string>(
    player: PlayerState,
    choices: Array<{ value: T; icon: string; label: string; fill: number }>,
  ): Promise<T> => new Promise((resolve) => {
    clearStage();
    const prompt = scene.add.text(0, -95, `${player.name} • CHỌN KÍN`, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '23px', fontStyle: 'bold', color: '#202020',
    }).setOrigin(0.5);
    const hint = scene.add.text(0, -58, 'Người khác chưa được xem lựa chọn của bạn.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#746a60',
    }).setOrigin(0.5);
    stage.add([prompt, hint]);
    const spacing = choices.length === 2 ? 210 : 185;
    choices.forEach((choice, index) => {
      const x = (index - (choices.length - 1) / 2) * spacing;
      const box = scene.add.rectangle(x, 35, 160, 155, choice.fill, 1)
        .setStrokeStyle(4, 0x242424, 1)
        .setInteractive({ useHandCursor: true });
      const icon = scene.add.text(x, 8, choice.icon, { fontSize: '42px' }).setOrigin(0.5);
      const label = scene.add.text(x, 68, choice.label, {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#202020',
      }).setOrigin(0.5);
      box.on('pointerover', () => box.setScale(1.035));
      box.on('pointerout', () => box.setScale(1));
      box.on('pointerdown', () => resolve(choice.value));
      stage.add([box, icon, label]);
    });
  });

  const showResult = async (heading: string, body: string) => {
    clearStage();
    const head = scene.add.text(0, -40, heading, {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#202020', align: 'center',
    }).setOrigin(0.5);
    const text = scene.add.text(0, 35, body, {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#4f4740', align: 'center', fixedWidth: 680, lineSpacing: 7,
    }).setOrigin(0.5);
    stage.add([head, text]);
    await wait(1900);
  };

  const runMajorityMinority = async () => {
    subtitle.setText('NHIỀU RA ÍT BỊ • Chọn SẤP hoặc NGỬA. Phe thiểu số là phe “bị”.');
    for (let round = 1; round <= 8; round += 1) {
      const choices: Record<number, PalmChoice> = {};
      for (const player of players) {
        if (isInteractiveHuman(player.id)) {
          choices[player.id] = await choiceButtons(player, [
            { value: 'up', icon: '🤲', label: 'NGỬA', fill: 0x9eddf0 },
            { value: 'down', icon: '🖐️', label: 'SẤP', fill: 0xffd983 },
          ]);
        } else {
          choices[player.id] = cpuPalm(eventSeq, player.id, round);
        }
      }

      const result = resolveMajorityMinorityRound(activeIds, choices);
      const reveal = activeIds.map((id) => `${playerById(id)?.name ?? `P${id + 1}`}: ${choices[id] === 'up' ? 'NGỬA 🤲' : 'SẤP 🖐️'}`).join('\n');
      if (result.tied) {
        await showResult('🤝 HÒA, RA LẠI!', `${reveal}\n\nKhông có phe thiểu số rõ ràng.`);
        continue;
      }
      const losers = result.eliminatedPlayerIds.map((id) => playerById(id)?.name ?? `P${id + 1}`).join(', ');
      await showResult('😵 ÍT BỊ!', `${reveal}\n\nPhe thiểu số: ${losers}.`);
      return;
    }
    await showResult('🌀 HÒA QUÁ NHIỀU', 'Mini game tự kết thúc vòng trình diễn để không kẹt trận.');
  };

  const runRps = async () => {
    subtitle.setText('1 VS 1 • TỰ ĐỘNG CHUYỂN SANG OẲN TÙ XÌ');
    const [a, b] = players;
    if (!a || !b) return;
    for (let round = 1; round <= 8; round += 1) {
      const choose = async (player: PlayerState): Promise<RpsChoice> => {
        if (!isInteractiveHuman(player.id)) return cpuRps(eventSeq, player.id, round);
        return choiceButtons(player, [
          { value: 'rock', icon: '✊', label: 'BÚA', fill: 0xffd983 },
          { value: 'paper', icon: '🖐️', label: 'BAO', fill: 0x9eddf0 },
          { value: 'scissors', icon: '✌️', label: 'KÉO', fill: 0xd1b0f0 },
        ]);
      };
      const choiceA = await choose(a);
      const choiceB = await choose(b);
      const result = resolveRpsRound(a.id, choiceA, b.id, choiceB);
      const label = (choice: RpsChoice) => choice === 'rock' ? 'BÚA ✊' : choice === 'paper' ? 'BAO 🖐️' : 'KÉO ✌️';
      if (result.tied) {
        await showResult('🤝 HÒA, CHƠI LẠI!', `${a.name}: ${label(choiceA)}\n${b.name}: ${label(choiceB)}`);
        continue;
      }
      const winner = playerById(result.winnerId ?? -1)?.name ?? '???';
      const loser = playerById(result.loserId ?? -1)?.name ?? '???';
      await showResult('🏆 OẲN TÙ XÌ', `${a.name}: ${label(choiceA)}\n${b.name}: ${label(choiceB)}\n\n${winner} thắng • ${loser} thua.`);
      return;
    }
  };

  const done = (async () => {
    const mode = minigameModeForActivePlayers(activeIds);
    if (mode === 'rps') await runRps();
    else await runMajorityMinority();
  })();

  return { root, done };
}
