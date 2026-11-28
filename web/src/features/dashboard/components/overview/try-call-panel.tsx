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
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FriendlyErrorCard } from '@/components/friendly-error-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { sendChatCompletion } from '@/features/playground/api'
import { getUserLogs } from '@/features/usage-logs/api'
import { toIntlLocale } from '@/i18n/languages'
import { getUserModels } from '@/lib/api'
import { formatNumber, formatQuota } from '@/lib/format'
import {
  readRelayError,
  toFriendlyError,
  type FriendlyError,
} from '@/lib/friendly-error'

type CallResult = {
  reply: string
  latencyMs: number
  /** Quota of the matching consume log, when it can be found. */
  quota?: number
}

// Consume log type in new-api (model.LogTypeConsume).
const LOG_TYPE_CONSUME = 2

/**
 * Keyly API console 试调用: one message through the playground request path
 * (/pg/chat/completions — session auth, the user's own balance, normal
 * billing), then the cost is read back from the newest matching consume log.
 */
export function TryCallPanel() {
  const { t, i18n } = useTranslation()
  const [model, setModel] = useState<string>('')
  const [prompt, setPrompt] = useState('请只回复 OK')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<CallResult | null>(null)
  const [error, setError] = useState<FriendlyError | null>(null)

  const modelsQuery = useQuery({
    queryKey: ['dashboard', 'overview', 'user-models'],
    queryFn: async () => {
      const res = await getUserModels()
      return res.success ? (res.data ?? []) : []
    },
    staleTime: 5 * 60 * 1000,
  })
  const models = modelsQuery.data ?? []
  const activeModel = model || models[0] || ''

  const send = async () => {
    if (!activeModel || !prompt.trim()) return
    setSending(true)
    setError(null)
    setResult(null)
    const startedAt = Date.now()
    const startedSec = Math.floor(startedAt / 1000) - 1
    try {
      const res = await sendChatCompletion({
        model: activeModel,
        messages: [{ role: 'user', content: prompt.trim() }],
        stream: false,
      })
      const latencyMs = Date.now() - startedAt
      const reply = res.choices?.[0]?.message?.content ?? ''
      let quota: number | undefined
      try {
        const logs = await getUserLogs({
          p: 1,
          page_size: 5,
          type: LOG_TYPE_CONSUME,
          model_name: activeModel,
          start_timestamp: startedSec,
        })
        const items = (logs.data as { items?: { quota: number }[] })?.items
        quota = items?.[0]?.quota
      } catch {
        // Cost is best-effort; the call itself already succeeded.
      }
      setResult({ reply: String(reply), latencyMs, quota })
    } catch (err) {
      setError(toFriendlyError(readRelayError(err)))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className='bg-card rounded-2xl border p-4 shadow-xs sm:p-5'>
      <h3 className='text-base font-medium tracking-tight'>
        {t('tryCall.title')}
      </h3>
      <p className='text-muted-foreground mt-1 text-sm'>
        {t('tryCall.description')}
      </p>

      {modelsQuery.isLoading && (
        <div className='mt-4 flex flex-col gap-2'>
          <Skeleton className='h-9 w-full rounded-full' />
          <Skeleton className='h-9 w-full rounded-full' />
        </div>
      )}

      {!modelsQuery.isLoading && models.length === 0 && (
        <div className='bg-muted/60 mt-4 rounded-2xl px-4 py-5 text-center'>
          <p className='text-foreground text-sm font-medium'>
            {t('tryCall.empty.title')}
          </p>
          <p className='text-muted-foreground mt-1 text-sm'>
            {t('tryCall.empty.description')}
          </p>
          <Button
            size='sm'
            variant='outline'
            className='mt-3 rounded-full px-4'
            render={<Link to='/pricing' />}
          >
            {t('tryCall.empty.action')}
          </Button>
        </div>
      )}

      {models.length > 0 && (
        <form
          className='mt-4 flex flex-col gap-2 sm:flex-row'
          onSubmit={(event) => {
            event.preventDefault()
            void send()
          }}
        >
          <Select
            items={models.map((m) => ({ value: m, label: m }))}
            value={activeModel}
            onValueChange={(value) => setModel(String(value))}
          >
            <SelectTrigger
              className='h-9 rounded-full sm:w-56'
              aria-label={t('tryCall.model')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            aria-label={t('tryCall.prompt')}
            className='h-9 flex-1 rounded-full px-4'
          />
          <Button
            type='submit'
            disabled={sending}
            className='h-9 rounded-full px-5'
          >
            {sending ? <Loader2 className='animate-spin' /> : <Send />}
            {t('tryCall.send')}
          </Button>
        </form>
      )}

      {error && (
        <div className='mt-4'>
          <FriendlyErrorCard error={error} onRetry={() => void send()} />
        </div>
      )}

      {result && (
        <div className='mt-4 rounded-2xl border px-4 py-3'>
          <p className='text-foreground text-sm whitespace-pre-wrap'>
            {result.reply}
          </p>
          <p className='text-muted-foreground mt-2 flex flex-wrap gap-x-4 text-xs'>
            <span>
              {t('tryCall.latency', {
                ms: formatNumber(
                  result.latencyMs,
                  toIntlLocale(i18n.resolvedLanguage || i18n.language)
                ),
              })}
            </span>
            <span>
              {result.quota === undefined
                ? t('tryCall.costPending')
                : t('tryCall.cost', { amount: formatQuota(result.quota) })}
            </span>
          </p>
        </div>
      )}
    </section>
  )
}
