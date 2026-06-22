import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // tsconfig.json の paths エイリアスを Vite ネイティブ機能で解決する
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
  },
})
