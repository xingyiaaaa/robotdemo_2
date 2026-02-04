/**
 * 告警系统模块
 * 
 * 功能描述:
 * - 监控机器人状态和传感器数据
 * - 检测异常情况并触发告警
 * - 显示告警通知
 * 
 * 告警规则:
 * - 电量低于 20% 触发低电量告警
 * - 温度高于 40°C 触发高温告警
 * - 连接断开触发断连告警
 * - 土壤湿度低于 30% 触发干旱告警
 * 
 * 文件路径: frontend/js/alert.js
 */

'use strict';

// ============================================================
// 告警服务模块
// ============================================================

const AlertService = {
    // 告警规则配置
    rules: {
        lowBattery: {
            enabled: true,
            threshold: 20,
            message: '电量过低',
            level: 'critical',
            field: 'battery',
            condition: 'below'
        },
        highTemperature: {
            enabled: true,
            threshold: 40,
            message: '温度过高',
            level: 'warning',
            field: 'temperature',
            condition: 'above'
        },
        lowSoilHumidity: {
            enabled: true,
            threshold: 30,
            message: '土壤湿度过低',
            level: 'warning',
            field: 'soilHumidity',
            condition: 'below'
        },
        highSoilHumidity: {
            enabled: true,
            threshold: 90,
            message: '土壤湿度过高',
            level: 'info',
            field: 'soilHumidity',
            condition: 'above'
        },
        lowLight: {
            enabled: true,
            threshold: 1000,
            message: '光照不足',
            level: 'info',
            field: 'light',
            condition: 'below'
        }
    },
    
    // 当前活跃的告警
    activeAlerts: new Map(),
    
    // 告警历史
    alertHistory: [],
    
    // 配置
    config: {
        maxHistory: 50,           // 最大历史记录数
        alertCooldown: 30000,     // 同类告警冷却时间 (毫秒)
        soundEnabled: true        // 是否启用告警声音
    },
    
    /**
     * 初始化告警服务
     */
    init() {
        this.createAlertContainer();
        console.log('✅ 告警服务初始化完成');
    },
    
    /**
     * 创建告警容器
     */
    createAlertContainer() {
        if (document.getElementById('alertContainer')) return;
        
        const container = document.createElement('div');
        container.id = 'alertContainer';
        container.className = 'alert-container';
        document.body.appendChild(container);
    },
    
    /**
     * 检查数据并触发告警
     * @param {Object} robotData - 机器人状态数据
     * @param {Object} sensorData - 传感器数据
     */
    check(robotData, sensorData) {
        const allData = { ...robotData, ...sensorData };
        
        Object.entries(this.rules).forEach(([ruleId, rule]) => {
            if (!rule.enabled) return;
            
            const value = allData[rule.field];
            if (value === undefined) return;
            
            let triggered = false;
            
            if (rule.condition === 'below' && value < rule.threshold) {
                triggered = true;
            } else if (rule.condition === 'above' && value > rule.threshold) {
                triggered = true;
            }
            
            if (triggered) {
                this.trigger(ruleId, rule, value);
            } else {
                this.resolve(ruleId);
            }
        });
    },
    
    /**
     * 触发告警
     * @param {string} ruleId - 规则ID
     * @param {Object} rule - 规则配置
     * @param {number} value - 当前值
     */
    trigger(ruleId, rule, value) {
        const now = Date.now();
        const existing = this.activeAlerts.get(ruleId);
        
        // 检查冷却时间
        if (existing && (now - existing.time) < this.config.alertCooldown) {
            return;
        }
        
        const alert = {
            id: ruleId,
            message: `${rule.message}: ${value}${this.getUnit(rule.field)}`,
            level: rule.level,
            time: now,
            value: value
        };
        
        this.activeAlerts.set(ruleId, alert);
        this.addToHistory(alert);
        this.showNotification(alert);
        this.updateAlertPanel();
        
        // 播放告警声音
        if (this.config.soundEnabled && rule.level === 'critical') {
            this.playAlertSound();
        }
        
        console.warn(`[告警] ${alert.message}`);
    },
    
    /**
     * 解除告警
     * @param {string} ruleId - 规则ID
     */
    resolve(ruleId) {
        if (this.activeAlerts.has(ruleId)) {
            this.activeAlerts.delete(ruleId);
            this.updateAlertPanel();
        }
    },
    
    /**
     * 获取字段单位
     * @param {string} field - 字段名
     * @returns {string} 单位
     */
    getUnit(field) {
        const units = {
            battery: '%',
            temperature: '°C',
            soilHumidity: '%',
            soilTemp: '°C',
            light: ' Lux',
            airHumidity: '%'
        };
        return units[field] || '';
    },
    
    /**
     * 添加到历史记录
     * @param {Object} alert - 告警对象
     */
    addToHistory(alert) {
        this.alertHistory.unshift({
            ...alert,
            timeStr: new Date(alert.time).toLocaleTimeString('zh-CN')
        });
        
        if (this.alertHistory.length > this.config.maxHistory) {
            this.alertHistory.pop();
        }
    },
    
    /**
     * 显示告警通知
     * @param {Object} alert - 告警对象
     */
    showNotification(alert) {
        const container = document.getElementById('alertContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `alert-notification alert-notification--${alert.level}`;
        notification.innerHTML = `
            <span class="alert-notification__icon">${this.getIcon(alert.level)}</span>
            <span class="alert-notification__message">${alert.message}</span>
            <button class="alert-notification__close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(notification);
        
        // 自动消失
        setTimeout(() => {
            notification.classList.add('alert-notification--fade');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    },
    
    /**
     * 获取告警图标
     * @param {string} level - 告警级别
     * @returns {string} 图标
     */
    getIcon(level) {
        const icons = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[level] || '📢';
    },
    
    /**
     * 更新告警面板
     */
    updateAlertPanel() {
        const panel = document.getElementById('alertList');
        if (!panel) return;
        
        if (this.activeAlerts.size === 0) {
            panel.innerHTML = '<li class="alert-list__item alert-list__item--empty">暂无告警</li>';
            return;
        }
        
        panel.innerHTML = Array.from(this.activeAlerts.values())
            .map(alert => `
                <li class="alert-list__item alert-list__item--${alert.level}">
                    <span class="alert-list__icon">${this.getIcon(alert.level)}</span>
                    <span class="alert-list__message">${alert.message}</span>
                    <span class="alert-list__time">${new Date(alert.time).toLocaleTimeString('zh-CN')}</span>
                </li>
            `).join('');
    },
    
    /**
     * 播放告警声音
     */
    playAlertSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRc4nL2vkG8pLnG41NKSUxQhfbbNwI9GEy16xM+BPQY2ksq/hD4HIH/DxHk3BiySyrl6MgIZdsC8azECEW67t2YqAAt0t7RfIwAHbLOwWR0ABGmvrVUZAABmq6pSFQAAZKeoUBMAAGGlpU4RAABfoqNMDwAAXaCgSg0AAFqdnkgLAABYm5xGCQAAVpmaSAcAAFSXmEYFAABSlZZEAwAAUJOUQgEA');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {
            // 忽略音频播放错误
        }
    },
    
    /**
     * 检查连接状态
     * @param {boolean} connected - 是否连接
     */
    checkConnection(connected) {
        if (!connected) {
            this.trigger('disconnected', {
                message: '与服务器断开连接',
                level: 'critical',
                field: 'connection'
            }, '离线');
        } else {
            this.resolve('disconnected');
        }
    },
    
    /**
     * 获取活跃告警数量
     * @returns {number} 告警数量
     */
    getActiveCount() {
        return this.activeAlerts.size;
    },
    
    /**
     * 清除所有告警
     */
    clearAll() {
        this.activeAlerts.clear();
        this.updateAlertPanel();
    }
};

// 导出到全局
window.AlertService = AlertService;
