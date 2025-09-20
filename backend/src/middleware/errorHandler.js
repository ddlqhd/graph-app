// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);

  // 设置默认错误信息
  let error = { ...err };
  error.message = err.message;

  // Neo4j 连接错误
  if (err.code === 'SERVICE_UNAVAILABLE') {
    error.message = '数据库连接失败，请检查 Neo4j 服务状态';
    return res.status(503).json({
      success: false,
      message: error.message,
      data: null
    });
  }

  // Neo4j 认证错误
  if (err.code === 'N/A' && err.message.includes('authentication')) {
    error.message = '数据库认证失败，请检查用户名和密码';
    return res.status(401).json({
      success: false,
      message: error.message,
      data: null
    });
  }

  // 语法错误
  if (err.code && err.code.startsWith('Neo.ClientError.Statement')) {
    error.message = '查询语句错误';
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null
    });
  }

  // 默认服务器错误
  res.status(500).json({
    success: false,
    message: error.message || '服务器内部错误',
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 处理中间件
const notFound = (req, res, next) => {
  const error = new Error(`接口不存在 - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      console.error(`❌ ${logMessage}`);
    } else {
      console.log(`✅ ${logMessage}`);
    }
  });

  next();
};

module.exports = {
  errorHandler,
  notFound,
  requestLogger
};