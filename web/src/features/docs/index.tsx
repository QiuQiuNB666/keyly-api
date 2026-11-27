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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { NotFoundError } from '@/features/errors/not-found-error'
import { cn } from '@/lib/utils'

import { DOC_GROUPS, DOC_PAGES, type DocContext } from './content'

/** Keyly API docs: sidebar TOC + light large title, C style. */
export function DocsPage(props: { slug: string }) {
  const { t } = useTranslation()
  const page = DOC_PAGES.find((p) => p.slug === props.slug)
  const ctx = useMemo<DocContext>(() => {
    const origin = window.location.origin
    return { origin, base: `${origin}/v1` }
  }, [])

  if (!page) return <NotFoundError />

  const index = DOC_PAGES.indexOf(page)
  const prev = DOC_PAGES[index - 1]
  const next = DOC_PAGES[index + 1]

  return (
    <PublicLayout showMainContainer={false}>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 pt-28 pb-20 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16'>
        <nav
          aria-label={t('Docs')}
          className='lg:sticky lg:top-28 lg:self-start'
        >
          <p className='text-foreground/50 mb-4 text-xs tracking-[0.25em]'>
            {t('Docs')}
          </p>
          <div className='flex flex-col gap-6'>
            {DOC_GROUPS.map((group) => (
              <div key={group}>
                <p className='text-foreground mb-2 text-sm font-medium'>
                  {group}
                </p>
                <ul className='border-border flex flex-col border-l'>
                  {DOC_PAGES.filter((p) => p.group === group).map((p) => (
                    <li key={p.slug}>
                      <Link
                        to='/docs/$slug'
                        params={{ slug: p.slug }}
                        className={cn(
                          '-ml-px block border-l py-1.5 pl-4 text-sm transition-colors',
                          p.slug === page.slug
                            ? 'border-foreground text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground border-transparent'
                        )}
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <article className='max-w-3xl min-w-0'>
          <p className='text-foreground/50 text-xs tracking-[0.25em]'>
            {page.group}
          </p>
          <h1 className='keyly-up text-foreground mt-3 text-4xl leading-[1.12] font-light tracking-[-0.03em] md:text-5xl'>
            {page.title}
          </h1>
          <div className='keyly-up mt-8 [animation-delay:120ms]'>
            {page.render(ctx)}
          </div>

          <div className='border-border mt-16 flex justify-between gap-4 border-t pt-6 text-sm'>
            {prev ? (
              <Link
                to='/docs/$slug'
                params={{ slug: prev.slug }}
                className='text-muted-foreground hover:text-foreground'
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to='/docs/$slug'
                params={{ slug: next.slug }}
                className='text-muted-foreground hover:text-foreground'
              >
                {next.title} →
              </Link>
            )}
          </div>
        </article>
      </div>
    </PublicLayout>
  )
}
