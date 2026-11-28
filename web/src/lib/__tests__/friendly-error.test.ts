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
import { describe, expect, test } from 'vitest'

import { toFriendlyError } from '../friendly-error'

describe('toFriendlyError', () => {
  test('401 invalid token maps to regenerate-key action', () => {
    const r = toFriendlyError({
      status: 401,
      message: 'Invalid token (request id: x)',
    })
    expect(r.kind).toBe('invalid_key')
    expect(r.action).toMatchObject({ type: 'link', to: '/keys' })
  })

  test('insufficient quota code maps to top-up action', () => {
    const r = toFriendlyError({ status: 403, code: 'insufficient_user_quota' })
    expect(r.kind).toBe('insufficient_balance')
    expect(r.action).toMatchObject({ type: 'link', to: '/wallet' })
  })

  test('429 maps to retry', () => {
    expect(toFriendlyError({ status: 429 }).action.type).toBe('retry')
  })

  test('model_not_found 503 maps to model list', () => {
    const r = toFriendlyError({
      status: 503,
      code: 'model_not_found',
      message: 'No available channel for model your-model',
    })
    expect(r.kind).toBe('no_channel')
    expect(r.action).toMatchObject({ to: '/pricing' })
  })

  test('unrecognised error falls back to unknown with retry', () => {
    const r = toFriendlyError({ status: 500, message: 'boom' })
    expect(r.kind).toBe('unknown')
    expect(r.raw).toBe('boom')
  })
})
