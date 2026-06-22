# 绗簩闃舵锛欳loudflare Worker + D1 浜戠淇濆瓨

杩欎竴闃舵鐨勭洰鏍囨槸璁╃嚎涓婄綉绔欎笉鍙湪鍓嶇鐢熸垚鎶ュ憡锛岃繕鑳芥妸鐢ㄦ埛鐨勬祴绠楄褰曚繚瀛樺埌 Cloudflare D1 鏁版嵁搴擄紝鍚庣画鍐嶇户缁帴鐢ㄦ埛涓績銆佷細鍛樻鏁般€佽鍗曞拰鍚庡彴绠＄悊銆?
## 褰撳墠浠ｇ爜宸茬粡瀹屾垚

- `worker/index.mjs`锛氱嚎涓?Worker API銆?- `schema.sql`锛欴1 鏁版嵁搴撳缓琛ㄨ剼鏈€?- `wrangler.jsonc`锛氬凡鍔犲叆 Worker 鍏ュ彛锛孌1 缁戝畾鍧楁殏鏃朵繚鐣欎负娉ㄩ噴銆?- `src/utils/api.js`锛氱嚎涓婇粯璁よ姹傚悓鍩?`/api`锛屼笉鍐嶅啓姝绘湰鏈哄湴鍧€銆?
## 鍒涘缓 D1 鏁版嵁搴?
1. 鎵撳紑 Cloudflare Dashboard銆?2. 杩涘叆 `Workers & Pages`銆?3. 鎵惧埌宸︿晶 `D1 SQL Database` 鎴?`D1`銆?4. 鐐瑰嚮 `Create database`銆?5. 鏁版嵁搴撳悕绉板缓璁～鍐欙細

```text
xuanxue
```

6. 鍒涘缓鍚庡鍒堕〉闈㈤噷鐨?`database_id`銆?
## 鍒濆鍖栨暟鎹〃

杩涘叆鍒氬垱寤虹殑 D1 鏁版嵁搴擄紝鎵撳紑 `Console`锛岀矘璐村苟鎵ц `schema.sql` 鐨勫唴瀹癸細

```sql
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  method_id TEXT,
  method_name TEXT,
  question TEXT NOT NULL,
  concern_type TEXT,
  report_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at
ON reports(created_at DESC);
```

## 鎵撳紑 D1 缁戝畾

缂栬緫 `wrangler.jsonc`锛屾妸娉ㄩ噴鎺夌殑 `d1_databases` 鎵撳紑锛屽苟鎶?`database_id` 鎹㈡垚鐪熷疄 ID锛?
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "xx",
  "compatibility_date": "2026-06-18",
  "main": "./worker/index.mjs",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "xuanxue",
      "database_id": "杩欓噷鎹㈡垚浣犵殑鐪熷疄 database_id"
    }
  ]
}
```

## 閲嶆柊涓婁紶 GitHub 骞堕儴缃?
Cloudflare 褰撳墠椤圭洰浣跨敤 GitHub 鑷姩閮ㄧ讲锛屾墍浠ユ洿鏂?GitHub 鍚庣偣鍑?`Retry build` 鎴栫瓑寰呰嚜鍔ㄩ儴缃插嵆鍙€?
閮ㄧ讲鎴愬姛鍚庢鏌ワ細

```text
https://浣犵殑鍩熷悕/api/health
```

濡傛灉杩斿洖锛?
```json
{
  "ok": true,
  "service": "xuanxue-worker-api",
  "storage": "d1"
}
```

璇存槑浜戠 API 涓?D1 缁戝畾鎴愬姛銆?
## 鐢ㄦ埛渚ч獙璇?
1. 鎵撳紑缃戠珯銆?2. 杩涘叆鍏嶈垂浣撻獙銆?3. 濉啓闂骞剁敓鎴愭姤鍛娿€?4. 椤甸潰鎻愮ず搴斿彉鎴愬凡杩炴帴鍚庣/鍙繚瀛樺巻鍙层€?5. 涓嬫柟鍘嗗彶鎶ュ憡鍖哄煙搴斿嚭鐜板垰鎵嶇敓鎴愮殑璁板綍銆?
## 涓嬩竴闃舵寤鸿

- 鐢ㄦ埛鐧诲綍涓庝細鍛樿韩浠姐€?- 娴嬬畻娆℃暟浣欓銆?- 璁㈠崟涓庢敮浠樸€?- 绠＄悊鍛樺悗鍙版煡鐪嬫姤鍛婅褰曘€?- 鎶ュ憡璇︽儏椤靛拰鍙垎浜摼鎺ャ€?- 鏁忔劅鍐呭瀹℃牳涓庨珮椋庨櫓闂鎷︽埅銆?

## AI 报告生成环境变量

在 Cloudflare Worker 的 `Settings -> Variables and Secrets` 添加：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
```

`DEEPSEEK_API_KEY` 建议选择 Secret 类型。没有配置时，网站会继续使用内置规则引擎生成报告；配置后，后端会优先调用模型生成更细、更有区分度的报告，失败时自动回退到规则报告。

注意：公共网站无法直接调用你本机的 Codex skill，所以这里是把 `chinese-metaphysics-advisor` 的工作流、安全边界和输出结构写入后端生成指令。

