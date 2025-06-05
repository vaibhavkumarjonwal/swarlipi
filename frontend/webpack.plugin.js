const webpack = require('webpack')

module.exports = function override(config) {
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  )
  return config
}