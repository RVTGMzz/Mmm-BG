# MeMeMe — CH-02E Layered Character Art Pipeline

Status: **PRODUCTION LAYER CONTRACT LOCKED / IMAGE EXPORTS PENDING**

CH-02E turns the approved Character concepts into a safe runtime asset contract without committing the full concept sheets to Git.

## Visual authority

Approved concept folder:

`https://drive.google.com/drive/folders/1NGZQXRXWSiKGVNjjDawJzvnboFcfZHoN?usp=drive_link`

Canonical mapping is encoded in:

`src/content/core/character_art_manifest_v01.ts`

Approved concept files:

- `khocnhe.webp` → KHÓC NHÈ
- `cauco.webp` → CAU CÓ
- `lolang.webp` → LO LẮNG
- `tangdong.webp` → TĂNG ĐỘNG
- `embe.webp` → EM BÉ BÁ ĐẠO

Concept sheets are reference art only. They are not directly bundled into the game.

## Production master

Each Character pose is authored on a transparent **1024 × 1536** master canvas.

All seven Character emotions use the same canvas contract:

- neutral
- happy
- angry
- panic
- smug
- cry
- shocked

The current player capture still supplies neutral/happy/angry. Richer Character emotions deterministically map to those captures through the existing Character System fallback.

## Required runtime layers

For each pose:

`/assets/characters/<characterId>/<emotion>/body-back.webp`

Everything behind the player's head source:
- body;
- neck;
- clothing;
- back hair;
- rear accessories.

`/assets/characters/<characterId>/<emotion>/foreground.webp`

Everything that must overlap the inserted player head:
- hair fringe;
- glasses;
- tears;
- hands passing in front of the face;
- scarves/accessories crossing the face;
- Secret Baby pacifier.

`/assets/characters/<characterId>/<emotion>/face-mask.webp`

Alpha mask for the head source. It should be generous enough for:
- round faces;
- long faces;
- pointed chins;
- square jaws;
- different hair volume.

**Do not use a hard circular mask.**

## Runtime composition order

1. body-back
2. non-circular player head source
3. face mask/socket transform
4. foreground
5. reaction FX / stickers
6. UI text

This is what makes the result feel like the player belongs inside the Character instead of having a profile photo pasted on top.

## Socket coordinates

Do **not** guess face socket coordinates from the concept sheet.

A pose becomes `runtime-ready` only after the final transparent layers exist and the head socket has been measured against those exact exports.

Required metadata:
- normalized x;
- normalized y;
- scale;
- optional rotation;
- optional padding.

Until then every manifest remains:

`status: "layer-export-pending"`

## Secret Baby rule

Secret Baby may have production assets in the source tree, but normal Character Select must never import/preload or display them before RANDOM reveal.

The pacifier belongs in the **foreground** layer so it can naturally sit over the player's mouth/lower face.

## Repo weight

Only production-sized transparent runtime layers should enter the game asset tree.

The full concept sheets stay on Drive, preventing repeated concept revisions from bloating Git history.

## Next step

Start the first real layer export with **KHÓC NHÈ / neutral** only.

Once the single pose works in Character Select with a real player face, measure its socket, validate face shapes, then replicate the pipeline to the remaining poses and Characters.
