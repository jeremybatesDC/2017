const webpack = require('webpack')
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const isProd = (process.env.NODE_ENV === 'production');
const isDev = (process.env.NODE_ENV === 'development');

var pagesList = [
  {'viewFile': 'src/views/pages/_rootProjectPage.hbs','pageName': 'index.html'},
  {'viewFile': 'src/views/pages/homepage.hbs','pageName': 'homepage.html'},
  {'viewFile': 'src/views/pages/test_page_1.hbs','pageName': 'compiled_1.html'},
  {'viewFile': 'src/views/pages/test_page_2.hbs','pageName': 'compiled_2.html'},
  {'viewFile': 'src/views/pages/_patternLibrary.hbs','pageName': '_patternLibrary_compiled.html'}
]//move this to own file

var config = {
  entry: ['./_entry.js'],
  output: {
    path: __dirname + '/_static/'
    ,filename: 'js/app.js'
    //,publicPath: __dirname + '/_static/'
  },
  module: {
    rules: [
      {test: /\.html$/,use: 'html-loader'}
      ,{test: /\.hbs$/,use: 'handlebars-loader'}
      ,{test: /\.(jpe?g|png|gif|svg)$/i,use: 'file-loader'} //this allows project to load images from css
      ,{test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader?presets[]=es2015'
          ,'eslint-loader'
        ]
      } 
    ]
  },
  plugins: [
      new webpack.EnvironmentPlugin(['NODE_ENV'])
      ,new CopyWebpackPlugin([{from: 'src/img', to: 'img'}])//keep test images light weight...      
   ]
};
//Pages Added Here
for(let i=0; i<pagesList.length; i++){
  config.plugins.push(
    new HtmlWebpackPlugin({filename: pagesList[i].pageName, template: pagesList[i].viewFile})
  );
}

if (isDev) {
  config.watch = true;
  config.devtool = 'eval';
  config.devServer = {
      contentBase: '_static'
      ,port: 8080
      ,hot: true
      ,stats: 'normal'
  };
  config.plugins.push(
   new webpack.HotModuleReplacementPlugin()
  );
  config.module.rules.push(
    {test: /\.scss$/,
      use: [
        'style-loader'
        ,'css-loader'
        ,'postcss-loader?sourceMap=inline' //postcss config in own file
        ,'sass-loader?sourceMap'
      ]
    }
  );
  let address,ifaces = require('os').networkInterfaces();for(let dev in ifaces){ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address: undefined);}console.log(`
External URL: ${address}:${config.devServer.port}
`);
}

if (isProd) {
  config.devtool = 'source-map';
  config.plugins.push(
    new ExtractTextPlugin({
        filename: 'css/style.css'
        ,allChunks: true // must test if needed
      })
  );
  config.module.rules.push(
    {test: /\.scss$/,
      use: ExtractTextPlugin.extract({
          use: [
            'css-loader?sourceMap'
            ,'postcss-loader?sourceMap' //postcss config in own file
            ,'sass-loader?sourceMap'
          ]
      })
    }
  );
}

console.log(`Node environment: ${process.env.NODE_ENV}
`);

module.exports = config;