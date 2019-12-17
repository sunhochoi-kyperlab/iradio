<template>
  <div id="list-3" class="contents full">
    <div class="fix-item">
      <p>{{getSubTitle}}</p>
    </div>
    <div class="list final" ref="stationScroll">
      <ul>
        <template v-for="(item, index) in tempStationList">
          <li @touchstart="onStart" @touchend="onEnd(item, index, $event)" @mousedown="onStart" @mouseup="onEnd(item, index, $event)" :key="index">
            <div class="cover"><img :src="item.logo" alt="" width="100px" height="100px"></div>
            <h3>{{item.title}}</h3>
            <p class="sub-text">{{item.desc}}</p>  
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import Iscroll from 'obigo-js-ui/features/iscroll'

export default {
  data () {
    return {
      clickPoint: {
        range_x: 140,
        range_y: 40,
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState({
      tempStationList: state => state.tempStationList
    }),
    ...mapGetters({
      getSubTitle: 'getSubTitle'
    })
  },
  methods: {
    onStart (e) {
      console.log('[iRadio] onStart')
      e = e.touches ? e.touches[0] : e
      this.clickPoint.x = e.clientX
      this.clickPoint.y = e.clientY
    },
    onEnd (item, index, e) {
      console.log('[iRadio] onEnd')
      e = e.changedTouches ? e.changedTouches[0] : e
      let deltaX = Math.abs(e.clientX - this.clickPoint.x)
      let deltaY = Math.abs(e.clientY - this.clickPoint.y)
      if (deltaX > this.clickPoint.range_x || deltaY > this.clickPoint.range_y) {
        return
      }
      this.movePage(item, index)
    },
    movePage (stationInfo, index) {
      this.$store.commit('setLoading', {loading: true})
      this.$store.commit('runPause')
      this.$store.commit('clearStationList')
      this.$store.commit('setStationList', [...this.tempStationList])
      this.$store.dispatch('requestTrackInfo', {stationInfo: stationInfo})
        .then((playUrl) => {
          this.$store.commit('setStationIndex', index)
          this.$store.commit('setPlayUrl', playUrl)
          return this.$store.dispatch('tryPlayer')
        })
        .then(() => {
          this.$store.commit('setSelectMenu', '/')
          this.$store.commit('clearDepthInfo')
          this.$router.push('/')
          this.$store.commit('clearTempStationList')
        })
        .catch(err => {
          err = typeof err === 'object' ? err.toString() : err
          console.log('[iRadio] StationMenu err: ', err)
          if (err && err.indexOf('Cannot load channel.') >= 0) {
            this.$store.commit('setLoading', {loading: false})
            return this.$store.dispatch('msgStationLoadingError')
          }
        })
        .finally(() => {
          this.$store.commit('setLoading', {loading: false})
        })
    },
    makeScroll () {
      this.$scroll = new Iscroll(this.$refs.stationScroll, {
        probeType: 2,
        scrollY: true,
        bounce: false,
        mouseWheel: false,
        scrollbars: true,
        fadeScrollbars: true,
        interactiveScrollbars: false,
        click: true,
        disableMouse: !('onmousedown' in window),
        disablePointer: true,
        disableTouch: !('ontouchstart' in window)
      })
    }
  },
  mounted () {
    this.makeScroll()
  },
  updated () {
    this.$scroll.refresh()
  }
}
</script>

<style lang="scss" scoped>
  ::-webkit-scrollbar {
    display: none;
  }
  .list {
    position: absolute;
  }
</style>
