<template>
  <div class="m-3 reload-button is-pulled-right">
    <b-tooltip label="Teams で最新のステータスを取得する" position="is-left">
      <b-button icon-right="reload" size="is-medium" rounded @click="updateStatus" />
    </b-tooltip>
  </div>
</template>

<script>
import LoginInfoForm from './LoginInfoForm.vue'

export default {
  components: {
    LoginInfoForm,
  },
  methods: {
    updateStatus () {
      if (window.mainAPI.hasLoginInfo()) {
        window.mainAPI.openTeams()
      } else {
        this.$buefy.modal.open({
            parent: this,
            component: LoginInfoForm,
            hasModalCard: true,
            events: {
              submit: this.onLoginFormSubmit
            },
            trapFocus: true
        })
      }
    },
    onLoginFormSubmit (setting) {
      window.mainAPI.setLoginInfo(setting)
      window.mainAPI.openTeams()
    }
  }
}
</script>

<style>
.reload-button button {
  z-index: 1;
}
</style>