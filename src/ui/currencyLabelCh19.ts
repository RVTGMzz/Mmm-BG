import Phaser from 'phaser';

/**
 * CH-19: the in-game money is called M$ (was B$). Rules, content and replays
 * keep their internal copy; only what the player reads is relabelled, for
 * Phaser texts and for the DOM screens alike.
 */
export const CURRENCY_LABEL_CH19 = 'M$';
const relabel = (s: string): string => (s.includes('B$') ? s.split('B$').join(CURRENCY_LABEL_CH19) : s);

let installed = false;

export function installCurrencyLabelCh19(): void {
  if (installed) return;
  installed = true;

  const proto = Phaser.GameObjects.Text.prototype as unknown as { setText(value: string | string[]): unknown };
  const setText = proto.setText;
  proto.setText = function (this: Phaser.GameObjects.Text, value: string | string[]) {
    const v = Array.isArray(value) ? value.map((line) => relabel(String(line))) : typeof value === 'string' ? relabel(value) : value;
    return setText.call(this, v);
  };

  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  const fixNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.nodeValue ?? '';
      if (t.includes('B$')) node.nodeValue = relabel(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue ?? '';
      if (t.includes('B$')) n.nodeValue = relabel(t);
    }
  };
  const start = () => {
    fixNode(document.body);
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') fixNode(r.target);
        else r.addedNodes.forEach(fixNode);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  };
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
}
