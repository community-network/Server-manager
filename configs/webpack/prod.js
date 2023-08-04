// production config
/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const { resolve } = require("path");
const { InjectManifest } = require("workbox-webpack-plugin");

const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "production",
  output: {
    filename: "js/[name].[contenthash].min.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
  },
  devtool: "source-map",
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  plugins: [
    new InjectManifest({
      swSrc: "./service-worker.js",
      swDest: "service-worker.js",
    }),
  ],
});
