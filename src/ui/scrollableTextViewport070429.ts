import Phaser from 'phaser';

export interface ScrollableTextViewport070429Options {
  x: number;
  y: number;
  width: number;
  height: number;
  minHeight?: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontStyle?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number;
  name?: string;
}

export interface ScrollableTextViewport070429 {
  root: Phaser.GameObjects.Container;
  text: Phaser.GameObjects.Text;
  hit: Phaser.GameObjects.Rectangle;
  isScrollable: boolean;
  maxScroll: number;
  height: number;
  setScroll(value: number): void;
  scrollBy(delta: number): void;
}

export function createScrollableTextViewport070429(
  scene: Phaser.Scene,
  owner: Phaser.GameObjects.Container,
  options: ScrollableTextViewport070429Options,
): ScrollableTextViewport070429 {
  const root = new Phaser.GameObjects.Container(scene, options.x, options.y)
    .setName(options.name ?? 'scrollable-text-viewport-070429');

  const text = new Phaser.GameObjects.Text(scene, 0, 0, options.text, {
    // Crop coordinates are texture pixels; keep them identical to local units.
    resolution: 1,
    fontFamily: options.fontFamily,
    fontSize: `${options.fontSize}px`,
    fontStyle: options.fontStyle ?? 'normal',
    color: options.color,
    fixedWidth: options.width,
    align: options.align ?? 'left',
    wordWrap: { width: options.width, useAdvancedWrap: true },
    lineSpacing: options.lineSpacing ?? 5,
  }).setOrigin(0, 0);

  const height = Math.min(options.height, Math.max(options.minHeight ?? options.height, Math.ceil(text.height)));

  const hit = new Phaser.GameObjects.Rectangle(
    scene,
    options.width / 2,
    height / 2,
    options.width,
    height,
    0xffffff,
    0.001,
  ).setOrigin(0.5).setInteractive({ useHandCursor: true });

  const rail = new Phaser.GameObjects.Rectangle(
    scene,
    options.width + 10,
    height / 2,
    3,
    height,
    0x6d607c,
    0.18,
  );
  const thumb = new Phaser.GameObjects.Rectangle(
    scene,
    options.width + 10,
    14,
    5,
    28,
    0x6d607c,
    0.72,
  );
  const cue = new Phaser.GameObjects.Text(scene, options.width + 19, height - 3, '↕', {
    fontFamily: options.fontFamily,
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#756d62',
  }).setOrigin(0.5, 1);

  root.add([text, hit, rail, thumb, cue]);
  owner.add(root);

  // Local texture cropping is transformed by Phaser together with the text.
  // A GeometryMask is rendered independently of its nested owner and can lose
  // the camera/container transform; never ask callers for predicted world XY.
  const maxScroll = Math.max(0, text.height - height);
  const isScrollable = maxScroll > 1;
  rail.setVisible(isScrollable);
  thumb.setVisible(isScrollable);
  cue.setVisible(isScrollable);

  let scroll = 0;
  let draggingPointerId: number | undefined;
  let dragStartY = 0;
  let dragStartScroll = 0;

  const setScroll = (value: number): void => {
    scroll = Phaser.Math.Clamp(value, 0, maxScroll);
    text.setY(-scroll);
    text.setCrop(0, scroll, options.width, height);
    if (!isScrollable) return;

    const ratio = height / Math.max(height, text.height);
    const thumbHeight = Math.min(height, Math.max(26, height * ratio));
    const travel = Math.max(0, height - thumbHeight);
    const progress = maxScroll <= 0 ? 0 : scroll / maxScroll;
    thumb
      .setDisplaySize(5, thumbHeight)
      .setY(thumbHeight / 2 + travel * progress);
  };

  const scrollBy = (delta: number): void => setScroll(scroll + delta);

  // Invert the full owner transform, including parent scale/rotation. Camera
  // world points are computed by Phaser's input manager for the active camera.
  const pointerLocalY = (pointer: Phaser.Input.Pointer): number => {
    const camera = pointer.camera ?? scene.cameras.main;
    const world = camera.getWorldPoint(pointer.x, pointer.y);
    // Container rendering inherits the top-level owner's scroll factors.
    let top = root;
    while (top.parentContainer) top = top.parentContainer;
    world.x += camera.scrollX * (top.scrollFactorX - 1);
    world.y += camera.scrollY * (top.scrollFactorY - 1);
    return root.getWorldTransformMatrix().applyInverse(world.x, world.y).y;
  };

  const onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (draggingPointerId !== pointer.id || !pointer.isDown || !isScrollable) return;
    setScroll(dragStartScroll + dragStartY - pointerLocalY(pointer));
  };
  const onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (draggingPointerId === pointer.id) draggingPointerId = undefined;
  };
  const onWheel = (
    _pointer: Phaser.Input.Pointer,
    gameObjects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ): void => {
    if (!isScrollable || !gameObjects.includes(hit)) return;
    scrollBy(deltaY * 0.45);
  };

  hit.on(
    'pointerdown',
    (
      pointer: Phaser.Input.Pointer,
      _localX: number,
      _localY: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      draggingPointerId = pointer.id;
      dragStartY = pointerLocalY(pointer);
      dragStartScroll = scroll;
    },
  );

  scene.input.on('pointermove', onPointerMove);
  scene.input.on('pointerup', onPointerUp);
  scene.input.on('pointerupoutside', onPointerUp);
  scene.input.on('wheel', onWheel);

  const cleanup = (): void => {
    scene.input.off('pointermove', onPointerMove);
    scene.input.off('pointerup', onPointerUp);
    scene.input.off('pointerupoutside', onPointerUp);
    scene.input.off('wheel', onWheel);
  };
  root.once('destroy', cleanup);

  setScroll(0);

  return { root, text, hit, isScrollable, maxScroll, height, setScroll, scrollBy };
}
