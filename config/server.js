/*
 * @Description: server entry
 * @Author: ekibun
 * @Date: 2019-06-13 09:39:21
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 11:59:43
 */
const chalk = require('chalk')
const log = require('./log')(chalk.blue('server'))
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('./koa/static')
const path = require('path')
const SSR = require('./ssr')

//config
const conf = require('./app')
const isProd = process.env.NODE_ENV === 'production'
const version = ' V ' + require('../package.json').version

// log version
console.log(version)

const app = new Koa()

// load develop middleware 
if (!isProd) {
    //logger
    app.use(async (ctx, next) => {
        const start = new Date().valueOf()
        await next();
        const ms = new Date().valueOf() - start;
        log.v(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
}

// error catch middleware
app.use(async function (ctx, next) {
    try {
        await next()
    } catch (e) {
        let status = e.status || 500
        let message = e.message || 'server error'
        ctx.status = status
        ctx.body = {
            status: status,
            message: message
        };
        if (status == 500) {
            log.e(e.stack || e)
        }
    }
})

app.use(koaBody())

// TODO compress data

// map url /data/* to folder ../public/data/*
app.use(koaStatic(path.resolve(__dirname, '../public'), {
    maxAge: 30 * 24 * 60 * 60 * 1000 // expired time (ms)
}, '/data/'))

// setup ssr
SSR(app).then(server => {
    server.listen(conf.app.port, conf.app.host, () => {
        log.v(`server is staring at ${conf.app.host}:${conf.app.port}...`)
    })
})