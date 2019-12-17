<template>
  <div id="player" class="contents">
    <div class="song-info">
      <div class="cover">
        <img :src="stationList.length > 0 && stationList[stationIndex] ? stationList[stationIndex].logo : ''" alt="" width="180px" height="180px">
      </div>
      <h2 class="title"><em></em>{{stationList.length > 0 && stationList[stationIndex] ? stationList[stationIndex].title : ''}}</h2>
      <p class="sub-info"><em></em>{{stationList.length > 0 && stationList[stationIndex] ? stationList[stationIndex].desc : ''}}</p>
    </div>
    <div class="controls">
      <button class="forward" :class="stationList.length > 1 ? '' : 'dis'" @click="onBackward"></button>
      <button :class="run ? 'pause' : 'play'" @click="onClick"></button>
      <button class="backward" :class="stationList.length > 1 ? '' : 'dis'" @click="onForward"></button>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  computed: {
    ...mapState({
      stationList: state => state.stationList,
      stationIndex: state => state.stationIndex,
      run: state => state.run
    })
  },
  methods: {
    onClick () {
      if (this.run) {
        console.log('[iRadio] Pause')
        this.$store.commit('runPause')
      } else {
        console.log('[iRadio] Play')
        this.runPlay(this.stationIndex)
      }
    },
    onForward () {
      console.log('[iRadio] onForward')
      let index = this.stationIndex + 1
      if (index > this.stationList.length - 1) {
        index = 0
      }
      this.runPlay(index)
    },
    onBackward () {
      console.log('[iRadio] onBackward')
      let index = this.stationIndex - 1
      if (index < 0) {
        index = this.stationList.length - 1
      }
      this.runPlay(index)
    },
    runPlay (index) {
      this.$store.commit('setLoading', {loading: true})
      this.$store.commit('runPause')

      Promise.resolve()
        .then(() => {
          if (this.stationList[index]) {
            console.log('[iRadio] get requestTrackInfo')
            return this.$store.dispatch('requestTrackInfo', {stationInfo: this.stationList[index]})
          } else {
            return Promise.reject(`Not found Station Item(index: ${index}, stationLength: ${this.stationList.length})`)
          }
        })
        .then((playUrl) => {
          console.log('[iRadio] get requestTrackInfo : ', playUrl)
          this.$store.commit('setStationIndex', index)
          this.$store.commit('setPlayUrl', playUrl)
          return this.$store.dispatch('tryPlayer')
        })
        .catch(err => {
          err = typeof err === 'object' ? err.toString() : err
          console.log('[iRadio] runPlay Err: ', err)
          if (err && err.indexOf('Cannot load channel.') >= 0) {
            this.$store.commit('setLoading', {loading: false})
            return this.$store.dispatch('msgStationLoadingError')
          }
        })
        .finally(() => {
          this.$store.commit('setLoading', {loading: false})
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.title, .sub-info {
  overflow:hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

