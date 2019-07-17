/**
 * @Description: fs store
 * @Author: ekibun
 * @Date: 2019-07-16 22:42:45
 * @LastEditors: ekibun
 * @LastEditTime: 2019-07-17 11:51:45
 */
import { ActionTree, GetterTree, Module, MutationTree } from 'vuex'
import HttpUtils from '@web/utils/HttpUtils';

export class State {
    ls: { path: string, files: FileInfo[] }[] = []
}

export function normPath(p: string | undefined): string {
    p = (p || '').replace(/^[\/]+|[\/]+$/g, "")
    return p == '.' ? '' : p
}

export default <Module<State, any>>{
    namespaced: true,
    state: new State,
    getters: <GetterTree<State, any>>{},
    actions: <ActionTree<State, any>>{
        async getls({ commit }, { path }) {
            path = normPath(path)
            return HttpUtils.get(`/api/fs/ls?path=/${path}`).then(files => {
                commit('setls', { path: `/${path}`, files })
            })
        }
    },
    mutations: <MutationTree<State>>{
        setls(state, data) {
            let index = state.ls.findIndex(v => v.path == data.path)
            if (~index) {
                state.ls.splice(index, 1, data)
            } else {
                state.ls.push(data)
            }
        }
    }
}