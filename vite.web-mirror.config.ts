import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      external: ['phaser'],
    },
  },
  plugins: [
    {
      name: 'mememe-web-mirror-phaser-importmap',
      transformIndexHtml(html) {
        const importMap = `\n    <script type="importmap">\n      {\n        "imports": {\n          "phaser": "https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js"\n        }\n      }\n    </script>`;
        return html.replace('</head>', `${importMap}\n  </head>`);
      },
    },
  ],
});
