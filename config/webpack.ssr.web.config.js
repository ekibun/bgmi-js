/*
 * @Description: webpack config for SSR browser side
 * @Author: ekibun
 * @Date: 2019-06-28 09:42:07
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-11 09:05:24
 */
const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const base = require('./webpack.base.config')
const isProd = process.env.NODE_ENV === 'production'
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const version = ' V ' + require('../package.json').version

module.exports = merge(base, {
    name: 'ssr:web',
    output: {
        path: path.resolve(__dirname, '../dist/ssr')
    },
    devtool: isProd ? '#source-map': '#eval-source-map',
    entry: {
        app: path.resolve(__dirname, '../src/web/entry-client.ts')
    },
    mode: isProd ? 'production' : 'development',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"client"',
            'process.env.BM_VERSION': "'" + version + "'"
        }),
        new VueSSRClientPlugin()
    ]
})
