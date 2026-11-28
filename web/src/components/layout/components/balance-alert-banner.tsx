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
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  BALANCE_ALERT_EVENT,
  getBalanceAlertThreshold,
  isBelowBalanceAlert,
} from '@/lib/balance-alert'
import { formatQuota, parseQuotaFromDollars } from '@/lib/format'
import { useAuthStore } from '@/stores/auth-store'

/** Keyly API: top banner when the balance drops below the user's threshold. */
export function BalanceAlertBanner() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.auth.user)
  const [threshold, setThreshold] = useState<number | null>(() =>
    getBalanceAlertThreshold(user?.id)
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const sync = () => setThreshold(getBalanceAlertThreshold(user?.id))
    sync()
    window.addEventListener(BALANCE_ALERT_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(BALANCE_ALERT_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [user?.id])

  const quota = Number(user?.quota ?? 0)
  if (!user || dismissed || !isBelowBalanceAlert(quota, threshold)) return null

  return (
    <div
      role='status'
      className='bg-primary/15 text-foreground flex items-center gap-3 px-4 py-2 text-sm'
    >
      <span className='min-w-0 flex-1'>
        {t('balanceAlert.banner', {
          balance: formatQuota(quota),
          threshold: formatQuota(parseQuotaFromDollars(threshold ?? 0)),
        })}
      </span>
      <Button
        size='sm'
        className='h-7 shrink-0 rounded-full px-3'
        render={<Link to='/wallet' />}
      >
        {t('balanceAlert.topUp')}
      </Button>
      <Button
        size='icon-sm'
        variant='ghost'
        className='shrink-0 rounded-full'
        aria-label={t('balanceAlert.dismiss')}
        onClick={() => setDismissed(true)}
      >
        <X />
      </Button>
    </div>
  )
}
