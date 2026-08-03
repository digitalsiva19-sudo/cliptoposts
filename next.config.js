/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Build సమయంలో టైప్‌స్క్రిప్ట్ ఎర్రర్స్ వల్ల డెప్లాయ్ ఆగిపోకుండా చేస్తుంది
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint ఎర్రర్స్ ని ఇగ్నోర్ చేస్తుంది
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
