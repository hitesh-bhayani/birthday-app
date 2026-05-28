/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow mobile testing on the local network
  allowedDevOrigins: ['192.168.0.101', 'localhost'],
  // Hide the Next.js dev indicator button
  devIndicators: false,
  // Enable standalone output for Docker/Railway/Render deployment
  output: 'standalone',
  // Aggressive browser caching for static media — loads instantly on 2nd visit
  async headers() {
    return [
      {
        // Cache photos, music, voice notes for 1 year in browser
        source: '/(original_images|uploads|voice-notes)/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache audio files for 1 year
        source: '/:file(.*\\.mp3)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;


