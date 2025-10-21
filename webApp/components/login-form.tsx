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
import { useAuth } from '@/lib/hooks/useAuth.tsx';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ForgotPasswordDialog } from '@/components/forgot-password-dialog';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations('Login');
  const { login, isLoginLoading, googleSignIn, isGoogleLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login({ email, password });
      // Redirect to dashboard or home after successful login
      router.push('/portal');
    } catch (err: any) {
      console.error('[LoginForm] Login error:', err);
      toast.error(t('loginError'));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // Note: User will be redirected to Google, so no need to handle success here
    } catch (err: any) {
      console.error('[LoginForm] Google Sign In error:', err);
      toast.error(t('googleSignInError') || 'Failed to sign in with Google');
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="relative text-center">
            //TODO: fix position
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute left-2 top-2 sm:left-4 sm:top-4 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t('goBack')}</span>
          </Button>
          <CardTitle className="text-xl pt-8 sm:pt-4">{t('welcomeBack')}</CardTitle>
          <CardDescription>
            {t('socialLoginPrompt')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                {/*<Button variant="outline" type="button">*/}
                {/*  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">*/}
                {/*    <path*/}
                {/*      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"*/}
                {/*      fill="currentColor"*/}
                {/*    />*/}
                {/*  </svg>*/}
                {/*  {t('loginWithApple')}*/}
                {/*</Button>*/}
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoginLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {isGoogleLoading ? t('loggingIn') || 'Loading...' : t('loginWithGoogle')}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('orContinueWith')}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoginLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoginLoading}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoginLoading}>
                  {isLoginLoading ? t('loggingIn') || 'Logging in...' : t('loginButton')}
                </Button>
                <FieldDescription className="text-center">
                  {t('noAccountPrompt')} <Link href="/register">{t('signUp')}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t('termsPrefix')}<Link href="/terms-of-service" className="underline underline-offset-4 hover:text-primary">{t('termsOfService')}</Link>{" "}
        {t('and')} <Link href="/privacy-policy" className="underline underline-offset-4 hover:text-primary">{t('privacyPolicy')}</Link>{t('termsSuffix')}
      </FieldDescription>
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  )
}
