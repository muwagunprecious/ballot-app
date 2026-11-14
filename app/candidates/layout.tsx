import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2027 Candidates Directory | INEC Verified Candidates List',
  description: 'Search and inspect verified 2027 Nigerian General Election candidates across Presidential, Governorship, Senate, and House of Representatives races.',
  alternates: {
    canonical: 'https://www.lineup2027.com/candidates',
  },
  openGraph: {
    title: '2027 Nigerian Election Candidates Directory | Lineup 2027',
    description: 'Explore candidates across all political parties (APC, PDP, LP, NNPP, APGA, ADC, and more) for the 2027 general elections.',
    url: 'https://www.lineup2027.com/candidates',
  },
};

export default function CandidatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
