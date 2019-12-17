<template>
  <div class="left-mn">
    <div class="menu">
      <ul class="menu_li">
        <li :class="`${run ? 'playing' : ''} ${selectMenu === '/' ? 'sel' : ''}`" @click="movePage('/')">{{$t('nowplaying')}}<i></i></li>
        <li :class="selectMenu === '/current' ? 'sel' : ''" @click="movePage('/current')">{{currentConutry}}</li>
        <li :class="selectMenu === '/location' ? 'sel' : ''" @click="movePage('/location')">{{$t('location')}}</li>
        <li :class="selectMenu === '/genre' ? 'sel' : ''" @click="movePage('/genre')">{{$t('genre')}}</li>
        <li :class="selectMenu === '/recommend' ? 'sel' : ''" @click="movePage('/recommend')">{{$t('recommendation')}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  computed: {
    ...mapState({
      currentConutry: state => state.currentConutry,
      run: state => state.run,
      selectMenu: state => state.selectMenu
    })
  },
  methods: {
    movePage (url) {
      let actionName = ''
      if (url === '/') {
        this.$store.commit('setSelectMenu', url)
        return this.$router.push(url)
      } else if (url === '/current') {
        actionName = 'requestRegion'
      } else if (url === '/location') {
        actionName = 'requestContinent'
      } else if (url === '/genre') {
        actionName = 'requestGenre'
      } else if (url === '/recommend') {
        actionName = 'requestRecommendation'
      }
      if (actionName) {
        this.$store.commit('setLoading', {loading: true})
        this.$store.dispatch(actionName)
          .then(() => {
            this.$store.commit('setSelectMenu', url)
            this.$router.push(url)
            this.$store.commit('clearDepthInfo')
          })
          .catch((err) => {
            console.log(`[iRadio] SideMenu Err(${actionName}): ${err}`)
          })
          .finally(() => {
            this.$store.commit('setLoading', {loading: false})
          })
      }
    }
  }
}
</script>
