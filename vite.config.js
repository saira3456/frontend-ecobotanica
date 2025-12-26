import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  root: '.', // Ensure this is set to your project root, if needed
  build: {
    outDir: 'dist', // Make sure output is being written to the correct folder
  },
});
