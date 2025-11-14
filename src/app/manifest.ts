import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BESTINVEST CAMIMOB - Agentie Imobiliara Buzau',
    short_name: 'CAMIMOB',
    description: 'Agentie imobiliara moderna din Buzau. Oferte de calitate pentru apartamente, case, terenuri si spatii comerciale. Tranzactii sigure.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/imagecam.png',
        sizes: '400x400',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/imagecam.png',
        sizes: '400x400',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'real estate'],
    lang: 'ro',
  };
}
