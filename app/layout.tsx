import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Pramod Singh AI Sales Agent',
  description: 'AI Sales Agent Dashboard for Pramod Singh Website Management',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-gray-900 bg-gray-50" suppressHydrationWarning>{children}</body>
    </html>
  );
}
