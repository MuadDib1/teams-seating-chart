<template>
  <div>
    <status-map></status-map>
  </div>
</template>

<script>
import StatusMap from './components/StatusMap.vue'

export default {
  name: 'App',
  components: {
    StatusMap
  },
  data () {
    return {
      people: []
    }
  },
  mounted () {
    window.mainAPI.onPeopleUpdated((event, people) => {
      this.people = people;
    })
  },
  computed: {
    nowTimeLabel () {
      return null
    }
  },
  methods: {
    open () {
      window.mainAPI.openTeams()
    }
  }
}
</script>
<style>
input {
  width: 80%;
}
</style>