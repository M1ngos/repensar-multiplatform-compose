import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <div className="flex items-center justify-center min-h-[100dvh] bg-green-50 dark:bg-gray-900 px-6 select-none">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex justify-center">
                    <CircleAlert className="size-16 text-green-600 dark:text-green-400 drop-shadow-sm" />
                </div>
                <h1 className="text-5xl font-extrabold text-green-900 dark:text-green-200 tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-lg text-green-700 dark:text-green-400 leading-relaxed">
                    {t('description')}
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white bg-green-600 font-medium shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-300"
                >
                    {t('goHome')}
                </Link>
            </div>
        </div>
    );
}
