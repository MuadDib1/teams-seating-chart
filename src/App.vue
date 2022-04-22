<template>
  <div>
    <status-updater></status-updater>
    <status-map></status-map>
  </div>
</template>

<script>
import StatusUpdater from './components/StatusUpdater.vue'
import StatusMap from './components/StatusMap.vue'

export default {
  name: 'App',
  components: {
    StatusUpdater,
    StatusMap,
  },
}
</script>

<style>

</style>