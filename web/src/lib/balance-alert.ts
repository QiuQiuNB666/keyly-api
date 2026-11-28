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
// Keyly API: per-user low-balance threshold, kept in localStorage only.
// The threshold is stored in the displayed currency amount (what the user
// typed); comparisons convert it to quota units with parseQuotaFromDollars.

import { parseQuotaFromDollars } from '@/lib/format'

const KEY_PREFIX = 'keyly:balance-alert:'
export const BALANCE_ALERT_EVENT = 'keyly:balance-alert-changed'

export function getBalanceAlertThreshold(userId?: number): number | null {
  if (typeof window === 'undefined' || userId == null) return null
  try {
    const raw = window.localStorage.getItem(`${KEY_PREFIX}${userId}`)
    if (raw == null || raw === '') return null
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

export function setBalanceAlertThreshold(
  userId: number,
  amount: number | null
): void {
  try {
    if (amount == null || !(amount > 0)) {
      window.localStorage.removeItem(`${KEY_PREFIX}${userId}`)
    } else {
      window.localStorage.setItem(`${KEY_PREFIX}${userId}`, String(amount))
    }
    window.dispatchEvent(new Event(BALANCE_ALERT_EVENT))
  } catch {
    // Storage unavailable (private mode): the alert just stays off.
  }
}

export function isBelowBalanceAlert(quota: number, threshold: number | null) {
  return threshold != null && quota < parseQuotaFromDollars(threshold)
}
