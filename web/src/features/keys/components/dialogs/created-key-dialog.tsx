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
import { Check, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

/**
 * Keyly API: success dialog shown once after creating a single key. The
 * caller clears the key from memory on close. new-api lets the owner reveal
 * the key again from the list, so the warning says exactly that.
 */
export function CreatedKeyDialog(props: {
  open: boolean
  apiKey: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { copiedText, copyToClipboard } = useCopyToClipboard({ notify: false })
  const copied = props.apiKey !== '' && copiedText === props.apiKey

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={t('createdKey.title')}
      description={t('createdKey.description')}
      contentClassName='sm:max-w-lg'
      contentHeight='auto'
      footer={
        <Button className='rounded-full px-5' onClick={props.onClose}>
          {t('createdKey.done')}
        </Button>
      }
    >
      <div className='flex flex-col gap-3'>
        <div className='bg-muted flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4'>
          <input
            readOnly
            value={props.apiKey}
            aria-label={t('createdKey.label')}
            onFocus={(event) => event.target.select()}
            className='min-w-0 flex-1 bg-transparent font-mono text-sm outline-none'
          />
          <Button
            size='sm'
            className='h-8 shrink-0 rounded-full px-4'
            onClick={() => void copyToClipboard(props.apiKey)}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? t('createdKey.copied') : t('createdKey.copy')}
          </Button>
        </div>
        <p className='text-muted-foreground text-sm leading-6'>
          {t('createdKey.warning')}
        </p>
      </div>
    </Dialog>
  )
}
