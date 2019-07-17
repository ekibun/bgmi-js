/**
 * @Description: 
 * @Author: ekibun
 * @Date: 2019-07-16 17:51:51
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 14:11:08
 */

import Aria2 from 'aria2'

let aria2c: Aria2

type Aria2cStat = {
    downloadSpeed: string,
    uploadSpeed: string,
    numActive: string,
    numWaiting: string,
    numStopped: string,
    numStoppedTotal: string,
    active: any[],
    waitting: any[],
    stopped: any[]
}

let stat: Aria2cStat = {} as Aria2cStat
async function syncStatus(active: boolean = true, waitting: boolean = true, stopped: boolean = true) {
    stat = { ...stat, ...await aria2c.call('getGlobalStat') }
    if (active) stat.active = await aria2c.call('tellActive')
    if (waitting) stat.waitting = await aria2c.call('tellWaiting', 0, Number(stat.numWaiting))
    if (stopped) stat.stopped = await aria2c.call('tellStopped', 0, Number(stat.numStopped))
    if (aria2c.syncStatus == syncStatus && stat.active && stat.active.length > 0) {
        setTimeout(syncStatus, 10000)
    }
}

export default {
    setAria2c(aria2: Aria2) {
        aria2c = aria2;
        aria2c.syncStatus = syncStatus
        syncStatus();
    },
    getStat(): Aria2cStat {
        return stat
    }
}