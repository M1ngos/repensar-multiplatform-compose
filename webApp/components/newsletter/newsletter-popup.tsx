'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import { useNewsletterPopup } from '@/lib/hooks/useNewsletterPopup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormErrors {
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterPopup() {
  const t = useTranslations('Newsletter');
  const { isOpen, setIsOpen, markAsSubscribed } = useNewsletterPopup();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await newsletterApi.subscribe({
        email: email.trim(),
        name: name.trim() || undefined,
      });

      // Mark as subscribed in localStorage
      markAsSubscribed();

      // Show appropriate success message
      if (response.requires_confirmation) {
        toast.success(t('successConfirmation'));
      } else {
        toast.success(t('success'));
      }

      // Close the popup
      setIsOpen(false);

      // Clear form
      setEmail('');
      setName('');
      setErrors({});
    } catch (error) {
      console.error('[NewsletterPopup] Subscribe error:', error);
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newsletter-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('form.email')}
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder={t('form.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({});
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              className="w-full"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="newsletter-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t('form.name')}{' '}
              <span className="text-gray-400">({t('form.optional')})</span>
            </label>
            <Input
              id="newsletter-name"
              type="text"
              placeholder={t('form.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isSubmitting ? t('form.subscribing') : t('form.subscribe')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {t('form.noThanks')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
