import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'States & Constituencies Explorer | 36 States & FCT Nigeria 2027',
  description: 'Explore all 36 Nigerian states and the FCT, 109 Senatorial Districts, and 360 Federal Constituencies for the 2027 General Elections.',
  alternates: {
    canonical: 'https://www.lineup2027.com/states',
  },
  openGraph: {
    title: 'States & Constituencies Explorer — 2027 Nigerian Elections | Lineup 2027',
    description: 'Find your Senatorial District and Federal Constituency across all 36 States and the Federal Capital Territory.',
    url: 'https://www.lineup2027.com/states',
  },
};

export default function StatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
