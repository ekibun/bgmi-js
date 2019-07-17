<!--
 * @Description: Home page (debug only)
 * @Author: ekibun
 * @Date: 2019-06-28 11:26:15
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 17:19:16
 -->
<template>
    <md-table v-model="searched"
        class="md-size-100"
        md-sort="name"
        md-sort-order="asc"
        md-fixed-header
        @md-selected="onSelect">
        <md-table-toolbar>
            <div class="md-toolbar-section-start">
                <h1 class="md-title">{{ pathname }}</h1>
            </div>

            <md-field md-clearable
                class="md-toolbar-section-end">
                <md-input placeholder="Search by name..."
                    v-model="search"
                    @input="searchOnTable" />
            </md-field>
        </md-table-toolbar>

        <md-table-row slot="md-table-row"
            slot-scope="{ item }"
            md-selectable="single">
            <md-table-cell md-label="Name"
                md-sort-by="name">{{ item.name }}</md-table-cell>
            <md-table-cell md-label="Size"
                md-sort-by="size">{{ item.size }}</md-table-cell>
        </md-table-row>
    </md-table>
</template>

<script lang="ts">
import Vue from 'vue'
import path from 'path'
import { normPath } from '@web/store/modules/fs'

const searchByName = (items, term) => items && items.filter(item => item.name.toString().toLowerCase().includes((term || "").toString().toLowerCase()))

export default Vue.extend({
    data: () => ({
        search: null,
        searched: []
    }),
    asyncData(store, route) {
        return store.dispatch("fs/getls", { path: route.params.path })
    },
    watch: {
        files: {
            handler(value) {
                this.searched = searchByName(value, this.search)
            },
            immediate: true
        }
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
        },
        searchOnTable() {
            this.searched = searchByName(this.files, this.search)
        },
        onSelect(item) {
            this.$router.push(`/fs/${this.pathJoin(item.name)}`)
        }
    }
})
</script>

<style lang="scss" scoped>
</style>

