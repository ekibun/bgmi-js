<!--
 * @Description: Home page (debug only)
 * @Author: ekibun
 * @Date: 2019-06-28 11:26:15
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 11:53:33
 -->
<template>
    <div>
        {{ pathname }} <br />
        <router-link :to="`/fs/${dirname}`"
            v-if="pathname!=dirname">..</router-link><br />
        <router-link v-for="item of files"
            :key="item.name"
            :to="`/fs/${pathJoin(item.name)}`">{{item.name}}<br /></router-link>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import path from 'path'
import { normPath } from '@web/store/modules/fs'

export default Vue.extend({
    asyncData(store, route) {
        return store.dispatch("fs/getls", { path: route.params.path })
    },
    computed: {
        dirname() {
            return normPath(path.dirname(this.pathname))
        },
        pathname() {
            return normPath(this.$route.params.path)
        },
        files() {
            return (this.$store.state.fs.ls.find(v => v.path == `/${this.pathname}`) || { files: [] }).files
        }
    },
    methods: {
        pathJoin(name: string) {
            return path.join(this.pathname, name).replace(/^[\/]+|[\/]+$/g, "")
        }
    }
})
</script>
