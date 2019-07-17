/*
 * @Description: webpack config for web without SSR
 * @Author: ekibun
 * @Date: 2019-06-28 09:36:59
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-11 09:08:38
 */
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const base = require('./webpack.base.config')
const isProd = process.env.NODE_ENV === 'production'
const HtmlWebpackPlugin = require('html-webpack-plugin')
const version = ' V ' + require('../package.json').version

module.exports = merge(base, {
    name: 'web',
    devtool: '#eval-source-map',
    output: {
        path: path.resolve(__dirname, '../dist/web')
    },
    entry: {
        app: path.resolve(__dirname, '../src/web/entry-client.ts')
    },
    mode: isProd ? 'production' : 'development',
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"',
            'process.env.BM_VERSION': "'" + version + "'"
        }),
        new HtmlWebpackPlugin({
            template: './src/web/index.html',
            filename: 'index.html'
        }),
    ]
})