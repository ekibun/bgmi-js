/*
 * @Description: webpack config for API
 * @Author: ekibun
 * @Date: 2019-06-27 16:42:39
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-03 12:33:47
 */
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

//config
const conf = require('./app')
const isProd = process.env.NODE_ENV === 'production'

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    name: 'api',
    target: 'node',
    devtool: '#cheap-module-source-map',
    mode: isProd ? 'production' : 'development',
    entry: path.join(__dirname, '../src/api/app.ts'),
    output: {
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, '../dist/api'),
        filename: 'api.js',
        publicPath: '/'
    },
    resolve: {
        alias: conf.alias,
        extensions: ['.ts', '.js']
    },
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                include: [path.resolve(__dirname, '../src/api'), path.resolve(__dirname, '../src/common')],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new FriendlyErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.API_ENV': '"server"'
        })
    ]
}