# Teacher recordings — they replace the computer voice

If a word on the wall is pronounced wrongly (the review found "കോഴി"), record it
yourself and it will be used instead, everywhere that word is said.

1. Record the word on a phone, slowly and clearly, once. Any common format works:
   `.m4a` (iPhone / most Android recorders), `.mp3`, `.wav`, `.ogg`, `.aac`, `.opus`.
2. Name the file **exactly the word as it appears on screen**, for example
   `കോഴി.m4a` or `കോഴിക്കുഞ്ഞ്.m4a`.
3. Put it in the folder for its language:
   `ml/` Malayalam · `en/` English · `hi/` Hindi · `kn/` Kannada
4. Run `node scripts/voice-lines.mjs` and rebuild the installer.

Silence at the start and end is trimmed and the volume is matched to the other
voices automatically. To go back to the computer voice, delete the file and
run step 4 again.
