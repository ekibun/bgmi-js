<!--
 * @Description: 
 * @Author: ekibun
 * @Date: 2019-07-12 11:13:45
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-14 08:34:51
 -->
<template>
    <div class="loading">
        <div class="spinner">
            <div class="dot1"></div>
            <div class="dot2"></div>
        </div>
        <slot>loading...</slot>
    </div>

</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({

})
</script>

<style lang="scss" scoped>
@import "theme";

.loading {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;

    height: 130px;

    margin: auto;
    text-align: center;
}

.spinner {
    margin: 0 auto 20px;
    width: 90px;
    height: 90px;
    text-align: center;
    position: relative;

    -webkit-animation: rotate 2s infinite linear;
    animation: rotate 2s infinite linear;
}

.dot1,
.dot2 {
    width: 60%;
    height: 60%;
    display: inline-block;
    position: absolute;
    top: 0;
    background-color: $color-brand;
    border-radius: 100%;

    animation: bounce 2s infinite ease-in-out;
}

.dot2 {
    top: auto;
    bottom: 0px;
    animation-delay: -1s;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes bounce {
    0%,
    100% {
        transform: scale(0);
    }
    50% {
        transform: scale(1);
    }
}
</style>

