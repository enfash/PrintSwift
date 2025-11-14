
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'clipboard-write=self',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
        'placehold.co',
        'images.unsplash.com',
        'picsum.photos',
        'firebasestorage.googleapis.com',
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
        'https://6000-firebase-studio-1762651024713.cluster-64pjnskmlbaxowh5lzq6i7v4ra.cloudworkstations.dev',
    ]
  },
};

export default nextConfig;
