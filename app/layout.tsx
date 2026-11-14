import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

export const viewport: Viewport = {
  themeColor: '#0B0F0D',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lineup2027.com'),
  title: {
    default: 'My 2027 Ballot Lineup Nigeria | Build & Share Your 2027 Election Card',
    template: '%s | Lineup 2027 Nigeria',
  },
  description: 'A fast, lightweight civic platform for formulating, styling, and sharing your personal 2027 Nigerian General Election candidates lineup card. Pick your President, Governor, Senator, and Representative across all 36 States and the FCT.',
  applicationName: 'My 2027 Ballot Lineup Nigeria',
  authors: [{ name: 'Lineup 2027 Civic Initiative', url: 'https://www.lineup2027.com' }],
  generator: 'Next.js',
  keywords: [
    'Nigeria 2027',
    'My 2027 ballot line-up Nigeria',
    'Nigerian Elections 2027',
    '2027 Lineup',
    'Lineup 2027',
    'lineup2027.com',
    '2027lineup',
    'Nigerian Presidential Candidates 2027',
    'Governorship election 2027',
    'Nigerian Senate candidates 2027',
    'House of Representatives Nigeria 2027',
    'Ballot Card Generator Nigeria',
    'Civic Tech Nigeria',
    'INEC 2027 candidates',
    'Nigeria election slate',
    'APC candidates 2027',
    'PDP candidates 2027',
    'LP candidates 2027',
    'NNPP candidates 2027',
    'Vote Nigeria 2027',
    '#my2027lineup',
    'Nigerian democracy',
    'State election candidates Nigeria',
  ],
  creator: 'Lineup 2027 Civic Initiative',
  publisher: 'Lineup 2027',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://www.lineup2027.com',
    languages: {
      'en-NG': 'https://www.lineup2027.com',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://www.lineup2027.com',
    siteName: 'My 2027 Ballot Lineup Nigeria',
    title: 'My 2027 Ballot Lineup Nigeria — Create & Share Your 2027 Election Card',
    description: 'Build, customize, and share your personal candidate lineup for the 2027 Nigerian General Election. Select President, Governor, Senator, and Representative across all 36 States + FCT.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'My 2027 Ballot Lineup Nigeria — #my2027lineup',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My 2027 Ballot Lineup Nigeria — #my2027lineup',
    description: 'Build, customize, and share your personal candidate lineup for the 2027 Nigerian General Election. Pick your President, Governor, Senator, and Representative.',
    images: ['/opengraph-image'],
    creator: '@lineup2027',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
  category: 'Civic Technology & Elections',
  classification: 'Civic Engagement & Election Awareness',
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'My 2027 Ballot Lineup Nigeria',
  alternateName: ['Lineup 2027', '2027 Lineup', 'Lineup2027'],
  url: 'https://www.lineup2027.com',
  description: 'Civic technology platform empowering Nigerian citizens to formulate, style, and share personalized candidate lineups for the 2027 General Elections.',
  inLanguage: 'en-NG',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.lineup2027.com/candidates?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdWebApplication = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'My 2027 Ballot Lineup Nigeria',
  url: 'https://www.lineup2027.com',
  applicationCategory: 'GovernmentApplication',
  operatingSystem: 'All',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
  },
  description: 'Interactive 2027 Nigerian election lineup card builder covering Presidential, Governorship, Senatorial, and House of Representatives elections.',
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Lineup 2027 Civic Initiative',
  url: 'https://www.lineup2027.com',
  email: 'Hi@lineup2027.com',
  logo: 'https://www.lineup2027.com/icon.svg',
  sameAs: ['https://twitter.com/lineup2027'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${newsreader.variable} dark h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApplication) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0B0F0D] text-[#F5F7F5] font-sans antialiased selection:bg-[#20C878] selection:text-[#0B0F0D]">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
