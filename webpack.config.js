var path = require('path');
var webpack = require('webpack');
 
module.exports = {
  entry: './src/app.js',
  output: { path: __dirname, filename: './dist/app.js' },
  js: {
    uglify: true
  },
  plugins: [
    //new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
};