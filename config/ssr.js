/*
 * @Description: setup SSR middleware
 * @Author: ekibun
 * @Date: 2019-06-27 10:05:10
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 12:04:01
 */
const chalk = require('chalk')
const log = require('./log')(chalk.blue('server'))
const fs = require('fs')
const http = require('http')
const path = require('path')
const LRU = require('lru-cache')
const koaStatic = require('./koa/static')
const { createBundleRenderer } = require('vue-server-renderer')
const setUpDevServer = require('./setup-dev-server')
const HtmlMinifier = require('html-minifier').minify
const WebSocket = require('ws')

const aria2c = require('./aria2c')

//config
const conf = require('./app')
const isProd = process.env.NODE_ENV === 'production'

// create Renderer form bundle
const createRenderer = (bundle, options) => {
    return createBundleRenderer(bundle, Object.assign(options, {
        cache: new LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
        }),
        basedir: path.resolve(__dirname, '../dist/ssr'),
        runInNewContext: false
    }))
}

/**
 * Setup SSR middleware
 * @param {import('koa')} app
 * @returns {Promise<http.Server>}
 * @api public
 */
module.exports = app => {
    return new Promise((resolve) => {
        let renderer = null
        let API = null

        // map url /* to basedir in prod mode
        if (isProd) app.use(koaStatic(path.resolve(__dirname, conf.app.useSSR ? '../dist/ssr' : '../dist/web'), {}, '/'))

        app.use(async (ctx, next) => {
            // return if renderer not compiled
            if (conf.app.useSSR && !renderer) {
                ctx.type = 'html'
                ctx.body = 'waiting for compilation... refresh in a moment.'
                await next()
                return
            }

            // use `API` to process url /api/*
            if (/^\/api\//.test(ctx.url)) {
                API && await API.router(ctx, next)
                return
            }

            // SSR render
            let renderError = null
            if (conf.app.useSSR) {
                ctx.type = 'html'
                try {
                    ctx.body = await renderer.renderToString({
                        url: ctx.url,
                        title: 'OK'
                    })
                } catch (e) {
                    // router return error when redirecting
                    if (!e.status && `${e.message}`.startsWith('/')) {
                        log.v(`redirect ${e.message}`)
                        ctx.status = 302
                        ctx.redirect(e.message)
                        return
                    }
                    renderError = e
                }
            }
            await next()
            if(renderError && !ctx.body) throw renderError
        })

        // create http server
        const server = http.createServer(app.callback())
        const socket = new WebSocket.Server({
            server: server
        })

        // create aria2c
        aria2c.startProcess('./aria2')
        const aria2 = aria2c.startSocket()

        // load API from dist file in prod mode
        if (isProd || !conf.app.devAPI) {
            API = require('../dist/api/api').default
            API.setSocket(socket)
            API.setAria2c(aria2)
        }

        // setup SSR renderer
        if (!isProd) {
            // dev mode
            setUpDevServer(app, (bundle, options, apiMain) => {
                try {
                    if (conf.app.devAPI) {
                        API = eval(apiMain).default
                        API.setSocket(socket)
                        API.setAria2c(aria2)
                    }
                    if (conf.app.useSSR) renderer = createRenderer(bundle, options)
                    resolve(server)
                } catch (e) {
                    log.e(e.stack || e)
                }
            })
        } else {
            // prod mode
            if(conf.app.useSSR) {
                const template = HtmlMinifier(fs.readFileSync(path.resolve(__dirname, '../src/web/index.html'), 'utf-8'), {
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: false
                })
                const bundle = require(path.resolve(__dirname, '../dist/ssr/vue-ssr-server-bundle.json'))
                const clientManifest = require(path.resolve(__dirname, '../dist/ssr/vue-ssr-client-manifest.json'))
                renderer = createRenderer(bundle, {
                    template,
                    clientManifest
                })
            }
            resolve(server)
        }
    })
}