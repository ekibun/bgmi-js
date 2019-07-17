/**
 * @Description: add asyncData to Vue component
 * @Author: ekibun
 * @Date: 2019-06-28 10:46:03
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-28 16:02:35
 */
import Vue, { ComponentOptions } from "vue";
import { Store } from "vuex";
import { Route } from 'vue-router';

declare type AsyncData = (store: Store<any>, route: Route) => Promise<any>;

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        asyncData?: AsyncData;
        waitAsyncData?: boolean;
    }
}

declare module "vue/types/vue" {
    interface Vue {
        asyncData?: AsyncData;
        waitAsyncData?: boolean;
    }
}