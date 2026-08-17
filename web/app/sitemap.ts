// web/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://elorgeschools.com';
  const routes: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/features/cbt', priority: 0.9 },
    { path: '/features/lesson-notes', priority: 0.9 },
    { path: '/results', priority: 0.9 },
    { path: '/about', priority: 0.7 },
    { path: '/careers', priority: 0.6 },
    { path: '/contact', priority: 0.7 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }));
}