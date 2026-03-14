import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For dev: set VITE_API_URL=/api and VITE_GAS_URL=<full GAS exec URL> so proxy avoids CORS.
const gasUrl = process.env.VITE_GAS_URL || (process.env.VITE_API_URL?.startsWith('http') ? process.env.VITE_API_URL : null);

function proxyConfig() {
  if (!gasUrl) return undefined;
  const { origin, pathname } = new URL(gasUrl);
  return {
    '/api': {
      target: origin,
      changeOrigin: true,
      secure: true,
      rewrite: () => pathname,
    },
  };
}

export default defineConfig({
  plugins: [react()],
  base: '/SevaApp/',
  server: {
    proxy: proxyConfig(),
  },
});
