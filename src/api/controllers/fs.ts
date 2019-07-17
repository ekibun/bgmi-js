/**
 * @Description: 
 * @Author: ekibun
 * @Date: 2019-07-16 21:15:24
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 14:27:32
 */
import { ParameterizedContext } from 'koa'
import path from 'path'
import fs from 'mz/fs'
import aria2c from '@api/aria2c'

const filePrefix = './aria2/files'

export default {
    'GET /api/fs/ls': async (ctx: ParameterizedContext) => {
        let dir = `${filePrefix}${ctx.query.path}`
        let list: FileInfo[] = await Promise.all((await fs.readdir(dir).catch(e => { throw { status: 405, ...e } })).map(async (f) => {
            let fp = path.join(dir, f)
            let stat = await fs.lstat(fp)
            let isSymbolicLink = stat.isSymbolicLink()
            let isDirectory = stat.isDirectory()
            if (isSymbolicLink) {
                let linkStat = <fs.Stats | null>(await fs.stat(fp).catch(() => { return null }))
                isDirectory = linkStat && linkStat.isDirectory() || isDirectory
            }
            return {
                name: f,
                isDirectory: isDirectory,
                isLink: isSymbolicLink,
                size: stat.size,
                atime: stat.atime,
                birthtime: stat.birthtime,
                mtime: stat.mtime,
                ctime: stat.ctime
            }
        }))
        let stat = aria2c.getStat();
        [...stat.active, ...stat.waitting, ...stat.stopped].forEach(item => {
            for (let f of item.files) {
                if (path.dirname(f.path) == `./files${ctx.query.path}`.replace(/\/+$/g, "")) {
                    let name = path.basename(f.path)
                    let file = list.find(v => v.name == name)
                    if (file) {
                        file.aria2 = [...(file.aria2 || []), item]
                    } else {
                        list.push({
                            name,
                            isDirectory: false,
                            isLink: false,
                            size: -1,
                            aria2: [item]
                        })
                    }
                }
            }
        })
        ctx.response.body = list
    }
}