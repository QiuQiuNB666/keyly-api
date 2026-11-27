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
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { KEYLY_HERO_VIDEO_URL, KEYLY_SHOP_URL } from '../../constants'

/**
 * Keyly API home hero, ported from the MotionSites "Palomar Labs" mockup:
 * full-screen background video, left-aligned frosted pill → light headline →
 * letter-spaced label → a row of capabilities.
 */
export function KeylyHero() {
  const { t } = useTranslation()
  const capabilities = [
    t('OpenAI compatible'),
    t('Streaming output'),
    t('Tool calling'),
    t('Automatic retry on failure'),
  ]

  return (
    <section className='bg-background relative min-h-[max(700px,100svh)] w-full overflow-hidden'>
      <video
        className='absolute inset-0 size-full object-cover object-bottom'
        src={KEYLY_HERO_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden='true'
      />
      <div className='relative z-10 mx-auto flex max-w-7xl flex-col items-start px-4 pt-32 pb-16 md:px-8 md:pt-36'>
        <a
          href={KEYLY_SHOP_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='keyly-up border-foreground/15 text-foreground mb-6 inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-2 text-sm backdrop-blur-sm transition-colors [animation-delay:240ms] hover:bg-white/85'
        >
          <span>{t('Redeem codes are sold on Keyly, credited instantly')}</span>
          <ArrowRight className='size-3.5 shrink-0' aria-hidden='true' />
        </a>
        <h1 className='keyly-up text-foreground max-w-4xl text-4xl leading-[1.12] font-light tracking-[-0.03em] [animation-delay:360ms] md:text-6xl'>
          {t('One key for multiple mainstream models,')}
          <br className='hidden md:block' />
          {t('pay as you go, top up with redeem codes')}
        </h1>
        <div className='keyly-up mt-10 w-full [animation-delay:480ms]'>
          <p className='text-foreground/50 mb-8 text-xs tracking-[0.25em]'>
            {t('API capabilities')}
          </p>
          <div className='keyly-up flex max-w-160 flex-wrap items-center gap-x-10 gap-y-4 [animation-delay:600ms]'>
            {capabilities.map((item) => (
              <span
                key={item}
                className='text-foreground/80 text-[1.375rem] font-light tracking-[-0.02em] whitespace-nowrap'
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
