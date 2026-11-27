# API 中转站（本地测试版）

在 iMac 上本地跑的 new-api（v1.0.0-rc.51，从源码编译），**只监听 127.0.0.1:3300**，没有开隧道，外网访问不到。

- 方案：`方案.md`
- 源码仓库（公开）：https://github.com/QiuQiuNB666/keyly-api ，开源许可页里的「获取修改后的源码」指向它
- 界面：11-27 用户定了 C 版「轻编辑」（样张在 `样张v2/c-轻编辑/`），已改进 `src/` 并在 3300 上跑；改了哪些文件见 `前端改动清单.md`
- B 版（网关）只做过对比：源码 `src-b/`、程序 `bin/new-api-b`、数据 `data-b/`，用 `./start-b.sh` 起在 3301，现在已停；确认不要了可以整块删掉

## 启动 / 停止

```bash
./start.sh   # 启动，pid 写在 run.pid，日志在 logs/
./stop.sh    # 停止
```

- 地址：http://127.0.0.1:3300
- 数据库：`data/one-api.db`（SQLite）。删掉它就回到全新安装。
- 会话和加密密钥：`secrets.env`（权限 600，别外传；换了它，已登录的会话会失效，库里加密的渠道 Key 也会读不出来）。

## 管理员

- 登录页：http://127.0.0.1:3300/login
- 用户名和密码在本地文件 `admin.local.txt`（权限 600），README 里不写。

## 重新编译

官方 macOS 安装包只有 Apple 芯片版，这台 iMac 是 Intel，所以从源码编译（`src/` 是 v1.0.0-rc.51 的源码）：

```bash
cd src/web && DISABLE_ESLINT_PLUGIN=true VITE_REACT_APP_VERSION=$(cat ../VERSION) bun run build
```

```bash
cd src && go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o ../bin/new-api
```

前端会打包进二进制，所以改了前端也要重新编译 Go。

## 上游 Key

DeepSeek 的 Key 存在本地 `deepseek.key`（权限 600，用户在隐藏输入框里粘贴），只用来在后台建渠道，不写进日志和对话。

## 以后接 Keyly 卖兑换码

1. 管理后台 → 兑换码 → 批量生成（例如 ¥50 面额）→ 导出成文本。
2. Keyly 后台新建商品「AI API 额度 ¥50」（普通卡密发货），用现成的「导入卡密」（`keyly/src/app/admin/actions.ts` 里的 `importCards`）把码粘进去。
3. 买家在 Keyly 付款拿码，到中转站「钱包」里兑换。

自动补货（库存低时用 new-api 的管理 token 调接口生成兑换码）等卖得动再做，见 `方案.md` §4。

## 待定

品牌名（现在用占位名「Keyly API」）、用谁的名义、要不要公开卖、VPS、正式定价。
