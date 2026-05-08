/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization domains
  images: {
    domains: [
      // Supabase Storage
      "localhost",
      "*.supabase.co",
      "*.supabase.in",
      // External services
      "images.unsplash.com",
      "maps.googleapis.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self'",
              "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://events.mapbox.com",
              "frame-src 'self'",
              "media-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/business",
        destination: "/business/dashboard",
        permanent: true,
      },
      {
        source: "/business/schedule",
        destination: "/business/schedule",
        permanent: false,
      },
      // Redirect old URLs if migrating
      // {
      //   source: "/old-path",
      //   destination: "/new-path",
      //   permanent: true,
      // },
    ];
  },

  // Rewrites
  async rewrites() {
    return [
      {
        source: "/api/health",
        destination: "/api/health",
      },
    ];
  },

  // Build output
  output: "standalone",
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Compress responses
  compress: true,
  
  // Trailing slashes
  trailingSlash: false,

  // Experimental features
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
