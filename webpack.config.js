// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const { execSync } = require('child_process');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const pkg = require('./package.json');

function stripTrailingSlash(text) {
  return String(text).replace(/\/$/, '')
}

module.exports = (env) => {
  // see: https://webpack.js.org/guides/environment-variables/
  const isNwjsPackage = env.package;
  const isProduction = process.env.NODE_ENV == 'production' || env.production;
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      main: './src/index.ts',
      editor: './src/editor/index',
      preview: './src/preview/index',
      community: './src/community/index',
      astarTester: './src/astar/tester/index',
    },
    output: {
      filename: '[name].bundle-[contenthash].js',
      path: path.resolve(__dirname, isProduction ? 'dist-prod' : 'dist/snek-js'),
      publicPath: stripTrailingSlash(isProduction ? '' : '/snek-js'),
      clean: true,
    },
    devtool: 'eval',
    plugins: [
      // Add your plugins here
      // Learn more about plugins from https://webpack.js.org/configuration/plugins/
      new webpack.ProvidePlugin({
        p5: 'p5',
      }),
      new webpack.DefinePlugin({
        'process.env.__COMMIT_HASH__': JSON.stringify(commitHash),
        'process.env.__VERSION__': JSON.stringify(pkg.version),
        'process.env.__NWJS_PACKAGE__': isNwjsPackage,
      }),
      new CopyPlugin({
        patterns: [
          { from: "public/assets",
            to: "assets/",
            globOptions: {
              ignore: [
                "**/music/*.wav",
                "**/graphics/*.ase",
                "**/graphics/promo",
                "**/sounds/*.aup3",
                "**/sounds/*.aup3-shm",
                "**/sounds/*.aup3-wal",
              ]
            }
          },
          { from: "public/readme", to: "readme/" },
          // { from: "public/pages/privacy-policy", to: "pages/privacy-policy" },
          { from: "public/style.css" },
          // publishing native applications using nwjs
          ...(isNwjsPackage ? [
            { from: "public/package.json", to: "package.json" }
          ] : []),
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
        title: 'SNEK LEVEL PREVIEW',
        filename: 'preview/index.html',
        template: './public/pages/preview/index.ejs',
        inject: false,
      }),
      new HtmlWebpackPlugin({
        title: 'SNEK COMMUNITY',
        filename: 'community/index.html',
        template: './public/pages/community/index.ejs',
        inject: false,
      }),
      new HtmlWebpackPlugin({
        title: 'ASTAR TEST',
        filename: 'astar-tester/index.html',
        template: './public/pages/astar-tester/index.ejs',
        inject: false,
      }),
      new HtmlWebpackPlugin({
        title: 'SNEK PRIVACY POLICY',
        filename: 'privacy-policy/index.html',
        template: './public/pages/privacy-policy/index.html',
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
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
};
