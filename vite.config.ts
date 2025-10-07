import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 開發伺服器配置
  server: {
    port: 5030,
    host: true,
    open: true,
    proxy: {
      // 代理 API 請求到後端伺服器
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 預覽伺服器配置
  preview: {
    port: 5030,
    host: true,
  },

  // 建置配置
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },

  // 路徑別名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './src'),
    },
  },

  // 定義全域變數
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
