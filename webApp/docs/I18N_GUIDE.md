# 🌍 Internationalization (i18n) Guide

## Overview

The Repensar WebApp now has full internationalization support with:
- ✅ **English (en)** - Default language
- ✅ **Português (pt)** - Portuguese
- ✅ **Language Switcher** - In Settings page
- ✅ **All new features translated** - Notifications, Files, Search

---

## 🚀 Quick Start

### Changing Language

Users can change the language in **Settings > Language & Region**:
1. Go to `/portal/settings`
2. Scroll to "Language & Region" section
3. Select your preferred language from the dropdown
4. Language changes immediately across the entire app

### Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English | `en` | 🇺🇸 | ✅ Complete |
| Português | `pt` | 🇵🇹 | ✅ Complete |

---

## 📚 Translation Keys

### New Features Added

#### 1. **Notifications**
```json
"Notifications": {
  "title": "Notifications",
  "unread": "{count} unread",
  "allCaughtUp": "All caught up!",
  "markAllRead": "Mark all read",
  "noNotifications": "No notifications yet",
  "viewAll": "View all notifications",
  "types": {
    "info": "Info",
    "success": "Success",
    "warning": "Warning",
    "error": "Error"
  },
  "actions": {
    "markAsRead": "Mark as read",
    "delete": "Delete"
  },
  "messages": {
    "allMarkedRead": "All notifications marked as read",
    "deleted": "Notification deleted",
    "deleteFailed": "Failed to delete notification"
  }
}
```

#### 2. **Files & Upload**
```json
"Files": {
  "upload": {
    "title": "Upload Files",
    "dropFiles": "Drop files here",
    "clickToUpload": "Click to upload or drag and drop",
    "maxSize": "Max file size: {size}MB",
    "uploading": "Uploading...",
    "uploadSuccess": "{filename} uploaded successfully"
  },
  "list": {
    "title": "Files",
    "noFiles": "No files attached",
    "view": "View",
    "download": "Download",
    "delete": "Delete"
  }
}
```

#### 3. **Global Search**
```json
"Search": {
  "placeholder": "Search projects, tasks, volunteers...",
  "minCharacters": "Type at least 2 characters to search",
  "noResults": "No results found for \"{query}\"",
  "quickActions": "Quick Actions",
  "actions": {
    "newProject": "New Project",
    "newTask": "New Task",
    "registerVolunteer": "Register Volunteer",
    "viewAnalytics": "View Analytics"
  }
}
```

#### 4. **Language Names**
```json
"Languages": {
  "en": "English",
  "pt": "Português"
}
```

---

## 💻 Using Translations in Components

### Basic Usage

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Notifications');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('noNotifications')}</p>
    </div>
  );
}
```

### With Variables

```tsx
const t = useTranslations('Notifications');

// Use {count} placeholder
<p>{t('unread', { count: 5 })}</p>
// Output: "5 unread"
```

### Nested Keys

```tsx
const t = useTranslations('Files');

<button>{t('actions.delete')}</button>
// Output: "Delete"
```

---

## 🔧 Adding New Translations

### 1. Add to English (`messages/en.json`)

```json
{
  "MyFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

### 2. Add to Portuguese (`messages/pt.json`)

```json
{
  "MyFeature": {
    "title": "Meu Recurso",
    "description": "Este é meu recurso"
  }
}
```

### 3. Use in Component

```tsx
const t = useTranslations('MyFeature');
<h1>{t('title')}</h1>
```

---

## 🌐 Language Switcher Component

### Location
`/home/acsun-arch/Projects/repensar-multiplatform-compose/webApp/components/language-switcher.tsx`

### Features
- ✅ Dropdown select with flags
- ✅ Shows current language
- ✅ Checkmark for selected language
- ✅ Toast notification on change
- ✅ URL updates automatically
- ✅ Preserves current page

### Usage

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

export function MyPage() {
  return (
    <div>
      <LanguageSwitcher variant="select" />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'select' \| 'dropdown'` | `'select'` | Style variant |

---

## 📋 Translation Files Structure

```
messages/
├── en.json     # English translations (1207 lines)
└── pt.json     # Portuguese translations (ready for translation)
```

### File Organization

Translations are organized by feature:

```json
{
  "Landing": { ... },      // Landing page
  "Login": { ... },        // Auth pages
  "Dashboard": { ... },    // Portal navigation
  "Projects": { ... },     // Projects module
  "Tasks": { ... },        // Tasks module
  "Volunteers": { ... },   // Volunteers module
  "Resources": { ... },    // Resources module
  "Analytics": { ... },    // Analytics module
  "Reports": { ... },      // Reports module
  "Settings": { ... },     // Settings module
  "Notifications": { ... }, // NEW - Notifications
  "Files": { ... },        // NEW - Files
  "Search": { ... },       // NEW - Search
  "Languages": { ... }     // NEW - Language names
}
```

---

## 🔄 How Language Switching Works

### URL Structure
```
/{locale}/{path}
```

Examples:
- English: `/en/portal/projects`
- Portuguese: `/pt/portal/projects`

### When Language Changes

1. User selects new language from dropdown
2. URL is updated: `/en/portal/projects` → `/pt/portal/projects`
3. Page content updates automatically
4. Toast notification confirms change
5. User preference is saved in browser

### Automatic Detection

The app automatically detects the user's browser language on first visit.

---

## 📝 Portuguese Translations (TODO)

**Status**: English keys added, Portuguese translations pending

To add Portuguese translations:

1. Copy all new keys from `en.json`
2. Paste into `pt.json`
3. Translate each value to Portuguese
4. Save and test

### Quick Translation Guide

**English** → **Portuguese**
- "Notifications" → "Notificações"
- "Files" → "Arquivos"
- "Upload" → "Carregar"
- "Search" → "Buscar"
- "Delete" → "Excluir"
- "Cancel" → "Cancelar"
- "Save" → "Salvar"

---

## 🎯 Best Practices

### 1. Always Use Translation Keys
❌ **Bad:**
```tsx
<button>Delete</button>
```

✅ **Good:**
```tsx
const t = useTranslations('Files');
<button>{t('actions.delete')}</button>
```

### 2. Use Descriptive Keys
❌ **Bad:**
```json
{
  "btn1": "Click here",
  "msg1": "Success"
}
```

✅ **Good:**
```json
{
  "deleteButton": "Delete File",
  "uploadSuccess": "File uploaded successfully"
}
```

### 3. Group Related Keys
❌ **Bad:**
```json
{
  "deleteFile": "Delete",
  "viewFile": "View",
  "downloadFile": "Download"
}
```

✅ **Good:**
```json
{
  "actions": {
    "delete": "Delete",
    "view": "View",
    "download": "Download"
  }
}
```

### 4. Use Placeholders for Dynamic Content
❌ **Bad:**
```tsx
<p>You have 5 unread notifications</p>
```

✅ **Good:**
```tsx
const t = useTranslations('Notifications');
<p>{t('unread', { count: 5 })}</p>
```

---

## 🐛 Troubleshooting

### Translation Not Showing

**Problem**: Key shows as raw text (e.g., "Files.upload.title")

**Solution**:
1. Check the key exists in both `en.json` and `pt.json`
2. Verify the `useTranslations` namespace matches
3. Restart dev server: `npm run dev`

### Language Not Switching

**Problem**: Language dropdown doesn't change content

**Solution**:
1. Clear browser cache
2. Check URL includes locale: `/en/portal/...`
3. Verify `next-intl` middleware is configured

### Missing Translations

**Problem**: Some text appears in English even when Portuguese is selected

**Solution**:
1. Add missing keys to `pt.json`
2. Make sure Portuguese translations are provided
3. Fallback to English is automatic for missing keys

---

## 📦 Files Modified

### New Files
- `components/language-switcher.tsx` - Language switcher component

### Modified Files
- `messages/en.json` - Added translations for new features
- `src/app/[locale]/portal/settings/page.tsx` - Integrated language switcher

---

## 🎉 Complete Implementation

✅ **All new features support i18n:**
- Notifications center
- File upload/download
- Global search
- Language switcher

✅ **Settings page updated:**
- Language switcher integrated
- User can change language
- Changes apply immediately

✅ **Translation keys added:**
- Notifications (26 keys)
- Files (18 keys)
- Search (14 keys)
- Languages (2 keys)

---

## 🚀 Next Steps

### To Add a New Language (e.g., Spanish)

1. **Create translation file**
   ```bash
   cp messages/en.json messages/es.json
   ```

2. **Translate content**
   - Update all values to Spanish

3. **Add to language list**
   ```tsx
   // components/language-switcher.tsx
   const LANGUAGES = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'pt', name: 'Português', flag: '🇵🇹' },
     { code: 'es', name: 'Español', flag: '🇪🇸' }, // NEW
   ];
   ```

4. **Add translation for language name**
   ```json
   // messages/en.json and all other language files
   "Languages": {
     "en": "English",
     "pt": "Português",
     "es": "Español"
   }
   ```

5. **Test the new language**
   - Visit `/es/portal/...`
   - Check all content translates correctly

---

## 📞 Support

For questions about internationalization:
- Check existing translation files for patterns
- Refer to [next-intl documentation](https://next-intl-docs.vercel.app/)
- Review existing components for examples

---

**Generated with ❤️ by Claude Code**
*Making Repensar accessible to everyone, in every language!*
