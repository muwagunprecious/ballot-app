import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'My 2027 Lineup — Nigerian Election Ballot Generator',
  description: 'A sophisticated civic platform for formulating, styling, and sharing your personal 2027 Nigerian General Election candidate ballot card.',
  keywords: ['Nigeria 2027', 'My 2027 Lineup', 'Ballot Generator', 'Nigerian Elections', 'Civic Tech Nigeria'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${newsreader.variable} dark h-full antialiased`}>
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
