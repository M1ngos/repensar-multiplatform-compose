'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { contactApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const t = useTranslations('Landing.contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = t('errors.nameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    if (!message.trim()) {
      newErrors.message = t('errors.messageRequired');
    } else if (message.trim().length < 10) {
      newErrors.message = t('errors.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await contactApi.submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      toast.success(t('success'));
      // Clear form
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (error) {
      console.error('[ContactForm] Submit error:', error);
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('form.name')}
        </label>
        <Input
          id="contact-name"
          type="text"
          placeholder={t('form.namePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('form.email')}
        </label>
        <Input
          id="contact-email"
          type="email"
          placeholder={t('form.emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={isSubmitting}
          aria-invalid={!!errors.email}
          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t('form.message')}
        </label>
        <Textarea
          id="contact-message"
          placeholder={t('form.messagePlaceholder')}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
          }}
          disabled={isSubmitting}
          rows={5}
          aria-invalid={!!errors.message}
          className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}
