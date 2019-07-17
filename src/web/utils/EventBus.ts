/**
 * @Description: event bus
 * @Author: ekibun
 * @Date: 2019-06-29 15:20:18
 * @LastEditors: ekibun
 * @LastEditTime: 2019-06-29 15:27:38
 */
export type EventCallback = {
    callback: (data: any) => void,
    once: boolean
}
const listener: Map<any, Map<String, EventCallback>> = new Map();
const events: Map<string, any> = new Map();

export default class EventBus {
    /**
     * register event listener, which will be triggered only once and then removed
     * @param event 
     * @param key 
     * @param callback 
     */
    static once(event: string, key: any, callback: (data: any) => void) {
        EventBus.on(event, key, callback, true);
    }

    /**
     * register event listener
     * @param event 
     * @param key 
     * @param callback 
     * @param once 
     */
    static on(event: string, key: any, callback: (data: any) => void, once: boolean = false) {
        if (process.env.VUE_ENV == 'server') return // do not register in server
        if (!listener.has(event)) {
            listener.set(event, new Map());
        }
        listener.get(event)!.set(key, {
            callback: callback,
            once: once
        });
    }

    /**
     * un-register event listener
     * @param event 
     * @param key 
     */
    static off(event: string, key: any) {
        let callbacks = listener.get(event);
        if (!callbacks || callbacks.size == 0) return;
        callbacks.delete(key);
        if (callbacks.size == 0) listener.delete(event);
    }

    /**
     * trigger evnet with data 
     * @param event 
     * @param data 
     */
    static emit(event: string, data: any = undefined) {
        let callbacks = listener.get(event);
        if (!callbacks || callbacks.size == 0) return;
        for (let key of callbacks.keys()) {
            let callback = callbacks.get(key);
            callback!.callback(data);
            if (callback!.once) callbacks.delete(key);
        }
    }

    /**
     * trigger evnet with data asynchronously
     * @param event 
     * @param data 
     */
    static post(event: string, data: any = undefined) {
        if (!events.delete(event)) {
            new Promise((resolve) => { resolve() }).then(() => {
                let data = events.get(event);
                if (events.delete(event))
                    EventBus.emit(event, data);
            })
        }
        events.set(event, data);
    }
}