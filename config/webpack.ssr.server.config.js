/*
 * @Description: webpack config for SSR server side
 * @Author: ekibun
 * @Date: 2019-06-28 09:40:59
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-11 13:28:31
 */
const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const config = require('./webpack.base.config')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const version = ' V ' + require('../package.json').version

module.exports = merge(config, {
    name: 'ssr:server',
    target: 'node',
    devtool: '#cheap-module-source-map',
    mode: 'production',
    entry: path.join(__dirname, '../src/web/entry-server.ts'),
    output: {
        path: path.resolve(__dirname, '../dist/ssr'),
        libraryTarget: 'commonjs2'
    },
    externals: nodeExternals({
        whitelist: [/\.vue$/, /\.css$/, /\.scss$/]
    }),
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': '"server"',
            'process.env.BM_VERSION': "'" + version + "'"
        }),
        new VueSSRServerPlugin()
    ]
})
