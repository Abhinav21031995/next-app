import type { NextConfig } from 'next';
import type { Configuration, WebpackPluginInstance } from 'webpack';

const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

const remotes = {
  'navigation-ui': process.env.NEXT_PUBLIC_MICROUI_NAVIGATION_REMOTE_URL || 'http://localhost:3002/remoteEntry.js',
  'content-ui': process.env.NEXT_PUBLIC_MICROUI_CONTENT_REMOTE_URL || 'http://localhost:3001/remoteEntry.js',
};

const nextConfig: NextConfig = {
  // Use standalone output for Azure App Service
  output: 'standalone',

  // Configure development indicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'top-right',
  },

  // Required for static export
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
  webpack: (config: Configuration, { isServer, dev }): Configuration => {
    // Disable cache in client-side builds
    if (!isServer) {
      config.cache = false;
      
      // Ensure plugins array exists
      config.plugins = (config.plugins || []) as WebpackPluginInstance[];
      
      config.plugins.push(
        new ModuleFederationPlugin({
          name: 'nextapp',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            'reactnav': 'reactnav@http://localhost:3002/remoteEntry.js',
            'extractor': 'extractor@http://localhost:3001/remoteEntry.js'
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: deps.react,
              eager: false,
              strictVersion: false
            },
            'react-dom': {
              singleton: true,
              requiredVersion: deps['react-dom'],
              eager: false,
              strictVersion: false
            }
          }
        }) as unknown as WebpackPluginInstance
      );

      // Set correct public path for chunk loading
      if (config.output) {
        config.output.publicPath = dev ? 'http://localhost:3000/_next/' : '/_next/';
      }
    }

    // Enable top level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },

  // Add CORS headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  }
};

export default nextConfig;
