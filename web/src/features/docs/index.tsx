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
import { ChevronDown } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { NotFoundError } from '@/features/errors/not-found-error'
import { getApiKeys } from '@/features/keys/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { DOC_GROUPS, DOC_PAGES, MASKED_KEY, type DocContext } from './content'
import { DocKeyContext } from './doc-key-context'

/** Keyly API docs: sidebar TOC + light large title, C style. */
export function DocsPage(props: { slug: string }) {
  const { t } = useTranslation()
  const page = DOC_PAGES.find((p) => p.slug === props.slug)
  const signedIn = useAuthStore((s) => Boolean(s.auth.user))
  // Keyly API: signed-in readers see their own (server-masked) key in the
  // samples; the full key is only fetched when they press 复制.
  const keysQuery = useQuery({
    queryKey: ['docs', 'own-key'],
    enabled: signedIn,
    queryFn: async () => {
      const res = await getApiKeys({ p: 1, size: 10 })
      const items = res.success ? (res.data?.items ?? []) : []
      return items.find((k) => k.status === 1) ?? null
    },
    staleTime: 60 * 1000,
  })
  const ownKey = signedIn ? keysQuery.data : null
  const keyRef = useMemo(
    () => (ownKey ? { keyId: ownKey.id, display: `sk-${ownKey.key}` } : null),
    [ownKey]
  )
  const ctx = useMemo<DocContext>(() => {
    const origin = window.location.origin
    return {
      origin,
      base: `${origin}/v1`,
      keyDisplay: keyRef?.display ?? MASKED_KEY,
      keyComment: keyRef
        ? '你的 Key：页面上打码，点「复制」得到完整内容'
        : '换成你自己的 Key',
    }
  }, [keyRef])

  if (!page) return <NotFoundError />

  const index = DOC_PAGES.indexOf(page)
  const prev = DOC_PAGES[index - 1]
  const next = DOC_PAGES[index + 1]

  return (
    <PublicLayout showMainContainer={false}>
      <div className='mx-auto grid max-w-7xl gap-10 px-4 pt-28 pb-20 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16'>
        {/* Keyly API (P2): left sidebar on desktop; on phones the table of
            contents collapses into a 「目录」 button above the title. */}
        <nav
          aria-label={t('Docs')}
          className='hidden lg:sticky lg:top-28 lg:block lg:self-start'
        >
          <p className='text-foreground/50 mb-4 text-xs tracking-[0.25em]'>
            {t('Docs')}
          </p>
          <DocToc current={page.slug} />
        </nav>

        <article className='max-w-3xl min-w-0'>
          <details className='group border-border mb-6 rounded-2xl border lg:hidden'>
            <summary className='text-foreground flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden'>
              {t('docs.toc')}
              <ChevronDown
                className='size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none'
                aria-hidden='true'
              />
            </summary>
            <div className='px-4 pb-4'>
              <DocToc current={page.slug} />
            </div>
          </details>
          <p className='text-foreground/50 text-xs tracking-[0.25em]'>
            {page.group}
          </p>
          <h1 className='keyly-up text-foreground mt-3 text-4xl leading-[1.12] font-light tracking-[-0.03em] md:text-5xl'>
            {page.title}
          </h1>
          {!signedIn && (
            <p className='bg-muted text-foreground/80 mt-6 rounded-2xl px-4 py-3 text-sm'>
              {t('docs.signInHint')}{' '}
              <Link
                to='/sign-in'
                className='text-[var(--link)] hover:underline'
              >
                {t('Sign in')}
              </Link>
            </p>
          )}
          <DocKeyContext value={keyRef}>
            <div className='keyly-up mt-8 [animation-delay:120ms]'>
              {page.render(ctx)}
            </div>
          </DocKeyContext>

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

function DocToc(props: { current: string }): ReactNode {
  return (
    <div className='flex flex-col gap-6'>
      {DOC_GROUPS.map((group) => (
        <div key={group}>
          <p className='text-foreground mb-2 text-sm font-medium'>{group}</p>
          <ul className='border-border flex flex-col border-l'>
            {DOC_PAGES.filter((p) => p.group === group).map((p) => (
              <li key={p.slug}>
                <Link
                  to='/docs/$slug'
                  params={{ slug: p.slug }}
                  className={cn(
                    '-ml-px block border-l py-1.5 pl-4 text-sm transition-colors',
                    p.slug === props.current
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
  )
}
