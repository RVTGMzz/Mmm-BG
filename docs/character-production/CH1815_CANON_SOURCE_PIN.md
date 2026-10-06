# CH-18.15 — CAU CÓ exact concept source pin

Build: `0.1.70.4.69 — CH-18.15 CAU CÓ SOURCE PIN`

## Authority source

The approved CAU CÓ concept is now stored directly in the source repository:

`docs/character-production/canon/cauco.webp`

Pinned metadata:
- Drive authority: `cauco.webp`
- Drive file ID: `1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf`
- Repo size: 168,340 bytes
- Canvas: 1122×1402
- SHA-256: `f75435579c1647b07b1a88b3ced312c624c761c54a8ec87c335f5f6093db637e`

CI verifies the exact bytes. If the authority image changes, the hash must change intentionally with a reviewed canon update.

## CAU CÓ visual anchors

The production strip must preserve the approved concept:
- male, 40–50;
- voluminous swept-back salt-and-pepper hair with gray streaks;
- gold rectangular glasses;
- thick moustache + short chin beard;
- white long-sleeve dress shirt with rolled cuffs;
- brown leather suspenders with gold hardware;
- brown tie with crown pattern;
- dark olive pinstripe jacket draped over the shoulders;
- crown lapel pin + red pocket square;
- high-waisted brown tailored trousers;
- dark burgundy-brown loafers with gold chain hardware;
- brown crown-pattern shoulder work bag/satchel;
- gold-and-black wristwatch;
- green gemstone statement ring.

Forbidden redesigns include tank tops, shorts, sandals/flip-flops, casual beach-uncle styling, removing glasses/tie/jacket identity, or changing age/gender/silhouette.

## Runtime status

CAU CÓ remains `awaiting-genuine-strip`. There is still **no** `productionAssetPath` for him.

The exact concept authority file is documentation/QA input only and is not loaded as a runtime Character sprite. The CH-18.10 fallback remains active until a genuine 8×192×192 high-resolution walk strip passes visual QA against this pinned source.

## Existing motion contract

- Walk: 8 frames, existing movement cadence and left/right flip.
- Idle: subtle CH-18.13 breathing.
- Active ring: 78×18 at local Y=31, fixed below the Character.
- Layer order: foot ring below walk/static/live body.
- Face/live camera contract unchanged.
- Cloudflare Worker unchanged.
