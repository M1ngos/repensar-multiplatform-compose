'use client'

import { useLoading } from './useLoading'
import { useTranslations } from 'next-intl'
import { LoadingMessageKeys } from './useLoadingHelpers'

/**
 * Hook that combines useLoading with i18n translations
 * Provides convenient methods for showing loading states with translated messages
 *
 * @example
 * const { startLoading, stopLoading, t } = useLoadingWithIntl()
 *
 * // Use with message key
 * startLoading('saving')
 *
 * // Use with custom translated text
 * startLoading(t('customMessage'))
 *
 * // Use predefined keys
 * startLoading(LoadingMessageKeys.fetching)
 */
export function useLoadingWithIntl() {
  const loading = useLoading()
  const t = useTranslations('utils.loadingMessages')

  /**
   * Start loading with a translated message
   * @param messageKey - Key from LoadingMessageKeys or custom message
   */
  const startLoading = (messageKey?: keyof typeof LoadingMessageKeys | string) => {
    if (messageKey && messageKey in LoadingMessageKeys) {
      loading.startLoading(t(messageKey as keyof typeof LoadingMessageKeys))
    } else if (messageKey) {
      loading.startLoading(messageKey)
    } else {
      loading.startLoading(t('default'))
    }
  }

  return {
    ...loading,
    startLoading,
    t,
    /** Message keys for autocomplete */
    keys: LoadingMessageKeys,
  }
}

/**
 * Type-safe message keys
 */
export type LoadingMessageKey = keyof typeof LoadingMessageKeys
