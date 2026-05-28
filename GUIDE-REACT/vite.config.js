import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


export default defineConfig({
  plugins: [react()],

  resove: {
    alias: {
      // ─────────────────────────────────────────────
      // '@' 를 'src/' 로 바꿔줘요.
      // 퍼블리싱에서 절대경로 쓰는 것과 같은 개념이에요.
      //
      // 없으면:  import Button from '../../../components/Button'
      // 있으면:  import Button from '@/components/Button'
      // ─────────────────────────────────────────────
      '@': path.resolve(__dirname, './src'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // ─────────────────────────────────────────────
        // 모든 .scss 파일 맨 위에 이 두 줄을 자동으로 붙여줘요.
        // 덕분에 Button.scss 안에서 $color-primary 바로 쓸 수 있어요.
        // @import 안 해도 돼요.
        // ─────────────────────────────────────────────
        additionalData: `
          @use '@/styles/variables' as *;
          @use '@/styles/mixins' as *;
        `,
      },
    },
      }
});
