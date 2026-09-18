import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FPL',
    short_name: 'FPL',
    description: 'Track live FPL stats and squad lineups',
    start_url: '/',
    display: 'standalone',
    background_color: '#00e5ff',
    theme_color: '#00e5ff',
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
    shortcuts: [
        {
            name:"FPL Lineup",
            url:"/lineup",
            short_name: 'Lineup',
            icons: [
                {
                  src: '/icon-192.png',
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'maskable',
                }
            ]
        },
        {
            name:"FPL Compiler",
            url:"/compiler",
            short_name: 'Compiler',
            icons: [
                {
                  src: '/icon-192.png',
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'maskable',
                }
            ]
        },
    ]
  };
}