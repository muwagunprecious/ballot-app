import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Export & Share Your 2027 Lineup Card | #my2027lineup',
  description: 'Download your high-resolution customized 2027 Nigerian election lineup card in landscape, square, or story formats and share directly on X and WhatsApp.',
  alternates: {
    canonical: 'https://www.lineup2027.com/export',
  },
  openGraph: {
    title: 'Export Your 2027 Election Card | #my2027lineup',
    description: 'Share your 2027 Nigerian ballot lineup with your community. Make yours at www.lineup2027.com.',
    url: 'https://www.lineup2027.com/export',
  },
};

export default function ExportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
