import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FPL',
    short_name: 'FPL',
    description: 'Track live FPL stats and squad lineups',
    start_url: '/',
    display: 'standalone',
    background_color: '#00e5ff',
    theme_color: '#37003c',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}