<template>
  <div class="m-3 reload-button is-pulled-right">
    <b-tooltip label="Teams で最新のステータスを取得する" position="is-left" type="is-pink">
      <b-button icon-right="reload" size="is-medium" rounded :loading="loading" @click="updateStatus" />
    </b-tooltip>
  </div>
</template>

<script>
import LoginInfoForm from './LoginInfoForm.vue'

export default {
  components: {
    LoginInfoForm,
  },
  data() {
    return {
      loading: false
    }
  },
  mounted () {
    window.mainAPI.onUpdateWindowClosed(() => {
      this.loading = false
    })
  },
  methods: {
    updateStatus () {
      if (window.mainAPI.hasLoginInfo()) {
        this.openTeams()
      } else {
        const modal = this.$buefy.modal.open({
            parent: this,
            component: LoginInfoForm,
            hasModalCard: true,
            events: {
              submit: (setting) => {
                window.mainAPI.saveLoginInfo(setting)
                this.openTeams()
                modal.close()
              }
            },
            trapFocus: true
        })
      }
    },
    openTeams () {
      window.mainAPI.openTeams()
      this.loading = true
    }
  }
}
</script>

<style>
.reload-button button {
  z-index: 1;
}
</style>