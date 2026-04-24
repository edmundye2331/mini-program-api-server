/**
 * 文件上传中间件
 * 使用Multer处理文件上传
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置Multer存储选项
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，保留原始文件扩展名
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `product-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// 文件类型验证
const fileFilter = (req, file, cb) => {
  // 允许的图片文件类型
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('只支持JPEG、PNG、GIF、WebP格式的图片文件'), false);
};

// 文件大小限制（10MB）
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};

// 创建Multer实例
const upload = multer({
  storage,
  fileFilter,
  limits,
});

// 单个文件上传中间件
const singleImageUpload = upload.single('image');

// 错误处理中间件
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.error('文件大小不能超过10MB', 400);
    }
    return res.error(`上传错误: ${err.message}`, 400);
  }
  if (err) {
    return res.error(err.message, 400);
  }
  next();
};

module.exports = {
  singleImageUpload,
  uploadErrorHandler,
};
