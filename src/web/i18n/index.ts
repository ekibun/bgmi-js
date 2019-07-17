/**
 * @Description: i18n creator
 * @Author: ekibun
 * @Date: 2019-06-28 10:16:59
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-28 16:22:18
 */
import Vue from 'vue'
import VueI18n from 'vue-i18n'

// load messages from ./langs
const messages = {}
let context = require.context('./langs', false, /.ts$/)
context.keys().forEach(key => {
    messages[key.replace(/(\.\/|\.ts)/g, '')] = context(key).default
})

Vue.use(VueI18n)

export function createI18n() {
    return new VueI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages
    })
}