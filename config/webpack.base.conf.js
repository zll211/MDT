const utils = require('./utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');

const METADATA = {
  title: 'MDT多学科会诊平台',
  baseUrl: '/',
};

/* 'babel-polyfill', */
module.exports = function() {
  return {
    context: utils.root(),
    entry: {
      app: ['./src/main.js'],
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': utils.root('src'),
        'src': utils.root('src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: [utils.root('src')],
          options: {
            formatter: require('eslint-friendly-formatter'),
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        /* {
          test: /\.html$/,
          use: [{
            loader: 'html-loader',
            options: {
              minimize: true,
              removeComments: false,
              collapseWhitespace: false,
            },
          }],
          exclude: [utils.root('index.html')],
        },*/
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [utils.root('src'), utils.root('node_modules', 'kfb-view')],
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            /* name: '[name].[hash:7].[ext]', */
            outputPath: 'assets/images',
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            /* name: '[name].[hash:7].[ext]', */
            outputPath: 'assets/fonts',
          },
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),

      new CopyWebpackPlugin([{
        from: utils.root('src', 'plugins'),
        to: utils.root('dist', 'plugins'),
      }]),

      new CopyWebpackPlugin([{
        from: utils.root('static'),
        to: utils.root('dist', 'static'),
      }]),

      /* new CopyWebpackPlugin([{
        from: utils.root('favicon.ico'),
        to: utils.root('dist', 'favicon.ico'),
      }]),*/

      new HtmlWebpackPlugin({
        template: 'index.html',
        title: METADATA.title,
        chunksSortMode: 'manual',
        chunks: ['vendors', 'app'],
        metadata: METADATA,
        inject: 'body',
      }),

      /* new HtmlWebpackPlugin({
        template: 'src/browser/index.html',
        filename: 'browser/index.html',
        inject: false,
      }),*/

      new ScriptExtHtmlWebpackPlugin({
        sync: /vendors/,
        defaultAttribute: 'async',
        preload: [/vendors|app/],
        prefetch: [/chunk/],
      }),
    ],
  };
};
