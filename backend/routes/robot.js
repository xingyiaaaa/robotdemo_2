/**
 * API路由配置模块
 * 
 * 功能描述:
 * - 定义所有API端点的路由规则
 * - 将HTTP请求映射到对应的控制器处理函数
 * - 提供RESTful风格的API接口
 * 
 * 路由结构:
 * /api/robot/status   - GET  获取机器人状态
 * /api/robot/control  - POST 发送控制指令
 * /api/sensors        - GET  获取传感器数据
 * /api/tasks          - GET  获取任务列表
 * /api/statistics     - GET  获取作业统计
 * 
 * 文件路径: backend/routes/robot.js
 */

// 引入Express框架
const express = require('express');

// 创建路由器实例 - 用于定义路由规则
const router = express.Router();

// 引入控制器模块 - 包含所有请求处理函数
const robotController = require('../controllers/robotController');

// ============================================================
// 机器人状态相关路由
// ============================================================

/**
 * 获取机器人状态
 * 
 * 接口信息:
 *   - 路径: /api/robot/status
 *   - 方法: GET
 *   - 认证: 无需认证
 *   - 处理函数: robotController.getStatus
 * 
 * 请求示例:
 *   GET /api/robot/status
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "battery": 84,
 *     "speed": 1.5,
 *     "temperature": 25,
 *     "coordinates": {
 *       "lat": 40.204,
 *       "lon": 116.401
 *     }
 *   },
 *   "timestamp": 1769737700120
 * }
 */
router.get('/robot/status', robotController.getStatus);

/**
 * 更新机器人状态
 * 
 * 接口信息:
 *   - 路径: /api/robot/status
 *   - 方法: POST
 *   - 认证: 无需认证
 *   - 处理函数: robotController.updateStatus
 * 
 * 请求示例:
 *   POST /api/robot/status
 *   Content-Type: application/json
 *   {
 *     "battery": 90,
 *     "speed": 2.0,
 *     "temperature": 26,
 *     "lat": 40.205,
 *     "lon": 116.402
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "battery": 90,
 *     "speed": 2.0,
 *     "temperature": 26,
 *     "coordinates": {
 *       "lat": 40.205,
 *       "lon": 116.402
 *     }
 *   },
 *   "message": "机器人状态更新成功",
 *   "timestamp": 1769737700120
 * }
 */
router.post('/robot/status', robotController.updateStatus);

/**
 * 发送控制指令
 * 
 * 接口信息:
 *   - 路径: /api/robot/control
 *   - 方法: POST
 *   - 认证: 无需认证
 *   - 处理函数: robotController.sendCommand
 * 
 * 请求格式1 - 方向控制:
 *   POST /api/robot/control
 *   Content-Type: application/json
 *   {
 *     "command": "forward"  // forward | backward | left | right | stop
 *   }
 * 
 * 请求格式2 - 作业控制:
 *   POST /api/robot/control
 *   Content-Type: application/json
 *   {
 *     "action": "irrigation"  // irrigation | fertilize | scan | harvest
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "executed": true,
 *   "command": "forward",
 *   "message": "指令已发送: 前进",
 *   "timestamp": 1769737700120
 * }
 */
router.post('/robot/control', robotController.sendCommand);

// ============================================================
// 传感器数据相关路由
// ============================================================

/**
 * 获取传感器数据
 * 
 * 接口信息:
 *   - 路径: /api/sensors
 *   - 方法: GET
 *   - 认证: 无需认证
 *   - 处理函数: robotController.getSensors
 * 
 * 请求示例:
 *   GET /api/sensors
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "soilHumidity": 64,
 *     "soilTemp": 20,
 *     "light": 7954,
 *     "airHumidity": 54
 *   },
 *   "timestamp": 1769737886090
 * }
 */
router.get('/sensors', robotController.getSensors);

/**
 * 更新传感器数据
 * 
 * 接口信息:
 *   - 路径: /api/sensors
 *   - 方法: POST
 *   - 认证: 无需认证
 *   - 处理函数: robotController.updateSensors
 * 
 * 请求示例:
 *   POST /api/sensors
 *   Content-Type: application/json
 *   {
 *     "soilHumidity": 70,
 *     "soilTemp": 22,
 *     "light": 8500,
 *     "airHumidity": 60
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "soilHumidity": 70,
 *     "soilTemp": 22,
 *     "light": 8500,
 *     "airHumidity": 60
 *   },
 *   "message": "传感器数据更新成功",
 *   "timestamp": 1769737886090
 * }
 */
router.post('/sensors', robotController.updateSensors);

// ============================================================
// 任务管理相关路由
// ============================================================

/**
 * 获取任务列表
 * 
 * 接口信息:
 *   - 路径: /api/tasks
 *   - 方法: GET
 *   - 认证: 无需认证
 *   - 处理函数: robotController.getTasks
 * 
 * 请求示例:
 *   GET /api/tasks
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "A区灌溉作业",
 *       "status": "active",
 *       "progress": 45
 *     },
 *     {
 *       "id": 2,
 *       "name": "B区病虫害检测",
 *       "status": "pending",
 *       "progress": 0
 *     },
 *     {
 *       "id": 3,
 *       "name": "D区施肥作业",
 *       "status": "done",
 *       "progress": 100
 *   }
 *   ],
 *   "timestamp": 1769737886090
 * }
 */
router.get('/tasks', robotController.getTasks);

/**
 * 创建新任务
 * 
 * 接口信息:
 *   - 路径: /api/tasks
 *   - 方法: POST
 *   - 认证: 无需认证
 *   - 处理函数: robotController.createTask
 * 
 * 请求示例:
 *   POST /api/tasks
 *   Content-Type: application/json
 *   {
 *     "name": "C区除草作业",
 *     "status": "pending",
 *     "progress": 0
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 4,
 *     "name": "C区除草作业",
 *     "status": "pending",
 *     "progress": 0
 *   },
 *   "message": "任务创建成功",
 *   "timestamp": 1769737886090
 * }
 */
router.post('/tasks', robotController.createTask);

/**
 * 更新任务
 * 
 * 接口信息:
 *   - 路径: /api/tasks/:id
 *   - 方法: PUT
 *   - 认证: 无需认证
 *   - 处理函数: robotController.updateTask
 * 
 * 请求示例:
 *   PUT /api/tasks/1
 *   Content-Type: application/json
 *   {
 *     "status": "done",
 *     "progress": 100
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "name": "A区灌溉作业",
 *     "status": "done",
 *     "progress": 100
 *   },
 *   "message": "任务更新成功",
 *   "timestamp": 1769737886090
 * }
 */
router.put('/tasks/:id', robotController.updateTask);

/**
 * 删除任务
 * 
 * 接口信息:
 *   - 路径: /api/tasks/:id
 *   - 方法: DELETE
 *   - 认证: 无需认证
 *   - 处理函数: robotController.deleteTask
 * 
 * 请求示例:
 *   DELETE /api/tasks/1
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "message": "任务删除成功",
 *   "timestamp": 1769737886090
 * }
 */
router.delete('/tasks/:id', robotController.deleteTask);

// ============================================================
// 统计数据相关路由
// ============================================================

/**
 * 获取作业统计
 * 
 * 接口信息:
 *   - 路径: /api/statistics
 *   - 方法: GET
 *   - 认证: 无需认证
 *   - 处理函数: robotController.getStatistics
 * 
 * 请求示例:
 *   GET /api/statistics
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "completedArea": 12.5,
 *     "totalArea": 38.2,
 *     "progress": 32.7
 *   },
 *   "timestamp": 1769737886090
 * }
 */
router.get('/statistics', robotController.getStatistics);

/**
 * 更新作业统计
 * 
 * 接口信息:
 *   - 路径: /api/statistics
 *   - 方法: POST
 *   - 认证: 无需认证
 *   - 处理函数: robotController.updateStatistics
 * 
 * 请求示例:
 *   POST /api/statistics
 *   Content-Type: application/json
 *   {
 *     "completedArea": 15.0,
 *     "totalArea": 40.0
 *   }
 * 
 * 响应示例:
 * {
 *   "success": true,
 *   "data": {
 *     "completedArea": 15.0,
 *     "totalArea": 40.0,
 *     "progress": 37.5
 *   },
 *   "message": "统计数据更新成功",
 *   "timestamp": 1769737886090
 * }
 */
router.post('/statistics', robotController.updateStatistics);

// ============================================================
// 模块导出
// ============================================================

/**
 * 导出路由器实例
 * 
 * 使用方式:
 * const robotRoutes = require('./routes/robot');
 * app.use('/api', robotRoutes);
 */
module.exports = router;
