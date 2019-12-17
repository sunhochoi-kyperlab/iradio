<template>
<div id="app">
  <div id='container' :class="`${position}${loading ? ' loading' : ''} ${popupShow ? 'show' : ''}`">
    <audio ref="media" :src="playUrl || ''"></audio>
    <loader></loader>
    <navigation></navigation>
    <side-menu></side-menu>
    <main-content></main-content>
  </div>
</div>
</template>

<script>
import Navigation from './components/container/Navigation'
import SideMenu from './components/container/SideMenu'
import MainContent from './components/container/MainContent'
import Loader from './components/container/Loader'
import {mapState} from 'vuex'

export default {
  name: 'home',
  components: {
    Navigation,
    SideMenu,
    MainContent,
    Loader
  },
  data () {
    return {
      position: 'player'
    }
  },
  computed: {
    ...mapState({
      loading: state => state.loading,
      audioObj: state => state.audioObj,
      stationList: state => state.stationList,
      stationIndex: state => state.stationIndex,
      playUrl: state => state.playUrl,
      popupShow: state => state.popupShow
    })
  },
  mounted () {
    this.$store.commit('settingAudioObject', {obj: this.$refs.media})
    this.$store.commit('setLoading', {loading: true})
    this.$store.dispatch('initialize')
      .then(() => {
        return this.$store.dispatch('tryPlayer')
      })
      .catch((err) => {
        err = typeof err === 'object' ? err.toString() : err
        console.log('[iRadio] App Initialize Err: ', err)
        if (err && err.indexOf('Cannot load channel.') >= 0) {
          this.$store.commit('setLoading', {loading: false})
          return this.$store.dispatch('msgStationLoadingError')
        }
      })
      .finally(() => {
        this.$store.commit('setLoading', {loading: false})
      })
  },
  watch: {
    '$route' (to, from) {
      if (to.path === '/') {
        this.position = 'player'
      } else if (['/current', '/location', '/genre', '/recommend'].indexOf(to.path) >= 0) {
        this.position = 'list-1'
      } else if (['/location/country', '/genre/country'].indexOf(to.path) >= 0) {
        this.position = 'list-2'
      } else {
        this.position = 'list-3'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#app{
  width: 1280px;
  height: 650px;
}
</style>

<style lang="scss">
.overlay{
	position: fixed;
	top: 0;
	left: 126px;
	width: calc(100% - 126px);
	height: 100%;
	background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  .popup{
    position: absolute;
    top: 117px;
    left: 50%;
    margin-left: -330px;
    width: 660px !important;
    height: 416px;
    color: #ffffff;
    text-align: center;
    background-color: #212347;
    overflow: hidden;
    border-radius: 15px;
    .title-inner{
      padding-top: 36px;
      margin: 0 auto;
      width: 90%;
      font-size: 33px;
      line-height: 37px;
      overflow: hidden;
    }
    .text{
      margin: 56px auto 0;
      width: 90%;
      height: 90px;
      font-size: 33px;
      line-height: 43px;
      overflow: hidden;
      white-space: pre;
    }
    .btn-area{
      position: absolute;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 99px;
	  border-top: 1px solid #444673;
    //   &::before{
    //     position: absolute;
    //     top: -1px;
    //     left: 0;
    //     content: '';
    //     display: block;
    //     width: 100%;
    //     height: 1px;
    //     background-color: #616161;
    //   }
      button{
        width: 100%;
        height: 100%;
        float: left;
        text-align: center;
        color: #fff;
        font-size: 30px;
        line-height: 100px;
        &:active{
          background-color: #3a3d60;
          color: #ffffff;
        }
        & + button {
	        border-left: 1px solid #444673;
        }
      }
    }
  }
}
</style>