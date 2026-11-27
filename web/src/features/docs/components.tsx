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
import { Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { Children, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'

// Keyly API docs building blocks. Body copy is Chinese-only content (like
// admin-provided About/Home content); UI chrome goes through t().

export function DocH2(props: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={props.id}
      className='text-foreground mt-14 mb-4 scroll-mt-28 text-2xl font-light tracking-[-0.02em] first:mt-0'
    >
      {props.children}
    </h2>
  )
}

export function DocP(props: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-foreground/80 my-3 leading-7', props.className)}>
      {props.children}
    </p>
  )
}

/** Inline code. */
export function C(props: { children: ReactNode }) {
  return (
    <code className='bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-[0.85em]'>
      {props.children}
    </code>
  )
}

/** One short sentence per step. */
export function Steps(props: { items: ReactNode[] }) {
  return (
    <ol className='my-4 space-y-3'>
      {Children.toArray(
        props.items.map((item, index) => (
          <li className='text-foreground/80 flex gap-3 leading-7'>
            <span className='bg-primary text-primary-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium'>
              {index + 1}
            </span>
            <span className='min-w-0'>{item}</span>
          </li>
        ))
      )}
    </ol>
  )
}

export function Bullets(props: { items: ReactNode[] }) {
  return (
    <ul className='text-foreground/80 my-3 list-disc space-y-1.5 pl-5 leading-7'>
      {Children.toArray(props.items.map((item) => <li>{item}</li>))}
    </ul>
  )
}

export function CodeBlock(props: {
  code: string
  label?: string
  note?: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <figure className='my-4'>
      <div className='bg-muted overflow-hidden rounded-2xl'>
        <div className='flex items-center justify-between gap-2 py-1.5 pr-1.5 pl-4'>
          <span className='text-muted-foreground text-xs'>
            {props.label ?? ''}
          </span>
          <CopyButton
            value={props.code}
            size='sm'
            className='h-8 rounded-full px-3 text-xs'
            aria-label={t('Copy to clipboard')}
          >
            {t('Copy')}
          </CopyButton>
        </div>
        <pre className='overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-6'>
          <code>{props.code}</code>
        </pre>
      </div>
      {props.note && (
        <figcaption className='text-muted-foreground mt-2 text-sm'>
          {props.note}
        </figcaption>
      )}
    </figure>
  )
}

/** Real terminal output captured on this site, or a labelled example. */
export function Output(props: {
  kind: 'real' | 'example'
  caption: ReactNode
  text: string
}) {
  return (
    <figure className='my-4'>
      <figcaption className='text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-sm'>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            props.kind === 'real'
              ? 'bg-success/10 text-success'
              : 'bg-muted text-foreground/70'
          )}
        >
          {props.kind === 'real' ? '实测' : '示例'}
        </span>
        {props.caption}
      </figcaption>
      <pre className='border-border overflow-x-auto rounded-2xl border px-4 py-3 font-mono text-[13px] leading-6 whitespace-pre-wrap'>
        {props.text}
      </pre>
    </figure>
  )
}

/** 「最容易搞错的地方」 callout. */
export function Pitfall(props: { title?: string; children: ReactNode }) {
  return (
    <aside className='border-warning/30 bg-warning/5 my-6 rounded-2xl border px-5 py-4'>
      <p className='text-warning flex items-center gap-2 font-medium'>
        <AlertTriangle className='size-4' aria-hidden='true' />
        {props.title ?? '最容易搞错的地方'}
      </p>
      <div className='text-foreground/85 mt-2 space-y-1.5 text-sm leading-6'>
        {props.children}
      </div>
    </aside>
  )
}

/** Neutral note, e.g. 「接入渠道后可验证」 or 「以客户端当前版本界面为准」. */
export function Note(props: { children: ReactNode }) {
  return (
    <p className='bg-muted text-foreground/80 my-4 rounded-2xl px-5 py-3 text-sm leading-6'>
      {props.children}
    </p>
  )
}

/** Small inline tag: 接入渠道后可验证 / 以客户端当前版本界面为准. */
export function Tag(props: { children: ReactNode }) {
  return (
    <span className='border-border text-muted-foreground ml-1 inline-block rounded-full border px-2 py-0.5 align-middle text-xs'>
      {props.children}
    </span>
  )
}

export function DocLink(props: { slug: string; children: ReactNode }) {
  return (
    <Link
      to='/docs/$slug'
      params={{ slug: props.slug }}
      className='text-[var(--link)] hover:underline'
    >
      {props.children}
    </Link>
  )
}

export function VerifyThree() {
  return (
    <>
      <DocH2 id='verify'>验证三步</DocH2>
      <Steps
        items={[
          <>
            模型列表能拿到：调用 <C>/v1/models</C> 返回 HTTP
            200，列表里有你要用的模型。
          </>,
          <>
            发一句「请只回复 OK」，能收到回复。<Tag>接入渠道后可验证</Tag>
          </>,
          <>
            打开控制台「使用日志」，能看到刚才这条请求和扣费。
            <Tag>接入渠道后可验证</Tag>
          </>,
        ]}
      />
    </>
  )
}
