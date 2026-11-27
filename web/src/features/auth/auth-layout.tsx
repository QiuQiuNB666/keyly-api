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
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  // Keyly API: same bar as the public header (logo centered, h-20), light
  // form column with pill inputs / submit buttons.
  return (
    <div className='bg-background relative grid min-h-svh max-w-none'>
      <header className='absolute inset-x-0 top-0 z-10 flex h-20 items-center justify-center'>
        <Link
          to='/'
          className='keyly-down flex items-center gap-2 transition-opacity hover:opacity-70'
        >
          <div className='relative size-5'>
            {loading ? (
              <Skeleton className='absolute inset-0 rounded-md' />
            ) : (
              <img
                src={logo}
                alt={t('Logo')}
                className='size-5 object-contain'
              />
            )}
          </div>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <span className='text-foreground text-xl font-normal tracking-tight'>
              {systemName}
            </span>
          )}
        </Link>
      </header>
      <div className='container flex items-center pt-20'>
        <div className='keyly-up mx-auto flex w-full flex-col justify-center space-y-2 px-4 py-8 [animation-delay:240ms] sm:w-[440px] sm:p-8 [&_button[type=submit]]:h-11 [&_button[type=submit]]:rounded-full [&_input:not([type=checkbox])]:h-11 [&_input:not([type=checkbox])]:rounded-full [&_input:not([type=checkbox])]:px-5'>
          {children}
        </div>
      </div>
    </div>
  )
}
