/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow mobile testing on the local network
  allowedDevOrigins: ['192.168.0.101', 'localhost'],
  // Hide the Next.js dev indicator button
  devIndicators: false,
  // Enable standalone output for Docker/Railway/Render deployment
  output: 'standalone',
};

export default nextConfig;

