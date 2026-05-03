import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To add only specific polyfills, add them here
      include: ['buffer', 'events', 'process', 'util'],
      // Whether to polyfill `node:` protocol imports.
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
})
