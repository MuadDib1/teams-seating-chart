<template>
  <div>
    <status-updater></status-updater>
    <status-map :people="people"></status-map>
  </div>
</template>

<script>
import StatusUpdater from './components/StatusUpdater.vue'
import StatusMap from './components/StatusMap.vue'

const createTestData = () => {
  const result = []
  for (let i = 0; i < 30; i++) {
    result.push({ name: 'Shingen Takeda (武田　信玄)' + i, status: '連絡可能' })
  }
  result.push({ name: 'Kenshin Uesugi (上杉　謙信)', status: '取り込み中' })
  return result
}

export default {
  name: 'App',
  components: {
    StatusUpdater,
    StatusMap,
  },
  data () {
    return {
      // people: createTestData()
      people: []
    }
  },
  mounted () {
    window.mainAPI.onPeopleScraped((event, people) => {
      console.log(people)
      this.people = people
    })
  },
}
</script>

<style>

</style>