/**
 * @Description: vuex store creator
 * @Author: ekibun
 * @Date: 2019-06-28 10:48:55
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-28 16:23:59
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export function createStore() {
    // load modules from ./modules
    const modules = {}
    const context = require.context('./modules', false, /\.ts$/)
    context.keys().forEach(key => {
        modules[key.replace(/(\.\/|\.ts)/g, '')] = context(key).default
    })

    return new Vuex.Store({
        modules,
        strict: process.env.NODE_ENV !== 'production'
    })
}