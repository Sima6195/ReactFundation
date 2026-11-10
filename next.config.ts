
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcrypt'],
  allowedDevOrigins: ['10.100.31.231'],
};

export default nextConfig;
