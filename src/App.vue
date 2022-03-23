<template>
  <div>
    <div class="m-3 reload-button is-pulled-right">
      <b-tooltip label="Teams で最新のステータスを取得する" position="is-left">
        <b-button icon-right="reload" size="is-medium" rounded @click="updateStatus" />
      </b-tooltip>
    </div>
    <status-map :people="people"></status-map>
  </div>
</template>

<script>
import StatusMap from './components/StatusMap.vue'
import LoginInfoForm from './components/LoginInfoForm.vue'

const createTestData = () => {
  const result = []
  for (let i = 0; i < 30; i++) {
    result.push({ name: 'Mishima Yoshinari (三島　吉就)' + i, status: '連絡可能' })
  }
  result.push({ name: 'Naotaka Nakanishi (中西　直孝)', status: '取り込み中' })
  return result
}

export default {
  name: 'App',
  components: {
    StatusMap,
    LoginInfoForm,
  },
  data () {
    return {
      // people: createTestData()
      people: []
    }
  },
  mounted () {
    window.mainAPI.onPeopleUpdated((event, people) => {
      console.log(people)
      this.people = people
    })
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
              submit: (setting) => {
                window.mainAPI.setLoginInfo(setting)
                window.mainAPI.openTeams()
              }
            },
            trapFocus: true
        })
      }
    }
  }
}
</script>
<style>
.reload-button button {
  z-index: 1;
}
</style>