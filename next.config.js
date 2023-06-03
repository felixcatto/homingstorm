import withBundleAnalyzer from '@next/bundle-analyzer';

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfigCommon = {
  reactStrictMode: false,
  webpack: (config, { webpack }) => {
    // allow import ".jsx?" files in next app, which are required with "type: module"
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.ts', '.tsx', '.js'],
    };

    return config;
  },
};

let config = nextConfigCommon;

if (process.env.ANALYZE) {
  config = withBundleAnalyzer({ enabled: true })(nextConfigCommon);
}

export default config;
