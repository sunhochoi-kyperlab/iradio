import vTunner from '../js/vTunner'
import popup from 'obigo-js-ui/components/popup'
import i18n from '../i18n'

const actions = {
  initialize ({commit, state, dispatch}) {
    state.audioObj.addEventListener('pause', () => {
      commit('runPlay', false)
    })
    state.audioObj.addEventListener('play', () => {
      commit('runPlay', true)
    })
    return new Promise((resolve, reject) => {
      let firstTrack
      console.log('[iRadio] Initialize Start')
      return vTunner.requestCurrent()
        .then(currentData => {
          commit('setCurrentConutry', {current: currentData.title})
          commit('setCurrentUrl', {url: currentData.url})
        })
        .then(() => {
          const indexText = localStorage.getItem('vtuner-stationIndex')
          const stationsText = localStorage.getItem('vtuner-stationList')
          const index = JSON.parse(indexText)
          const stations = JSON.parse(stationsText)

          if (stations && stations[index]) {
            console.log('[iRadio] Local Start')
            commit('setStationList', stations)
            commit('setStationIndex', index)
            return vTunner.getStationPlayUrl(stations[index].url)
          } else {
            console.log('[iRadio] Init Start')
            return vTunner.requestPopular()
              .then(stationLists => {
                commit('setStationList', stationLists)
                firstTrack = stationLists[0]
                commit('setStationIndex', 0)
                return vTunner.getStationPlayUrl(firstTrack.url)
              })
          }
        })
        .then(firstTrackUrl => {
          console.log('[iRadio]firstTrackUrl: ', firstTrackUrl)
          commit('setPlayUrl', firstTrackUrl)
          resolve()
        })
        .catch(err => {
          if (err && err.message && (err.message.indexOf('Network Limit Try Error') >= 0 || err.message.indexOf('cancel Network Connection') >= 0) && window.applicationFramework) {
            window.applicationFramework.applicationManager.getOwnerApplication(window.document).back()
            window.applicationFramework.applicationManager.getOwnerApplication(window.document).destroyApplication()
          }
          reject(err)
        })
        .finally(() => {
          console.log('[iRadio] Initialize End')
        })
    })
  },
  requestRegion ({commit, state}) {
    return new Promise((resolve, reject) => {
      vTunner.requestList(state.currentUrl)
        .then(items => {
          const citiesItem = items.find((v) => v.Title === 'Largest Cities')
          if (citiesItem) {
            return vTunner.requestList(citiesItem.UrlDir)
          } else {
            return []
          }
        })
        .then(items => {
          commit('clearMainList')
          let datas = []
          items.forEach((v) => {
            if (v.IconTitle === 'Largest Cities') {
              datas.push({
                title: v.Title,
                url: v.UrlDir
              })
            }
          })
          commit('setMainList', {list: datas})
          resolve(datas)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  requestContinent ({commit, state}) {
    return new Promise((resolve, reject) => {
      vTunner.requestContinent()
        .then(items => {
          commit('clearMainList')
          commit('setMainList', {list: items})
          resolve(items)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  requestGenre ({commit, state}) {
    return new Promise((resolve, reject) => {
      vTunner.requestGenre()
        .then(items => {
          commit('clearMainList')
          commit('setMainList', {list: items})
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  requestRecommendation ({commit, state}) {
    return new Promise((resolve, reject) => {
      commit('clearMainList')
      const items = [
        {title: 'New Stations', url: vTunner.Urls.new},
        {title: 'Popular Stations', url: vTunner.Urls.popular}
      ]
      commit('setMainList', {list: items})
      resolve(items)
    })
  },
  requestSubData ({commit, state}, payload) {
    return new Promise((resolve, reject) => {
      vTunner.requestList(payload.url)
        .then(items => {
          commit('clearSubList')
          let datas = []
          items.forEach((v) => {
            if (v.ItemType === 'Dir') {
              datas.push({
                title: v.Title || '',
                url: v.UrlDir || ''
              })
            }
          })
          commit('setSubList', datas)
          resolve(datas)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  requestStationData ({commit, state}, payload) {
    return new Promise((resolve, reject) => {
      vTunner.requestStations(payload.url)
        .then(items => {
          if (items.length > 0) {
            commit('clearTempStationList')
            commit('setTempStationList', items)
          }
          resolve({
            type: 'StationList',
            datas: items || []
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  requestCountryData ({commit, state}, payload) {
    return new Promise((resolve, reject) => {
      let type = 'StationList' // or 'SubList'
      vTunner.requestList(payload.url)
        .then(items => {
          let allStationUrl = ''
          let listType = ''
          items.forEach(v => {
            if (v.IconTitle === 'All Stations') {
              allStationUrl = v.UrlDir
            }
            if (v.ItemType === 'Station') {
              listType = 'Station'
            }
          })
          if (listType) {
            return vTunner.itemsToStations(items)
          } else if (allStationUrl) {
            return vTunner.requestStations(allStationUrl)
          } else {
            type = 'SubList'
            let dirs = []
            items.forEach((v) => {
              if (v.ItemType === 'Dir') {
                dirs.push({
                  title: v.Title || '',
                  url: v.UrlDir || ''
                })
              }
            })
            return dirs
          }
        })
        .then(items => {
          if (type === 'SubList') {
            commit('clearSubList')
            commit('setSubList', items)
          } else {
            commit('clearTempStationList')
            commit('setTempStationList', items)
          }
          resolve({
            type: type,
            datas: items
          })
        })
    })
  },
  requestTrackInfo ({commit, state}, payload) {
    return new Promise((resolve, reject) => {
      let stationInfo = payload.stationInfo
      vTunner.getStationPlayUrl(stationInfo.url)
        .then(firstTrackUrl => {
          resolve(firstTrackUrl)
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  tryPlayer ({commit, state, action}) {
    return new Promise((resolve, reject) => {
      let count = 3
      const retryTime = 1000
      const timeout = 20 * 1000
      function tryPlay () {
        setTimeout(() => {
          if (state.audioObj && state.audioObj.paused && count > 0 && state.playUrl) {
            let skip = false
            let timeAttack = setTimeout(() => {
              skip = true
              state.audioObj.pause()
              console.log(`[iRadio] Try to run audio timeout.('url: ${state.playUrl})`)
              count = count - 1
              tryPlay()
            }, timeout)
            state.audioObj.play()
              .then(() => {
                if (skip) return
                clearTimeout(timeAttack)
                // commit('runPlay', true)
                resolve()
              })
              .catch((err) => {
                if (skip) return
                clearTimeout(timeAttack)
                console.log(`[iRadio] Try to run audio failed.(url: ${state.playUrl}): ${err}`)
                count = count - 1
                tryPlay()
              })
          } else if (count === 0) {
            state.audioObj.pause()
            // commit('runPlay', false)
            reject('Cannot load channel.')
          } else {
            state.audioObj.pause()
            // commit('runPlay', false)
            resolve()
          }
        }, retryTime)
      }
      tryPlay()
    })
  },
  msgNetworkError ({commit, state}) {
    return new Promise((resolve, reject) => {
      const pop = popup.show({
        title: i18n.t('network_error_title'),
        content: i18n.t('network_error_content'),
        buttons: [
          {
            label: i18n.t('button_retry'),
            onClick: () => {
              pop.close()
              resolve(true)
            }
          },
          {
            label: i18n.t('button_cancel'),
            onClick: () => {
              pop.close()
              resolve(false)
            }
          }
        ]
      })
    })
  },
  msgNetworkLimitTryError ({commit, state}) {
    return new Promise((resolve, reject) => {
      const pop = popup.show({
        title: i18n.t('station_network_limit_title'),
        content: i18n.t('station_network_limit_content'),
        buttons: [
          {
            label: i18n.t('button_ok'),
            onClick: () => {
              pop.close()
              resolve()
            }
          }
        ]
      })
    })
  },
  msgEmptyStationError ({commit, state}) {
    return new Promise((resolve, reject) => {
      const pop = popup.show({
        title: i18n.t('empty_station_error_title'),
        content: i18n.t('empty_station_error_content'),
        clickOverlay: () => {
          pop.close()
        }
      })
    })
  },
  msgStationLoadingError ({commit, state}) {
    return new Promise((resolve, reject) => {
      const pop = popup.show({
        title: i18n.t('station_loading_error_title'),
        content: i18n.t('station_loading_error_content'),
        buttons: [
          {
            label: i18n.t('button_ok'),
            onClick: () => {
              pop.close()
              resolve()
            }
          }
        ]
      })
    })
  }
}

export default actions
