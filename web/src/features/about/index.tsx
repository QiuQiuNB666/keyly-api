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
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import { Skeleton } from '@/components/ui/skeleton'
import { isHttpUrl, isLikelyHtml } from '@/lib/content-format'
import { requireServerSuccess } from '@/lib/server-error-message'

import { getAboutContent } from './api'

// Keyly API: AGPL-3.0 §5/§13 + NOTICE §7(b)/(c) compliance block. The
// attribution sentence is required verbatim, so it is NOT passed through t().
const NEW_API_ATTRIBUTION =
  'Frontend design and development by New API contributors.'
const NEW_API_REPOSITORY = 'https://github.com/QuantumNous/new-api'
const MODIFIED_ON = '2026-11-27'

function LicenseSection() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const changes = [
    t(
      'Interface restyled with the Keyly palette and fonts; light theme by default'
    ),
    t(
      'Home, header, sign-in, sign-up, wallet, model square and error pages redesigned'
    ),
    t(
      'Console: icons unified to one color; language and theme switches shown to admins only'
    ),
    t('Model details: rate-limit figures simulated by the frontend are hidden'),
    t('Footer and console sidebar link to this page'),
  ]

  return (
    <section
      id='license'
      className='mx-auto w-full max-w-3xl px-4 pt-28 pb-20 md:px-8'
    >
      <h1 className='keyly-up text-foreground text-4xl leading-[1.12] font-light tracking-[-0.03em] md:text-5xl'>
        {t('Open source license')}
      </h1>

      <div className='keyly-up mt-12 space-y-10 [animation-delay:120ms]'>
        <div className='space-y-3'>
          <p className='text-foreground/50 text-xs tracking-[0.25em]'>
            {t('Original project')}
          </p>
          <p className='text-foreground text-lg font-light'>
            {t(
              'This site is a modified version of the open source project New API.'
            )}
          </p>
          <p className='text-foreground text-base'>{NEW_API_ATTRIBUTION}</p>
          <p className='text-sm'>
            <a
              href={NEW_API_REPOSITORY}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {NEW_API_REPOSITORY}
            </a>
          </p>
          <p className='text-muted-foreground text-sm'>
            <a
              href={NEW_API_REPOSITORY}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('NewAPI')}
            </a>{' '}
            © {currentYear}{' '}
            <a
              href='https://github.com/QuantumNous'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('QuantumNous')}
            </a>{' '}
            {t('| Based on')}{' '}
            <a
              href='https://github.com/songquanpeng/one-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('One API')}
            </a>{' '}
            © 2023{' '}
            <a
              href='https://github.com/songquanpeng'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('JustSong')}
            </a>
          </p>
          <p className='text-muted-foreground text-sm'>
            {t('This project must be used in compliance with the')}{' '}
            <a
              href={`${NEW_API_REPOSITORY}/blob/main/LICENSE`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              {t('AGPL v3.0 License')}
            </a>
            .
          </p>
        </div>

        <div className='space-y-3'>
          <p className='text-foreground/50 text-xs tracking-[0.25em]'>
            {t('Modifications')}
          </p>
          <p className='text-foreground text-lg font-light'>
            {t('Modified on {{date}}. Main changes:', { date: MODIFIED_ON })}
          </p>
          <ul className='text-foreground/80 list-disc space-y-1.5 pl-5 text-sm'>
            {changes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className='space-y-3'>
          <p className='text-foreground/50 text-xs tracking-[0.25em]'>
            {t('Get the modified source code')}
          </p>
          <p className='text-foreground text-lg font-light'>
            {t(
              'Under AGPL-3.0, users of this site can obtain the modified source code.'
            )}
          </p>
          <p className='text-muted-foreground text-sm'>
            {t('Modified source code:')}{' '}
            <a
              href='https://github.com/QiuQiuNB666/keyly-api'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--link)] hover:underline'
            >
              https://github.com/QiuQiuNB666/keyly-api
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => requireServerSuccess(await getAboutContent()),
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isHttpUrl(rawContent)
  const contentIsHtml = hasContent && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return (
      <PublicLayout showMainContainer={false}>
        <LicenseSection />
      </PublicLayout>
    )
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
          sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'
        />
        <LicenseSection />
      </PublicLayout>
    )
  }

  if (contentIsHtml) {
    return (
      <PublicLayout showMainContainer={false}>
        <RichContent
          mode='html'
          htmlVariant='isolated'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
        <LicenseSection />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='mx-auto max-w-6xl px-4 pt-28 pb-8'>
        <RichContent
          mode='markdown'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
      </div>
      <LicenseSection />
    </PublicLayout>
  )
}
