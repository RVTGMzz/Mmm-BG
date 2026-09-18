import Phaser from 'phaser';
import { createRandomSource, createRngState } from '../core/rng';
import {
  chooseAutoBranchEdge,
  derivePreviewBranchSeed,
  resolvePreviewBranchMode,
  resolvePreviewSeed,
  type PreviewBranchMode,
} from '../core/previewBranchMode054';
import type { BoardEdge } from '../core/types';
import { FinalMapPreviewScene052 } from './FinalMapPreviewScene052';

type PreviewPlayerShape = {
  name: string;
};

type PreviewRuntime054 = {
  uiLayer?: Phaser.GameObjects.Container;
  showToast: (message: string) => void;
  __branchMode054?: PreviewBranchMode;
  __branchRandom054?: () => number;
  __branchSeed054?: number;
  __branchToggle054?: Phaser.GameObjects.Text;
};

type PreviewPrototype054 = {
  create: () => void;
  chooseRoute: (player: PreviewPlayerShape, edges: BoardEdge[]) => Promise<BoardEdge>;
};

let installed = false;

function branchModeLabel(mode: PreviewBranchMode): string {
  return mode === 'auto' ? '↔ NHÁNH: AUTO' : '↔ NHÁNH: THỦ CÔNG';
}

export function installPreviewBranchMode054(): void {
  if (installed) return;
  installed = true;

  const prototype = FinalMapPreviewScene052.prototype as unknown as PreviewPrototype054;
  const originalCreate = prototype.create;
  const originalChooseRoute = prototype.chooseRoute;

  Object.defineProperty(prototype, 'create', {
    configurable: true,
    writable: true,
    value: function create054(this: FinalMapPreviewScene052): void {
      originalCreate.call(this);

      const runtime = this as unknown as PreviewRuntime054;
      const params = new URLSearchParams(window.location.search);
      const baseSeed = resolvePreviewSeed(params.get('seed'));
      runtime.__branchSeed054 = derivePreviewBranchSeed(baseSeed);
      runtime.__branchRandom054 = createRandomSource(createRngState(runtime.__branchSeed054));
      runtime.__branchMode054 = resolvePreviewBranchMode(params.get('branch'));

      const toggle = this.add.text(835, 24, branchModeLabel(runtime.__branchMode054), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#202020',
        backgroundColor: '#dff7f4',
        padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(55);

      runtime.uiLayer?.add(toggle);
      runtime.__branchToggle054 = toggle;

      toggle.on('pointerdown', () => {
        runtime.__branchMode054 = runtime.__branchMode054 === 'auto' ? 'manual' : 'auto';
        toggle.setText(branchModeLabel(runtime.__branchMode054));
        runtime.showToast(
          runtime.__branchMode054 === 'auto'
            ? `AUTO BRANCH bật • seed ${baseSeed} • game tự chọn Trái/Phải`
            : 'THỦ CÔNG bật • tới ngã rẽ sẽ hỏi RẼ TRÁI / RẼ PHẢI',
        );
      });

      runtime.showToast(
        runtime.__branchMode054 === 'auto'
          ? `0.1.54 • AUTO BRANCH • seed ${baseSeed}`
          : `0.1.54 • MANUAL BRANCH • seed ${baseSeed}`,
      );
    },
  });

  Object.defineProperty(prototype, 'chooseRoute', {
    configurable: true,
    writable: true,
    value: function chooseRoute054(
      this: FinalMapPreviewScene052,
      player: PreviewPlayerShape,
      edges: BoardEdge[],
    ): Promise<BoardEdge> {
      const runtime = this as unknown as PreviewRuntime054;
      if (runtime.__branchMode054 === 'manual') {
        return originalChooseRoute.call(this, player, edges);
      }

      const random = runtime.__branchRandom054 ?? Math.random;
      const selected = chooseAutoBranchEdge(edges, random);
      const label = selected.label ?? (selected.route === 'branch' ? 'LỐI RẼ' : 'PHỐ CHÍNH');
      runtime.showToast(`AUTO • ${player.name}: ${label}`);
      return Promise.resolve(selected);
    },
  });
}
