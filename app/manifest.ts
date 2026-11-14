import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My 2027 Ballot Lineup Nigeria',
    short_name: 'Lineup 2027',
    description: 'Create, customize, and share your personal 2027 Nigerian General Election lineup card.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F0D',
    theme_color: '#20C878',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
