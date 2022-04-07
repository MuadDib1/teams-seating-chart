<template>
  <div class="status-color-changer">
    <b-colorpicker ref="colorpicker"
      append-to-body
      :value="color"
      @change="onChangeColor"></b-colorpicker>  
  </div>
</template>

<script>
export default {
  data() {
    return {
      status: null,
      color: null
    }
  },
  methods: {
    open(status, color) {
      this.status = status
      this.color = color
      this.$refs.colorpicker.toggle()
    },
    onChangeColor(color) {
      window.mainAPI.updateStatusColor(this.status, color.toString())
      this.$emit('change', color)
    },
  }
}
</script>

<style>
.status-color-changer {
  display: none;
}
</style>