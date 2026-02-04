/**
 * 农业机器人后端服务 - 主入口文件
 * 
 * 项目名称: 农业机器人远程控制系统
 * 描述: 提供RESTful API接口，用于控制农业机器人并获取其状态数据
 * 
 * 启动方式:
 *   cd backend
 *   npm install      // 安装依赖包
 *   npm start        // 启动服务器
 * 
 * 端口配置:
 *   默认端口: 3000
 *   可通过环境变量 PORT 修改
 * 
 * 作者: 开发团队
 * 版本: 1.0.0
 */

// 引入Express框架 - 用于构建Web服务器
const express = require('express');

// 引入CORS中间件 - 用于处理跨域请求
const cors = require('cors');

// 引入路由模块 - 定义API端点
const robotRoutes = require('./routes/robot');

// 创建Express应用实例
const app = express();

// 定义服务器端口号 - 优先使用环境变量，默认为3000
const PORT = process.env.PORT || 3000;

// ============================================================
// 中间件配置区
// ============================================================

// 启用CORS跨域支持 - 允许前端从不同域名访问API
app.use(cors());

// 解析JSON格式的请求体 - 用于处理POST/PUT请求的JSON数据
app.use(express.json());

// 解析URL编码的请求体 - 用于处理表单数据
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件 - 记录所有HTTP请求的详细信息
app.use((req, res, next) => {
    // 记录请求开始时间
    const start = Date.now();
    // 获取请求方法和路径
    const { method, path } = req;
    
    // 监听响应完成事件 - 计算请求处理时间
    res.on('finish', () => {
        const duration = Date.now() - start;
        // 输出格式化日志: [时间戳] 请求方法 路径 - 状态码 (耗时)
        console.log(`[${new Date().toISOString()}] ${method} ${path} - ${res.statusCode} (${duration}ms)`);
    });
    
    // 继续处理下一个中间件
    next();
});

// ============================================================
// 路由配置区
// ============================================================

// 挂载API路由 - 所有/api开头的请求由robotRoutes处理
app.use('/api', robotRoutes);

// 健康检查接口 - 用于检测服务器是否正常运行
// 请求方式: GET
// 路径: /api/health
// 返回: JSON格式的健康状态信息
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running', 
        timestamp: Date.now() 
    });
});

// 404错误处理 - 处理所有未定义的路由
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not Found' });
});

// 全局错误处理中间件 - 捕获所有未处理的异常
app.use((err, req, res, next) => {
    // 在服务器控制台输出错误信息
    console.error('[Server] Error:', err);
    
    // 根据环境变量决定返回详细错误信息或通用错误信息
    // 生产环境返回通用错误，开发环境返回详细错误
    res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
    });
});

// ============================================================
// 服务器启动
// ============================================================

// 启动HTTP服务器并监听指定端口
app.listen(PORT, () => {
    // 打印分隔线 - 美化控制台输出
    console.log('='.repeat(50));
    console.log('🤖 农业机器人后端服务');
    console.log('='.repeat(50));
    // 打印服务地址
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    // 打印API文档链接
    console.log(`🔗 API文档: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
    console.log('');
    // 打印所有可用的API端点列表
    console.log('可用API端点:');
    console.log('');
    console.log('  【基础接口】');
    console.log('  GET    /api/health           - 健康检查');
    console.log('');
    console.log('  【机器人状态】');
    console.log('  GET    /api/robot/status     - 获取机器人状态');
    console.log('  POST   /api/robot/status     - 更新机器人状态 ⭐');
    console.log('  POST   /api/robot/control    - 发送控制指令');
    console.log('');
    console.log('  【传感器数据】');
    console.log('  GET    /api/sensors          - 获取传感器数据');
    console.log('  POST   /api/sensors          - 更新传感器数据 ⭐');
    console.log('');
    console.log('  【任务管理】');
    console.log('  GET    /api/tasks            - 获取任务列表');
    console.log('  POST   /api/tasks            - 创建新任务 ⭐');
    console.log('  PUT    /api/tasks/:id        - 更新任务 ⭐');
    console.log('  DELETE /api/tasks/:id        - 删除任务 ⭐');
    console.log('');
    console.log('  【作业统计】');
    console.log('  GET    /api/statistics       - 获取作业统计');
    console.log('  POST   /api/statistics       - 更新统计数据 ⭐');
    console.log('');
    console.log('📋 当前模式: 模拟数据（无需硬件）');
    console.log('⭐ 标记的接口支持通过Postman发送数据');
    console.log('📖 详细使用说明: 查看 POSTMAN_GUIDE.md');
    console.log('');
});

// 导出应用实例 - 用于测试和模块化使用
module.exports = app;
