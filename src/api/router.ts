/**
 * @Description: map controllers and return router 
 * @Author: ekibun
 * @Date: 2019-06-28 10:01:25
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-03 12:40:59
 */
import Router from 'koa-router'

function addMapping(router: Router, mapping: any){
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            var path = url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            var path = url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router: Router) {
    let context = require.context('./controllers', false, /.ts$/)
    context.keys().forEach((key)=>{
        console.log(`process controller: ${key}...`);
        let mapping = context(key).default;
        addMapping(router, mapping);
    })
}

export default function() {
    let router = new Router();
    addControllers(router);
    return router.routes();
}