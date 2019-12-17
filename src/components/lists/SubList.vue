<template>
  <div id="list-2" class="contents">
    <div class="fix-item">
      <p>{{getSubTitle}}</p>
    </div>
    <div class="list" ref="subScroll">
      <ul>
        <template v-for="(item, index) in subList">
          <li @touchstart="onStart" @touchend="onEnd(item.title, item.url, $event)" @mousedown="onStart" @mouseup="onEnd(item.title, item.url, $event)" :key="index">
            <p>{{item.title}}</p>
            <i></i>
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
      currentPageUrl: '',
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
      subList: state => state.subList,
      depthInfo: state => state.depthInfo
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
    onEnd (title, url, e) {
      console.log('[iRadio] onEnd')
      e = e.changedTouches ? e.changedTouches[0] : e
      let deltaX = Math.abs(e.clientX - this.clickPoint.x)
      let deltaY = Math.abs(e.clientY - this.clickPoint.y)
      if (deltaX > this.clickPoint.range_x || deltaY > this.clickPoint.range_y) {
        return
      }
      this.movePage(title, url)
    },
    movePage (title, url) {
      let actionName = ''
      if (this.currentPageUrl === '/location/country') {
        actionName = 'requestCountryData'
      } else {
        actionName = 'requestStationData'
      }

      this.$store.commit('setLoading', {loading: true})
      this.$store.dispatch(actionName, {url: url})
        .then((item) => {
          if (item.type === 'StationList') {
            if (item.datas.length === 0) {
              return this.$store.dispatch('msgEmptyStationError')
            }
            this.$router.push(this.currentPageUrl + '/station')
          }
          this.$store.commit('pushDepthInfo', {
            type: item.type,
            name: title,
            tempData: item.datas
          })
          this.$store.commit('setLoading', {loading: false})
        })
        .catch((err) => {
          console.log(`[iRadio] SubMenu Err(${actionName}): ${err}`)
        })
        .finally(() => {
          this.$store.commit('setLoading', {loading: false})
        })
    },
    makeScroll () {
      this.$scroll = new Iscroll(this.$refs.subScroll, {
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
    this.currentPageUrl = this.$route.path
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
