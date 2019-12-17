const mutations = {
  setCurrentConutry (state, payload) {
    state.currentConutry = payload.current || ''
  },
  setCurrentUrl (state, payload) {
    state.currentUrl = payload.url || ''
  },
  setLoading (state, payload) {
    state.loading = payload.loading || false
  },
  setMainList (state, payload) {
    state.mainList = payload.list
  },
  clearMainList (state, payload) {
    state.mainList = []
  },
  setSubList (state, payload) {
    state.subList = payload
  },
  clearSubList (state, payload) {
    state.subList = []
  },
  setStationList (state, payload) {
    state.stationList = payload
    localStorage.setItem('vtuner-stationList', JSON.stringify(state.stationList))
  },
  setStationIndex (state, payload) {
    state.stationIndex = payload
    localStorage.setItem('vtuner-stationIndex', state.stationIndex)
  },
  setTempStationList (state, payload) {
    state.tempStationList = payload
  },
  setPlayUrl (state, payload) {
    state.playUrl = payload
  },
  clearStationList (state, payload) {
    state.stationList = []
    localStorage.setItem('vtuner-stationList', '')
  },
  clearTempStationList (state, payload) {
    state.tempStationList = []
  },
  pushDepthInfo (state, payload) {
    if (payload.name) {
      state.depthInfo.push({
        type: payload.type, // 'SubList', 'StationList'
        name: payload.name,
        tempData: payload.tempData // []
      })
    }
  },
  popDepthInfo (state, payload) {
    state.depthInfo.pop()
    let depthData = state.depthInfo[state.depthInfo.length - 1]
    if (depthData && depthData.type === 'SubList') {
      state.subList = depthData.tempData
    } else if (depthData && depthData.type === 'StationList') {
      state.stationList = depthData.tempData
    }
  },
  clearDepthInfo (state, payload) {
    state.depthInfo = []
  },
  runPlay (state, payload) {
    state.run = payload
  },
  runPause (state) {
    state.audioObj.pause()
    if (state.audioObj.paused) {
      state.run = false
    }
  },
  settingAudioObject (state, payload) {
    state.audioObj = payload.obj
  },
  setSelectMenu (state, payload) {
    state.selectMenu = payload
  },
  showPopup (state, payload) { // title:String, content:String, buttons: array
    state.popupData.title = payload.title
    state.popupData.contents = payload.content.split('\n')
    state.popupData.buttons = payload.buttons || []
    state.popupShow = true
  },
  closePopup (state) {
    state.popupShow = false
    state.popupData.title = ''
    state.popupData.contents = []
    state.popupData.buttons = []
  }
}

export default mutations
