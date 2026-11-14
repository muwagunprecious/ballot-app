import type { MetadataRoute } from 'next';
import { NIGERIAN_STATES } from '@/lib/data/states';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.lineup2027.com';
  const currentDate = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/candidates`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/states`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/export`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const stateRoutes: MetadataRoute.Sitemap = NIGERIAN_STATES.map((state) => ({
    url: `${baseUrl}/states?state=${state.code}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...stateRoutes];
}
