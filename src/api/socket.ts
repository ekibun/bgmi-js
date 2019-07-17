/**
 * @Description: WebSocket utils
 * @Author: ekibun
 * @Date: 2019-06-28 10:04:48
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-03 12:41:23
 */
import WebSocket from 'ws'

export type CallbackListener = (ws: WebSocket)=>void
let routeMap = new Map<String, CallbackListener>()
let socket: WebSocket.Server|null = null

export default class Socket{
    /**
     * initialization, exported to server
     * @param server 
     */
    static setSocket(server: WebSocket.Server){
        socket = server
        socket.removeAllListeners('connection')
        socket.on('connection', function (ws, req) {
            ws.url = req.url || ws.url
            console.log(`WS ${ws.url}...`)
            let onConnect = routeMap.get(ws.url)
            if(onConnect) onConnect(ws)
        });
    }

    /**
     * register on connection listener
     * @param route 
     * @param onConnect 
     */
    static onConnection(route: string, onConnect: CallbackListener){
        routeMap.set(route, onConnect)
    }

    /**
     * un-register on connection listener
     * @param route 
     */
    static offConnection(route: string){
        routeMap.delete(route)
    }

    /**
     * send `data` to specified `route`
     * @param route 
     * @param data 
     */
    static broadcast(route: string, data: SocketData){
        let jsonData = JSON.stringify(data)
        socket!.clients.forEach((ws: WebSocket)=>{
            if(ws.url == route) ws.send(jsonData)
        })
    }
}