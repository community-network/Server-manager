const express = require("express");
const app = express();

const webpack = require("webpack");
const webpackConfig = require("./configs/webpack/dev.js");
const middleware = require("webpack-dev-middleware"); //webpack hot reloading middleware
const compiler = webpack(webpackConfig);

app.use(
  middleware(compiler, {
    // webpack-dev-middleware options
  }),
);

app.listen(process.env.PORT, () =>
  console.log(`App listening on port/pipe ${process.env.PORT}!`),
);
