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
// Keyly API: map relay / console API failures to a plain-language cause and
// one next step. Pure function so it can be unit-tested and reused by the
// console 试调用 panel and anywhere else a relay error is shown.

export type FriendlyErrorKind =
  | 'invalid_key'
  | 'insufficient_balance'
  | 'rate_limited'
  | 'no_channel'
  | 'unknown'

export type FriendlyErrorAction =
  | { type: 'link'; to: '/wallet' | '/keys' | '/pricing'; labelKey: string }
  | { type: 'retry'; labelKey: string }

export type FriendlyError = {
  kind: FriendlyErrorKind
  titleKey: string
  causeKey: string
  action: FriendlyErrorAction
  /** Original server message, shown small for support. */
  raw?: string
}

export type RawRelayError = {
  status?: number
  code?: string
  message?: string
}

export function toFriendlyError(err: RawRelayError): FriendlyError {
  const code = (err.code ?? '').toLowerCase()
  const message = err.message ?? ''
  const lower = message.toLowerCase()

  if (
    err.status === 401 ||
    code === 'invalid_api_key' ||
    lower.includes('invalid token')
  ) {
    return {
      kind: 'invalid_key',
      titleKey: 'friendlyError.invalidKey.title',
      causeKey: 'friendlyError.invalidKey.cause',
      action: {
        type: 'link',
        to: '/keys',
        labelKey: 'friendlyError.invalidKey.action',
      },
      raw: message,
    }
  }

  if (
    code === 'insufficient_user_quota' ||
    code === 'pre_consume_token_quota_failed' ||
    lower.includes('insufficient') ||
    lower.includes('quota is not enough')
  ) {
    return {
      kind: 'insufficient_balance',
      titleKey: 'friendlyError.balance.title',
      causeKey: 'friendlyError.balance.cause',
      action: {
        type: 'link',
        to: '/wallet',
        labelKey: 'friendlyError.balance.action',
      },
      raw: message,
    }
  }

  if (err.status === 429 || code === 'rate_limit_exceeded') {
    return {
      kind: 'rate_limited',
      titleKey: 'friendlyError.rateLimit.title',
      causeKey: 'friendlyError.rateLimit.cause',
      action: { type: 'retry', labelKey: 'friendlyError.rateLimit.action' },
      raw: message,
    }
  }

  if (
    code === 'model_not_found' ||
    code === 'get_channel_failed' ||
    lower.includes('no available channel') ||
    err.status === 503
  ) {
    return {
      kind: 'no_channel',
      titleKey: 'friendlyError.noChannel.title',
      causeKey: 'friendlyError.noChannel.cause',
      action: {
        type: 'link',
        to: '/pricing',
        labelKey: 'friendlyError.noChannel.action',
      },
      raw: message,
    }
  }

  return {
    kind: 'unknown',
    titleKey: 'friendlyError.unknown.title',
    causeKey: 'friendlyError.unknown.cause',
    action: { type: 'retry', labelKey: 'friendlyError.unknown.action' },
    raw: message,
  }
}

/** Pull status / code / message out of an axios-style error or a relay body. */
export function readRelayError(error: unknown): RawRelayError {
  const e = error as {
    response?: { status?: number; data?: unknown }
    message?: string
  }
  const data = (e?.response?.data ?? {}) as {
    error?: { code?: string; message?: string }
    message?: string
  }
  return {
    status: e?.response?.status,
    code: data.error?.code,
    message: data.error?.message ?? data.message ?? e?.message,
  }
}
