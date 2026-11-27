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
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toIntlLocale } from '@/i18n/languages'
import { formatNumber, formatQuota } from '@/lib/format'

import { KEYLY_SHOP_URL } from '../constants'
import type { UserWalletData } from '../types'

interface WalletHeroProps {
  user: UserWalletData | null
  loading?: boolean
  redemptionEnabled: boolean
  redemptionCode: string
  onRedemptionCodeChange: (code: string) => void
  onRedeem: () => void
  redeeming: boolean
  topupLink?: string
}

/**
 * Keyly API wallet: big light balance, pill-shaped redeem form and a quiet
 * record row (layout from the approved "C" mockup).
 */
export function WalletHero(props: WalletHeroProps) {
  const { t, i18n } = useTranslation()
  const locale = toIntlLocale(i18n.resolvedLanguage || i18n.language)
  const shopUrl = props.topupLink || KEYLY_SHOP_URL

  return (
    <section className='flex flex-col items-start py-4 sm:py-8'>
      <span className='keyly-up border-foreground/15 text-foreground mb-6 inline-flex items-center rounded-full border bg-white/60 px-4 py-2 text-sm'>
        {t('Current Balance')}
      </span>
      {props.loading ? (
        <Skeleton className='h-20 w-64 rounded-2xl' />
      ) : (
        <p className='keyly-up text-foreground text-6xl leading-none font-light tracking-[-0.03em] break-all tabular-nums [animation-delay:120ms] sm:text-[5.5rem]'>
          {formatQuota(props.user?.quota ?? 0)}
        </p>
      )}

      <div className='keyly-up mt-10 w-full [animation-delay:240ms]'>
        <label
          htmlFor='wallet-redemption-code'
          className='text-foreground/50 mb-6 block text-xs tracking-[0.25em]'
        >
          {t('Top up with a redeem code')}
        </label>
        <form
          className='border-foreground/15 focus-within:border-ring flex w-full max-w-140 items-center gap-2 rounded-full border bg-white/70 py-1.5 pr-1.5 pl-5 transition-colors'
          onSubmit={(event) => {
            event.preventDefault()
            props.onRedeem()
          }}
        >
          <Input
            id='wallet-redemption-code'
            value={props.redemptionCode}
            onChange={(event) =>
              props.onRedemptionCodeChange(event.target.value)
            }
            placeholder={t('Paste your redeem code')}
            autoComplete='off'
            disabled={!props.redemptionEnabled}
            className='h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 font-mono focus-visible:ring-0 disabled:bg-transparent'
          />
          <Button
            type='submit'
            disabled={
              !props.redemptionEnabled ||
              props.redeeming ||
              !props.redemptionCode
            }
            className='h-10 rounded-full px-6'
          >
            {props.redeeming && <Loader2 className='animate-spin' />}
            {t('wallet.redeem.submit')}
          </Button>
        </form>
        {props.redemptionEnabled ? (
          <p className='text-foreground/60 mt-3.5 pl-5 text-sm'>
            {t('No redeem code?')}{' '}
            <a
              href={shopUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('Buy one on Keyly')}
            </a>
            {t('. Credited balance does not expire.')}
          </p>
        ) : (
          <p className='text-foreground/60 mt-3.5 pl-5 text-sm'>
            {t(
              'Redemption codes are disabled until the administrator confirms compliance terms.'
            )}
          </p>
        )}
      </div>

      <div className='keyly-up mt-10 w-full [animation-delay:360ms]'>
        <p className='text-foreground/50 mb-6 text-xs tracking-[0.25em]'>
          {t('Records')}
        </p>
        {props.loading ? (
          <Skeleton className='h-7 w-80 rounded-full' />
        ) : (
          <div className='text-foreground/80 flex flex-wrap items-center gap-x-10 gap-y-3 text-[1.375rem] font-light tracking-[-0.02em]'>
            <span className='whitespace-nowrap'>
              {t('Used {{amount}}', {
                amount: formatQuota(props.user?.used_quota ?? 0),
              })}
            </span>
            <span className='whitespace-nowrap'>
              {t('{{count}} requests', {
                count: formatNumber(props.user?.request_count ?? 0, locale),
              })}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
