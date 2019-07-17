/**
 * @Description: creating a new root Vue instance for each request
 *      modified based on 'https://github.com/vuejs/vue-hackernews-2.0'
 * @Author: ekibun
 * @Date: 2019-06-28 10:12:39
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 15:07:54
 */
import Vue from 'vue'
import App from '@web/App.vue'
import { createStore } from '@web/store'
import { createRouter } from '@web/router'
import { createI18n } from '@web/i18n'
import { sync } from 'vuex-router-sync'
import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

// Expose a factory function that creates a fresh set of store, router,
// app instances on each call (which is called for each SSR request)
export function createApp() {
    const store = createStore()
    const router = createRouter()
    const i18n = createI18n()

    // sync the router with the vuex store.
    // this registers `store.state.route`
    sync(store, router)

    // create the app instance.
    // here we inject the router, store and ssr context to all child components,
    // making them available everywhere as `this.$router` and `this.$store`.
    const app = new Vue({
        router,
        store,
        i18n,
        render: h => h(App)
    })

    // expose the app, the router and the store.
    // note we are not mounting the app here, since bootstrapping will be
    // different depending on whether we are in a browser or on the server.
    return { app, router, store }
}
