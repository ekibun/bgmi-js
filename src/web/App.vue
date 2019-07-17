<!--
 * @Description: root app component
 * @Author: ekibun
 * @Date: 2019-06-28 10:34:27
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 17:23:32
 -->
<template>
    <div id="app">
        <div class="page-container">
            <md-app>
                <md-app-toolbar class="md-primary">
                    <md-button class="md-icon-button md-medium-hide"
                        @click="toggleMenu">
                        <md-icon>menu</md-icon>
                    </md-button>
                    <span class="md-title">My Title</span>
                </md-app-toolbar>

                <md-app-content>
                    <transition :name="transitionName">
                        <router-view class="transition"
                            :key="$route.params.path"></router-view>
                    </transition>
                </md-app-content>

                <md-app-drawer :md-active.sync="menuVisible"
                    md-permanent="clipped">
                    <md-toolbar class="md-transparent"
                        md-elevation="0">
                        <span>Navigation</span>
                    </md-toolbar>

                    <md-list>
                        <md-list-item>
                            <md-icon>move_to_inbox</md-icon>
                            <span class="md-list-item-text">Inbox</span>
                        </md-list-item>

                        <md-list-item>
                            <md-icon>send</md-icon>
                            <span class="md-list-item-text">Sent Mail</span>
                        </md-list-item>

                        <md-list-item>
                            <md-icon>delete</md-icon>
                            <span class="md-list-item-text">Trash</span>
                        </md-list-item>

                        <md-list-item>
                            <md-icon>error</md-icon>
                            <span class="md-list-item-text">Spam</span>
                        </md-list-item>
                    </md-list>
                </md-app-drawer>
            </md-app>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data: () => ({
        transitionName: 'slide-left',
        menuVisible: false
    }),
    watch: {
        '$route'(to, from) {
            const toDepth = to.path.split('/').filter(v => v).length
            const fromDepth = from.path.split('/').filter(v => v).length
            this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
        }
    },
    methods: {
        toggleMenu() {
            this.menuVisible = !this.menuVisible
        }
    }
})
</script>

<style lang="scss">
@import "transition";
@import "~vue-material/src/components/MdAnimation/variables";
@import "~vue-material/src/theme/engine";

body,
#app {
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.md-app {
    padding: 0;
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
}

// Demo purposes only
.md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
}

.transition {
    transition: all 0.5s $md-transition-stand-timing;
    position: absolute;
}
</style>