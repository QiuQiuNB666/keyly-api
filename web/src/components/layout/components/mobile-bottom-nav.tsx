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
import { Link, useRouterState } from '@tanstack/react-router'
import {
  BookOpen,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

const ITEMS = [
  { to: '/dashboard', labelKey: 'mobileNav.overview', icon: LayoutDashboard },
  { to: '/keys', labelKey: 'mobileNav.keys', icon: KeyRound },
  { to: '/wallet', labelKey: 'mobileNav.wallet', icon: Wallet },
  { to: '/usage-logs', labelKey: 'mobileNav.logs', icon: ScrollText },
  { to: '/docs', labelKey: 'mobileNav.docs', icon: BookOpen },
] as const

/** Keyly API: bottom tab bar for buyers on phone widths. */
export function MobileBottomNav() {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <nav
      aria-label={t('mobileNav.label')}
      className='bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden'
    >
      <ul className='grid grid-cols-5'>
        {ITEMS.map((item) => {
          const active = pathname.startsWith(item.to)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon
                  className={cn('size-5', active && 'text-[var(--link)]')}
                  aria-hidden='true'
                />
                {t(item.labelKey)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
