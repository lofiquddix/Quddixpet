import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/', // Updated the base path from '/Quddixpet/' to '/' to fix routing issues
});
