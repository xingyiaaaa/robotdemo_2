/**
 * 模拟数据模块
 * 
 * 功能描述:
 * - 提供机器人状态、传感器数据的模拟生成
 * - 模拟任务管理和作业统计功能
 * - 模拟控制指令的执行和作业操作
 * 
 * 🔌 槽位说明:
 * 此文件中的所有数据都是模拟数据，对接真实硬件时需要:
 * 1. 替换数据源 - 从真实硬件/数据库读取
 * 2. 修改getRobotStatus() - 从真实硬件API获取状态
 * 3. 修改getSensorData() - 从真实传感器读取数据
 * 4. 修改getTasks() - 从数据库查询任务列表
 * 5. 修改getStatistics() - 从数据库计算统计数据
 * 6. 修改handleCommand() - 向真实硬件发送控制指令
 * 7. 修改handleAction() - 触发真实作业操作
 * 
 * 文件路径: backend/data/mockData.js
 */

// ============================================================
// 状态存储区
// ============================================================

/**
 * 内部状态对象
 * 模拟数据库或硬件状态存储
 * 在真实应用中，这些数据应该从数据库或硬件接口读取
 */
const state = {
    // ========== 机器人状态数据 ==========
    battery: 85,              // 电池电量 (百分比 0-100)
    speed: 1.2,                // 当前速度 (米/秒)
    temperature: 28,           // 机器人温度 (摄氏度)
    lat: 40.200,               // 纬度坐标 (GPS)
    lon: 116.400,              // 经度坐标 (GPS)
    
    // ========== 传感器数据 ==========
    soilHumidity: 65,          // 土壤湿度 (百分比 0-100)
    soilTemp: 22,              // 土壤温度 (摄氏度)
    light: 8000,               // 光照强度 (勒克斯 Lux)
    airHumidity: 55,           // 空气湿度 (百分比 0-100)
    
    // ========== 作业统计数据 ==========
    completedArea: 12.5,       // 已完成作业面积 (亩)
    totalArea: 38.2            // 总作业面积 (亩)
};

// ============================================================
// 工具函数区
// ============================================================

/**
 * 生成指定范围内的随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
const random = (min, max) => Math.random() * (max - min) + min;

/**
 * 将数值限制在指定范围内
 * @param {number} value - 要限制的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// ============================================================
// 常量定义区
// ============================================================

/**
 * 方向控制指令映射表
 * 将指令代码转换为中文描述
 */
const COMMANDS = {
    forward: '前进',           // 向前移动
    backward: '后退',          // 向后移动
    left: '左转',              // 向左转向
    right: '右转',             // 向右转向
    stop: '停止'               // 紧急停止
};

/**
 * 作业操作映射表
 * 将操作代码转换为中文描述
 */
const ACTIONS = {
    irrigation: '灌溉',         // 灌溉作业
    fertilize: '施肥',         // 施肥作业
    scan: '扫描',             // 病虫害扫描
    harvest: '收割'           // 作物收割
};

// ============================================================
// 机器人状态相关函数
// ============================================================

/**
 * 获取机器人状态
 * @returns {Object} 机器人状态对象
 * 
 * 返回结构:
 * {
 *   battery: number,          // 电量百分比
 *   speed: number,            // 速度 m/s
 *   temperature: number,      // 温度 °C
 *   coordinates: {            // GPS坐标
 *     lat: number,
 *     lon: number
 *   }
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，替换为从机器人API获取实时状态
 */
function getRobotStatus() {
    // 模拟电量消耗 - 每次调用减少0-0.05%，最低保持20%
    state.battery = Math.max(20, state.battery - random(0, 0.05));
    
    // 模拟速度变化 - 0-2 m/s之间的随机速度
    state.speed = Number(random(0, 2).toFixed(1));
    
    // 模拟温度变化 - 25-31°C之间的随机温度
    state.temperature = Math.floor(random(25, 31));
    
    // 模拟位置变化 - 在基准坐标附近微小偏移
    state.lat = Number((40.2 + random(-0.005, 0.005)).toFixed(3));
    state.lon = Number((116.4 + random(-0.005, 0.005)).toFixed(3));
    
    // 返回格式化的机器人状态
    return {
        battery: Math.floor(state.battery),      // 电量取整
        speed: state.speed,                      // 速度保留一位小数
        temperature: state.temperature,          // 温度取整
        coordinates: {
            lat: state.lat,                      // 纬度
            lon: state.lon                       // 经度
        }
    };
}

// ============================================================
// 传感器数据相关函数
// ============================================================

/**
 * 获取传感器数据
 * @returns {Object} 传感器数据对象
 * 
 * 返回结构:
 * {
 *   soilHumidity: number,     // 土壤湿度 %
 *   soilTemp: number,         // 土壤温度 °C
 *   light: number,            // 光照强度 Lux
 *   airHumidity: number       // 空气湿度 %
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从真实传感器接口读取数据
 */
function getSensorData() {
    // 模拟土壤湿度 - 60-70%之间随机
    state.soilHumidity = Math.floor(random(60, 70));
    
    // 模拟土壤温度 - 20-25°C之间随机
    state.soilTemp = Math.floor(random(20, 25));
    
    // 模拟光照强度 - 7000-9000 Lux之间随机
    state.light = Math.floor(random(7000, 9000));
    
    // 模拟空气湿度 - 50-60%之间随机
    state.airHumidity = Math.floor(random(50, 60));
    
    // 返回传感器数据
    return {
        soilHumidity: state.soilHumidity,
        soilTemp: state.soilTemp,
        light: state.light,
        airHumidity: state.airHumidity
    };
}

// ============================================================
// 任务管理相关函数
// ============================================================

/**
 * 获取任务列表
 * @returns {Array} 任务数组
 * 
 * 返回结构:
 * [
 *   {
 *     id: number,              // 任务ID
 *     name: string,            // 任务名称
 *     status: 'active' | 'pending' | 'done',  // 任务状态
 *     progress: number         // 完成进度 %
 *   },
 *   ...
 * ]
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库查询任务列表
 */
function getTasks() {
    // 返回任务列表
    return tasks;
}

// ============================================================
// 统计数据相关函数
// ============================================================

/**
 * 获取作业统计
 * @returns {Object} 统计数据对象
 * 
 * 返回结构:
 * {
 *   completedArea: number,    // 已完成面积 (亩)
 *   totalArea: number,         // 总面积 (亩)
 *   progress: number           // 完成进度 (%)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库统计实际作业数据
 */
function getStatistics() {
    // 模拟作业进度增长 - 每次调用增加0-0.1亩
    state.completedArea = clamp(
        state.completedArea + random(0, 0.1),  // 增加随机面积
        0,                                      // 最小值
        state.totalArea                         // 最大值不超过总面积
    );
    
    // 计算完成进度百分比
    const progress = Number((state.completedArea / state.totalArea * 100).toFixed(1));
    
    // 返回统计数据
    return {
        completedArea: Number(state.completedArea.toFixed(1)),  // 保留一位小数
        totalArea: state.totalArea,
        progress                                                 // 进度百分比
    };
}

// ============================================================
// 控制指令相关函数
// ============================================================

/**
 * 处理方向控制指令
 * @param {string} command - 指令代码 (forward/backward/left/right/stop)
 * @returns {Object} 执行结果对象
 * 
 * 返回结构:
 * {
 *   executed: true,          // 指令是否执行
 *   command: string,          // 执行的指令代码
 *   message: string           // 执行结果消息
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将指令发送到机器人控制器
 */
function handleCommand(command) {
    // 获取指令的中文名称，如果未定义则使用原始指令代码
    const commandName = COMMANDS[command] || command;
    
    // 在控制台输出日志，模拟指令执行
    console.log(`🤖 [Robot] 执行指令: ${commandName} (${command})`);
    console.log(`   时间: ${new Date().toLocaleString()}`);
    
    // 🔌 槽位: 对接真实硬件时，在这里调用硬件控制API
    // 例如: await robotHardware.sendCommand(command);
    
    // 返回执行结果
    return {
        executed: true,                          // 标记指令已执行
        command: command,                        // 返回指令代码
        message: `指令已发送: ${commandName}`    // 执行结果消息
    };
}

/**
 * 处理作业操作
 * @param {string} action - 操作代码 (irrigation/fertilize/scan/harvest)
 * @returns {Object} 执行结果对象
 * 
 * 返回结构:
 * {
 *   executed: true,          // 操作是否执行
 *   action: string,           // 执行的操作代码
 *   message: string           // 执行结果消息
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，触发相应的作业设备
 */
function handleAction(action) {
    // 获取操作的中文名称，如果未定义则使用原始操作代码
    const actionName = ACTIONS[action] || action;
    
    // 在控制台输出日志，模拟作业执行
    console.log(`🚜 [Robot] 执行作业: ${actionName} (${action})`);
    console.log(`   时间: ${new Date().toLocaleString()}`);
    
    // 🔌 槽位: 对接真实硬件时，在这里调用作业设备API
    // 例如: await robotHardware.startAction(action);
    
    // 返回执行结果
    return {
        executed: true,                          // 标记操作已执行
        action: action,                           // 返回操作代码
        message: `${actionName}作业已启动`         // 执行结果消息
    };
}

// ============================================================
// 数据更新相关函数
// ============================================================

/**
 * 更新传感器数据
 * @param {Object} data - 要更新的传感器数据
 * @returns {Object} 更新后的传感器数据
 * 
 * 参数结构:
 * {
 *   soilHumidity?: number,    // 土壤湿度 (可选)
 *   soilTemp?: number,        // 土壤温度 (可选)
 *   light?: number,           // 光照强度 (可选)
 *   airHumidity?: number      // 空气湿度 (可选)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将数据写入数据库或发送到硬件
 */
function updateSensorData(data) {
    console.log('📊 [Data] 更新传感器数据:', data);
    
    // 更新传感器状态（只更新提供的字段）
    if (data.soilHumidity !== undefined) {
        state.soilHumidity = clamp(data.soilHumidity, 0, 100);
    }
    if (data.soilTemp !== undefined) {
        state.soilTemp = data.soilTemp;
    }
    if (data.light !== undefined) {
        state.light = clamp(data.light, 0, 100000);
    }
    if (data.airHumidity !== undefined) {
        state.airHumidity = clamp(data.airHumidity, 0, 100);
    }
    
    // 返回更新后的完整传感器数据
    return {
        soilHumidity: state.soilHumidity,
        soilTemp: state.soilTemp,
        light: state.light,
        airHumidity: state.airHumidity
    };
}

/**
 * 更新机器人状态
 * @param {Object} data - 要更新的机器人状态
 * @returns {Object} 更新后的机器人状态
 * 
 * 参数结构:
 * {
 *   battery?: number,         // 电量 (可选)
 *   speed?: number,           // 速度 (可选)
 *   temperature?: number,     // 温度 (可选)
 *   lat?: number,             // 纬度 (可选)
 *   lon?: number              // 经度 (可选)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将状态写入数据库
 */
function updateRobotStatus(data) {
    console.log('🤖 [Data] 更新机器人状态:', data);
    
    // 更新机器人状态（只更新提供的字段）
    if (data.battery !== undefined) {
        state.battery = clamp(data.battery, 0, 100);
    }
    if (data.speed !== undefined) {
        state.speed = Math.max(0, data.speed);
    }
    if (data.temperature !== undefined) {
        state.temperature = data.temperature;
    }
    if (data.lat !== undefined) {
        state.lat = data.lat;
    }
    if (data.lon !== undefined) {
        state.lon = data.lon;
    }
    
    // 返回更新后的完整机器人状态
    return {
        battery: Math.floor(state.battery),
        speed: state.speed,
        temperature: state.temperature,
        coordinates: {
            lat: state.lat,
            lon: state.lon
        }
    };
}

/**
 * 更新作业统计
 * @param {Object} data - 要更新的统计数据
 * @returns {Object} 更新后的统计数据
 * 
 * 参数结构:
 * {
 *   completedArea?: number,   // 已完成面积 (可选)
 *   totalArea?: number        // 总面积 (可选)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将统计数据写入数据库
 */
function updateStatistics(data) {
    console.log('📈 [Data] 更新统计数据:', data);
    
    // 更新统计数据（只更新提供的字段）
    if (data.completedArea !== undefined) {
        state.completedArea = Math.max(0, data.completedArea);
    }
    if (data.totalArea !== undefined) {
        state.totalArea = Math.max(0, data.totalArea);
    }
    
    // 计算完成进度百分比
    const progress = state.totalArea > 0 
        ? Number((state.completedArea / state.totalArea * 100).toFixed(1))
        : 0;
    
    // 返回更新后的统计数据
    return {
        completedArea: Number(state.completedArea.toFixed(1)),
        totalArea: state.totalArea,
        progress
    };
}

// 任务数据存储
let tasks = [
    { 
        id: 1, 
        name: 'A区灌溉作业',
        status: 'active',
        progress: 45
    },
    { 
        id: 2, 
        name: 'B区病虫害检测',
        status: 'pending',
        progress: 0
    },
    { 
        id: 3, 
        name: 'D区施肥作业',
        status: 'done',
        progress: 100
    }
];

/**
 * 创建新任务
 * @param {Object} taskData - 任务数据
 * @returns {Object} 创建的任务
 * 
 * 参数结构:
 * {
 *   name: string,             // 任务名称 (必填)
 *   status?: string,          // 任务状态 (可选，默认pending)
 *   progress?: number         // 完成进度 (可选，默认0)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，将任务保存到数据库
 */
function createTask(taskData) {
    console.log('✅ [Data] 创建新任务:', taskData);
    
    // 生成新任务ID
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    // 创建任务对象
    const newTask = {
        id: newId,
        name: taskData.name,
        status: taskData.status || 'pending',
        progress: taskData.progress || 0
    };
    
    // 添加到任务列表
    tasks.push(newTask);
    
    return newTask;
}

/**
 * 更新任务
 * @param {number} taskId - 任务ID
 * @param {Object} updateData - 要更新的数据
 * @returns {Object|null} 更新后的任务，如果任务不存在则返回null
 * 
 * 参数结构:
 * {
 *   name?: string,            // 任务名称 (可选)
 *   status?: string,          // 任务状态 (可选)
 *   progress?: number         // 完成进度 (可选)
 * }
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，更新数据库中的任务
 */
function updateTask(taskId, updateData) {
    console.log(`📝 [Data] 更新任务 #${taskId}:`, updateData);
    
    // 查找任务
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        console.log(`❌ [Data] 任务 #${taskId} 不存在`);
        return null;
    }
    
    // 更新任务字段
    if (updateData.name !== undefined) {
        task.name = updateData.name;
    }
    if (updateData.status !== undefined) {
        task.status = updateData.status;
    }
    if (updateData.progress !== undefined) {
        task.progress = clamp(updateData.progress, 0, 100);
    }
    
    return task;
}

/**
 * 删除任务
 * @param {number} taskId - 任务ID
 * @returns {boolean} 是否删除成功
 * 
 * 🔌 槽位说明: 
 * 对接真实硬件时，从数据库删除任务
 */
function deleteTask(taskId) {
    console.log(`🗑️ [Data] 删除任务 #${taskId}`);
    
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== taskId);
    
    return tasks.length < initialLength;
}

// ============================================================
// 模块导出
// ============================================================

/**
 * 导出所有公共函数
 * 供controller模块调用
 */
module.exports = {
    getRobotStatus,       // 获取机器人状态
    getSensorData,        // 获取传感器数据
    getTasks,             // 获取任务列表
    getStatistics,        // 获取作业统计
    handleCommand,        // 处理控制指令
    handleAction,         // 处理作业操作
    updateSensorData,     // 更新传感器数据
    updateRobotStatus,    // 更新机器人状态
    updateStatistics,     // 更新统计数据
    createTask,           // 创建新任务
    updateTask,           // 更新任务
    deleteTask            // 删除任务
};
