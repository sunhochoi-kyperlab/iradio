import store from '../store'

const mac = '815b5b7e1008ed92aecda2a7053b1c96'

const Urls = {
  information: `http://obigodev.vtuner.com/setupapp/obigodev/asp/browsexml/loginXML.asp?mac=${mac}`,
  continent: `http://obigodev.vtuner.com/setupapp/obigodev/asp/browsexml/navXML.asp?gofile=LocationLevelTwo&mac=${mac}`,
  genre: `http://obigodev.vtuner.com/setupapp/obigodev/asp/browsexml/navXML.asp?gofile=GenreLevelTwo&mac=${mac}`,
  new: `http://obigodev.vtuner.com/setupapp/obigodev/asp/browsexml/navXML.asp?gofile=NewStation&mac=${mac}`,
  popular: `http://obigodev.vtuner.com/setupapp/obigodev/asp/browsexml/navXML.asp?gofile=MostPopStations&localOnly=N&mac=${mac}`
}

var NetworkCount = 3 // eslint-disable-line no-unused-vars
function initNetworkCount () {
  NetworkCount = 3
}

function requestInformation () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.information)
      .then(text => {
        const datas = getItems(text)
        resolve(datas)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestCurrent () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.information)
      .then(text => {
        const items = getItems(text)
        const currentData = items[0]
        resolve({
          title: currentData.Title || '',
          url: currentData.UrlDir
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestContinent () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.continent)
      .then(text => {
        const items = getItems(text)
        let datas = []
        items.forEach((v) => {
          if (v.ItemType === 'Dir') {
            datas.push({
              title: v.Title,
              url: v.UrlDir
            })
          }
        })
        resolve(datas)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestGenre () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.genre)
      .then(text => {
        const items = getItems(text)
        let datas = []
        items.forEach((v) => {
          if (v.ItemType === 'Dir') {
            datas.push({
              title: v.Title,
              url: v.UrlDir
            })
          }
        })
        resolve(datas)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestNewStation () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.new)
      .then(text => {
        const datas = getItems(text)
        resolve(datas)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestPopular () {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(Urls.popular)
      .then(text => {
        const items = getItems(text)
        resolve(itemsToStations(items))
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestList (url) {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(url)
      .then(text => {
        const datas = getItems(text)
        resolve(datas)
      })
      .then(err => {
        reject(err)
      })
      .catch(err => {
        reject(err)
      })
  })
}

function requestStations (url) {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(url)
      .then(text => {
        const items = getItems(text)
        resolve(itemsToStations(items))
      })
      .catch(err => {
        reject(err)
      })
  })
}

function getRequest (url, opt) {
  function request (url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()
      if (opt && opt.timeout) {
        req.timeout = opt.timeout
      } else {
        req.timeout = 15 * 1000
      }
      req.open('GET', url, true)
      req.onreadystatechange = aEvt => {
        if (req.readyState === 4) {
          if (req.status === 200) {
            resolve(req.responseText)
          } else {
            reject(`Network Error(code: ${req.status}): ${req.responseText || ''}`)
          }
        }
      }
      req.ontimeout = e => {
        reject('Network Error : Timeout')
      }
      req.send(null)
    })
  }
  return request(url)
    .catch(err => {
      if (err.indexOf('Network Error') >= 0) {
        store.commit('setLoading', {loading: false})
        if (NetworkCount > 0) {
          return store.dispatch('msgNetworkError')
            .then((isRetry) => {
              store.commit('setLoading', {loading: true})
              if (isRetry) {
                NetworkCount--
                return delay(1000)
                  .then(() => {
                    return getRequest(url)
                  })
              } else {
                store.commit('setLoading', {loading: false})
                return Promise.reject(new Error('cancel Network Connection'))
              }
            })
        } else {
          return store.dispatch('msgNetworkLimitTryError')
            .then(() => {
              return Promise.reject(new Error('Network Limit Try Error'))
            })
        }
      } else {
        return
      }
    })
}

function delay (t, v) {
  return new Promise((resolve) => {
    setTimeout(resolve.bind(null, v), t)
  })
}

function itemsToStations (items) {
  let stations = []
  let index = 0
  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i]
    const type = item.ItemType
    if (type === 'Station') {
      stations.push({
        title: item.StationName,
        url: item.StationUrl,
        desc: item.StationDesc,
        logo: item.Logo || item.LogoPl || '',
        mime: item.StationMime,
        index: index++
      })
    }
  }
  return stations
}

function getItems (text) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')
  const jsonData = xmlToJson(xmlDoc)
  const listOfItems = jsonData.ListOfItems || {}
  const items = listOfItems.Item || []
  let datas = []
  items.forEach(value => {
    var data = {}
    var keys = Object.keys(value)
    for (let i = 0, l = keys.length; i < l; i++) {
      if (value[keys[i]]['#text']) {
        data[keys[i]] = value[keys[i]]['#text']
      }
    }
    datas.push(data)
  })
  return datas
}

function xmlToJson (xml) {
  // Create the return object
  let obj = {}

  if (xml.nodeType === 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType === 3) { // text
    obj = xml.nodeValue
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i)
      let nodeName = item.nodeName
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          let old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }
  return obj
}

function getStationPlayUrl (stationUrl) {
  return new Promise((resolve, reject) => {
    initNetworkCount()
    getRequest(stationUrl, {timeout: 5000})
      .then((text) => {
        resolve(text)
      })
      .catch(err => {
        reject(err)
      })
  })
}

exports.requestInformation = requestInformation
exports.requestCurrent = requestCurrent
exports.requestContinent = requestContinent
exports.requestGenre = requestGenre
exports.requestNewStation = requestNewStation
exports.requestPopular = requestPopular
exports.requestList = requestList
exports.requestStations = requestStations
exports.getStationPlayUrl = getStationPlayUrl
exports.itemsToStations = itemsToStations
exports.Urls = Urls

