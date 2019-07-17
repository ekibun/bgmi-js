/**
 * @Description: router creator
 * @Author: ekibun
 * @Date: 2019-06-28 10:47:58
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 08:46:30
 */
import Vue, { AsyncComponent } from 'vue'
import Router from 'vue-router'
import loading from '@web/component/loading.vue'

Vue.use(Router)

function asyncComp(executor: any): AsyncComponent {
    return () => ({
        component: new Promise(executor) as any,
        loading
    })
}

//page async components
const listPage: AsyncComponent = asyncComp(r => require.ensure([], () => r(require('@web/page/fs.vue')), null, 'fsPage'))

export function createRouter() {
    return new Router({
        mode: 'history',
        fallback: false,
        routes: [
            {
                path: '/fs/:path*',
                component: listPage
            }
        ]
    })
}