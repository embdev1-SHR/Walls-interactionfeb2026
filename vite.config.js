import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        coloring: resolve(__dirname, 'games/coloring-book.html'),
        underwater: resolve(__dirname, 'games/underwater-explorer.html')
      }
    }
  }
});
