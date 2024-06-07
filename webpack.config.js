// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
var webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function stripTrailingSlash(text) {
  return String(text).replace(/\/$/, '')
}

const isProduction = process.env.NODE_ENV == 'production';

const config = {
  entry: {
    main: './src/index.ts',
    editor: './src/editor/index',
  },
  output: {
    filename: '[name].bundle-[contenthash].js',
    path: path.resolve(__dirname, isProduction ? 'dist-prod' : 'dist/snek-js'),
    publicPath: stripTrailingSlash(isProduction ? '' : '/snek-js'),
    clean: true,
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new webpack.ProvidePlugin({
      p5: 'p5',
    }),
    new CopyPlugin({
      patterns: [
        { from: "public/assets", to: "assets/", globOptions: { ignore: ["**/music/*.wav"] } },
        { from: "public/readme", to: "readme/" },
        { from: "public/style.css" },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.ejs',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      title: 'SNEK EDITOR',
      filename: 'editor/index.html',
      template: './public/pages/editor/index.ejs',
      inject: false,
    }),
    new HtmlWebpackPlugin({
      title: 'SNEK LEVEL PLAYER',
      filename: 'player/index.html',
      template: './public/pages/player/index.ejs',
      inject: false,
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[contenthash].css",
      chunkFilename: "[id]-[contenthash].css",
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
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              '@babel/preset-react',
              '@babel/preset-env',
              '@babel/preset-typescript',
            ]
          }
        }
      },
      {
        test: /\.(css|scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]--[hash:base64]",
              },
              sourceMap: true,
              url: false,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.scss'],
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
