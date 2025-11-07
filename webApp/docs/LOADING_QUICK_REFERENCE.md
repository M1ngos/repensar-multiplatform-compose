# Global Loading - Quick Reference

## Import (with i18n - Recommended)

```tsx
import { useLoadingWithIntl } from '@/lib/hooks/useLoadingWithIntl'
```

## Import (without i18n)

```tsx
import { useLoading } from '@/lib/hooks/useLoading'
```

## Basic Pattern (i18n)

```tsx
const { startLoading, stopLoading } = useLoadingWithIntl()

try {
  startLoading('saving')  // Auto-translated!
  await yourAsyncOperation()
} finally {
  stopLoading()
}
```

## Basic Pattern (no i18n)

```tsx
const { startLoading, stopLoading } = useLoading()

try {
  startLoading('Your message...')
  await yourAsyncOperation()
} finally {
  stopLoading()
}
```

## Common Use Cases

### Button Click
```tsx
const handleClick = async () => {
  startLoading('Processing...')
  await doSomething()
  stopLoading()
}
```

### Form Submit
```tsx
const onSubmit = async (data) => {
  try {
    startLoading('Saving...')
    await api.save(data)
  } finally {
    stopLoading()
  }
}
```

### Data Fetch
```tsx
useEffect(() => {
  startLoading('Loading data...')
  fetchData().finally(stopLoading)
}, [])
```

### Navigation
```tsx
const navigate = () => {
  startLoading('Loading page...')
  router.push('/path')
}
```

## Message Keys (i18n)

```tsx
// Just use the key - auto-translates to current language!
startLoading('saving')        // EN: "Planting your changes..."
                              // PT: "Plantando suas alterações..."

startLoading('fetching')      // EN: "Harvesting information..."
                              // PT: "Colhendo informações..."

startLoading('creating')      // EN: "Sprouting new growth..."
                              // PT: "Brotando novo crescimento..."

startLoading('uploading')     // EN: "Planting your files..."
                              // PT: "Plantando seus arquivos..."
```

### Available Keys

Data: `loading`, `fetching`, `gathering`, `cultivating`
Save: `saving`, `updating`, `persisting`
Create: `creating`, `adding`, `generating`
Delete: `deleting`, `removing`, `cleaning`
Process: `processing`, `calculating`, `analyzing`
Forms: `submitting`, `validating`
Nav: `navigating`, `loadingPage`, `redirecting`
Auth: `loggingIn`, `loggingOut`, `authenticating`
Files: `uploading`, `downloading`, `importing`, `exporting`

## Nature-Themed Messages (English only - deprecated)

```tsx
// Saving
startLoading('Planting your changes...')
startLoading('Sowing your updates...')

// Loading
startLoading('Growing your data...')
startLoading('Cultivating results...')

// Fetching
startLoading('Harvesting information...')
startLoading('Gathering resources...')

// Processing
startLoading('Nurturing your request...')
startLoading('Blossoming your submission...')
```

## Full API

```tsx
const {
  isLoading,           // boolean - current state
  loadingText,         // string - current text
  setLoading,          // (bool, text?) => void
  startLoading,        // (text?) => void
  stopLoading          // () => void
} = useLoading()
```

## Tips

✅ **DO**: Use try-finally to ensure loading stops
✅ **DO**: Use descriptive, nature-themed messages
✅ **DO**: Keep messages action-oriented

❌ **DON'T**: Forget to call stopLoading()
❌ **DON'T**: Nest loading states unnecessarily
❌ **DON'T**: Use vague messages like "Please wait..."
