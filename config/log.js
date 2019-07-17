/*
 * @Description: log util
 * @Author: ekibun
 * @Date: 2019-07-16 18:42:50
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-16 22:02:17
 */
const chalk = require('chalk')
module.exports = (tag) => ({
    v: (...messages) => {
        `${messages.join(' ')}`.split('\n').forEach(d => {
            if(d == '') return
            console.log(`[${tag}]`, d)
        })
    },
    e: (...messages) => {
        `${messages.join(' ')}`.split('\n').forEach(d => {
            if(d == '') return
            console.log(`[${tag}]`, chalk.red(d))
        })
    }
})