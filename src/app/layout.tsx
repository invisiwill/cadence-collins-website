import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cadence Collins for School Board',
  description: 'Building stronger schools, supporting our teachers, and ensuring every child has the opportunity to succeed.',
  openGraph: {
    title: 'Cadence Collins for School Board',
    description: 'Building stronger schools, supporting our teachers, and ensuring every child has the opportunity to succeed.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}