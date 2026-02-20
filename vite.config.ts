import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';
import https from 'https';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Force IPv4 and keep connections alive
  const agent = new https.Agent({
    keepAlive: true,
    family: 4, // Force IPv4
    timeout: 30000
  });

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'https://toonashop.toonaerp.com',
          changeOrigin: true,
          secure: false,
          timeout: 30000,
          followRedirects: true,
          agent: agent,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        },
        // ─── Contact/Messages API proxy (évite les erreurs CORS) ────────────
        '/contact-api': {
          target: 'https://website-api.toonashop.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/contact-api/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('[ContactProxy] error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('[ContactProxy] →', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('[ContactProxy] ←', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
