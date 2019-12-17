<template>
  <div class="gnb">
    <ul class="gnb_li">
      <li class="back" @click="onBack"></li>
      <li class="home" @click="onHome"></li>
    </ul>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  name: 'navigator',
  data () {
    return {
      // hardkeyCodes: this.$hardkey.getCodes()
    }
  },
  computed: {
    ...mapState({
      depthInfo: state => state.depthInfo
    })
  },
  methods: {
    onBack () {
      if (this.$route.path.indexOf('station') >= 0 && this.depthInfo.length > 0) {
        this.$store.commit('popDepthInfo')
        this.$router.go(-1)
        return
      } else if (this.$route.path.indexOf('country') >= 0 && this.depthInfo.length > 0) {
        this.$store.commit('popDepthInfo')
        if (this.depthInfo.length === 0) {
          this.$router.go(-1)
        }
        return
      }

      this.$store.commit('clearDepthInfo')
      if (this.$route.path === '/') {
        if (window.applicationFramework) {
          window.applicationFramework.applicationManager.getOwnerApplication(window.document).back()
        }
      } else if (['/', '/current', '/location', '/genre', '/recommendation'].indexOf(this.$route.path) < 0) {
        this.$router.go(-1)
        return
      } else {
        this.$store.commit('setSelectMenu', '/')
        this.$router.push('/')
      }
    },
    onHome () {
      if (window.applicationFramework) {
        window.applicationFramework.applicationManager.getOwnerApplication(window.document).home()
      }
    },
    initHardKeyAction () {
      this.$hardkey.addHardkeyListener(this.hardkeyCodes.code.HARDKEY_BUTTON_BACK, (e) => {
        this.onBack()
      })
    },
    mounted () {
      this.initHardKeyAction()
    }
  }
}
</script>
