# API 接口测试脚本
# 使用方法: 在 Git Bash 或 Linux/Mac 终端运行
# 需要先启动服务器: cd backend && npm start

BASE_URL="http://localhost:3000/api"

echo "========================================"
echo "API 接口测试"
echo "========================================"
echo ""

# 测试1: 健康检查
echo "📌 测试1: 健康检查"
curl -X GET $BASE_URL/health
echo -e "\n"

# 测试2: 获取传感器数据
echo "📌 测试2: 获取传感器数据"
curl -X GET $BASE_URL/sensors
echo -e "\n"

# 测试3: 更新传感器数据
echo "📌 测试3: 更新传感器数据 (土壤湿度=80)"
curl -X POST $BASE_URL/sensors \
  -H "Content-Type: application/json" \
  -d '{"soilHumidity": 80}'
echo -e "\n"

# 测试4: 再次获取传感器数据验证
echo "📌 测试4: 验证传感器数据已更新"
curl -X GET $BASE_URL/sensors
echo -e "\n"

# 测试5: 获取机器人状态
echo "📌 测试5: 获取机器人状态"
curl -X GET $BASE_URL/robot/status
echo -e "\n"

# 测试6: 更新机器人状态
echo "📌 测试6: 更新机器人状态 (电量=50)"
curl -X POST $BASE_URL/robot/status \
  -H "Content-Type: application/json" \
  -d '{"battery": 50}'
echo -e "\n"

# 测试7: 获取任务列表
echo "📌 测试7: 获取任务列表"
curl -X GET $BASE_URL/tasks
echo -e "\n"

# 测试8: 创建新任务
echo "📌 测试8: 创建新任务"
curl -X POST $BASE_URL/tasks \
  -H "Content-Type: application/json" \
  -d '{"name": "测试任务", "status": "pending"}'
echo -e "\n"

# 测试9: 更新任务
echo "📌 测试9: 更新任务 #1"
curl -X PUT $BASE_URL/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"progress": 75}'
echo -e "\n"

# 测试10: 获取统计数据
echo "📌 测试10: 获取统计数据"
curl -X GET $BASE_URL/statistics
echo -e "\n"

# 测试11: 更新统计数据
echo "📌 测试11: 更新统计数据"
curl -X POST $BASE_URL/statistics \
  -H "Content-Type: application/json" \
  -d '{"completedArea": 25.0}'
echo -e "\n"

# 测试12: 发送控制指令
echo "📌 测试12: 发送控制指令 (前进)"
curl -X POST $BASE_URL/robot/control \
  -H "Content-Type: application/json" \
  -d '{"command": "forward"}'
echo -e "\n"

echo "========================================"
echo "测试完成！"
echo "========================================"
