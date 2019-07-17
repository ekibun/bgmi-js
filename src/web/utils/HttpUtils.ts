/**
 * @Description: 
 * @Author: ekibun
 * @Date: 2019-07-16 22:44:02
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-16 22:44:38
 */
import axios from 'axios';
import EventBus from "./EventBus";
import conf from '../../../config/app'

const http = axios.create({
    baseURL: 'http://' + (process.env.VUE_ENV == 'server' ? conf.app.devHost + ':' + conf.app.port : window.location.host)
})

export default class HttpUtils {
    static get<T>(url: string, config?: any): Promise<T> {
        return new Promise((resolve) => {
            <any>http.get(url, config).then((res: any) => {
                if (res.status == 200) resolve(res.data)
            }).catch(config && config.catch || function (error: any) {
                console.log(error)
                EventBus.emit("addMessage", error.response.data);
            });
        })
    }
    static post<T>(url: string, data?: any, config?: any): Promise<T> {
        return new Promise((resolve) => {
            <any>http.post(url, data, config).then((res: any) => {
                if (res.status == 200) resolve(res.data)
            }).catch(config && config.catch || function (error: any) {
                console.log(error)
                EventBus.emit("addMessage", error.response.data);
            });
        });
    }
}