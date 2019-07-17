/*
 * @Description: setup SSR & API dev server
 * @Author: ekibun
 * @Date: 2019-06-27 15:42:52
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-16 22:19:17
 */
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const MFS = require('memory-fs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const convert = require('koa-convert')
const webpackDevMiddleware = require('./koa/dev')
const webpackHotMiddleware = require('koa-webpack-hot-middleware')
const fallback = require('./koa/fallback');
const readline = require('readline')

//config
const conf = require('./app')

const clearConsole = () => {
    if (process.stdout.isTTY) {
        // Fill screen with blank lines. Then move to 0 (beginning of visible part) and clear it
        const blank = '\n'.repeat(process.stdout.rows)
        console.log(blank)
        readline.cursorTo(process.stdout, 0, 0)
        readline.clearScreenDown(process.stdout)
    }
}

/**
 * Setup SSR & API dev server
 * @param {import('koa')} app
 * @param {(bundle: any, options: any, apiMain: string)=>void} cb
 * @api public
 */
module.exports = (app, cb) => {
    let apiMain, bundle, template, clientManifest, serverTime = 0, webTime = 0, apiTime = 0
    let updateAPI = true, updateSSR = true

    // update after compiled
    const update = () => {
        if ((!conf.app.devAPI || (apiMain && apiTime)) && (!conf.app.useSSR || (bundle && template && clientManifest && serverTime)) && webTime) {
            clearConsole();
            let updateTime = 0;
            if (updateAPI) updateTime += apiTime
            if (updateSSR) updateTime += serverTime + webTime
            let updateType = updateAPI && updateSSR ? 'ALL' : updateAPI ? 'API' : conf.app.useSSR ? 'SSR' : 'WEB'
            updateAPI = false
            updateSSR = false
            console.log(chalk.bgGreen.black(' DONE ') + ' ' + chalk.green(`${updateType} Compiled successfully in ${updateTime}ms`))

            cb(bundle, {
                template,
                clientManifest
            }, apiMain)
        }
    }

    // API dev server
    if (conf.app.devAPI) {
        const apiConfig = require('./webpack.api.config')
        const apiCompiler = webpack(apiConfig)
        const apiMfs = new MFS()
        apiCompiler.outputFileSystem = apiMfs
        apiCompiler.watch({}, (err, stats) => {
            if (err) throw err
            stats = stats.toJson()
            if (stats.errors.length) return
            console.log('api-dev...')
            apiMfs.readdir(path.join(__dirname, '../dist/api'), function (err, files) {
                if (err) {
                    return console.error(err)
                }
                files.forEach(function (file) {
                    console.info(file)
                })
            })
            apiMain = apiMfs.readFileSync(path.join(apiConfig.output.path, 'api.js'), 'utf-8')
            update()
        })
        apiCompiler.hooks.watchRun.tap("dev_run_api", () => {
            updateAPI = true
            apiTime = 0
        })
        apiCompiler.hooks.done.tap("dev_done_api", stats => {
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))
            if (stats.errors.length) return

            apiTime = stats.time
        })
    }

    // SSR dev server
    if (conf.app.useSSR) {
        // ssr server side
        const serverConfig = require('./webpack.ssr.server.config')
        const serverCompiler = webpack(serverConfig)
        const mfs = new MFS()
        serverCompiler.outputFileSystem = mfs
        serverCompiler.watch({}, (err, stats) => {
            if (err) throw err
            stats = stats.toJson()
            if (stats.errors.length) return
            console.log('server-dev...')
            bundle = JSON.parse(mfs.readFileSync(path.join(serverConfig.output.path, 'vue-ssr-server-bundle.json'), 'utf-8'))
            update()
        })
        serverCompiler.hooks.watchRun.tap("dev_run_server", () => {
            updateSSR = true
            serverTime = 0
        })
        serverCompiler.hooks.done.tap("dev_done_server", stats => {
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))
            if (stats.errors.length) return

            serverTime = stats.time
        })

        // template
        const templatePath = path.resolve(__dirname, '../src/web/index.html')
        // read template from disk and watch
        template = fs.readFileSync(templatePath, 'utf-8')
        chokidar.watch(templatePath).on('change', () => {
            template = fs.readFileSync(templatePath, 'utf-8')
            console.log('index.html template updated.')
            update()
        })

        // ssr web side
        const webConfig = require('./webpack.ssr.web.config')
        webConfig.entry.app = ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true', webConfig.entry.app]
        webConfig.output.filename = '[name].js'
        webConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        )
        const clientCompiler = webpack(webConfig)
        const devMiddleware = webpackDevMiddleware(clientCompiler, {
            // publicPath: webConfig.output.publicPath,
            stats: { // or 'errors-only'
                colors: true
            },
            reporter: (middlewareOptions, options) => {
                const { log, state, stats } = options
                if (state) {
                    const displayStats = (middlewareOptions.stats !== false)
                    if (displayStats) {
                        if (stats.hasErrors()) {
                            log.error(stats.toString(middlewareOptions.stats))
                        } else if (stats.hasWarnings()) {
                            log.warn(stats.toString(middlewareOptions.stats))
                        } else {
                            log.info(stats.toString(middlewareOptions.stats))
                        }
                    }
                    let message = 'Compiled successfully.'
                    if (stats.hasErrors()) {
                        message = 'Failed to compile.'
                    } else if (stats.hasWarnings()) {
                        message = 'Compiled with warnings.'
                    }
                    log.info(message)
                    update()
                } else {
                    log.info('Compiling...')
                }
            },
            noInfo: true,
            serverSideRender: false
        })
        app.use(devMiddleware)

        app.use(convert(webpackHotMiddleware(clientCompiler)))

        clientCompiler.hooks.watchRun.tap("dev_run_client", () => {
            updateSSR = true
            webTime = 0
        })
        clientCompiler.hooks.done.tap("dev_done_client", stats => {
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))
            if (stats.errors.length) return

            clientManifest = JSON.parse(devMiddleware.fileSystem.readFileSync(path.join(webConfig.output.path, 'vue-ssr-client-manifest.json'), 'utf-8'))
            webTime = stats.time
        })
    } else {
        // require api fallback if not using SSR
        app.use(fallback({
            verbose: true // print fallback log
        }));

        const clientConfig = require('./webpack.web.config')
        clientConfig.entry.app = ['webpack-hot-middleware/client?path=/__webpack_hmr&timeout=2000&reload=true', clientConfig.entry.app]
        clientConfig.output.filename = '[name].js'
        clientConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        )
        const clientCompiler = webpack(clientConfig)

        const devMiddleware = webpackDevMiddleware(clientCompiler, {
            // publicPath: webConfig.output.publicPath,
            stats: { // or 'errors-only'
                colors: true
            },
            reporter: (middlewareOptions, options) => {
                const { log, state, stats } = options
                if (state) {
                    const displayStats = (middlewareOptions.stats !== false)
                    if (displayStats) {
                        if (stats.hasErrors()) {
                            log.error(stats.toString(middlewareOptions.stats))
                        } else if (stats.hasWarnings()) {
                            log.warn(stats.toString(middlewareOptions.stats))
                        } else {
                            log.info(stats.toString(middlewareOptions.stats))
                        }
                    }
                    let message = 'Compiled successfully.'
                    if (stats.hasErrors()) {
                        message = 'Failed to compile.'
                    } else if (stats.hasWarnings()) {
                        message = 'Compiled with warnings.'
                    }
                    log.info(message)
                    update()
                } else {
                    log.info('Compiling...')
                }
            },
            noInfo: true,
            serverSideRender: false
        })
        app.use(devMiddleware)

        app.use(convert(webpackHotMiddleware(clientCompiler)))

        clientCompiler.hooks.watchRun.tap("dev_run_client", () => {
            updateSSR = true
            webTime = 0
        })
        clientCompiler.hooks.done.tap("dev_done_client", stats => {
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))
            if (stats.errors.length) return

            webTime = stats.time
        })
    }
}