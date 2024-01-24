const webpack = require('webpack')
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  devServer: { historyApiFallback: true },
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'blog/[name].[chunkhash:8].js',
    chunkFilename: 'blog/[name].[chunkhash:8].chunk.js',
  },
  resolve: {
    fallback: {
      process: require.resolve("process/browser"),
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
      util: require.resolve("util"),
      buffer: require.resolve("buffer"),
      asset: require.resolve("assert"),
    }
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'analytics.js'),
          to: path.join(__dirname, 'build', 'blog'),
          noErrorOnMissing: true
        },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    })
  ],
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ]
  }
}