import { defineConfig, loadEnv } from 'vite';
import path, { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import legacy from '@vitejs/plugin-legacy';
import vueJsx from '@vitejs/plugin-vue-jsx';
import viteSvgIcons from 'vite-plugin-svg-icons';
import copy from 'rollup-plugin-copy';
const pathSrc = path.resolve(__dirname, 'src');
export default ({ command, mode }: any) => {
  return defineConfig({
    // base: process.env.VITE_APP_BUILID_PATH,
    base: loadEnv(mode, process.cwd()).VITE_APP_BUILID_PATH,
    // base: '//cdn.upchinaproduct.com/CompliancePcWebServer',
    public: '/',
    define: {
      'process.platform': null,
      'process.version': null
    },
    clearScreen: false,
    server: {
      hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
      // 服务配置
      host: '0.0.0.0', // Network 配置
      port: 3001, // 类型： number 指定服务器端口;
      open: true, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: false, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      proxy: {
        // 类型： Record<string, string | ProxyOp 为开发服务器配置自定义代理规则
        '/mgr': {
          target: process.env.VUE_APP_BASE_URL,
          changeOrigin: true,
          secure: false
        },
        '/hq': {
          target: 'http://prx.test.upchina.com/json',
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [
      vue(),
      vueJsx(),

      legacy({
        targets: ['ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      }),
      viteSvgIcons({
        // config svg dir that can config multi
        iconDirs: [path.resolve(process.cwd(), 'src/icons/common'), path.resolve(process.cwd(), 'src/icons/nav-bar')],
        // appoint svg icon using mode
        symbolId: 'icon-[dir]-[name]'
      }),
      copy({
        targets: [
          {
            src: '../CompliancePcWebServer/public/compliance/index.html',
            dest: '../CompliancePcWebServer/views',
            rename: 'index.ejs'
          }
        ],
        hook: 'writeBundle'
      })
    ],
    build: {
      // minify: 'terser',
      brotliSize: false,
      target: 'es2015',
      sourcemap: false, // 构建后是否生成 source map 文件
      // 消除打包大小超过500kb警告
      outDir: '../CompliancePcWebServer/public/compliance',
      chunkSizeWarningLimit: 2000,
      assetsDir: 'static',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    resolve: {
      alias: {
        '~': resolve(__dirname, './'),
        '@': resolve(__dirname, './src')
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.mjs']
    },
    css: {
      preprocessorOptions: {
        //define global scss variable
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    optimizeDeps: {
      include: ['element-plus/lib/locale/lang/zh-cn', 'element-plus/lib/locale/lang/en']
    }
  });
};
