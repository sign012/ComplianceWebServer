## CompliancePcWebServer

量加慧眼-合规监控平台

## 目录结构

- Front 存放前端代码，里面用了 vite 构建
- CompliancePcWebServer 存放后台代码
  - routes 存放路由代码
  - public 存放静态文件
  - lib 存放后端一些公用库

## 启动项目

### 需要安装全局插件

```
npm install -g eslint eslint-config-airbnb eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y babel-eslint nodemon
```

### 启动 express

```
cd CompliancePcWebServer
npm i
npm run dev
```

### 启动前端构建

```
cd Front
npm i
npm run dev
```

### 发布

```
cd Front

npm run build  // 构建前端 打包node

```
