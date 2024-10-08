// production config
/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const { resolve } = require("path");
const { GenerateSW } = require("workbox-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const lightningcss = require('lightningcss');
const browserslist = require('browserslist');

const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].min.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  devtool: "source-map",
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions: {
          targets: lightningcss.browserslistToTargets(browserslist('defaults'))
        },
      }),
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
    // new BundleAnalyzerPlugin(),
    new GenerateSW({
      runtimeCaching: [
        {
          urlPattern: /assets/,
          handler: "CacheFirst",
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    }),
  ],
});
