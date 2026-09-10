# assets/new

All assets for the games in `new-games/`. Kept separate from the existing
`assets/` and `3dmodels/` trees so new work stays self-contained.

    models/     .glb  — binary glTF, textures embedded
    audio/      .mp3 (music, effects), .wav (short speech clips)
    images/     .png / .webp / .svg
    textures/   tiling surfaces for 3D scenes

## Referencing from a game

Pages in `new-games/` are one level deep, same as `games/`, so the prefix
is `../` — identical to every existing game:

    ../assets/new/models/apple.glb
    ../assets/new/audio/forest-ambience.mp3
    ../js/audio-manager.js          <- shared helpers still work unchanged

## Model requirements

- `.glb` (binary glTF), textures embedded in the single file
- under ~5 MB each — this runs on a projector wall, not a workstation
- Y-up, centred at origin, real-world-ish relative scale
- CC0 or CC-BY licensed

Consistent scale and art style across a set matters more than the fidelity
of any single model, since items are shown side by side in grids.
