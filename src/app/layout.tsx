import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { PermissionProvider } from '@/lib/permissions/context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Carton ERP | نظام إدارة مصنع الكرتون المضلع',
  description: 'نظام متكامل لتتبع وإدارة مصانع الكرتون المضلع والعمليات الصناعية والمالية',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <I18nProvider>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
