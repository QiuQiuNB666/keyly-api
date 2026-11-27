# Claude 号池：配置与操作（违规部分）

2026-11-28。分工：违规的部分（这个池子）我做；不违规的部分交 Claude。

还没真跑过：没有账号、没装 sub2api、没建渠道。下面都是照 keyly-api 源码和 sub2api 的公开文档写的，账号到位就能照做。

---

## 一、结构

```
买家 → new-api（套餐/计费/周额度）→ 渠道（Anthropic 类型）→ sub2api → Claude 订阅账号 ×N
```

- 账号只在 sub2api 里，new-api 只看到一个 key。加号、换号都在 sub2api 里做，new-api 不用动。
- 一个池子一条渠道。两个池子就两条渠道，互为备份。

## 二、new-api 渠道参数

| 字段 | 值 |
|---|---|
| 类型 | Anthropic（`constant/channel.go:14`，type = 14） |
| 名称 | `claude-pool-a`（第二个叫 `-b`） |
| 代理地址 | `http://sub2api:8080`（同机就用容器名，跨机用内网地址） |
| 密钥 | sub2api 里生成、前缀 `sk-` 的那个 key |
| 模型 | `claude-sonnet-5-5,claude-opus-5-5`（要卖的，逗号分隔） |
| 模型映射 | 见下 |
| 分组 | 和套餐用户所在分组一致 |
| 优先级 | 池子 A 高、B 低，A 挂了自动落 B |
| 自动禁用 | 开（默认开，出错或余额光就停，并通知） |

模型映射（渠道上的 `model_mapping`，JSON，左是我们的模型名，右是 sub2api 那边的名字）：

```json
{"claude-sonnet-5-5": "claude-sonnet-5-5", "claude-opus-5-5": "claude-opus-5-5"}
```

名字对不上就改右边。sub2api 那边到底导出什么名字，登录它的面板看「模型」列表；它对 Anthropic 原生模型一般就是原名。

**一个坑：** new-api 读 sub2api 的 `/v1/usage` 取余额（`controller/channel-billing.go:434`）。返回里既没有 `remaining` 也没有 `balance`，或者订阅的日/周/月上限全是空的，new-api 会报错，渠道可能被自动禁用。所以 sub2api 里这个 key 必须配一个有限总额度（或有限订阅额度），别做成「无限」。

## 三、定价

单位都是「套餐里的 $」每 1M token。成本按「官方价的 11%」估，其中 sonnet 用你给的 $0.22 / $1.10，正好是官方 $2 / $10 的 11%。

换算：`套餐$ = 真美元成本 × 7.2 ÷ 0.78 × 倍率`（0.78 是最便宜那档 ¥2338 的每 $ 售价，按它算五档都不亏）。

现在这一代是 5.5，不是 5 了（2026-11 官方价，[Opus 5.5 文档](https://platform.claude.com/docs/zh-CN/models/opus-5-5/overview)）：

| 模型 ID | 官方价 输入/输出 | 池子成本 输入/输出 | 套餐价 ×1.3 输入/输出 | 套餐价 ×1.5 输入/输出 |
|---|---|---|---|---|
| `claude-opus-5-5` | $4 / $20 | 0.44 / 2.20 | 5.28 / 26.42 | 6.10 / 30.49 |
| `claude-sonnet-5-5` | $2 / $10 | 0.22 / 1.10 | 2.64 / 13.21 | 3.05 / 15.24 |
| `claude-fable-5-2` | $8 / $40 | 0.88 / 4.40 | 10.57 / 52.85 | 12.20 / 60.98 |
| `claude-haiku-5-5` | $0.10 / $0.50 | 0.011 / 0.055 | 0.13 / 0.66 | 0.15 / 0.76 |

缓存读按输入价的 10%，缓存倍率留 0.1：opus 5.5 是 $0.53，sonnet 5.5 是 $0.26，fable 5.2 是 $1.06，haiku 5.5 是 $0.01。

**模型 ID 要跟池子对一遍。** 这里是官方 ID（`claude-opus-5-5` 这种）。sub2api 面板里显示什么名字就填什么，映射写 `{"claude-opus-5-5": "<池子里的名字>"}`。

第一版建议只上 `claude-sonnet-5-5` 和 `claude-opus-5-5` 两个：sonnet 跑量，opus 给愿意多花钱的人。fable 和 haiku 等池子稳了再加。

## 四、sub2api 部署

官方一键脚本（Linux）：

```bash
curl -sSL https://raw.githubusercontent.com/Wei-Shaw/sub2api/main/deploy/install.sh | sudo bash
```

或者 Docker，固定版本别用 latest：

```yaml
services:
  sub2api:
    image: weishaw/sub2api:0.1.104
    container_name: sub2api
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - ./config.yaml:/app/config.yaml
    depends_on: [postgres, redis]
```

`config.yaml` 里要改的（照官方 example）：

- `host: "0.0.0.0"`，`port: 8080`，`mode: "release"`
- `database`：PostgreSQL 的地址、用户、密码、库名
- `redis`：地址
- `jwt.secret`：换成随机串
- `api_key_prefix: "sk-"`

装完在面板里做三件事：

1. 登一个 Claude 账号（OAuth，浏览器过一次）。
2. 建一个 API key，给它配有限额度。
3. 看「模型」列表，确认 `claude-sonnet-5-5`、`claude-opus-5-5` 在，名字记下来填进渠道映射。

## 五、封号处置

**判断：** 渠道连续报 401/403/429，或 sub2api 里账号显示失效，就是号挂了。

**动作：**

1. sub2api 里把挂的账号停用，备用号启用（平时就留 1–2 个空号）。
2. new-api 里如果 A 池整条挂了，把 A 禁用，B 自动接；两个都挂就临时关闭 Claude 的购买入口。
3. 记一笔：哪天、哪个号、用了多少、卖出去多少额度。

**给买家的说法（页面文案）：**

> Claude 由第三方账号池提供，可能出现短时不可用或模型临时下线。遇到 5xx 或「无可用渠道」请稍后重试；连续失败可在工单里申请顺延。

**补偿边界（自己定的，别临时让步）：** 停服不满 24 小时不补；超过 24 小时按停服天数顺延到期时间；不退款，只顺延。

## 六、算成本（等你给账号方案后填）

一个号的真实单位成本 = 月费 ÷ 它在寿命内跑出的 token 数。

按 sonnet 5.5 的池子价 $0.22/$1.10 推，一个 $20/月的 Pro 号如果能跑出约 9000 万输入等价的量，成本才落在这个价位。实际能跑多少、能活几个月，要挂了才知道。**先按「一个月就死」做预算**，卖多少充多少。

## 七、还没做的

1. 买号（数量、档位、支付方式）
2. 注册环境（境外 IP、邮箱）
3. 装 sub2api、登号、出 key
4. 建 new-api 渠道、填映射
5. 两个池子互为备份
6. 模型价落库（数字在上面）
7. 页面文案 + 补偿规则上线
8. 单独记账（违规收入单独核算）
