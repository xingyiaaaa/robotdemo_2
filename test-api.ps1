# API 接口测试脚本 (PowerShell版本)
# 使用方法: 在 PowerShell 中运行此脚本
# 需要先启动服务器: cd backend; npm start

$baseUrl = "http://localhost:3000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API 接口测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试1: 健康检查
Write-Host "📌 测试1: 健康检查" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/health" -Method Get | ConvertTo-Json
Write-Host ""

# 测试2: 获取传感器数据
Write-Host "📌 测试2: 获取传感器数据" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/sensors" -Method Get | ConvertTo-Json
Write-Host ""

# 测试3: 更新传感器数据
Write-Host "📌 测试3: 更新传感器数据 (土壤湿度=80)" -ForegroundColor Green
$body = @{
    soilHumidity = 80
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/sensors" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

# 测试4: 再次获取传感器数据验证
Write-Host "📌 测试4: 验证传感器数据已更新" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/sensors" -Method Get | ConvertTo-Json
Write-Host ""

# 测试5: 获取机器人状态
Write-Host "📌 测试5: 获取机器人状态" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/robot/status" -Method Get | ConvertTo-Json
Write-Host ""

# 测试6: 更新机器人状态
Write-Host "📌 测试6: 更新机器人状态 (电量=50)" -ForegroundColor Green
$body = @{
    battery = 50
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/robot/status" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

# 测试7: 获取任务列表
Write-Host "📌 测试7: 获取任务列表" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Get | ConvertTo-Json
Write-Host ""

# 测试8: 创建新任务
Write-Host "📌 测试8: 创建新任务" -ForegroundColor Green
$body = @{
    name = "测试任务"
    status = "pending"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

# 测试9: 更新任务
Write-Host "📌 测试9: 更新任务 #1" -ForegroundColor Green
$body = @{
    progress = 75
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/tasks/1" -Method Put -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

# 测试10: 获取统计数据
Write-Host "📌 测试10: 获取统计数据" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/statistics" -Method Get | ConvertTo-Json
Write-Host ""

# 测试11: 更新统计数据
Write-Host "📌 测试11: 更新统计数据" -ForegroundColor Green
$body = @{
    completedArea = 25.0
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/statistics" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

# 测试12: 发送控制指令
Write-Host "📌 测试12: 发送控制指令 (前进)" -ForegroundColor Green
$body = @{
    command = "forward"
} | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUrl/robot/control" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
