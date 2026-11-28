/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import type { ReactNode } from 'react'

import {
  Bullets,
  C,
  CodeBlock,
  DocH2,
  DocLink,
  DocP,
  Note,
  Output,
  Pitfall,
  Steps,
  Tag,
  VerifyThree,
} from './components'

// Keyly API docs content (Chinese only). Rules this copy follows:
// - third-party relay, never presented as an official provider
// - no vendor / model names; models are written as `your-model`
// - outputs marked 实测 were captured on 2026-11-27 against this instance
//   (no upstream channel connected); anything else is marked 示例
// - keys are always shown masked

export type DocContext = {
  /** Masked key shown in code samples (the user's own when signed in). */
  keyDisplay: string
  /** Trailing shell comment for the key line. */
  keyComment: string
  /** Site origin, e.g. https://example.com */
  origin: string
  /** Base URL most OpenAI-compatible clients want: origin + /v1 */
  base: string
}

export type DocPage = {
  slug: string
  title: string
  group: string
  summary: string
  render: (ctx: DocContext) => ReactNode
}

export const MASKED_KEY = 'sk-xxxx…xxxx'
const MODEL_NOTE = '以控制台模型列表为准'
const NOT_YET = '接入渠道后可验证'
const TESTED_ON =
  '本站 2026-11-27 实测：本机 127.0.0.1:3300，尚未接入任何上游渠道'

const overview: DocPage = {
  slug: 'overview',
  title: '总览',
  group: '开始',
  summary: '本站是什么、怎么用、需要准备什么。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        Keyly API 是一个第三方 API 中转服务：一个 Key、一个地址，用 OpenAI
        兼容的格式调用本站已接入的模型，按量计费。
      </DocP>
      <Note>
        本站不是任何模型厂商的官方服务，也不代表任何厂商。能用哪些模型、价格多少，
        {MODEL_NOTE}和「模型广场」。
      </Note>

      <DocH2 id='flow'>怎么用</DocH2>
      <Steps
        items={[
          <>
            在{' '}
            <a
              href='https://keylyai.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              Keyly
            </a>{' '}
            买一张兑换码。
          </>,
          <>注册并登录本站，在「钱包」里兑换，额度到账后不过期。</>,
          <>在控制台「API 密钥」里新建一个 Key。</>,
          <>
            把客户端的接口地址填成 <C>{ctx.base}</C>，Key 填刚才那个。
          </>,
        ]}
      />

      <DocH2 id='need'>你需要准备</DocH2>
      <Bullets
        items={[
          '一个本站账号，和一张已兑换的兑换码（余额大于 0）。',
          '一个 API Key（在控制台创建；它等于你的余额钥匙，别发给别人）。',
          '一个支持「自定义 OpenAI 兼容接口」的客户端，或者 curl / Python / Node.js。',
        ]}
      />

      <DocH2 id='next'>下一步</DocH2>
      <Bullets
        items={[
          <>
            先看 <DocLink slug='endpoints'>地址速查</DocLink>，弄清地址要不要带{' '}
            <C>/v1</C>。
          </>,
          <>
            再按你用的方式选一篇：<DocLink slug='curl'>curl</DocLink>、
            <DocLink slug='python'>Python</DocLink>、
            <DocLink slug='nodejs'>Node.js</DocLink>、
            <DocLink slug='desktop-client'>桌面客户端</DocLink>。
          </>,
          <>
            出了问题看 <DocLink slug='troubleshooting'>常见问题</DocLink>。
          </>,
        ]}
      />
    </>
  ),
}

const endpoints: DocPage = {
  slug: 'endpoints',
  title: '地址速查',
  group: '开始',
  summary: '接口地址怎么填、去哪找地址和 Key。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        大多数 OpenAI 兼容客户端要的是带 <C>/v1</C> 结尾的地址。
      </DocP>

      <DocH2 id='table'>该填哪个</DocH2>
      <div className='border-border my-4 overflow-hidden rounded-2xl border'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-muted text-foreground/70'>
            <tr>
              <th className='px-4 py-2.5 font-medium'>用在哪</th>
              <th className='px-4 py-2.5 font-medium'>填什么</th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            <tr>
              <td className='px-4 py-3'>
                OpenAI SDK（Python、Node.js）的 base URL
              </td>
              <td className='px-4 py-3'>
                <C>{ctx.base}</C>
              </td>
            </tr>
            <tr>
              <td className='px-4 py-3'>curl 直接请求</td>
              <td className='px-4 py-3'>
                <C>{`${ctx.base}/chat/completions`}</C> 这样的完整路径
              </td>
            </tr>
            <tr>
              <td className='px-4 py-3'>桌面客户端的「API 地址」</td>
              <td className='px-4 py-3'>
                看客户端说明：有的要带 <C>/v1</C>，有的会自己补
                <Tag>以客户端当前版本界面为准</Tag>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocH2 id='where'>去哪找</DocH2>
      <Steps
        items={[
          <>
            地址：就是你现在浏览器地址栏里本站的域名，后面加 <C>/v1</C>。
          </>,
          <>
            Key：控制台 →「API 密钥」→ 新建，创建后复制完整的 <C>sk-</C>{' '}
            开头那串。
          </>,
          <>
            模型名：「模型广场」或控制台里的模型列表，照抄名字，大小写也要一样。
          </>,
        ]}
      />

      <Pitfall>
        <p>
          地址末尾少了 <C>/v1</C>：本站会把请求当成网页访问，返回一整页 HTML，
          客户端通常报「解析失败」或「Unexpected token
          &lt;」，而不是明确的错误。
        </p>
        <p>
          地址末尾多了一个 <C>/v1</C>（客户端自己会补，你又填了）：路径变成{' '}
          <C>/v1/v1/…</C>，返回 404「Invalid URL」。
        </p>
        <p>Key 前后多了空格或换行，也会被当成错误的 Key。</p>
      </Pitfall>

      <Output
        kind='real'
        caption={<>{TESTED_ON}。多填一个 /v1 时：</>}
        text={`POST ${ctx.origin}/v1/v1/chat/completions
HTTP 404
{"error":{"message":"Invalid URL (POST /v1/v1/chat/completions)","type":"invalid_request_error","param":"","code":""}}`}
      />
    </>
  ),
}

const curl: DocPage = {
  slug: 'curl',
  title: '用 curl 接入',
  group: '接入方式',
  summary: '不装任何东西，先确认地址和 Key 是通的。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        curl 最适合先排除客户端的问题：它能通，剩下的就只是客户端怎么填。
      </DocP>

      <DocH2 id='prepare'>准备</DocH2>
      <Steps
        items={[
          <>macOS 和 Linux 自带 curl，下面的命令按它们的写法给出。</>,
          <>
            Windows 用 Git Bash 或 WSL 可以原样照抄；PowerShell
            的换行和引号写法不一样。
          </>,
          <>准备好 Key，先放进环境变量，后面的命令就不用每次粘贴。</>,
        ]}
      />
      <CodeBlock
        label='macOS / Linux'
        code={`export KEYLY_API_KEY="${ctx.keyDisplay}"   # ${ctx.keyComment}`}
      />

      <DocH2 id='configure'>配置：先查模型列表</DocH2>
      <CodeBlock
        label='bash'
        code={`curl ${ctx.base}/models \\
  -H "Authorization: Bearer $KEYLY_API_KEY"`}
      />
      <Output
        kind='real'
        caption={<>{TESTED_ON}，所以列表是空的：</>}
        text={`HTTP 200
{"data":[],"object":"list","success":true}`}
      />
      <DocP>
        接入渠道后，<C>data</C> 里会列出你能用的模型，{MODEL_NOTE}。
      </DocP>

      <DocH2 id='verify-call'>验证：发一句话</DocH2>
      <CodeBlock
        label='bash'
        code={`curl ${ctx.base}/chat/completions \\
  -H "Authorization: Bearer $KEYLY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "your-model",
    "messages": [{"role": "user", "content": "请只回复 OK"}]
  }'`}
        note={<>把 your-model 换成模型列表里的名字（{MODEL_NOTE}）。</>}
      />
      <Output
        kind='real'
        caption={<>{TESTED_ON}，没有渠道时会返回：</>}
        text={`HTTP 503
{"error":{"code":"model_not_found","message":"No available channel for model your-model under group default (distributor) (request id: …)","type":"new_api_error"}}`}
      />
      <Output
        kind='example'
        caption={<>接入渠道后成功的返回大致是这样（{NOT_YET}，内容为示例）：</>}
        text={`{"id":"…","object":"chat.completion","choices":[{"index":0,"message":{"role":"assistant","content":"OK"},"finish_reason":"stop"}],"usage":{…}}`}
      />

      <VerifyThree />

      <DocH2 id='troubleshoot'>排错</DocH2>
      <Bullets
        items={[
          <>
            返回 401「Invalid token」：Key 错了或多了空格，见{' '}
            <DocLink slug='troubleshooting'>常见问题</DocLink>。
          </>,
          <>
            返回一整页 HTML：地址少了 <C>/v1</C>。
          </>,
          <>
            返回 503「No available
            channel」：这个模型名本站没有可用渠道，换一个模型列表里有的名字。
          </>,
        ]}
      />
    </>
  ),
}

const python: DocPage = {
  slug: 'python',
  title: 'Python（OpenAI SDK）',
  group: '接入方式',
  summary: '用官方 openai 包，把 base_url 指向本站。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        openai 这个 Python 包本身是开源 SDK；只要把 <C>base_url</C> 和{' '}
        <C>api_key</C> 换成本站的，请求就会发到本站。
      </DocP>

      <DocH2 id='prepare'>准备</DocH2>
      <Steps
        items={[
          <>建一个虚拟环境，macOS 自带的 Python 不让直接全局 pip 安装。</>,
          <>在虚拟环境里装 openai。</>,
          <>用环境变量放地址和 Key。</>,
        ]}
      />
      <CodeBlock
        label='bash'
        code={`python3 -m venv .venv
source .venv/bin/activate
pip install openai

export KEYLY_BASE_URL="${ctx.base}"
export KEYLY_API_KEY="${ctx.keyDisplay}"   # ${ctx.keyComment}`}
      />

      <DocH2 id='configure'>配置</DocH2>
      <CodeBlock
        label='demo.py'
        code={`import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ["KEYLY_BASE_URL"],
    api_key=os.environ["KEYLY_API_KEY"],
)

models = client.models.list()
print("models:", [m.id for m in models.data])

resp = client.chat.completions.create(
    model="your-model",  # 以控制台模型列表为准
    messages=[{"role": "user", "content": "请只回复 OK"}],
)
print(resp.choices[0].message.content)`}
      />

      <DocH2 id='verify-call'>验证</DocH2>
      <CodeBlock label='bash' code='python demo.py' />
      <Output
        kind='real'
        caption={<>{TESTED_ON}（Python 3.14.5、openai 3.60.0）：</>}
        text={`models: []
openai.InternalServerError: Error code: 503 - No available channel for model your-model under group default (distributor) (request id: …)`}
      />
      <DocP>
        第一行说明地址和 Key
        都对了；第二行是因为还没有渠道。接入渠道后第二行会变成模型的回复。
        <Tag>{NOT_YET}</Tag>
      </DocP>

      <VerifyThree />

      <DocH2 id='troubleshoot'>排错</DocH2>
      <Output
        kind='real'
        caption='Key 错误时（实测）：'
        text='openai.AuthenticationError: Error code: 401 - Invalid token (request id: …)'
      />
      <Output
        kind='real'
        caption='base_url 少了 /v1 时（实测）。报错看起来和地址无关，其实是拿到了网页：'
        text={`AttributeError: 'str' object has no attribute '_set_private_attributes'`}
      />
      <Pitfall>
        <p>
          <C>base_url</C> 要写到 <C>/v1</C> 为止，后面不要再加{' '}
          <C>/chat/completions</C>，SDK 会自己拼。
        </p>
        <p>
          SDK 也会读 <C>OPENAI_BASE_URL</C> 和 <C>OPENAI_API_KEY</C>{' '}
          环境变量；如果你电脑上早就设过这两个，可能会和代码里的值打架，以代码里显式传入的为准。
        </p>
      </Pitfall>
    </>
  ),
}

const nodejs: DocPage = {
  slug: 'nodejs',
  title: 'Node.js（OpenAI SDK）',
  group: '接入方式',
  summary: '用 npm 上的 openai 包，把 baseURL 指向本站。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        和 Python 一样，只换 <C>baseURL</C> 和 <C>apiKey</C> 两个值。
      </DocP>

      <DocH2 id='prepare'>准备</DocH2>
      <Steps
        items={[
          <>
            确认装了 Node.js：<C>node --version</C> 能打出版本号。
          </>,
          <>新建一个文件夹，装 openai。</>,
          <>用环境变量放地址和 Key。</>,
        ]}
      />
      <CodeBlock
        label='bash'
        code={`mkdir keyly-demo && cd keyly-demo
npm init -y
npm i openai

export KEYLY_BASE_URL="${ctx.base}"
export KEYLY_API_KEY="${ctx.keyDisplay}"   # ${ctx.keyComment}`}
      />

      <DocH2 id='configure'>配置</DocH2>
      <CodeBlock
        label='demo.mjs'
        code={`import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: process.env.KEYLY_BASE_URL,
  apiKey: process.env.KEYLY_API_KEY,
})

const models = await client.models.list()
console.log('models:', models.data.map((m) => m.id))

const resp = await client.chat.completions.create({
  model: 'your-model', // 以控制台模型列表为准
  messages: [{ role: 'user', content: '请只回复 OK' }],
})
console.log(resp.choices[0].message.content)`}
        note='文件名用 .mjs，才能直接在最外层写 await。'
      />

      <DocH2 id='verify-call'>验证</DocH2>
      <CodeBlock label='bash' code='node demo.mjs' />
      <Output
        kind='real'
        caption={<>{TESTED_ON}（Node.js 22.22.2、openai 7.65.0）：</>}
        text={`models: []
InternalServerError: 503 No available channel for model your-model under group default (distributor) (request id: …)`}
      />
      <DocP>
        能打出 <C>models:</C> 就说明连上了；回复那一步要等接入渠道。
        <Tag>{NOT_YET}</Tag>
      </DocP>

      <VerifyThree />

      <DocH2 id='troubleshoot'>排错</DocH2>
      <Output
        kind='real'
        caption='baseURL 少了 /v1 时（实测）：拿到的是网页，所以读不到 choices：'
        text="TypeError: Cannot read properties of undefined (reading '0')"
      />
      <Pitfall>
        <p>
          参数名是 <C>baseURL</C>（URL 全大写），写成 <C>baseUrl</C>{' '}
          不会报错，但会被忽略，请求直接发去默认地址。
        </p>
        <p>在浏览器前端代码里直接放 Key 等于公开 Key，请只在服务器端调用。</p>
      </Pitfall>
    </>
  ),
}

const desktopClient: DocPage = {
  slug: 'desktop-client',
  title: '桌面客户端（Cherry Studio 等）',
  group: '接入方式',
  summary: '在支持自定义 OpenAI 兼容服务商的桌面客户端里添加本站。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        Cherry Studio、ChatBox
        这类开源桌面客户端都能添加「自定义服务商」。下面按通用思路写，
        菜单名称各版本会不一样。
      </DocP>
      <Note>
        以客户端当前版本界面为准。这些客户端是第三方开源软件，和本站没有关系；本站也不是它们默认列出的任何官方服务商。
      </Note>

      <DocH2 id='prepare'>准备</DocH2>
      <Steps
        items={[
          <>从客户端官网或开源仓库下载安装，不要用来路不明的安装包。</>,
          <>
            准备好地址 <C>{ctx.base}</C> 和你的 Key。
          </>,
          <>在「模型广场」查好要用的模型名（{MODEL_NOTE}）。</>,
        ]}
      />

      <DocH2 id='configure'>配置</DocH2>
      <Steps
        items={[
          <>打开设置，找到「模型服务」或「服务商」。</>,
          <>点「添加」，类型选「OpenAI」或「OpenAI 兼容」。</>,
          <>名称随便填，比如「Keyly API」。</>,
          <>
            API 地址填本站地址（要不要带 <C>/v1</C> 看下面的提醒）。
          </>,
          <>API 密钥粘贴你的 Key。</>,
          <>
            在模型列表里点「获取」或手动添加，模型名填 <C>your-model</C>{' '}
            那样的真实名字。
          </>,
          <>保存，并把这个服务商设为当前使用。</>,
        ]}
      />
      <Pitfall>
        <p>
          有的客户端会在地址后面自己补 <C>/v1</C>，有的不会。先填{' '}
          <C>{ctx.origin}</C> 试一次，用客户端的「检查」按钮；不通再改成{' '}
          <C>{ctx.base}</C>。
        </p>
        <p>
          服务商类型别选成某个厂商的专用类型，要选通用的 OpenAI
          兼容类型，否则请求格式对不上。
        </p>
        <p>改完设置要点保存；部分客户端还要新开一个对话才会用上新服务商。</p>
      </Pitfall>

      <DocH2 id='verify-call'>验证</DocH2>
      <Steps
        items={[
          <>
            在服务商设置里点「检查」或「测试连接」。
            <Tag>以客户端当前版本界面为准</Tag>
          </>,
          <>
            新开对话，选本站的模型，发「请只回复 OK」。<Tag>{NOT_YET}</Tag>
          </>,
          <>
            回控制台「使用日志」看有没有这条记录。<Tag>{NOT_YET}</Tag>
          </>,
        ]}
      />
      <Note>这一页的步骤我们没有在客户端里实测，界面文字仅供参考。</Note>

      <DocH2 id='troubleshoot'>排错</DocH2>
      <Bullets
        items={[
          '提示「无效的 API Key」：重新复制 Key，注意别带空格。',
          <>
            提示连接失败或解析错误：多半是 <C>/v1</C>{' '}
            多了或少了，按上面的提醒换一种。
          </>,
          '模型列表获取不到：手动添加模型名，名字和控制台模型列表完全一致。',
          <>
            其他情况看 <DocLink slug='troubleshooting'>常见问题</DocLink>。
          </>,
        ]}
      />
    </>
  ),
}

const troubleshooting: DocPage = {
  slug: 'troubleshooting',
  title: '常见问题／排错',
  group: '帮助',
  summary: '按报错找原因。',
  render: (ctx) => (
    <>
      <DocP className='text-lg font-light'>
        先用 <DocLink slug='curl'>curl</DocLink> 跑一遍。curl
        能通而客户端不通，问题就在客户端的设置里。
      </DocP>

      <DocH2 id='401'>401：Key 不对</DocH2>
      <Output
        kind='real'
        caption='实测返回：'
        text={`HTTP 401
{"error":{"code":"","message":"Invalid token (request id: …)","type":"new_api_error"}}`}
      />
      <Bullets
        items={[
          '重新到控制台「API 密钥」复制一次，注意首尾不要带空格或换行。',
          '确认这个 Key 没有被禁用、删除或过期。',
          <>
            请求头格式是 <C>Authorization: Bearer sk-…</C>，Bearer
            后面有一个空格。
          </>,
        ]}
      />

      <DocH2 id='base-url'>地址带不带 /v1</DocH2>
      <Bullets
        items={[
          <>
            少了 <C>/v1</C>：返回的是网页（HTTP 200 加一整页
            HTML），客户端报解析错误。（实测）
          </>,
          <>
            多了一个 <C>/v1</C>：返回 404「Invalid URL (POST
            /v1/v1/chat/completions)」。（实测）
          </>,
          <>
            SDK 的 base URL 填 <C>{ctx.base}</C>，不要再加{' '}
            <C>/chat/completions</C>。
          </>,
        ]}
      />

      <DocH2 id='balance'>余额不足</DocH2>
      <DocP>
        余额用完后请求会被拒绝。去「钱包」看余额，不够就在 Keyly
        买兑换码再兑换。
        <Tag>{NOT_YET}</Tag>
      </DocP>
      <DocP>具体的报错文字要等接入渠道后才能实测，这里先不贴。</DocP>

      <DocH2 id='model'>找不到模型</DocH2>
      <Output
        kind='real'
        caption='实测：模型名本站没有可用渠道时返回：'
        text={`HTTP 503
{"error":{"code":"model_not_found","message":"No available channel for model your-model under group default (distributor) (request id: …)","type":"new_api_error"}}`}
      />
      <Bullets
        items={[
          <>
            模型名照抄「模型广场」或 <C>/v1/models</C> 里的名字，大小写一致（
            {MODEL_NOTE}）。
          </>,
          '有些模型只开放给特定分组，换一个 Key 分组或换模型。',
        ]}
      />

      <DocH2 id='429'>429：请求太频繁</DocH2>
      <DocP>
        短时间内请求太多会被限流。等一会儿再试，或者在代码里加重试和间隔。
        <Tag>{NOT_YET}</Tag>
      </DocP>
      <DocP>具体的限流阈值以本站后台设置为准，这里不写数字。</DocP>

      <Pitfall>
        <p>
          本站是第三方中转，不是模型厂商官方，不要把官方账号的 Key
          填到本站，也不要把本站 Key 填到官方地址。
        </p>
        <p>Key 泄露了就在控制台把它删掉重建，删掉后旧 Key 就不能用了。</p>
      </Pitfall>
    </>
  ),
}

export const DOC_PAGES: DocPage[] = [
  overview,
  endpoints,
  curl,
  python,
  nodejs,
  desktopClient,
  troubleshooting,
]

export const DOC_GROUPS = ['开始', '接入方式', '帮助'] as const
