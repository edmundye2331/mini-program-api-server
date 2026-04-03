/**
 * 内存数据库
 * 用于存储用户、订单、积分等数据
 * 实际生产环境应使用MongoDB、MySQL等数据库
 */

const { v4: uuidv4 } = require('uuid');

// 初始化数据
const database = {
  // 用户数据
  users: new Map(),

  // 会员数据
  members: new Map(),

  // 订单数据
  orders: new Map(),

  // 积分商品数据
  pointsGoods: [
    {
      id: 1,
      name: '玲珑币',
      description: '使用玲珑币可到桌子参与竞技运动游戏',
      points: 100,
      stock: 98981,
      image: '/images/icecream.png'
    },
    {
      id: 2,
      name: '玲珑币',
      description: '使用玲珑币可到桌子参与竞技运动游戏',
      points: 500,
      stock: 99999,
      image: '/images/icecream.png'
    },
    {
      id: 3,
      name: '玲珑币',
      description: '使用玲珑币可到桌子参与竞技运动游戏',
      points: 1000,
      stock: 99999,
      image: '/images/icecream.png'
    },
    {
      id: 4,
      name: '玲珑币',
      description: '使用玲珑币可到桌子参与竞技运动游戏',
      points: 3000,
      stock: 99999,
      image: '/images/icecream.png'
    }
  ],

  // 优惠券数据
  coupons: [],

  // 门店数据
  stores: [
    {
      id: 1,
      name: '玲珑酒馆（中心店）',
      address: '北京市朝阳区三里屯路19号',
      phone: '010-12345678',
      businessHours: '10:00-02:00',
      latitude: 39.936,
      longitude: 116.447,
      features: ['堂食', '外带', '包间', '停车场']
    },
    {
      id: 2,
      name: '玲珑酒馆（分店1）',
      address: '北京市海淀区中关村大街1号',
      phone: '010-87654321',
      businessHours: '11:00-01:00',
      latitude: 39.982,
      longitude: 116.318,
      features: ['堂食', '外带']
    }
  ],

  // 协议数据
  protocols: {
    recharge: '储值协议内容...',
    privacy: '隐私政策内容...',
    service: '服务条款内容...'
  },

  // 积分记录
  pointsRecords: [],

  // 兑换记录
  exchangeRecords: [],

  // 充值记录
  rechargeRecords: [],

  // 余额记录
  balanceRecords: [],

  // 商品分类
  goodsCategories: [
    {
      id: 1,
      name: '精酿啤酒',
      icon: '/images/category-beer.png',
      sort: 1
    },
    {
      id: 2,
      name: '特色小食',
      icon: '/images/category-snack.png',
      sort: 2
    },
    {
      id: 3,
      name: '套餐组合',
      icon: '/images/category-combo.png',
      sort: 3
    },
    {
      id: 4,
      name: '饮品',
      icon: '/images/category-drink.png',
      sort: 4
    }
  ],

  // 商品数据
  goods: [
    // 精酿啤酒
    {
      id: 1,
      categoryId: 1,
      name: 'IPA精酿',
      description: '美式IPA，酒体饱满，苦味适中',
      price: 48,
      originalPrice: 58,
      image: '/images/beer-ipa.png',
      stock: 100,
      sales: 256,
      sort: 1,
      status: 'onsale'
    },
    {
      id: 2,
      categoryId: 1,
      name: '世涛啤酒',
      description: '黑啤，口感醇厚，带有咖啡和巧克力味',
      price: 52,
      originalPrice: 62,
      image: '/images/beer-stout.png',
      stock: 80,
      sales: 189,
      sort: 2,
      status: 'onsale'
    },
    {
      id: 3,
      categoryId: 1,
      name: '小麦啤酒',
      description: '德式小麦，口感清爽，带有香蕉和丁香味',
      price: 45,
      originalPrice: 55,
      image: '/images/beer-wheat.png',
      stock: 120,
      sales: 342,
      sort: 3,
      status: 'onsale'
    },
    {
      id: 4,
      categoryId: 1,
      name: '青岛啤酒',
      description: '经典拉格，口感清爽',
      price: 28,
      originalPrice: 35,
      image: '/images/beer-tsingtao.png',
      stock: 200,
      sales: 567,
      sort: 4,
      status: 'onsale'
    },

    // 特色小食
    {
      id: 5,
      categoryId: 2,
      name: '炸薯条',
      description: '金黄酥脆，外酥里嫩',
      price: 22,
      originalPrice: 28,
      image: '/images/snack-fries.png',
      stock: 150,
      sales: 423,
      sort: 1,
      status: 'onsale'
    },
    {
      id: 6,
      categoryId: 2,
      name: '鸡翅膀',
      description: '蜜汁烤翅，香甜可口',
      price: 38,
      originalPrice: 48,
      image: '/images/snack-wings.png',
      stock: 80,
      sales: 267,
      sort: 2,
      status: 'onsale'
    },
    {
      id: 7,
      categoryId: 2,
      name: '花生米',
      description: '酒鬼花生，香辣开胃',
      price: 18,
      originalPrice: 22,
      image: '/images/snack-peanuts.png',
      stock: 200,
      sales: 689,
      sort: 3,
      status: 'onsale'
    },

    // 套餐组合
    {
      id: 8,
      categoryId: 3,
      name: '精酿三打套餐',
      description: '3款精酿啤酒+小吃组合',
      price: 128,
      originalPrice: 168,
      image: '/images/combo-three.png',
      stock: 50,
      sales: 134,
      sort: 1,
      status: 'onsale'
    },
    {
      id: 9,
      categoryId: 3,
      name: '竞标赛双人套餐',
      description: '4款啤酒+3份小吃+1小时游戏',
      price: 228,
      originalPrice: 298,
      image: '/images/combo-double.png',
      stock: 30,
      sales: 89,
      sort: 2,
      status: 'onsale'
    },

    // 饮品
    {
      id: 10,
      categoryId: 4,
      name: '可乐',
      description: '冰爽可乐',
      price: 12,
      originalPrice: 15,
      image: '/images/drink-cola.png',
      stock: 300,
      sales: 823,
      sort: 1,
      status: 'onsale'
    },
    {
      id: 11,
      categoryId: 4,
      name: '橙汁',
      description: '鲜榨橙汁',
      price: 18,
      originalPrice: 22,
      image: '/images/drink-orange.png',
      stock: 150,
      sales: 456,
      sort: 2,
      status: 'onsale'
    }
  ],

  // 购物车数据
  carts: new Map(),

  // 生日礼记录
  birthdayGifts: new Map(),

  // 安全设置（登录记录）
  loginLogs: [],

  // 密码修改记录
  passwordHistory: []
};

// 辅助函数：生成ID
const generateId = () => uuidv4();

// 辅助函数：格式化日期
const formatDate = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

module.exports = {
  database,
  generateId,
  formatDate
};
