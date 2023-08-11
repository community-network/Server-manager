// shared config (dev and prod)
/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
var webpack = require("webpack");

module.exports = {
  entry: "./index.tsx",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  context: resolve(__dirname, "../../src"),
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            sync: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(scss|sass)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        loader: "file-loader",
        options: {
          name: "assets/[name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "index.html.ejs",
      favicon: "../src/public/favicon.ico",
      favicon128: "../src/public/favicon128.png",
      favicon256: "../src/public/favicon256.png",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
    new webpack.DefinePlugin({
      // this way we will always have a fallback value
      "process.env.API_MODE": JSON.stringify(
        process.env.API_MODE ? process.env.API_MODE : "prod",
      ),
    }),
  ],
};
