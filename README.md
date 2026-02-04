[![GitHub repo size](https://img.shields.io/github/repo-size/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub last commit](https://img.shields.io/github/last-commit/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub stars](https://img.shields.io/github/stars/xingyiaaaa/robotdemo_2?style=flat)](https://github.com/xingyiaaaa/robotdemo_2)

# 农业机器人控制系统

前后端分离的农业机器人远程控制系统，支持实时监控、远程控制和数据可视化。

**项目特点**
- 前后端分离，结构清晰，易维护
- 实时数据轮询刷新
- 方向控制与作业操作
- 数据图表与告警提示
- 预留硬件对接接口（MQTT 等）
- 提供 Postman 测试集合

**项目结构**
```
robotdemo13/
├── backend/                 # 后端项目
│   ├── server.js            # 服务入口
│   ├── routes/              # API 路由
│   ├── controllers/         # 控制器
│   └── data/                # 数据层（mock/真实数据源）
├── frontend/                # 前端项目
│   ├── index.html           # 主页面
│   ├── css/                 # 样式
│   └── js/                  # 前端逻辑
├── docs/                    # 文档目录
├── pmtest/                  # Postman 集合与环境
├── test-api.ps1             # Windows 测试脚本
├── test-api.sh              # Linux/Mac 测试脚本
└── README.md
```

**快速启动**
1. 启动后端服务
```bash
cd backend
npm install
npm start
```
后端地址: `http://localhost:3000`

2. 启动前端
```bash
cd frontend
python -m http.server 8080
```
前端地址: `http://localhost:8080`

**API 概览**
- `GET /api/health` 健康检查
- `GET /api/robot/status` 获取机器人状态
- `POST /api/robot/status` 更新机器人状态
- `POST /api/robot/control` 发送控制指令
- `GET /api/sensors` 获取传感器数据
- `POST /api/sensors` 更新传感器数据
- `GET /api/tasks` 获取任务列表
- `POST /api/tasks` 创建任务
- `PUT /api/tasks/:id` 更新任务
- `DELETE /api/tasks/:id` 删除任务
- `GET /api/statistics` 获取作业统计
- `POST /api/statistics` 更新作业统计

**文档**
- `docs/README.md` 文档索引
- `docs/POSTMAN使用指南.md` Postman 使用指南
- `docs/前端开发指南.md` 前端开发指南
- `docs/后端开发指南.md` 后端开发指南
- `docs/MQTT接口文档.md` MQTT 接口文档

**许可证**
MIT License
