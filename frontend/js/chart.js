/**
 * 数据可视化图表模块
 * 
 * 功能描述:
 * - 使用 Chart.js 绑制传感器历史数据曲线
 * - 显示电量变化趋势
 * - 实时更新图表数据
 * 
 * 文件路径: frontend/js/chart.js
 */

'use strict';

// ============================================================
// 图表服务模块
// ============================================================

const ChartService = {
    // 图表实例
    charts: {
        battery: null,
        sensors: null
    },
    
    // 历史数据缓存
    history: {
        labels: [],           // 时间标签
        battery: [],          // 电量历史
        soilHumidity: [],     // 土壤湿度历史
        temperature: [],      // 温度历史
        light: []             // 光照历史
    },
    
    // 配置
    config: {
        maxDataPoints: 20,    // 最多显示的数据点数
        updateInterval: 3000  // 更新间隔 (毫秒)
    },
    
    /**
     * 初始化所有图表
     */
    init() {
        this.initBatteryChart();
        this.initSensorChart();
        console.log('✅ 图表服务初始化完成');
    },
    
    /**
     * 初始化电量趋势图
     */
    initBatteryChart() {
        const ctx = document.getElementById('batteryChart');
        if (!ctx) return;
        
        this.charts.battery = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.labels,
                datasets: [{
                    label: '电量 (%)',
                    data: this.history.battery,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: '电量趋势',
                        color: '#e0e0e0',
                        font: { size: 14 }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: { color: '#888', maxTicksLimit: 5 },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        display: true,
                        min: 0,
                        max: 100,
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    },
    
    /**
     * 初始化传感器数据图表
     */
    initSensorChart() {
        const ctx = document.getElementById('sensorChart');
        if (!ctx) return;
        
        this.charts.sensors = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.labels,
                datasets: [
                    {
                        label: '土壤湿度 (%)',
                        data: this.history.soilHumidity,
                        borderColor: '#2196F3',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 2
                    },
                    {
                        label: '温度 (°C)',
                        data: this.history.temperature,
                        borderColor: '#FF9800',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 2
                    },
                    {
                        label: '光照 (÷100 Lux)',
                        data: this.history.light,
                        borderColor: '#FFEB3B',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#e0e0e0', boxWidth: 12, padding: 8 }
                    },
                    title: {
                        display: true,
                        text: '传感器数据趋势',
                        color: '#e0e0e0',
                        font: { size: 14 }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: { color: '#888', maxTicksLimit: 5 },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        display: true,
                        ticks: { color: '#888' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    },
    
    /**
     * 更新图表数据
     * @param {Object} robotData - 机器人状态数据
     * @param {Object} sensorData - 传感器数据
     */
    update(robotData, sensorData) {
        // 生成时间标签
        const time = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 添加新数据
        this.history.labels.push(time);
        this.history.battery.push(robotData.battery || 0);
        this.history.soilHumidity.push(sensorData.soilHumidity || 0);
        this.history.temperature.push(sensorData.soilTemp || 0);
        this.history.light.push((sensorData.light || 0) / 100); // 缩放光照值
        
        // 限制数据点数量
        if (this.history.labels.length > this.config.maxDataPoints) {
            this.history.labels.shift();
            this.history.battery.shift();
            this.history.soilHumidity.shift();
            this.history.temperature.shift();
            this.history.light.shift();
        }
        
        // 更新图表
        if (this.charts.battery) {
            this.charts.battery.update('none');
        }
        if (this.charts.sensors) {
            this.charts.sensors.update('none');
        }
    },
    
    /**
     * 销毁所有图表
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = { battery: null, sensors: null };
    }
};

// 导出到全局
window.ChartService = ChartService;
