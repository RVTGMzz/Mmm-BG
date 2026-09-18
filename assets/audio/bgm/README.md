# MeMeMe BGM assets

The canonical metadata for the approved playtest BGM pack is `bgm_manifest.json` in this folder.

The four binary `.ogg` files are intentionally expected at runtime under `public/audio/bgm/` so Vite can copy them into the production build.

Expected files:

```text
public/audio/bgm/01_Menu_MeMeMe_LOOP.ogg
public/audio/bgm/02_City_Bubble_LOOP.ogg
public/audio/bgm/03_City_Silly_LOOP_EXTENDED.ogg
public/audio/bgm/04_Final_Round_LOOP.ogg
```

Source bundle: `MeMeMe_Audio_Pack_0.1.16.2.zip`

Bundle SHA-256:
`be197ee02d1cfcbed458e3ea6e002f6293dc3062a98a44fba315d629f3886744`

See `docs/AUDIO_PACK_0.1.16.2.md` for exact per-track hashes, durations, edit notes and intended runtime flow.

Important: the GitHub connector used to prepare this handoff cannot directly upload binary OGG/ZIP bytes. Do not treat missing `.ogg` binaries in the branch as approval to regenerate or substitute them. Recover the exact bundle from the associated ChatGPT File Library/current uploaded-file context and verify its checksum before integration.
