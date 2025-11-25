import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FinTrack - Bütçe Takip',
  description: 'Kişisel finans yönetim uygulaması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
