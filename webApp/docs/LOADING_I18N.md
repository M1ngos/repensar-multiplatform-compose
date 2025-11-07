# Global Loading with Internationalization (i18n)

The nature loader system is fully internationalized with support for multiple languages.

## Quick Start

### Option 1: Use the i18n Hook (Recommended)

```tsx
'use client'

import { useLoadingWithIntl } from '@/lib/hooks/useLoadingWithIntl'

export function MyComponent() {
  const { startLoading, stopLoading, keys } = useLoadingWithIntl()

  const handleSave = async () => {
    try {
      startLoading('saving')  // Auto-translated!
      await api.save(data)
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Option 2: Use Translations Manually

```tsx
'use client'

import { useLoading } from '@/lib/hooks/useLoading'
import { useTranslations } from 'next-intl'
import { LoadingMessageKeys } from '@/lib/hooks/useLoadingHelpers'

export function MyComponent() {
  const { startLoading, stopLoading } = useLoading()
  const t = useTranslations('utils.loadingMessages')

  const handleSave = async () => {
    try {
      startLoading(t('saving'))
      await api.save(data)
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

## Available Languages

- **English (en)**: Nature-themed messages in English
- **Portuguese (pt)**: Mensagens temáticas da natureza em português

## Message Keys

All messages are available in `utils.loadingMessages`:

### Data Operations
- `default` - Generic loading
- `verifying` - Verifying access
- `loading` - Loading data
- `fetching` - Fetching information
- `gathering` - Gathering resources
- `cultivating` - Cultivating results

### Save Operations
- `saving` - Saving changes
- `updating` - Updating data
- `persisting` - Persisting data

### Create Operations
- `creating` - Creating new items
- `adding` - Adding items
- `generating` - Generating content

### Delete Operations
- `deleting` - Deleting items
- `removing` - Removing items
- `cleaning` - Cleaning up

### Processing
- `processing` - Processing requests
- `calculating` - Calculating
- `analyzing` - Analyzing

### Form Operations
- `submitting` - Submitting forms
- `validating` - Validating input

### Navigation
- `navigating` - Navigating
- `loadingPage` - Loading page
- `redirecting` - Redirecting

### Authentication
- `loggingIn` - Logging in
- `loggingOut` - Logging out
- `authenticating` - Authenticating

### File Operations
- `uploading` - Uploading files
- `downloading` - Downloading files
- `importing` - Importing data
- `exporting` - Exporting data

## Examples

### Basic Usage

```tsx
const { startLoading, stopLoading } = useLoadingWithIntl()

// Simple key
startLoading('saving')

// Will show:
// EN: "Planting your changes..."
// PT: "Plantando suas alterações..."
```

### With Type Safety

```tsx
import { LoadingMessageKey } from '@/lib/hooks/useLoadingWithIntl'

const showLoading = (key: LoadingMessageKey) => {
  startLoading(key)  // Autocomplete works!
}

showLoading('fetching')
```

### Custom Messages

```tsx
const { startLoading, stopLoading, t } = useLoadingWithIntl()

// Use a predefined key
startLoading('saving')

// Or use a custom translation
startLoading(t('myCustomKey'))

// Or just pass a string (not translated)
startLoading('Custom message')
```

### In Forms

```tsx
'use client'

import { useLoadingWithIntl } from '@/lib/hooks/useLoadingWithIntl'

export function ContactForm() {
  const { startLoading, stopLoading } = useLoadingWithIntl()

  const onSubmit = async (data) => {
    try {
      startLoading('submitting')
      await api.submitForm(data)
    } finally {
      stopLoading()
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

### With File Upload

```tsx
const { startLoading, stopLoading } = useLoadingWithIntl()

const handleUpload = async (files: File[]) => {
  try {
    startLoading('uploading')
    await uploadFiles(files)
  } finally {
    stopLoading()
  }
}
```

## Translation Files

### English (`messages/en.json`)

```json
{
  "utils": {
    "loadingMessages": {
      "saving": "Planting your changes...",
      "fetching": "Harvesting information...",
      ...
    }
  }
}
```

### Portuguese (`messages/pt.json`)

```json
{
  "utils": {
    "loadingMessages": {
      "saving": "Plantando suas alterações...",
      "fetching": "Colhendo informações...",
      ...
    }
  }
}
```

## Adding New Languages

1. Create a new message file: `messages/[locale].json`

2. Add the `utils.loadingMessages` section:

```json
{
  "utils": {
    "loadingMessages": {
      "default": "Your translation...",
      "saving": "Your translation...",
      ...
    }
  }
}
```

3. The system will automatically use the new translations!

## Migration Guide

### From Old LoadingMessages Object

**Before:**
```tsx
import { LoadingMessages } from '@/lib/hooks/useLoadingHelpers'

startLoading(LoadingMessages.saving)
```

**After:**
```tsx
import { useLoadingWithIntl } from '@/lib/hooks/useLoadingWithIntl'

const { startLoading } = useLoadingWithIntl()
startLoading('saving')
```

### Backwards Compatibility

The old `LoadingMessages` object still works but is deprecated:

```tsx
// Still works, but not translated
import { LoadingMessages } from '@/lib/hooks/useLoadingHelpers'
startLoading(LoadingMessages.saving)  // Always English
```

## Best Practices

1. **Always use the i18n hook** for new code:
   ```tsx
   const { startLoading, stopLoading } = useLoadingWithIntl()
   ```

2. **Use message keys** instead of hardcoded strings:
   ```tsx
   // ✅ Good - Translated
   startLoading('saving')

   // ❌ Bad - Not translated
   startLoading('Saving data...')
   ```

3. **Be consistent** with message keys across your app

4. **Test in all languages** to ensure messages fit in your UI

## Troubleshooting

### Messages not translating

Make sure you're using the i18n hook:
```tsx
import { useLoadingWithIntl } from '@/lib/hooks/useLoadingWithIntl'
const { startLoading } = useLoadingWithIntl()
```

### TypeScript errors

Import the type for autocomplete:
```tsx
import { LoadingMessageKey } from '@/lib/hooks/useLoadingWithIntl'
```

### Wrong language showing

Check your locale configuration in `next-intl`.

## See Also

- [Global Loading Documentation](./GLOBAL_LOADING.md)
- [Quick Reference](./LOADING_QUICK_REFERENCE.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
