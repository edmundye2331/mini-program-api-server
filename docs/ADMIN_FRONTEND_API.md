# 玲珑酒馆后台管理系统 - API 集成指南

## 📋 API 基础配置

### 环境变量配置

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOG=true

# .env.staging
VITE_API_BASE_URL=https://staging-api.linglong.com/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOG=true

# .env.production
VITE_API_BASE_URL=https://api.linglong.com/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
VITE_ENABLE_LOG=false
```

### Axios 实例配置

```typescript
// src/api/request.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';

class ApiClient {
  private instance: AxiosInstance;
  private timeout: number;

  constructor() {
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
      },
    });

    // 请求拦截器
    this.setupRequestInterceptor();
    // 响应拦截器
    this.setupResponseInterceptor();
  }

  // 请求拦截器
  private setupRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加时间戳防止缓存
        config.params = {
          ...config.params,
          _t: Date.now(),
        };

        if (import.meta.env.VITE_ENABLE_LOG) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // 响应拦截器
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response) => {
        const data = response.data as ApiResponse;

        if (import.meta.env.VITE_ENABLE_LOG) {
          console.log(`[API Response] ${response.status}`, data);
        }

        // 处理成功响应
        if (data.code === 0 || data.success) {
          return data;
        }

        // 处理业务错误
        this.handleBusinessError(data);
        return Promise.reject(new Error(data.message || '请求失败'));
      },
      (error: AxiosError) => {
        console.error('Response Error:', error);
        this.handleNetworkError(error);
        return Promise.reject(error);
      }
    );
  }

  // 处理业务错误
  private handleBusinessError(data: ApiResponse): void {
    const { code, message } = data;

    if (code === 401) {
      // 未授权，清空本地数据并跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (code === 403) {
      // 权限不足
      console.warn('权限不足:', message);
    } else if (code === 404) {
      // 资源不存在
      console.warn('资源不存在:', message);
    }
  }

  // 处理网络错误
  private handleNetworkError(error: AxiosError): void {
    const { response, message } = error;

    if (!response) {
      console.error('网络连接失败');
      return;
    }

    const status = response.status;
    let errorMessage = '请求失败';

    switch (status) {
      case 400:
        errorMessage = '请求参数错误';
        break;
      case 401:
        errorMessage = '登录已过期，请重新登录';
        break;
      case 403:
        errorMessage = '您没有权限执行此操作';
        break;
      case 404:
        errorMessage = '请求的资源不存在';
        break;
      case 500:
        errorMessage = '服务器错误';
        break;
      case 502:
        errorMessage = '网关错误';
        break;
      case 503:
        errorMessage = '服务不可用';
        break;
      default:
        errorMessage = message;
    }

    console.error(`[${status}] ${errorMessage}`);
  }

  // GET 请求
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get(url, config);
  }

  // POST 请求
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, config);
  }

  // PUT 请求
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, config);
  }

  // PATCH 请求
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  // DELETE 请求
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete(url, config);
  }

  // 获取原始实例
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default new ApiClient();
```

---

## 🔐 认证 API

### 登录

```typescript
// src/api/modules/auth.ts

import api from '@/api/request';
import type { LoginRequest, LoginResponse, User } from '@/types/user';

/**
 * 用户登录
 * @param credentials 登录凭证
 */
export async function login(credentials: LoginRequest) {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  
  // 保存 Token
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('expiresIn', response.data.expiresIn?.toString());
  }
  
  return response;
}

/**
 * 用户登出
 */
export async function logout() {
  const response = await api.post('/auth/logout', {});
  
  // 清空本地数据
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return response;
}

/**
 * 刷新 Token
 */
export async function refreshToken() {
  const token = localStorage.getItem('refreshToken');
  
  const response = await api.post<LoginResponse>('/auth/refresh', {
    refreshToken: token,
  });
  
  // 更新 Token
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('expiresIn', response.data.expiresIn?.toString());
  }
  
  return response;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const response = await api.get<User>('/auth/me');
  
  // 保存用户信息
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response;
}

/**
 * 修改密码
 */
export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  return api.post('/auth/change-password', data);
}

/**
 * 忘记密码 - 请求重置链接
 */
export async function forgotPassword(email: string) {
  return api.post('/auth/forgot-password', { email });
}

/**
 * 忘记密码 - 重置密码
 */
export async function resetPassword(data: { token: string; newPassword: string }) {
  return api.post('/auth/reset-password', data);
}
```

### 登录类型定义

```typescript
// src/types/user.ts

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'blocked';
```

---

## 👥 用户管理 API

### 用户列表

```typescript
// GET /api/admin/users

interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sort?: 'createdAt' | 'updatedAt' | 'username';
  order?: 'asc' | 'desc';
}

interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

// 使用示例
const response = await api.get<UserListResponse>('/admin/users', {
  params: {
    page: 1,
    pageSize: 10,
    role: 'staff',
    status: 'active',
  },
});
```

### 获取用户详情

```typescript
// GET /api/admin/users/:id

const response = await api.get<User>('/admin/users/123');
```

### 创建用户

```typescript
// POST /api/admin/users

interface CreateUserRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

const response = await api.post<User>('/admin/users', {
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123',
  role: 'staff',
  status: 'active',
});
```

### 更新用户

```typescript
// PUT /api/admin/users/:id

interface UpdateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

const response = await api.put<User>('/admin/users/123', {
  username: 'updated-name',
  role: 'manager',
});
```

### 删除用户

```typescript
// DELETE /api/admin/users/:id

const response = await api.delete('/admin/users/123');
```

### 批量删除用户

```typescript
// DELETE /api/admin/users/batch

interface BatchDeleteRequest {
  ids: string[];
}

const response = await api.delete('/admin/users/batch', {
  data: { ids: ['id1', 'id2', 'id3'] },
});
```

---

## 🛍️ 商品管理 API

### 获取商品列表

```typescript
// GET /api/admin/goods

interface GoodsListParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string;
  status?: 'available' | 'unavailable' | 'archived';
  sort?: 'createdAt' | 'price' | 'sales';
  order?: 'asc' | 'desc';
}

interface GoodsListResponse {
  items: Goods[];
  total: number;
  page: number;
  pageSize: number;
}

const response = await api.get<GoodsListResponse>('/admin/goods', {
  params: {
    page: 1,
    pageSize: 10,
    categoryId: 'cat-001',
    status: 'available',
  },
});
```

### Goods 类型定义

```typescript
// src/types/goods.ts

export interface Goods {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice: number;
  discount?: number;
  stock: number;
  images: string[];
  thumbnail: string;
  tags: string[];
  status: GoodsStatus;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsCategory {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  description?: string;
  sort: number;
  status: 'active' | 'inactive';
}

export type GoodsStatus = 'available' | 'unavailable' | 'archived';
```

### 获取商品分类

```typescript
// GET /api/admin/goods/categories

interface GoodsCategoryResponse {
  items: GoodsCategory[];
}

const response = await api.get<GoodsCategoryResponse>('/admin/goods/categories');
```

### 创建商品

```typescript
// POST /api/admin/goods

interface CreateGoodsRequest {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  tags?: string[];
  status: GoodsStatus;
}

const response = await api.post<Goods>('/admin/goods', {
  name: '商品名称',
  categoryId: 'cat-001',
  description: '商品描述',
  price: 99.99,
  stock: 100,
  images: ['image1.jpg', 'image2.jpg'],
  status: 'available',
});
```

### 更新商品

```typescript
// PUT /api/admin/goods/:id

interface UpdateGoodsRequest {
  name?: string;
  categoryId?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  status?: GoodsStatus;
}

const response = await api.put<Goods>('/admin/goods/goods-123', {
  price: 89.99,
  stock: 50,
});
```

---

## 📦 订单管理 API

### 获取订单列表

```typescript
// GET /api/admin/orders

interface OrderListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateRange?: [string, string]; // ISO 8601 格式
  sort?: 'createdAt' | 'totalPrice';
  order?: 'asc' | 'desc';
}

interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

const response = await api.get<OrderListResponse>('/admin/orders', {
  params: {
    page: 1,
    pageSize: 10,
    status: 'confirmed',
    dateRange: ['2026-01-01', '2026-04-27'],
  },
});
```

### Order 类型定义

```typescript
// src/types/order.ts

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingInfo?: ShippingInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  goodsId: string;
  goodsName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ShippingInfo {
  carrier: string;
  trackingNo: string;
  shippedAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type ShippingStatus = 'unshipped' | 'shipped' | 'delivered';
```

### 更新订单状态

```typescript
// PUT /api/admin/orders/:id/status

interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

const response = await api.put('/admin/orders/order-123/status', {
  status: 'confirmed',
});
```

### 发货

```typescript
// POST /api/admin/orders/:id/ship

interface ShipOrderRequest {
  carrier: string;
  trackingNo: string;
  estimatedDelivery?: string;
}

const response = await api.post('/admin/orders/order-123/ship', {
  carrier: 'SF',
  trackingNo: '123456789',
});
```

### 退款

```typescript
// POST /api/admin/orders/:id/refund

interface RefundOrderRequest {
  reason: string;
  amount?: number; // 如果不指定，则退全额
}

const response = await api.post('/admin/orders/order-123/refund', {
  reason: '顾客要求退款',
  amount: 50.00,
});
```

---

## ⭐ 积分管理 API

### 获取积分记录

```typescript
// GET /api/admin/points/records

interface PointsRecordsParams {
  page: number;
  pageSize: number;
  userId?: string;
  type?: PointsType;
  dateRange?: [string, string];
}

interface PointsRecordsResponse {
  items: PointsRecord[];
  total: number;
}

const response = await api.get<PointsRecordsResponse>('/admin/points/records', {
  params: {
    page: 1,
    pageSize: 10,
    type: 'earn',
  },
});
```

### PointsRecord 类型定义

```typescript
// src/types/points.ts

export interface PointsRecord {
  id: string;
  userId: string;
  points: number;
  type: PointsType;
  source: string;
  description: string;
  balance: number;
  createdAt: string;
}

export interface ExchangeRecord {
  id: string;
  userId: string;
  goodsId: string;
  goodsName: string;
  pointsCost: number;
  status: ExchangeStatus;
  createdAt: string;
  completedAt?: string;
}

export type PointsType = 'earn' | 'spend' | 'adjust' | 'reward' | 'refund';
export type ExchangeStatus = 'pending' | 'completed' | 'cancelled';
```

### 调整用户积分

```typescript
// POST /api/admin/points/adjust

interface AdjustPointsRequest {
  userId: string;
  points: number;
  reason: string;
}

const response = await api.post('/admin/points/adjust', {
  userId: 'user-123',
  points: 100,
  reason: '月度奖励',
});
```

### 获取兑换记录

```typescript
// GET /api/admin/points/exchanges

interface ExchangeRecordsParams {
  page: number;
  pageSize: number;
  status?: ExchangeStatus;
}

const response = await api.get<ExchangeRecordsResponse>('/admin/points/exchanges', {
  params: {
    page: 1,
    pageSize: 10,
    status: 'completed',
  },
});
```

---

## 📊 数据统计 API

### 获取概览数据

```typescript
// GET /api/admin/statistics/overview

interface OverviewData {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  salesTrend: { date: string; sales: number }[];
  orderTrend: { date: string; count: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  orderStatusDistribution: { status: string; count: number }[];
}

const response = await api.get<OverviewData>('/admin/statistics/overview');
```

### 销售统计

```typescript
// GET /api/admin/statistics/sales

interface SalesParams {
  dateRange: [string, string];
  groupBy?: 'day' | 'week' | 'month';
}

interface SalesStatistics {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  data: { date: string; sales: number; revenue: number }[];
}

const response = await api.get<SalesStatistics>('/admin/statistics/sales', {
  params: {
    dateRange: ['2026-04-01', '2026-04-27'],
    groupBy: 'day',
  },
});
```

### 用户统计

```typescript
// GET /api/admin/statistics/users

interface UserStatistics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: { date: string; count: number }[];
  userLevelDistribution: { level: string; count: number }[];
}

const response = await api.get<UserStatistics>('/admin/statistics/users');
```

---

## 📁 文件上传 API

### 上传图片

```typescript
// POST /api/upload/image

interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImageUploadResponse>(
    '/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.url;
};
```

### 上传文件

```typescript
// POST /api/upload/file

interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<FileUploadResponse>(
    '/upload/file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.url;
};
```

### 批量上传

```typescript
// POST /api/upload/batch

interface BatchUploadResponse {
  files: FileUploadResponse[];
  failedCount: number;
}

const uploadBatch = async (files: File[]): Promise<BatchUploadResponse> => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  const response = await api.post<BatchUploadResponse>(
    '/upload/batch',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
```

---

## 🔄 导出/导入 API

### 导出订单

```typescript
// GET /api/admin/orders/export

const exportOrders = async (params: {
  dateRange: [string, string];
  status?: OrderStatus;
}): Promise<Blob> => {
  const response = await api.get('/admin/orders/export', {
    params,
    responseType: 'blob',
  });

  // 触发下载
  const url = window.URL.createObjectURL(response);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-${Date.now()}.xlsx`;
  link.click();

  return response;
};
```

### 导出用户

```typescript
// GET /api/admin/users/export

const exportUsers = async (): Promise<Blob> => {
  const response = await api.get('/admin/users/export', {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(response);
  const link = document.createElement('a');
  link.href = url;
  link.download = `users-${Date.now()}.xlsx`;
  link.click();

  return response;
};
```

### 导入商品

```typescript
// POST /api/admin/goods/import

interface ImportGoodsResponse {
  successCount: number;
  failedCount: number;
  errors: { row: number; message: string }[];
}

const importGoods = async (file: File): Promise<ImportGoodsResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ImportGoodsResponse>(
    '/admin/goods/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};
```

---

## 🛡️ 错误处理最佳实践

```typescript
// src/utils/api-error.ts

export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 使用示例
try {
  const response = await api.get<User>('/admin/users/123');
  console.log('用户:', response.data);
} catch (error) {
  if (error instanceof ApiError) {
    // 处理 API 错误
    if (error.code === 404) {
      console.log('用户不存在');
    } else if (error.code === 403) {
      console.log('没有权限');
    } else {
      console.log('错误:', error.message);
    }
  } else {
    // 处理其他错误
    console.error('未知错误:', error);
  }
}
```

---

## 📝 API 文档维护

所有 API 端点已在后端项目中使用 Swagger/OpenAPI 文档化：

```
访问地址: http://localhost:3000/api-docs
```

### 快速参考

- [后端 API 文档](../README.md#api-endpoints)
- [Swagger UI](http://localhost:3000/swagger-ui)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-27  
**维护者**: 玲珑酒馆技术团队
