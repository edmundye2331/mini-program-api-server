# 玲珑酒馆后台管理系统 - 前端项目初始化指南

## 🚀 快速开始

### 前置要求

- **Node.js**: 16.0.0 或更高版本
- **npm**: 8.0.0 或更高版本（或 yarn 3.0.0+）
- **Git**: 最新版本
- **VS Code**: 推荐使用最新版本

### 1. 项目创建

```bash
# 使用 Vite 创建 Vue 3 + TypeScript 项目
npm create vite@latest admin-frontend -- --template vue-ts

# 进入项目目录
cd admin-frontend

# 安装依赖
npm install
```

### 2. 安装必要的依赖

#### 核心依赖

```bash
# 路由管理
npm install vue-router@next

# 状态管理
npm install pinia

# HTTP 客户端
npm install axios

# UI 组件库
npm install element-plus

# 图表库
npm install echarts

# 日期处理
npm install dayjs

# 工具函数库
npm install lodash-es

# 类型定义
npm install -D @types/lodash-es
```

#### 开发依赖

```bash
# TypeScript
npm install -D typescript

# 代码检查和格式化
npm install -D eslint prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-vue

# 提交规范
npm install -D husky lint-staged

# 其他工具
npm install -D sass
npm install -D vite-plugin-vue-setup-extend
```

### 3. 项目结构初始化

```bash
# 创建目录结构
mkdir -p src/{api,components,pages,stores,types,utils,config,middleware,layouts,assets}
mkdir -p src/api/modules
mkdir -p src/components/{common,form,table,chart,upload}
mkdir -p src/pages/{login,dashboard,user,goods,order,points,member,statistics}
mkdir -p src/stores/modules
mkdir -p public

# 创建配置文件
touch .env
touch .env.development
touch .env.staging
touch .env.production
touch vite.config.ts
touch tsconfig.json
touch eslintrc.json
touch prettier.config.js
```

---

## 📁 详细的项目结构

### 完整目录树

```
admin-frontend/
│
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── api/                    # API 请求层
│   │   ├── modules/
│   │   │   ├── user.ts         # 用户相关 API
│   │   │   ├── goods.ts        # 商品相关 API
│   │   │   ├── order.ts        # 订单相关 API
│   │   │   ├── points.ts       # 积分相关 API
│   │   │   ├── member.ts       # 会员相关 API
│   │   │   ├── auth.ts         # 认证相关 API
│   │   │   └── statistics.ts   # 统计相关 API
│   │   ├── request.ts          # Axios 实例配置
│   │   ├── interceptors.ts     # 请求/响应拦截器
│   │   └── index.ts            # API 导出
│   │
│   ├── assets/                 # 资源文件
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── components/             # 可复用组件
│   │   ├── common/
│   │   │   ├── Header.vue      # 头部导航
│   │   │   ├── Sidebar.vue     # 侧边栏
│   │   │   ├── Pagination.vue  # 分页器
│   │   │   ├── Dialog.vue      # 对话框
│   │   │   ├── StatusBadge.vue # 状态徽章
│   │   │   └── Loading.vue     # 加载指示器
│   │   ├── form/
│   │   │   ├── SearchForm.vue        # 搜索表单
│   │   │   ├── EditorForm.vue        # 编辑表单
│   │   │   ├── DateRangePicker.vue   # 日期范围选择
│   │   │   └── MultiSelect.vue       # 多选框
│   │   ├── table/
│   │   │   ├── DataTable.vue         # 数据表格
│   │   │   └── ActionButtons.vue     # 操作按钮组
│   │   ├── chart/
│   │   │   ├── LineChart.vue    # 折线图
│   │   │   ├── BarChart.vue     # 柱状图
│   │   │   ├── PieChart.vue     # 饼图
│   │   │   └── MixedChart.vue   # 混合图
│   │   └── upload/
│   │       ├── ImageUpload.vue  # 图片上传
│   │       ├── FileUpload.vue   # 文件上传
│   │       └── BatchUpload.vue  # 批量上传
│   │
│   ├── config/                 # 配置文件
│   │   ├── constants.ts        # 常量定义
│   │   ├── endpoints.ts        # API 端点
│   │   ├── permissions.ts      # 权限配置
│   │   └── routes.ts           # 路由配置
│   │
│   ├── layouts/                # 布局组件
│   │   ├── AdminLayout.vue     # 管理员布局
│   │   └── AuthLayout.vue      # 认证布局
│   │
│   ├── middleware/             # 路由中间件
│   │   ├── auth.ts             # 认证中间件
│   │   └── permission.ts       # 权限中间件
│   │
│   ├── pages/                  # 页面组件
│   │   ├── login/
│   │   │   ├── LoginPage.vue       # 登录页
│   │   │   └── ForgotPassword.vue  # 忘记密码
│   │   ├── dashboard/
│   │   │   └── DashboardPage.vue   # 仪表板
│   │   ├── user/
│   │   │   ├── UserList.vue        # 用户列表
│   │   │   ├── UserDetail.vue      # 用户详情
│   │   │   └── UserForm.vue        # 用户编辑
│   │   ├── goods/
│   │   │   ├── GoodsList.vue       # 商品列表
│   │   │   ├── GoodsDetail.vue     # 商品详情
│   │   │   ├── GoodsForm.vue       # 商品编辑
│   │   │   └── CategoryManager.vue # 分类管理
│   │   ├── order/
│   │   │   ├── OrderList.vue       # 订单列表
│   │   │   ├── OrderDetail.vue     # 订单详情
│   │   │   └── OrderShipping.vue   # 发货管理
│   │   ├── points/
│   │   │   ├── PointsRecord.vue    # 积分记录
│   │   │   ├── ExchangeManager.vue # 兑换管理
│   │   │   └── PointsGoods.vue     # 积分商品
│   │   ├── member/
│   │   │   ├── MemberList.vue      # 会员列表
│   │   │   ├── MemberDetail.vue    # 会员详情
│   │   │   └── MemberForm.vue      # 会员编辑
│   │   └── statistics/
│   │       ├── Dashboard.vue       # 统计仪表板
│   │       ├── SalesAnalysis.vue   # 销售分析
│   │       ├── OrderAnalysis.vue   # 订单分析
│   │       └── UserAnalysis.vue    # 用户分析
│   │
│   ├── router/                 # 路由配置
│   │   ├── index.ts            # 路由入口
│   │   ├── guards.ts           # 路由守卫
│   │   └── routes.ts           # 路由定义
│   │
│   ├── stores/                 # Pinia 状态管理
│   │   ├── modules/
│   │   │   ├── auth.ts         # 认证状态
│   │   │   ├── user.ts         # 用户状态
│   │   │   ├── app.ts          # 应用状态
│   │   │   ├── cache.ts        # 缓存状态
│   │   │   └── notification.ts # 通知状态
│   │   └── index.ts            # Store 导出
│   │
│   ├── styles/                 # 全局样式
│   │   ├── index.css           # 主样式文件
│   │   ├── variables.css       # 变量定义
│   │   ├── theme.css           # 主题样式
│   │   └── animations.css      # 动画定义
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── common.ts           # 通用类型
│   │   ├── api.ts              # API 相关类型
│   │   ├── user.ts             # 用户类型
│   │   ├── goods.ts            # 商品类型
│   │   ├── order.ts            # 订单类型
│   │   ├── points.ts           # 积分类型
│   │   ├── member.ts           # 会员类型
│   │   └── statistics.ts       # 统计类型
│   │
│   ├── utils/                  # 工具函数
│   │   ├── storage.ts          # 本地存储操作
│   │   ├── format.ts           # 数据格式化
│   │   ├── validate.ts         # 数据验证
│   │   ├── auth.ts             # 认证工具
│   │   ├── permission.ts       # 权限检查
│   │   ├── request.ts          # 请求工具
│   │   ├── array.ts            # 数组操作
│   │   └── object.ts           # 对象操作
│   │
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 应用入口
│   └── vite-env.d.ts          # Vite 类型声明
│
├── .env                        # 环境变量示例
├── .env.development            # 开发环境变量
├── .env.staging                # 测试环境变量
├── .env.production             # 生产环境变量
├── .eslintrc.json             # ESLint 配置
├── .prettierrc.js             # Prettier 配置
├── .prettierignore            # Prettier 忽略文件
├── .gitignore                 # Git 忽略文件
├── eslintrc.json              # ESLint 配置
├── index.html                 # HTML 入口
├── package.json               # 项目配置
├── package-lock.json          # 依赖锁定文件
├── README.md                  # 项目说明
├── tsconfig.json              # TypeScript 配置
└── vite.config.ts             # Vite 配置
```

---

## 🔧 核心配置文件

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    vueSetupExtend(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus', 'echarts'],
        },
      },
    },
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### .eslintrc.json

```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "plugins": ["vue", "@typescript-eslint"],
  "rules": {
    "vue/multi-word-component-names": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

### prettier.config.js

```javascript
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'auto',
  tabWidth: 2,
  useTabs: false,
};
```

---

## 📦 package.json 脚本配置

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "build:staging": "vue-tsc && vite build --mode staging",
    "preview": "vite preview",
    "lint": "eslint --ext .js,.ts,.vue src",
    "lint:fix": "eslint --ext .js,.ts,.vue src --fix",
    "format": "prettier --write src/",
    "type-check": "vue-tsc --noEmit",
    "analyze": "vite build --analyze"
  }
}
```

---

## 🔨 核心文件示例

### main.ts 入口文件

```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from './App.vue';
import router from './router';
import '@/styles/index.css';

const app = createApp(App);

// 安装插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');
```

### App.vue 根组件

```vue
<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/modules/auth';

const authStore = useAuthStore();

// 应用初始化
onMounted(() => {
  // 恢复认证状态
  authStore.restoreSession();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
```

### router/index.ts 路由配置

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { setupGuards } from './guards';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/LoginPage.vue'),
    meta: { layout: 'auth' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'UserList',
    component: () => import('@/pages/user/UserList.vue'),
    meta: { requiresAuth: true, title: '用户管理' },
  },
  // ... 其他路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 设置路由守卫
setupGuards(router);

export default router;
```

---

## 🚀 开发工作流

### 1. 启动开发服务器

```bash
npm run dev
# 访问: http://localhost:5173
```

### 2. 开发新功能

```bash
# 1. 创建新分支
git checkout -b feature/user-management

# 2. 开发功能
# 编写组件、页面、API 等

# 3. 代码检查和格式化
npm run lint:fix
npm run format

# 4. 提交更改
git add .
git commit -m "feat(user): add user management page"
git push origin feature/user-management

# 5. 创建 Pull Request
```

### 3. 构建和部署

```bash
# 开发构建
npm run build

# 测试环境构建
npm run build:staging

# 预览构建结果
npm run preview
```

---

## 📝 常见配置

### .env 文件示例

```env
# 应用配置
VITE_APP_TITLE=玲珑酒馆后台管理系统
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOG=true

# 开发配置
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost
```

---

## ✅ 项目初始化检查清单

- [ ] 安装 Node.js 和 npm
- [ ] 创建项目目录
- [ ] 初始化 Git 仓库
- [ ] 安装所有依赖
- [ ] 配置 TypeScript
- [ ] 配置 ESLint 和 Prettier
- [ ] 创建项目目录结构
- [ ] 配置环境变量
- [ ] 设置路由和状态管理
- [ ] 配置 API 请求客户端
- [ ] 创建基础布局组件
- [ ] 实现认证系统
- [ ] 编写第一个页面
- [ ] 测试开发环境
- [ ] 配置构建流程

---

## 🆘 故障排除

### Q: 启动时提示 TypeScript 错误？

**A**: 运行 `npm run type-check` 检查类型错误，使用 `npm run lint:fix` 自动修复

### Q: 模块导入失败？

**A**: 检查 `tsconfig.json` 中的 `paths` 配置，确保路径别名正确

### Q: 样式不生效？

**A**: 确保在 `main.ts` 中导入了全局样式文件

---

## 📚 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Element Plus 组件库](https://element-plus.org/)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-27  
**维护者**: 玲珑酒馆技术团队
