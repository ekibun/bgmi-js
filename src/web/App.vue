<!--
 * @Description: root app component
 * @Author: ekibun
 * @Date: 2019-06-28 10:34:27
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 10:51:42
 -->
<template>
    <div id="app">
        <transition :name="transitionName">
            <router-view class="transition" :key="$route.params.path"></router-view>
        </transition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data() {
        return {
            transitionName: 'slide-left'
        }
    },
    watch: {
        '$route'(to, from) {
            const toDepth = to.path.split('/').filter(v => v).length
            const fromDepth = from.path.split('/').filter(v => v).length
            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
        }
    }
})
</script>

<style lang="scss">
@import "theme";
@import "transition";

body,
#app {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.transition {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
    position: absolute;
}
</style>