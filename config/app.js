/*
 * @Description: app config
 * @Author: ekibun
 * @Date: 2019-06-13 09:38:29
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-16 22:45:54
 */
const path = require('path')

module.exports = {
    app: {
        port: 3000, // listening port
        host: 'localhost', // listening host
        devAPI: true, // develop API
        useSSR: false // use SSR
    },
    alias: {
        '@web': path.join(__dirname, '../src/web'),
        '@common': path.join(__dirname, '../src/common'),
        '@api': path.join(__dirname, '../src/api')
    }
}