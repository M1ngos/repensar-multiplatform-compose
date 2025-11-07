'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

interface LanguageSwitcherProps {
  variant?: 'select' | 'dropdown';
}

export function LanguageSwitcher({ variant = 'select' }: LanguageSwitcherProps) {
  const t = useTranslations('Languages');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      // Replace the locale in the pathname
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
      toast.success(`Language changed to ${LANGUAGES.find(l => l.code === newLocale)?.name}`);
    });
  };

  if (variant === 'select') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={locale} onValueChange={handleLanguageChange} disabled={isPending}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {LANGUAGES.find((l) => l.code === locale)?.flag}{' '}
              {t(locale as 'en' | 'pt')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{t(lang.code as 'en' | 'pt')}</span>
                  {locale === lang.code && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return null;
}
