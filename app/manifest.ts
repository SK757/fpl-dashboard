import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FPL',
    short_name: 'FPL',
    description: 'Track live FPL stats and squad lineups',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#00e5ff',
    theme_color: '#00e5ff',
    icons: [
      {
        src: '/icon-192-transparent.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512-transparent.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name:"FPL Lineup",
        url:"/lineup",
        short_name: 'Lineup',
        icons: [
          {
            src: '/icon-shortcut-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icon-shortcut-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ]
      },
      {
        name:"FPL Compiler",
        url:"/compiler",
        short_name: 'Compiler',
        icons: [
          {
            src: '/icon-shortcut-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icon-shortcut-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ]
      },
      {
        name:"FPL Fixtures",
        url:"/fixtures",
        short_name: 'Fixtures',
        icons: [
          {
            src: '/icon-shortcut-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icon-shortcut-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ]
      },
    ]
  };
}