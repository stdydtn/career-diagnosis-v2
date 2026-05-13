import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { aiCareerDevPlugin } from './vite-plugins/aiCareerDevPlugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const loaded = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return {
    plugins: [react(), aiCareerDevPlugin()],
  }
})
