// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
var webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function stripTrailingSlash(text) {
  return String(text).replace(/\/$/, '')
}

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, isProduction ? 'dist-prod' : 'dist/snek-js'),
    publicPath: stripTrailingSlash(isProduction ? '' : '/snek-js'),
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new webpack.ProvidePlugin({
      p5: 'p5',
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/assets", to: "assets/" },
        { from: "public/readme", to: "readme/" },
        { from: "public/style.css" },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    // we can automate this if need be by using node FS
    new HtmlWebpackPlugin({
      title: 'Test',
      filename: 'test/index.html',
      template: './public/pages/test/index.html',
      inject: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';


  } else {
    config.mode = 'development';
  }
  return config;
};
