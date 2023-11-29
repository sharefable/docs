export const indexJs = `import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import React, { Suspense } from 'react';
import { router } from "./router";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<Suspense fallback={'Loading'}><RouterProvider router={router} /></Suspense>);`

export const webpackConfig = `const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: { historyApiFallback: true },
  entry: './src/index.js',
  output: {     
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].bundle.js',
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
      }
    ]
  }
}`;

export const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App without CRA</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`

export const gitignore = `node_modules`