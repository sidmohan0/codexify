const path = require('path');

module.exports = {
  packagerConfig: {
    icon: path.resolve(__dirname, './src/assets/icons/icon'), // Use absolute path
    name: 'Codexify',
    executableName: 'codexify'
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: path.resolve(__dirname, './src/assets/icons/icon.ico'),
        setupIcon: path.resolve(__dirname, './src/assets/icons/icon.ico')
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: path.resolve(__dirname, './src/assets/icons/icon.png')
        }
      }
    }
  ],
  // Add path aliases for better imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib')
    }
  }
};