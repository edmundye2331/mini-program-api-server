# 玲珑酒馆后台管理系统 - 前端开发指南

## 📚 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [功能模块](#功能模块)
5. [快速开始](#快速开始)
6. [开发规范](#开发规范)
7. [API 接口规范](#api-接口规范)
8. [部署指南](#部署指南)

---

## 项目概述

**项目名称**: 玲珑酒馆后台管理系统前端  
**项目类型**: B2B 管理后台  
**目标用户**: 酒馆管理员、营运人员  
**核心功能**: 商品、订单、用户、积分、统计管理

### 项目目标

- ✅ 为玲珑酒馆提供高效的运营管理平台
- ✅ 支持实时数据统计和分析
- ✅ 提供友好的用户界面和良好的用户体验
- ✅ 确保系统安全性和数据一致性
- ✅ 支持移动端响应式设计

---

## 技术栈

### 核心框架

| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue.js** | ^3.3+ | 前端框架 |
| **TypeScript** | ^5.0+ | 类型安全 |
| **Vite** | ^4.0+ | 构建工具 |
| **Vue Router** | ^4.0+ | 路由管理 |
| **Pinia** | ^2.0+ | 状态管理 |

### UI 及工具库

| 技术 | 版本 | 用途 |
|------|------|------|
| **Element Plus** | ^2.4+ | UI 组件库 |
| **Axios** | ^1.4+ | HTTP 请求 |
| **ECharts** | ^5.4+ | 数据可视化 |
| **Day.js** | ^1.11+ | 日期处理 |
| **Lodash-ES** | ^4.17+ | 工具函数 |

### 开发工具

```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.8.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

---

## 项目结构

```
admin-frontend/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/                     # API 请求
│   │   ├── modules/
│   │   │   ├── user.ts          # 用户 API
│   │   │   ├── goods.ts         # 商品 API
│   │   │   ├── order.ts         # 订单 API
│   │   │   ├── points.ts        # 积分 API
│   │   │   ├── member.ts        # 会员 API
│   │   │   └── statistics.ts    # 统计 API
│   │   ├── index.ts
│   │   └── request.ts           # axios 实例
│   ├── components/              # 可复用组件
│   │   ├── common/
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   ├── Pagination.vue
│   │   │   └── Dialog.vue
│   │   ├── form/
│   │   │   ├── SearchForm.vue
│   │   │   └── EditorForm.vue
│   │   └── chart/
│   │       ├── LineChart.vue
│   │       └── BarChart.vue
│   ├── config/                  # 配置文件
│   │   ├── constants.ts         # 常量定义
│   │   ├── endpoints.ts         # API 端点
│   │   └── routes.ts            # 路由配置
│   ├── layouts/                 # 布局组件
│   │   ├── AdminLayout.vue
│   │   └── AuthLayout.vue
│   ├── pages/                   # 页面组件
│   │   ├── login/
│   │   │   └── LoginPage.vue
│   │   ├── dashboard/
│   │   │   └── DashboardPage.vue
│   │   ├── user/
│   │   │   ├── UserList.vue
│   │   │   ├── UserDetail.vue
│   │   │   └── UserForm.vue
│   │   ├── goods/
│   │   │   ├── GoodsList.vue
│   │   │   ├── GoodsDetail.vue
│   │   │   └── CategoryManager.vue
│   │   ├── order/
│   │   │   ├── OrderList.vue
│   │   │   ├── OrderDetail.vue
│   │   │   └── OrderShipping.vue
│   │   ├── points/
│   │   │   ├── PointsRecord.vue
│   │   │   ├── ExchangeManager.vue
│   │   │   └── PointsGoods.vue
│   │   ├── member/
│   │   │   ├── MemberList.vue
│   │   │   └── MemberDetail.vue
│   │   └── statistics/
│   │       ├── SalesAnalysis.vue
│   │       ├── UserAnalysis.vue
│   │       └── OrderAnalysis.vue
│   ├── stores/                  # Pinia 状态管理
│   │   ├── modules/
│   │   │   ├── user.ts
│   │   │   ├── auth.ts
│   │   │   ├── app.ts
│   │   │   └── cache.ts
│   │   └── index.ts
│   ├── types/                   # TypeScript 类型定义
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── goods.ts
│   │   ├── order.ts
│   │   ├── points.ts
│   │   └── api.ts
│   ├── utils/                   # 工具函数
│   │   ├── storage.ts           # 本地存储
│   │   ├── format.ts            # 格式化
│   │   ├── validate.ts          # 验证
│   │   ├── request.ts           # 请求拦截
│   │   └── auth.ts              # 权限处理
│   ├── middleware/              # 路由中间件
│   │   ├── auth.ts
│   │   └── permission.ts
│   ├── App.vue
│   ├── main.ts
│   └── style/
│       ├── index.css
│       ├── variables.css
│       └── theme.css
├── env.example                  # 环境变量示例
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── eslintrc.json               # ESLint 配置
├── prettier.config.js          # Prettier 配置
└── package.json
```

---

## 功能模块

### 1. 用户管理模块 👥

**功能需求**:

- [x] 用户列表展示（分页、搜索、筛选）
- [x] 用户详情查看
- [x] 创建/编辑用户
- [x] 删除用户
- [x] 批量操作（禁用/启用）
- [x] 权限分配
- [x] 角色管理

**页面结构**:

```
UserManagement/
├── UserList.vue          # 用户列表主页
├── UserDetail.vue        # 用户详情页
├── UserForm.vue          # 用户编辑表单
├── PermissionDialog.vue  # 权限分配对话框
└── RoleManager.vue       # 角色管理
```

**关键字段**:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'blocked';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/users` | 获取用户列表 |
| GET | `/api/admin/users/:id` | 获取用户详情 |
| POST | `/api/admin/users` | 创建用户 |
| PUT | `/api/admin/users/:id` | 更新用户 |
| DELETE | `/api/admin/users/:id` | 删除用户 |
| POST | `/api/admin/users/:id/permissions` | 分配权限 |

---

### 2. 商品管理模块 🛍️

**功能需求**:

- [x] 商品列表（分页、搜索、分类筛选）
- [x] 商品详情
- [x] 创建/编辑商品
- [x] 删除商品
- [x] 库存管理
- [x] 分类管理
- [x] 批量导入/导出

**页面结构**:

```
GoodsManagement/
├── GoodsList.vue           # 商品列表
├── GoodsDetail.vue         # 商品详情
├── GoodsForm.vue           # 商品编辑表单
├── CategoryManager.vue     # 分类管理
├── InventoryManager.vue    # 库存管理
├── ImageUpload.vue         # 图片上传
└── BatchImport.vue         # 批量导入
```

**关键字段**:

```typescript
interface Goods {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  images: string[];
  tags: string[];
  status: 'available' | 'unavailable' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface GoodsCategory {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  sort: number;
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/goods` | 获取商品列表 |
| GET | `/api/admin/goods/:id` | 获取商品详情 |
| POST | `/api/admin/goods` | 创建商品 |
| PUT | `/api/admin/goods/:id` | 更新商品 |
| DELETE | `/api/admin/goods/:id` | 删除商品 |
| GET | `/api/admin/categories` | 获取分类列表 |
| POST | `/api/admin/goods/batch/import` | 批量导入 |
| GET | `/api/admin/goods/batch/export` | 批量导出 |

---

### 3. 订单管理模块 📦

**功能需求**:

- [x] 订单列表（状态筛选、日期范围）
- [x] 订单详情
- [x] 订单处理（确认、发货、完成）
- [x] 退款管理
- [x] 物流跟踪
- [x] 订单打印
- [x] 数据导出

**页面结构**:

```
OrderManagement/
├── OrderList.vue           # 订单列表
├── OrderDetail.vue         # 订单详情
├── OrderTracking.vue       # 物流跟踪
├── ReturnManager.vue       # 退款管理
├── OrderPrint.vue          # 订单打印
└── BatchExport.vue         # 批量导出
```

**关键字段**:

```typescript
interface Order {
  id: string;
  orderNo: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
  totalPrice: number;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippingStatus: 'unshipped' | 'shipped' | 'delivered';
  shippingInfo?: ShippingInfo;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  goodsId: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface ShippingInfo {
  carrier: string;
  trackingNo: string;
  estimatedDelivery: string;
  status: string;
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/orders` | 获取订单列表 |
| GET | `/api/admin/orders/:id` | 获取订单详情 |
| PUT | `/api/admin/orders/:id/status` | 更新订单状态 |
| POST | `/api/admin/orders/:id/ship` | 发货 |
| POST | `/api/admin/orders/:id/refund` | 退款 |
| GET | `/api/admin/orders/:id/tracking` | 获取物流信息 |
| GET | `/api/admin/orders/batch/export` | 导出订单 |

---

### 4. 积分管理模块 ⭐

**功能需求**:

- [x] 积分记录列表
- [x] 用户积分查看/调整
- [x] 积分商品管理
- [x] 兑换记录
- [x] 积分规则配置
- [x] 批量操作

**页面结构**:

```
PointsManagement/
├── PointsRecord.vue        # 积分记录
├── PointsAdjustment.vue    # 积分调整
├── ExchangeManager.vue     # 兑换管理
├── PointsGoods.vue         # 积分商品
└── RulesConfig.vue         # 规则配置
```

**关键字段**:

```typescript
interface PointsRecord {
  id: string;
  userId: string;
  points: number;
  type: 'earn' | 'spend' | 'adjust' | 'reward' | 'refund';
  source: string;
  description: string;
  balance: number;
  createdAt: string;
}

interface ExchangeRecord {
  id: string;
  userId: string;
  goodsId: string;
  pointsCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

interface PointsGoods {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  images: string[];
  status: 'available' | 'unavailable' | 'archived';
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/points/records` | 获取积分记录 |
| POST | `/api/admin/points/adjust` | 调整用户积分 |
| GET | `/api/admin/points/exchanges` | 获取兑换记录 |
| GET | `/api/admin/points/goods` | 获取积分商品 |
| POST | `/api/admin/points/goods` | 创建积分商品 |
| PUT | `/api/admin/points/goods/:id` | 更新积分商品 |
| GET | `/api/admin/points/rules` | 获取积分规则 |
| PUT | `/api/admin/points/rules` | 更新积分规则 |

---

### 5. 会员管理模块 👨‍👩‍👧‍👦

**功能需求**:

- [x] 会员列表
- [x] 会员详情
- [x] 会员等级管理
- [x] 会员分组管理
- [x] 会员统计分析
- [x] 消息推送

**页面结构**:

```
MemberManagement/
├── MemberList.vue          # 会员列表
├── MemberDetail.vue        # 会员详情
├── LevelManager.vue        # 等级管理
├── GroupManager.vue        # 分组管理
└── MemberStatistics.vue    # 统计分析
```

**关键字段**:

```typescript
interface Member {
  id: string;
  nickname: string;
  avatar?: string;
  phone: string;
  email?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalConsumption: number;
  currentPoints: number;
  groups: string[];
  registrationDate: string;
  lastLoginDate?: string;
  status: 'active' | 'inactive' | 'blocked';
}

interface MemberLevel {
  id: string;
  name: string;
  minConsumption: number;
  discount: number;
  benefits: string[];
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/members` | 获取会员列表 |
| GET | `/api/admin/members/:id` | 获取会员详情 |
| PUT | `/api/admin/members/:id` | 更新会员信息 |
| GET | `/api/admin/members/levels` | 获取等级列表 |
| POST | `/api/admin/members/levels` | 创建等级 |
| GET | `/api/admin/members/groups` | 获取分组列表 |
| POST | `/api/admin/members/push` | 推送消息 |

---

### 6. 数据统计模块 📊

**功能需求**:

- [x] 销售额统计
- [x] 订单统计
- [x] 用户统计
- [x] 商品排行
- [x] 趋势分析
- [x] 自定义报表
- [x] 数据导出

**页面结构**:

```
Statistics/
├── Dashboard.vue           # 统计仪表板
├── SalesAnalysis.vue       # 销售分析
├── OrderAnalysis.vue       # 订单分析
├── UserAnalysis.vue        # 用户分析
├── GoodsRanking.vue        # 商品排行
├── TrendAnalysis.vue       # 趋势分析
└── CustomReport.vue        # 自定义报表
```

**关键图表**:

```typescript
interface StatisticsData {
  // 销售数据
  dailySales: { date: string; sales: number }[];
  monthlySales: { month: string; sales: number }[];
  
  // 订单数据
  orderCount: { status: string; count: number }[];
  orderTrend: { date: string; count: number }[];
  
  // 用户数据
  userGrowth: { date: string; count: number }[];
  userLevel: { level: string; count: number }[];
  
  // 商品数据
  topGoods: { name: string; sales: number; revenue: number }[];
  categoryDistribution: { category: string; percentage: number }[];
}
```

**API 端点**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/admin/statistics/overview` | 获取概览数据 |
| GET | `/api/admin/statistics/sales` | 销售统计 |
| GET | `/api/admin/statistics/orders` | 订单统计 |
| GET | `/api/admin/statistics/users` | 用户统计 |
| GET | `/api/admin/statistics/goods` | 商品统计 |
| GET | `/api/admin/statistics/export` | 导出报表 |

---

## 快速开始

### 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 3.0.0
- **Git**: 最新版本

### 项目初始化

#### 步骤 1: 克隆项目

```bash
git clone https://github.com/linglong/admin-frontend.git
cd admin-frontend
```

#### 步骤 2: 安装依赖

```bash
npm install
# 或
yarn install
```

#### 步骤 3: 环境配置

创建 `.env.local` 文件：

```env
# 应用配置
VITE_APP_TITLE=玲珑酒馆后台管理系统
VITE_APP_VERSION=1.0.0

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 请求头配置
VITE_REQUEST_HEADERS_CONTENT_TYPE=application/json

# 开发配置
VITE_DEV_PORT=5173
VITE_DEV_HOST=localhost

# 构建配置
VITE_BUILD_OUT_DIR=dist

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOG=true
```

#### 步骤 4: 启动开发服务器

```bash
npm run dev
# 访问: http://localhost:5173
```

#### 步骤 5: 构建生产版本

```bash
npm run build
# 输出在 dist/ 目录
```

### 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run preview          # 预览生产构建

# 构建
npm run build            # 构建生产版本
npm run build:staging    # 构建测试版本

# 代码检查
npm run lint             # ESLint 检查
npm run lint:fix         # 修复 ESLint 错误
npm run format           # Prettier 格式化

# 测试
npm run test             # 运行单元测试
npm run test:coverage    # 生成覆盖率报告

# 其他
npm run analyze          # 分析包大小
npm run type-check       # TypeScript 类型检查
```

---

## 开发规范

### 1. 代码风格

#### 命名规范

- **文件夹**: kebab-case (如: `user-management`, `goods-list`)
- **组件文件**: PascalCase (如: `UserList.vue`, `GoodsForm.vue`)
- **TypeScript 文件**: camelCase (如: `utils/request.ts`, `types/user.ts`)
- **变量/函数**: camelCase (如: `getUserList()`, `isAdmin`)
- **常量**: UPPER_SNAKE_CASE (如: `MAX_FILE_SIZE`, `API_TIMEOUT`)

#### 文件组织

```typescript
// ✅ 推荐
import { defineComponent } from 'vue';
import type { User } from '@/types/user';
import UserForm from '@/components/UserForm.vue';

// ❌ 避免
import anything from '../../components/user/form.vue';
```

### 2. Vue 3 最佳实践

#### 组件定义

```typescript
// ✅ 推荐: 使用 <script setup>
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

const isVisible = ref(false);
const message = computed(() => `${props.title} - ${props.count}`);
</script>

<template>
  <div v-if="isVisible" class="component">
    {{ message }}
  </div>
</template>
```

#### 响应式数据

```typescript
// ✅ 推荐: Composition API
const { userList, loading, error } = useUserList();
const handleRefresh = () => {
  userList.value = [];
};

// ❌ 避免: Options API
export default {
  data() {
    return { userList: [] };
  },
};
```

### 3. TypeScript 规范

#### 类型定义

```typescript
// ✅ 推荐: 定义明确的接口
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

type UserRole = 'admin' | 'manager' | 'staff';

// ❌ 避免: 使用 any
const user: any = {};
```

#### 错误处理

```typescript
// ✅ 推荐
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

try {
  const data = await fetchData();
} catch (error) {
  const apiError = error as ApiError;
  console.error(`Error [${apiError.code}]: ${apiError.message}`);
}

// ❌ 避免
try {
  await fetchData();
} catch (error) {
  console.error(error);
}
```

### 4. 提交规范

使用 Git Commit 规范，格式为：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型 (type):

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 其他更改

示例：

```bash
git commit -m "feat(user): add user permission management"
git commit -m "fix(order): fix order status update issue"
git commit -m "docs(api): update API documentation"
```

---

## API 接口规范

### 请求/响应格式

#### 请求格式

```typescript
interface ApiRequest<T = any> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  data?: T;
  params?: Record<string, any>;
  timeout?: number;
}
```

#### 响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;          // 0 表示成功，非 0 表示失败
  success: boolean;      // true 表示成功
  message: string;       // 响应消息
  data?: T;              // 响应数据
  errors?: ErrorDetail[]; // 详细错误信息
  timestamp: string;     // 响应时间戳
}

interface ErrorDetail {
  field: string;
  message: string;
}
```

### 常见接口模式

#### 列表接口 (GET)

```typescript
// 请求
interface ListRequest {
  page: number;      // 页码（从 1 开始）
  pageSize: number;  // 每页数量
  sort?: string;     // 排序字段
  order?: 'asc' | 'desc';
  search?: string;   // 搜索关键词
  filters?: Record<string, any>; // 筛选条件
}

// 响应
interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 使用示例
GET /api/admin/users?page=1&pageSize=10&search=admin&status=active
```

#### 详情接口 (GET)

```typescript
// 请求
GET /api/admin/users/:id

// 响应
{
  "code": 0,
  "success": true,
  "data": {
    "id": "123",
    "name": "Admin User",
    ...
  }
}
```

#### 创建/更新接口 (POST/PUT)

```typescript
// 请求
interface CreateRequest<T> {
  // ... 字段值
}

// 响应
{
  "code": 0,
  "success": true,
  "message": "操作成功",
  "data": {
    "id": "新创建的ID",
    ...
  }
}

// 使用示例
POST /api/admin/users
{
  "name": "New User",
  "email": "user@example.com",
  "role": "staff"
}
```

#### 删除接口 (DELETE)

```typescript
// 请求
DELETE /api/admin/users/:id

// 响应
{
  "code": 0,
  "success": true,
  "message": "删除成功"
}
```

#### 批量操作 (POST)

```typescript
// 请求
POST /api/admin/users/batch-action
{
  "ids": ["id1", "id2", "id3"],
  "action": "delete" | "activate" | "deactivate"
}

// 响应
{
  "code": 0,
  "success": true,
  "message": "批量操作完成",
  "data": {
    "succeeded": 3,
    "failed": 0,
    "errors": []
  }
}
```

### 错误处理

#### 错误代码

| 代码 | 说明 | 处理方式 |
|------|------|--------|
| 0 | 成功 | 无需处理 |
| 400 | 请求参数错误 | 显示错误信息，提示用户检查输入 |
| 401 | 未授权 | 跳转到登录页 |
| 403 | 禁止访问 | 显示权限不足提示 |
| 404 | 资源不存在 | 显示资源不存在提示 |
| 500 | 服务器错误 | 显示通用错误信息 |
| 1001 | 业务逻辑错误 | 显示返回的错误信息 |

#### 错误响应示例

```typescript
// 验证错误
{
  "code": 400,
  "success": false,
  "message": "请求参数验证失败",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" },
    { "field": "phone", "message": "电话号码不能为空" }
  ]
}

// 业务错误
{
  "code": 1001,
  "success": false,
  "message": "用户邮箱已存在"
}

// 权限错误
{
  "code": 403,
  "success": false,
  "message": "您没有权限执行此操作"
}
```

---

## 部署指南

### 开发环境部署

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
# http://localhost:5173
```

### 测试环境部署

```bash
# 1. 构建测试版本
npm run build:staging

# 2. 上传 dist 文件夹到测试服务器

# 3. 配置 Nginx (示例)
server {
  listen 80;
  server_name admin-staging.linglong.com;
  
  root /var/www/admin-staging;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3000/api;
  }
}

# 4. 重启 Nginx
sudo systemctl restart nginx
```

### 生产环境部署

#### 构建优化

```bash
# 1. 构建生产版本
npm run build

# 2. 检查构建输出
npm run analyze

# 3. 性能优化
# - 代码分割
# - 按需加载
# - 缓存优化
# - CDN 部署
```

#### 服务器配置 (Nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name admin.linglong.com;
  
  # SSL 证书
  ssl_certificate /etc/ssl/certs/linglong.com.crt;
  ssl_certificate_key /etc/ssl/private/linglong.com.key;
  
  # 性能优化
  gzip on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/javascript application/json;
  
  root /var/www/admin-frontend;
  
  # 缓存策略
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
  
  # HTML 不缓存
  location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
  
  # 路由处理
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # API 代理
  location /api {
    proxy_pass http://localhost:3000/api;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}

# HTTP 重定向到 HTTPS
server {
  listen 80;
  server_name admin.linglong.com;
  return 301 https://$server_name$request_uri;
}
```

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 生产镜像
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 构建镜像
docker build -t linglong-admin:latest .

# 运行容器
docker run -p 80:80 -e API_BASE_URL=http://api:3000 linglong-admin:latest
```

#### CI/CD 流程 (GitHub Actions 示例)

```yaml
name: Deploy Admin Frontend

on:
  push:
    branches: [main, staging]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        run: |
          scp -r dist/* user@staging-server:/var/www/admin-frontend
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          scp -r dist/* user@prod-server:/var/www/admin-frontend
```

---

## 常见问题 (FAQ)

### Q1: 如何更改 API 基础 URL？

**A**: 修改 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://your-api-server.com/api
```

或在 `src/api/request.ts` 中配置。

### Q2: 如何实现权限控制？

**A**: 使用路由守卫和权限中间件：

```typescript
// router/guards.ts
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next('/403');
  } else {
    next();
  }
});
```

### Q3: 如何处理图片上传？

**A**: 使用 Element Plus 的 Upload 组件或自定义实现：

```typescript
// 请参考: src/components/ImageUpload.vue
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data.url;
};
```

### Q4: 如何优化性能？

**A**: 

- 使用代码分割 (Code Splitting)
- 启用图片懒加载
- 使用虚拟滚动处理大列表
- 缓存 API 响应
- 使用 CDN 加载静态资源

### Q5: 如何调试生产环境问题？

**A**: 

- 启用源地图 (Source Map)
- 使用浏览器开发工具
- 查看服务器日志
- 使用错误追踪服务 (Sentry)

---

## 相关资源

### 文档链接

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 组件库](https://element-plus.org/)
- [Pinia 状态管理](https://pinia.vuejs.org/)

### 工具和扩展

- **VS Code 扩展**: Vetur, Vue - Official, TypeScript Vue Plugin
- **浏览器扩展**: Vue DevTools, Redux DevTools

### 联系方式

- **技术支持**: tech-support@linglong.com
- **Bug 报告**: issues@linglong.com
- **功能建议**: features@linglong.com

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-27  
**维护者**: 玲珑酒馆技术团队
