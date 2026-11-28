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
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getUserLogs } from '@/features/usage-logs/api'
import type { UsageLog } from '@/features/usage-logs/data/schema'
import {
  parseLogOther,
  renderLogContent,
} from '@/features/usage-logs/lib/format'
import { toIntlLocale } from '@/i18n/languages'
import { formatQuota } from '@/lib/format'
import { cn } from '@/lib/utils'

import { KEYLY_SHOP_URL } from '../constants'

// new-api log types (model.LogTypeTopup / model.LogTypeConsume)
const LOG_TYPE_TOPUP = 1
const LOG_TYPE_CONSUME = 2

function useRecentLogs(type: number) {
  return useQuery({
    queryKey: ['wallet', 'recent-logs', type],
    queryFn: async () => {
      const res = await getUserLogs({ p: 1, page_size: 5, type })
      if (!res.success) return []
      return (res.data?.items ?? []) as UsageLog[]
    },
    staleTime: 30 * 1000,
  })
}

function ActivityList(props: {
  title: string
  loading: boolean
  items: UsageLog[]
  empty: React.ReactNode
  renderLabel: (log: UsageLog) => React.ReactNode
  renderAmount: (log: UsageLog) => React.ReactNode
}) {
  const { i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  return (
    <div>
      <p className='text-foreground/50 mb-3 text-xs tracking-[0.25em]'>
        {props.title}
      </p>
      {props.loading && (
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-10 w-full rounded-xl' />
          <Skeleton className='h-10 w-full rounded-xl' />
        </div>
      )}
      {!props.loading && props.items.length === 0 && props.empty}
      {!props.loading && props.items.length > 0 && (
        <ul className='divide-border divide-y'>
          {props.items.map((log) => (
            <li
              key={log.id}
              className='flex items-center justify-between gap-3 py-2.5 text-sm'
            >
              <div className='min-w-0'>
                <p className='text-foreground truncate'>
                  {props.renderLabel(log)}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {log.created_at
                    ? new Date(log.created_at * 1000).toLocaleString(locale, {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </p>
              </div>
              <span className='text-foreground shrink-0 tabular-nums'>
                {props.renderAmount(log)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyHint(props: { text: string; action: React.ReactNode }) {
  return (
    <div className='bg-muted/60 flex flex-col items-start gap-3 rounded-2xl px-4 py-4'>
      <p className='text-muted-foreground text-sm'>{props.text}</p>
      {props.action}
    </div>
  )
}

/** Keyly API wallet right column: latest top-ups and usage. */
export function RecentActivity(props: {
  className?: string
  topupLink?: string
}) {
  const { t } = useTranslation()
  const topups = useRecentLogs(LOG_TYPE_TOPUP)
  const usage = useRecentLogs(LOG_TYPE_CONSUME)

  return (
    <section
      className={cn(
        'bg-card flex flex-col gap-8 rounded-2xl border p-5',
        props.className
      )}
    >
      <ActivityList
        title={t('wallet.recent.topups')}
        loading={topups.isLoading}
        items={topups.data ?? []}
        renderLabel={(log) =>
          renderLogContent(parseLogOther(log.other ?? ''), t) ?? log.content
        }
        renderAmount={(log) => (log.quota ? `+${formatQuota(log.quota)}` : '')}
        empty={
          <EmptyHint
            text={t('wallet.recent.topupsEmpty')}
            action={
              <Button
                size='sm'
                className='rounded-full px-4'
                render={
                  <a
                    href={props.topupLink || KEYLY_SHOP_URL}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                {t('Buy one on Keyly')}
              </Button>
            }
          />
        }
      />
      <ActivityList
        title={t('wallet.recent.usage')}
        loading={usage.isLoading}
        items={usage.data ?? []}
        renderLabel={(log) => log.model_name || log.content}
        renderAmount={(log) => `−${formatQuota(log.quota ?? 0)}`}
        empty={
          <EmptyHint
            text={t('wallet.recent.usageEmpty')}
            action={
              <Button
                size='sm'
                variant='outline'
                className='rounded-full px-4'
                render={<Link to='/docs' />}
              >
                {t('wallet.recent.usageAction')}
              </Button>
            }
          />
        }
      />
      <Link
        to='/usage-logs'
        className='mt-auto text-sm text-[var(--link)] hover:underline'
      >
        {t('wallet.recent.viewAll')}
      </Link>
    </section>
  )
}
