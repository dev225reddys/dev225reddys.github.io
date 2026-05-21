import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://devendra.me',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
