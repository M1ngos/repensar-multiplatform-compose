'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
}

interface Requirement {
  key: string;
  test: (password: string) => boolean;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const t = useTranslations('Settings.security');

  const requirements: Requirement[] = useMemo(
    () => [
      {
        key: 'minLength',
        test: (pwd) => pwd.length >= 8,
      },
      {
        key: 'uppercase',
        test: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        key: 'lowercase',
        test: (pwd) => /[a-z]/.test(pwd),
      },
      {
        key: 'number',
        test: (pwd) => /[0-9]/.test(pwd),
      },
      {
        key: 'special',
        test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      },
    ],
    []
  );

  const results = useMemo(
    () => requirements.map((req) => ({ ...req, met: req.test(password) })),
    [password, requirements]
  );

  const metCount = useMemo(
    () => results.filter((r) => r.met).length,
    [results]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t('requirements.title')}</span>
        <span className={cn('font-medium', metCount === requirements.length && 'text-green-600 dark:text-green-400')}>
          {metCount}/{requirements.length}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2" role="list">
        {results.map((requirement) => (
          <li
            key={requirement.key}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors duration-200',
              requirement.met
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            )}
          >
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200',
                requirement.met
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground/30'
              )}
            >
              {requirement.met && <Check className="size-3" />}
            </span>
            <span>{t(`requirements.${requirement.key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
