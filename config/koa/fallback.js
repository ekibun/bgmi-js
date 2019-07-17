/*
 * @Description: koa api fallback
 *      copied from 'https://www.jianshu.com/p/c6859a6d4e7e'
 * @Author: ekibun
 * @Date: 2019-06-27 10:46:23
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-28 16:51:37
 */
const history = require('connect-history-api-fallback');

/**
 * koa api fallback
 * @param {string} [opts]
 * @return {Function}
 * @api public
 */
module.exports = opts => {
    const middleware = history(opts);
    const noop = () => {
    };

    return async (ctx, next) => {
        middleware(ctx, null, noop);
        await next();
    };
};