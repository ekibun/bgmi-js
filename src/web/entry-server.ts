/**
 * @Description: SSR server side entry 
 *      copied from 'https://github.com/vuejs/vue-hackernews-2.0'
 * @Author: vuejs
 * @Date: 2019-06-28 10:12:58
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-11 10:59:18
 */
import { createApp } from './app'

const isDev = process.env.NODE_ENV !== 'production'

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default context => {
    return new Promise((resolve, reject) => {
        const s = isDev && Date.now()
        const { app, router, store } = createApp()

        const { url } = context
        const { fullPath } = router.resolve(url).route

        if (fullPath !== url) {
            return reject(new Error(fullPath))
        }

        // set router's location
        router.push(url)

        // wait until router has resolved possible async hooks
        router.onReady(() => {
            const matchedComponents = router.getMatchedComponents()
            // no matched routes
            if (!matchedComponents.length) {
                return reject({ status: 404, message: 'no found' })
            }
            // Call fetchData hooks on components matched by the route.
            // A preFetch hook dispatches a store action and returns a Promise,
            // which is resolved when the action is complete and store state has been
            // updated.
            Promise.all(matchedComponents.map((c: any) => {
                let asyncData = c.asyncData || c.options && c.options.asyncData
                return asyncData && asyncData(store, router.currentRoute)
            })).then(() => {
                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
                // After all preFetch hooks are resolved, our store is now
                // filled with the state needed to render the app.
                // Expose the state on the render context, and let the request handler
                // inline the state in the HTML response. This allows the client-side
                // store to pick-up the server-side state without having to duplicate
                // the initial data fetching on the client.
                context.state = store.state
                resolve(app)
            }).catch(reject)
        }, reject)
    })
}