/**
 * 数据源接口模块
 * 
 * 功能描述:
 * - 提供统一的数据接口，对接真实硬件或外部服务
 * - 支持多种数据源：串口、MQTT、HTTP API、WebSocket、数据库
 * - 可通过配置切换不同的数据源
 * 
 * 使用方式:
 * 1. 在下方配置区选择数据源类型
 * 2. 填写对应的连接参数
 * 3. 在 robotController.js 中引用此模块替换 mockData
 * 
 * 文件路径: backend/data/dataSource.js
 */

// ============================================================
// 配置区 - 根据实际情况修改
// ============================================================

/**
 * 数据源配置
 * 修改 type 切换不同的数据源
 */
const CONFIG = {
    // 数据源类型: 'serial' | 'mqtt' | 'http' | 'websocket' | 'database'
    type: 'mqtt',
    
    // 串口配置 (type: 'serial')
    serial: {
        port: '/dev/ttyUSB0',       // Windows: 'COM3', Linux: '/dev/ttyUSB0'
        baudRate: 9600
    },
    
    // MQTT配置 (type: 'mqtt')
    mqtt: {
        broker: 'mqtt://localhost:1883',    // MQTT服务器地址
        clientId: 'robot-backend-server',   // 客户端ID
        username: '',                        // 用户名（可选）
        password: '',                        // 密码（可选）
        topics: {
            status: 'robot/status',          // 机器人状态（硬件推送）
            sensors: 'robot/sensors',        // 传感器数据（硬件推送）
            tasks: 'robot/tasks',            // 任务列表（硬件推送）
            statistics: 'robot/statistics', // 作业统计（硬件推送）
            control: 'robot/control'         // 控制指令（服务器发送）
        }
    },
    
    // HTTP API配置 (type: 'http')
    http: {
        baseUrl: 'http://192.168.1.100:8080',
        endpoints: {
            status: '/api/robot/status',
            sensors: '/api/sensors',
            tasks: '/api/tasks',
            statistics: '/api/statistics',
            control: '/api/control'
        },
        timeout: 5000
    },
    
    // WebSocket配置 (type: 'websocket')
    websocket: {
        url: 'ws://192.168.1.100:8080/ws'
    },
    
    // 数据库配置 (type: 'database')
    database: {
        type: 'mysql',              // 'mysql' | 'mongodb' | 'postgresql'
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'robot_db'
    }
};

// ============================================================
// 数据缓存 - 存储从数据源接收的最新数据
// ============================================================

const cache = {
    robot: {
        battery: 0,
        speed: 0,
        temperature: 0,
        coordinates: { lat: 0, lon: 0 }
    },
    sensors: {
        soilHumidity: 0,
        soilTemp: 0,
        light: 0,
        airHumidity: 0
    },
    tasks: [],
    statistics: {
        completedArea: 0,
        totalArea: 0,
        progress: 0
    },
    lastUpdate: null
};

// ============================================================
// 连接状态
// ============================================================

let isConnected = false;
let connection = null;

// ============================================================
// 数据源初始化函数
// ============================================================

/**
 * 初始化串口连接
 * 需要安装: npm install serialport
 */
async function initSerial() {
    try {
        const { SerialPort } = require('serialport');
        const { ReadlineParser } = require('@serialport/parser-readline');
        
        connection = new SerialPort({
            path: CONFIG.serial.port,
            baudRate: CONFIG.serial.baudRate
        });
        
        const parser = connection.pipe(new ReadlineParser({ delimiter: '\n' }));
        
        parser.on('data', (line) => {
            try {
                const data = JSON.parse(line);
                updateCache(data);
            } catch (e) {
                console.error('[Serial] 数据解析错误:', e.message);
            }
        });
        
        connection.on('open', () => {
            isConnected = true;
            console.log('[Serial] 连接成功:', CONFIG.serial.port);
        });
        
        connection.on('error', (err) => {
            isConnected = false;
            console.error('[Serial] 连接错误:', err.message);
        });
        
    } catch (error) {
        console.error('[Serial] 初始化失败:', error.message);
        console.log('[Serial] 请安装依赖: npm install serialport');
    }
}

/**
 * 初始化MQTT连接
 * 需要安装: npm install mqtt
 */
async function initMqtt() {
    try {
        const mqtt = require('mqtt');
        
        // 连接配置
        const options = {
            clientId: CONFIG.mqtt.clientId,
            clean: true,
            reconnectPeriod: 5000,  // 5秒重连
        };
        
        // 如果配置了用户名密码
        if (CONFIG.mqtt.username) {
            options.username = CONFIG.mqtt.username;
            options.password = CONFIG.mqtt.password;
        }
        
        connection = mqtt.connect(CONFIG.mqtt.broker, options);
        
        connection.on('connect', () => {
            isConnected = true;
            console.log('='.repeat(50));
            console.log('[MQTT] 连接成功:', CONFIG.mqtt.broker);
            console.log('='.repeat(50));
            
            // 订阅数据主题（不订阅control，control用于发送指令）
            const dataTopics = [
                CONFIG.mqtt.topics.status,
                CONFIG.mqtt.topics.sensors,
                CONFIG.mqtt.topics.tasks,
                CONFIG.mqtt.topics.statistics
            ];
            
            dataTopics.forEach(topic => {
                connection.subscribe(topic, (err) => {
                    if (!err) {
                        console.log('[MQTT] 订阅主题:', topic);
                    } else {
                        console.error('[MQTT] 订阅失败:', topic, err.message);
                    }
                });
            });
            
            console.log('');
            console.log('等待硬件推送数据...');
            console.log('');
        });
        
        connection.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                const timestamp = new Date().toLocaleTimeString('zh-CN');
                
                // 根据主题更新对应的缓存数据
                if (topic === CONFIG.mqtt.topics.status) {
                    cache.robot = { ...cache.robot, ...data };
                    console.log(`[${timestamp}] 收到机器人状态:`, JSON.stringify(data));
                } 
                else if (topic === CONFIG.mqtt.topics.sensors) {
                    cache.sensors = { ...cache.sensors, ...data };
                    console.log(`[${timestamp}] 收到传感器数据:`, JSON.stringify(data));
                }
                else if (topic === CONFIG.mqtt.topics.tasks) {
                    cache.tasks = Array.isArray(data) ? data : [];
                    console.log(`[${timestamp}] 收到任务列表:`, cache.tasks.length, '个任务');
                }
                else if (topic === CONFIG.mqtt.topics.statistics) {
                    cache.statistics = { ...cache.statistics, ...data };
                    console.log(`[${timestamp}] 收到统计数据:`, JSON.stringify(data));
                }
                
                cache.lastUpdate = Date.now();
            } catch (e) {
                console.error('[MQTT] 数据解析错误:', e.message, '原始数据:', message.toString());
            }
        });
        
        connection.on('error', (err) => {
            isConnected = false;
            console.error('[MQTT] 连接错误:', err.message);
        });
        
        connection.on('reconnect', () => {
            console.log('[MQTT] 正在重新连接...');
        });
        
        connection.on('close', () => {
            isConnected = false;
            console.log('[MQTT] 连接已断开');
        });
        
    } catch (error) {
        console.error('[MQTT] 初始化失败:', error.message);
        console.log('[MQTT] 请安装依赖: npm install mqtt');
    }
}

/**
 * 初始化WebSocket连接
 * 需要安装: npm install ws
 */
async function initWebSocket() {
    try {
        const WebSocket = require('ws');
        
        connection = new WebSocket(CONFIG.websocket.url);
        
        connection.on('open', () => {
            isConnected = true;
            console.log('[WebSocket] 连接成功:', CONFIG.websocket.url);
        });
        
        connection.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                updateCache(data);
            } catch (e) {
                console.error('[WebSocket] 数据解析错误:', e.message);
            }
        });
        
        connection.on('close', () => {
            isConnected = false;
            console.log('[WebSocket] 连接已关闭');
            // 5秒后重连
            setTimeout(initWebSocket, 5000);
        });
        
        connection.on('error', (err) => {
            console.error('[WebSocket] 连接错误:', err.message);
        });
        
    } catch (error) {
        console.error('[WebSocket] 初始化失败:', error.message);
        console.log('[WebSocket] 请安装依赖: npm install ws');
    }
}

/**
 * 初始化数据库连接
 * MySQL需要安装: npm install mysql2
 * MongoDB需要安装: npm install mongodb
 */
async function initDatabase() {
    try {
        if (CONFIG.database.type === 'mysql') {
            const mysql = require('mysql2/promise');
            connection = await mysql.createConnection({
                host: CONFIG.database.host,
                port: CONFIG.database.port,
                user: CONFIG.database.user,
                password: CONFIG.database.password,
                database: CONFIG.database.database
            });
            isConnected = true;
            console.log('[Database] MySQL连接成功');
            
        } else if (CONFIG.database.type === 'mongodb') {
            const { MongoClient } = require('mongodb');
            const url = `mongodb://${CONFIG.database.host}:${CONFIG.database.port}`;
            connection = new MongoClient(url);
            await connection.connect();
            isConnected = true;
            console.log('[Database] MongoDB连接成功');
        }
        
    } catch (error) {
        console.error('[Database] 初始化失败:', error.message);
    }
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 更新缓存数据
 * @param {Object} data - 接收到的数据
 */
function updateCache(data) {
    if (data.robot) cache.robot = { ...cache.robot, ...data.robot };
    if (data.sensors) cache.sensors = { ...cache.sensors, ...data.sensors };
    if (data.tasks) cache.tasks = data.tasks;
    if (data.statistics) cache.statistics = { ...cache.statistics, ...data.statistics };
    cache.lastUpdate = Date.now();
}

/**
 * HTTP请求封装
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 */
async function httpRequest(endpoint, options = {}) {
    const url = `${CONFIG.http.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.http.timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[HTTP] 请求失败: ${endpoint}`, error.message);
        throw error;
    }
}

// ============================================================
// 对外接口 - 与 mockData.js 保持一致
// ============================================================

/**
 * 获取机器人状态
 * @returns {Object} 机器人状态数据
 */
async function getRobotStatus() {
    if (CONFIG.type === 'http') {
        try {
            const result = await httpRequest(CONFIG.http.endpoints.status);
            if (result.success) {
                cache.robot = result.data;
            }
        } catch (error) {
            // 返回缓存数据
        }
    }
    
    return {
        battery: cache.robot.battery,
        speed: cache.robot.speed,
        temperature: cache.robot.temperature,
        coordinates: cache.robot.coordinates
    };
}

/**
 * 获取传感器数据
 * @returns {Object} 传感器数据
 */
async function getSensorData() {
    if (CONFIG.type === 'http') {
        try {
            const result = await httpRequest(CONFIG.http.endpoints.sensors);
            if (result.success) {
                cache.sensors = result.data;
            }
        } catch (error) {
            // 返回缓存数据
        }
    }
    
    return {
        soilHumidity: cache.sensors.soilHumidity,
        soilTemp: cache.sensors.soilTemp,
        light: cache.sensors.light,
        airHumidity: cache.sensors.airHumidity
    };
}

/**
 * 获取任务列表
 * @returns {Array} 任务数组
 */
async function getTasks() {
    if (CONFIG.type === 'http') {
        try {
            const result = await httpRequest(CONFIG.http.endpoints.tasks);
            if (result.success) {
                cache.tasks = result.data;
            }
        } catch (error) {
            // 返回缓存数据
        }
    }
    
    if (CONFIG.type === 'database' && connection) {
        try {
            if (CONFIG.database.type === 'mysql') {
                const [rows] = await connection.execute('SELECT * FROM tasks');
                cache.tasks = rows;
            } else if (CONFIG.database.type === 'mongodb') {
                const db = connection.db(CONFIG.database.database);
                cache.tasks = await db.collection('tasks').find().toArray();
            }
        } catch (error) {
            console.error('[Database] 查询任务失败:', error.message);
        }
    }
    
    return cache.tasks;
}

/**
 * 获取作业统计
 * @returns {Object} 统计数据
 */
async function getStatistics() {
    if (CONFIG.type === 'http') {
        try {
            const result = await httpRequest(CONFIG.http.endpoints.statistics);
            if (result.success) {
                cache.statistics = result.data;
            }
        } catch (error) {
            // 返回缓存数据
        }
    }
    
    return {
        completedArea: cache.statistics.completedArea,
        totalArea: cache.statistics.totalArea,
        progress: cache.statistics.progress
    };
}

/**
 * 处理方向控制指令
 * @param {string} command - 指令 (forward/backward/left/right/stop)
 * @returns {Object} 执行结果
 */
async function handleCommand(command) {
    const COMMANDS = {
        forward: '前进',
        backward: '后退',
        left: '左转',
        right: '右转',
        stop: '停止'
    };
    
    const commandName = COMMANDS[command] || command;
    
    // HTTP方式发送指令
    if (CONFIG.type === 'http') {
        try {
            await httpRequest(CONFIG.http.endpoints.control, {
                method: 'POST',
                body: JSON.stringify({ command })
            });
        } catch (error) {
            return {
                executed: false,
                command,
                message: `指令发送失败: ${error.message}`
            };
        }
    }
    
    // MQTT方式发送指令
    if (CONFIG.type === 'mqtt' && connection) {
        const payload = JSON.stringify({ type: 'command', command });
        connection.publish(CONFIG.mqtt.topics.control, payload);
        console.log(`[MQTT] 发送控制指令到 ${CONFIG.mqtt.topics.control}:`, payload);
    }
    
    // 串口方式发送指令
    if (CONFIG.type === 'serial' && connection) {
        connection.write(JSON.stringify({ command }) + '\n');
    }
    
    // WebSocket方式发送指令
    if (CONFIG.type === 'websocket' && connection && connection.readyState === 1) {
        connection.send(JSON.stringify({ type: 'command', command }));
    }
    
    console.log(`[DataSource] 发送指令: ${commandName}`);
    
    return {
        executed: true,
        command,
        message: `指令已发送: ${commandName}`
    };
}

/**
 * 处理作业操作
 * @param {string} action - 操作 (irrigation/fertilize/scan/harvest)
 * @returns {Object} 执行结果
 */
async function handleAction(action) {
    const ACTIONS = {
        irrigation: '灌溉',
        fertilize: '施肥',
        scan: '扫描',
        harvest: '收割'
    };
    
    const actionName = ACTIONS[action] || action;
    
    // HTTP方式发送操作
    if (CONFIG.type === 'http') {
        try {
            await httpRequest(CONFIG.http.endpoints.control, {
                method: 'POST',
                body: JSON.stringify({ action })
            });
        } catch (error) {
            return {
                executed: false,
                action,
                message: `操作发送失败: ${error.message}`
            };
        }
    }
    
    // MQTT方式发送操作
    if (CONFIG.type === 'mqtt' && connection) {
        const payload = JSON.stringify({ type: 'action', action });
        connection.publish(CONFIG.mqtt.topics.control, payload);
        console.log(`[MQTT] 发送作业指令到 ${CONFIG.mqtt.topics.control}:`, payload);
    }
    
    // 串口方式发送操作
    if (CONFIG.type === 'serial' && connection) {
        connection.write(JSON.stringify({ action }) + '\n');
    }
    
    // WebSocket方式发送操作
    if (CONFIG.type === 'websocket' && connection && connection.readyState === 1) {
        connection.send(JSON.stringify({ type: 'action', action }));
    }
    
    console.log(`[DataSource] 执行作业: ${actionName}`);
    
    return {
        executed: true,
        action,
        message: `${actionName}作业已启动`
    };
}

/**
 * 获取连接状态
 * @returns {Object} 连接信息
 */
function getConnectionStatus() {
    return {
        type: CONFIG.type,
        connected: isConnected,
        lastUpdate: cache.lastUpdate
    };
}

/**
 * 初始化数据源连接
 * 根据配置的类型自动选择初始化方式
 */
async function init() {
    console.log(`[DataSource] 初始化数据源: ${CONFIG.type}`);
    
    switch (CONFIG.type) {
        case 'serial':
            await initSerial();
            break;
        case 'mqtt':
            await initMqtt();
            break;
        case 'websocket':
            await initWebSocket();
            break;
        case 'database':
            await initDatabase();
            break;
        case 'http':
            isConnected = true;
            console.log('[HTTP] 使用HTTP API模式');
            break;
        default:
            console.warn('[DataSource] 未知的数据源类型:', CONFIG.type);
    }
}

/**
 * 关闭数据源连接
 */
async function close() {
    if (connection) {
        if (CONFIG.type === 'serial') {
            connection.close();
        } else if (CONFIG.type === 'mqtt') {
            connection.end();
        } else if (CONFIG.type === 'websocket') {
            connection.close();
        } else if (CONFIG.type === 'database') {
            await connection.end();
        }
        
        isConnected = false;
        connection = null;
        console.log('[DataSource] 连接已关闭');
    }
}

// ============================================================
// 模块导出
// ============================================================

module.exports = {
    // 数据接口 - 与 mockData.js 接口一致
    getRobotStatus,
    getSensorData,
    getTasks,
    getStatistics,
    handleCommand,
    handleAction,
    
    // 连接管理
    init,
    close,
    getConnectionStatus,
    
    // 导出配置供外部读取
    CONFIG
};
