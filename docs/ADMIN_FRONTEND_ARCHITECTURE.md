# 玲珑酒馆后台管理系统 - 前端架构设计

## 📐 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Client                      │
└────────────┬────────────────────────────────────┬────────┘
             │                                    │
      ┌──────▼────────┐                  ┌────────▼──────┐
      │ Vue 3 App     │                  │  Local Storage │
      │ (SPA)         │                  │  IndexedDB     │
      └────────┬──────┘                  └────────────────┘
             │
      ┌──────▼────────────────┐
      │  State Management     │
      │  (Pinia Store)        │
      │  - Auth Store         │
      │  - User Store         │
      │  - Cache Store        │
      └──────┬────────────────┘
             │
      ┌──────▼────────────────┐
      │  Router / Views       │
      │  - Login              │
      │  - Dashboard          │
      │  - CRUD Pages         │
      └──────┬────────────────┘
             │
      ┌──────▼────────────────────┐
      │  HTTP Client (Axios)      │
      │  - Request Interceptor    │
      │  - Response Interceptor   │
      │  - Error Handling         │
      └──────┬────────────────────┘
             │
      ┌──────▼────────────────────┐
      │  REST API                 │
      │  /api/admin/...           │
      │  /api/common/...          │
      └──────┬────────────────────┘
             │
      ┌──────▼────────────────────┐
      │  Backend Services         │
      │  (Node.js + Express)      │
      │  - User Controller        │
      │  - Goods Controller       │
      │  - Order Controller       │
      │  - Points Controller      │
      │  - Statistics Controller  │
      └──────┬────────────────────┘
             │
      ┌──────▼────────────────────┐
      │  Database & Cache         │
      │  - MySQL                  │
      │  - Redis                  │
      └────────────────────────────┘
```

---

## 🏗️ 项目分层架构

### 第一层: 视图层 (Presentation Layer)

```
src/pages/
├── login/                      # 登录页面
│   ├── LoginPage.vue          # 登录界面
│   └── ForgotPassword.vue     # 忘记密码
├── dashboard/                  # 仪表板
│   └── DashboardPage.vue      # 主仪表板
├── user/                       # 用户管理
│   ├── UserList.vue           # 列表页
│   ├── UserDetail.vue         # 详情页
│   └── UserForm.vue           # 编辑表单
├── goods/                      # 商品管理
│   ├── GoodsList.vue
│   ├── GoodsDetail.vue
│   └── CategoryManager.vue
├── order/                      # 订单管理
│   ├── OrderList.vue
│   ├── OrderDetail.vue
│   └── OrderShipping.vue
├── points/                     # 积分管理
│   ├── PointsRecord.vue
│   ├── ExchangeManager.vue
│   └── PointsGoods.vue
├── member/                     # 会员管理
│   ├── MemberList.vue
│   └── MemberDetail.vue
└── statistics/                 # 数据统计
    ├── Dashboard.vue
    ├── SalesAnalysis.vue
    └── OrderAnalysis.vue
```

**职责**: 
- 渲染用户界面
- 用户交互处理
- 表单验证
- 页面路由

### 第二层: 组件层 (Component Layer)

```
src/components/
├── common/                     # 通用组件
│   ├── Header.vue             # 头部导航
│   ├── Sidebar.vue            # 侧边栏
│   ├── Pagination.vue         # 分页器
│   ├── ConfirmDialog.vue      # 确认对话框
│   └── LoadingSpinner.vue     # 加载指示器
├── form/                       # 表单组件
│   ├── SearchForm.vue         # 搜索表单
│   ├── EditorForm.vue         # 编辑表单
│   ├── DateRangePicker.vue    # 日期范围选择
│   └── MultiSelect.vue        # 多选框
├── table/                      # 表格组件
│   ├── DataTable.vue          # 数据表格
│   ├── ActionButtons.vue      # 操作按钮组
│   └── StatusBadge.vue        # 状态徽章
├── chart/                      # 图表组件
│   ├── LineChart.vue          # 折线图
│   ├── BarChart.vue           # 柱状图
│   ├── PieChart.vue           # 饼图
│   └── MixedChart.vue         # 混合图
└── upload/                     # 上传组件
    ├── ImageUpload.vue        # 图片上传
    ├── FileUpload.vue         # 文件上传
    └── BatchUpload.vue        # 批量上传
```

**职责**:
- 提供可复用的 UI 组件
- 组件间数据通信
- Props 和 Events 定义
- 样式和动画

### 第三层: 状态管理层 (State Management Layer)

```
src/stores/
├── modules/
│   ├── auth.ts                # 认证状态
│   │   ├── state: { token, user, permissions }
│   │   ├── getters: { isAdmin, hasPermission }
│   │   └── actions: { login, logout, refreshToken }
│   │
│   ├── user.ts                # 用户状态
│   │   ├── state: { users, currentUser }
│   │   ├── actions: { fetchUsers, updateUser }
│   │   └── getters: { getUserById }
│   │
│   ├── app.ts                 # 应用状态
│   │   ├── state: { theme, language, sidebar }
│   │   └── actions: { toggleTheme, changeLang }
│   │
│   ├── cache.ts               # 缓存状态
│   │   ├── state: { users, goods, categories }
│   │   └── actions: { cacheData, invalidateCache }
│   │
│   └── notification.ts        # 通知状态
│       ├── state: { messages, alerts }
│       └── actions: { showMessage, clearNotifications }
│
└── index.ts                   # Store 配置
```

**职责**:
- 集中管理应用状态
- 缓存数据管理
- 用户认证状态
- 应用全局配置

### 第四层: API 层 (API Layer)

```
src/api/
├── modules/
│   ├── user.ts                # 用户 API
│   ├── goods.ts               # 商品 API
│   ├── order.ts               # 订单 API
│   ├── points.ts              # 积分 API
│   ├── member.ts              # 会员 API
│   └── statistics.ts          # 统计 API
├── request.ts                 # Axios 实例
├── interceptors.ts            # 拦截器配置
└── index.ts                   # API 导出
```

**职责**:
- 封装 HTTP 请求
- 统一错误处理
- 请求/响应拦截
- API 参数验证

### 第五层: 工具层 (Utility Layer)

```
src/utils/
├── storage.ts                 # 本地存储操作
├── format.ts                  # 数据格式化
├── validate.ts                # 数据验证
├── auth.ts                    # 认证工具
├── permission.ts              # 权限检查
├── request.ts                 # 请求工具
├── array.ts                   # 数组操作
└── object.ts                  # 对象操作
```

**职责**:
- 提供通用工具函数
- 数据转换和验证
- 存储管理

### 第六层: 类型定义层 (Type Definition Layer)

```
src/types/
├── common.ts                  # 通用类型
├── api.ts                     # API 相关类型
├── user.ts                    # 用户类型
├── goods.ts                   # 商品类型
├── order.ts                   # 订单类型
├── points.ts                  # 积分类型
├── member.ts                  # 会员类型
└── statistics.ts              # 统计类型
```

**职责**:
- TypeScript 类型定义
- 接口规范化
- 类型安全性

---

## 🔄 数据流向

### 单向数据流

```typescript
用户交互 
  ↓
【页面组件】
  ↓
处理事件 → 调用 Action
  ↓
【Pinia Store】
  ↓
Dispatch Action → 调用 API
  ↓
【API 层】
  ↓
HTTP 请求
  ↓
【后端服务】
  ↓
HTTP 响应
  ↓
【API 层】
  ↓
处理响应 → 提交 Mutation
  ↓
【Pinia Store】
  ↓
更新 State
  ↓
【页面组件】(通过 computed 监听变化)
  ↓
重新渲染视图
```

### 具体示例: 获取用户列表

```typescript
// 1. 用户点击"刷新"按钮
UserList.vue
  ├─ onClick: handleRefresh()
  │
  // 2. 调用 Store Action
  ├─ userStore.fetchUsers({ page: 1, pageSize: 10 })
  │
  // 3. Store 调用 API
  ├─ const data = await api.getUsers(params)
  │
  // 4. API 请求后端
  ├─ GET /api/admin/users?page=1&pageSize=10
  │
  // 5. 后端返回数据
  ├─ response: { code: 0, data: { items: [...], total: 100 } }
  │
  // 6. Store 更新状态
  ├─ state.users = data.items
  ├─ state.total = data.total
  │
  // 7. 组件自动更新
  └─ 页面列表重新渲染
```

---

## 🔐 认证与授权

### 认证流程

```
登录界面
  ↓
【Input: 账号密码】
  ↓
调用登录 API
  ↓ POST /api/auth/login
后端验证 → 生成 Token
  ↓
【返回: Token + User Info】
  ↓
Store 保存 Token
  ↓
LocalStorage 持久化
  ↓
跳转到仪表板
```

### 授权流程

```
页面加载
  ↓
路由守卫检查
  ├─ 检查 Token 是否存在
  ├─ 如果不存在 → 跳转登录
  ├─ 如果存在 → 验证 Token
  └─ 如果过期 → 刷新 Token
  │
  ├─ 检查页面权限
  ├─ 如果缺少权限 → 跳转 403
  └─ 如果有权限 → 允许访问
  │
允许进入页面
  ↓
页面加载用户数据
  ├─ 从 Pinia 获取用户信息
  ├─ 从 API 刷新权限列表
  └─ 渲染页面
```

### Token 管理

```typescript
// 1. 存储位置
LocalStorage: { token, refreshToken, expiresAt }
Memory: { token (快速访问) }

// 2. Token 刷新策略
请求拦截器
  ↓
检查 Token 是否即将过期
  ↓
如果过期 → 调用刷新接口
  ├─ POST /api/auth/refresh
  ├─ 使用 refreshToken 获取新 Token
  └─ 更新本地存储
  ↓
继续原请求
```

---

## 🌐 API 请求处理

### 请求拦截器

```typescript
// src/api/interceptors.ts

export function setupRequestInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
      // 1. 从 Store 获取 Token
      const authStore = useAuthStore();
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
      }

      // 2. 添加通用请求头
      config.headers['Content-Type'] = 'application/json';
      config.headers['X-Client-Version'] = '1.0.0';
      config.headers['X-Timestamp'] = Date.now().toString();

      // 3. 添加请求签名（可选）
      if (config.method === 'post' || config.method === 'put') {
        config.data = addSignature(config.data);
      }

      return config;
    },
    (error) => {
      console.error('请求配置错误:', error);
      return Promise.reject(error);
    }
  );
}
```

### 响应拦截器

```typescript
// src/api/interceptors.ts

export function setupResponseInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const data = response.data;

      // 1. 检查业务状态码
      if (data.code === 0) {
        // 成功
        return data;
      } else if (data.code === 401) {
        // 未授权，跳转登录
        useAuthStore().logout();
        router.push('/login');
        return Promise.reject(new Error('登录已过期'));
      } else if (data.code === 403) {
        // 权限不足
        router.push('/403');
        return Promise.reject(new Error('权限不足'));
      } else {
        // 其他业务错误
        return Promise.reject(new Error(data.message));
      }
    },
    (error: AxiosError) => {
      // 2. 处理网络错误
      if (error.response) {
        const status = error.response.status;
        let message = '网络错误';

        switch (status) {
          case 400:
            message = '请求参数错误';
            break;
          case 500:
            message = '服务器错误';
            break;
          case 502:
            message = '网关错误';
            break;
          case 503:
            message = '服务不可用';
            break;
        }

        // 显示错误提示
        ElNotification.error({ title: '错误', message });
      } else if (error.request) {
        // 3. 没有收到响应
        ElNotification.error({ 
          title: '错误', 
          message: '网络连接失败，请检查网络' 
        });
      }

      return Promise.reject(error);
    }
  );
}
```

### 错误处理策略

```typescript
// src/api/request.ts

export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

// 统一错误处理
export async function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    // 业务错误
    showErrorNotification(error);
  } else if (error instanceof AxiosError) {
    // 网络错误
    showNetworkErrorNotification(error);
  } else {
    // 未知错误
    console.error('未知错误:', error);
  }
}
```

---

## 📦 状态管理示例

### 用户 Store (Pinia)

```typescript
// src/stores/modules/user.ts

import { defineStore } from 'pinia';
import type { User } from '@/types/user';
import * as userApi from '@/api/modules/user';

interface UserState {
  users: User[];
  currentUser: User | null;
  total: number;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    total: 0,
    loading: false,
    error: null,
  }),

  getters: {
    // 获取用户是否为管理员
    isAdmin: (state) => state.currentUser?.role === 'admin',
    
    // 根据 ID 获取用户
    getUserById: (state) => (id: string) => 
      state.users.find(user => user.id === id),
    
    // 获取有效用户
    activeUsers: (state) => 
      state.users.filter(user => user.status === 'active'),
  },

  actions: {
    // 获取用户列表
    async fetchUsers(params: { page: number; pageSize: number }) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await userApi.getUsers(params);
        this.users = response.data.items;
        this.total = response.data.total;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取用户详情
    async fetchUserDetail(userId: string) {
      try {
        const response = await userApi.getUserDetail(userId);
        const userIndex = this.users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          this.users[userIndex] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 创建用户
    async createUser(user: Omit<User, 'id'>) {
      try {
        const response = await userApi.createUser(user);
        this.users.push(response.data);
        this.total += 1;
        
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 更新用户
    async updateUser(userId: string, user: Partial<User>) {
      try {
        const response = await userApi.updateUser(userId, user);
        const userIndex = this.users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
          this.users[userIndex] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 删除用户
    async deleteUser(userId: string) {
      try {
        await userApi.deleteUser(userId);
        this.users = this.users.filter(u => u.id !== userId);
        this.total -= 1;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    // 清除错误
    clearError() {
      this.error = null;
    },
  },
});
```

### 在组件中使用

```typescript
// src/pages/user/UserList.vue

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const page = ref(1);
const pageSize = ref(10);

// 计算属性 - 自动响应式
const users = computed(() => userStore.users);
const total = computed(() => userStore.total);
const loading = computed(() => userStore.loading);

// 生命周期
onMounted(() => {
  loadUsers();
});

// 加载用户列表
const loadUsers = async () => {
  try {
    await userStore.fetchUsers({
      page: page.value,
      pageSize: pageSize.value,
    });
  } catch (error) {
    // 错误处理
    console.error('加载失败:', error);
  }
};

// 删除用户
const handleDelete = async (userId: string) => {
  try {
    await userStore.deleteUser(userId);
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};
</script>

<template>
  <div class="user-list">
    <el-table :data="users" v-loading="loading">
      <!-- 表格列 -->
    </el-table>
    
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="page = $event; loadUsers()"
    />
  </div>
</template>
```

---

## 🎯 最佳实践

### 1. 组件设计原则

```typescript
// ✅ 原则 1: 单一职责
// UserList.vue - 只负责列表展示
// UserForm.vue - 只负责表单编辑
// UserDetail.vue - 只负责详情展示

// ✅ 原则 2: Props Down, Events Up
export interface Props {
  user: User;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  update: [user: User];
  delete: [id: string];
}>();

// ✅ 原则 3: 可复用性
// 创建通用组件库
// 参数化配置
// 插槽扩展
```

### 2. 性能优化

```typescript
// ✅ 代码分割
const UserDetail = () => import('./UserDetail.vue');

// ✅ 懒加载列表
<virtual-scroller
  :items="items"
  :item-height="50"
  :buffer="5"
/>

// ✅ 缓存数据
const cachedUsers = computed(() => {
  return memo(users.value, (users) => {
    return users.map(u => ({...u, selected: false}));
  });
});

// ✅ 批量操作
// 合并多个请求，减少网络往返
const batchFetchData = async (ids: string[]) => {
  const response = await api.post('/batch', { ids });
  return response.data;
};
```

### 3. 错误处理

```typescript
// ✅ 统一错误处理
try {
  await userStore.fetchUsers();
} catch (error) {
  if (error.code === 401) {
    // 处理未授权
    router.push('/login');
  } else if (error.code === 403) {
    // 处理权限不足
    showForbiddenDialog();
  } else if (error.code === 404) {
    // 处理资源不存在
    showNotFoundDialog();
  } else {
    // 处理其他错误
    showErrorDialog(error.message);
  }
}
```

### 4. 类型安全

```typescript
// ✅ 强类型定义
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface UserListResponse {
  items: User[];
  total: number;
}

// 使用时
const response: ApiResponse<UserListResponse> = 
  await api.getUsers();

// ✅ 避免 any
// ❌ const data: any = response.data;
// ✅ const data: User[] = response.data.items;
```

---

## 📊 项目体积优化

### Webpack Bundle 分析

```bash
npm run analyze

# 输出分析报告
dist/
├── analyze.html
├── bundle.json
└── stats.json
```

### 优化策略

1. **代码分割**
   ```typescript
   // 路由级别代码分割
   const UserList = () => import('@/pages/user/UserList.vue');
   
   // 组件级别代码分割
   const ChartComponent = defineAsyncComponent(() =>
     import('@/components/chart/LineChart.vue')
   );
   ```

2. **Tree Shaking**
   ```typescript
   // ✅ 推荐
   import { formatDate } from 'date-fns';
   
   // ❌ 避免
   import * as dateFns from 'date-fns';
   ```

3. **按需加载 UI 库**
   ```typescript
   // Vite 配置
   import AutoImport from 'unplugin-auto-import/vite';
   import Components from 'unplugin-vue-components/vite';
   import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
   
   export default {
     plugins: [
       AutoImport({
         resolvers: [ElementPlusResolver()],
       }),
       Components({
         resolvers: [ElementPlusResolver()],
       }),
     ],
   };
   ```

---

## 🚀 部署流程

### 开发环境
```
git checkout -b feature/xxx
↓
开发功能
↓
本地测试
↓
git commit & push
↓
代码审查 (Code Review)
↓
合并到 develop 分支
```

### 测试环境
```
git push origin develop
↓
CI/CD 触发
↓
npm run build:staging
↓
自动部署到测试服务器
↓
测试验证
```

### 生产环境
```
创建 Release PR
↓
代码审查
↓
合并到 main 分支
↓
自动构建 & 部署
↓
监控和日志
```

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-27  
**维护者**: 玲珑酒馆技术团队
