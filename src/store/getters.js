
const getters = {
  getSubTitle (state) {
    const list = []
    let str = ''
    state.depthInfo.forEach(v => {
      list.push(v.name)
    })
    str = list.join(' > ')
    if (state.depthInfo.length > 0) {
      str += ` (${state.depthInfo[state.depthInfo.length - 1].tempData.length})`
    } else {
      str += ' (0)'
    }
    return str
  }
}

export default getters
