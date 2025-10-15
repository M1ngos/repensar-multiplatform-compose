'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslations } from 'next-intl';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { toast } from 'sonner';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('Register');
  const { register, isRegisterLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    console.log('[RegisterForm] Starting registration...');
    console.log('[RegisterForm] Form data:', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      user_type: 'volunteer',
    });

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        user_type: 'volunteer',
      });

      console.log('[RegisterForm] Registration successful!');
      toast.success(t('registrationSuccess'));

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('[RegisterForm] Registration error:', err);
      console.error('[RegisterForm] Error detail:', err?.detail);
      console.error('[RegisterForm] Full error object:', JSON.stringify(err, null, 2));
      toast.error(err?.detail || t('registrationError'));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="absolute right-4 top-4 p-2"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('goBack')}
            </Button>
          <CardTitle className="text-xl">{t('createAccount')}</CardTitle>
          <CardDescription>
            {t('signUpPrompt')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('signUpWithGoogle')}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('orContinueWith')}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={isRegisterLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isRegisterLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">{t('phone')}</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={20}
                  disabled={isRegisterLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isRegisterLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">{t('confirmPassword')}</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  disabled={isRegisterLoading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isRegisterLoading}>
                  {isRegisterLoading ? t('registering') : t('registerButton')}
                </Button>
                <FieldDescription className="text-center">
                  {t('alreadyHaveAccount')} <Link href="/login">{t('signIn')}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t('termsPrefix')}<a href="#">{t('termsOfService')}</a>{" "}
        {t('and')} <a href="#">{t('privacyPolicy')}</a>{t('termsSuffix')}
      </FieldDescription>
    </div>
  )
}
