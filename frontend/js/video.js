/**
 * 视频监控模块
 * 
 * 功能描述:
 * - 支持多种视频源（RTSP、HLS、WebRTC、图片流、本地USB摄像头）
 * - 自动重连机制
 * - 全屏播放支持
 * 
 * 支持的视频源类型:
 * - local: 本地USB摄像头（使用getUserMedia API）
 * - image: 图片刷新模式（最简单，适合低帧率）
 * - hls: HLS流（需要HLS.js库）
 * - webrtc: WebRTC流（需要信令服务器）
 * - mjpeg: MJPEG流（直接img标签）
 * 
 * 文件路径: frontend/js/video.js
 */

'use strict';

// ============================================================
// 视频服务模块
// ============================================================

const VideoService = {
    // 配置
    config: {
        // 视频源类型: 'image' | 'hls' | 'mjpeg' | 'demo' | 'local'
        type: 'local',
        
        // 本地USB摄像头配置
        local: {
            deviceId: null, // 指定设备ID，null为默认
            width: 1280,
            height: 720
        },

        // 图片刷新模式配置
        image: {
            url: 'http://192.168.1.100:8080/snapshot',
            refreshInterval: 100  // 刷新间隔 (毫秒)
        },
        
        // HLS流配置
        hls: {
            url: 'http://192.168.1.100:8080/stream.m3u8'
        },
        
        // MJPEG流配置
        mjpeg: {
            url: 'http://192.168.1.100:8080/video'
        },
        
        // WebRTC配置
        webrtc: {
            signalServer: 'ws://192.168.1.100:8080/webrtc'
        }
    },
    
    // 状态
    state: {
        isPlaying: false,
        isFullscreen: false,
        refreshTimer: null,
        retryCount: 0,
        maxRetries: 5
    },
    
    // DOM 元素
    elements: {
        container: null,
        video: null,
        image: null,
        overlay: null
    },
    
    /**
     * 初始化视频服务
     */
    init() {
        this.elements.container = document.getElementById('videoView');
        if (!this.elements.container) {
            console.warn('[Video] 未找到视频容器元素');
            return;
        }
        
        this.createVideoElements();
        this.bindEvents();
        this.start();
        
        console.log('✅ 视频服务初始化完成');
    },
    
    /**
     * 创建视频元素
     */
    createVideoElements() {
        const container = this.elements.container;
        
        // 清空占位符内容
        const placeholder = container.querySelector('.video-view__placeholder');
        if (placeholder) {
            placeholder.innerHTML = '';
        }
        
        // 创建视频/图片元素
        if (this.config.type === 'hls' || this.config.type === 'webrtc' || this.config.type === 'local') {
            const video = document.createElement('video');
            video.id = 'videoPlayer';
            video.className = 'video-player';
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            if (placeholder) placeholder.appendChild(video);
            this.elements.video = video;
        } else {
            const img = document.createElement('img');
            img.id = 'videoImage';
            img.className = 'video-image';
            img.alt = '视频画面';
            if (placeholder) placeholder.appendChild(img);
            this.elements.image = img;
        }
        
        // 创建控制栏
        this.createControls();
    },
    
    /**
     * 创建控制栏
     */
    createControls() {
        const container = this.elements.container;
        
        // 检查是否已存在控制栏
        if (container.querySelector('.video-controls')) return;
        
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        controls.innerHTML = `
            <button class="video-controls__btn" id="videoPlayBtn" title="播放/暂停">
                <span id="videoPlayIcon">▶</span>
            </button>
            <button class="video-controls__btn" id="videoRefreshBtn" title="刷新">
                🔄
            </button>
            <button class="video-controls__btn" id="videoFullscreenBtn" title="全屏">
                ⛶
            </button>
            <span class="video-controls__status" id="videoStatus">准备就绪</span>
        `;
        
        container.appendChild(controls);
    },
    
    /**
     * 绑定事件
     */
    bindEvents() {
        const playBtn = document.getElementById('videoPlayBtn');
        const refreshBtn = document.getElementById('videoRefreshBtn');
        const fullscreenBtn = document.getElementById('videoFullscreenBtn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // 图片加载错误处理
        if (this.elements.image) {
            this.elements.image.addEventListener('error', () => this.handleError());
            this.elements.image.addEventListener('load', () => this.handleLoad());
        }
        
        // 视频错误处理
        if (this.elements.video) {
            this.elements.video.addEventListener('error', () => this.handleError());
            this.elements.video.addEventListener('playing', () => this.handleLoad());
        }
    },
    
    /**
     * 开始播放
     */
    start() {
        this.updateStatus('连接中...');
        
        switch (this.config.type) {
            case 'demo':
                this.startDemo();
                break;
            case 'image':
                this.startImageRefresh();
                break;
            case 'mjpeg':
                this.startMjpeg();
                break;
            case 'hls':
                this.startHls();
                break;
            case 'webrtc':
                this.startWebRTC();
                break;
            case 'local':
                this.startLocal();
                break;
            default:
                this.startDemo();
        }
    },
    
    /**
     * 演示模式 - 显示模拟画面
     */
    startDemo() {
        const img = this.elements.image;
        if (!img) return;
        
        // 创建模拟画面
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        
        const updateDemo = () => {
            // 绘制背景
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制网格
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // 绘制时间戳
            ctx.fillStyle = '#4CAF50';
            ctx.font = '14px monospace';
            ctx.fillText(new Date().toLocaleString('zh-CN'), 10, 25);
            
            // 绘制状态信息
            ctx.fillStyle = '#fff';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📹 视频监控演示模式', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = '#888';
            ctx.fillText('配置真实摄像头地址后显示实时画面', canvas.width / 2, canvas.height / 2 + 20);
            
            // 绘制模拟移动目标
            const time = Date.now() / 1000;
            const x = canvas.width / 2 + Math.sin(time) * 100;
            const y = canvas.height / 2 + 60 + Math.cos(time * 0.7) * 30;
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '12px sans-serif';
            ctx.fillText('🤖', x - 8, y + 5);
            
            // 更新图片
            img.src = canvas.toDataURL();
        };
        
        updateDemo();
        this.state.refreshTimer = setInterval(updateDemo, 100);
        this.state.isPlaying = true;
        this.updateStatus('演示模式');
        this.updatePlayButton();
    },
    
    /**
     * 图片刷新模式
     */
    startImageRefresh() {
        const img = this.elements.image;
        if (!img) return;
        
        const refresh = () => {
            // 添加时间戳防止缓存
            img.src = `${this.config.image.url}?t=${Date.now()}`;
        };
        
        refresh();
        this.state.refreshTimer = setInterval(refresh, this.config.image.refreshInterval);
        this.state.isPlaying = true;
        this.updatePlayButton();
    },
    
    /**
     * MJPEG流模式
     */
    startMjpeg() {
        const img = this.elements.image;
        if (!img) return;
        
        img.src = this.config.mjpeg.url;
        this.state.isPlaying = true;
        this.updatePlayButton();
    },
    
    /**
     * HLS流模式
     */
    startHls() {
        const video = this.elements.video;
        if (!video) return;
        
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(this.config.hls.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
                this.state.isPlaying = true;
                this.updateStatus('播放中');
                this.updatePlayButton();
            });
            hls.on(Hls.Events.ERROR, () => this.handleError());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari 原生支持 HLS
            video.src = this.config.hls.url;
            video.play();
        } else {
            this.updateStatus('浏览器不支持HLS');
        }
    },
    
    /**
     * WebRTC模式
     */
    startWebRTC() {
        this.updateStatus('WebRTC需要配置信令服务器');
        // WebRTC 实现需要信令服务器，这里仅作预留
    },
    
    /**
     * 本地USB摄像头模式
     * 使用 getUserMedia API 访问本地摄像头
     */
    async startLocal() {
        const video = this.elements.video;
        if (!video) {
            console.error('[Video] 未找到视频元素');
            this.updateStatus('视频元素未初始化');
            return;
        }
        
        // 检查浏览器是否支持 getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.updateStatus('浏览器不支持摄像头访问');
            console.error('[Video] 浏览器不支持 getUserMedia API');
            return;
        }
        
        try {
            this.updateStatus('请求摄像头权限...');
            
            // 构建媒体约束
            const constraints = {
                video: {
                    width: { ideal: this.config.local.width },
                    height: { ideal: this.config.local.height }
                },
                audio: false
            };
            
            // 如果指定了设备ID，使用该设备
            if (this.config.local.deviceId) {
                constraints.video.deviceId = { exact: this.config.local.deviceId };
            }
            
            // 请求摄像头权限并获取视频流
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // 保存流引用以便后续停止
            this.state.localStream = stream;
            
            // 将流绑定到视频元素
            video.srcObject = stream;
            await video.play();
            
            this.state.isPlaying = true;
            this.updateStatus('摄像头已连接');
            this.updatePlayButton();
            
            console.log('[Video] 本地摄像头已启动');
            
            // 列出可用摄像头设备
            this.listCameras();
            
        } catch (error) {
            console.error('[Video] 摄像头访问失败:', error);
            
            if (error.name === 'NotAllowedError') {
                this.updateStatus('摄像头权限被拒绝');
            } else if (error.name === 'NotFoundError') {
                this.updateStatus('未检测到摄像头');
            } else if (error.name === 'NotReadableError') {
                this.updateStatus('摄像头被占用');
            } else {
                this.updateStatus('摄像头连接失败');
            }
            
            this.handleError();
        }
    },
    
    /**
     * 列出所有可用摄像头
     */
    async listCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log('[Video] 可用摄像头列表:');
            cameras.forEach((camera, index) => {
                console.log(`  ${index + 1}. ${camera.label || '未命名摄像头'} (ID: ${camera.deviceId})`);
            });
            
            return cameras;
        } catch (error) {
            console.error('[Video] 获取设备列表失败:', error);
            return [];
        }
    },
    
    /**
     * 切换到指定摄像头
     * @param {string} deviceId - 摄像头设备ID
     */
    async switchCamera(deviceId) {
        this.config.local.deviceId = deviceId;
        this.stop();
        setTimeout(() => this.startLocal(), 500);
    },
    
    /**
     * 停止播放
     */
    stop() {
        // 停止本地摄像头流
        if (this.state.localStream) {
            this.state.localStream.getTracks().forEach(track => track.stop());
            this.state.localStream = null;
        }
        if (this.state.refreshTimer) {
            clearInterval(this.state.refreshTimer);
            this.state.refreshTimer = null;
        }
        
        if (this.elements.video) {
            this.elements.video.pause();
        }
        
        this.state.isPlaying = false;
        this.updatePlayButton();
        this.updateStatus('已停止');
    },
    
    /**
     * 切换播放/暂停
     */
    togglePlay() {
        if (this.state.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    },
    
    /**
     * 刷新视频
     */
    refresh() {
        this.stop();
        this.state.retryCount = 0;
        setTimeout(() => this.start(), 500);
    },
    
    /**
     * 切换全屏
     */
    toggleFullscreen() {
        const container = this.elements.container;
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.warn('[Video] 全屏请求失败:', err);
            });
            this.state.isFullscreen = true;
        } else {
            document.exitFullscreen();
            this.state.isFullscreen = false;
        }
    },
    
    /**
     * 处理加载成功
     */
    handleLoad() {
        this.state.retryCount = 0;
        this.updateStatus('播放中');
    },
    
    /**
     * 处理错误
     */
    handleError() {
        this.state.retryCount++;
        
        if (this.state.retryCount < this.state.maxRetries) {
            this.updateStatus(`重连中 (${this.state.retryCount}/${this.state.maxRetries})...`);
            setTimeout(() => this.start(), 2000);
        } else {
            this.updateStatus('连接失败');
            this.stop();
        }
    },
    
    /**
     * 更新播放按钮状态
     */
    updatePlayButton() {
        const icon = document.getElementById('videoPlayIcon');
        if (icon) {
            icon.textContent = this.state.isPlaying ? '⏸' : '▶';
        }
    },
    
    /**
     * 更新状态显示
     * @param {string} status - 状态文本
     */
    updateStatus(status) {
        const statusEl = document.getElementById('videoStatus');
        if (statusEl) {
            statusEl.textContent = status;
        }
    },
    
    /**
     * 设置视频源
     * @param {string} type - 类型
     * @param {string} url - URL地址
     */
    setSource(type, url) {
        this.stop();
        this.config.type = type;
        
        if (type === 'image') {
            this.config.image.url = url;
        } else if (type === 'mjpeg') {
            this.config.mjpeg.url = url;
        } else if (type === 'hls') {
            this.config.hls.url = url;
        }
        
        this.start();
    },
    
    /**
     * 销毁视频服务
     */
    destroy() {
        this.stop();
        this.elements = { container: null, video: null, image: null, overlay: null };
    }
};

// 导出到全局
window.VideoService = VideoService;
