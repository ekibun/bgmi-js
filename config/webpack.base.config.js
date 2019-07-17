/*
 * @Description: base webpack config for web
 * @Author: ekibun
 * @Date: 2019-06-28 09:14:02
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-14 08:55:20
 */
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

//config
const conf = require('./app')
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    mode: isProd ? 'production' : 'development',
    output: {
        publicPath: '/',
        filename: '[name].[chunkhash:8].js',
        globalObject: 'this'
    },
    resolve: {
        alias: {
            ...conf.alias,
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['.ts', '.js', '.vue', '.json']
    },
    module: {
        rules: [
            {// shader
                test: /(\.vs|\.fs)$/,
                use: {
                    loader: 'raw-loader'
                },
                include: /shader/
            }, {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    extractCSS: isProd,
                    preserveWhitespace: false,
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                include: [path.resolve(__dirname, '../src/web'), path.resolve(__dirname, '../src/common')],
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            }, {
                test: /\.css$/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss/,
                use: [
                    isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ["./src/web/style"],
                            data: "$env: " + process.env.NODE_ENV + ";"
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: (loader) => [
                                require('autoprefixer')()
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'assets/images/[name].[hash:8].[ext]'
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'assets/images/[name].[hash:8].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    query: {
                        limit: 10000,
                        name: 'assets/font/[name].[hash:8].[ext]'
                    }
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 2,
            maxAsyncRequests: 5,
            maxInitialRequests: 3
        }
    },
    performance: {
        maxEntrypointSize: 400000,
        hints: isProd ? 'warning' : false
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new FriendlyErrorsPlugin(),
        new VueLoaderPlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 15
        }),
        new MiniCssExtractPlugin({
            filename: isProd ? '[name].[hash:8].css' : '[name].css',
            chunkFilename: isProd ? '[id].[hash:8].css' : '[id].css'
        })
    ]
}
