/**
 * @Description: server type definition
 * @Author: ekibun
 * @Date: 2019-06-28 10:07:46
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 14:23:33
 */
declare type SocketData<T = any> = {
    type: string,
    data: T
}

declare type FileInfo = {
    name: string,
    isDirectory: boolean,
    isLink: boolean,
    size: number,
    atime?: Date,
    birthtime?: Date,
    mtime?: Date,
    ctime?: Date,
    aria2?: any[]
}