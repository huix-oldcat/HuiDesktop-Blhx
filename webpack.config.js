const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'package/files/blhx')
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'awesome-typescript-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  plugins: [
    new webpack.ProvidePlugin({PIXI: 'pixi.js'})
  ],
  devtool: 'source-map'
};
