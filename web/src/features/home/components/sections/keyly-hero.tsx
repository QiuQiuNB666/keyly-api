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
    // Keyly API (P1): on phones the text sits on top and the video takes the
    // lower part of the first screen (soft top edge, solid backdrop matched to
    // the video's light grey), so the cube never sits under the text.
    <section className='md:bg-background relative min-h-[max(700px,100svh)] w-full overflow-hidden bg-[#e4e4e9]'>
      <div className='absolute inset-x-0 bottom-0 h-[42%] [mask-image:linear-gradient(to_bottom,transparent,black_30%)] md:inset-0 md:h-full md:[mask-image:none]'>
        <video
          className='size-full object-cover object-center md:object-bottom'
          src={KEYLY_HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden='true'
        />
      </div>
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
        <h1 className='keyly-up text-foreground max-w-4xl text-[2rem] leading-[1.15] font-light tracking-[-0.03em] break-keep [animation-delay:360ms] sm:text-4xl md:text-6xl'>
          {t('One key for multiple mainstream models,')}
          <br className='hidden md:block' />
          {t('pay as you go, top up with redeem codes')}
        </h1>
        <div className='keyly-up mt-10 w-full [animation-delay:480ms]'>
          <p className='text-foreground/50 mb-8 text-xs tracking-[0.25em]'>
            {t('API capabilities')}
          </p>
          <div className='keyly-up flex max-w-160 flex-wrap items-center gap-x-6 gap-y-3 [animation-delay:600ms] sm:gap-x-10 sm:gap-y-4'>
            {capabilities.map((item) => (
              <span
                key={item}
                className='text-foreground/80 text-lg font-light tracking-[-0.02em] whitespace-nowrap sm:text-[1.375rem]'
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
