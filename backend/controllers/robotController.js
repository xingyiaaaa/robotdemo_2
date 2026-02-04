/**
 * 机器人控制器模块
 * 
 * 功能描述:
 * - 处理所有与机器人相关的API请求
 * - 调用数据层获取机器人状态和传感器数据
 * - 处理控制指令并返回执行结果
 * 
 * 🔌 槽位说明:
 * 此控制器当前使用模拟数据(mockData)，对接真实硬件时需要:
 * 1. 修改mockData引用为真实硬件驱动模块
 * 2. 确保硬件驱动实现相同的函数接口
 * 
 * 文件路径: backend/controllers/robotController.js
 */

// 数据源选择：
// - mockData: 模拟数据（无需硬件，用于测试）
// - dataSource: 真实数据源（MQTT/串口等，需要硬件）
// 
// 切换方式: 注释掉不需要的行，取消注释需要的行
// const mockData = require('../data/mockData');  // 模拟数据
const dataSource = require('../data/dataSource');  // 真实硬件数据

// 统一使用 data 变量名，方便切换
const data = dataSource;  // 改为 mockData 可切回模拟数据

// ============================================================
// 响应处理工具函数
// ============================================================

/**
 * 发送成功响应
 * @param {Object} res - Express响应对象
 * @param {*} data - 要返回的数据
 * @param {Object} extra - 额外的响应字段
 * @description 统一的成功响应格式，包含success标志和时间戳
 */
const sendSuccess = (res, data, extra = {}) => {
    res.json({
        success: true,              // 操作成功标志
        data,                        // 响应数据
        timestamp: Date.now(),        // 服务器时间戳
        ...extra                     // 合并额外字段
    });
};

/**
 * 发送错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误信息
 * @param {number} statusCode - HTTP状态码，默认500
 * @description 统一的错误响应格式
 */
const sendError = (res, message, statusCode = 500) => {
    res.status(statusCode).json({
        success: false,              // 操作失败标志
        message                       // 错误信息
    });
};

/**
 * 异步错误处理器
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的处理函数
 * @description 捕获异步函数中的错误并传递给错误处理中间件
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ============================================================
// 机器人状态相关接口
// ============================================================

/**
 * 获取机器人状态
 * 请求方式: GET
 * 路径: /api/robot/status
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     battery: number,        // 电量百分比
 *     speed: number,          // 当前速度 m/s
 *     temperature: number,    // 温度 °C
 *     coordinates: {          // GPS坐标
 *       lat: number,
 *       lon: number
 *     }
 *   },
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，替换mockData.getRobotStatus()为真实硬件API调用
 */
exports.getStatus = asyncHandler(async (req, res) => {
    // 从数据层获取机器人状态
    const result = await data.getRobotStatus();
    // 返回成功响应
    sendSuccess(res, result);
});

/**
 * 更新机器人状态
 * 请求方式: POST/PUT
 * 路径: /api/robot/status
 * 
 * 请求体格式:
 * {
 *   battery?: number,         // 电量 (可选)
 *   speed?: number,           // 速度 (可选)
 *   temperature?: number,     // 温度 (可选)
 *   lat?: number,             // 纬度 (可选)
 *   lon?: number              // 经度 (可选)
 * }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     battery: number,
 *     speed: number,
 *     temperature: number,
 *     coordinates: { lat: number, lon: number }
 *   },
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将状态写入数据库
 */
exports.updateStatus = asyncHandler(async (req, res) => {
    const statusData = req.body;
    
    // 参数验证
    if (!statusData || Object.keys(statusData).length === 0) {
        return sendError(res, '请至少提供一个状态字段', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到机器人状态更新请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 请求数据:`, statusData);
    console.log('='.repeat(60));
    
    // 更新机器人状态
    const updatedData = data.updateRobotStatus ? data.updateRobotStatus(statusData) : statusData;
    
    // 🔔 控制器层日志
    console.log(`[Controller] 更新后的数据:`, updatedData);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    sendSuccess(res, updatedData, { message: '机器人状态更新成功' });
});

/**
 * 发送控制指令
 * 请求方式: POST
 * 路径: /api/robot/control
 * 
 * 请求体格式:
 * 方向控制: { command: 'forward' | 'backward' | 'left' | 'right' | 'stop' }
 * 作业控制: { action: 'irrigation' | 'fertilize' | 'scan' | 'harvest' }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   executed: true,           // 指令是否执行
 *   command/action: string,    // 执行的指令/操作
 *   message: string,          // 执行结果消息
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将指令发送到真实硬件控制接口
 */
exports.sendCommand = asyncHandler(async (req, res) => {
    // 从请求体中提取command和action参数
    const { command, action } = req.body;
    
    // 参数验证 - 必须提供command或action之一
    if (!command && !action) {
        return sendError(res, '缺少 command 或 action 参数', 400);
    }
    
    // 🔔 控制器层日志 - 记录收到的控制请求
    console.log('='.repeat(60));
    console.log(`[Controller] 收到控制请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 请求参数:`, { command, action });
    console.log('='.repeat(60));
    
    // 根据参数类型调用相应的处理函数
    // 如果有command参数，调用方向控制函数
    // 如果有action参数，调用作业控制函数
    const result = command 
        ? await data.handleCommand(command)
        : await data.handleAction(action);
    
    // 🔔 控制器层日志 - 记录执行结果
    console.log(`[Controller] 执行结果:`, result);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应，包含执行结果
    sendSuccess(res, null, result);
});

// ============================================================
// 传感器数据相关接口
// ============================================================

/**
 * 获取传感器数据
 * 请求方式: GET
 * 路径: /api/sensors
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     soilHumidity: number,    // 土壤湿度 %
 *     soilTemp: number,        // 土壤温度 °C
 *     light: number,           // 光照强度 Lux
 *     airHumidity: number      // 空气湿度 %
 *   },
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从真实传感器读取数据
 */
exports.getSensors = asyncHandler(async (req, res) => {
    // 从数据层获取传感器数据
    const result = await data.getSensorData();
    // 返回成功响应
    sendSuccess(res, result);
});

/**
 * 更新传感器数据
 * 请求方式: POST
 * 路径: /api/sensors
 * 
 * 请求体格式:
 * {
 *   soilHumidity?: number,    // 土壤湿度 (可选)
 *   soilTemp?: number,        // 土壤温度 (可选)
 *   light?: number,           // 光照强度 (可选)
 *   airHumidity?: number      // 空气湿度 (可选)
 * }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     soilHumidity: number,
 *     soilTemp: number,
 *     light: number,
 *     airHumidity: number
 *   },
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将数据写入数据库或发送到硬件
 */
exports.updateSensors = asyncHandler(async (req, res) => {
    const sensorData = req.body;
    
    // 参数验证 - 至少提供一个传感器数据字段
    if (!sensorData || Object.keys(sensorData).length === 0) {
        return sendError(res, '请至少提供一个传感器数据字段', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到传感器数据更新请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 请求数据:`, sensorData);
    console.log('='.repeat(60));
    
    // 更新传感器数据
    const updatedData = mockData.updateSensorData(sensorData);
    
    // 🔔 控制器层日志
    console.log(`[Controller] 更新后的数据:`, updatedData);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    sendSuccess(res, updatedData, { message: '传感器数据更新成功' });
});

// ============================================================
// 任务管理相关接口
// ============================================================

/**
 * 获取任务列表
 * 请求方式: GET
 * 路径: /api/tasks
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: number,             // 任务ID
 *       name: string,           // 任务名称
 *       status: 'active' | 'pending' | 'done',  // 任务状态
 *       progress: number        // 完成进度 %
 *     }
 *   ],
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库查询任务列表
 */
exports.getTasks = asyncHandler(async (req, res) => {
    // 从数据层获取任务列表
    const data = mockData.getTasks();
    // 返回成功响应
    sendSuccess(res, data);
});

/**
 * 创建新任务
 * 请求方式: POST
 * 路径: /api/tasks
 * 
 * 请求体格式:
 * {
 *   name: string,             // 任务名称 (必填)
 *   status?: string,          // 任务状态 (可选，默认pending)
 *   progress?: number         // 完成进度 (可选，默认0)
 * }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     id: number,
 *     name: string,
 *     status: string,
 *     progress: number
 *   },
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将任务保存到数据库
 */
exports.createTask = asyncHandler(async (req, res) => {
    const { name, status, progress } = req.body;
    
    // 参数验证 - name是必填字段
    if (!name) {
        return sendError(res, '缺少必填字段: name', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到创建任务请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 请求数据:`, { name, status, progress });
    console.log('='.repeat(60));
    
    // 创建任务
    const newTask = mockData.createTask({ name, status, progress });
    
    // 🔔 控制器层日志
    console.log(`[Controller] 创建的任务:`, newTask);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    sendSuccess(res, newTask, { message: '任务创建成功' });
});

/**
 * 更新任务
 * 请求方式: PUT
 * 路径: /api/tasks/:id
 * 
 * 请求体格式:
 * {
 *   name?: string,            // 任务名称 (可选)
 *   status?: string,          // 任务状态 (可选)
 *   progress?: number         // 完成进度 (可选)
 * }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     id: number,
 *     name: string,
 *     status: string,
 *     progress: number
 *   },
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，更新数据库中的任务
 */
exports.updateTask = asyncHandler(async (req, res) => {
    const taskId = parseInt(req.params.id);
    const updateData = req.body;
    
    // 参数验证
    if (isNaN(taskId)) {
        return sendError(res, '无效的任务ID', 400);
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
        return sendError(res, '请至少提供一个更新字段', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到更新任务请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 任务ID: ${taskId}`);
    console.log(`[Controller] 更新数据:`, updateData);
    console.log('='.repeat(60));
    
    // 更新任务
    const updatedTask = mockData.updateTask(taskId, updateData);
    
    if (!updatedTask) {
        return sendError(res, `任务 #${taskId} 不存在`, 404);
    }
    
    // 🔔 控制器层日志
    console.log(`[Controller] 更新后的任务:`, updatedTask);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    sendSuccess(res, updatedTask, { message: '任务更新成功' });
});

/**
 * 删除任务
 * 请求方式: DELETE
 * 路径: /api/tasks/:id
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库删除任务
 */
exports.deleteTask = asyncHandler(async (req, res) => {
    const taskId = parseInt(req.params.id);
    
    // 参数验证
    if (isNaN(taskId)) {
        return sendError(res, '无效的任务ID', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到删除任务请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 任务ID: ${taskId}`);
    console.log('='.repeat(60));
    
    // 删除任务
    const deleted = mockData.deleteTask(taskId);
    
    if (!deleted) {
        return sendError(res, `任务 #${taskId} 不存在`, 404);
    }
    
    // 🔔 控制器层日志
    console.log(`[Controller] 任务 #${taskId} 已删除`);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    res.json({
        success: true,
        message: '任务删除成功',
        timestamp: Date.now()
    });
});

// ============================================================
// 统计数据相关接口
// ============================================================

/**
 * 获取作业统计
 * 请求方式: GET
 * 路径: /api/statistics
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     completedArea: number,    // 已完成面积(亩)
 *     totalArea: number,         // 总面积(亩)
 *     progress: number           // 完成进度 %
 *   },
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库统计作业数据
 */
exports.getStatistics = asyncHandler(async (req, res) => {
    // 从数据层获取统计数据
    const data = mockData.getStatistics();
    // 返回成功响应
    sendSuccess(res, data);
});

/**
 * 更新作业统计
 * 请求方式: POST/PUT
 * 路径: /api/statistics
 * 
 * 请求体格式:
 * {
 *   completedArea?: number,   // 已完成面积 (可选)
 *   totalArea?: number        // 总面积 (可选)
 * }
 * 
 * 返回数据结构:
 * {
 *   success: true,
 *   data: {
 *     completedArea: number,
 *     totalArea: number,
 *     progress: number
 *   },
 *   message: string,
 *   timestamp: number
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将统计数据写入数据库
 */
exports.updateStatistics = asyncHandler(async (req, res) => {
    const statsData = req.body;
    
    // 参数验证
    if (!statsData || Object.keys(statsData).length === 0) {
        return sendError(res, '请至少提供一个统计字段', 400);
    }
    
    // 🔔 控制器层日志
    console.log('='.repeat(60));
    console.log(`[Controller] 收到统计数据更新请求 - ${new Date().toLocaleString()}`);
    console.log(`[Controller] 请求数据:`, statsData);
    console.log('='.repeat(60));
    
    // 更新统计数据
    const updatedData = mockData.updateStatistics(statsData);
    
    // 🔔 控制器层日志
    console.log(`[Controller] 更新后的数据:`, updatedData);
    console.log('='.repeat(60));
    console.log('');
    
    // 返回成功响应
    sendSuccess(res, updatedData, { message: '统计数据更新成功' });
});
