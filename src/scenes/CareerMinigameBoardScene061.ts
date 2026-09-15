import Phaser from 'phaser';
import type { MatchState } from '../core/matchState';
import { buildPlaytestMatchReport061, formatPlaytestMatchReport061 } from '../core/playtestTelemetry061';
import { CareerMinigameBoardScene060 } from './CareerMinigameBoardScene060';

type TelemetryInternals061 = {
  match: MatchState;
  shell: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay: Phaser.GameObjects.GameObject[];
  renderShellOverlay(): void;
};

/**
 * 0.1.61 is deliberately presentation/observability-only.
 * It reads authoritative MatchState after the result gate and exposes a local report
 * that testers can copy. No state mutation, gameplay intent, RNG, network upload or
 * external telemetry is introduced here.
 */
export class CareerMinigameBoardScene061 extends CareerMinigameBoardScene060 {
  private reportModal?: Phaser.GameObjects.Container;

  create(): void {
    super.create();
    this.installLocalPlaytestReport();
    this.events.once('shutdown', () => this.closeReportModal());
  }

  private installLocalPlaytestReport(): void {
    const internals = this as unknown as TelemetryInternals061;
    const originalRenderShellOverlay = internals.renderShellOverlay.bind(this);

    internals.renderShellOverlay = () => {
      originalRenderShellOverlay();

      if (internals.shell.status !== 'ended' || internals.shellOverlay.length === 0) {
        this.closeReportModal();
        return;
      }

      const button = this.buildReportButton(() => this.showReportModal(internals.match));
      internals.shellOverlay.push(button);
    };
  }

  private buildReportButton(action: () => void): Phaser.GameObjects.Container {
    const root = this.add.container(640, 528).setDepth(704).setScrollFactor(0);
    const panel = this.add.rectangle(0, 0, 300, 42, 0x325f73, 1)
      .setStrokeStyle(3, 0xfffaf0, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, '📊 BÁO CÁO PLAYTEST', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    panel.on('pointerdown', action);
    root.add([panel, text]);
    return root;
  }

  private showReportModal(match: MatchState): void {
    this.closeReportModal();
    const report = buildPlaytestMatchReport061(match);
    const reportText = formatPlaytestMatchReport061(report);

    const root = this.add.container(640, 360).setDepth(1005).setScrollFactor(0);
    this.reportModal = root;

    const blocker = this.add.rectangle(0, 0, 1280, 720, 0x101010, 0.72)
      .setInteractive();
    const panel = this.add.rectangle(0, 0, 900, 586, 0x24211d, 0.985)
      .setStrokeStyle(5, 0xffd34d, 1);
    const title = this.add.text(0, -255, '📊 PLAYTEST MATCH REPORT • 0.1.61', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd34d',
    }).setOrigin(0.5);
    const privacy = this.add.text(0, -222, 'LOCAL ONLY • KHÔNG TỰ GỬI DỮ LIỆU RA NGOÀI', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#cfc6b8',
    }).setOrigin(0.5);
    const body = this.add.text(-405, -185, reportText, {
      fontFamily: 'Consolas, Menlo, monospace',
      fontSize: '13px',
      color: '#ffffff',
      lineSpacing: 7,
      wordWrap: { width: 810, useAdvancedWrap: true },
    }).setOrigin(0, 0);

    const copyButton = this.add.rectangle(-105, 245, 280, 44, 0x325f73, 1)
      .setStrokeStyle(2, 0xfffaf0, 1)
      .setInteractive({ useHandCursor: true });
    const copyText = this.add.text(-105, 245, '📋 COPY REPORT', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const closeButton = this.add.rectangle(205, 245, 280, 44, 0x6d655b, 1)
      .setStrokeStyle(2, 0xfffaf0, 1)
      .setInteractive({ useHandCursor: true });
    const closeText = this.add.text(205, 245, 'ĐÓNG', {
      fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const status = this.add.text(0, 282, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#9bcf74',
    }).setOrigin(0.5);

    copyButton.on('pointerdown', () => void this.copyReportText(reportText, status));
    closeButton.on('pointerdown', () => this.closeReportModal());
    blocker.on('pointerdown', () => undefined);

    root.add([
      blocker,
      panel,
      title,
      privacy,
      body,
      copyButton,
      copyText,
      closeButton,
      closeText,
      status,
    ]);
  }

  private async copyReportText(reportText: string, status: Phaser.GameObjects.Text): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reportText);
      } else {
        this.legacyCopy(reportText);
      }
      status.setColor('#9bcf74').setText('✅ ĐÃ COPY • DÁN THẲNG VÀO CHAT/BUG REPORT');
    } catch {
      const copied = this.legacyCopy(reportText);
      status
        .setColor(copied ? '#9bcf74' : '#ffd34d')
        .setText(copied ? '✅ ĐÃ COPY • FALLBACK' : '⚠️ TRÌNH DUYỆT CHẶN CLIPBOARD');
    }
  }

  private legacyCopy(reportText: string): boolean {
    try {
      const area = document.createElement('textarea');
      area.value = reportText;
      area.setAttribute('readonly', 'true');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    } catch {
      return false;
    }
  }

  private closeReportModal(): void {
    this.reportModal?.destroy(true);
    this.reportModal = undefined;
  }
}
