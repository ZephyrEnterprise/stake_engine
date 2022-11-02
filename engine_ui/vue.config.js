const {defineConfig} = require('@vue/cli-service');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");


module.exports = defineConfig({
  outputDir: path.resolve(__dirname, "./dashboard"),
  transpileDependencies: true,
  chainWebpack: config => {
    config
        .entry("app")
        .clear()
        .add("./src/main.js")
        .end();
    config.resolve.alias.set("@", path.join(__dirname, "./src"));
  },
  configureWebpack: {
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        stream: require.resolve('stream-browserify'),
      },
    },
    plugins: [
      new NodePolyfillPlugin()
    ]
  }
})
