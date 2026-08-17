// web/app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/signup',
          '/finance',
          '/super-admin',
          '/change-password',
          '/forgot-password',
          '/*/admin',
          '/*/admin/*',
          '/*/staff',
          '/*/staff/*',
        ],
      },
    ],
    sitemap: 'https://elorgeschools.com/sitemap.xml',
  };
}