<template>
  <div id="app">
    <div class="full-width">
      <button @click="open">最新のステータスを取得</button>
      <ul>
        <li v-for="person in people" :key="person.name">
          {{ person.name }}
          {{ person.status }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
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