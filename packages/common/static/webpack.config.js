const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: { historyApiFallback: true },
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'blog/[name].[chunkhash:8].js',
    chunkFilename: 'blog/[name].[chunkhash:8].chunk.js',
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './index.html'
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