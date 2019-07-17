/*
 * @Description: aria2c proc
 * @Author: ekibun
 * @Date: 2019-07-16 17:52:19
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 13:42:35
 */
const chalk = require('chalk')
const log = require('./log')(chalk.yellow('aria2'))
const spawn = require('child_process').spawn
const Aria2 = require('aria2')
const aria2 = new Aria2({
    host: 'localhost',
    port: 6800,
    secure: false,
    secret: 'ekibun',
    path: '/jsonrpc'
})

let proc = undefined
function startProcess(cwd) {
    log.v(`starting process...`)
    proc = spawn('aria2c --conf-path=./aria2.conf',
        { cwd, shell: true })
    proc.stdout.on('data', (data) => {
        log.v(data)
    })
    proc.stderr.on('data', (data) => {
        log.e(data)
    })
    proc.on('close', (code) => {
        log.v(chalk.red(`process close ${code}`))
        setTimeout(() => {
            startProcess(cwd)
        }, 1000)
    })
}

function startSocket() {
    let retry = () => {
        setTimeout(() => {
            startSocket()
        }, 1000)
    }
    log.v(`starting socket...`)
    // emitted when the WebSocket is open.
    aria2.on('open', () => {
        log.v('socket OPEN')
        aria2.onOpen && aria2.onOpen();
        (async () => {
            const notifications = await aria2.listNotifications();
            /*
            [
              'onDownloadStart',
              'onDownloadPause',
              'onDownloadStop',
              'onDownloadComplete',
              'onDownloadError',
              'onBtDownloadComplete'
            ]
            */

            // notifications logger example
            notifications.forEach((notification) => {
                aria2.on(notification, (params) => {
                    log.v(notification, JSON.stringify(params))
                    aria2[notification] && aria2[notification]()
                })
            })
        })()

    })

    // emitted when the WebSocket is closed.
    aria2.on('close', () => {
        log.v('socket CLOSE')
        aria2.onClose && aria2.onClose()
        retry()
    })

    // emitted for every message sent.
    aria2.on('output', (m) => {
        aria2.onOutput && aria2.onOutput(m)
    })

    // emitted for every message received.
    aria2.on('input', (m) => {
        aria2.onInput && aria2.onInput(m)
    })

    aria2.open().catch((e) => {
        log.e(e.stack || e)
        retry()
    })
    return aria2
}

module.exports = {
    startProcess,
    startSocket
}