/**
 * Helper utilities for the global loading system
 *
 * These utilities provide convenient wrappers around the useLoading hook
 * for common patterns and use cases.
 */

/**
 * Wraps an async function with automatic loading state management
 *
 * @example
 * const saveWithLoading = withLoadingWrapper(
 *   async (data) => await api.save(data),
 *   'Saving your data...'
 * )
 * await saveWithLoading(myData)
 */
export function createLoadingWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  loadingText: string,
  startLoading: (text?: string) => void,
  stopLoading: () => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      startLoading(loadingText)
      return await fn(...args)
    } finally {
      stopLoading()
    }
  }) as T
}

/**
 * Nature-themed loading message keys for i18n
 * Use with useTranslations('utils.loadingMessages')
 *
 * @example
 * const t = useTranslations('utils.loadingMessages')
 * startLoading(t(LoadingMessageKeys.saving))
 */
export const LoadingMessageKeys = {
  // Data operations
  default: 'default',
  verifying: 'verifying',
  loading: 'loading',
  fetching: 'fetching',
  gathering: 'gathering',
  cultivating: 'cultivating',

  // Save operations
  saving: 'saving',
  updating: 'updating',
  persisting: 'persisting',

  // Create operations
  creating: 'creating',
  adding: 'adding',
  generating: 'generating',

  // Delete operations
  deleting: 'deleting',
  removing: 'removing',
  cleaning: 'cleaning',

  // Processing
  processing: 'processing',
  calculating: 'calculating',
  analyzing: 'analyzing',

  // Form operations
  submitting: 'submitting',
  validating: 'validating',

  // Navigation
  navigating: 'navigating',
  loadingPage: 'loadingPage',
  redirecting: 'redirecting',

  // Authentication
  loggingIn: 'loggingIn',
  loggingOut: 'loggingOut',
  authenticating: 'authenticating',

  // File operations
  uploading: 'uploading',
  downloading: 'downloading',
  importing: 'importing',
  exporting: 'exporting',
} as const

/**
 * @deprecated Use LoadingMessageKeys with useTranslations instead
 * For backwards compatibility only - messages are in English
 */
export const LoadingMessages = {
  // Data operations
  default: 'Loading...',
  verifying: 'Verifying your access...',
  loading: 'Growing your data...',
  fetching: 'Harvesting information...',
  gathering: 'Gathering resources...',
  cultivating: 'Cultivating results...',

  // Save operations
  saving: 'Planting your changes...',
  updating: 'Sowing your updates...',
  persisting: 'Rooting your data...',

  // Create operations
  creating: 'Sprouting new growth...',
  adding: 'Planting new seeds...',
  generating: 'Nurturing creation...',

  // Delete operations
  deleting: 'Pruning branches...',
  removing: 'Clearing the undergrowth...',
  cleaning: 'Composting old data...',

  // Processing
  processing: 'Nurturing your request...',
  calculating: 'Growing calculations...',
  analyzing: 'Examining the ecosystem...',

  // Form operations
  submitting: 'Blossoming your submission...',
  validating: 'Checking soil conditions...',

  // Navigation
  navigating: 'Growing new paths...',
  loadingPage: 'Blooming into view...',
  redirecting: 'Branching to new location...',

  // Authentication
  loggingIn: 'Taking root in the system...',
  loggingOut: 'Returning to the earth...',
  authenticating: 'Verifying your seeds...',

  // File operations
  uploading: 'Planting your files...',
  downloading: 'Harvesting your files...',
  importing: 'Transplanting data...',
  exporting: 'Gathering harvest...',
} as const

/**
 * Get a nature-themed loading message for common operations
 */
export function getLoadingMessage(operation: keyof typeof LoadingMessages): string {
  return LoadingMessages[operation]
}

/**
 * Sleep/delay utility for testing loading states
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Simulate a loading operation (useful for testing)
 */
export async function simulateLoading(
  duration: number = 2000,
  text: string = 'Loading...',
  startLoading: (text?: string) => void,
  stopLoading: () => void
): Promise<void> {
  startLoading(text)
  await sleep(duration)
  stopLoading()
}

/**
 * Type-safe wrapper for common async operations with loading state
 */
export interface LoadingOperation<T = void> {
  execute: () => Promise<T>
  text?: string
  onSuccess?: (result: T) => void
  onError?: (error: Error) => void
}

export async function executeWithLoading<T>(
  operation: LoadingOperation<T>,
  startLoading: (text?: string) => void,
  stopLoading: () => void
): Promise<T | undefined> {
  try {
    startLoading(operation.text)
    const result = await operation.execute()
    operation.onSuccess?.(result)
    return result
  } catch (error) {
    operation.onError?.(error as Error)
    throw error
  } finally {
    stopLoading()
  }
}

/**
 * Hook helper for creating loading-wrapped functions
 *
 * @example
 * const { startLoading, stopLoading } = useLoading()
 * const helpers = createLoadingHelpers(startLoading, stopLoading)
 *
 * const saveData = helpers.wrap(
 *   async (data) => await api.save(data),
 *   'Saving data...'
 * )
 */
export function createLoadingHelpers(
  startLoading: (text?: string) => void,
  stopLoading: () => void
) {
  return {
    /**
     * Wrap an async function with loading state
     */
    wrap: <T extends (...args: any[]) => Promise<any>>(fn: T, text: string) => {
      return createLoadingWrapper(fn, text, startLoading, stopLoading)
    },

    /**
     * Execute an operation with loading state
     */
    execute: <T>(operation: LoadingOperation<T>) => {
      return executeWithLoading(operation, startLoading, stopLoading)
    },

    /**
     * Simulate loading for testing
     */
    simulate: (duration?: number, text?: string) => {
      return simulateLoading(duration, text, startLoading, stopLoading)
    },

    /**
     * Get a nature-themed message
     */
    getMessage: getLoadingMessage,

    /**
     * All available messages
     */
    messages: LoadingMessages,
  }
}
