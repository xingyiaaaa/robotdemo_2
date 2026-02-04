[![GitHub repo size](https://img.shields.io/github/repo-size/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub last commit](https://img.shields.io/github/last-commit/xingyiaaaa/robotdemo_2)](https://github.com/xingyiaaaa/robotdemo_2) [![GitHub stars](https://img.shields.io/github/stars/xingyiaaaa/robotdemo_2?style=flat)](https://github.com/xingyiaaaa/robotdemo_2)

# 鍐滀笟鏈哄櫒浜烘帶鍒剁郴缁?
鍓嶅悗绔垎绂荤殑鍐滀笟鏈哄櫒浜鸿繙绋嬫帶鍒剁郴缁燂紝鏀寔瀹炴椂鐩戞帶銆佽繙绋嬫帶鍒跺拰鏁版嵁鍙鍖栥€?
## 鉁?椤圭洰鐗圭偣

- 馃幆 **鍓嶅悗绔垎绂?*: 娓呮櫚鐨勬灦鏋勮璁?- 馃攧 **瀹炴椂鏁版嵁**: 鑷姩杞鏇存柊鏈哄櫒浜虹姸鎬?- 馃幃 **杩滅▼鎺у埗**: 鏀寔鏂瑰悜鎺у埗鍜屼綔涓氭搷浣?- 馃搳 **鏁版嵁鍙鍖?*: 鐩磋鐨勪华琛ㄧ洏灞曠ず
- 馃攲 **纭欢瀵规帴**: 棰勭暀MQTT鎺ュ彛妲戒綅
- 馃И **瀹屾暣娴嬭瘯**: 鎻愪緵Postman娴嬭瘯闆嗗悎

## 馃搧 椤圭洰缁撴瀯

```
robotdemo12/
鈹溾攢鈹€ frontend/                # 鍓嶇椤圭洰
鈹?  鈹溾攢鈹€ index.html          # 涓婚〉闈?鈹?  鈹溾攢鈹€ debug.html          # 璋冭瘯椤甸潰
鈹?  鈹溾攢鈹€ test.html           # 娴嬭瘯椤甸潰
鈹?  鈹溾攢鈹€ css/
鈹?  鈹?  鈹斺攢鈹€ styles.css      # 鏍峰紡鏂囦欢
鈹?  鈹斺攢鈹€ js/
鈹?      鈹溾攢鈹€ config.js       # API閰嶇疆
鈹?      鈹溾攢鈹€ api.js          # API鎺ュ彛灞?鈹?      鈹斺攢鈹€ app.js          # 搴旂敤涓婚€昏緫
鈹?鈹溾攢鈹€ backend/                 # 鍚庣椤圭洰
鈹?  鈹溾攢鈹€ server.js           # 鏈嶅姟鍏ュ彛
鈹?  鈹溾攢鈹€ package.json        # 渚濊禆閰嶇疆
鈹?  鈹溾攢鈹€ routes/
鈹?  鈹?  鈹斺攢鈹€ robot.js        # API璺敱
鈹?  鈹溾攢鈹€ controllers/
鈹?  鈹?  鈹斺攢鈹€ robotController.js  # 鎺у埗鍣?鈹?  鈹斺攢鈹€ data/
鈹?      鈹斺攢鈹€ mockData.js     # 妯℃嫙鏁版嵁 (馃攲 妲戒綅)
鈹?鈹溾攢鈹€ docs/                    # 鏂囨。鐩綍
鈹?  鈹溾攢鈹€ POSTMAN浣跨敤鎸囧崡.md  # Postman娴嬭瘯鎸囧崡
鈹?  鈹溾攢鈹€ 鍓嶇寮€鍙戞寚鍗?md     # 鍓嶇寮€鍙戞枃妗?鈹?  鈹溾攢鈹€ 鍚庣寮€鍙戞寚鍗?md     # 鍚庣寮€鍙戞枃妗?鈹?  鈹斺攢鈹€ MQTT鎺ュ彛鏂囨。.md     # MQTT鎺ュ彛瑙勮寖
鈹?鈹溾攢鈹€ 鍐滀笟鏈哄櫒浜篈PI娴嬭瘯闆嗗悎.postman_collection.json
鈹溾攢鈹€ 鍐滀笟鏈哄櫒浜?鏈湴鐜.postman_environment.json
鈹斺攢鈹€ README.md               # 鏈枃浠?```

## 馃殌 蹇€熷惎鍔?
### 1. 鍚姩鍚庣鏈嶅姟

```bash
cd backend
npm install
npm start
```

鏈嶅姟灏嗗湪 `http://localhost:3000` 鍚姩銆?
**楠岃瘉鏈嶅姟**:
```bash
curl http://localhost:3000/api/health
```

### 2. 鍚姩鍓嶇

鐩存帴鐢ㄦ祻瑙堝櫒鎵撳紑 `frontend/index.html`锛屾垨浣跨敤闈欐€佹湇鍔″櫒锛?
```bash
cd frontend
# 浣跨敤Python
python -m http.server 8080
# 鎴栦娇鐢∟ode
npx serve .
```

鐒跺悗璁块棶 `http://localhost:8080`

### 3. 浣跨敤Postman娴嬭瘯锛堝彲閫夛級

1. 鎵撳紑Postman
2. 瀵煎叆娴嬭瘯闆嗗悎锛?   - `鍐滀笟鏈哄櫒浜篈PI娴嬭瘯闆嗗悎.postman_collection.json`
   - `鍐滀笟鏈哄櫒浜?鏈湴鐜.postman_environment.json`
3. 閫夋嫨鐜 "鍐滀笟鏈哄櫒浜?- 鏈湴寮€鍙戠幆澧?
4. 寮€濮嬫祴璇旳PI

璇︾粏鎸囧崡璇锋煡鐪嬶細[docs/POSTMAN浣跨敤鎸囧崡.md](docs/POSTMAN浣跨敤鎸囧崡.md)

## 馃搳 鍔熻兘璇存槑

### 鏈哄櫒浜烘帶鍒?
- **鐘舵€佺洃鎺?*: 鐢甸噺銆侀€熷害銆佹俯搴︺€丟PS鍧愭爣
- **浼犳劅鍣ㄦ暟鎹?*: 鍦熷￥婀垮害/娓╁害銆佸厜鐓у己搴︺€佺┖姘旀箍搴?- **鏂瑰悜鎺у埗**: 鍓嶈繘銆佸悗閫€銆佸乏杞€佸彸杞€佸仠姝?- **浣滀笟鎿嶄綔**: 鐏屾簤銆佹柦鑲ャ€佹壂鎻忋€佹敹鍓?
### 浠诲姟绠＄悊

- 浠诲姟鍒楄〃鏄剧ず
- 瀹炴椂杩涘害璺熻釜
- 浣滀笟缁熻鍒嗘瀽

### 绯荤粺鐩戞帶

- 杩炴帴鐘舵€佹寚绀?- 瀹炴椂鏃ュ織璁板綍
- 鎿嶄綔鍘嗗彶杩借釜

## 馃攲 API鎺ュ彛

| 鏂规硶 | 绔偣 | 璇存槑 |
|------|------|------|
| GET | `/api/health` | 鍋ュ悍妫€鏌?|
| GET | `/api/robot/status` | 鑾峰彇鏈哄櫒浜虹姸鎬?|
| POST | `/api/robot/control` | 鍙戦€佹帶鍒舵寚浠?|
| GET | `/api/sensors` | 鑾峰彇浼犳劅鍣ㄦ暟鎹?|
| GET | `/api/tasks` | 鑾峰彇浠诲姟鍒楄〃 |
| GET | `/api/statistics` | 鑾峰彇浣滀笟缁熻 |

### 璇锋眰绀轰緥

```bash
# 鑾峰彇鏈哄櫒浜虹姸鎬?curl http://localhost:3000/api/robot/status

# 鍙戦€佺Щ鍔ㄦ寚浠?curl -X POST http://localhost:3000/api/robot/control \
  -H "Content-Type: application/json" \
  -d '{"command": "forward"}'

# 鎵ц浣滀笟
curl -X POST http://localhost:3000/api/robot/control \
  -H "Content-Type: application/json" \
  -d '{"action": "irrigation"}'
```

### 鍝嶅簲鏍煎紡

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1706520000000
}
```

## 馃敡 瀵规帴鐪熷疄纭欢

鍚庣浠ｇ爜涓爣璁颁簡 `馃攲 SLOT` 鐨勪綅缃槸闇€瑕佸鎺ョ湡瀹炵‖浠剁殑妲戒綅銆?
### 鏂瑰紡1: 鐩存帴淇敼鏁版嵁婧?
淇敼 `backend/data/mockData.js`锛?
```javascript
// 馃攲 SLOT: 浠庣湡瀹炵‖浠惰鍙?function getRobotStatus() {
    return hardwareDriver.getStatus();
}
```

### 鏂瑰紡2: 浣跨敤MQTT鍗忚锛堟帹鑽愶級

绯荤粺鏀寔MQTT鍗忚涓庣‖浠堕€氫俊銆傝缁嗚鏄庤鏌ョ湅锛歔docs/MQTT鎺ュ彛鏂囨。.md](docs/MQTT鎺ュ彛鏂囨。.md)

**MQTT涓婚**:
- `robot/status` - 鏈哄櫒浜虹姸鎬佹暟鎹?- `robot/sensors` - 浼犳劅鍣ㄦ暟鎹?- `robot/control` - 鎺у埗鎸囦护锛堢‖浠堕渶璁㈤槄锛?- `robot/tasks` - 浠诲姟鍒楄〃
- `robot/statistics` - 浣滀笟缁熻

## 馃捇 鎶€鏈爤

### 鍓嶇
- HTML5 + CSS3 + JavaScript
- Fetch API
- BEM鍛藉悕瑙勮寖
- 鍝嶅簲寮忚璁?
### 鍚庣
- Node.js + Express
- RESTful API
- CORS璺ㄥ煙鏀寔
- Morgan鏃ュ織涓棿浠?- MQTT鍗忚鏀寔锛堝彲閫夛級

## 馃摎 鏂囨。

- [Postman浣跨敤鎸囧崡](docs/POSTMAN浣跨敤鎸囧崡.md) - API娴嬭瘯瀹屾暣鏁欑▼
- [鍓嶇寮€鍙戞寚鍗梋(docs/鍓嶇寮€鍙戞寚鍗?md) - 鍓嶇鏋舵瀯鍜岃皟璇?- [鍚庣寮€鍙戞寚鍗梋(docs/鍚庣寮€鍙戞寚鍗?md) - 鍚庣API鍜岄儴缃?- [MQTT鎺ュ彛鏂囨。](docs/MQTT鎺ュ彛鏂囨。.md) - 纭欢瀵规帴瑙勮寖

## 馃悰 鏁呴殰鎺掓煡

### 鍚庣杩炴帴澶辫触

```bash
# 妫€鏌ュ悗绔槸鍚﹁繍琛?netstat -ano | findstr :3000

# 閲嶅惎鍚庣鏈嶅姟
cd backend
npm start
```

### 鍓嶇鏃犳硶璁块棶

```bash
# 妫€鏌ュ墠绔湇鍔?netstat -ano | findstr :8080

# 浣跨敤娴忚鍣ㄧ洿鎺ユ墦寮€
# 鎴栧惎鍔℉TTP鏈嶅姟鍣?cd frontend
python -m http.server 8080
```

### 鏁版嵁涓嶆洿鏂?
1. 鎵撳紑娴忚鍣ㄥ紑鍙戣€呭伐鍏凤紙F12锛?2. 鏌ョ湅Console鏍囩椤电殑閿欒淇℃伅
3. 鏌ョ湅Network鏍囩椤电殑API璇锋眰
4. 纭鍚庣鏈嶅姟姝ｅ父杩愯

鏇村闂璇锋煡鐪嬶細[docs/鍓嶇寮€鍙戞寚鍗?md#闂鎺掓煡](docs/鍓嶇寮€鍙戞寚鍗?md)

## 馃幆 寮€鍙戝缓璁?
### 鎺ㄨ崘宸ヤ綔娴佺▼

1. **鍚姩鍚庣** 鈫?娴嬭瘯API鍋ュ悍妫€鏌?2. **浣跨敤Postman** 鈫?楠岃瘉鎵€鏈堿PI绔偣
3. **鍚姩鍓嶇** 鈫?娴嬭瘯鍓嶅悗绔泦鎴?4. **娴忚鍣ㄨ皟璇?* 鈫?鏌ョ湅瀹炴椂鏁堟灉

### 浠ｇ爜瑙勮寖

- 浣跨敤ES6+璇硶
- 閬靛惊BEM鍛藉悕瑙勮寖
- 淇濇寔妯″潡鍖栬璁?- 娣诲姞閫傚綋鐨勬敞閲?
## 馃摝 閮ㄧ讲璇存槑

### 寮€鍙戠幆澧?- 鍚庣: `npm start` (绔彛3000)
- 鍓嶇: `python -m http.server 8080` (绔彛8080)

### 鐢熶骇鐜
- 鍚庣: 浣跨敤PM2绠＄悊杩涚▼
- 鍓嶇: 浣跨敤Nginx鎵樼闈欐€佹枃浠?- 鍚敤HTTPS
- 閰嶇疆鐜鍙橀噺

璇︾粏閮ㄧ讲鎸囧崡璇锋煡鐪嬶細[docs/鍚庣寮€鍙戞寚鍗?md#閮ㄧ讲璇存槑](docs/鍚庣寮€鍙戞寚鍗?md)

## 馃 璐＄尞鎸囧崡

娆㈣繋鎻愪氦Issue鍜孭ull Request锛?
## 馃搫 璁稿彲璇?
MIT License

## 馃摓 鑱旂郴鏂瑰紡

濡傛湁闂锛岃鏌ョ湅鏂囨。鎴栬仈绯绘妧鏈敮鎸併€?
---

**鍐滀笟鏈哄櫒浜烘帶鍒剁郴缁?v1.0**

