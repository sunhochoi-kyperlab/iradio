import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

import createLogger from './util/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  loading: false,
  run: false,
  selectMenu: '/',
  currentConutry: '',
  currentUrl: '',
  playUrl: '',
  mainList: [],
  subList: [],
  stationList: [],
  stationIndex: 0,
  tempStationList: [],
  depthInfo: [],
  audioObj: undefined,
  popupShow: false,
  popupData: {
    title: '',
    contents: [],
    buttons: []
  }
}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
