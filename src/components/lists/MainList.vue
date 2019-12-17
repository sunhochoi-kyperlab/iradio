<template>
<div id="list-1" class="contents">
  <div class="list" ref="mainScroll">
    <ul>
      <template v-for="(item, index) in mainList">
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
import {mapState} from 'vuex'
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
      mainList: (state) => state.mainList
    })
  },
  methods: {
    onStart (e) {
      console.log('[iRadio] Touch onStart')
      e = e.touches ? e.touches[0] : e
      this.clickPoint.x = e.clientX
      this.clickPoint.y = e.clientY
    },
    onEnd (title, url, e) {
      console.log('[iRadio] Touch onEnd')
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
      if (['/location', '/genre'].indexOf(this.currentPageUrl) >= 0) {
        actionName = 'requestSubData'
      } else {
        actionName = 'requestStationData'
      }

      if (actionName) {
        this.$store.commit('setLoading', {loading: true})
        this.$store.dispatch(actionName, {url: url})
          .then((items) => {
            if (['/location', '/genre'].indexOf(this.currentPageUrl) >= 0) {
              this.$store.commit('pushDepthInfo', {
                type: 'SubList',
                name: title,
                tempData: items
              })
              this.$router.push(this.currentPageUrl + '/country')
            } else {
              if (items.datas.length === 0) {
                return this.$store.dispatch('msgEmptyStationError')
              }
              this.$store.commit('pushDepthInfo', {
                type: 'StationList',
                name: title,
                tempData: items.datas
              })
              this.$router.push(this.currentPageUrl + '/station')
            }
          })
          .catch((err) => {
            console.log(`[iRadio] MainMenu Err(${actionName}): ${err}`)
          })
          .finally(() => {
            this.$store.commit('setLoading', {loading: false})
          })
      }
    },
    makeScroll () {
      this.$scroll = new Iscroll(this.$refs.mainScroll, {
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
  watch: {
    '$route' (to, from) {
      if (to.path === from.path) return
      if (to.path.split('/').length === 2) {
        this.currentPageUrl = to.path
      }
    }
  },
  mounted () {
    this.makeScroll()
    this.currentPageUrl = this.$route.path
    if (this.currentPageUrl === '/current') {
      this.vTunner.requestInformation()
        .catch(err => {
          console.log(`[iRadio] SideMenu Mounted Err: ${err}`)
        })
    }
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
</style>

<style lang="scss">
.iScrollIndicator {
  width: 9px !important;
  background-color: #aaaaaa !important;
  border-radius: 0 !important;
}
</style>


