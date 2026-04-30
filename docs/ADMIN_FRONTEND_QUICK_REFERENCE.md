# 玲珑酒馆后台管理系统 - 前端快速参考

## ⚡ 快速命令

```bash
# 初始化项目（第一次）
npm create vite@latest admin-frontend -- --template vue-ts
cd admin-frontend
npm install

# 核心依赖
npm install vue-router@next pinia axios element-plus echarts dayjs

# 启动开发
npm run dev

# 代码检查和格式化
npm run lint:fix
npm run format

# 构建
npm run build
npm run build:staging
```

---

## 📁 必须创建的目录

```
mkdir -p src/{api/modules,components/{common,form,table,chart,upload}}
mkdir -p src/{config,layouts,middleware,pages,router,stores/modules,styles,types,utils}
mkdir -p public
```

---

## 🎯 技术栈一览表

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | ^3.3+ | UI 框架 |
| TypeScript | ^5.0+ | 类型检查 |
| Vite | ^4.0+ | 构建工具 |
| Vue Router | ^4.0+ | 路由管理 |
| Pinia | ^2.0+ | 状态管理 |
| Axios | ^1.4+ | HTTP 客户端 |
| Element Plus | ^2.4+ | UI 组件库 |
| ECharts | ^5.4+ | 数据可视化 |

---

## 📝 核心文件清单

```
✅ src/main.ts              - 应用入口
✅ src/App.vue              - 根组件
✅ src/router/index.ts      - 路由配置
✅ src/stores/index.ts      - Pinia Store
✅ src/api/request.ts       - Axios 实例
✅ vite.config.ts           - Vite 配置
✅ tsconfig.json            - TypeScript 配置
✅ .env                     - 环境变量
✅ package.json             - 项目配置
```

---

## 🔧 常用代码片段

### 在组件中获取 Store

```typescript
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const users = computed(() => userStore.users);
```

### API 调用

```typescript
import api from '@/api/request';

const response = await api.get<User>('/admin/users/123');
const data = response.data;
```

### 路由跳转

```typescript
import { useRouter } from 'vue-router';

const router = useRouter();
router.push('/dashboard');
router.push({ name: 'UserDetail', params: { id: '123' } });
```

### 消息提示

```typescript
import { ElMessage, ElNotification } from 'element-plus';

ElMessage.success('操作成功');
ElMessage.error('操作失败');
ElNotification.info({ title: '提示', message: '通知内容' });
```

---

## 🔐 权限检查

```typescript
// 在路由中定义权限
{
  path: '/admin/users',
  component: () => import('@/pages/user/UserList.vue'),
  meta: { 
    requiresAuth: true,
    permission: 'user:view',
    title: '用户管理'
  }
}
```

---

## 📊 数据表格示例

```vue
<template>
  <el-table :data="users" v-loading="loading">
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="username" label="用户名" />
    <el-table-column prop="email" label="邮箱" />
    <el-table-column label="操作" width="120">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button type="danger" size="small" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    :current-page="page"
    :page-size="pageSize"
    :total="total"
    @current-change="page = $event; loadData()"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const page = ref(1);
const pageSize = ref(10);

const users = computed(() => userStore.users);
const total = computed(() => userStore.total);
const loading = computed(() => userStore.loading);

const loadData = async () => {
  await userStore.fetchUsers({ page: page.value, pageSize: pageSize.value });
};

onMounted(() => loadData());
</script>
```

---

## 📋 表单示例

```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
    </el-form-item>
    
    <el-form-item label="角色" prop="role">
      <el-select v-model="form.role">
        <el-option label="管理员" value="admin" />
        <el-option label="经理" value="manager" />
        <el-option label="员工" value="staff" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormInstance } from 'element-plus';

const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  email: '',
  role: 'staff',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: 'blur' },
  ],
};

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      console.log('表单提交:', form);
      // 调用 API
    }
  });
};

const handleReset = () => {
  formRef.value?.resetFields();
};
</script>
```

---

## 📊 图表示例

```vue
<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref<HTMLElement>();

onMounted(() => {
  const chart = echarts.init(chartRef.value as HTMLElement);
  
  const option = {
    title: { text: '销售统计' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '销售额',
        data: [120, 200, 150, 80, 70],
        type: 'line',
        smooth: true,
      },
    ],
  };

  chart.setOption(option);

  // 响应式重新绘制
  window.addEventListener('resize', () => chart.resize());
});
</script>
```

---

## 🔄 API 响应处理

```typescript
// 成功响应
{
  "code": 0,
  "success": true,
  "message": "操作成功",
  "data": {
    "id": "123",
    "name": "Test User",
    ...
  }
}

// 错误响应
{
  "code": 400,
  "success": false,
  "message": "请求参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ]
}
```

---

## 🌐 环境变量设置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_LOG=true

# .env.production
VITE_API_BASE_URL=https://api.linglong.com/api
VITE_ENABLE_LOG=false
```

---

## 🗂️ 目录速查表

| 目录 | 说明 |
|------|------|
| `src/api/` | API 请求封装 |
| `src/components/` | 可复用组件 |
| `src/pages/` | 页面组件 |
| `src/stores/` | Pinia 状态管理 |
| `src/types/` | TypeScript 类型 |
| `src/utils/` | 工具函数 |
| `src/router/` | 路由配置 |
| `src/assets/` | 静态资源 |

---

## ✅ 代码规范速查

| 规范 | 示例 |
|------|------|
| 文件夹 | `user-management` (kebab-case) |
| 组件文件 | `UserList.vue` (PascalCase) |
| 函数/变量 | `getUserList()` (camelCase) |
| 常量 | `MAX_FILE_SIZE` (UPPER_SNAKE_CASE) |
| 类型/接口 | `User`, `UserStatus` (PascalCase) |

---

## 🐛 常见错误快速解决

| 错误 | 解决方案 |
|------|--------|
| `Cannot find module` | 检查导入路径，使用 `@/` 别名 |
| `Property does not exist` | 检查 TypeScript 类型定义 |
| `Token expired (401)` | 自动刷新 Token，见请求拦截器 |
| `Permission denied (403)` | 检查用户权限，更新路由元数据 |
| `API timeout` | 检查网络连接，增加超时时间 |

---

## 📞 快速获取帮助

- 📖 **完整指南**: [ADMIN_FRONTEND_GUIDE.md](./ADMIN_FRONTEND_GUIDE.md)
- 🏗️ **架构设计**: [ADMIN_FRONTEND_ARCHITECTURE.md](./ADMIN_FRONTEND_ARCHITECTURE.md)
- 🔌 **API 集成**: [ADMIN_FRONTEND_API.md](./ADMIN_FRONTEND_API.md)
- 🚀 **快速开始**: [ADMIN_FRONTEND_SETUP.md](./ADMIN_FRONTEND_SETUP.md)
- 📚 **文档索引**: [ADMIN_FRONTEND_INDEX.md](./ADMIN_FRONTEND_INDEX.md)

---

## 🎓 推荐学习顺序

1. **第一天**: 阅读快速参考 + 初始化项目
2. **第二天**: 学习项目初始化指南 + 创建基础组件
3. **第三周**: 深入学习架构设计 + 开发核心模块
4. **第四周**: API 集成 + 完成功能开发
5. **第五周**: 优化、测试、部署

---

**版本**: 1.0.0  
**最后更新**: 2026-04-27  
**维护者**: 玲珑酒馆技术团队
