/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images : {
    domains: ['www.theadao.io', 'media.discordapp.net']
  },
  webpack: (config) => {
    config.experiments = { 
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true
    }
    return config
  }
}
