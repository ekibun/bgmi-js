/**
 * @Description: API entry point
 * @Author: ekibun
 * @Date: 2019-06-28 09:58:41
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 13:06:33
 */
import router from '@api/router'
import socket from '@api/socket'
import aria2c from '@api/aria2c'

export default {
    router: router(),
    setSocket: socket.setSocket,
    setAria2c: aria2c.setAria2c
}