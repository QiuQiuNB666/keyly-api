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
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import type { FriendlyError } from '@/lib/friendly-error'

/** Keyly API: plain-language error with one next-step button. */
export function FriendlyErrorCard(props: {
  error: FriendlyError
  onRetry?: () => void
}) {
  const { t } = useTranslation()
  const action = props.error.action
  return (
    <div
      role='alert'
      className='border-destructive/20 bg-destructive/5 rounded-2xl border px-4 py-3'
    >
      <p className='text-foreground flex items-center gap-2 text-sm font-medium'>
        <AlertCircle className='text-destructive size-4' aria-hidden='true' />
        {t(props.error.titleKey)}
      </p>
      <p className='text-foreground/80 mt-1 text-sm'>
        {t(props.error.causeKey)}
      </p>
      {props.error.raw && (
        <p className='text-muted-foreground mt-1 font-mono text-xs break-all'>
          {props.error.raw}
        </p>
      )}
      <div className='mt-3'>
        {action.type === 'link' ? (
          <Button
            size='sm'
            className='rounded-full px-4'
            render={<Link to={action.to} />}
          >
            {t(action.labelKey)}
          </Button>
        ) : (
          <Button
            size='sm'
            variant='outline'
            className='rounded-full px-4'
            onClick={props.onRetry}
          >
            {t(action.labelKey)}
          </Button>
        )}
      </div>
    </div>
  )
}
