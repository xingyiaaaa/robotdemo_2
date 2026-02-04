# MQTT 数据接口规范

> 供硬件工程师对接使用

## 连接信息

| 配置项 | 值 |
|--------|-----|
| 服务器地址 | `mqtt://localhost:1883` |
| 协议版本 | MQTT 3.1.1 / 5.0 |
| 客户端ID | 自定义（如 `robot-sensor-001`） |
| 用户名 | 可选 |
| 密码 | 可选 |

---

## 主题列表

| 主题 | 方向 | 说明 |
|------|------|------|
| `robot/status` | 硬件 → 服务器 | 机器人状态数据 |
| `robot/sensors` | 硬件 → 服务器 | 传感器数据 |
| `robot/tasks` | 硬件 → 服务器 | 任务列表数据 |
| `robot/statistics` | 硬件 → 服务器 | 作业统计数据 |
| `robot/control` | 服务器 → 硬件 | 控制指令（硬件需订阅） |

---

## 数据格式

### 1. 机器人状态 (`robot/status`)

**推送频率：** 建议 1-2 秒/次

```json
{
    "battery": 85,
    "speed": 1.2,
    "temperature": 28,
    "coordinates": {
        "lat": 40.200,
        "lon": 116.400
    }
}
```

| 字段 | 类型 | 必填 | 范围 | 说明 |
|------|------|------|------|------|
| battery | number | 是 | 0-100 | 电量百分比 |
| speed | number | 是 | 0-10 | 速度 (m/s) |
| temperature | number | 是 | -20~60 | 机器人温度 (°C) |
| coordinates.lat | number | 是 | -90~90 | GPS纬度 |
| coordinates.lon | number | 是 | -180~180 | GPS经度 |

---

### 2. 传感器数据 (`robot/sensors`)

**推送频率：** 建议 2-3 秒/次

```json
{
    "soilHumidity": 65,
    "soilTemp": 22,
    "light": 8000,
    "airHumidity": 55
}
```

| 字段 | 类型 | 必填 | 范围 | 说明 |
|------|------|------|------|------|
| soilHumidity | number | 是 | 0-100 | 土壤湿度 (%) |
| soilTemp | number | 是 | -10~50 | 土壤温度 (°C) |
| light | number | 是 | 0-100000 | 光照强度 (Lux) |
| airHumidity | number | 是 | 0-100 | 空气湿度 (%) |

---

### 3. 任务列表 (`robot/tasks`)

**推送频率：** 任务变化时推送，或 5 秒/次

```json
[
    {
        "id": 1,
        "name": "A区灌溉作业",
        "status": "active",
        "progress": 45
    },
    {
        "id": 2,
        "name": "B区病虫害检测",
        "status": "pending",
        "progress": 0
    }
]
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 任务唯一标识 |
| name | string | 是 | 任务名称 |
| status | string | 是 | `active`(进行中) / `pending`(等待) / `done`(完成) |
| progress | number | 是 | 进度 0-100 |

---

### 4. 作业统计 (`robot/statistics`)

**推送频率：** 建议 5-10 秒/次

```json
{
    "completedArea": 12.5,
    "totalArea": 38.2,
    "progress": 32.7
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| completedArea | number | 是 | 已完成面积 (亩) |
| totalArea | number | 是 | 总面积 (亩) |
| progress | number | 是 | 完成进度 (%) |

---

### 5. 控制指令 (`robot/control`)

**方向：** 服务器 → 硬件（硬件需订阅此主题）

**方向控制指令：**
```json
{
    "type": "command",
    "command": "forward"
}
```

| command 值 | 说明 |
|------------|------|
| forward | 前进 |
| backward | 后退 |
| left | 左转 |
| right | 右转 |
| stop | 停止 |

**作业控制指令：**
```json
{
    "type": "action",
    "action": "irrigation"
}
```

| action 值 | 说明 |
|-----------|------|
| irrigation | 灌溉 |
| fertilize | 施肥 |
| scan | 扫描 |
| harvest | 收割 |

---

## 示例代码

### Python 示例（硬件端推送数据）

```python
import paho.mqtt.client as mqtt
import json
import time

# 连接 MQTT 服务器
client = mqtt.Client(client_id="robot-sensor-001")
client.connect("localhost", 1883, 60)

# 推送机器人状态
def publish_status():
    data = {
        "battery": 85,
        "speed": 1.2,
        "temperature": 28,
        "coordinates": {"lat": 40.200, "lon": 116.400}
    }
    client.publish("robot/status", json.dumps(data))

# 推送传感器数据
def publish_sensors():
    data = {
        "soilHumidity": 65,
        "soilTemp": 22,
        "light": 8000,
        "airHumidity": 55
    }
    client.publish("robot/sensors", json.dumps(data))

# 订阅控制指令
def on_message(client, userdata, msg):
    command = json.loads(msg.payload)
    print(f"收到指令: {command}")
    # 执行相应操作...

client.subscribe("robot/control")
client.on_message = on_message

# 启动循环
client.loop_start()

while True:
    publish_status()
    publish_sensors()
    time.sleep(2)
```

### Arduino/ESP32 示例

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

const char* mqtt_server = "192.168.1.100";
WiFiClient espClient;
PubSubClient client(espClient);

void publishStatus() {
    StaticJsonDocument<200> doc;
    doc["battery"] = 85;
    doc["speed"] = 1.2;
    doc["temperature"] = 28;
    doc["coordinates"]["lat"] = 40.200;
    doc["coordinates"]["lon"] = 116.400;
    
    char buffer[200];
    serializeJson(doc, buffer);
    client.publish("robot/status", buffer);
}

void publishSensors() {
    StaticJsonDocument<200> doc;
    doc["soilHumidity"] = analogRead(A0) / 10.24;  // 转换为百分比
    doc["soilTemp"] = 22;
    doc["light"] = analogRead(A1);
    doc["airHumidity"] = 55;
    
    char buffer[200];
    serializeJson(doc, buffer);
    client.publish("robot/sensors", buffer);
}

void callback(char* topic, byte* payload, unsigned int length) {
    // 处理控制指令
    StaticJsonDocument<100> doc;
    deserializeJson(doc, payload, length);
    
    if (doc.containsKey("command")) {
        String cmd = doc["command"];
        // 执行方向控制...
    }
}

void setup() {
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
    client.subscribe("robot/control");
}

void loop() {
    client.loop();
    publishStatus();
    publishSensors();
    delay(2000);
}
```

---

## 测试方法

### 使用 MQTTX 客户端测试

1. 下载 [MQTTX](https://mqttx.app/)
2. 连接到 `mqtt://localhost:1883`
3. 订阅 `robot/#` 查看所有消息
4. 发布测试数据到 `robot/status`

### 使用命令行测试

```bash
# 安装 mosquitto 客户端
# Ubuntu: sudo apt install mosquitto-clients
# Mac: brew install mosquitto

# 订阅所有主题（查看硬件推送的数据）
mosquitto_sub -h localhost -t "robot/#" -v

# 发布测试数据
mosquitto_pub -h localhost -t "robot/status" -m '{"battery":85,"speed":1.2,"temperature":28,"coordinates":{"lat":40.2,"lon":116.4}}'
```

---

## 常见问题

### Q: 需要安装 MQTT 服务器吗？
A: 是的，推荐使用 [Mosquitto](https://mosquitto.org/)：
```bash
# Ubuntu
sudo apt install mosquitto mosquitto-clients

# Windows
# 下载安装包：https://mosquitto.org/download/

# Mac
brew install mosquitto
```

### Q: 字段名必须和文档一致吗？
A: 是的，请严格使用文档中定义的字段名（如 `soilHumidity` 而非 `soil_humidity`）。

### Q: 数据推送频率有要求吗？
A: 建议状态数据 1-2 秒/次，传感器 2-3 秒/次，统计数据 5-10 秒/次。

---

## 联系方式

如有问题，请联系后端开发人员。
