[![GitHub repo size](https://img.shields.io/github/repo-size/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub last commit](https://img.shields.io/github/last-commit/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub stars](https://img.shields.io/github/stars/xingyiaaaa/robotdemo_2?style=flat)](https://github.com/xingyiaaaa/robotdemo_2)

# 农业机器人控制系统

前后端分离的农业机器人远程控制系统，支持实时监控、远程控制和数据可视化。

## ✨ 项目特点

- 🎯 **前后端分离**: 清晰的架构设计
- 🔄 **实时数据**: 自动轮询更新机器人状态
- 🎮 **远程控制**: 支持方向控制和作业操作
- 📊 **数据可视化**: 直观的仪表盘展示
- 🔌 **硬件对接**: 预留MQTT接口槽位
- 🧪 **完整测试**: 提供Postman测试集合

## 📁 项目结构

```
robotdemo12/
├── frontend/                # 前端项目
│   ├── index.html          # 主页面
│   ├── debug.html          # 调试页面
│   ├── test.html           # 测试页面
│   ├── css/
│   │   └── styles.css      # 样式文件
│   └── js/
│       ├── config.js       # API配置
│       ├── api.js          # API接口层
│       └── app.js          # 应用主逻辑
│
├── backend/                 # 后端项目
│   ├── server.js           # 服务入口
│   ├── package.json        # 依赖配置
│   ├── routes/
│   │   └── robot.js        # API路由
│   ├── controllers/
│   │   └── robotController.js  # 控制器
│   └── data/
│       └── mockData.js     # 模拟数据 (🔌 槽位)
│
├── docs/                    # 文档目录
│   ├── POSTMAN使用指南.md  # Postman测试指南
│   ├── 前端开发指南.md     # 前端开发文档
│   ├── 后端开发指南.md     # 后端开发文档
│   └── MQTT接口文档.md     # MQTT接口规范
│
├── 农业机器人API测试集合.postman_collection.json
├── 农业机器人-本地环境.postman_environment.json
└── README.md               # 本文件
```

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

服务将在 `http://localhost:3000` 启动。

**验证服务**:
```bash
curl http://localhost:3000/api/health
```

### 2. 启动前端

直接用浏览器打开 `frontend/index.html`，或使用静态服务器：

```bash
cd frontend
# 使用Python
python -m http.server 8080
# 或使用Node
npx serve .
```

然后访问 `http://localhost:8080`

### 3. 使用Postman测试（可选）

1. 打开Postman
2. 导入测试集合：
   - `农业机器人API测试集合.postman_collection.json`
   - `农业机器人-本地环境.postman_environment.json`
3. 选择环境 "农业机器人 - 本地开发环境"
4. 开始测试API

详细指南请查看：[docs/POSTMAN使用指南.md](docs/POSTMAN使用指南.md)

## 📊 功能说明

### 机器人控制

- **状态监控**: 电量、速度、温度、GPS坐标
- **传感器数据**: 土壤湿度/温度、光照强度、空气湿度
- **方向控制**: 前进、后退、左转、右转、停止
- **作业操作**: 灌溉、施肥、扫描、收割

### 任务管理

- 任务列表显示
- 实时进度跟踪
- 作业统计分析

### 系统监控

- 连接状态指示
- 实时日志记录
- 操作历史追踪

## 🔌 API接口

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/robot/status` | 获取机器人状态 |
| POST | `/api/robot/control` | 发送控制指令 |
| GET | `/api/sensors` | 获取传感器数据 |
| GET | `/api/tasks` | 获取任务列表 |
| GET | `/api/statistics` | 获取作业统计 |

### 请求示例

```bash
# 获取机器人状态
curl http://localhost:3000/api/robot/status

# 发送移动指令
curl -X POST http://localhost:3000/api/robot/control \
  -H "Content-Type: application/json" \
  -d '{"command": "forward"}'

# 执行作业
curl -X POST http://localhost:3000/api/robot/control \
  -H "Content-Type: application/json" \
  -d '{"action": "irrigation"}'
```

### 响应格式

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1706520000000
}
```

## 🔧 对接真实硬件

后端代码中标记了 `🔌 SLOT` 的位置是需要对接真实硬件的槽位。

### 方式1: 直接修改数据源

修改 `backend/data/mockData.js`：

```javascript
// 🔌 SLOT: 从真实硬件读取
function getRobotStatus() {
    return hardwareDriver.getStatus();
}
```

### 方式2: 使用MQTT协议（推荐）

系统支持MQTT协议与硬件通信。详细说明请查看：[docs/MQTT接口文档.md](docs/MQTT接口文档.md)

**MQTT主题**:
- `robot/status` - 机器人状态数据
- `robot/sensors` - 传感器数据
- `robot/control` - 控制指令（硬件需订阅）
- `robot/tasks` - 任务列表
- `robot/statistics` - 作业统计

## 💻 技术栈

### 前端
- HTML5 + CSS3 + JavaScript
- Fetch API
- BEM命名规范
- 响应式设计

### 后端
- Node.js + Express
- RESTful API
- CORS跨域支持
- Morgan日志中间件
- MQTT协议支持（可选）

## 📚 文档

- [Postman使用指南](docs/POSTMAN使用指南.md) - API测试完整教程
- [前端开发指南](docs/前端开发指南.md) - 前端架构和调试
- [后端开发指南](docs/后端开发指南.md) - 后端API和部署
- [MQTT接口文档](docs/MQTT接口文档.md) - 硬件对接规范

## 🐛 故障排查

### 后端连接失败

```bash
# 检查后端是否运行
netstat -ano | findstr :3000

# 重启后端服务
cd backend
npm start
```

### 前端无法访问

```bash
# 检查前端服务
netstat -ano | findstr :8080

# 使用浏览器直接打开
# 或启动HTTP服务器
cd frontend
python -m http.server 8080
```

### 数据不更新

1. 打开浏览器开发者工具（F12）
2. 查看Console标签页的错误信息
3. 查看Network标签页的API请求
4. 确认后端服务正常运行

更多问题请查看：[docs/前端开发指南.md#问题排查](docs/前端开发指南.md)

## 🎯 开发建议

### 推荐工作流程

1. **启动后端** → 测试API健康检查
2. **使用Postman** → 验证所有API端点
3. **启动前端** → 测试前后端集成
4. **浏览器调试** → 查看实时效果

### 代码规范

- 使用ES6+语法
- 遵循BEM命名规范
- 保持模块化设计
- 添加适当的注释

## 📦 部署说明

### 开发环境
- 后端: `npm start` (端口3000)
- 前端: `python -m http.server 8080` (端口8080)

### 生产环境
- 后端: 使用PM2管理进程
- 前端: 使用Nginx托管静态文件
- 启用HTTPS
- 配置环境变量

详细部署指南请查看：[docs/后端开发指南.md#部署说明](docs/后端开发指南.md)

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请查看文档或联系技术支持。

---

**农业机器人控制系统 v1.0**
