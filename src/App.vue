<template>
  <div>
    <div>
      <button @click="updateStatus">ステータスを更新</button>
    </div>
    <status-map :people="people"></status-map>
  </div>
</template>

<script>
import StatusMap from './components/StatusMap.vue'

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
    StatusMap
  },
  data () {
    return {
      people: createTestData()
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
      window.mainAPI.openTeams()
    }
  }
}
</script>
<style>
.float {
  float: right;
  padding: 10px;
  z-index: 1;
}
</style>