/*
 * @Description: koa-webpack-dev-middleware
 *      modified based on 'https://github.com/yi-ge/Vue-SSR-Koa2-Scaffold/blob/master/config/koa/dev.js'
 * @Author: ekibun
 * @Date: 2019-06-27 09:21:26
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-28 16:48:29
 */
const devMiddleware = require('webpack-dev-middleware')

/**
 * koa-webpack-dev-middleware
 * @param {string} compiler
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */
module.exports = (compiler, opts) => {
    const expressMiddleware = devMiddleware(compiler, opts)

    var middleware = async(ctx, next) => {
        await expressMiddleware(ctx.req, {
            end: (content) => {
                ctx.body = content
            },
            getHeader: ctx.get.bind(ctx),
            setHeader: ctx.set.bind(ctx),
        }, next)
    }

    middleware.getFilenameFromUrl = expressMiddleware.getFilenameFromUrl
    middleware.waitUntilValid = expressMiddleware.waitUntilValid
    middleware.invalidate = expressMiddleware.invalidate
    middleware.close = expressMiddleware.close
    middleware.fileSystem = expressMiddleware.fileSystem

    return middleware
}