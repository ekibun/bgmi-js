/*
 * @Description: middleware for serving static file
 *      modified based on 'https://github.com/yi-ge/Vue-SSR-Koa2-Scaffold/blob/master/config/koa/static.js'
 * @Author: ekibun
 * @Date: 2019-06-27 09:47:32
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-11 14:40:52
 */
const { resolve } = require('path')
const assert = require('assert')
const send = require('koa-send')

/**
 * Serve static files from `root`.
 * @param {String} root
 * @param {Object} [opts]
 * @param {String} prefix
 * @return {Function}
 * @api public
 */
module.exports = (root, opts, prefix) => {
    opts = Object.assign({}, opts)
    assert(root, 'root directory is required to serve files')

    // options
    opts.root = resolve(root)
    if (opts.index !== false) opts.index = opts.index || 'index.html'

    return async (ctx, next) => {
        if(!ctx.path.startsWith(prefix)) return next()

        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return next()

        try {
            if(await send(ctx, ctx.path, opts)) return
        } catch (err) {
            assert(err.status == 404, err)
        }

        // call next() if file not found
        await next()
    }
}