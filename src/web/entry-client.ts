/**
 * @Description: browser side entry, compat without SSR
 *      modified based on 'https://github.com/vuejs/vue-hackernews-2.0'
 * @Author: ekibun
 * @Author: ekibun
 * @Date: 2019-06-28 10:10:21
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-03 16:34:54
 */
import Vue from 'vue'
import { createApp } from './app'
import { Route } from 'vue-router';
import { Component } from 'vue-router/types/router';

// a global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
    beforeRouteUpdate(to, from, next) {
        const { asyncData, waitAsyncData } = this.$options
        if (asyncData) {
            //this.$app && this.$app.startProgress()
            asyncData(this.$store, to).then(() => {
                //this.$app && this.$app.finishProgress()
                next()
            }).catch(() => {
                //this.$app && this.$app.failProgress()
                next()
            })
            if (waitAsyncData) {
                //this.$app && this.$app.finishProgress()
                next()
            }
        } else {
            next()
        }
    }
})

const { app, router, store } = createApp()

// prime the store with server-initialized state.
// the state is determined during SSR and inlined in the page markup.
if ((<any>window).__INITIAL_STATE__) {
    store.replaceState((<any>window).__INITIAL_STATE__)
}

// compat without SSR
let asyncActivated = (to: Route, activated: Component[], next: () => any) => {
    const asyncDataHooks = activated.map((c: any) => {
        let asyncData = c.asyncData || c.options && c.options.asyncData

        if (asyncData) {
            // if component has defined option 'waitAsyncData' define it in async hook list, default: true
            let waitData = c.waitAsyncData

            if (waitData === undefined) {
                waitData = c.options && c.options.waitAsyncData || true
            }

            return {
                asyncData: asyncData,
                waitAsyncData: !!waitData
            }
        }
        return null;
    }).filter(_ => _)

    if (!asyncDataHooks.length) {
        return next()
    }

    //this.$app && this.$app.startProgress()
    Promise.all(asyncDataHooks.map(hook => {
        let promise = hook.asyncData(store, to);
        // if waitAsyncData !== false wait until asyncData promise will be resolved
        if (hook.waitAsyncData) {
            return promise
        }
        // otherwise resolve it just now, and let component be mounted without data waiting
        return Promise.resolve()
    })).then(() => {
        //this.$app && this.$app.finishProgress()
        next()
    }).catch(() => {
        //this.$app && this.$app.failProgress()
        next()
    })
}

// wait until router has resolved all async before hooks
// and async components...
router.onReady(() => {
    // Add router hook for handling asyncData.
    // Doing it after initial route is resolved so that we don't double-fetch
    // the data that we already have. Using router.beforeResolve() so that all
    // async components are resolved.
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)
        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })
        asyncActivated(to, activated, next)
    });
    if (!(<any>window).__INITIAL_STATE__)
        asyncActivated(router.currentRoute, router.getMatchedComponents(), () => { });

    app.$mount('#app');
})
