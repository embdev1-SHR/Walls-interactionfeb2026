import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        intro: resolve(__dirname, 'intro.html'),
        freecanvas: resolve(__dirname, 'FreeCanvas.html'),
        solarsystem: resolve(__dirname, 'solar-system.html'),
        'alphabet-explorer': resolve(__dirname, 'games/alphabet-explorer.html'),
        'alphabet-explorer-multi': resolve(__dirname, 'games/alphabet-explorer-multi.html'),
        'arithmetica': resolve(__dirname, 'games/arithmetica.html'),
        'arithmetica-multi': resolve(__dirname, 'games/arithmetica-multi.html'),
        'coloring-book': resolve(__dirname, 'games/coloring-book.html'),
        'creature-creator': resolve(__dirname, 'games/creature-creator.html'),
        'fish-it': resolve(__dirname, 'games/fish-it.html'),
        'forest-animals': resolve(__dirname, 'games/forest-animals.html'),
        'fruit-math': resolve(__dirname, 'games/fruit-math.html'),
        'fruit-math-multi': resolve(__dirname, 'games/fruit-math-multi.html'),
        'fruit-ninja': resolve(__dirname, 'games/fruit-ninja.html'),
        'goalkeeper': resolve(__dirname, 'games/goalkeeper.html'),
        'hidden-animals': resolve(__dirname, 'games/hidden-animals.html'),
        'music-maker': resolve(__dirname, 'games/music-maker.html'),
        'number-crunch': resolve(__dirname, 'games/number-crunch.html'),
        'number-crunch-multi': resolve(__dirname, 'games/number-crunch-multi.html'),
        'number-explorer': resolve(__dirname, 'games/number-explorer.html'),
        'particle-playground': resolve(__dirname, 'games/particle-playground.html'),
        'rhythm-dance': resolve(__dirname, 'games/rhythm-dance.html'),
        'room-sorter': resolve(__dirname, 'games/room-sorter.html'),
        'underwater-explorer': resolve(__dirname, 'games/underwater-explorer.html'),
        'word-creator': resolve(__dirname, 'games/word-creator.html'),
        'word-explorer': resolve(__dirname, 'games/word-explorer.html')
      }
    }
  }
});
